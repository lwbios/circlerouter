import { CircleRequest, CircleResponse } from "@circlerouter/core";

// GET /docs e GET /docs/* -> catch-all opcional: params.slug é undefined em
// "/docs" e string[] em "/docs/algo/mais"
export function GET(request: CircleRequest<{ slug?: string[] }>) {
  if (!request.params.slug) return CircleResponse.json({ page: "docs/index" });
  return CircleResponse.json({ page: `docs/${request.params.slug.join("/")}` });
}
