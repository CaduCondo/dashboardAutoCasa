Language: pt-BR

*** Settings ***
Documentation     Funcionalidade: o painel abre e mostra a casa, em modo demonstração.
Resource          ../resources/painel.resource
Suite Setup       Iniciar Ambiente
Suite Teardown    Encerrar Ambiente
Test Setup        Abrir Painel Em Modo Demonstração
Test Teardown     Fechar Contexto
Force Tags        painel    demo

*** Test Cases ***
Cenário: O painel abre com todos os blocos, câmeras e cenas
    Dado que abri o painel
    Então vejo 15 blocos de dispositivos
    E vejo 8 câmeras
    E vejo as cenas no rodapé
    E a página não tem erros de script

Cenário: Ligar uma luz atualiza o cartão
    Dado que abri o painel
    Quando ligo a luz 2 em Luzes internas
    Então o bloco lights mostra 3/8

Cenário: Desligar tudo apaga as luzes
    Dado que abri o painel
    Quando toco em desligar tudo das luzes
    Então o bloco lights mostra 0/8

Cenário: A cena Boa noite apaga luzes e fecha persianas
    Dado que abri o painel
    Quando toco na cena Boa noite
    Então o bloco lights mostra 0/8
    E o bloco blinds mostra 0/3

Cenário: O nome da câmera editado continua depois de recarregar
    Dado que abri o painel
    Quando renomeio a câmera 0 para "Portão principal"
    E recarrego a página
    Então a câmera 0 se chama "Portão principal"
