// 📅 shelly-schedule-card v18 – harmonogramy w stylu aplikacji Shelly (dane: Scheduler)
// Bez "entity": karta uniwersalna z kafelkami urządzeń i „Dodaj urządzenie”.
// Z "entity": karta jednego urządzenia.
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const LET = ['P', 'W', 'Ś', 'C', 'P', 'S', 'N'];
const SHORT = ['pn', 'wt', 'śr', 'cz', 'pt', 'so', 'nd'];
const LONG = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'];
const DOMAINS = ['switch', 'light', 'cover', 'media_player', 'fan', 'input_boolean', 'script', 'scene', 'vacuum'];
const EMOJI = { switch: '🔌', light: '💡', cover: '🪟', media_player: '📺', fan: '🌀', input_boolean: '🔘', script: '📜', scene: '🎬', vacuum: '🧹' };
const ICON = { switch: 'mdi:power-socket-eu', light: 'mdi:lightbulb', cover: 'mdi:window-shutter', media_player: 'mdi:television', fan: 'mdi:fan', input_boolean: 'mdi:toggle-switch', script: 'mdi:script-text', scene: 'mdi:palette', vacuum: 'mdi:robot-vacuum' };
const P = {
  pen: 'M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z',
  trash: 'M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z',
  clock: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z',
  up: 'M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z',
  down: 'M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z',
  x: 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z',
  power: 'M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44C5.36,6.88 4,9.28 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,9.28 18.64,6.88 16.56,5.44M13,3H11V13H13',
  plus: 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z',
  cloud: 'M19.35,10.03C18.67,6.59 15.64,4 12,4C9.11,4 6.6,5.64 5.35,8.03C2.34,8.36 0,10.9 0,14A6,6 0 0,0 6,20H19A5,5 0 0,0 24,15C24,12.36 21.95,10.22 19.35,10.03Z',
};
const svg = (d, s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><path fill="currentColor" d="${d}"/></svg>`;
const pad = (n) => String(n).padStart(2, '0');
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function daysOf(wd) {
  const w = (wd || []).map((x) => String(x).toLowerCase());
  if (w.includes('daily')) return DAYS.slice();
  if (w.includes('workday')) return DAYS.slice(0, 5);
  if (w.includes('weekend')) return ['sat', 'sun'];
  return DAYS.filter((d) => w.includes(d));
}
function daysText(sel) {
  if (sel.length === 7) return 'codziennie';
  if (sel.join() === 'mon,tue,wed,thu,fri') return 'pn–pt';
  if (sel.join() === 'sat,sun') return 'so–nd';
  return sel.map((d) => SHORT[DAYS.indexOf(d)]).join(' ');
}
const daysRange = (sel) => (sel.length === 7 ? 'Pon-Nie' : sel.map((d) => LONG[DAYS.indexOf(d)]).join(', '));
const dom = (eid) => eid.split('.')[0];
function svcFor(eid, act) {
  const d = dom(eid);
  if (d === 'cover') return act === 'on' ? 'cover.open_cover' : 'cover.close_cover';
  if (d === 'script' || d === 'scene') return `${d}.turn_on`;
  if (d === 'vacuum') return act === 'on' ? 'vacuum.start' : 'vacuum.return_to_base';
  return `${d}.${act === 'on' ? 'turn_on' : 'turn_off'}`;
}
function actLabels(eid) {
  const d = dom(eid);
  if (d === 'cover') return ['Otwórz', 'Zamknij'];
  if (d === 'script' || d === 'scene') return ['Uruchom', null];
  if (d === 'vacuum') return ['Sprzątaj', 'Do bazy'];
  return ['Włącz', 'Wyłącz'];
}

class ShellyScheduleCard extends HTMLElement {
  setConfig(config) {
    this._config = { title: 'Harmonogramy', exclude: [], shelly: [], ...config };
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    // wygląd: dom (domyślny – kolory, czcionki i zaokrąglenia z motywu HA), shelly, szklo, neon, jasny
    this.setAttribute('data-theme', config.theme || 'dom');
    this._wiz = null;
    this._pick = null;
    this._sel = config.entity || null;
    // lista na telefonie: na start wszystko zwinięte, klik rozwija, drugi klik zwija
    this._shut = !config.entity;
    this._sig = '';
  }
  getCardSize() { return 6; }
  getGridOptions() { return { columns: 'full', min_columns: 6 }; }

  set hass(hass) {
    this._hass = hass;
    const sch = this._all();
    const devs = this._devices(sch).map((e) => [e, (hass.states[e] || {}).state]);
    const syn = this._config.shelly.map((e) => ((hass.states[`sensor.${e.split('.')[1]}_harmonogramy`] || {}).last_updated));
    const sig = JSON.stringify([sch.map((i) => [i.id, i.ents, i.on, i.time, i.days, i.act, i.nm]), devs, syn]);
    if (sig !== this._sig && !this._drag) { this._sig = sig; this._render(); }
    this._fromUrl(sch);
  }

  // ?edit=switch.schedule_x w adresie (przekierowanie z listy na Głównej) otwiera edycję
  _fromUrl(sch) {
    const u = new URL(location.href);
    const id = u.searchParams.get('edit');
    if (!id) return;
    const it = sch.find((x) => x.id === id);
    if (!it) return;
    u.searchParams.delete('edit');
    history.replaceState(history.state, '', u.pathname + u.search + u.hash);
    const [hh, mm] = it.time.split(':').map(Number);
    this._sel = it.ent;
    this._shut = false;
    this._wiz = { id: it.id, ent: it.ent, ents: it.ents.slice(), step: 0, days: it.days.slice(), h: hh, m: mm, act: it.act };
    this._render();
  }

  // wszystkie harmonogramy Schedulera z jednym urządzeniem i jedną godziną (ogrzewanie pomijamy)
  _all() {
    const ex = this._config.exclude;
    return Object.values(this._hass.states)
      .filter((s) => s.entity_id.startsWith('switch.') && Array.isArray(s.attributes.entities) && Array.isArray(s.attributes.timeslots))
      .map((s) => {
        const svc = ((s.attributes.actions || [])[0] || {}).service || '';
        return {
          id: s.entity_id,
          nm: String(s.attributes.friendly_name || s.entity_id).replace(/^Harmonogram /, ''),
          next: s.attributes.next_trigger || null,
          ent: s.attributes.entities[0],
          ents: s.attributes.entities.slice(),
          // jedna godzina; może być kilka urządzeń (np. Kuba i Tomek razem o 23:00)
          multi: s.attributes.timeslots.length > 1 || !s.attributes.entities.every((x) => DOMAINS.includes(dom(x))),
          on: s.state !== 'off',
          time: String(s.attributes.timeslots[0] || '00:00').slice(0, 5),
          days: daysOf(s.attributes.weekdays),
          act: /(turn_on|open_cover|start)$/.test(svc) ? 'on' : 'off',
        };
      })
      .filter((i) => i.ent && !i.multi && DOMAINS.includes(dom(i.ent)) && !i.ents.some((x) => ex.includes(x)))
      .sort((a, b) => a.time.localeCompare(b.time));
  }
  _devices(sch) {
    if (this._config.entity) return [this._config.entity];
    const list = [...new Set(sch.flatMap((i) => i.ents))];
    if (this._pendingDev && !list.includes(this._pendingDev)) list.push(this._pendingDev);
    const ord = this._config.order || [];
    const ix = (e) => (ord.includes(e) ? ord.indexOf(e) : 1e6);
    return list.sort((a, b) => ix(a) - ix(b) || this._fname(a).localeCompare(this._fname(b), 'pl'));
  }
  _fname(eid) {
    if (this._config.entity && this._config.name) return this._config.name;
    const s = this._hass.states[eid];
    return (s && s.attributes.friendly_name) || eid;
  }
  _area(eid) {
    const h = this._hass;
    const e = h.entities && h.entities[eid];
    let a = e && e.area_id;
    if (!a && e && e.device_id && h.devices && h.devices[e.device_id]) a = h.devices[e.device_id].area_id;
    return (a && h.areas && h.areas[a] && h.areas[a].name) || '';
  }
  _icon(eid) {
    const s = this._hass.states[eid];
    return (s && s.attributes.icon) || ICON[dom(eid)] || 'mdi:calendar-clock';
  }
  _name(w) {
    // krótko, bez emotek, żeby mieściło się w liście (jak „Dni Robocze”)
    const labs = actLabels(w.ent);
    const lab = labs[0] === 'Włącz' ? (w.act === 'on' ? 'wł' : 'wył') : (labs[w.act === 'on' ? 0 : 1] || labs[0]);
    const ile = w.ents.length > 1 ? ` +${w.ents.length - 1}` : '';
    return `${this._fname(w.ent)}${ile} ${pad(w.h)}:${pad(w.m)} ${lab}`;
  }

  _render() {
    const sch = this._all();
    const devs = this._devices(sch);
    if (!this._sel || !devs.includes(this._sel)) this._sel = devs[0] || null;
    const single = !!this._config.entity;
    if (this._config.mode === 'list') return this._renderList(sch);
    if (this._config.mode === 'popup') return this._renderPopup();
    // kafelki dookoła: urządzenia na przemian lewa / prawa kolumna,
    // „Dodaj urządzenie” w wolnym miejscu pod ostatnim urządzeniem (prawa kolumna jest zawsze krótsza lub równa)
    const all = devs.map((e) => this._tileHtml(e, sch));
    const add = `<div class="tile addt" data-act="pick"><div class="pic plus">${svg(P.plus, 34)}</div><div class="tn">Dodaj urządzenie</div><div class="ta">z harmonogramem</div></div>`;
    // układ: srodek (kafelki po obu stronach), boki (kafelki z lewej), gora (kafelki nad harmonogramami)
    const lay = this._config.layout || 'srodek';
    const left = lay === 'srodek' ? all.filter((_, k) => k % 2 === 0).join('') : all.join('') + add;
    const right = lay === 'srodek' ? all.filter((_, k) => k % 2 === 1).join('') + add : '';
    const panel = this._sel ? this._panelHtml(this._sel, sch.filter((i) => i.ents.includes(this._sel))) : '<div class="empty">Dodaj pierwsze urządzenie przyciskiem ＋</div>';
    this.shadowRoot.innerHTML = `<style>${CSS}</style>
      <ha-card class="${single ? 'one' : ''} m-${this._config.maly || 'kafelki'}">
        ${single ? '' : `<div class="ct"><ha-icon icon="mdi:calendar-clock"></ha-icon>${esc(this._config.title)}</div>`}
        ${this._config.maly === 'uniwersalny' && !single && this._size() !== 'w' ? (this._size() === 'n' ? this._listaHtml(devs, sch, panel) : `<div class="lay2"><div class="side">${this._listaHtml(devs, sch, '', true)}</div><div class="panel">${panel}</div></div>`) : this._narrow() && this._config.maly === 'lista' && !single ? this._listaHtml(devs, sch, panel) : `<div class="lay ${single ? 'one' : lay}">${single ? '' : `<div class="tiles l">${left}</div>`}${this._narrow() && this._config.maly === 'pasek' && !single ? `<div class="strip">${devs.map((e) => this._chipDev(e, sch)).join('')}<div class="sd addt" data-act="pick"><div class="pic plus">${svg(P.plus, 26)}</div><div class="tn">Dodaj</div></div></div>` : ''}<div class="panel">${panel}</div>${single || lay !== 'srodek' ? '' : `<div class="tiles r">${right}</div>`}</div>`}
      </ha-card>
      ${this._wiz ? this._wizHtml() : ''}${this._pick ? this._pickHtml() : ''}`;
    this.shadowRoot.querySelectorAll('[data-act]').forEach((el) => {
      el.addEventListener(el.tagName === 'INPUT' ? (el.type === 'search' ? 'input' : 'change') : 'click', (e) => { e.stopPropagation(); this._on(e, el); });
    });
    const q = this.shadowRoot.querySelector('input[type=search]');
    if (q && this._pick) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
    this._dragInit();
  }

  // przytrzymaj wiersz urządzenia ~0,5 s i przeciągnij w górę/dół = zmiana kolejności (zapis w ustawieniach panelu)
  _dragInit() {
    const box = this.shadowRoot.querySelector('.lista');
    if (!box) return;
    if (!this._tmBound) {
      this._tmBound = true;
      // gdy trwa przeciąganie, strona nie przewija się pod palcem
      this.addEventListener('touchmove', (ev) => { if (this._drag) { ev.preventDefault(); this._drag.move(ev.touches[0]); } }, { passive: false });
      this.addEventListener('touchend', () => { if (this._drag) this._drag.end(); });
      this.addEventListener('contextmenu', (ev) => { if (this._drag || this._hold) ev.preventDefault(); });
    }
    box.querySelectorAll('.lrow[data-e]').forEach((row) => {
      row.addEventListener('pointerdown', (ev) => {
        if (ev.button > 0 || ev.target.closest('.pw')) return;
        const y0 = ev.clientY, x0 = ev.clientX;
        const cancel = () => { clearTimeout(this._hold); this._hold = null; row.removeEventListener('pointermove', early); };
        const early = (m) => { if (Math.abs(m.clientY - y0) > 8 || Math.abs(m.clientX - x0) > 8) cancel(); };
        row.addEventListener('pointermove', early);
        row.addEventListener('pointerup', cancel, { once: true });
        row.addEventListener('pointercancel', cancel, { once: true });
        this._hold = setTimeout(() => { cancel(); this._dragStart(row, ev.pointerId, y0); }, 450);
      });
    });
  }
  _dragStart(row, pid, y0) {
    const box = row.parentNode;
    if (navigator.vibrate) navigator.vibrate(30);
    box.classList.add('sorting');
    row.classList.add('drag');
    try { row.setPointerCapture(pid); } catch (e) { /* bez przechwycenia też działa */ }
    const sib = (el, dir) => { let x = el[dir]; while (x && !x.matches('.lrow[data-e]')) x = x[dir]; return x; };
    const off = y0 - row.getBoundingClientRect().top;
    const move = (ev) => {
      row.style.transform = '';
      const next = sib(row, 'nextElementSibling'), prev = sib(row, 'previousElementSibling');
      const top = ev.clientY - off, h = row.offsetHeight;
      if (next && top + h / 2 > next.getBoundingClientRect().top + next.offsetHeight / 2) box.insertBefore(next, row);
      else if (prev && top + h / 2 < prev.getBoundingClientRect().top + prev.offsetHeight / 2) box.insertBefore(row, prev);
      row.style.transform = `translateY(${top - row.getBoundingClientRect().top}px)`;
    };
    const end = () => {
      if (!this._drag) return;
      row.removeEventListener('pointermove', move);
      row.removeEventListener('pointerup', end);
      const order = [...box.querySelectorAll('.lrow[data-e]')].map((x) => x.dataset.e);
      this._drag = null;
      this._noClick = Date.now();
      this._saveOrder(order);
    };
    // palec: touchmove/touchend (na telefonie przeglądarka może przerwać zdarzenia pointer), mysz: pointermove/pointerup
    this._drag = { row, move, end };
    row.addEventListener('pointermove', move);
    row.addEventListener('pointerup', end);
  }
  async _saveOrder(order) {
    const old = this._devices(this._all());
    this._config = { ...this._config, order };
    this._sig = '';
    this._render();
    if (old.join() === order.join()) return;
    // zapis do ustawień tego panelu, żeby kolejność była taka sama na telefonie i na PC
    try {
      const url = location.pathname.split('/')[1];
      const req = { type: 'lovelace/config' };
      if (url && url !== 'lovelace') req.url_path = url;
      const cfg = await this._hass.callWS(req);
      let hit = 0;
      const walk = (o) => {
        if (Array.isArray(o)) return o.forEach(walk);
        if (!o || typeof o !== 'object') return;
        if (o.type === 'custom:shelly-schedule-card' && !o.entity && !o.mode) { o.order = order; hit++; }
        Object.values(o).forEach(walk);
      };
      walk(cfg);
      if (!hit) return;
      await this._hass.callWS({ ...req, type: 'lovelace/config/save', config: cfg });
    } catch (err) {
      alert('Nie udało się zapisać kolejności: ' + (err.message || err));
    }
  }

  // wąski ekran (telefon); karta przerysowuje się przy zmianie szerokości
  _narrow() {
    if (!this._mq) {
      this._mq = window.matchMedia('(max-width:560px)');
      this._mq.addEventListener('change', () => this._render());
    }
    return this._mq.matches;
  }
  // układ uniwersalny: liczy się szerokość karty, nie ekranu (pasek boczny HA, okno obok okna)
  _size() {
    if (!this._ro) {
      this._ro = new ResizeObserver(() => {
        const w = this.getBoundingClientRect().width;
        const sz = w < 600 ? 'n' : w < 800 ? 'm' : 'w';
        if (sz !== this._sz) { this._sz = sz; this._render(); }
      });
      this._ro.observe(this);
      const w = this.getBoundingClientRect().width || window.innerWidth;
      this._sz = w < 600 ? 'n' : w < 800 ? 'm' : 'w';
    }
    return this._sz;
  }
  // telefon, wariant „pasek”: małe okrągłe urządzenia w jednym przewijanym rzędzie
  _chipDev(e, sch) {
    const s = this._hass.states[e];
    const on = s && ['on', 'open', 'playing', 'cleaning'].includes(s.state);
    const n = sch.filter((i) => i.ents.includes(e)).length;
    return `<div class="sd ${e === this._sel ? 'cur' : ''}" data-act="sel" data-e="${e}"><div class="pic ${on ? 'lit' : ''}"><ha-icon icon="${this._icon(e)}"></ha-icon>${n ? `<b class="cnt">${n}</b>` : ''}</div><div class="tn">${esc(this._fname(e))}</div></div>`;
  }
  // telefon, wariant „lista”: wiersze urządzeń, wybrane rozwija harmonogramy pod sobą
  _listaHtml(devs, sch, panel, side) {
    const rows = devs.map((e) => {
      const s = this._hass.states[e];
      const st = s ? s.state : 'unavailable';
      const on = ['on', 'open', 'playing', 'cleaning'].includes(st);
      const n = sch.filter((i) => i.ents.includes(e)).length;
      const cur = e === this._sel && (side || !this._shut);
      const sync = this._config.shelly.includes(e);
      return `<div class="lrow ${cur ? 'cur' : ''}" data-act="sel" data-e="${e}">
        <div class="pic ${on ? 'lit' : ''}"><ha-icon icon="${this._icon(e)}"></ha-icon></div>
        <div class="lx"><div class="tn">${esc(this._fname(e))}</div><div class="ta">${esc(this._area(e))}${this._area(e) ? ' · ' : ''}${n} ${n === 1 ? 'harmonogram' : n < 5 && n ? 'harmonogramy' : 'harmonogramów'}${sync ? ' · <span class="mqt">Shelly</span>' : ''}</div></div>
        ${['script', 'scene'].includes(dom(e)) ? '' : `<button class="pw ${on ? 'on' : ''} ${st === 'unavailable' ? 'na' : ''}" data-act="power" data-e="${e}">${svg(P.power, 22)}</button>`}
        <svg class="chev ${cur ? 'up' : ''}" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/></svg>
      </div>${cur && !side ? `<div class="panel inl">${panel}</div>` : ''}`;
    }).join('');
    return `<div class="lista">${rows}<div class="lrow addt" data-act="pick"><div class="pic plus">${svg(P.plus, 26)}</div><div class="lx"><div class="tn">Dodaj urządzenie</div></div></div></div>`;
  }

  // wygląd listy jak stara karta Schedulera; klik w wiersz otwiera okno Shelly
  _rel(iso, on) {
    if (!on) return 'wyłączony';
    if (!iso) return '';
    const d = new Date(iso), now = new Date(), min = Math.round((d - now) / 60000);
    if (min < 60) return `za ${Math.max(min, 1)} min`;
    const t = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const day = Math.floor((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
    if (day === 0) return `dziś o ${t}`;
    if (day === 1) return `jutro o ${t}`;
    return `${['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'][d.getDay()]} o ${t}`;
  }
  // samo okno edycji (otwierane zamiast starego okienka Schedulera)
  _renderPopup() {
    const e = this._popEnt;
    const box = e ? `<div class="ov"><div class="dlg pop"><div class="dh"><div></div><button class="x" data-act="pop-close">${svg(P.x, 28)}</button></div>
      ${this._panelHtml(e, this._all().filter((i) => i.id === this._popId), true)}</div></div>` : '';
    this.shadowRoot.innerHTML = `<style>${CSS}</style>${box}${this._wiz ? this._wizHtml() : ''}${this._pick ? this._pickHtml() : ''}`;
    this.shadowRoot.querySelectorAll('[data-act]').forEach((el) => {
      el.addEventListener(el.tagName === 'INPUT' ? (el.type === 'search' ? 'input' : 'change') : 'click', (e) => { e.stopPropagation(); this._on(e, el); });
    });
  }
  // okno urządzenia: lista jego harmonogramów (ołówek, kosz, Dodaj harmonogram)
  openEdit(id) {
    const it = this._all().find((x) => x.id === id);
    if (!it) return false;
    this._popEnt = it.ent;
    this._popId = it.id;
    this._sel = it.ent;
    this._wiz = null;
    this._render();
    return true;
  }
  _renderList(sch) {
    const rows = sch.map((i) => `<div class="lr" data-act="edit" data-id="${i.id}">
        <ha-icon class="li ${i.act}" icon="${this._icon(i.ent)}"></ha-icon>
        <div class="lt ${i.on ? '' : 'dim'}"><div class="ln">${esc(i.nm)}</div><div class="ls">${this._rel(i.next, i.on)}</div></div>
        <label class="sw" data-act="stop"><input type="checkbox" data-act="toggle" data-id="${i.id}" ${i.on ? 'checked' : ''}><span></span></label>
      </div>`).join('');
    this.shadowRoot.innerHTML = `<style>${CSS}</style>
      <ha-card class="list"><div class="lh">${esc(this._config.title)}</div>
        ${rows || '<div class="empty">Brak harmonogramów</div>'}
        <div class="lf"><button class="lb" data-act="pick">Utwórz</button></div></ha-card>
      ${this._wiz ? this._wizHtml() : ''}${this._pick ? this._pickHtml() : ''}`;
    this.shadowRoot.querySelectorAll('[data-act]').forEach((el) => {
      el.addEventListener(el.tagName === 'INPUT' ? (el.type === 'search' ? 'input' : 'change') : 'click', (e) => { e.stopPropagation(); this._on(e, el); });
    });
    const q = this.shadowRoot.querySelector('input[type=search]');
    if (q && this._pick) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
  }

  _tileHtml(e, sch) {
    const s = this._hass.states[e];
    const st = s ? s.state : 'unavailable';
    const on = ['on', 'open', 'playing', 'cleaning'].includes(st);
    const n = sch.filter((i) => i.ents.includes(e)).length;
    const sync = this._config.shelly.includes(e);
    return `<div class="tile ${e === this._sel ? 'cur' : ''}" data-act="sel" data-e="${e}">
      <div class="tag ${sync ? 'mq' : 'ha'}">${sync ? '<ha-icon icon="mdi:cloud-sync"></ha-icon> Shelly · MQTT' : '<ha-icon icon="mdi:home-assistant"></ha-icon> tylko HA'}</div>
      <div class="pic ${on ? 'lit' : ''}"><ha-icon icon="${this._icon(e)}"></ha-icon></div>
      <div class="tn">${esc(this._fname(e))}</div><div class="ta">${esc(this._area(e)) || '&nbsp;'}</div>
      <div class="tc">${n ? `<ha-icon icon="mdi:calendar-clock"></ha-icon> ${n} ${n === 1 ? 'harmonogram' : n < 5 ? 'harmonogramy' : 'harmonogramów'}` : 'brak harmonogramów'}</div>
      ${['script', 'scene'].includes(dom(e)) ? '' : `<button class="pw ${on ? 'on' : ''} ${st === 'unavailable' ? 'na' : ''}" data-act="power" data-e="${e}" title="Włącz / wyłącz">${svg(P.power, 26)}</button>`}
    </div>`;
  }

  _panelHtml(e, items, one) {
    const dev = this._hass.states[e];
    const offline = !dev || ['unavailable', 'unknown'].includes(dev.state);
    const labs = actLabels(e);
    const rows = items.map((i) => `
      <div class="row" data-id="${i.id}">
        <div class="tog"><label class="sw"><input type="checkbox" data-act="toggle" data-id="${i.id}" ${i.on ? 'checked' : ''}><span></span></label></div>
        <div class="mid ${i.on ? '' : 'dim'}">
          <div class="days">${DAYS.map((d, k) => `<b class="${i.days.includes(d) ? 'g' : ''}">${LET[k]}</b>`).join('')}</div>
          ${i.ents.length > 1 ? `<div class="with"><ha-icon icon="mdi:link-variant"></ha-icon>razem z: ${i.ents.filter((x) => x !== e).map((x) => esc(this._fname(x))).join(', ')}</div>` : ''}
          <div class="pill"><span>${svg(P.clock, 20)} ${i.time}</span><span class="a"><i class="mini ${i.act}"></i> ${i.act === 'on' ? (labs[0] === 'Włącz' ? 'Wł' : labs[0]) : (labs[1] === 'Wyłącz' ? 'Wył' : labs[1])}</span></div>
        </div>
        <div class="btns">
          <button class="b blue" data-act="edit" data-id="${i.id}" title="Edytuj">${svg(P.pen)}</button>
          <button class="b red" data-act="del" data-id="${i.id}" title="Usuń">${svg(P.trash)}</button>
        </div>
      </div>`).join('');
    const lit = dev && ['on', 'open', 'playing', 'cleaning'].includes(dev.state);
    const stTxt = offline ? '<span class="off">offline</span>' : (lit ? (dom(e) === 'cover' ? 'otwarte' : 'włączone') : (dom(e) === 'cover' ? 'zamknięte' : 'wyłączone'));
    return `<div class="hdr"><div class="hero d-${dom(e)} ${lit ? 'lit' : ''} ${offline ? 'na' : ''}"><ha-icon icon="${this._icon(e)}"></ha-icon></div>
        <div class="ttl">${esc(this._fname(e))}</div>
        <div class="sub">${esc(this._area(e))}${this._area(e) ? ' · ' : ''}${stTxt}</div>
        ${this._howHtml(e)}</div>
      ${rows ? `<div class="rows">${rows}</div>` : '<div class="empty">Brak harmonogramów – dodaj pierwszy</div>'}
      ${one ? '' : `<button class="add" data-act="add" data-e="${e}">Dodaj harmonogram</button>`}`;
  }

  // stan synchronizacji z gniazdkiem Shelly (sensor <encja>_harmonogramy z listą zadań z gniazdka)
  _sync(e) {
    const sen = this._hass.states[`sensor.${e.split('.')[1]}_harmonogramy`];
    const dev = this._hass.states[e];
    if (!dev || ['unavailable', 'unknown'].includes(dev.state)) return { k: 'na', t: 'gniazdko offline' };
    if (!sen) return { k: 'wait', t: 'brak danych z gniazdka' };
    const m = { 0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat', 7: 'sun' };
    const sh = (sen.attributes.jobs || []).filter((j) => j.calls && j.calls[0] && j.calls[0].method === 'Switch.Set').map((j) => {
      const p = j.timespec.split(' ');
      let d = (p[5] || '*').toLowerCase();
      d = ['*', '?'].includes(d) ? DAYS.slice() : d.split(',').map((x) => m[x] || x);
      return `${pad(+p[2])}:${pad(+p[1])}|${j.calls[0].params.on ? 'on' : 'off'}|${DAYS.filter((x) => d.includes(x)).join()}|${j.enable ? 1 : 0}`;
    }).sort();
    const ha = this._all().filter((i) => i.ents.includes(e)).map((i) => `${i.time}|${i.act}|${i.days.join()}|${i.on ? 1 : 0}`).sort();
    const d = new Date(sen.last_updated);
    const kiedy = `${pad(d.getDate())}.${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return sh.join() === ha.join() ? { k: 'ok', t: `zsynchronizowane · ${kiedy}` } : { k: 'wait', t: 'synchronizuję…' };
  }
  // opis, kto wykonuje harmonogram: ramka (stara), plakietka (krótko + „i” rozwija), linia (jedna szara linijka)
  _howHtml(e) {
    const sh = this._config.shelly.includes(e);
    const v = this._config.opis || 'ramka';
    const long = sh ? 'Zapisane w gniazdku i widoczne w aplikacji Shelly. Zmiany w obie strony. Działa też bez Home Assistanta.'
      : 'Nie ma tego w aplikacji producenta. Działa, gdy Home Assistant jest włączony.';
    const sy = sh ? this._sync(e) : null;
    // brak: bez opisu; przy gniazdku Shelly tylko mały stan synchronizacji
    if (v === 'brak') return sy ? `<div class="chips"><span class="chip st sy-${sy.k}"><i class="dot"></i>${sy.t}</span></div>` : '';
    if (v === 'ramka') return sh
      ? `<div class="how mq"><ha-icon icon="mdi:cloud-sync"></ha-icon><div><b>W gniazdku Shelly (MQTT)</b><br>${long}</div></div>`
      : `<div class="how ha"><ha-icon icon="mdi:home-assistant"></ha-icon><div><b>Wykonuje Home Assistant</b><br>${long}</div></div>`;
    if (v === 'linia') return `<div class="hline ${sh ? 'mq' : 'ha'}"><ha-icon icon="${sh ? 'mdi:cloud-sync' : 'mdi:home-assistant'}"></ha-icon>${sh ? 'w gniazdku Shelly · działa bez HA' : 'wykonuje Home Assistant'}${sy ? ` · <span class="sy-${sy.k}">${sy.t}</span>` : ''}</div>`;
    const open = this._info === e;
    return `<div class="chips"><span class="chip ${sh ? 'mq' : 'ha'}"><ha-icon icon="${sh ? 'mdi:cloud-sync' : 'mdi:home-assistant'}"></ha-icon>${sh ? 'W gniazdku Shelly' : 'Wykonuje HA'}</span>
      ${sy ? `<span class="chip st sy-${sy.k}"><i class="dot"></i>${sy.t}</span>` : ''}
      <button class="chip info ${open ? 'on' : ''}" data-act="info" data-e="${e}" title="Co to znaczy?"><ha-icon icon="mdi:information-outline"></ha-icon></button></div>
      ${open ? `<div class="infotxt">${long}</div>` : ''}`;
  }

  _candidates() {
    const ex = this._config.exclude;
    const q = (this._pick.q || '').toLowerCase();
    return Object.values(this._hass.states)
      .filter((s) => DOMAINS.includes(dom(s.entity_id)) && !s.entity_id.startsWith('switch.schedule_') && !ex.includes(s.entity_id) && !(s.attributes.entities && s.attributes.timeslots))
      .filter((s) => !q || `${s.attributes.friendly_name || ''} ${s.entity_id} ${this._area(s.entity_id)}`.toLowerCase().includes(q))
      .sort((a, b) => String(a.attributes.friendly_name || a.entity_id).localeCompare(String(b.attributes.friendly_name || b.entity_id), 'pl'))
      ;
  }
  _pickHtml() {
    const list = this._candidates().map((s) => `<div class="pi" data-act="picked" data-e="${s.entity_id}">
      <ha-icon icon="${this._icon(s.entity_id)}"></ha-icon><div><div class="pn">${esc(s.attributes.friendly_name || s.entity_id)}</div>
      <div class="pa">${esc(this._area(s.entity_id))}${this._area(s.entity_id) ? ' · ' : ''}${s.entity_id}</div></div></div>`).join('');
    return `<div class="ov"><div class="dlg">
      <div class="dh"><div class="dt">Dodaj urządzenie</div><button class="x" data-act="pclose">${svg(P.x, 28)}</button></div>
      <input type="search" class="q" data-act="q" placeholder="Szukaj: nazwa, pokój…" value="${esc(this._pick.q || '')}">
      <div class="plist">${list || '<div class="empty">Nic nie znaleziono</div>'}</div></div></div>`;
  }

  _on(e, el) {
    const act = el.dataset.act;
    const h = this._hass;
    const it = el.dataset.id && this._all().find((x) => x.id === el.dataset.id);
    if (act === 'stop') return;
    if (act === 'pop-close') { this._popEnt = null; this._popId = null; this._wiz = null; return this._render(); }
    if (act === 'info') { this._info = this._info === el.dataset.e ? null : el.dataset.e; return this._render(); }
    if (act === 'sel') {
      if (this._noClick && Date.now() - this._noClick < 400) return;
      if (this._sel === el.dataset.e) this._shut = !this._shut;
      else { this._sel = el.dataset.e; this._shut = false; }
      return this._render();
    }
    if (act === 'power') {
      const eid = el.dataset.e;
      return dom(eid) === 'cover' ? h.callService('cover', 'toggle', { entity_id: eid }) : h.callService('homeassistant', 'toggle', { entity_id: eid });
    }
    if (act === 'toggle') return h.callService('switch', el.checked ? 'turn_on' : 'turn_off', { entity_id: it.id });
    if (act === 'del') {
      if (confirm(`Usunąć harmonogram ${it.time}?`)) {
        h.callService('scheduler', 'remove', { entity_id: it.id });
        if (this._popId === it.id) { this._popEnt = null; this._popId = null; this._render(); }
      }
      return;
    }
    if (act === 'pick') { this._pick = { q: '' }; return this._render(); }
    if (act === 'pclose') { this._pick = null; return this._render(); }
    if (act === 'q') { this._pick.q = el.value; return this._render(); }
    if (act === 'picked') {
      const ent = el.dataset.e;
      if (this._pick.multi && this._wiz) { this._pick = null; if (!this._wiz.ents.includes(ent)) this._wiz.ents.push(ent); return this._render(); }
      this._pick = null; this._pendingDev = ent; this._sel = ent; this._shut = false;
      if (this._wiz) { this._wiz.ents = [ent]; this._wiz.ent = ent; if (!actLabels(ent)[1]) this._wiz.act = 'on'; return this._render(); }
      return this._newWiz(ent);
    }
    if (act === 'adddev') { this._pick = { q: '', multi: true }; return this._render(); }
    if (act === 'rmdev') { const w = this._wiz; w.ents = w.ents.filter((x) => x !== el.dataset.e); w.ent = w.ents[0]; return this._render(); }
    if (act === 'chdev') { this._pick = { q: '' }; return this._render(); }
    if (act === 'add') return this._newWiz(el.dataset.e);
    if (act === 'edit') {
      const [hh, mm] = it.time.split(':').map(Number);
      this._wiz = { id: it.id, ent: it.ent, ents: it.ents.slice(), step: 0, days: it.days.slice(), h: hh, m: mm, act: it.act };
      return this._render();
    }
    const w = this._wiz;
    if (!w) return;
    if (act === 'close') { this._wiz = null; this._pendingDev = null; return this._render(); }
    if (act === 'tab') w.step = Number(el.dataset.n);
    if (act === 'day') { const d = el.dataset.d; w.days = w.days.includes(d) ? w.days.filter((x) => x !== d) : DAYS.filter((x) => x === d || w.days.includes(x)); }
    if (act === 'hu') w.h = (w.h + 1) % 24;
    if (act === 'hd') w.h = (w.h + 23) % 24;
    if (act === 'mu') w.m = (w.m + 1) % 60;
    if (act === 'md') w.m = (w.m + 59) % 60;
    if (act === 'hset') w.h = Math.min(23, Math.max(0, parseInt(el.value, 10) || 0));
    if (act === 'mset') w.m = Math.min(59, Math.max(0, parseInt(el.value, 10) || 0));
    if (act === 'act') w.act = el.dataset.v;
    if (act === 'next') w.step = Math.min(3, w.step + 1);
    if (act === 'back') w.step = Math.max(0, w.step - 1);
    if (act === 'save') return this._save();
    this._render();
  }

  _newWiz(ent) {
    const now = new Date();
    this._wiz = { id: null, ent, ents: [ent], step: 0, days: DAYS.slice(), h: now.getHours(), m: 0, act: actLabels(ent)[1] ? 'off' : 'on' };
    this._render();
  }

  async _save() {
    const w = this._wiz;
    if (!w.days.length) return;
    const data = {
      name: this._name(w),
      weekdays: w.days.length === 7 ? ['daily'] : w.days,
      timeslots: [{ start: `${pad(w.h)}:${pad(w.m)}:00`, actions: w.ents.map((x) => ({ service: svcFor(x, w.act), entity_id: x })) }],
    };
    try {
      if (w.id) await this._hass.callService('scheduler', 'edit', { entity_id: w.id, ...data });
      else await this._hass.callService('scheduler', 'add', { repeat_type: 'repeat', ...data });
      this._wiz = null;
      this._pendingDev = null;
      this._sel = w.ent;
      this._shut = false;
      this._render();
    } catch (err) {
      alert('Nie udało się zapisać: ' + (err.message || err));
    }
  }

  _wizHtml() {
    const w = this._wiz;
    const labs = actLabels(w.ent);
    const lab = (w.act === 'on' ? labs[0] : labs[1]) || labs[0];
    const tabs = ['Dni tygodnia', 'Czas', 'Działanie', 'Zapowiedź'];
    let body = '';
    if (w.step === 0) {
      body = `<div class="lbl">Wybierz Dzień Tygodnia</div>
        <div class="dgrid">${DAYS.map((d, k) => `<div class="dc" data-act="day" data-d="${d}"><span>${LET[k]}</span><i class="chk ${w.days.includes(d) ? 'on' : ''}"></i></div>`).join('')}</div>
        <div class="note">Wykonaj harmonogram w ${w.days.length ? `<em>${daysRange(w.days)}</em>` : '<em class="bad">wybierz co najmniej jeden dzień</em>'};</div>`;
    } else if (w.step === 1) {
      body = `<div class="lbl">Wybierz godzinę <span class="hint">(strzałki albo kliknij w liczbę i wpisz)</span></div>
        <div class="tp"><div class="col"><button class="ar" data-act="hu">${svg(P.up)}</button><input class="num" inputmode="numeric" data-act="hset" value="${pad(w.h)}"><button class="ar" data-act="hd">${svg(P.down)}</button></div>
        <div class="colon">:</div>
        <div class="col"><button class="ar" data-act="mu">${svg(P.up)}</button><input class="num" inputmode="numeric" data-act="mset" value="${pad(w.m)}"><button class="ar" data-act="md">${svg(P.down)}</button></div></div>`;
    } else if (w.step === 2) {
      body = `<div class="lbl">Urządzenia w tym harmonogramie</div>
        <div class="devs">${w.ents.map((x) => `<span class="dchip"><ha-icon icon="${this._icon(x)}"></ha-icon>${esc(this._fname(x))}${w.ents.length > 1 ? `<button data-act="rmdev" data-e="${x}" title="Usuń z harmonogramu">${svg(P.x, 16)}</button>` : ''}</span>`).join('')}
        ${this._config.entity ? '' : '<button class="dchip more" data-act="adddev">＋ dodaj kolejne urządzenie</button>'}</div>
        <div class="lbl">Co zrobić o ${pad(w.h)}:${pad(w.m)}</div>
        <div class="acts"><button class="opt ${w.act === 'on' ? 'sel' : ''}" data-act="act" data-v="on"><i class="mini on"></i> ${labs[0]}</button>
        ${labs[1] ? `<button class="opt ${w.act === 'off' ? 'sel' : ''}" data-act="act" data-v="off"><i class="mini off"></i> ${labs[1]}</button>` : ''}</div>`;
    } else {
      body = `<div class="sec"><div class="lbl">Dni</div>Wykonaj harmonogram w <em>${daysRange(w.days) || '–'}</em>;</div>
        <div class="sec"><div class="lbl">Czas</div>Realizacja harmonogramu o godz <em>${pad(w.h)}:${pad(w.m)}:00</em>;</div>
        <div class="sec"><div class="lbl">Akcja</div>${w.ents.map((x) => esc(this._fname(x))).join(', ')}: <em>${lab}</em></div>
        ${w.days.length ? '' : '<div class="err">Nie można zapisać harmonogramu bez dni!</div>'}`;
    }
    const nav = `${w.step > 0 ? '<button class="nb ghost" data-act="back">‹ Wstecz</button>' : ''}
      ${w.step < 3 ? `<button class="nb" data-act="next" ${w.step === 0 && !w.days.length ? 'disabled' : ''}>Następny ›</button>` : `<button class="nb" data-act="save" ${w.days.length ? '' : 'disabled'}>Zapisz</button>`}`;
    return `<div class="ov"><div class="dlg">
      <div class="dh"><div class="dt">${w.id ? 'Edytuj harmonogram' : 'Utwórz harmonogram'}</div><button class="x" data-act="close">${svg(P.x, 28)}</button></div>
      <div class="dev"><ha-icon icon="${this._icon(w.ent)}"></ha-icon> ${w.ents.map((x) => esc(this._fname(x))).join(' + ')}</div>
      <div class="tabs">${tabs.map((t, k) => `<div class="tab ${k === w.step ? 'cur' : ''}" data-act="tab" data-n="${k}">${t}<i></i></div>`).join('')}</div>
      <div class="body">${body}</div><div class="nav">${nav}</div></div></div>`;
  }
}

