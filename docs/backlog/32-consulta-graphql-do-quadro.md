---
title: Corrigir a consulta GraphQL do quadro (sobra uma chave) e testar a sintaxe
labels: tipo:bug, prioridade:alta
column: Em andamento
---
## Contexto
Ao rodar o workflow "Quadro Kanban" pela primeira vez, o GitHub recusou a consulta que busca o quadro: `Expected one of SCHEMA, SCALAR, TYPE... actual: RCURLY`. A consulta tem 7 chaves abertas e 8 fechadas. O erro é do código (issue #25), não do token.

Como o GraphQL não roda nas sessões do Claude Code, essa parte não tinha como ser testada antes. Falta um teste que valide a sintaxe das consultas sem depender do GitHub.

## Critérios de aceite
- [ ] Consulta corrigida
- [ ] Teste automático que lê todas as consultas GraphQL do projeto com um parser e falha se a sintaxe estiver errada
- [ ] Teste visto falhando antes da correção
- [ ] Workflow Quadro Kanban roda até o fim com o token real
