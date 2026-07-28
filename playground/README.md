# playground

Projeto de exemplo dentro do monorepo — usa o `circlerouter` local (via workspace,
sem precisar publicar no npm) pra você testar o framework de verdade.

## Rodando

Na raiz do monorepo:

```bash
bun install
bun run playground
# ou: cd playground && bun dev
```

Servidor sobe em [http://localhost:3000](http://localhost:3000). `GET /` lista
todas as rotas de exemplo.

## O que cada rota demonstra

| Rota | Arquivo | Demonstra |
| --- | --- | --- |
| `GET /` | `src/app/route.ts` | Rota raiz estática |
| `GET /health` | `src/app/health/route.ts` | Rota estática simples |
| `GET, POST /users` | `src/app/users/route.ts` | Múltiplos métodos, `CircleRequest`/`CircleResponse`, validação (400) |
| `GET, PATCH, DELETE /users/:id` | `src/app/users/[id]/route.ts` | Segmento dinâmico `[id]`, `CircleResponse.json(..., { status })` (404), retorno `undefined` (204) |
| `GET /files/*` | `src/app/files/[...path]/route.ts` | Catch-all obrigatório `[...path]` |
| `GET /docs`, `GET /docs/*` | `src/app/docs/[[...slug]]/route.ts` | Catch-all opcional `[[...slug]]` |
| `GET /about` | `src/app/(marketing)/about/route.ts` | Route group `(marketing)` — some da URL |
| `GET /admin` | `src/app/admin/route.ts` | Bloqueado pelo `src/middleware.ts` sem header `authorization` |

## Exemplos com curl

```bash
curl http://localhost:3000/
curl http://localhost:3000/users
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name":"Alan Turing"}'
curl -i -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{}' # 400, falta "name"
curl http://localhost:3000/users/1
curl -X PATCH http://localhost:3000/users/1 -H "Content-Type: application/json" -d '{"name":"Ada"}'
curl -X DELETE http://localhost:3000/users/1 -i
curl http://localhost:3000/files/a/b/c.txt
curl http://localhost:3000/docs
curl http://localhost:3000/docs/getting-started
curl http://localhost:3000/about

# /admin sem token -> 401
curl -i http://localhost:3000/admin
# /admin com token -> 200
curl -i http://localhost:3000/admin -H "authorization: qualquer-coisa"
```

Depois de rodar, dá uma olhada em `.circlerouter/manifest.json` — é o manifesto
de rotas gerado automaticamente no boot.
