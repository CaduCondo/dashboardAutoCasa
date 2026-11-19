Language: pt-BR

*** Settings ***
Documentation     Funcionalidade: planta 3D da casa com ícones e editor de portas e janelas.
Resource          ../resources/painel.resource
Suite Setup       Iniciar Ambiente
Suite Teardown    Encerrar Ambiente
Test Setup        Abrir Painel Em Modo Demonstração
Test Teardown     Fechar Contexto
Force Tags        planta    demo

*** Test Cases ***
Cenário: A planta 3D desenha a casa e alterna uma luz
    Dado que abri a planta 3D
    Então vejo o desenho 3D com pelo menos 40 ícones
    E o ícone lights:2 está apagado
    Quando toco no ícone lights:2
    Então o ícone lights:2 está aceso
    E a página não tem erros de script

Cenário: Adicionar e excluir uma porta no editor do mapa
    Dado que abri a planta 3D
    Quando entro no modo Editar mapa em Portas e janelas
    Então existem mais de 20 marcas de portas e janelas
    Quando adiciono uma porta
    E excluo a abertura selecionada
    Então a página não tem erros de script
