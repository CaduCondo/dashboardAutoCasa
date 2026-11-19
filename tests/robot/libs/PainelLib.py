"""Biblioteca de apoio dos testes Robot: sobe o painel e o Home Assistant falso."""
import json
import os
import socket
import subprocess
import time
import urllib.request

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))


def _porta_livre():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


class PainelLib:
    ROBOT_LIBRARY_SCOPE = 'SUITE'

    def __init__(self):
        self._procs = []
        self._mock = None

    def iniciar_servidor_do_painel(self):
        """Sobe o servidor estático do painel numa porta livre e devolve o endereço."""
        porta = _porta_livre()
        env = dict(os.environ, PORT=str(porta), HOST='127.0.0.1')
        p = subprocess.Popen(['node', os.path.join(RAIZ, 'tools', 'serve.js')], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        self._procs.append(p)
        url = f'http://127.0.0.1:{porta}'
        for _ in range(50):
            try:
                urllib.request.urlopen(url + '/index.html', timeout=1).read(10)
                return url
            except Exception:
                time.sleep(0.1)
        raise RuntimeError('O servidor do painel não respondeu')

    def iniciar_home_assistant_falso(self):
        """Sobe o Home Assistant falso e devolve um dicionário com ha, token e control."""
        p = subprocess.Popen(['node', os.path.join(RAIZ, 'tests', 'mock-ha-server.js')], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
        self._procs.append(p)
        linha = p.stdout.readline()
        self._mock = json.loads(linha)
        return self._mock

    def parar_tudo(self):
        for p in self._procs:
            p.terminate()
        for p in self._procs:
            try:
                p.wait(timeout=5)
            except Exception:
                p.kill()
        self._procs = []
        self._mock = None

    def _ctl(self, caminho, corpo=None):
        req = urllib.request.Request(self._mock['control'] + caminho, data=None if corpo is None else json.dumps(corpo).encode(), method='GET' if corpo is None and caminho == '/calls' else 'POST')
        return json.loads(urllib.request.urlopen(req, timeout=5).read() or b'{}')

    def chamadas_recebidas(self):
        """Lista as chamadas de serviço que o Home Assistant falso recebeu."""
        return self._ctl('/calls')

    def limpar_chamadas(self):
        self._ctl('/reset', {})

    def mudar_estado_no_home_assistant(self, entidade, estado, atributos=None):
        self._ctl('/state', {'entity': entidade, 'state': estado, 'attributes': atributos or {}})

    def aguardar_chamada(self, servico, entidade=None, tempo=5):
        """Espera até chegar uma chamada com esse serviço (e entidade, se informada) e devolve a chamada."""
        fim = time.time() + float(tempo)
        while time.time() < fim:
            for c in self.chamadas_recebidas():
                if c['service'] == servico and (entidade is None or c['entity'] == entidade):
                    return c
            time.sleep(0.1)
        raise AssertionError(f'Nenhuma chamada {servico} {entidade or ""} chegou ao Home Assistant. Recebidas: {self.chamadas_recebidas()}')
