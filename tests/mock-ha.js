/* Home Assistant falso (WebSocket) para testar a ligação sem depender de uma casa real. */
const { WebSocketServer } = require('ws');

function startMockHA(initial) {
  const states = {};
  Object.entries(initial).forEach(([id, v]) => { states[id] = { entity_id: id, state: v.state, attributes: v.attributes || {} }; });
  const calls = [], clients = new Set();
  const wss = new WebSocketServer({ port: 0, host: '127.0.0.1' });
  const token = 'TESTTOKEN';
  wss.on('connection', ws => {
    clients.add(ws);
    ws.send(JSON.stringify({ type: 'auth_required', ha_version: 'mock' }));
    ws.on('close', () => clients.delete(ws));
    ws.on('message', raw => {
      const m = JSON.parse(raw);
      if (m.type === 'auth') {
        if (m.access_token === token) ws.send(JSON.stringify({ type: 'auth_ok', ha_version: 'mock' }));
        else ws.send(JSON.stringify({ type: 'auth_invalid', message: 'Invalid access token' }));
      } else if (m.type === 'get_states') ws.send(JSON.stringify({ id: m.id, type: 'result', success: true, result: Object.values(states) }));
      else if (m.type === 'subscribe_events') ws.send(JSON.stringify({ id: m.id, type: 'result', success: true, result: null }));
      else if (m.type === 'call_service') {
        calls.push({ domain: m.domain, service: m.service, data: m.service_data || {}, entity: m.target && m.target.entity_id });
        ws.send(JSON.stringify({ id: m.id, type: 'result', success: true, result: {} }));
      }
    });
  });
  function setState(id, state, attributes) {
    const old = states[id];
    states[id] = { entity_id: id, state, attributes: Object.assign({}, old && old.attributes, attributes) };
    const msg = JSON.stringify({ type: 'event', id: 1, event: { event_type: 'state_changed', data: { entity_id: id, old_state: old, new_state: states[id] } } });
    clients.forEach(c => c.send(msg));
  }
  return new Promise(res => wss.on('listening', () => res({
    url: 'http://127.0.0.1:' + wss.address().port, token, calls, setState, states,
    close: () => new Promise(r => { clients.forEach(c => c.terminate()); wss.close(r); })
  })));
}
module.exports = { startMockHA };
