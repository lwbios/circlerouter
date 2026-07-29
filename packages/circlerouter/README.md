# @circlerouter/core

Roteamento de API para [Bun](https://bun.sh), no estilo do App Router do Next.js,
construído em cima do [Elysia](https://elysiajs.com).

Cada arquivo `route.ts` dentro de `src/app` vira um endpoint. Sem `app.get(...)`
manual: a pasta é a rota.

## Instalação

A forma mais simples de começar é com o CLI oficial:

```bash
npm create @circlerouter@latest
# ou
bunx @circlerouter/create@latest
```

Isso já cria toda a estrutura de projeto. Se preferir instalar manualmente num
projeto existente:

```bash
bun add @circlerouter/core elysia
```

## Uso

```ts
// src/server.ts
import { createServer } from "@circlerouter/core";

await createServer({ port: 3000 });
```

```ts
// src/app/route.ts  ->  GET /
import { CircleResponse } from "@circlerouter/core";

export function GET() {
  return CircleResponse.json({ message: "Hello from circlerouter!" });
}
```

```ts
// src/app/users/[id]/route.ts  ->  GET /users/:id
import {
  CircleResponse,
  type CircleRequest,
  type RouteContext,
} from "@circlerouter/core";

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
```

Igual ao Next.js 15+, `params` é **assíncrono** — sempre precisa de `await`. Ele
chega no segundo argumento do handler (`context.params`), não no `request`.

`CircleRequest` estende o `Request` nativo — `request.method`, `request.headers`,
`request.json()` etc. funcionam normalmente, e ele soma `request.query`
(`URLSearchParams`).

> **Não desestruture métodos do request** (`const { json } = request`). Assim
> como no `Request`/`NextRequest` nativo, `json()`/`text()`/etc. dependem do
> `this` ser a instância — desestruturar quebra com um erro genérico do tipo
> "Expected this to be instanceof Request". Chame direto: `request.json()`.

`CircleResponse.json/text/redirect` são atalhos pro `Response` nativo — `status`
e `headers` vão no segundo argumento (`ResponseInit`), igual ao `Response.json`
de verdade: `CircleResponse.json(data, { status: 201 })`. Se preferir, também dá
pra retornar um objeto/array/string puro (vira `Response.json(...)` com 200
automaticamente) ou um `Response`/`new Response(...)` construído na mão.

### Convenção de rotas (`src/app`)

| Pasta/arquivo | Rota |
| --- | --- |
| `app/route.ts` | `/` |
| `app/users/route.ts` | `/users` |
| `app/users/[id]/route.ts` | `/users/:id` |
| `app/files/[...path]/route.ts` | `/files/*` (catch-all obrigatório, `params.path: string[]`) |
| `app/files/[[...path]]/route.ts` | `/files` e `/files/*` (catch-all opcional) |
| `app/(marketing)/about/route.ts` | `/about` (route group, não entra na URL) |

Cada `route.ts` exporta funções nomeadas por método HTTP: `GET`, `POST`, `PUT`,
`PATCH`, `DELETE`, `OPTIONS`, `HEAD`. Chamar um método que a rota não exporta
devolve `405 Method Not Allowed` com header `Allow` listando os métodos
implementados (não 404 — o path existe, só o método não).

### Middleware (`src/middleware.ts`)

```ts
import { CircleRequest, CircleResponse } from "@circlerouter/core";

// Pode ser marcada `async` se usar `await` lá dentro.
export function middleware(request: CircleRequest) {
  const token = request.headers.get("authorization");
  if (!token) {
    return CircleResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  // não retornar nada deixa a requisição seguir pra rota
}

export const config = {
  matcher: ["/api/:path*"],
};
```

O middleware roda antes de qualquer rota — nesse ponto ainda não houve
roteamento, então ele não recebe `params` (só as rotas recebem, no segundo
argumento); use `request.query` e o resto do `Request` normalmente
(`request.url`, `request.headers`, ...). Retornar uma `Response` (ex.:
`CircleResponse.json/redirect`) interrompe a
cadeia; não retornar nada deixa a requisição seguir normalmente. `config.matcher`
é opcional — sem ele, o middleware roda em toda requisição.

### `.circlerouter/`

Pasta gerada automaticamente com `manifest.json` (lista de rotas descobertas).
Não deve ser versionada — o `@circlerouter/create` já adiciona ao `.gitignore`.

## Licença

MIT
