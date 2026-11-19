---
title: Assistente de canais: nomear e classificar cada botão dos painéis de parede
labels: tipo:feature, area:painel, prioridade:alta
column: Pronto para fazer
---
## Contexto
O Home Assistant trouxe ~100 canais ("Canal 1..6 Interruptor") sem dizer o que cada um liga. O painel de exemplo tem só 8 luzes.

Criar um assistente no painel que lista os painéis de parede por Área, deixa **testar** cada canal, **nomear** (ex.: Luz principal, Sanca) e **classificar** (luz, tomada, outro, ignorar). O painel passa a montar luzes, tomadas e cômodos a partir disso.

## Critérios de aceite
- [ ] Lista os interruptores agrupados por Área do Home Assistant
- [ ] Botão Testar liga e desliga o canal e avisa antes de testar
- [ ] Campo de nome e tipo por canal, salvo no navegador e exportável
- [ ] Luzes internas, tomadas e a planta 3D usam os nomes dados
- [ ] Canais marcados como "ignorar" e as entidades "Luz de fundo" não aparecem
- [ ] Testes funcionais cobrindo nomear, classificar e persistir
