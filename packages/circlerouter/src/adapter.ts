import { pathToFileURL } from "node:url";
import type { Elysia } from "elysia";
import { CircleRequest } from "./circle-request";
import type {
  DiscoveredRoute,
  HttpMethod,
  RouteHandler,
  RouteHandlerResult,
  RouteModule,
  RouteParams,
} from "./types";

export const HTTP_METHODS: readonly HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "HEAD",
];

const moduleCache = new Map<string, Promise<RouteModule>>();

export function loadRouteModule(filePath: string): Promise<RouteModule> {
  let cached = moduleCache.get(filePath);
  if (!cached) {
    cached = import(pathToFileURL(filePath).href) as Promise<RouteModule>;
    moduleCache.set(filePath, cached);
  }
  return cached;
}

function transformParams(
  rawParams: Record<string, string>,
  route: DiscoveredRoute
): RouteParams {
  const params: RouteParams = { ...rawParams };
  const wildcard = rawParams["*"];

  if (route.catchAllParam && wildcard !== undefined) {
    params[route.catchAllParam] = wildcard.split("/").filter(Boolean);
  }
  delete params["*"];

  return params;
}

function toResponse(result: RouteHandlerResult): Response {
  if (result instanceof Response) return result;
  if (result === undefined) return new Response(null, { status: 204 });
  return Response.json(result);
}

function toHandler(routeHandler: RouteHandler, route: DiscoveredRoute) {
  return async (ctx: { request: Request; params: Record<string, string> }) => {
    const params = transformParams(ctx.params ?? {}, route);
    const request = new CircleRequest(ctx.request, params);

    const result = await routeHandler(request);
    return toResponse(result);
  };
}

function toMethodNotAllowedHandler(allowed: readonly HttpMethod[]) {
  return () =>
    new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: allowed.join(", ") },
    });
}

export async function registerRoutes(
  app: Elysia,
  routes: DiscoveredRoute[]
): Promise<Elysia> {
  for (const route of routes) {
    const routeModule = await loadRouteModule(route.filePath);
    const implemented = HTTP_METHODS.filter((method) => routeModule[method]);

    for (const method of implemented) {
      const handler = routeModule[method];
      if (!handler) continue;
      app.route(method, route.elysiaPath, toHandler(handler, route));
    }

    // Path existe mas o método não foi exportado: 405 (com Allow), não 404 —
    // é o comportamento real do Next.js App Router pra route handlers.
    const notAllowedHandler = toMethodNotAllowedHandler(implemented);
    for (const method of HTTP_METHODS) {
      if (implemented.includes(method)) continue;
      app.route(method, route.elysiaPath, notAllowedHandler);
    }
  }

  return app;
}
