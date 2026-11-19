---
title: Portar os 27 testes funcionais em JavaScript para cenários Robot
labels: tipo:infra, prioridade:media
column: Backlog
---
## Contexto
Os testes funcionais atuais (tests/e2e.test.js, Playwright) cobrem 27 cenários. Repetir todos como cenários BDD em Robot Framework e, ao atingir a mesma cobertura, remover a versão em JavaScript para não manter duas.

## Critérios de aceite
- [ ] Todos os 27 cenários existem em Robot
- [ ] Cobertura equivalente conferida cenário a cenário
- [ ] tests/e2e.test.js removido
- [ ] Workflow usa só o Robot para o funcional
