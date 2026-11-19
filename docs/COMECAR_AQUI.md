# Por onde começar (para quem já tem vários apps)

## O que é o Home Assistant e por que ele precisa de um "servidor"

Cada app que você tem (SmartLife, Tuya, eWeLink, Magic Home, Alexa, Guardian…) conversa só com os aparelhos da própria marca. O **Home Assistant** é o programa que fica no meio e conversa com **todos** eles. O painel desta pasta conversa só com o Home Assistant.

Ele precisa ficar **ligado 24 horas**, porque é ele que executa horários, cenas e regras (irrigação, persianas, luzes) mesmo com o tablet e o celular desligados.

## O celular serve?

- O aplicativo **Home Assistant** do celular (Companion) é só um **controle remoto**. Ele precisa de um Home Assistant rodando em outro lugar para se conectar.
- Rodar o Home Assistant **dentro do celular** não é recomendado: o celular dorme, esquenta, gasta bateria e muda de rede. Funciona para teste rápido, não para a casa.

## O que serve como servidor (escolha um)

| Opção | Custo aproximado | Observação |
|---|---|---|
| Raspberry Pi 4 ou 5 (com fonte, cartão ou SSD) | R$ 600 a 1.000 | Mais usado. Instala o Home Assistant OS. |
| Mini PC usado (Intel, 4 GB de RAM) | R$ 400 a 900 | Mais rápido que o Raspberry. |
| Notebook ou PC antigo que fique ligado | R$ 0 | Funciona; gasta mais energia. |
| NAS (Synology, QNAP) | já tem | Roda em Docker ou máquina virtual. |
| Home Assistant Green (pronto) | R$ 800 a 1.200 | Liga e usa. Importação pode ser difícil. |

Ele deve ficar ligado por **cabo de rede** na mesma rede dos aparelhos.

## Seus apps

| Você tem | No Home Assistant | Observação |
|---|---|---|
| **SmartLife** e **Tuya** | Integração **Tuya** (é o mesmo sistema; o SmartLife é só outro app dele) | Usa conta de desenvolvedor gratuita em iot.tuya.com. Interruptores, alimentador e aspirador. |
| **eWeLink** (Sonoff) | **SonoffLAN** (HACS) ou integração eWeLink | Modo LAN é mais rápido e funciona sem internet. |
| **Magic Home** (fitas de LED) | Integração **Magic Home** (já vem no Home Assistant, local) | Normalmente acha sozinha. |
| **Alexa** | Não é necessária para ligar nada. Serve para **voz**: o Home Assistant mostra suas cenas para a Alexa | Via Nabu Casa (assinatura) ou integração Alexa Smart Home. |
| **Home Remote** | Não precisa de integração própria. Os botões dele (Abrir porta, Limpar, Desligar limpar, ração chico, Ração gatos) **não aparecem** no Home Assistant como cenas. Provavelmente são cenas do próprio app, e o que cada uma faz precisa ser descoberto e recriado. | Ver issue 02 do backlog. |

## Sem servidor, dá?

Para só **ver e testar o visual**, sim: o painel funciona em modo demonstração. Para controlar de verdade e agendar, é necessário um servidor ligado sempre. Sem ele, cada app continua separado, como hoje.

## Ordem sugerida

1. Escolher e ligar o servidor (a opção mais simples costuma ser Raspberry Pi 4/5 ou mini PC).
2. Instalar o Home Assistant e adicionar **uma** integração de cada vez (comece pelo SmartLife/Tuya).
3. Conferir que as luzes aparecem lá. Depois abrir o painel e conectar (veja INSTALACAO.md).
4. Câmeras, ar-condicionado, TVs e o resto vêm depois, um por um.
