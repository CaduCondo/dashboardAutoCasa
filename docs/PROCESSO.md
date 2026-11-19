# Como trabalhamos neste projeto

Regras para manter o repositório organizado, documentado e sempre atualizado. O Claude segue este processo em **todo** trabalho, e o quadro Kanban e o roadmap fazem parte de cada passo.

## O ciclo (sempre)

```
Desenvolver → Testar → Commitar → Testar → Produção → Testar → (volta a Desenvolver)
```

| Passo | O que acontece | Onde | Quadro |
|---|---|---|---|
| **Desenvolver** | Mudança pequena numa branch da issue. | Ambiente de desenvolvimento (sessão do Claude) | `estado:andamento` |
| **Testar** | `npm run lint`, testes de lógica e o Robot Framework (BDD) local. | Ambiente de desenvolvimento | `estado:andamento` |
| **Commitar** | Commits pequenos e separados, com `Refs #N`. | Branch | `estado:andamento` |
| **Testar** | O GitHub Actions repete tudo no Pull Request. Só segue se estiver verde. | GitHub Actions | `estado:teste` |
| **Produção** | Merge na `main` e publicação no painel real (ver `docs/PRODUCAO.md` quando existir). | `main` / Home Assistant da casa | `estado:teste` |
| **Testar** | Teste de fumaça em produção (e, quando há aparelhos, teste com o usuário). | Painel real | `estado:feito` só se passar |

Regra de ouro: **nada é "Feito" sem teste verde depois da produção.** Se falhar, volta para `estado:andamento` com um comentário dizendo o que falhou.

## 1. Toda mudança nasce de uma issue

- Antes de mexer no código existe uma **issue** com título claro e critérios de aceite.
- Rascunhos ficam em `docs/backlog/` (o número do arquivo é o número da issue). `node tools/criar_issues.js --apply --repo DONO/NOME` cria o que ainda não existe.
- Uma issue = um assunto. Assunto novo no meio do caminho vira outra issue.

## 2. Quadro Kanban (responsabilidade do Claude)

O Claude **atualiza o estado a cada passo**, com `node tools/kanban.js estado <n> <estado>`, e escreve comentários com `node tools/kanban.js comentar <n> "texto"`. O estado é uma etiqueta `estado:*` na issue; o workflow `kanban.yml` copia a etiqueta para a coluna do quadro (precisa do segredo `PROJECT_TOKEN`, veja `docs/KANBAN.md`).

| Coluna | Etiqueta | Significa |
|---|---|---|
| **Backlog** | `estado:backlog` | Registrado, sem prioridade ainda. |
| **Pronto para fazer** | `estado:pronto` | Entendida, com critérios claros. |
| **Em andamento** | `estado:andamento` | Em desenvolvimento agora (no máximo 2 ao mesmo tempo). |
| **Em teste** | `estado:teste` | Código pronto; passando pelo Actions, produção e testes. |
| **Feito** | `estado:feito` (e fechada) | Funciona em produção, testado e documentado. |
| **Bloqueado** | `estado:bloqueado` + `bloqueado` | Depende de algo de fora (notebook, modelo de aparelho, resposta do usuário). |

Outras etiquetas: `tipo:feature`, `tipo:bug`, `tipo:docs`, `tipo:infra`, `area:painel`, `area:planta`, `area:home-assistant`, `area:hardware`, `prioridade:alta|media|baixa`.

## 3. Roadmap

`docs/ROADMAP.md` mostra as fases e o que depende de quê. O Claude o atualiza sempre que uma fase muda de situação, no mesmo Pull Request.

## 4. Commits pequenos e separados

- **Um commit = uma ideia.** Código, teste e documentação dessa ideia juntos; ideias diferentes, commits diferentes.
- Mensagem no imperativo, em português, assunto na primeira linha (até 72 caracteres) e, se precisar, o motivo depois de uma linha em branco.
- Prefixo: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`.
- Referência à issue no fim: `Refs #12` ou `Closes #12`.
- Antes de cada commit: `npm run lint` e `npm run test:unit`. Antes de abrir o Pull Request: também `npm run test:robot`.

## 5. Branches, Pull Requests e testes automáticos

- Uma branch por issue: `feat/24-testes-bdd`, `fix/20-porta-errada`, `docs/27-processo`.
- A `main` só recebe código por **Pull Request**, que descreve o que mudou, como foi testado e o que ficou de fora.
- O **GitHub Actions** roda lint, testes de lógica e os cenários BDD em Robot Framework. Pull Request vermelho não entra.
- Commits da branch ficam como estão (sem juntar tudo num só), para o histórico contar a história.

## 6. Documentação acompanha o código

- Mudou comportamento? Atualiza o README ou o guia certo no mesmo Pull Request.
- Decisão importante? Registra em `docs/decisoes/` com a data.
- Defeitos achados e corrigidos entram em `docs/REVISAO.md`.

## 7. O que nunca entra no repositório

Tokens, senhas, `config.local.js`, endereços de câmeras com usuário e senha, prints com códigos de conta. O `.gitignore` já protege `config.local.js`.

## 8. Checklist de cada mudança (o que o Claude faz)

1. Escolher a issue, mover para `estado:andamento`, criar a branch.
2. Desenvolver em passos pequenos; rodar lint e testes a cada passo.
3. Commitar separado, com `Refs #N`.
4. Rodar os testes de novo; atualizar README, guias e roadmap.
5. Subir a branch, abrir o Pull Request, mover para `estado:teste`.
6. Esperar o Actions ficar verde; só então fazer o merge.
7. Publicar em produção e rodar o teste de fumaça.
8. Passou? `estado:feito` com um comentário de resumo. Falhou? Voltar a `estado:andamento` e explicar.
