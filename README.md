# Painel da Casa

Painel único para a casa: câmeras (Intelbras e Tapo), interfone, luzes, persianas, piscina (com aquecimento), irrigação, ar-condicionado (Daikin e outra marca), TVs (LG e TCL), alimentador de pet e aspirador (Tuya), portão, cenas com frases de voz, regras automáticas, horários e **planta 3D** montada a partir da planta da casa.

Funciona de dois jeitos:

| Modo | Quando | O que acontece |
|---|---|---|
| **Demonstração** | Sem configuração | Tudo é simulado no próprio navegador. Serve para conhecer e ajustar o visual, as cenas e a planta. |
| **Conectado** | Com um Home Assistant configurado | O painel lê o estado real dos aparelhos e envia os comandos. O Home Assistant fala com cada aplicativo/aparelho. |

## Rodar no computador

```bash
npm install        # só necessário para os testes
npm start          # abre em http://127.0.0.1:8080
```

Sem Node: `python3 -m http.server 8080` na pasta do projeto também serve.

Para abrir no tablet na mesma rede: `HOST=0.0.0.0 npm start` e acesse `http://IP-DO-COMPUTADOR:8080`.

> O 3D usa WebGL. Tablets e navegadores atuais funcionam. Abrir o `index.html` direto (file://) funciona, mas o servidor é mais confiável.

## Conectar de verdade

Nunca usou o Home Assistant? Comece por [docs/COMECAR_AQUI.md](docs/COMECAR_AQUI.md). Depois leia [docs/INSTALACAO.md](docs/INSTALACAO.md) (passo a passo do Home Assistant e do painel) e [docs/INTEGRACOES.md](docs/INTEGRACOES.md) (o que usar para cada app: Guardian, Allo Plus, SmartLife, Sonoff, LG, TCL, Daikin, Tapo).

Resumo: instalar o Home Assistant, adicionar cada integração, criar um token, abrir o painel, tocar em **Conexão**, colocar o endereço e o token, vincular cada dispositivo a uma entidade (há botão de sugestão automática) e exportar cenas, regras e horários para o Home Assistant.

## Estrutura

```
index.html            página principal
css/styles.css        visual (tema claro e escuro automáticos)
js/logic.js           lógica pura e testada: aberturas, serviços do Home Assistant, exportação YAML
js/core.js            dados, cartões, camadas, cenas, regras, horários
js/plan-data.js       paredes extraídas da planta (geradas por tools/extrair_planta.py)
js/plan3d.js          cena 3D, câmera, ícones, editor de portas e janelas
js/bridge.js          ligação WebSocket com o Home Assistant e tela Conexão
js/ui.js              eventos e inicialização
vendor/               three.js (MIT) para funcionar sem internet
tests/                testes de lógica e testes funcionais (navegador + Home Assistant falso)
tools/                servidor local e extração da planta
docs/                 instalação, integrações, revisão e a planta usada
```

## Testes

```bash
npm run test:unit   # 25 testes de lógica, sem navegador
npm run test:e2e    # testes funcionais no navegador com um Home Assistant simulado
npm run lint
```

Os testes funcionais precisam do Chromium do Playwright: `npx playwright install chromium`
(ou `CHROMIUM_PATH=/caminho/do/chrome npm run test:e2e`).

## O que ainda depende de você

- Vincular cada dispositivo à entidade do seu Home Assistant (uma vez).
- Conferir portas e janelas na planta (Planta > Editar mapa > Portas e janelas).
- Interfone Allo Plus e portão: ver [docs/INTEGRACOES.md](docs/INTEGRACOES.md); dependem do modelo.
- Sensores futuros (portas, boiler, chuva e telhado): os blocos já existem, "Em breve".

## Segurança

- O token do Home Assistant fica só no navegador do tablet (localStorage) ou em `config.local.js`, que o `.gitignore` já exclui. Nunca coloque o token no git.
- Crie um usuário próprio no Home Assistant para o painel, com permissões só do que ele controla.
- Não exponha o Home Assistant na internet sem HTTPS e autenticação. Para acesso de fora, use Nabu Casa, Tailscale ou VPN.
- Tela com câmeras e portão: deixe o tablet em modo quiosque numa área da casa que você controla.
