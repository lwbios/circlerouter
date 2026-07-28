/**
 * Atalhos pra construir Response, no mesmo espírito do Response.json nativo —
 * `status`/`headers` vão no segundo argumento (ResponseInit), não dentro do
 * corpo. Sempre retorne o resultado (`return CircleResponse.json(...)`).
 */
export class CircleResponse {
  static json(data: unknown, init?: ResponseInit): Response {
    return Response.json(data, init);
  }

  static text(data: string, init?: ResponseInit): Response {
    return new Response(data, init);
  }

  static redirect(url: string | URL, status: number = 307): Response {
    return Response.redirect(url.toString(), status);
  }
}
