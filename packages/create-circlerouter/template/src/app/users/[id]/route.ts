import { CircleRequest, CircleResponse } from "@circlerouter/core";

// GET /users/:id
export async function GET(request: CircleRequest<{ id: string }>) {
  try {
    return CircleResponse.json({ id: request.params.id });
  } catch (error) {
    return CircleResponse.json({ detail: "Algo deu errado" }, { status: 500 });
  }
}
