---
title: Mostrar as cenas do Tuya no painel (Abrir porta, Limpar, ração)
labels: tipo:feature, area:painel, area:home-assistant, prioridade:alta
column: Bloqueado
---
## Contexto
No app Home Remote aparecem cinco botões de cena do Tuya: **Abrir porta**, **Limpar**, **Desligar limpar**, **ração chico** e **Ração gatos**. No Home Assistant, cenas do Tuya aparecem como entidades `scene.*`, que ainda não foram listadas.

Bloqueado até o usuário rodar o modelo que lista as entidades `scene`.

## Critérios de aceite
- [ ] Listar as entidades scene do Tuya
- [ ] Alimentadores (chico e gatos) viram dois dispositivos no bloco Ração e robô
- [ ] Aspirador usa as cenas Limpar e Desligar limpar
- [ ] Abrir porta é entendida: portão, porta social ou outra coisa
- [ ] Painel dispara a cena e mostra confirmação
