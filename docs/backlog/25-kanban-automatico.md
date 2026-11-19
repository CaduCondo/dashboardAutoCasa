---
title: Manter o quadro Kanban atualizado sozinho (etiquetas de estado e Action)
labels: tipo:infra, prioridade:alta
column: Pronto para fazer
---
## Contexto
O GraphQL (usado pelos Projetos v2 do GitHub) é bloqueado nas sessões do Claude Code, então o quadro não pode ser movido diretamente por aqui.

Solução: cada issue ganha uma etiqueta `estado:*` (que o Claude atualiza pela API REST a cada passo) e um workflow do GitHub Actions copia esse estado para a coluna do quadro. O workflow precisa de um token com permissão de projeto, guardado como segredo `PROJECT_TOKEN`; sem ele, o workflow avisa e não faz nada.

## Critérios de aceite
- [ ] Etiquetas estado:backlog, pronto, andamento, teste, bloqueado criadas
- [ ] Comando tools/kanban.js muda o estado de uma issue
- [ ] Workflow adiciona a issue ao quadro e move a coluna conforme a etiqueta
- [ ] Usuário cria o token e o segredo PROJECT_TOKEN (passo a passo em docs/KANBAN.md)
- [ ] Teste: mudar a etiqueta de uma issue move o cartão
