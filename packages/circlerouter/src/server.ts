import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { Elysia } from "elysia";
import { registerRoutes } from "./adapter";
import { CircleRequest } from "./circle-request";
import { printBanner } from "./logger";
import { printRouteTable, writeManifest } from "./manifest";
import { loadMiddleware, matchesMiddleware } from "./middleware";
import { discoverRoutes } from "./router";
import type { CreateServerOptions } from "./types";

export async function createServer(options: CreateServerOptions = {}) {
  const startedAt = performance.now();
  const cwd = process.cwd();
  const appDir = resolve(cwd, options.appDir ?? "src/app");
  const middlewarePath = resolve(
    cwd,
    options.middlewarePath ?? "src/middleware.ts"
  );

  if (!existsSync(appDir)) {
    throw new Error(
      `[circlerouter] Pasta de rotas não encontrada em "${appDir}". Crie pelo menos um arquivo route.ts dentro de src/app.`
    );
  }

  const routes = discoverRoutes(appDir);
  const middlewareModule = await loadMiddleware(middlewarePath);

  const app = new Elysia(
    options.hostname ? { serve: { hostname: options.hostname } } : {}
  ).onRequest(({ request }) => {
    if (!middlewareModule?.middleware) return;
    const pathname = new URL(request.url).pathname;
    if (!matchesMiddleware(pathname, middlewareModule.config?.matcher)) return;
    // Ainda não roteamos, então não há params de rota resolvidos aqui.
    return middlewareModule.middleware(new CircleRequest(request, {}));
  });

  await registerRoutes(app, routes);
  await writeManifest(routes, cwd);
  await printRouteTable(routes);

  app.listen(options.port ?? 3000);
  printBanner(
    app.server?.port ?? options.port ?? 3000,
    app.server?.hostname,
    startedAt
  );

  return app;
}
