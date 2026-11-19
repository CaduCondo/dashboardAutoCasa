Language: pt-BR

*** Settings ***
Documentation     Funcionalidade: o painel conversa com o Home Assistant (simulado).
Resource          ../resources/painel.resource
Suite Setup       Iniciar Ambiente
Suite Teardown    Encerrar Ambiente
Test Teardown     Fechar Contexto
Force Tags        home-assistant

*** Test Cases ***
Cenário: Conecta e traz os estados reais sem devolver comandos
    Dado que abri o painel conectado ao Home Assistant
    Então vejo a conexão com o Home Assistant em verde
    E o bloco lights mostra 1/8
    E o Home Assistant não recebeu nenhum comando

Cenário: Ligar uma luz no painel manda o comando certo
    Dado que abri o painel conectado ao Home Assistant
    Quando ligo a luz 1 pelo painel
    Então o Home Assistant recebeu turn_on para light.cozinha

Cenário: Mudança feita no Home Assistant aparece no painel
    Dado que abri o painel conectado ao Home Assistant
    Quando o Home Assistant desliga light.sala_de_estar
    Então o bloco lights mostra 0/8

Cenário: Token inválido mostra erro e não derruba o painel
    Dado que abri o painel com token inválido
    Então vejo a conexão com erro
    E o bloco lights mostra 2/8
    E a página não tem erros de script
