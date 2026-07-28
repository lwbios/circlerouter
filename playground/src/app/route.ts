import { CircleResponse } from "@circlerouter/core";

// GET /
export function GET() {
  return CircleResponse.json({
    message: "circlerouter playground",
    routes: [
      "GET    /health",
      "GET    /users",
      "POST   /users",
      "GET    /users/:id",
      "PATCH  /users/:id",
      "DELETE /users/:id",
      "GET    /files/*           (catch-all obrigatório)",
      "GET    /docs              (catch-all opcional, sem segmento)",
      "GET    /docs/*            (catch-all opcional, com segmento)",
      "GET    /about             ((marketing) é um route group — some da URL)",
      "GET    /admin             (bloqueado pelo middleware sem header authorization)",
    ],
  });
}
