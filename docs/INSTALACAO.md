# Instalação passo a passo

## 1. Home Assistant

Escolha um lugar que fique sempre ligado: Raspberry Pi 4/5, mini PC ou NAS. Siga https://www.home-assistant.io/installation/ (para quem não é da área, o **Home Assistant OS** num Raspberry Pi é o caminho mais simples). Há um exemplo de `docker-compose.yml` na raiz do projeto.

Depois do primeiro acesso, crie um usuário para o painel: *Configurações > Pessoas > Usuários*.

## 2. Adicionar os aparelhos

Cada app vira uma integração. Veja [INTEGRACOES.md](INTEGRACOES.md). Ao terminar, confira em *Configurações > Dispositivos e serviços > Entidades* se cada luz, câmera, ar-condicionado etc. aparece com um nome reconhecível. Nomes bons ("Luz Sala de estar") ajudam a sugestão automática do painel.

## 3. Token de acesso

No Home Assistant: seu perfil (canto inferior esquerdo) > **Segurança** > **Tokens de acesso de longa duração** > Criar. Copie o texto (ele só aparece uma vez).

## 4. Colocar o painel para rodar

**Opção A (recomendada): dentro do próprio Home Assistant.** Copie a pasta do projeto para `config/www/painel/` do Home Assistant e abra `http://IP-DO-HOME-ASSISTANT:8123/local/painel/index.html`. Fica no mesmo endereço, então não há bloqueio de CORS.

**Opção B: em outro computador** (`npm start`). Adicione ao `configuration.yaml` do Home Assistant:

```yaml
http:
  cors_allowed_origins:
    - http://IP-DO-COMPUTADOR:8080
```

e reinicie o Home Assistant.

> **Atenção ao https:** se o painel for aberto por `https://`, o navegador bloqueia conexões `ws://` sem criptografia. Use http nos dois (rede da casa) ou https/`wss` nos dois.

## 5. Conectar o painel

1. Abra o painel e toque em **Conexão** (canto superior direito).
2. Endereço: `http://IP-DO-HOME-ASSISTANT:8123`. Cole o token. **Conectar**. A bolinha fica verde.
3. **Sugerir automaticamente** vincula pelo nome o que for óbvio. Confira cada linha e preencha o resto (o campo tem lista de entidades do tipo certo).
4. Teste: ligue uma luz no painel e veja no Home Assistant; mude no Home Assistant e veja no painel.

Alternativa: copie `config.example.js` para `config.local.js` e preencha. O que for digitado na tela Conexão vale mais.

## 6. Cenas, regras e horários no Home Assistant

O tablet não deve ser quem agenda: se ele desligar, a irrigação deixa de rodar. Por isso:

1. Em **Conexão > Exportar para o Home Assistant**, copie `scripts.yaml` e `automations.yaml` para a configuração do Home Assistant (ou cole em *Ferramentas do desenvolvedor > YAML* e recarregue scripts e automações).
2. Cada cena vira um script (`script.painel_boa_noite`). Cada regra e cada horário viram automações.
3. Para falar "Alexa, boa noite": exponha os scripts à Alexa (Nabu Casa ou integração Alexa Smart Home) ou ao Google Assistant. Os scripts aparecem como cenas/dispositivos.
4. Sempre que mudar cenas, regras ou horários no painel, exporte de novo.

## 7. Tablet em tela cheia

Abra a página no navegador do tablet e use **Tela cheia**. Se o navegador bloquear, use "Adicionar à tela inicial" (iPad/Android), que abre sem barras. Mantenha a tela ligada (modo quiosque, ou app como Fully Kiosk no Android).
