import {
  CircleResponse,
  type CircleRequest,
  type RouteContext,
} from "@circlerouter/core";
import { users } from "../route";

// GET /users/:id
export async function GET(
  request: CircleRequest,
  { params }: RouteContext<{ id: string }>
) {
  const { id } = await params;
  const user = users.find((u) => u.id === id);
  // Retornar uma Response direto dá controle total sobre status/headers.
  if (!user) return CircleResponse.json({ detail: "User not found" }, { status: 404 });
  return CircleResponse.json(user);
}

// PATCH /users/:id
export async function PATCH(
  request: CircleRequest,
  { params }: RouteContext<{ id: string }>
) {
  try {
    const { id } = await params;
    const user = users.find((u) => u.id === id);
    if (!user) return CircleResponse.json({ detail: "User not found" }, { status: 404 });

    const body = (await request.json()) as { name?: string };
    if (body.name) user.name = body.name;
    return CircleResponse.json(user);
  } catch (error) {
    return CircleResponse.json({ detail: "JSON inválido" }, { status: 400 });
  }
}

// DELETE /users/:id
export async function DELETE(
  request: CircleRequest,
  { params }: RouteContext<{ id: string }>
) {
  const { id } = await params;
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return CircleResponse.json({ detail: "User not found" }, { status: 404 });

  users.splice(index, 1);
  // Não retornar nada vira 204 No Content automaticamente.
}
