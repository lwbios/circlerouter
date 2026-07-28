import { CircleResponse } from "@circlerouter/core";

// GET /admin -> protegido pelo middleware (veja src/middleware.ts)
export function GET() {
  return CircleResponse.json({ message: "bem-vindo ao admin" });
}