const CSS = `
:host{display:block;--sb:#1e88e5;--sg:#5fd38d;--sr:#f44336;--bg2:#2b2d31;--bg3:#1f2023}
ha-card{background:#111214;color:#fff;padding:16px;border-radius:16px;font-family:inherit}
.ct{font-size:24px;font-weight:700;margin:2px 4px 14px;display:flex;align-items:center;gap:10px;--mdc-icon-size:28px}.ct ha-icon{color:#42a5f5}
.tag ha-icon,.tc ha-icon{--mdc-icon-size:14px}.tc{display:flex;gap:4px;align-items:center;justify-content:center}
.how{display:flex;gap:10px;align-items:flex-start}.how ha-icon{--mdc-icon-size:22px;flex:none}.how.mq ha-icon{color:#42a5f5}.how.ha ha-icon{color:#18bcf2}
.hero{width:96px;height:96px;margin:4px auto 10px;border-radius:50%;display:flex;align-items:center;justify-content:center;--mdc-icon-size:54px;color:#9aa0a6;background:radial-gradient(circle at 50% 40%,#2b2d31,#1a1b1e);border:3px solid #33353a;transition:.2s}
.hero.lit{color:#ffd54f;border-color:#ffd54f;box-shadow:0 0 28px rgba(255,213,79,.45);background:radial-gradient(circle at 50% 40%,#4a4122,#211d10)}
.hero.d-switch.lit{color:#42a5f5;border-color:#1e88e5;box-shadow:0 0 28px rgba(30,136,229,.5);background:radial-gradient(circle at 50% 40%,#17375a,#0d1a2b)}
.hero.d-cover.lit,.hero.d-fan.lit{color:#4dd0e1;border-color:#26c6da;box-shadow:0 0 28px rgba(38,198,218,.45);background:radial-gradient(circle at 50% 40%,#123c42,#0a1d20)}
.hero.d-media_player.lit{color:#ba68c8;border-color:#ab47bc;box-shadow:0 0 28px rgba(171,71,188,.45);background:radial-gradient(circle at 50% 40%,#3a1f42,#1b0f1f)}
.hero.na{opacity:.45;border-style:dashed}
.hero.lit{animation:pulse 2.6s ease-in-out infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 14px currentColor}50%{box-shadow:0 0 36px currentColor}}
/* ── Wygląd: SZKŁO ── */
:host([data-theme=szklo]) ha-card{background:linear-gradient(135deg,#1a2a6c 0%,#3a1c71 55%,#b21f66 120%);box-shadow:0 12px 40px rgba(0,0,0,.5)}
:host([data-theme=szklo]) .tile,:host([data-theme=szklo]) .panel,:host([data-theme=szklo]) .row{background:rgba(255,255,255,.09);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.18)}
:host([data-theme=szklo]) .tile:hover{background:rgba(255,255,255,.16)}
:host([data-theme=szklo]) .tile.cur{border-color:#fff;box-shadow:0 0 0 2px rgba(255,255,255,.5),0 8px 30px rgba(0,0,0,.35)}
:host([data-theme=szklo]) .tog,:host([data-theme=szklo]) .pill,:host([data-theme=szklo]) .pic{background:rgba(0,0,0,.22)}
:host([data-theme=szklo]) .addt{background:rgba(255,255,255,.04);border:2px dashed rgba(255,255,255,.5)}
:host([data-theme=szklo]) .how{background:rgba(0,0,0,.2);border-color:rgba(255,255,255,.25)}
:host([data-theme=szklo]) .add,:host([data-theme=szklo]) .nb{background:linear-gradient(90deg,#ff6a88,#ff99ac);color:#2a0b1f}
:host([data-theme=szklo]) .pw{border-color:#ff99ac;color:#b21f66}
:host([data-theme=szklo]) .hero{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.35)}
/* ── Wygląd: NEON ── */
:host([data-theme=neon]) ha-card{background:#05060a;border:1px solid #0ff3}
:host([data-theme=neon]) .ct{color:#0ff;text-shadow:0 0 10px #0ff}
:host([data-theme=neon]) .tile,:host([data-theme=neon]) .panel,:host([data-theme=neon]) .row{background:#0a0c12;border:1px solid #1d2a3a}
:host([data-theme=neon]) .tile.cur{border-color:#0ff;box-shadow:0 0 16px #0ff8,inset 0 0 16px #0ff3}
:host([data-theme=neon]) .tile:hover{border-color:#f0f8}
:host([data-theme=neon]) .pic{background:#000;border:1px solid #f0f6}
:host([data-theme=neon]) .pic.lit{color:#f0f;box-shadow:0 0 14px #f0f}
:host([data-theme=neon]) .pw{background:#000;border:3px solid #0ff;color:#0ff;box-shadow:0 0 10px #0ff8}
:host([data-theme=neon]) .pw.on{background:#0ff;color:#000;box-shadow:0 0 22px #0ff}
:host([data-theme=neon]) .hero{background:#000;border:2px solid #f0f;color:#f0f;box-shadow:0 0 22px #f0f8}
:host([data-theme=neon]) .hero.lit{color:#0ff;border-color:#0ff;animation:neon 1.8s ease-in-out infinite}
@keyframes neon{0%,100%{box-shadow:0 0 14px #0ff8}50%{box-shadow:0 0 40px #0ff}}
:host([data-theme=neon]) .ttl{text-shadow:0 0 12px #f0f}
:host([data-theme=neon]) .days b.g{color:#0ff;text-shadow:0 0 8px #0ff}
:host([data-theme=neon]) .tog,:host([data-theme=neon]) .pill{background:#000}
:host([data-theme=neon]) .add,:host([data-theme=neon]) .nb{background:none;border:2px solid #f0f;color:#f0f;box-shadow:0 0 14px #f0f6;text-shadow:0 0 8px #f0f}
:host([data-theme=neon]) .blue{background:none;border:2px solid #0ff;color:#0ff}:host([data-theme=neon]) .red{background:none;border:2px solid #ff3366;color:#ff3366}
:host([data-theme=neon]) .how{background:#000;border-color:#0ff6}
/* ── Wygląd: JASNY ── */
:host([data-theme=jasny]) ha-card{background:linear-gradient(180deg,#f5f7fb,#e9eef6);color:#1c2433}
:host([data-theme=jasny]) .tile,:host([data-theme=jasny]) .panel{background:#fff;border:1px solid #e3e8f0;box-shadow:0 6px 20px rgba(30,50,90,.08)}
:host([data-theme=jasny]) .tile:hover{background:#fbfcff}
:host([data-theme=jasny]) .tile.cur{border-color:#3b82f6;box-shadow:0 8px 26px rgba(59,130,246,.25)}
:host([data-theme=jasny]) .pic{background:#eef2f8;color:#8a94a6}:host([data-theme=jasny]) .pic.lit{background:#fff4d1;color:#f5a400}
:host([data-theme=jasny]) .tag.ha{color:#6b7385}
:host([data-theme=jasny]) .row{background:#f4f6fa;border:1px solid #e3e8f0}
:host([data-theme=jasny]) .tog,:host([data-theme=jasny]) .pill{background:#fff}
:host([data-theme=jasny]) .days b{color:#c2c8d3}:host([data-theme=jasny]) .days b.g{color:#16a34a}
:host([data-theme=jasny]) .pill .a{border-color:#e3e8f0}
:host([data-theme=jasny]) .how.mq{background:#eaf3ff;border-color:#bcd7ff}:host([data-theme=jasny]) .how.ha{background:#f3f4f7;border-color:#dde1e8}
:host([data-theme=jasny]) .hero{background:radial-gradient(circle,#fff,#eef2f8);border-color:#dfe5ee;color:#8a94a6}
:host([data-theme=jasny]) .hero.lit{background:radial-gradient(circle,#fff8e1,#ffe6a0);border-color:#ffc94d;color:#f59e0b}
:host([data-theme=jasny]) .hero.d-switch.lit{background:radial-gradient(circle,#eaf3ff,#bcd7ff);border-color:#3b82f6;color:#2563eb}
:host([data-theme=jasny]) .addt{background:#f8faff;border-color:#93b8f5}
:host([data-theme=jasny]) .pw{background:#fff}
/* ── Wygląd: DOM – wszystko z motywu Home Assistanta (zmienia się razem z motywem) ── */
:host([data-theme=dom]){--sb:var(--switch-checked-color,var(--primary-color,#03a9f4));--sg:var(--success-color,#43a047);--sr:var(--error-color,#db4437);--bg2:var(--secondary-background-color,#282828);--bg3:var(--card-background-color,#1c1c1c);--rad:var(--ha-card-border-radius,12px);--acc:var(--primary-color,#03a9f4);--txt:var(--primary-text-color,#e1e1e1);--txt2:var(--secondary-text-color,#9b9b9b);--line:var(--divider-color,rgba(225,225,225,.12));--on:var(--state-light-active-color,var(--amber-color,#ffc107))}
:host([data-theme=dom]) ha-card{background:var(--ha-card-background,var(--card-background-color,#1c1c1c));color:var(--txt);border-radius:var(--rad);border:var(--ha-card-border-width,1px) solid var(--ha-card-border-color,var(--line));box-shadow:var(--ha-card-box-shadow,none);font-family:var(--ha-font-family-body,var(--paper-font-body1_-_font-family,inherit))}
:host([data-theme=dom]) .ct{font-size:var(--ha-card-header-font-size,24px);font-weight:400;color:var(--ha-card-header-color,var(--txt))}
:host([data-theme=dom]) .ct ha-icon,:host([data-theme=dom]) .tag.mq,:host([data-theme=dom]) .how.mq ha-icon,:host([data-theme=dom]) em{color:var(--acc)}
:host([data-theme=dom]) .tile,:host([data-theme=dom]) .row{background:var(--bg2);border-radius:var(--rad)}
:host([data-theme=dom]) .tile:hover{filter:brightness(1.08)}
:host([data-theme=dom]) .tile.cur{border-color:var(--acc);box-shadow:none}
:host([data-theme=dom]) .tag.ha,:host([data-theme=dom]) .ta,:host([data-theme=dom]) .sub{color:var(--txt2);opacity:1}
:host([data-theme=dom]) .panel{background:none;border:1px solid var(--line);border-radius:var(--rad)}
:host([data-theme=dom]) .pill,:host([data-theme=dom]) .pic{background:var(--bg3)}
:host([data-theme=dom]) .pill .a{border-color:var(--line)}
:host([data-theme=dom]) .pic{color:var(--state-icon-color,#44739e)}
:host([data-theme=dom]) .pic.lit{color:var(--on);background:var(--bg3)}
:host([data-theme=dom]) .pic.plus{color:var(--acc)}
:host([data-theme=dom]) .days b{color:var(--disabled-text-color,#6f6f6f)}
:host([data-theme=dom]) .pw{background:var(--bg3);border:3px solid var(--acc);color:var(--acc);box-shadow:none}
:host([data-theme=dom]) .pw.on{background:var(--acc);color:var(--text-primary-color,#fff)}
:host([data-theme=dom]) .pw.na{border-color:var(--disabled-text-color,#6f6f6f);color:var(--disabled-text-color,#6f6f6f)}
:host([data-theme=dom]) .addt{background:none;border:2px dashed var(--acc)}
:host([data-theme=dom]) .how.mq,:host([data-theme=dom]) .how.ha{background:var(--bg2);border:1px solid var(--line);border-left:4px solid var(--acc)}
:host([data-theme=dom]) .how.ha{border-left-color:var(--txt2)}:host([data-theme=dom]) .how.ha ha-icon{color:var(--txt2)}
:host([data-theme=dom]) .hero{background:var(--bg2);border:3px solid var(--line);color:var(--state-icon-color,#44739e)}
:host([data-theme=dom]) .hero.lit{color:var(--on);border-color:var(--on);background:var(--bg2)}
:host([data-theme=dom]) .hero.d-switch.lit,:host([data-theme=dom]) .hero.d-input_boolean.lit{color:var(--acc);border-color:var(--acc);background:var(--bg2)}
:host([data-theme=dom]) .b{border-radius:var(--rad)}
:host([data-theme=dom]) .blue{background:var(--acc)}:host([data-theme=dom]) .red{background:var(--sr)}
:host([data-theme=dom]) .add,:host([data-theme=dom]) .nb{background:var(--acc);color:var(--text-primary-color,#fff);border-radius:var(--rad)}
:host([data-theme=dom]) .nb.ghost{background:none;border:2px solid var(--acc);color:var(--acc)}
:host([data-theme=dom]) .dlg,:host([data-theme=dom]) .dlg.pop{background:var(--ha-dialog-surface-background,var(--mdc-theme-surface,var(--card-background-color,#1c1c1c)));color:var(--txt);border-radius:var(--ha-dialog-border-radius,28px)}
:host([data-theme=dom]) .x{color:var(--txt)}
:host([data-theme=dom]) .tab i{background:var(--line)}:host([data-theme=dom]) .tab.cur i{background:var(--acc);box-shadow:none}
:host([data-theme=dom]) .chk{border-color:var(--txt2)}:host([data-theme=dom]) .chk.on{background:var(--acc);border-color:var(--acc)}
:host([data-theme=dom]) .note,:host([data-theme=dom]) .sec{border-color:var(--line)}
:host([data-theme=dom]) .tp,:host([data-theme=dom]) .col{background:var(--bg2)}
:host([data-theme=dom]) .ar{background:var(--bg3);color:var(--txt)}
:host([data-theme=dom]) .num{color:var(--txt)}
:host([data-theme=dom]) .opt{border-color:var(--acc);color:var(--txt);border-radius:var(--rad)}:host([data-theme=dom]) .opt.sel{background:rgba(var(--rgb-primary-color,3,169,244),.2)}
:host([data-theme=dom]) .chg{border-color:var(--acc);color:var(--acc)}
:host([data-theme=dom]) .q{background:var(--bg2);border-color:var(--line);color:var(--txt);border-radius:var(--rad)}
:host([data-theme=dom]) .pi:hover{background:var(--bg2)}
:host([data-theme=dom]) .pi ha-icon{color:var(--state-icon-color,#44739e)}
:host([data-theme=dom]) .sw span{background:var(--switch-unchecked-track-color,#666)}
:host([data-theme=dom]) .sw input:checked+span{background:var(--sb)}
:host([data-theme=dom]) .days b.g{color:var(--sg)}
/* układ: harmonogramy na środku, kafelki urządzeń po bokach (same się dokładają); na telefonie jedno pod drugim */
.lay{display:grid;grid-template-columns:minmax(170px,1fr) minmax(360px,2.2fr) minmax(170px,1fr);gap:16px;align-items:start}
.lay.one{grid-template-columns:1fr}
.lay.srodek .tiles{grid-template-columns:1fr}
.lay.srodek .rows{grid-template-columns:1fr!important}
.lay.boki{grid-template-columns:minmax(200px,1fr) minmax(360px,2.6fr)}.lay.boki .tiles{grid-template-columns:repeat(auto-fill,minmax(170px,1fr))}
.lay.gora{grid-template-columns:1fr}.lay.gora .tiles{grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}
.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}
.rows{grid-template-columns:repeat(auto-fill,minmax(300px,1fr))!important}
.panel{background:#0b0b0c;border-radius:16px;padding:14px;border:1px solid #2a2b2f}
ha-card.one .panel{border:0;padding:0;background:none}
.tile{position:relative;background:#2b2d31;border-radius:16px;padding:26px 10px 14px;text-align:center;cursor:pointer;border:2px solid transparent;transition:.15s}
.tile:hover{background:#33353a}.tile.cur{border-color:#2b8ff0;box-shadow:0 0 14px rgba(43,143,240,.45)}
.tag{position:absolute;top:8px;left:10px;font-size:11px;font-weight:700;opacity:.85;display:flex;gap:4px;align-items:center}
.tag.mq{color:#42a5f5}.tag.ha{color:#b0b4ba}
.how{margin:10px auto 0;max-width:460px;font-size:13px;line-height:1.4;border-radius:10px;padding:8px 12px;text-align:left}
.how.mq{background:#10263d;border:1px solid #1e88e5}.how.ha{background:#26282c;border:1px solid #444}
.pic{width:64px;height:64px;margin:0 auto 8px;border-radius:50%;background:#1f2023;display:flex;align-items:center;justify-content:center;color:#9aa0a6;--mdc-icon-size:34px}
.pic.lit{color:#ffd54f;background:#3a3420}.pic.plus{color:#2b8ff0;background:#16263a}
.tn{font-weight:700;font-size:16px;line-height:1.2}.ta{font-size:13px;opacity:.7;margin-top:2px}
.tc{font-size:12px;margin:8px 0 10px;opacity:.85}
.pw{position:relative;width:56px;height:56px;border-radius:50%;border:6px solid #45474d;background:#e9edf2;color:#1e88e5;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:.2s}
.pw.on{border-color:#1e88e5;box-shadow:0 0 12px rgba(30,136,229,.6)}.pw.on::after{content:'';position:absolute;bottom:22%;left:50%;width:34%;height:3px;margin-left:-17%;border-radius:2px;background:#f44336}.pw.na{border-color:#555;color:#777;opacity:.6}
.addt{border:2px dashed #2b8ff0;background:#16181c}
.hdr{text-align:center;margin-bottom:12px}.ttl{font-size:28px;font-weight:700}.sub{font-size:16px;margin-top:6px;opacity:.9}.off{color:var(--sr)}.sy{color:#42a5f5}
.rows{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:10px;margin-bottom:10px}
.row{display:flex;align-items:stretch;background:var(--bg2);border-radius:14px;overflow:hidden}
.dlg .rows{grid-template-columns:1fr}
.tog{background:rgba(0,0,0,.18);display:flex;align-items:center;padding:0 14px}
.mid{flex:1;padding:10px 8px}.mid.dim{opacity:.45}
.days{letter-spacing:6px;font-weight:700;font-size:17px;margin-bottom:8px}.days b{color:#6b6e75}.days b.g{color:var(--sg)}
.pill{display:inline-flex;background:var(--bg3);border-radius:22px;overflow:hidden;font-weight:700;font-size:17px}
.pill span{display:flex;align-items:center;gap:6px;padding:7px 10px}.pill .a{border-left:1px solid #3a3c41}
.mini{display:inline-block;width:22px;height:12px;border-radius:7px;border:2px solid;position:relative}
.mini.off{border-color:var(--sr)}.mini.on{border-color:var(--sg)}
.mini::after{content:'';position:absolute;top:2px;width:8px;height:8px;border-radius:50%}
.mini.off::after{left:2px;background:var(--sr)}.mini.on::after{right:2px;background:var(--sg)}
.btns{display:flex;flex-direction:column;gap:8px;padding:8px}
.b{width:46px;height:46px;border:0;border-radius:10px;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center}
.blue{background:linear-gradient(135deg,#1565c0,#2196f3)}.red{background:#ff4d4d}
.add{width:100%;border:0;border-radius:10px;padding:14px;font-size:18px;font-weight:700;color:#fff;cursor:pointer;background:linear-gradient(90deg,#0d5ab8,#2b8ff0)}
.empty{text-align:center;opacity:.6;padding:18px}
.sw{position:relative;display:inline-block;width:52px;height:30px}.sw input{opacity:0;width:0;height:0}
.sw span{position:absolute;inset:0;background:#555;border-radius:30px;cursor:pointer;transition:.2s}
.sw span::before{content:'';position:absolute;width:24px;height:24px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.2s}
.sw input:checked+span{background:var(--sb)}.sw input:checked+span::before{transform:translateX(22px)}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px}
.dlg{background:#141518;color:#fff;border-radius:14px;width:min(640px,100%);max-height:90vh;overflow:auto;padding:22px;box-shadow:0 10px 40px #000}
.dh{display:flex;justify-content:space-between;align-items:center}.dt{font-size:26px;font-weight:700}
.dev{display:flex;gap:8px;align-items:center;opacity:.85;margin-top:6px;font-weight:700}
.chg{margin-left:8px;padding:6px 12px;border-radius:8px;border:1px solid #2b8ff0;background:none;color:#42a5f5;font-weight:700;cursor:pointer}
.x{background:none;border:0;color:#fff;cursor:pointer}
.tabs{display:flex;gap:10px;margin:18px 0}.tab{flex:1;text-align:center;font-weight:700;cursor:pointer;font-size:15px}
.tab i{display:block;height:6px;border-radius:4px;background:#5a5d63;margin-top:8px}.tab.cur i{background:var(--sb);box-shadow:0 0 10px var(--sb)}
.hint{font-weight:400;font-size:13px;opacity:.6}
.lbl{font-weight:700;font-size:18px;margin:6px 0 14px}
.dgrid{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;gap:6px}
.dc{cursor:pointer;font-weight:700;font-size:18px}.dc span{display:block;margin-bottom:10px}
.chk{display:inline-block;width:26px;height:26px;border-radius:6px;border:2px solid #777}
.chk.on{background:var(--sb);border-color:var(--sb);position:relative}
.chk.on::after{content:'✓';position:absolute;inset:0;color:#fff;font-style:normal;font-size:18px;line-height:24px}
.note,.sec{border-top:1px solid #333;margin-top:18px;padding-top:14px;font-weight:700}
em{color:#42a5f5;font-style:normal}em.bad{color:var(--sr)}
.tp{display:flex;justify-content:center;align-items:center;gap:10px;background:#2b2d31;border-radius:14px;padding:18px}
.col{display:flex;flex-direction:column;align-items:center;gap:8px;background:#3a3c41;border-radius:30px;padding:8px}
.ar{width:52px;height:52px;border-radius:50%;border:0;background:#fff;color:#111;cursor:pointer;display:flex;align-items:center;justify-content:center}
.num{font-size:34px;font-weight:700;width:64px;text-align:center;background:none;border:0;color:#fff;font-family:inherit}.colon{font-size:34px;font-weight:700}
.acts{display:flex;gap:12px}.opt{flex:1;padding:16px;border-radius:12px;border:2px dashed #2b8ff0;background:none;color:#fff;font-size:18px;font-weight:700;cursor:pointer;display:flex;gap:10px;align-items:center;justify-content:center}
.opt.sel{border-style:solid;background:#1b3a5e}
.err{margin-top:16px;background:#5c2b2b;border-radius:10px;padding:14px;font-weight:700}
.nav{display:flex;justify-content:flex-end;gap:12px;margin-top:22px}
.nb{min-width:150px;padding:14px 18px;border-radius:12px;border:0;font-size:18px;font-weight:700;color:#fff;cursor:pointer;background:linear-gradient(90deg,#0d5ab8,#2b8ff0)}
.nb.ghost{background:none;border:2px solid #2b8ff0}.nb[disabled]{opacity:.4;cursor:default}
.q{width:100%;box-sizing:border-box;margin:16px 0 10px;padding:12px 14px;border-radius:10px;border:1px solid #444;background:#1f2023;color:#fff;font-size:16px}
.plist{max-height:55vh;overflow:auto}
.pi{display:flex;gap:12px;align-items:center;padding:10px;border-radius:10px;cursor:pointer}.pi:hover{background:#2b2d31}
.pn{font-weight:700}.pa{font-size:12px;opacity:.6}
.dlg.pop{width:min(560px,100%);background:#0b0b0c;padding:14px 16px 18px}.dlg.pop .dh{margin-bottom:-30px}
ha-card.list{background:var(--ha-card-background,var(--card-background-color));color:var(--primary-text-color);padding:0}
.lh{font-size:24px;padding:24px 16px 12px}
.lr{display:flex;align-items:center;gap:16px;padding:10px 16px;cursor:pointer}.lr:hover{background:rgba(127,127,127,.08)}
.li{color:var(--state-icon-color,#44739e)}.li.on{color:#fdd835}
.lt{flex:1}.lt.dim{opacity:.5}.ln{font-size:15px}.ls{font-size:14px;color:var(--secondary-text-color)}
.lf{border-top:1px solid var(--divider-color,#333);padding:8px 8px;margin-top:8px}
.lb{background:none;border:0;color:var(--primary-color);font-size:15px;font-weight:500;padding:10px 12px;cursor:pointer}
/* tablet i telefon: kafelki urządzeń u góry w dwóch kolumnach (szybki wybór), pod nimi harmonogramy */
@media (max-width:900px){.lay,.lay.boki{grid-template-columns:1fr 1fr}.lay .tiles.l{grid-column:1;grid-row:1}.lay .tiles.r{grid-column:2;grid-row:1}.lay.boki .tiles.l,.lay.gora .tiles.l{grid-column:1 / -1}.lay>.panel{grid-column:1 / -1;grid-row:2}}
@media (max-width:560px){ha-card{padding:10px}.lay{gap:10px}.tiles{gap:8px}.tile{padding:22px 6px 10px}.pic{width:44px;height:44px;--mdc-icon-size:26px;margin-bottom:4px}.tn{font-size:14px}.tc{margin:4px 0 6px}.pw{width:42px;height:42px}
.panel{padding:10px}.hero{width:72px;height:72px;--mdc-icon-size:40px}.ttl{font-size:22px}.rows{grid-template-columns:1fr!important}.btns{padding:6px}.b{width:40px;height:40px}.days{letter-spacing:4px;font-size:15px}.pill{font-size:15px}.tog{padding:0 8px}}
/* kilka urządzeń w jednym harmonogramie */
.with{display:flex;align-items:center;gap:4px;font-size:12px;color:var(--txt2,#aaa);margin:-4px 0 6px;--mdc-icon-size:14px}
.devs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px}
.dchip{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:var(--bg2);border:1px solid var(--line,#444);color:var(--txt,#fff);font-size:15px;font-weight:600;--mdc-icon-size:18px;font-family:inherit}
.dchip button{background:none;border:0;color:var(--txt2,#aaa);cursor:pointer;padding:0;display:flex}
.dchip.more{border:2px dashed var(--acc,#2b8ff0);color:var(--acc,#42a5f5);background:none;cursor:pointer}
/* opis: plakietki i linia */
.chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:10px}
.chip{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;font-size:13px;font-weight:600;background:var(--bg2);border:1px solid var(--line,#333);color:var(--txt,#fff);--mdc-icon-size:16px;font-family:inherit}
.chip.mq ha-icon{color:var(--acc,#42a5f5)}.chip.ha ha-icon{color:var(--txt2,#aaa)}
.chip .dot{width:9px;height:9px;border-radius:50%;background:currentColor}
.sy-ok{color:var(--sg)}.sy-wait{color:var(--warning-color,#ffa600)}.sy-na{color:var(--sr)}
.chip.info{cursor:pointer;padding:5px 8px;color:var(--txt2,#aaa)}.chip.info.on{color:var(--acc,#42a5f5);border-color:var(--acc,#42a5f5)}
.infotxt{max-width:440px;margin:8px auto 0;font-size:13px;line-height:1.4;color:var(--txt2,#aaa)}
.hline{display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;margin-top:8px;font-size:13px;color:var(--txt2,#aaa);--mdc-icon-size:16px}.hline.mq ha-icon{color:var(--acc,#42a5f5)}
/* lista urządzeń (wąsko i średnio) */
.lista{display:flex;flex-direction:column;gap:8px}
.lrow{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--rad,12px);background:var(--bg2);border:2px solid transparent;cursor:pointer}
.lrow.cur{border-color:var(--acc,#2b8ff0)}.lrow .pic{width:42px;height:42px;margin:0;--mdc-icon-size:24px;flex:none}
.lrow .lx{flex:1;min-width:0}.lrow .tn{font-size:15px}.lrow .ta{font-size:12px}.mqt{color:var(--acc,#42a5f5)}
.lrow .pw{width:40px;height:40px;border-width:3px;flex:none}.chev{color:var(--txt2,#aaa);transition:.2s}.chev.up{transform:rotate(180deg)}
.lrow.addt{background:none;border:2px dashed var(--acc,#2b8ff0)}
.panel.inl{margin:-4px 0 4px}
.lrow[data-e]{user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
.lista.sorting .panel.inl{display:none}
.lrow.drag{position:relative;z-index:5;border-color:var(--acc,#2b8ff0);box-shadow:0 10px 28px rgba(0,0,0,.55);opacity:.95;transition:none}
/* średnio: lista urządzeń z lewej, harmonogramy z prawej */
.lay2{display:grid;grid-template-columns:minmax(220px,1fr) 2fr;gap:14px;align-items:start}
.lay2 .side{display:flex;flex-direction:column;gap:8px}.lay2 .chev{display:none}.lay2 .rows,.lista .rows{grid-template-columns:1fr!important}
/* telefon: pasek */
.strip{display:none}
@media (max-width:560px){
.m-pasek .tiles{display:none}.m-pasek .strip{display:flex;gap:12px;overflow-x:auto;padding:2px 2px 6px;grid-column:1 / -1;grid-row:1;scrollbar-width:none}
.sd{flex:none;width:72px;text-align:center;cursor:pointer}.sd .pic{position:relative;width:58px;height:58px;border:2px solid transparent;--mdc-icon-size:28px}.sd.cur .pic{border-color:var(--acc,#2b8ff0)}
.sd .tn{font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sd.addt{border:0;background:none}.sd.addt .pic{border:2px dashed var(--acc,#2b8ff0)}
.cnt{position:absolute;top:-2px;right:-2px;min-width:18px;height:18px;border-radius:9px;background:var(--acc,#2b8ff0);color:#fff;font-size:11px;line-height:18px}

}
`;

