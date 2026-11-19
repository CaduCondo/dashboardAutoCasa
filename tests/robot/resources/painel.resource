*** Settings ***
Documentation     Palavras-chave em português para os cenários BDD do painel.
...               Cada cenário usa Dado / Quando / Então / E (idioma pt-BR do Robot Framework).
Library           Browser
Library           String
Library           Collections
Library           ../libs/PainelLib.py    WITH NAME    Painel

*** Variables ***
${CHROMIUM}       %{CHROMIUM_PATH=}
${BASE}           ${EMPTY}
${HA_URL}         ${EMPTY}
${HA_CONTROLE}    ${EMPTY}
${TOKEN_CERTO}    TESTTOKEN
&{VINCULOS}       lights:0=light.sala_de_estar    lights:1=light.cozinha    blinds:0=cover.persiana_suite_1    ac:0=climate.daikin_sala
...               tv:0=media_player.tv_sala    gate:0=cover.portao    call:0=binary_sensor.interfone    irrig:0=switch.irrigacao_frente
...               pet:0=button.racao    pet:1=vacuum.aspirador    cam:0=camera.portao

*** Keywords ***
# ---------- ambiente ----------
Iniciar Ambiente
    ${BASE}=    Painel.Iniciar Servidor Do Painel
    ${mock}=    Painel.Iniciar Home Assistant Falso
    Set Suite Variable    ${BASE}
    Set Suite Variable    ${HA_URL}    ${mock}[ha]
    Set Suite Variable    ${HA_CONTROLE}    ${mock}[control]
    ${exe}=    Set Variable If    '${CHROMIUM}' == ''    ${NONE}    ${CHROMIUM}
    New Browser    chromium    headless=True    executablePath=${exe}
    ...    args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--no-sandbox"]

Encerrar Ambiente
    Close Browser
    Painel.Parar Tudo

Abrir Painel Em Modo Demonstração
    New Context    viewport={"width": 1280, "height": 800}
    New Page    ${BASE}/index.html
    Wait For Elements State    css=.tile >> nth=0    attached

Abrir Painel Conectado Ao Home Assistant
    [Arguments]    ${token}=${TOKEN_CERTO}    ${vinculos}=${VINCULOS}
    Painel.Limpar Chamadas
    New Context    viewport={"width": 1280, "height": 800}
    New Page    ${BASE}/index.html
    ${cfg}=    Evaluate    json.dumps({'url': $HA_URL, 'token': $token, 'map': $vinculos})    json
    LocalStorage Set Item    casa.ha    ${cfg}
    Reload
    Wait For Elements State    css=.tile >> nth=0    attached

Fechar Contexto
    Close Context

# ---------- ações genéricas ----------
Abrir O Bloco
    [Arguments]    ${grupo}
    Click    css=.tile .open[data-g="${grupo}"]

Fechar A Camada
    Click    id=lx

Texto Grande Do Bloco
    [Arguments]    ${grupo}
    ${t}=    Get Text    css=.tile .open[data-g="${grupo}"] .big
    RETURN    ${t}

Esperar O Bloco Mostrar
    [Arguments]    ${grupo}    ${texto}
    Wait For Condition    Text    css=.tile .open[data-g="${grupo}"] .big    ==    ${texto}    timeout=5s

# ---------- Dado ----------
Que abri o painel
    Get Element Count    css=.tile    >    0

Que abri a planta 3D
    Go To    ${BASE}/index.html\#planta
    Wait For Elements State    css=\#stage canvas    visible    timeout=15s
    Sleep    1s

Que abri o painel conectado ao Home Assistant
    Abrir Painel Conectado Ao Home Assistant
    Wait For Elements State    css=\#cfgDot.on    attached    timeout=10s

Que abri o painel com token inválido
    Abrir Painel Conectado Ao Home Assistant    token=ERRADO
    Wait For Elements State    css=\#cfgDot.error    attached    timeout=10s

# ---------- Quando ----------
Ligo a luz ${n:\d+} em Luzes internas
    Abrir O Bloco    lights
    Click    css=.swb[data-g="lights"][data-i="${n}"]
    Fechar A Camada

Toco em desligar tudo das luzes
    Click    css=.master[data-m="lights"]

Toco na cena ${nome}
    Click    css=.scn[data-a="srun"]:has-text("${nome}")

Renomeio a câmera ${n:\d+} para "${nome}"
    Click    css=.cam[data-c="${n}"]
    Fill Text    css=input[data-a="cname"]    ${nome}
    Fechar A Camada

Recarrego a página
    Reload
    Wait For Elements State    css=.tile >> nth=0    attached

Toco no ícone ${ref}
    Click With Options    css=[data-mk="${ref}"]    force=True

Entro no modo Editar mapa em Portas e janelas
    Click    css=[data-pt="edit"]
    Click    css=[data-pt="em:ops"]

Adiciono uma porta
    Click    css=[data-op="add:p"]

Excluo a abertura selecionada
    Click    css=[data-op="del"]

Ligo a luz ${n:\d+} pelo painel
    Abrir O Bloco    lights
    Click    css=.swb[data-g="lights"][data-i="${n}"]

O Home Assistant desliga ${entidade}
    Painel.Mudar Estado No Home Assistant    ${entidade}    off

# ---------- Então ----------
Vejo ${n:\d+} blocos de dispositivos
    Get Element Count    css=.tile    ==    ${n}

Vejo ${n:\d+} câmeras
    Get Element Count    css=.cam    ==    ${n}

Vejo as cenas no rodapé
    Get Element Count    css=.scn[data-a="srun"]    >=    5

A página não tem erros de script
    ${erros}=    Get Page Errors
    Should Be Empty    ${erros}

O bloco ${grupo} mostra ${texto}
    Esperar O Bloco Mostrar    ${grupo}    ${texto}

A câmera ${n:\d+} se chama "${nome}"
    Get Text    css=.cam[data-c="${n}"] .name    ==    ${nome}

Vejo o desenho 3D com pelo menos ${n:\d+} ícones
    Get Element Count    css=\#stage .mk    >=    ${n}

O ícone ${ref} está aceso
    Wait For Condition    Classes    css=[data-mk="${ref}"]    contains    on    timeout=3s

O ícone ${ref} está apagado
    ${classes}=    Get Classes    css=[data-mk="${ref}"]
    Should Not Contain    ${classes}    on

Vejo ${n:\d+} marcas de portas e janelas
    Get Element Count    css=.op    ==    ${n}

Existem mais de ${n:\d+} marcas de portas e janelas
    Get Element Count    css=.op    >    ${n}

Vejo a conexão com o Home Assistant em verde
    Wait For Elements State    css=\#cfgDot.on    attached    timeout=10s

Vejo a conexão com erro
    Wait For Elements State    css=\#cfgDot.error    attached    timeout=10s

O Home Assistant recebeu ${servico} para ${entidade}
    ${c}=    Painel.Aguardar Chamada    ${servico}    ${entidade}
    Log    ${c}

O Home Assistant não recebeu nenhum comando
    ${chamadas}=    Painel.Chamadas Recebidas
    Should Be Empty    ${chamadas}
