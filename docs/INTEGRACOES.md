# O que usar para cada app

Nunca usou o Home Assistant? Comece por [COMECAR_AQUI.md](COMECAR_AQUI.md).

Importante: o painel não conversa com os aplicativos (Guardian, SmartLife, etc.). Ele conversa com o **Home Assistant**, e o Home Assistant conversa com os aparelhos. Esta tabela é a melhor rota conhecida para cada um. **Nada disto foi testado com os seus aparelhos**; confirme o modelo antes de comprar qualquer coisa.

| Aparelho / app | Rota no Home Assistant | Observações |
|---|---|---|
| **SmartLife (Tuya)**: interruptores, alimentador, aspirador, irrigação | Integração oficial **Tuya** (nuvem) ou **LocalTuya** (rede local, HACS) | A oficial pede um projeto gratuito em iot.tuya.com e vincular a conta do SmartLife por QR code. Alimentador vira `button`/`switch`; aspirador vira `vacuum`. |
| **Sonoff** (interruptores, persianas) | **SonoffLAN** (HACS, rede local) ou eWeLink | Modo LAN é mais rápido e funciona sem internet. Persianas precisam do modelo/firmware que suporte `cover`. |
| **Magic Home** (fitas de LED) | Integração **Magic Home** (local, já inclusa) | Costuma ser detectada sozinha. |
| **LG** (TV) | Integração **LG webOS Smart TV** (rede local) | A TV precisa estar ligada na rede e permitir controle. Liga por Wake-on-LAN. |
| **TCL** (TV) | Se for Google TV/Android TV: **Android TV Remote**. Se for Roku TV: **Roku** | Confirme o sistema da TV. |
| **Daikin** (3 ar-condicionados) | Integração **Daikin AC** (local) | Precisa do adaptador Wi-Fi do modelo (BRP069/BRP072/BRP084 conforme a geração). |
| **Outra marca** (2 ar-condicionados) | A definir | Quando souber a marca: Midea/Springer/Carrier costumam usar *Midea AC*; sem Wi-Fi, um controle IR (Broadlink) serve. |
| **Câmeras Intelbras** (Guardian) | Protocolo **ONVIF/RTSP**, recomendado com **go2rtc** | Intelbras usa protocolo da Dahua. RTSP típico: `rtsp://usuario:senha@IP:554/cam/realmonitor?channel=1&subtype=0`. Ative RTSP/ONVIF no app. A gravação no cartão continua na própria câmera. |
| **Câmeras Tapo C200** | **Tapo: Cameras Control** (HACS) ou ONVIF/RTSP | No app Tapo, crie uma "conta de câmera" (Configurações avançadas) e use-a no Home Assistant. |
| **Interfone Allo Plus** | **Pendente** | Não conheço API pública. Dependendo do modelo pode haver **SIP** ou imagem **RTSP**. Plano B: o painel mostra o aviso (via sensor/relé) e o botão abre o app do Allo Plus. Me diga o modelo. |
| **Portão automático** | Relé **Sonoff** no comando da central, ou o app/controle da central | Mapeie como `cover`, `switch` ou `button`. |
| **Boiler** (temperatura e nível) | **ESPHome** com sensores (DS18B20 e sensor de nível) | Os blocos já existem como "Em breve". |
| **Telhado + sensor de chuva** | ESPHome/relé + sensor de chuva | A regra "chuva fecha o telhado" deve rodar no Home Assistant ou no controlador, nunca só no tablet. |

## Como o painel usa cada tipo de entidade

| Dispositivo no painel | Domínios aceitos | Comandos enviados |
|---|---|---|
| Luzes, tomadas, irrigação, motores | `light`, `switch`, `input_boolean`, `valve`, `fan` | ligar / desligar |
| Persianas | `cover` | abrir, fechar, posição |
| Ar-condicionado | `climate` | modo frio, desligar, temperatura |
| Aquecimento da piscina | `climate`, `water_heater`, `switch` | ligar, desligar, meta |
| TVs | `media_player` | ligar, desligar, volume |
| Alimentador | `button`, `input_button`, `switch`, `script` | pressionar |
| Aspirador | `vacuum` | iniciar, voltar à base |
| Portão | `cover`, `switch`, `button`, `script` | abrir, fechar |
| Interfone (aviso) | `binary_sensor`, `input_boolean`, `event` | lê "tocando" |
| Câmeras | `camera` | imagem ao vivo (MJPEG pelo próprio Home Assistant) |

Câmeras: para imagem mais fluida e baixa latência, use go2rtc e a integração **WebRTC Camera** ou *Generic Camera* apontando para o go2rtc.
