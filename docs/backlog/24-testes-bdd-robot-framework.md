---
title: Ambiente de testes funcionais BDD com Robot Framework e GitHub Actions
labels: tipo:infra, area:painel, prioridade:alta
column: Em andamento
---
## Contexto
Criar o ambiente de testes funcionais no estilo BDD (Dado / Quando / Então, em português) usando **Robot Framework** com a biblioteca **Browser** (Playwright), rodando a cada push e Pull Request no **GitHub Actions**, com relatório (log.html, report.html) guardado como artefato.

Usa o Home Assistant simulado já existente para testar a ligação sem depender da casa.

## Critérios de aceite
- [ ] Pasta tests/robot com recursos, palavras-chave e features em português
- [ ] Robot sobe o servidor do painel e o Home Assistant simulado sozinho
- [ ] Pelo menos os cenários de fumaça, luzes, cena, planta 3D e ligação com o Home Assistant
- [ ] Workflow no GitHub Actions roda lint, testes de lógica e Robot, e publica o relatório
- [ ] Execução local documentada em docs/TESTES.md
- [ ] Resultado verde no Actions antes de fechar
