import {
  CircleResponse,
  type CircleRequest,
  type RouteContext,
} from "@circlerouter/core";

// GET /files/* -> params.path é sempre string[] (catch-all obrigatório: precisa
// de pelo menos 1 segmento, "/files" sozinho dá 404)
export async function GET(
  request: CircleRequest,
  { params }: RouteContext<{ path: string[] }>
) {
  const { path } = await params;
  return CircleResponse.json({ path, joined: path.join("/") });
}
