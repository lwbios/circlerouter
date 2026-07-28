import { CircleRequest, CircleResponse } from "@circlerouter/core";

// GET /files/* -> params.path é sempre string[] (catch-all obrigatório: precisa
// de pelo menos 1 segmento, "/files" sozinho dá 404)
export function GET(request: CircleRequest<{ path: string[] }>) {
  return CircleResponse.json({
    path: request.params.path,
    joined: request.params.path.join("/"),
  });
}
