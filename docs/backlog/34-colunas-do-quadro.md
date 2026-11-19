---
title: Quadro: reconhecer as colunas TO-DO, WIP, In Tests, DONE e BLOCK
labels: tipo:bug, prioridade:alta
column: Em andamento
---
## Contexto
O workflow do quadro funciona de ponta a ponta (issues entram no quadro), mas as colunas do quadro real se chamam **Backlog, TO-DO, WIP, In Tests, DONE e BLOCK**, e o código só conhecia nomes como "Em andamento" e "Pronto para fazer". Resultado: quase tudo caiu em Backlog e o estado "andamento" gerou aviso de coluna não encontrada.

## Critérios de aceite
- [ ] Cada estado reconhece a coluna correspondente (pronto = TO-DO, andamento = WIP, teste = In Tests, feito = DONE, bloqueado = BLOCK)
- [ ] Testes com as colunas reais do quadro (vistos falhando antes)
- [ ] Guia do Kanban lista os nomes aceitos
- [ ] Rodar o workflow e conferir no log que cada issue foi para a coluna do seu estado