// Klik w harmonogram urządzenia na starej liście Schedulera (np. Główna) → panel Harmonogramy z otwartą edycją.
// Ogrzewanie (wiele urządzeń/godzin) i przełączniki zostają w starym okienku.
const PANEL = '/harmonogramy-shelly/przedluzacz';
function simpleSchedules(hass) {
  return Object.values(hass.states).filter((s) => s.entity_id.startsWith('switch.') && Array.isArray(s.attributes.entities) && Array.isArray(s.attributes.timeslots)
    && s.attributes.entities.length === 1 && s.attributes.timeslots.length === 1 && DOMAINS.includes(dom(s.attributes.entities[0])));
}
if (!window.__shellyScheduleRedirect) {
  window.__shellyScheduleRedirect = true;
  window.addEventListener('click', (ev) => {
    const path = ev.composedPath();
    const ci = path.findIndex((el) => el && el.tagName === 'SCHEDULER-CARD');
    if (ci < 0) return;
    const inner = path.slice(0, ci);
    if (inner.some((el) => el && el.tagName && /SWITCH|BUTTON|CHECKBOX/.test(el.tagName) && !/ROW|ITEM/.test(el.tagName))) return;
    const ha = document.querySelector('home-assistant');
    const hass = ha && ha.hass;
    if (!hass) return;
    const list = simpleSchedules(hass);
    let id = null;
    for (const el of inner) {
      for (const v of [el && el.schedule_id, el && el.entity_id, el && el.schedule && el.schedule.entity_id, el && el.item && el.item.entity_id, el && el.dataset && el.dataset.id]) {
        if (typeof v === 'string' && list.some((s) => s.entity_id === v)) { id = v; break; }
      }
      if (id) break;
      const txt = (el && el.nodeType === 1 && (el.innerText || el.textContent)) || '';
      if (!txt) continue;
      const hit = list.filter((s) => txt.includes(String(s.attributes.friendly_name || '').replace(/^Harmonogram /, '')));
      if (hit.length === 1) { id = hit[0].entity_id; break; }
      if (hit.length > 1) break;
    }
    if (!id) return;
    ev.stopPropagation();
    ev.preventDefault();
    let pop = window.__shellySchedulePopup;
    if (!pop) {
      pop = document.createElement('shelly-schedule-card');
      pop.setConfig({ mode: 'popup', shelly: ['switch.przedluzacz'], theme: 'shelly', opis: 'brak' });
      document.body.appendChild(pop);
      window.__shellySchedulePopup = pop;
      // odświeżanie okna, gdy jest otwarte (przełączniki, kosz, zapis)
      setInterval(() => {
        const h = document.querySelector('home-assistant');
        if ((pop._popEnt || pop._wiz) && h && h.hass && h.hass !== pop._hass) pop.hass = h.hass;
      }, 500);
    }
    pop.hass = hass;
    if (!pop.openEdit(id)) {
      history.pushState(null, '', `${PANEL}?edit=${encodeURIComponent(id)}`);
      window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
    }
  }, true);
}

if (!customElements.get('shelly-schedule-card')) customElements.define('shelly-schedule-card', ShellyScheduleCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'shelly-schedule-card', name: '📅 Harmonogramy jak w Shelly', description: 'Kafelki urządzeń i harmonogramy w stylu aplikacji Shelly (Scheduler)' });
