import { CircleRequest, CircleResponse } from "@circlerouter/core";

export function middleware(request: CircleRequest) {
  const token = request.headers.get("authorization");
  if (!token) {
    return CircleResponse.json(
      { detail: "Unauthorized — mande um header authorization" },
      { status: 401 }
    );
  }
  // Sem retorno = segue pra rota normalmente.
}

export const config = {
  // Só roda em /admin e sub-rotas; o resto do app passa direto.
  matcher: ["/admin/:path*"],
};
