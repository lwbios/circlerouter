import type { RouteParams } from "./types";

/**
 * Estende o Request nativo com os dados que o roteamento de arquivos já
 * resolveu: `params` (segmentos dinâmicos/catch-all) e `query` (querystring).
 * Todo o resto (method, headers, url, json(), text(), ...) vem do Request.
 */
export class CircleRequest<
  Params extends RouteParams = RouteParams,
> extends Request {
  readonly params: Params;
  readonly query: URLSearchParams;

  constructor(request: Request, params: Params) {
    super(request);
    this.params = params;
    this.query = new URL(this.url).searchParams;
  }
}
