# Revisão da implantação

Data: 18/11/2026. Escopo: todo o código do painel (`js/`, `css/`, `index.html`, `tools/`) e a ligação com o Home Assistant.

## O que foi verificado e como

| Verificação | Como | Resultado |
|---|---|---|
| Lógica pura (aberturas, serviços do HA, estados, YAML) | `npm run test:unit` (25 testes) | passou |
| Funcionamento no navegador (painel, cenas, regras, horários, interfone, portão, câmeras, planta 3D, editor de portas e janelas) | `npm run test:e2e` com Chromium real (27 testes) | passou |
| Ligação com o Home Assistant | os mesmos testes, contra um Home Assistant simulado por WebSocket (`tests/mock-ha.js`) | passou |
| Variáveis indefinidas, código morto, erros de escopo | `npm run lint` (junta os scripts na ordem de carregamento) | sem erros |
| Erros no console | os testes falham se a página lançar qualquer erro | nenhum |

## Defeito encontrado pelos testes e corrigido

- **Ícones da planta nasciam no canto da tela.** Depois de redesenhar, os ícones só eram posicionados no quadro seguinte, então o primeiro quadro os mostrava todos em (0, 0) e um arrastar logo depois falhava. Agora são posicionados na hora (`placeAll` em `js/plan3d.js`). Achado pelo teste de arrastar ícone, que também confirma que a posição fica salva.

Os demais problemas que apareceram durante a execução eram erros dos próprios testes (seletores e expectativas), sem relação com o painel.

## Decisão de projeto que evita um erro previsível

- O alimentador de pet conta porções (`fed`) em vez de guardar só "agora". Assim, cada toque envia um `button.press` ao Home Assistant, e não só o primeiro. Coberto por teste.

## Limitações conhecidas (não são defeitos, são o que falta)

- **Cenas, regras e horários não rodam dentro do painel.** O painel só guarda e exporta. Quem executa é o Home Assistant, depois de você colar os arquivos exportados. Sem isso, nada acontece sozinho.
- **Regras com chuva e porta aberta** precisam de sensores que ainda não existem. Não são exportadas (o painel avisa).
- **Interfone Allo Plus**: imagem e voz de verdade dependem do modelo. Hoje o painel mostra o aviso quando uma entidade "tocando" existe e simula o resto. A conversa pelo painel não foi implementada com áudio real.
- **Câmeras**: usam a imagem MJPEG do Home Assistant. É suficiente para ver, mas tem atraso. Para fluidez, use go2rtc.
- **Vínculo é por entidade única.** Um dispositivo do painel aponta para uma entidade. Se um item tiver duas (por exemplo, motor e sensor), é preciso criar um grupo/template no Home Assistant.
- **Nenhum aparelho real foi testado.** Os testes provam que o painel manda o comando certo para o Home Assistant e reage ao que ele informa. Não provam que a integração Tuya, Daikin, LG, TCL, Sonoff, Intelbras ou Tapo funcione na sua casa; isso se confirma na instalação.
- **Segurança**: o painel não tem login próprio. Quem abrir a página no tablet controla a casa (inclusive o portão). Veja a seção de segurança do README.
- **Planta**: as paredes vêm da imagem. Janelas e portas são palpite inicial e podem ser corrigidas no editor. Móveis são aproximados.
- **WebGL é obrigatório** para a planta 3D.

## Resultado final (18/11/2026)

- Lint: sem erros.
- Testes de lógica: 25 de 25.
- Testes funcionais: 27 de 27, sem erros no console.

## Como repetir os testes

```bash
npm install
npx playwright install chromium
npm run lint && npm test
```

## Defeitos achados ao ligar o quadro Kanban (19/11/2026)

A parte que fala com o GraphQL do GitHub só pode rodar no GitHub Actions, então só foi exercitada de verdade com o token do dono. Apareceram três defeitos, todos corrigidos com teste visto falhando antes:

| Issue | Defeito | Correção |
|---|---|---|
| #32 | Consulta GraphQL com uma chave `}` sobrando (o GitHub recusou) | Corrigida; as consultas passaram a ser lidas por um parser GraphQL nos testes |
| #34 | O código só conhecia nomes de coluna em português e os padrões do GitHub; o quadro real usa TO-DO, WIP, In Tests, DONE e BLOCK | Nomes reais reconhecidos |
| #36 | Código de coluna só com dígitos era enviado como número e a API recusou | Texto vai com `-f` e só número real com `-F` |

Lição: o que não dá para testar de ponta a ponta no ambiente de desenvolvimento precisa de um teste que cubra a parte que dá (sintaxe, formato dos argumentos, nomes reais) e de uma rodada em produção antes de dar a issue por feita.
