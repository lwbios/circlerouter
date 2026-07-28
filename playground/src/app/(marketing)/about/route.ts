import { CircleResponse } from "@circlerouter/core";

// GET /about -> "(marketing)" é um route group: organiza pastas sem entrar na URL
export function GET() {
  return CircleResponse.json({ page: "about", group: "(marketing)" });
}
