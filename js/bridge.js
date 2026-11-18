/* Ligação com o Home Assistant (WebSocket). Sem configuração, o painel roda em modo demonstração. */
(function () {
  'use strict';
  const LS = 'casa.ha';
  let cfg = loadCfg(), ws = null, seq = 1, pend = {}, states = {}, status = 'off', msg = '', last = null;
  let inbound = false, soonT = null, retryT = null, retry = 0, showExport = false;

  function loadCfg() {
    const base = window.PAINEL_CONFIG || {};
    let s = {};
    try { s = JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) { /* sem armazenamento */ }
    return { url: s.url || base.haUrl || '', token: s.token || base.token || '', map: Object.assign({}, base.entities || {}, s.map || {}) };
  }
  function persist() { try { localStorage.setItem(LS, JSON.stringify(cfg)); } catch (e) { /* ignorar */ } }
  const enabled = () => !!(cfg.url && cfg.token);
  const wsUrl = () => cfg.url.replace(/\/+$/, '').replace(/^http/, 'ws') + '/api/websocket';

  function setStatus(s, m) {
    status = s; msg = m || '';
    const d = document.getElementById('cfgDot'); if (d) d.className = 'dot ' + s;
    if (typeof open !== 'undefined' && open && open.v === 'conn') renderLayer();
  }

  /* lista de dispositivos que podem ser vinculados */
  function refs() {
    const out = [];
    GROUPS.forEach(g => g.items.forEach((it, i) => {
      if (it.k === 'plan') return;
      out.push({ ref: g.id + ':' + i, name: it.k === 'call' ? 'Interfone' : lab(g, it), k: it.k, group: g.name });
    }));
    CAMS.forEach((c, i) => out.push({ ref: 'cam:' + i, name: c.n, k: 'cam', group: 'Câmeras' }));
    return out;
  }
  const itemOf = ref => { const [gid, ix] = ref.split(':'); const g = GROUPS.find(q => q.id === gid); return g && g.items[+ix]; };

  function snapshot() {
    const o = {};
    GROUPS.forEach(g => g.items.forEach((it, i) => { const f = Logic.FIELDS[it.k]; if (f) o[g.id + ':' + i] = f.map(x => it[x]); }));
    return o;
  }

  /* painel -> Home Assistant */
  function afterRefresh() {
    if (status !== 'on' || inbound) return;
    const cur = snapshot();
    if (last) {
      Object.keys(cur).forEach(ref => {
        if (JSON.stringify(cur[ref]) === JSON.stringify(last[ref])) return;
        const ent = cfg.map[ref], it = itemOf(ref);
        if (!ent || !it) return;
        Logic.FIELDS[it.k].forEach((f, n) => {
          if (JSON.stringify(cur[ref][n]) === JSON.stringify(last[ref] && last[ref][n])) return;
          Logic.serviceFor(it.k, ent, { field: f, value: cur[ref][n], item: it }).forEach(callService);
        });
      });
    }
    last = cur;
  }
  function soon() { clearTimeout(soonT); soonT = setTimeout(afterRefresh, 250); }
  function callService(c) {
    send({ type: 'call_service', domain: c.domain, service: c.service, service_data: c.data, target: c.target }).then(r => {
      if (r && r.success === false) toast('O Home Assistant recusou: ' + ((r.error && r.error.message) || c.service));
    });
  }

  /* Home Assistant -> painel */
  function applyEntity(eid) {
    const e = states[eid];
    Object.keys(cfg.map).filter(r => cfg.map[r] === eid).forEach(ref => {
      if (ref === 'call:0') { call = (e.state === 'on' || e.state === 'ringing') ? 'ring' : (call === 'talk' ? 'talk' : false); return; }
      if (ref.startsWith('cam:')) return;
      const it = itemOf(ref); if (it) Logic.applyState(it, e);
    });
  }
  function repaint() {
    inbound = true;
    try { last = snapshot(); } finally { inbound = false; }
    renderCams(); refresh();
  }
  function onEntity(eid) {
    if (!Object.keys(cfg.map).some(r => cfg.map[r] === eid)) return;
    applyEntity(eid);
    cancelAnimationFrame(onEntity.raf);
    onEntity.raf = requestAnimationFrame(repaint);
  }
  function syncAll() {
    Object.keys(cfg.map).forEach(ref => { if (states[cfg.map[ref]]) applyEntity(cfg.map[ref]); });
    repaint();
  }

  /* conexão */
  function send(m) {
    return new Promise(res => {
      if (!ws || ws.readyState !== 1) return res({ success: false, error: { message: 'sem conexão' } });
      m.id = seq++; pend[m.id] = res; ws.send(JSON.stringify(m));
    });
  }
  function handle(m) {
    if (m.type === 'auth_required') ws.send(JSON.stringify({ type: 'auth', access_token: cfg.token }));
    else if (m.type === 'auth_invalid') { retry = -1; setStatus('error', 'Token recusado pelo Home Assistant.'); }
    else if (m.type === 'auth_ok') {
      retry = 0;
      send({ type: 'get_states' }).then(r => {
        states = {}; (r.result || []).forEach(e => { states[e.entity_id] = e; });
        setStatus('on', (r.result || []).length + ' entidades encontradas.');
        syncAll();
      });
      send({ type: 'subscribe_events', event_type: 'state_changed' });
    } else if (m.type === 'result' && pend[m.id]) { pend[m.id](m); delete pend[m.id]; }
    else if (m.type === 'event' && m.event && m.event.event_type === 'state_changed') {
      const d = m.event.data;
      if (d.new_state) { states[d.entity_id] = d.new_state; onEntity(d.entity_id); }
    }
  }
  function disconnect() {
    clearTimeout(retryT);
    if (ws) { const w = ws; ws = null; w.onclose = null; try { w.close(); } catch (e) { /* ignorar */ } }
    pend = {};
  }
  function connect() {
    disconnect();
    if (!enabled()) { setStatus('off', ''); return; }
    setStatus('connecting', 'Conectando…');
    let w;
    try { w = new WebSocket(wsUrl()); } catch (e) { setStatus('error', 'Endereço inválido.'); return; }
    ws = w;
    w.onmessage = ev => { try { handle(JSON.parse(ev.data)); } catch (e) { /* mensagem inválida */ } };
    w.onerror = () => { if (ws === w && status !== 'on') setStatus('error', 'Não foi possível falar com o Home Assistant. Confira o endereço.'); };
    w.onclose = () => {
      if (ws !== w) return;
      last = null;
      if (retry < 0) return;
      retry = Math.min(retry + 1, 6);
      setStatus('off', 'Conexão perdida. Tentando de novo…');
      retryT = setTimeout(connect, Math.min(30000, 1000 * Math.pow(2, retry)));
    };
  }

  /* câmeras */
  const camSrc = i => (status === 'on' && cfg.map['cam:' + i]) ? Logic.camUrl(cfg.url, states[cfg.map['cam:' + i]]) : '';

  /* tela "Conexão" */
  const tok = s => Logic.slug(s).split('_').filter(t => t.length > 2 && !['luz', 'das', 'dos', 'casa'].includes(t));
  function suggest() {
    let n = 0;
    refs().forEach(r => {
      if (cfg.map[r.ref]) return;
      const toks = tok(r.name + ' ' + r.group); let best = null, bs = 0;
      Object.values(states).forEach(e => {
        if (!Logic.DOMAINS[r.k] || !Logic.DOMAINS[r.k].includes(Logic.domainOf(e.entity_id))) return;
        const et = tok(e.entity_id.split('.')[1] + ' ' + ((e.attributes && e.attributes.friendly_name) || ''));
        const sc = toks.filter(t => et.includes(t)).length;
        if (sc > bs) { bs = sc; best = e.entity_id; }
      });
      if (best) { cfg.map[r.ref] = best; n++; }
    });
    persist(); toast(n + ' vínculos sugeridos. Confira antes de usar.');
  }
  function exportBlock() {
    const r = Logic.exportHA({ groups: GROUPS, scenes: SCENES, rules: RULES, map: cfg.map });
    const w = r.warnings.length ? `<p class='note'>${r.warnings.map(esc).join('<br>')}</p>` : '';
    const box = (id, t, v) => `<label class='fld' style='width:100%'>${t}<textarea id='${id}' readonly style='width:100%;min-height:150px;font:12px monospace;color:var(--fg);background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:8px'>${esc(v)}</textarea></label><div><button class='btn small' data-a='hacopy' data-id='${id}'>Copiar</button></div>`;
    return `<div class='item'><div class='row' style='flex-direction:column;align-items:stretch;gap:10px'><b>Arquivos para o Home Assistant</b><span class='note' style='padding:0'>Cole em scripts.yaml e automations.yaml (ou use Ferramentas do desenvolvedor, YAML). Assim cenas, frases de voz, regras e horários continuam funcionando com o tablet desligado.</span>${w}${box('yamlScripts', 'scripts.yaml', r.scriptsYaml)}${box('yamlAuto', 'automations.yaml', r.automationsYaml)}</div></div>`;
  }
  function html() {
    const all = refs();
    const mapped = all.filter(r => cfg.map[r.ref]).length;
    const label = { on: 'Conectado', connecting: 'Conectando…', error: 'Erro', off: enabled() ? 'Desconectado' : 'Modo demonstração' }[status];
    const dls = Object.keys(Logic.DOMAINS).map(k => `<datalist id='dl-${k}'>${Object.keys(states).filter(e => Logic.DOMAINS[k].includes(Logic.domainOf(e))).sort().map(e => `<option value='${esc(e)}'>`).join('')}</datalist>`).join('');
    const rows = all.map(r => `<div class='item'><div class='row'><div class='info'><b>${esc(r.name)}</b><span>${esc(r.group)}</span></div><label class='fld' style='flex:0 0 250px'><input list='dl-${r.k}' data-a='hamap' data-ref='${r.ref}' value='${esc(cfg.map[r.ref] || '')}' placeholder='${(Logic.DOMAINS[r.k] || ['entidade'])[0]}.exemplo' style='width:100%'></label></div></div>`).join('');
    return `<div class='item'><div class='row' style='flex-direction:column;align-items:stretch;gap:10px'>
      <label class='fld'>Endereço do Home Assistant<input id='haUrl' type='url' style='width:100%' placeholder='http://homeassistant.local:8123' value='${esc(cfg.url)}'></label>
      <label class='fld'>Token de acesso de longa duração<input id='haTok' type='password' autocomplete='off' style='width:100%' value='${esc(cfg.token)}'></label>
      <div class='ctl'><button class='btn primary' data-a='hacon'>Conectar</button><button class='btn' data-a='hadis'>Desconectar</button><span class='pill'><span class='dot ${status}'></span> ${label}</span></div>
      <span class='note' style='padding:0'>${esc(msg)}</span></div></div>
      <div class='item'><div class='row'><div class='info'><b>Vínculos</b><span>${mapped} de ${all.length} dispositivos ligados a uma entidade</span></div><div class='ctl'><button class='btn small' data-a='hasug' ${status === 'on' ? '' : 'disabled'}>Sugerir automaticamente</button><button class='btn small' data-a='haexp'>${showExport ? 'Ocultar' : 'Exportar para o Home Assistant'}</button></div></div></div>
      ${showExport ? exportBlock() : ''}${dls}${rows}`;
  }
  function viewAct(a, t) {
    switch (a) {
      case 'hacon': cfg.url = document.getElementById('haUrl').value.trim(); cfg.token = document.getElementById('haTok').value.trim(); persist(); connect(); return true;
      case 'hadis': cfg.token = ''; persist(); disconnect(); last = null; setStatus('off', 'Desconectado. O painel voltou ao modo demonstração.'); return true;
      case 'hasug': suggest(); return true;
      case 'haexp': showExport = !showExport; return true;
      case 'hacopy': {
        const el = document.getElementById(t.dataset.id); el.select();
        (navigator.clipboard ? navigator.clipboard.writeText(el.value) : Promise.reject()).then(() => toast('Copiado'), () => { try { document.execCommand('copy'); toast('Copiado'); } catch (e) { toast('Selecione o texto e copie'); } });
        return true;
      }
      default: return false;
    }
  }
  function viewInput(a, t) {
    if (a !== 'hamap') return false;
    const v = t.value.trim();
    if (v) cfg.map[t.dataset.ref] = v; else delete cfg.map[t.dataset.ref];
    persist();
    if (status === 'on' && v && states[v]) { applyEntity(v); repaint(); }
    return true;
  }
  function start() {
    if (!enabled()) return;
    call = false; updateBanner();
    connect();
  }

  window.Bridge = { start, afterRefresh, soon, camSrc, html, viewAct, viewInput, enabled, status: () => status, _state: () => ({ cfg, states }) };
})();
