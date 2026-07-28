# @circlerouter/create

Cria um novo projeto [@circlerouter/core](https://www.npmjs.com/package/@circlerouter/core) —
roteamento de API para Bun no estilo do App Router do Next.js.

```bash
npm create @circlerouter@latest
# ou
pnpm create @circlerouter@latest
# ou
yarn create @circlerouter
# ou (garantido funcionar independente do atalho "create" do seu gerenciador)
bunx @circlerouter/create@latest
```

O CLI pergunta o nome do projeto, o gerenciador de pacotes, se deve instalar as
dependências e se deve iniciar um repositório git — e gera:

```
meu-app/
  .circlerouter/
  src/
    app/
    middleware.ts
    server.ts
  package.json
  tsconfig.json
```

## Flags

Todas as flags são opcionais; sem elas o CLI pergunta interativamente.

| Flag | Efeito |
| --- | --- |
| `<diretório>` | Nome/pasta do projeto (pula a pergunta) |
| `--install` / `--no-install` | Instala (ou não) as dependências automaticamente |
| `--git` / `--no-git` | Inicializa (ou não) um repositório git |
| `--use-npm`, `--use-yarn`, `--use-pnpm`, `--use-bun` | Fixa o gerenciador de pacotes |
| `-y`, `--yes` | Aceita os padrões (instalar + git) sem perguntar |

Exemplo não-interativo:

```bash
npm create @circlerouter@latest minha-api -- --use-bun --yes
```

## Licença

MIT
