# Como trabalhamos neste projeto

Regras para manter o repositório organizado, documentado e sempre atualizado.

## 1. Toda mudança nasce de uma issue

- Antes de mexer no código, existe uma **issue** no GitHub com título claro, o que deve ficar pronto e como saber que está pronto (critérios de aceite).
- Rascunhos das issues ficam em `docs/backlog/`. Quando o GitHub estiver conectado, `node tools/criar_issues.js --apply` cria todas.
- Uma issue = um assunto. Se aparecer outro assunto no caminho, abre-se outra issue.

## 2. Quadro Kanban

Quadro "Painel da Casa" (GitHub Projects), com estas colunas:

| Coluna | Significa |
|---|---|
| **Backlog** | Ideia ou necessidade registrada, sem prioridade ainda. |
| **Pronto para fazer** | Entendida, com critérios claros, pode começar. |
| **Em andamento** | Alguém está fazendo agora (no máximo 2 ao mesmo tempo). |
| **Em teste** | Código pronto; falta testar no painel ou nos aparelhos reais. |
| **Feito** | Funciona e está documentado. |
| **Bloqueado** | Depende de algo de fora (notebook, modelo de um aparelho, resposta do usuário). |

Etiquetas: `tipo:feature`, `tipo:bug`, `tipo:docs`, `tipo:infra`, `area:painel`, `area:planta`, `area:home-assistant`, `area:hardware`, `prioridade:alta`, `prioridade:media`, `prioridade:baixa`, `bloqueado`.

## 3. Commits pequenos e separados

- **Um commit = uma ideia.** Código, teste e documentação dessa ideia vão juntos; ideias diferentes, commits diferentes.
- Mensagem no imperativo, em português, com o assunto na primeira linha (até 72 caracteres) e, se precisar, uma linha em branco e o motivo.
- Prefixo do tipo: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`.
- Referência à issue no fim: `Refs #12` (continua aberta) ou `Closes #12` (fecha ao entrar na `main`).
- Antes de cada commit: `npm run lint` e `npm run test:unit`. Antes de fechar uma issue de painel: `npm run test:e2e`.

Exemplo:

```
feat: listar painéis de parede por área no assistente de canais

Mostra cada interruptor com seus canais e um botão Testar.
Refs #12
```

## 4. Branches e revisão

- Cada issue usa uma branch: `feat/12-assistente-de-canais`, `fix/20-porta-errada`.
- A `main` só recebe código pelo **Pull Request**, que fecha a issue, descreve o que mudou, como foi testado e o que ficou de fora.
- Commits da branch ficam como estão (não juntar tudo num só), para o histórico contar a história.

## 5. Documentação acompanha o código

- Mudou comportamento? Atualiza o README ou o guia certo na mesma PR.
- Decisão importante (por que escolhemos X em vez de Y)? Registra em `docs/decisoes/` com data.
- Defeitos achados e corrigidos entram em `docs/REVISAO.md`.

## 6. O que nunca entra no repositório

Tokens, senhas, o `config.local.js`, endereços de câmeras com usuário e senha, prints com códigos de conta. O `.gitignore` já protege `config.local.js`.

## 7. Passo a passo de cada mudança

1. Escolher uma issue em **Pronto para fazer** e movê-la para **Em andamento**.
2. Criar a branch da issue.
3. Fazer a mudança em commits pequenos (código + teste + doc).
4. Rodar lint e testes.
5. Abrir o Pull Request com `Closes #N`.
6. Mover para **Em teste**. Se envolve aparelhos reais, o teste final é feito com o usuário.
7. Ao entrar na `main`, o cartão vai para **Feito**.
