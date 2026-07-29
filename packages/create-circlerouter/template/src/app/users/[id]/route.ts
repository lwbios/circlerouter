import {
  CircleResponse,
  type CircleRequest,
  type RouteContext,
} from "@circlerouter/core";

// GET /users/:id
export async function GET(
  request: CircleRequest,
  { params }: RouteContext<{ id: string }>
) {
  try {
    const { id } = await params;
    return CircleResponse.json({ id });
  } catch (error) {
    return CircleResponse.json({ detail: "Algo deu errado" }, { status: 500 });
  }
}
