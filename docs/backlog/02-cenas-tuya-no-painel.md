---
title: Recriar no Home Assistant as cenas do Home Remote (Abrir porta, Limpar, ração)
labels: tipo:feature, area:home-assistant, area:hardware, prioridade:alta
column: Pronto para fazer
---
## Contexto
No app Home Remote há cinco botões com ícone de "play": **Abrir porta**, **Limpar**, **Desligar limpar**, **ração chico** e **Ração gatos**. O modelo que lista entidades `scene` no Home Assistant voltou **vazio**, então esses botões **não** chegam ao Home Assistant pela integração Tuya.

Provavelmente são cenas criadas dentro do próprio Home Remote (ele permite montar cenas que mandam comandos a dispositivos Tuya) ou cenas do Tuya que a integração não traz. Precisamos descobrir **o que cada botão faz de verdade** para recriar no Home Assistant.

Dois alimentadores (chico e gatos), um aspirador e algo que "abre porta" (portão ou porta social).

## Critérios de aceite
- [ ] No Home Remote, abrir cada cena e anotar qual dispositivo e qual comando ela envia
- [ ] Dizer se "Abrir porta" é o portão da rua, a porta social ou outra coisa
- [ ] Procurar no Home Assistant a entidade equivalente (switch, button ou vacuum) de cada ação
- [ ] Recriar cada ação como script no Home Assistant
- [ ] Alimentadores (chico e gatos) viram dois dispositivos no bloco Ração e robô do painel
- [ ] Aspirador usa os scripts Limpar e Desligar limpar
