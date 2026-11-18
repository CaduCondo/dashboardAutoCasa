/* Lógica pura (sem DOM), usada pelo painel e testada em Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Logic = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- aberturas (portas e janelas) ---------- */
  const opRect = o => [Math.min(o.x0, o.x1), Math.min(o.y0, o.y1), Math.max(o.x0, o.x1), Math.max(o.y0, o.y1)];
  const opHoriz = o => { const r = opRect(o); return (r[2] - r[0]) >= (r[3] - r[1]); };

  /** Subtrai o retângulo h do retângulo r. Devolve os pedaços restantes. */
  function subRect(r, h) {
    if (h[2] <= r[0] || h[0] >= r[2] || h[3] <= r[1] || h[1] >= r[3]) return [r];
    const out = [], x0 = r[0], y0 = r[1], x1 = r[2], y1 = r[3];
    if (h[1] > y0) out.push([x0, y0, x1, Math.min(h[1], y1)]);
    if (h[3] < y1) out.push([x0, Math.max(h[3], y0), x1, y1]);
    const a = Math.max(y0, h[1]), b = Math.min(y1, h[3]);
    if (h[0] > x0) out.push([x0, a, Math.min(h[0], x1), b]);
    if (h[2] < x1) out.push([Math.max(h[2], x0), a, x1, b]);
    return out.filter(q => q[2] - q[0] > 1 && q[3] - q[1] > 1);
  }

  /** Encaixa uma abertura na parede mais próxima do ponto (px,py). Devolve [x0,y0,x1,y1] ou null. */
  function snapToWall(walls, o, px, py) {
    const r0 = opRect(o);
    const len = Math.max(24, Math.min(220, Math.max(r0[2] - r0[0], r0[3] - r0[1])));
    let best = null, bd = Infinity;
    walls.forEach(r => {
      if (Math.max(r[2] - r[0], r[3] - r[1]) < 28) return;
      const d = Math.hypot(Math.max(r[0] - px, 0, px - r[2]), Math.max(r[1] - py, 0, py - r[3]));
      if (d < bd) { bd = d; best = r; }
    });
    if (!best || bd > 45) return null;
    const r = best;
    if ((r[2] - r[0]) >= (r[3] - r[1])) {
      const L = Math.min(len, r[2] - r[0]), c = Math.max(r[0] + L / 2, Math.min(r[2] - L / 2, px));
      return [Math.round(c - L / 2), r[1], Math.round(c + L / 2), r[3]];
    }
    const L = Math.min(len, r[3] - r[1]), c = Math.max(r[1] + L / 2, Math.min(r[3] - L / 2, py));
    return [r[0], Math.round(c - L / 2), r[2], Math.round(c + L / 2)];
  }

  /* ---------- Home Assistant: entidades, serviços e estados ---------- */
  const DOMAINS = {
    toggle: ['light', 'switch', 'input_boolean', 'valve', 'fan'],
    cover: ['cover'],
    ac: ['climate'],
    heater: ['climate', 'water_heater', 'switch'],
    tv: ['media_player'],
    feeder: ['button', 'input_button', 'switch', 'script'],
    vac: ['vacuum'],
    gate: ['cover', 'switch', 'button', 'script'],
    call: ['binary_sensor', 'input_boolean', 'event'],
    cam: ['camera']
  };
  const FIELDS = { toggle: ['on'], heater: ['on', 't'], ac: ['on', 't'], tv: ['on', 'vol'], cover: ['pos'], gate: ['state'], vac: ['state'], feeder: ['fed'] };
  const domainOf = e => String(e).split('.')[0];

  /**
   * Converte uma mudança no painel em chamadas de serviço do Home Assistant.
   * change = { field, value, item }
   */
  function serviceFor(kind, entity, change) {
    const d = domainOf(entity), v = change.value, t = { entity_id: entity };
    const call = (service, data, dom) => [{ domain: dom || d, service, data: data || {}, target: t }];
    const onoff = on => {
      if (d === 'cover') return call(on ? 'open_cover' : 'close_cover');
      if (d === 'valve') return call(on ? 'open_valve' : 'close_valve');
      if (d === 'media_player' || d === 'climate' || d === 'water_heater') return call(on ? 'turn_on' : 'turn_off');
      if (d === 'button' || d === 'input_button') return on ? call('press') : [];
      if (d === 'script') return on ? call('turn_on') : [];
      return call(on ? 'turn_on' : 'turn_off', {}, d === 'input_boolean' ? 'input_boolean' : 'homeassistant');
    };
    switch (change.field) {
      case 'on':
        if (kind === 'ac' && d === 'climate' && v) return call('set_hvac_mode', { hvac_mode: 'cool' });
        return onoff(!!v);
      case 't':
        if (d === 'climate' || d === 'water_heater') return call('set_temperature', { temperature: v });
        return [];
      case 'vol': return d === 'media_player' ? call('volume_set', { volume_level: Math.max(0, Math.min(1, v / 50)) }) : [];
      case 'pos':
        if (v >= 100) return call('open_cover');
        if (v <= 0) return call('close_cover');
        return call('set_cover_position', { position: v });
      case 'state':
        if (kind === 'vac') return call(v === 'Limpando' ? 'start' : 'return_to_base');
        if (kind === 'gate') {
          if (d === 'cover') return call(v === 'Aberto' ? 'open_cover' : 'close_cover');
          return v === 'Aberto' ? onoff(true) : (d === 'switch' ? onoff(false) : []);
        }
        return [];
      case 'fed': return onoff(true);
      default: return [];
    }
  }

  /** Aplica o estado de uma entidade do Home Assistant ao item do painel. */
  function applyState(item, ent) {
    const s = ent.state, a = ent.attributes || {}, d = domainOf(ent.entity_id);
    const off = s === 'off' || s === 'unavailable' || s === 'unknown' || s === 'standby';
    switch (item.k) {
      case 'toggle': item.on = s === 'on' || s === 'open'; break;
      case 'ac': item.on = !off; if (typeof a.temperature === 'number') item.t = Math.round(a.temperature); break;
      case 'heater':
        item.on = d === 'switch' ? s === 'on' : !off;
        if (typeof a.temperature === 'number') item.t = Math.round(a.temperature);
        if (typeof a.current_temperature === 'number') item.cur = Math.round(a.current_temperature);
        break;
      case 'tv': item.on = !off; if (typeof a.volume_level === 'number') item.vol = Math.round(a.volume_level * 50); break;
      case 'cover': item.pos = typeof a.current_position === 'number' ? a.current_position : (s === 'open' ? 100 : 0); break;
      case 'gate':
        if (d === 'cover') item.state = (s === 'open' || s === 'opening') ? 'Aberto' : 'Fechado';
        else item.state = s === 'on' ? 'Aberto' : 'Fechado';
        break;
      case 'vac':
        item.state = s === 'cleaning' ? 'Limpando' : s === 'docked' ? 'Na base' : s === 'returning' ? 'Voltando' : 'Parado';
        if (typeof a.battery_level === 'number') item.bat = Math.round(a.battery_level);
        break;
      default: break;
    }
    return item;
  }

  /** Foto da câmera: usa o token da própria entidade (entity_picture) e o stream MJPEG. */
  function camUrl(base, ent) {
    if (!ent || !ent.attributes || !ent.attributes.entity_picture) return '';
    return base.replace(/\/$/, '') + ent.attributes.entity_picture.replace('/api/camera_proxy/', '/api/camera_proxy_stream/');
  }

  /* ---------- exportação para o Home Assistant (YAML) ---------- */
  function yamlScalar(v) {
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    return JSON.stringify(String(v));
  }
  function toYaml(v, ind) {
    ind = ind || 0;
    const pad = ' '.repeat(ind);
    if (Array.isArray(v)) {
      if (!v.length) return pad + '[]\n';
      return v.map(x => {
        if (x && typeof x === 'object') {
          const inner = toYaml(x, ind + 2).replace(/^ +/, '');
          return pad + '- ' + inner;
        }
        return pad + '- ' + yamlScalar(x) + '\n';
      }).join('');
    }
    if (v && typeof v === 'object') {
      return Object.keys(v).map(k => {
        const x = v[k];
        if (x && typeof x === 'object' && !(Array.isArray(x) && !x.length) && !(!Array.isArray(x) && !Object.keys(x).length)) {
          return pad + k + ':\n' + toYaml(x, ind + 2);
        }
        if (Array.isArray(x)) return pad + k + ': []\n';
        if (x && typeof x === 'object') return pad + k + ': {}\n';
        return pad + k + ': ' + yamlScalar(x) + '\n';
      }).join('');
    }
    return pad + yamlScalar(v) + '\n';
  }
  const slug = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  /** Ação de cena -> lista de chamadas de serviço, usando o mapa ref -> entity_id. */
  function actionCalls(groups, map, act) {
    const [id, x] = act.ref.split(':');
    const gid = id === 'g' ? x : id;
    const g = groups.find(q => q.id === gid);
    if (!g) return { calls: [], missing: [act.ref] };
    const idx = id === 'g' ? g.items.map((_, i) => i) : [+x];
    const calls = [], missing = [];
    idx.forEach(i => {
      const it = g.items[i], ent = map[g.id + ':' + i];
      if (!it) return;
      if (!ent) { missing.push(g.id + ':' + i); return; }
      const field = act.act === 'on' || act.act === 'off' ? 'on'
        : act.act === 'open' || act.act === 'close' ? (it.k === 'gate' ? 'state' : 'pos')
        : act.act === 'feed' ? 'fed' : 'state';
      const value = act.act === 'on' ? true : act.act === 'off' ? false
        : act.act === 'open' ? (it.k === 'gate' ? 'Aberto' : 100)
        : act.act === 'close' ? (it.k === 'gate' ? 'Fechado' : 0)
        : act.act === 'feed' ? 1 : act.act === 'clean' ? 'Limpando' : 'Na base';
      serviceFor(it.k, ent, { field, value, item: it }).forEach(c => calls.push(c));
    });
    return { calls, missing };
  }
  const svcStep = c => ({ service: c.domain + '.' + c.service, target: c.target, data: c.data });

  function exportHA(ctx) {
    const { groups, scenes, rules, map } = ctx;
    const warnings = [], scripts = {}, automations = [];
    scenes.forEach(sc => {
      const seq = [];
      sc.acts.forEach(a => {
        const r = actionCalls(groups, map, a);
        r.calls.forEach(c => seq.push(svcStep(c)));
        r.missing.forEach(m => warnings.push('Cena "' + sc.name + '": dispositivo sem vínculo (' + m + ')'));
      });
      scripts['painel_' + slug(sc.name)] = { alias: sc.name, mode: 'single', sequence: seq };
    });
    rules.forEach(r => {
      const sc = scenes.find(s => s.id === r.scene);
      if (!r.on || !sc) return;
      const action = [{ service: 'script.painel_' + slug(sc.name) }];
      let trigger = null, condition = [];
      if (r.trig === 'time') {
        trigger = [{ platform: 'time', at: r.t + ':00' }];
        if (r.d && r.d.length < 7) condition = [{ condition: 'time', weekday: r.d.map(i => WEEK[i]) }];
      } else if (r.trig === 'sunset' || r.trig === 'sunrise') trigger = [{ platform: 'sun', event: r.trig }];
      else if (r.trig === 'call' && map['call:0']) trigger = [{ platform: 'state', entity_id: map['call:0'], to: 'on' }];
      else { warnings.push('Regra "' + sc.name + '" (' + r.trig + ') precisa de um sensor que ainda não existe; não exportada.'); return; }
      const a = { alias: 'Painel: ' + sc.name + ' (' + r.trig + ')', id: 'painel_regra_' + slug(r.id), mode: 'single', trigger, action };
      if (condition.length) a.condition = condition;
      automations.push(a);
    });
    groups.forEach(g => g.items.forEach((it, i) => {
      const ent = map[g.id + ':' + i];
      (it.sch || []).filter(s => s.on).forEach((s, j) => {
        if (!ent) { warnings.push('Horário de "' + it.n + '" ignorado: dispositivo sem vínculo.'); return; }
        const act = [];
        if (it.sk === 'dur') {
          serviceFor(it.k, ent, { field: 'on', value: true, item: it }).forEach(c => act.push(svcStep(c)));
          act.push({ delay: { minutes: s.m } });
          serviceFor(it.k, ent, { field: 'on', value: false, item: it }).forEach(c => act.push(svcStep(c)));
        } else if (it.sk === 'cover') {
          serviceFor(it.k, ent, { field: 'pos', value: s.a === 'Abrir' ? 100 : 0, item: it }).forEach(c => act.push(svcStep(c)));
        } else if (it.k === 'feeder') serviceFor(it.k, ent, { field: 'fed', value: 1, item: it }).forEach(c => act.push(svcStep(c)));
        else if (it.k === 'vac') serviceFor(it.k, ent, { field: 'state', value: 'Limpando', item: it }).forEach(c => act.push(svcStep(c)));
        const a = { alias: 'Horário: ' + it.n + ' ' + s.t, id: 'painel_horario_' + slug(g.id + '_' + i + '_' + j), mode: 'single', trigger: [{ platform: 'time', at: s.t + ':00' }], action: act };
        if (s.d && s.d.length < 7) a.condition = [{ condition: 'time', weekday: s.d.map(x => WEEK[x]) }];
        automations.push(a);
      });
    }));
    return { scriptsYaml: toYaml(scripts), automationsYaml: toYaml(automations), warnings };
  }

  return { opRect, opHoriz, subRect, snapToWall, DOMAINS, FIELDS, domainOf, serviceFor, applyState, camUrl, toYaml, slug, exportHA, actionCalls };
});
