import type { CircleRequest } from "./circle-request";

// "| undefined" existe pro catch-all opcional ([[...slug]]): o parâmetro não
// existe na variante de path sem o segmento.
export type RouteParams = Record<string, string | string[] | undefined>;

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD";

export type RouteHandlerResult =
  | Response
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null
  | undefined;

export interface RouteContext<Params extends RouteParams = RouteParams> {
  /** Segmentos dinâmicos/catch-all da rota. Assíncrono, igual ao Next.js 15+ — precisa de `await`. */
  params: Promise<Params>;
}

export type RouteHandler<Params extends RouteParams = RouteParams> = (
  request: CircleRequest,
  context: RouteContext<Params>
) => RouteHandlerResult | Promise<RouteHandlerResult>;

export type RouteModule = Partial<Record<HttpMethod, RouteHandler>>;

export type NextMiddleware = (
  request: CircleRequest
) => Response | void | undefined | Promise<Response | void | undefined>;

export interface MiddlewareConfig {
  matcher?: string[];
}

export interface MiddlewareModule {
  middleware?: NextMiddleware;
  config?: MiddlewareConfig;
}

export interface CreateServerOptions {
  /** Porta em que o servidor vai escutar. @default 3000 */
  port?: number;
  /** Hostname do bind do servidor. */
  hostname?: string;
  /** Pasta com as rotas, relativa ao cwd. @default "src/app" */
  appDir?: string;
  /** Caminho do arquivo de middleware, relativo ao cwd. @default "src/middleware.ts" */
  middlewarePath?: string;
}

export type SegmentKind = "static" | "dynamic" | "catchAll" | "optionalCatchAll";

export interface RouteSegment {
  kind: SegmentKind;
  /** Nome literal (static) ou nome do parâmetro (dynamic/catchAll/optionalCatchAll). */
  value: string;
}

export interface DiscoveredRoute {
  /** Path no formato do Elysia, ex: "/users/:id" ou "/files/*". */
  elysiaPath: string;
  /** Path original em segmentos, estilo Next.js, ex: "/users/[id]". */
  sourcePath: string;
  /** Arquivo route.ts de origem (absoluto). */
  filePath: string;
  /** Nome do parâmetro catch-all/optional-catch-all nesta rota, se houver. */
  catchAllParam?: string;
}
