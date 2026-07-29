import {
  CircleResponse,
  type CircleRequest,
  type RouteContext,
} from "@circlerouter/core";

// GET /docs e GET /docs/* -> catch-all opcional: params.slug é undefined em
// "/docs" e string[] em "/docs/algo/mais"
export async function GET(
  request: CircleRequest,
  { params }: RouteContext<{ slug?: string[] }>
) {
  const { slug } = await params;
  if (!slug) return CircleResponse.json({ page: "docs/index" });
  return CircleResponse.json({ page: `docs/${slug.join("/")}` });
}
