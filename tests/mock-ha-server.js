#!/usr/bin/env node
/* Home Assistant falso como processo separado, para o Robot Framework.
 * Imprime uma linha JSON com os endereços e aceita comandos de teste por HTTP:
 *   GET  /calls            chamadas de serviço recebidas
 *   POST /reset            apaga as chamadas guardadas
 *   POST /state            corpo {"entity":"light.x","state":"on","attributes":{}} muda o estado e avisa o painel */
const http = require('http');
const { startMockHA } = require('./mock-ha.js');

const INICIAL = {
  'light.sala_de_estar': { state: 'on' },
  'light.cozinha': { state: 'off' },
  'cover.persiana_suite_1': { state: 'open', attributes: { current_position: 100 } },
  'climate.daikin_sala': { state: 'cool', attributes: { temperature: 23 } },
  'media_player.tv_sala': { state: 'on', attributes: { volume_level: 0.36 } },
  'cover.portao': { state: 'closed' },
  'binary_sensor.interfone': { state: 'off' },
  'switch.irrigacao_frente': { state: 'off' },
  'vacuum.aspirador': { state: 'docked', attributes: { battery_level: 71 } },
  'button.racao': { state: 'unknown' },
  'camera.portao': { state: 'idle', attributes: { entity_picture: '/api/camera_proxy/camera.portao?token=abc' } }
};

startMockHA(INICIAL).then(ha => {
  const ctl = http.createServer((req, res) => {
    let corpo = '';
    req.on('data', d => { corpo += d; });
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      if (req.method === 'GET' && req.url === '/calls') return res.end(JSON.stringify(ha.calls));
      if (req.method === 'POST' && req.url === '/reset') { ha.calls.length = 0; return res.end('{}'); }
      if (req.method === 'POST' && req.url === '/state') {
        const m = JSON.parse(corpo || '{}');
        ha.setState(m.entity, m.state, m.attributes || {});
        return res.end('{}');
      }
      res.statusCode = 404; res.end('{}');
    });
  });
  ctl.listen(0, '127.0.0.1', () => {
    console.log(JSON.stringify({ ha: ha.url, token: ha.token, control: 'http://127.0.0.1:' + ctl.address().port }));
  });
  process.on('SIGTERM', () => { ctl.close(); ha.close().then(() => process.exit(0)); });
});
