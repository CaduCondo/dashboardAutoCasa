---
title: Fluxo de produção: publicar no Home Assistant e testar em produção
labels: tipo:infra, area:home-assistant, prioridade:media
column: Backlog
---
## Contexto
Definir como uma versão aprovada chega ao painel que a casa usa (pasta www do Home Assistant) e como testar lá depois (teste de fumaça do Robot apontando para o painel real, rodado na rede da casa).

## Critérios de aceite
- [ ] Procedimento de atualização documentado (git pull ou cópia)
- [ ] Release marcada no GitHub com o zip do painel
- [ ] Teste de fumaça de produção roda com BASE_URL do painel real
- [ ] Plano de volta atrás (voltar à versão anterior)
