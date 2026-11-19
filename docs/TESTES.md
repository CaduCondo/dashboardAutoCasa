# Testes

O projeto tem três camadas. Todas rodam sozinhas no GitHub Actions a cada push e Pull Request (`.github/workflows/ci.yml`).

| Camada | Para quê | Comando | Ferramenta |
|---|---|---|---|
| Lint | Variáveis indefinidas, erros de escopo | `npm run lint` | ESLint |
| Lógica | Regras puras: aberturas, serviços do Home Assistant, YAML, Kanban | `npm run test:unit` | node:test |
| **Funcionais BDD** | O que o usuário vê e faz no painel, e a conversa com o Home Assistant | `npm run test:robot` | **Robot Framework** + Browser (Playwright) |
| Funcionais antigos | Os 27 cenários em JavaScript, até serem portados (issue #26) | `npm run test:e2e` | Playwright |

## Por que Robot Framework

- Os cenários são escritos em **português, no formato Dado / Quando / Então**, e qualquer pessoa consegue ler.
- A biblioteca **Browser** usa o Playwright por baixo (rápida, espera sozinha pelos elementos e permite WebGL, necessário para a planta 3D).
- Gera `log.html` e `report.html` com cada passo, que o GitHub Actions guarda como artefato.
- Há um Home Assistant simulado (`tests/mock-ha-server.js`), então a ligação com a casa é testada sem a casa.

Também é a ferramenta que o dono do projeto já usa nos outros projetos, e o Browser cobre tudo o que o painel precisa.

## Rodar no seu computador

Precisa de Python 3.10 ou mais novo e Node 22.

```bash
npm install
python -m venv .venv
.venv\Scripts\activate          # Windows (no Linux/Mac: source .venv/bin/activate)
pip install -r tests/robot/requirements.txt
rfbrowser init chromium         # baixa o navegador de teste (uma vez)
npm run test:robot
```

Abra `results/robot/report.html` para ver o resultado. Para rodar só uma funcionalidade:

```bash
python -m robot --outputdir results/robot tests/robot/features/03_home_assistant.robot
```

Para usar outro Chromium já instalado: variável `CHROMIUM_PATH` com o caminho do executável.

## Como escrever um cenário

```robot
Cenário: Ligar uma luz atualiza o cartão
    Dado que abri o painel
    Quando ligo a luz 2 em Luzes internas
    Então o bloco lights mostra 3/8
```

As frases ficam em `tests/robot/resources/painel.resource`. Crie uma frase nova ali quando faltar, e escreva o cenário só com frases.

## Teste em produção (fumaça)

Os mesmos cenários de leitura podem ser apontados para o painel real, na rede da casa. Isso será definido na issue #28.

## Regras

- Todo Pull Request com mudança no painel traz ou atualiza cenários.
- Um cenário que falha porque o comportamento mudou de propósito é corrigido no mesmo Pull Request.
- Um cenário novo deve ser visto falhando uma vez antes de passar (para não ser um teste que nunca falha).
