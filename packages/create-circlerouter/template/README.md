# __PROJECT_NAME__

Projeto criado com [`@circlerouter/create`](https://www.npmjs.com/package/@circlerouter/create).

## Começando

```bash
bun install
bun dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Estrutura

```
src/
  app/            rotas — cada route.ts vira um endpoint
  middleware.ts   roda antes de toda rota
  server.ts       ponto de entrada do servidor
```

- `src/app/route.ts` → `GET /`
- `src/app/users/[id]/route.ts` → `GET /users/:id`

Cada `route.ts` exporta funções nomeadas por método HTTP (`GET`, `POST`, `PUT`,
`PATCH`, `DELETE`, `OPTIONS`, `HEAD`), recebendo um `CircleRequest` e devolvendo
um `CircleResponse`:

```ts
import { CircleRequest, CircleResponse } from "@circlerouter/core";

export async function GET(request: CircleRequest<{ id: string }>) {
  return CircleResponse.json({ id: request.params.id });
}
```

Segmentos entre colchetes (`[id]`) viram parâmetros dinâmicos; `[...slug]` vira
catch-all; pastas entre parênteses (`(grupo)`) organizam sem afetar a URL.

Veja a documentação completa do framework em
[@circlerouter/core no npm](https://www.npmjs.com/package/@circlerouter/core).

## Scripts

| Comando | Ação |
| --- | --- |
| `bun dev` | Sobe o servidor em modo watch |
| `bun run build` | Gera o build de produção em `dist/` |
| `bun start` | Roda o build de produção |
