import { CircleRequest, CircleResponse } from "@circlerouter/core";

interface User {
  id: string;
  name: string;
}

// Estado em memória só pra este playground — reseta a cada restart do servidor.
export const users: User[] = [
  { id: "1", name: "Ada Lovelace" },
  { id: "2", name: "Grace Hopper" },
];

// GET /users
export function GET() {
  return CircleResponse.json(users);
}

// POST /users
export async function POST(request: CircleRequest) {
  try {
    const body = (await request.json()) as { name?: string };
    if (!body.name) {
      return CircleResponse.json({ detail: "\"name\" é obrigatório" }, { status: 400 });
    }

    const user: User = { id: String(users.length + 1), name: body.name };
    users.push(user);
    return CircleResponse.json(user, { status: 201 });
  } catch (error) {
    return CircleResponse.json({ detail: "JSON inválido" }, { status: 400 });
  }
}
