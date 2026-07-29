/**
 * Estende o Request nativo com `query` (querystring) já pronta. Todo o resto
 * (method, headers, url, json(), text(), ...) vem do Request. Os segmentos
 * dinâmicos/catch-all da rota chegam no segundo argumento do handler
 * (`{ params }`, um `Promise` — igual ao Next.js 15+), não aqui.
 */
export class CircleRequest extends Request {
  readonly query: URLSearchParams;

  constructor(request: Request) {
    super(request);
    this.query = new URL(this.url).searchParams;
  }
}
