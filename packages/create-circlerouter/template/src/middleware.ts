import type { CircleRequest } from "@circlerouter/core";

// Pode ser marcada `async` se usar `await` lá dentro.
export function middleware(request: CircleRequest) {
  // Roda antes de qualquer rota em src/app.
  // Retorne uma Response (ex: CircleResponse.json/redirect) pra interromper a
  // cadeia; não retorne nada pra deixar a requisição seguir normalmente.
}

export const config = {
  // Restringe em quais paths o middleware roda. Remova para rodar em todos.
  matcher: ["/:path*"],
};
