# circlerouter

Roteamento de API para [Bun](https://bun.sh), no estilo do App Router do Next.js,
construído em cima do [Elysia](https://elysiajs.com). Cada arquivo `route.ts`
dentro de `src/app` vira um endpoint — sem registrar rota manualmente.

Este é o monorepo com os dois pacotes publicados no npm sob a organização
[`@circlerouter`](https://www.npmjs.com/org/circlerouter):

| Pacote | Descrição |
| --- | --- |
| [`@circlerouter/core`](packages/circlerouter) | O framework em si (roteamento, middleware, servidor) |
| [`@circlerouter/create`](packages/create-circlerouter) | CLI que gera um novo projeto |

## Quickstart

```bash
npm create @circlerouter@latest
# ou
bunx @circlerouter/create@latest
# ou
pnpm create @circlerouter@latest
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

Documentação completa da API (rotas dinâmicas, catch-all, route groups,
middleware) no [README do `@circlerouter/core`](packages/circlerouter/README.md).

## Playground

[`playground/`](playground) é um projeto de exemplo dentro do monorepo, usando o
`@circlerouter/core` local via workspace (sem precisar publicar nada). Mostra
rota estática, dinâmica, catch-all, catch-all opcional, route group e
middleware protegendo uma rota. Pra rodar:

```bash
bun install
bun run playground
```

Veja [playground/README.md](playground/README.md) pra a lista de rotas e
exemplos de `curl`.

## Desenvolvimento do monorepo

```bash
bun install       # instala as dependências de todos os workspaces
bun run typecheck # tsc --noEmit em todos os pacotes
bun run build     # builda todos os pacotes
```

- `packages/circlerouter` (`@circlerouter/core`) — publica o código TypeScript
  diretamente (Bun executa `.ts` nativamente a partir de `node_modules`, sem
  etapa de build).
- `packages/create-circlerouter` (`@circlerouter/create`) — publica um bundle
  Node (`dist/index.js`), porque `npm create` / `pnpm create` / `yarn create`
  executam o CLI sob Node, não sob Bun.

### Publicando

Os dois são pacotes com escopo (`@circlerouter/...`) — precisam de
`--access public` na primeira publicação (já configurado via
`publishConfig.access` no `package.json` de cada um, então um `npm publish`
simples basta).

```bash
npm login

cd packages/circlerouter
npm publish

cd ../create-circlerouter
npm publish
```

Publique `@circlerouter/core` primeiro; se a versão mudar, atualize a
constante `CIRCLEROUTER_VERSION` em
`packages/create-circlerouter/src/index.ts` antes de publicar o CLI.

## Licença

MIT
