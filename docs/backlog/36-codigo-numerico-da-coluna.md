---
title: Quadro: código de coluna só com números era enviado como número e quebrava
labels: tipo:bug, prioridade:alta
column: Em andamento
---
## Contexto
Na primeira sincronização completa, o workflow moveu #34, #32, #27 e #28, mas parou na issue seguinte com erro na mutação que muda a coluna. O código da coluna (`98236657`) só tem dígitos, e o `gh api -F` converte texto com cara de número em número, enquanto a API espera texto.

## Critérios de aceite
- [ ] Variáveis de texto sempre enviadas como texto (`-f`) e só números reais como número (`-F`)
- [ ] Teste com um código só de dígitos (visto falhando antes)
- [ ] Workflow roda até o fim e todas as issues ficam na coluna do seu estado
