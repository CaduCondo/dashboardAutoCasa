# Quadro Kanban

Quadro: https://github.com/users/CaduCondo/projects/7

## Como ele é mantido

1. O Claude muda o **estado** de cada issue a cada passo, com `node tools/kanban.js estado <n> <estado>`. O estado é uma etiqueta `estado:backlog`, `estado:pronto`, `estado:andamento`, `estado:teste`, `estado:bloqueado` ou `estado:feito` (e fechar a issue).
2. O workflow `.github/workflows/kanban.yml` roda quando uma issue é aberta, fechada ou muda de etiqueta, e copia o estado para a coluna **Status** do quadro.

Por que assim: as sessões do Claude Code não podem usar o GraphQL do GitHub, que é o que os quadros novos exigem. O GitHub Actions pode, e o Claude só precisa mexer nas etiquetas (API REST).

## Configuração (uma vez, só você pode fazer)

O workflow precisa de uma permissão que o token padrão do GitHub Actions não tem: mexer em projetos de usuário.

1. GitHub → sua foto → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)**.
2. Nome: `painel-quadro`. Validade: a que preferir (90 dias, por exemplo). Marque **só** o escopo **`project`** (leitura e escrita de projetos).
3. **Generate token** e copie o texto (ele aparece uma vez).
4. No repositório `dashboardAutoCasa`: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
   - Name: `PROJECT_TOKEN`
   - Secret: o token copiado.
5. Em **Actions** → **Quadro Kanban** → **Run workflow**, deixe "Sincronizar todas as issues" marcado e rode. As 28 issues entram no quadro.

Nunca cole o token em chat, issue ou arquivo do repositório.

## Colunas do quadro

O campo **Status** do quadro pode usar qualquer um destes nomes (maiúsculas e minúsculas não importam):

| Estado | Nomes aceitos |
|---|---|
| backlog | Backlog, Todo, A fazer |
| pronto | Pronto para fazer, Pronto, Ready, TO-DO |
| andamento | Em andamento, In progress, WIP |
| teste | Em teste, Em revisão, In review, In Tests |
| feito | Feito, Done, Concluído, DONE |
| bloqueado | Bloqueado, Blocked, BLOCK |

O quadro atual usa: `Backlog`, `TO-DO`, `WIP`, `In Tests`, `DONE`, `BLOCK`. Se um estado não achar coluna, o workflow usa a aproximação mais próxima (pronto vira Backlog, teste vira andamento) e escreve um aviso no log.

## Situação

- O mapeamento de estado para coluna tem testes automáticos.
- A conversa com o quadro real funciona (testada em 19/11/2026 com o token do dono).

## Alternativa sem token

Dentro do quadro, **Workflows** (⋯ no canto) tem automações prontas: "Item added to project" (define Backlog), "Item closed" (define Feito) e "Auto-add to project" (traz as issues novas do repositório). Elas cobrem o básico, mas não movem as colunas "Em andamento" e "Em teste".
