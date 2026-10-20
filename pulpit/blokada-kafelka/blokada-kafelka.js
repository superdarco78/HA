// 🔒 blokada-kafelka v6 – uniwersalna blokada dowolnej karty
// v6: pewniejsze znajdowanie karty przy zapisie (kolejność kluczy, karty zmieniające swój config).
// v5: przytrzymaj DOWOLNĄ kartę 3 s (bez trybu edycji) = menu „Dodaj blokadę”; kłódka: menu też po 3 s.
// v4: wspólne ustawienia domyślne dla wszystkich kłódek (dashboard „🔒 Blokady”, karta custom:blokada-ustawienia).
//     Karta zapisuje tylko to, czym różni się od wspólnych ustawień.
// Kłódka: odblokowanie wg „unlock” (hold / double_tap / pin / confirm), zielona + odliczanie, auto-blokada po `duration` s bez dotykania.
// Stuknij otwartą kłódkę = zablokuj od razu. Przytrzymaj kłódkę ok. 2 s = menu (odblokuj, przesuń, ustawienia, wyłącz na 1 h, zdejmij).
// W trybie edycji dashboardu pod każdą kartą przycisk „Dodaj / Zdejmij blokadę”.
// Opcje: card, unlock, pin, hold, duration, countdown (both/number/bar/none), dim, size, pos_x, pos_y, locked_color, unlocked_color,
//        schedule, from, to, exempt [id użytkowników], vibrate.

const BK_DEF = {
  unlock: 'hold', pin: '', hold: 600, duration: 10, countdown: 'both', dim: 15, size: 28, pos_x: 92, pos_y: 12,
  locked_color: '#DB4437', unlocked_color: '#0D904F', schedule: false, from: '22:00', to: '06:00', exempt: [], vibrate: true,
};
const BK_MENU_MS = 3000;
const BK_GLOBAL_DASH = 'dashboard-blokady';
const BK_OWN_SKIP = ['pos_x', 'pos_y'];

// Wspólne ustawienia z dashboardu „🔒 Blokady” (odświeżane co minutę albo po zapisie).
window.__bkG = window.__bkG || { data: {}, at: 0, p: null, cards: new Set() };
function bkGlobal(hass, force) {
  const g = window.__bkG;
  if (!hass || !hass.callWS) return Promise.resolve(g.data);
  if (!force && g.p && Date.now() - g.at < 60000) return g.p;
  g.at = Date.now();
  g.p = hass.callWS({ type: 'lovelace/config', url_path: BK_GLOBAL_DASH }).then((cfg) => {
    let found = {};
    const walk = (o) => {
      if (Array.isArray(o)) o.forEach(walk);
      else if (o && typeof o === 'object') {
        if (o.type === 'custom:blokada-ustawienia' && o.defaults) found = o.defaults; else Object.values(o).forEach(walk);
      }
    };
    walk(cfg);
    const changed = JSON.stringify(found) !== JSON.stringify(g.data);
    g.data = found;
    if (changed) g.cards.forEach((c) => c._recalc());
    return found;
  }).catch(() => g.data);
  return g.p;
}
const bkBase = () => Object.assign({}, BK_DEF, window.__bkG.data);
// Usuwa z konfiguracji karty opcje takie same jak wspólne (wtedy karta idzie za wspólnymi).
function bkClean(cfg) {
  const base = bkBase();
  const out = {};
  Object.keys(cfg).forEach((k) => {
    if (k in BK_DEF && JSON.stringify(cfg[k]) === JSON.stringify(base[k])) return;
    out[k] = cfg[k];
  });
  return out;
}
const bkOwnKeys = (cfg) => Object.keys(cfg).filter((k) => k in BK_DEF && !BK_OWN_SKIP.includes(k));
const BK_LOCK = 'M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z';
const BK_OPEN = 'M18,1C15.24,1 13,3.24 13,6V8H4C2.9,8 2,8.89 2,10V20C2,21.11 2.9,22 4,22H16C17.11,22 18,21.11 18,20V10C18,8.9 17.11,8 16,8H15V6C15,4.34 16.34,3 18,3C19.66,3 21,4.34 21,6V8H23V6C23,3.24 20.76,1 18,1M10,13C11.1,13 12,13.89 12,15C12,16.11 11.11,17 10,17C8.9,17 8,16.11 8,15C8,13.89 8.9,13 10,13Z';
const bkSvg = (d, color, size) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" style="fill:${color}"><path d="${d}"/></svg>`;
const bkToast = (el, message) => el.dispatchEvent(new CustomEvent('hass-notification', { detail: { message }, bubbles: true, composed: true }));
const bkUrlPath = () => { const seg = location.pathname.split('/')[1]; return seg === 'lovelace' ? null : seg; };
const bkMin = (t) => { const [h, m] = String(t || '0:0').split(':').map(Number); return h * 60 + (m || 0); };

// Zmiana tej karty w zapisanej konfiguracji dashboardu.
// 1) szuka obiektu identycznego z config karty (bez względu na kolejność kluczy),
// 2) gdy karta sama zmieniła swój config w pamięci: szuka w bieżącym widoku jednej karty o tym samym typie, encji i nazwie.
const bkCanon = (o) => JSON.stringify(o, (k, v) => (v && typeof v === 'object' && !Array.isArray(v)
  ? Object.keys(v).sort().reduce((a, x) => { a[x] = v[x]; return a; }, {}) : v));
const bkSig = (c) => [c.type, c.entity || '', c.name || '', c.title || '', c.entities ? bkCanon(c.entities) : '', c.card ? bkSig(c.card) : ''].join('|');
async function bkPatchDashboard(hass, cardConfig, fn) {
  const urlPath = bkUrlPath();
  const cfg = await hass.callWS({ type: 'lovelace/config', url_path: urlPath });
  const target = bkCanon(cardConfig);
  const sig = bkSig(cardConfig);
  const exact = [];
  const loose = [];
  const walk = (o, inView) => {
    if (Array.isArray(o)) {
      for (let i = 0; i < o.length; i++) {
        const x = o[i];
        if (x && typeof x === 'object' && !Array.isArray(x)) {
          if (bkCanon(x) === target) { exact.push([o, i]); continue; }
          if (inView && x.type && bkSig(x) === sig) loose.push([o, i]);
        }
        walk(x, inView);
      }
    } else if (o && typeof o === 'object') Object.keys(o).forEach((k) => walk(o[k], inView));
  };
  walk(cfg, false);
  if (!exact.length) {
    const seg = decodeURIComponent(location.pathname.split('/')[2] || '');
    const views = cfg.views || [];
    let vi = views.findIndex((v) => v.path && v.path === seg);
    if (vi < 0) vi = /^\d+$/.test(seg) ? Number(seg) : 0;
    if (views[vi]) walk(views[vi], true);
  }
  const hits = exact.length ? exact : loose;
  if (!hits.length) throw new Error('nie znaleziono tej karty w dashboardzie');
  if (!exact.length && loose.length > 1) throw new Error('w widoku jest kilka takich samych kart – dodaj blokadę w trybie edycji');
  hits.forEach(([arr, i]) => { arr[i] = fn(arr[i]); });
  await hass.callWS({ type: 'lovelace/config/save', url_path: urlPath, config: cfg });
}

// Okienka (menu, PIN, pytanie, ustawienia) – w <body>, żeby nie przycinała ich karta.
function bkDialog(html, onBuild) {
  const host = document.createElement('div');
  const sr = host.attachShadow({ mode: 'open' });
  sr.innerHTML = `<style>
    .bg{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;font-family:var(--paper-font-body1_-_font-family,Roboto,sans-serif)}
    .sh{width:100%;max-width:480px;max-height:90vh;overflow:auto;background:var(--card-background-color,#242424);color:var(--primary-text-color,#e1e1e1);
        border-radius:20px 20px 0 0;padding:10px 0 16px;box-shadow:0 -6px 24px rgba(0,0,0,.6)}
    @media(min-width:600px){.bg{align-items:center}.sh{border-radius:16px}}
    .grip{width:36px;height:4px;border-radius:2px;background:#666;margin:0 auto 10px}
    .hd{padding:4px 20px 12px;font-size:17px;font-weight:600;display:flex;gap:10px;align-items:center}
    .it{padding:14px 20px;font-size:16px;display:flex;gap:14px;align-items:center;cursor:pointer}
    .it:hover{background:rgba(255,255,255,.05)}
    .it small{display:block;font-size:12px;opacity:.65}
    .red{color:#ff8a80}.mut{justify-content:center;opacity:.7}
    .pin{display:flex;justify-content:center;gap:10px;margin:6px 0 12px;font-size:28px;letter-spacing:6px;min-height:36px}
    .keys{display:grid;grid-template-columns:repeat(3,72px);gap:10px;justify-content:center}
    .keys button{height:56px;border-radius:28px;border:1px solid #555;background:transparent;color:inherit;font-size:22px;cursor:pointer}
    .err{color:#ff8a80;text-align:center;min-height:18px;font-size:13px}
    .row{display:flex;justify-content:flex-end;gap:18px;padding:12px 20px 0}
    .row span{color:var(--primary-color,#03a9f4);font-weight:600;cursor:pointer}
    .frm{padding:0 16px}
  </style><div class="bg"><div class="sh"><div class="grip"></div>${html}</div></div>`;
  const close = () => host.remove();
  sr.querySelector('.bg').addEventListener('click', (e) => { if (e.target.classList.contains('bg')) close(); });
  document.body.appendChild(host);
  if (onBuild) onBuild(sr, close);
  return close;
}

function bkSchema(users) {
  return [
    { type: 'expandable', name: '', flatten: true, title: '👆 Odblokowanie', expanded: true, schema: [
      { name: 'unlock', selector: { select: { mode: 'dropdown', options: [
        { value: 'hold', label: 'Przytrzymanie kłódki' }, { value: 'double_tap', label: '2× stuknięcie kłódki' },
        { value: 'pin', label: 'Kod PIN' }, { value: 'confirm', label: 'Pytanie „Na pewno?”' }] } } },
      { name: 'hold', selector: { number: { min: 200, max: 1800, step: 100, mode: 'slider', unit_of_measurement: 'ms' } } },
      { name: 'pin', selector: { text: { type: 'password' } } },
    ] },
    { type: 'expandable', name: '', flatten: true, title: '⏱️ Auto-blokada', expanded: true, schema: [
      { name: 'duration', selector: { number: { min: 3, max: 600, step: 1, mode: 'box', unit_of_measurement: 's' } } },
      { name: 'countdown', selector: { select: { mode: 'list', options: [
        { value: 'both', label: 'Liczba + pasek' }, { value: 'number', label: 'Liczba' }, { value: 'bar', label: 'Pasek' }, { value: 'none', label: 'Brak' }] } } },
    ] },
    { type: 'expandable', name: '', flatten: true, title: '🎨 Wygląd', schema: [
      { name: 'locked_color', selector: { text: {} } },
      { name: 'unlocked_color', selector: { text: {} } },
      { name: 'size', selector: { number: { min: 14, max: 64, step: 1, mode: 'slider', unit_of_measurement: 'px' } } },
      { name: 'pos_x', selector: { number: { min: 0, max: 100, step: 0.5, mode: 'slider', unit_of_measurement: '%' } } },
      { name: 'pos_y', selector: { number: { min: 0, max: 100, step: 0.5, mode: 'slider', unit_of_measurement: '%' } } },
      { name: 'dim', selector: { number: { min: 0, max: 70, step: 5, mode: 'slider', unit_of_measurement: '%' } } },
    ] },
    { type: 'expandable', name: '', flatten: true, title: '🌙 Kiedy blokować', schema: [
      { name: 'schedule', selector: { boolean: {} } },
      { name: 'from', selector: { time: {} } },
      { name: 'to', selector: { time: {} } },
    ] },
    { type: 'expandable', name: '', flatten: true, title: '👤 Wyjątki i wibracja', schema: [
      { name: 'exempt', selector: { select: { multiple: true, mode: 'list', options: users } } },
      { name: 'vibrate', selector: { boolean: {} } },
    ] },
  ];
}
const BK_LABELS = {
  unlock: 'Sposób odblokowania', hold: 'Przytrzymanie (dla „Przytrzymanie kłódki”)', pin: 'Kod PIN (dla „Kod PIN”)',
  duration: 'Blokada wraca po (s bez dotykania)', countdown: 'Odliczanie',
  locked_color: '🔴 Kolor zablokowanej (#RRGGBB)', unlocked_color: '🟢 Kolor otwartej (#RRGGBB)', size: 'Rozmiar kłódki',
  pos_x: 'Kłódka: od lewej', pos_y: 'Kłódka: od góry', dim: 'Przyciemnienie zablokowanej karty',
  schedule: 'Blokuj tylko w godzinach (wyłączone = zawsze)', from: 'Od', to: 'Do',
  exempt: 'Bez blokady dla', vibrate: '📳 Wibracja przy odblokowaniu',
};
async function bkUsers(hass) {
  try {
    const list = await hass.callWS({ type: 'config/auth/list' });
    return list.filter((u) => !u.system_generated && u.is_active).map((u) => ({ value: u.id, label: u.name }));
  } catch (_) {
    return hass && hass.user ? [{ value: hass.user.id, label: hass.user.name }] : [];
  }
}

class BlokadaKafelka extends HTMLElement {
  static getStubConfig() { return { card: { type: 'tile', entity: '' }, pos_x: 92, pos_y: 12 }; }
  static getConfigElement() { return document.createElement('blokada-kafelka-editor'); }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._locked = true;
    this._move = false;
    this._lastTap = 0;
  }

  setConfig(config) {
    if (!config || !config.card) throw new Error('blokada-kafelka: brak "card"');
    const old = this._config;
    this._config = config;
    this._c = Object.assign({}, bkBase(), config);
    if (!this._root) this._build();
    if (!old || JSON.stringify(old.card) !== JSON.stringify(config.card)) this._makeCard();
    this._place();
    this._paint();
  }

  set hass(h) {
    this._hass = h;
    bkGlobal(h);
    if (this._card) this._card.hass = h;
    const act = this._active();
    if (act !== this._wasActive) { this._wasActive = act; this._paint(); }
  }

  getCardSize() { return this._card && this._card.getCardSize ? this._card.getCardSize() : 3; }

  _recalc() {
    if (!this._config) return;
    this._c = Object.assign({}, bkBase(), this._config);
    if (!this._move) this._place();
    this._paint();
  }

  connectedCallback() { window.__bkG.cards.add(this); this._schedT = setInterval(() => { const a = this._active(); if (a !== this._wasActive) { this._wasActive = a; this._paint(); } }, 30000); }
  disconnectedCallback() { window.__bkG.cards.delete(this); clearInterval(this._schedT); this._lock(); }

  async _makeCard() {
    const helpers = await window.loadCardHelpers();
    const el = helpers.createCardElement(this._config.card);
    el.addEventListener('ll-rebuild', (ev) => { ev.stopPropagation(); this._makeCard(); });
    if (this._hass) el.hass = this._hass;
    this._inner.innerHTML = '';
    this._inner.appendChild(el);
    this._card = el;
  }

  get _snoozeKey() { return 'bk-snooze-' + JSON.stringify(this._config.card).length + '-' + (this._config.card.entity || this._config.card.type); }

  // Czy blokada w tej chwili obowiązuje (wyjątki, godziny, „wyłącz na 1 h”).
  _active() {
    const c = this._c;
    if (!c) return true;
    const uid = this._hass && this._hass.user && this._hass.user.id;
    if (uid && (c.exempt || []).includes(uid)) return false;
    try { if (Number(localStorage.getItem(this._snoozeKey) || 0) > Date.now()) return false; } catch (_) { /* brak */ }
    if (c.schedule) {
      const d = new Date(); const n = d.getHours() * 60 + d.getMinutes();
      const a = bkMin(c.from); const b = bkMin(c.to);
      return a <= b ? n >= a && n < b : n >= a || n < b;
    }
    return true;
  }

  _build() {
    this.shadowRoot.innerHTML = `<style>
      :host{display:block;height:100%}
      .wrap{position:relative;height:100%}
      .inner{height:100%}
      .ov{position:absolute;inset:0;z-index:20;border-radius:var(--ha-card-border-radius,12px)}
      .ov.off{pointer-events:none;background:transparent!important}
      .lk{position:absolute;z-index:22;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;
          padding:6px;cursor:pointer;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;touch-action:none;-webkit-tap-highlight-color:transparent}
      .lk svg{transition:transform .15s;filter:drop-shadow(0 1px 2px rgba(0,0,0,.6));display:block}
      .lk.press svg{transform:scale(1.25)}
      .lk.idle{opacity:.35}
      .lk.move{outline:2px dashed var(--primary-color,#03a9f4);border-radius:50%;animation:bkp 1s infinite}
      @keyframes bkp{50%{opacity:.55}}
      .cd{font-size:11px;font-weight:700;line-height:12px;min-height:12px}
      .bar{position:absolute;left:0;bottom:0;height:3px;width:0;z-index:21;pointer-events:none;border-radius:0 2px 2px var(--ha-card-border-radius,12px)}
      .hint{display:none;position:absolute;left:8px;right:8px;bottom:8px;z-index:23;font-size:12px;text-align:center;
            background:rgba(0,0,0,.75);color:#fff;border-radius:8px;padding:4px 6px;pointer-events:none}
      .move-on .hint{display:block}
    </style>
    <div class="wrap"><div class="inner"></div><div class="ov"></div><div class="bar"></div>
      <div class="lk"><span class="ic"></span><span class="cd"></span></div>
      <div class="hint">Przeciągnij kłódkę w nowe miejsce i puść</div></div>`;
    const s = this.shadowRoot;
    this._root = s.querySelector('.wrap');
    this._inner = s.querySelector('.inner');
    this._ov = s.querySelector('.ov');
    this._bar = s.querySelector('.bar');
    this._lk = s.querySelector('.lk');
    this._icon = s.querySelector('.ic');
    this._cd = s.querySelector('.cd');

    ['click', 'dblclick', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'contextmenu'].forEach((t) =>
      this._ov.addEventListener(t, (e) => { e.stopPropagation(); if (t === 'click' || t === 'contextmenu') e.preventDefault(); }));
    this._root.addEventListener('pointerdown', () => { if (!this._locked && !this._move) this._restart(); }, true);

    const lk = this._lk;
    lk.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); });
    lk.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); });
    lk.addEventListener('pointerdown', (e) => this._down(e));
    lk.addEventListener('pointermove', (e) => this._drag(e));
    lk.addEventListener('pointerup', (e) => this._up(e));
    lk.addEventListener('pointercancel', () => this._cancelPress());
    lk.addEventListener('pointerleave', () => { if (!this._move) this._cancelPress(); });
  }

  _cancelPress() { clearTimeout(this._holdT); clearTimeout(this._menuT); this._lk.classList.remove('press'); this._dragging = false; }

  _down(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this._move) {
      this._dragging = true;
      try { this._lk.setPointerCapture(e.pointerId); } catch (_) { /* brak */ }
      return;
    }
    this._lk.classList.add('press');
    this._held = false;
    const wasLocked = this._locked;
    clearTimeout(this._holdT);
    clearTimeout(this._menuT);
    if (this._c.unlock === 'hold' && this._active()) {
      this._holdT = setTimeout(() => {
        this._lk.classList.remove('press');
        this._held = true;
        if (this._locked) this._unlock(); else this._restart();
      }, this._c.hold);
    }
    this._menuT = setTimeout(() => {
      this._held = true;
      this._lk.classList.remove('press');
      if (wasLocked) this._lock();
      this._menu();
    }, BK_MENU_MS);
  }

  _drag(e) {
    if (!this._move || !this._dragging) return;
    e.preventDefault();
    const r = this._root.getBoundingClientRect();
    const x = Math.min(97, Math.max(3, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.min(97, Math.max(3, ((e.clientY - r.top) / r.height) * 100));
    this._px = Math.round(x * 10) / 10;
    this._py = Math.round(y * 10) / 10;
    this._lk.style.left = this._px + '%';
    this._lk.style.top = this._py + '%';
  }

  _up(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this._move) {
      if (this._dragging && this._px !== undefined) {
        const x = this._px;
        const y = this._py;
        this._dragging = false;
        this._setMove(false);
        this._c.pos_x = x;
        this._c.pos_y = y;
        this._place();
        this._patch((o) => Object.assign({}, o, { pos_x: x, pos_y: y }), '🔒 Zapisano położenie kłódki');
      }
      return;
    }
    clearTimeout(this._holdT);
    clearTimeout(this._menuT);
    this._lk.classList.remove('press');
    if (this._held) { this._held = false; this._lastTap = 0; return; }
    if (!this._active()) return;
    const mode = this._c.unlock;
    const now = Date.now();
    const dbl = now - this._lastTap < 350;
    this._lastTap = dbl ? 0 : now;
    clearTimeout(this._tapT);
    if (dbl) {
      if (mode === 'double_tap' && this._locked) this._unlock();
      else if (mode === 'hold') this._setMove(true);
      return;
    }
    if (!this._locked) { this._tapT = setTimeout(() => { if (!this._locked && !this._move) this._lock(); }, 360); return; }
    if (mode === 'pin') this._askPin();
    else if (mode === 'confirm') this._askConfirm();
  }

  _askConfirm() {
    bkDialog(`<div class="hd">${bkSvg(BK_LOCK, this._c.locked_color, 22)}Na pewno odblokować?</div>
      <div class="row"><span class="no">ANULUJ</span><span class="ok">ODBLOKUJ</span></div>`, (sr, close) => {
      sr.querySelector('.no').onclick = close;
      sr.querySelector('.ok').onclick = () => { close(); this._unlock(); };
    });
  }

  _askPin() {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'];
    bkDialog(`<div class="hd">${bkSvg(BK_LOCK, this._c.locked_color, 22)}Podaj PIN</div><div class="pin"></div><div class="err"></div>
      <div class="keys">${keys.map((k) => `<button>${k}</button>`).join('')}</div>`, (sr, close) => {
      let v = '';
      const out = sr.querySelector('.pin');
      const err = sr.querySelector('.err');
      sr.querySelectorAll('.keys button').forEach((b) => b.addEventListener('click', () => {
        const k = b.textContent;
        if (k === '⌫') v = v.slice(0, -1);
        else if (k === '✓') {
          if (v === String(this._c.pin || '')) { close(); this._unlock(); return; }
          err.textContent = 'Błędny PIN'; v = '';
          if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
        } else if (v.length < 8) v += k;
        out.textContent = '•'.repeat(v.length);
        if (v.length && this._c.pin && v === String(this._c.pin)) { close(); this._unlock(); }
      }));
    });
  }

  _menu() {
    if (navigator.vibrate) navigator.vibrate(30);
    const name = (this._hass && this._config.card.entity && this._hass.states[this._config.card.entity]
      && this._hass.states[this._config.card.entity].attributes.friendly_name) || this._config.card.name || 'karta';
    let snoozed = false;
    try { snoozed = Number(localStorage.getItem(this._snoozeKey) || 0) > Date.now(); } catch (_) { /* brak */ }
    bkDialog(`<div class="hd">${bkSvg(BK_LOCK, this._c.locked_color, 22)}Blokada · ${name}</div>
      <div class="it" data-a="unlock">${bkSvg(BK_OPEN, this._c.unlocked_color, 24)}<span>Odblokuj teraz<small>na ${this._c.duration} s</small></span></div>
      <div class="it" data-a="move">↔️<span>Przesuń kłódkę<small>przeciągnij palcem, zapisze się samo</small></span></div>
      <div class="it" data-a="settings">⚙️<span>Ustawienia tej kłódki<small>sposób odblokowania, czas, wygląd, godziny…</small></span></div>
      <div class="it" data-a="global">🌐<span>Ustawienia wspólne<small>dla wszystkich kłódek (panel 🔒 Blokady)</small></span></div>
      <div class="it" data-a="snooze">⏸️<span>${snoozed ? 'Włącz blokadę z powrotem' : 'Wyłącz blokadę na 1 godz.'}<small>tylko na tym urządzeniu</small></span></div>
      <div class="it red" data-a="remove">🗑️<span>Zdejmij blokadę z tej karty</span></div>
      <div class="it mut" data-a="x">Anuluj</div>`, (sr, close) => {
      sr.querySelectorAll('.it').forEach((it) => it.addEventListener('click', () => {
        const a = it.dataset.a;
        close();
        if (a === 'unlock') this._unlock();
        else if (a === 'move') this._setMove(true);
        else if (a === 'settings') this._settings();
        else if (a === 'global') { history.pushState(null, '', '/' + BK_GLOBAL_DASH); window.dispatchEvent(new CustomEvent('location-changed')); }
        else if (a === 'snooze') {
          try { localStorage.setItem(this._snoozeKey, snoozed ? '0' : String(Date.now() + 3600000)); } catch (_) { /* brak */ }
          this._lock();
          bkToast(this, snoozed ? '🔒 Blokada włączona' : '🔓 Blokada wyłączona na 1 godz.');
        } else if (a === 'remove') this._askRemove();
      }));
    });
  }

  _askRemove() {
    bkDialog(`<div class="hd">🗑️ Zdjąć blokadę z tej karty?</div>
      <div style="padding:0 20px;opacity:.75;font-size:14px">Karta zostaje, znika tylko kłódka. Blokadę dodasz z powrotem w trybie edycji.</div>
      <div class="row"><span class="no">ANULUJ</span><span class="ok" style="color:#ff8a80">ZDEJMIJ</span></div>`, (sr, close) => {
      sr.querySelector('.no').onclick = close;
      sr.querySelector('.ok').onclick = () => { close(); this._patch((o) => o.card, '🗑️ Blokada zdjęta'); };
    });
  }

  async _settings() {
    const users = await bkUsers(this._hass);
    await bkGlobal(this._hass);
    let data = Object.assign({}, bkBase(), this._config);
    const own = bkOwnKeys(this._config).length;
    bkDialog(`<div class="hd">⚙️ Ustawienia tej kłódki</div>
      <div style="padding:0 20px 8px;opacity:.75;font-size:13px">Zmieniasz tylko tę kartę. Czego nie zmienisz, bierze ze wspólnych (panel 🔒 Blokady).
      ${own ? `Własne ustawienia: ${own}.` : 'Teraz wszystko wspólne.'}</div><div class="frm"></div>
      <div class="row"><span class="rs" style="margin-right:auto">PRZYWRÓĆ WSPÓLNE</span><span class="no">ANULUJ</span><span class="ok">ZAPISZ</span></div>`, (sr, close) => {
      const form = document.createElement('ha-form');
      form.hass = this._hass;
      form.schema = bkSchema(users);
      form.data = data;
      form.computeLabel = (s) => BK_LABELS[s.name] || s.name;
      form.addEventListener('value-changed', (e) => { data = e.detail.value; form.data = data; });
      sr.querySelector('.frm').appendChild(form);
      sr.querySelector('.no').onclick = close;
      sr.querySelector('.rs').onclick = () => {
        close();
        this._patch((o) => { const n = Object.assign({}, o); bkOwnKeys(n).forEach((k) => delete n[k]); return n; }, '🌐 Ta kłódka używa teraz ustawień wspólnych');
      };
      sr.querySelector('.ok').onclick = () => {
        close();
        const patch = {};
        Object.keys(BK_DEF).forEach((k) => { if (data[k] !== undefined) patch[k] = data[k]; });
        this._patch((o) => bkClean(Object.assign({}, o, patch)), '⚙️ Zapisano ustawienia tej kłódki');
      };
    });
  }

  async _patch(fn, okMsg) {
    try {
      await bkPatchDashboard(this._hass, this._config, fn);
      bkToast(this, okMsg);
    } catch (err) {
      bkToast(this, '🔒 Nie zapisano: ' + (err && err.message ? err.message : err));
      this._c = Object.assign({}, bkBase(), this._config);
      this._place();
    }
  }

  _setMove(on) {
    this._move = on;
    this._px = undefined;
    this._lk.classList.toggle('move', on);
    this._root.classList.toggle('move-on', on);
    if (on) { this._ov.classList.remove('off'); clearTimeout(this._relockT); clearInterval(this._tick); }
    this._paint();
    if (on && navigator.vibrate) navigator.vibrate([30, 40, 30]);
  }

  _unlock() {
    this._locked = false;
    if (this._c.vibrate && navigator.vibrate) navigator.vibrate(40);
    this._restart();
  }

  _restart() {
    clearTimeout(this._relockT);
    clearInterval(this._tick);
    this._until = Date.now() + this._c.duration * 1000;
    this._relockT = setTimeout(() => this._lock(), this._c.duration * 1000);
    this._tick = setInterval(() => this._paint(), 250);
    this._paint();
  }

  _lock() {
    clearTimeout(this._relockT);
    clearInterval(this._tick);
    this._locked = true;
    if (this._root) this._paint();
  }

  _place() {
    this._lk.style.left = this._c.pos_x + '%';
    this._lk.style.top = this._c.pos_y + '%';
  }

  _paint() {
    const c = this._c;
    const active = this._active();
    const open = !this._locked || !active;
    const color = active ? (open ? c.unlocked_color : c.locked_color) : '#9e9e9e';
    this._icon.innerHTML = bkSvg(open ? BK_OPEN : BK_LOCK, color, c.size);
    this._lk.classList.toggle('idle', !active && !this._move);
    this._cd.style.color = color;
    const blocked = active && (this._locked || this._move);
    this._ov.classList.toggle('off', !blocked);
    this._ov.style.background = blocked && this._locked && !this._move && c.dim ? `rgba(0,0,0,${c.dim / 100})` : 'transparent';
    if (active && !this._locked) {
      const left = Math.max(0, this._until - Date.now());
      this._cd.textContent = c.countdown === 'both' || c.countdown === 'number' ? Math.ceil(left / 1000) + ' s' : '';
      this._bar.style.width = c.countdown === 'both' || c.countdown === 'bar' ? (left / (c.duration * 1000)) * 100 + '%' : '0';
      this._bar.style.background = color;
    } else {
      this._cd.textContent = '';
      this._bar.style.width = '0';
    }
  }
}

class BlokadaKafelkaEditor extends HTMLElement {
  setConfig(config) { this._config = config; this._render(); }
  set hass(h) {
    this._hass = h;
    if (this._form) this._form.hass = h;
    if (this._cardEd) this._cardEd.hass = h;
    if (!this._users && h) { this._users = []; bkUsers(h).then((u) => { this._users = u; this._render(); }); bkGlobal(h).then(() => this._render()); }
  }
  set lovelace(l) { this._lovelace = l; if (this._cardEd) this._cardEd.lovelace = l; }
  _fire(cfg) { this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: cfg }, bubbles: true, composed: true })); }
  _render() {
    if (!this._config) return;
    if (!this._form) {
      const note = document.createElement('p');
      note.style.cssText = 'margin:0 0 8px;font-size:13px;opacity:.8';
      note.textContent = '🔒 Tu zmieniasz tylko tę kłódkę; reszta jest ze wspólnych ustawień (panel 🔒 Blokady). Kłódkę przesuniesz też palcem: przytrzymaj ją 3 s → „Przesuń kłódkę”. Niżej karta w środku blokady.';
      this.appendChild(note);
      this._form = document.createElement('ha-form');
      this._form.computeLabel = (s) => BK_LABELS[s.name] || s.name;
      this._form.addEventListener('value-changed', (e) => {
        e.stopPropagation();
        this._config = bkClean(Object.assign({}, this._config, e.detail.value));
        this._fire(this._config);
      });
      this.appendChild(this._form);
      const h = document.createElement('h3');
      h.textContent = '🧩 Karta w środku';
      h.style.cssText = 'margin:16px 0 8px;font-size:16px';
      this.appendChild(h);
      if (customElements.get('hui-card-element-editor')) {
        this._cardEd = document.createElement('hui-card-element-editor');
        this._cardEd.addEventListener('config-changed', (e) => {
          e.stopPropagation();
          this._config = Object.assign({}, this._config, { card: e.detail.config });
          this._fire(this._config);
        });
        this.appendChild(this._cardEd);
      } else {
        const p = document.createElement('p');
        p.textContent = 'Kartę w środku zmienisz w edytorze kodu (pole card:).';
        this.appendChild(p);
      }
    }
    this._form.hass = this._hass;
    this._form.schema = bkSchema(this._users || []);
    this._form.data = Object.assign({}, bkBase(), this._config);
    if (this._cardEd) {
      this._cardEd.hass = this._hass;
      if (this._lovelace) this._cardEd.lovelace = this._lovelace;
      if (JSON.stringify(this._cardEd.value) !== JSON.stringify(this._config.card)) this._cardEd.value = this._config.card;
    }
  }
}

// Tryb edycji dashboardu (sekcje): przycisk „Dodaj / Zdejmij blokadę” przy każdej karcie.
function bkFindAll(root, tag, out) {
  if (!root) return out;
  const els = root.querySelectorAll ? root.querySelectorAll('*') : [];
  for (const el of els) {
    if (el.localName === tag) out.push(el);
    if (el.shadowRoot) bkFindAll(el.shadowRoot, tag, out);
  }
  return out;
}
function bkEditTick() {
  if (!/[?&]edit=1/.test(location.search)) return;
  const ha = document.querySelector('home-assistant');
  if (!ha) return;
  for (const em of bkFindAll(ha.shadowRoot, 'hui-card-edit-mode', [])) {
    const path = em.path;
    const lovelace = em.lovelace;
    if (!path || !lovelace || !lovelace.config || !em.shadowRoot) continue;
    const [v, s, i] = path;
    const view = lovelace.config.views && lovelace.config.views[v];
    const cards = view && view.sections && view.sections[s] && view.sections[s].cards;
    const card = cards && cards[i];
    if (!card || card.type === 'heading' || card.type === 'custom:blokada-ustawienia') continue;
    const locked = card.type === 'custom:blokada-kafelka';
    let b = em.shadowRoot.querySelector('.bk-edit');
    if (!b) {
      b = document.createElement('div');
      b.className = 'bk-edit';
      b.style.cssText = 'position:absolute;left:6px;bottom:6px;z-index:10;display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:16px;'
        + 'font:500 12px Roboto,sans-serif;cursor:pointer;background:rgba(20,20,20,.85);backdrop-filter:blur(2px)';
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const ll = em.lovelace;
        const [pv, ps, pi] = em.path;
        const conf = JSON.parse(JSON.stringify(ll.config));
        const list = conf.views[pv].sections[ps].cards;
        const cur = list[pi];
        if (cur.type === 'custom:blokada-kafelka') list[pi] = Object.assign({}, cur.card, cur.grid_options ? { grid_options: cur.grid_options } : {});
        else {
          const w = { type: 'custom:blokada-kafelka', card: Object.assign({}, cur) };
          if (cur.grid_options) { w.grid_options = cur.grid_options; delete w.card.grid_options; }
          if (cur.visibility) { w.visibility = cur.visibility; delete w.card.visibility; }
          list[pi] = w;
        }
        ll.saveConfig(conf).then(() => bkToast(em, cur.type === 'custom:blokada-kafelka' ? '🗑️ Blokada zdjęta' : '🔒 Blokada dodana'));
      });
      em.shadowRoot.appendChild(b);
    }
    const key = locked ? 'on' : 'off';
    if (b.dataset.k !== key) {
      b.dataset.k = key;
      b.style.border = '1px solid ' + (locked ? '#0D904F' : '#DB4437');
      b.style.color = locked ? '#81c784' : '#ff8a80';
      b.innerHTML = locked ? bkSvg(BK_OPEN, '#81c784', 16) + 'Zdejmij blokadę' : bkSvg(BK_LOCK, '#ff8a80', 16) + 'Dodaj blokadę';
    }
  }
}
if (!window.__bkEditTimer) window.__bkEditTimer = setInterval(bkEditTick, 1200);

// Przytrzymanie dowolnej karty 3 s (poza trybem edycji) = menu blokady dla tej karty.
const BK_LONG_MS = 3000;
function bkHass() { const ha = document.querySelector('home-assistant'); return ha && ha.hass; }
function bkWrap(o) {
  const card = Object.assign({}, o);
  const w = { type: 'custom:blokada-kafelka', card };
  if (o.grid_options) { w.grid_options = o.grid_options; delete card.grid_options; }
  if (o.visibility) { w.visibility = o.visibility; delete card.visibility; }
  if (o.view_layout) { w.view_layout = o.view_layout; delete card.view_layout; }
  return w;
}
function bkCardName(hass, c) {
  const st = hass && c.entity && hass.states[c.entity];
  return c.name || c.title || (st && st.attributes.friendly_name) || c.entity || String(c.type || 'karta').replace('custom:', '');
}
function bkLongMenu(cands) {
  const first = cands[0];
  if (first.lock) { first.lock._menu(); return; }
  const hass = bkHass();
  if (!hass) return;
  const ha = document.querySelector('home-assistant');
  ha.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: null }, bubbles: true, composed: true }));
  if (navigator.vibrate) navigator.vibrate(30);
  const items = cands.filter((c) => c.config && c.config.type !== 'custom:blokada-ustawienia').slice(0, 3);
  if (!items.length) return;
  bkDialog(`<div class="hd">${bkSvg(BK_LOCK, '#DB4437', 22)}Blokada karty</div>
    ${items.map((c, i) => `<div class="it" data-i="${i}">${bkSvg(BK_LOCK, '#DB4437', 24)}<span>Dodaj blokadę${i ? ' na całą grupę' : ''}<small>${bkCardName(hass, c.config)}</small></span></div>`).join('')}
    <div class="it" data-g="1">🌐<span>Ustawienia wspólne kłódek<small>panel 🔒 Blokady</small></span></div>
    <div class="it mut" data-x="1">Anuluj</div>`, (sr, close) => {
    sr.querySelectorAll('.it').forEach((it) => it.addEventListener('click', async () => {
      close();
      if (it.dataset.g) { history.pushState(null, '', '/' + BK_GLOBAL_DASH); window.dispatchEvent(new CustomEvent('location-changed')); return; }
      if (it.dataset.i === undefined) return;
      const c = items[Number(it.dataset.i)];
      try {
        await bkPatchDashboard(hass, c.config, bkWrap);
        bkToast(ha, '🔒 Blokada dodana');
      } catch (err) {
        bkToast(ha, '🔒 Nie dodano: ' + (err && err.message ? err.message : err));
      }
    }));
  });
}
if (!window.__bkLong) {
  window.__bkLong = true;
  let t = null; let sx = 0; let sy = 0;
  const cancel = () => { clearTimeout(t); t = null; };
  window.addEventListener('pointerdown', (e) => {
    cancel();
    if (/[?&]edit=1/.test(location.search) || (e.button && e.button !== 0)) return;
    const path = e.composedPath();
    const cands = [];
    for (const n of path) {
      if (!n || !n.localName) continue;
      if (n.classList && n.classList.contains('lk') && n.parentNode && n.parentNode.classList && n.parentNode.classList.contains('wrap')) return;
      if (n.localName === 'blokada-kafelka') { if (!cands.length) cands.push({ lock: n }); break; }
      if (n.localName === 'blokada-ustawienia') return;
      if (n.localName === 'hui-card' && n.config) cands.push({ config: n.config });
    }
    if (!cands.length) return;
    sx = e.clientX; sy = e.clientY;
    t = setTimeout(() => { t = null; bkLongMenu(cands); }, BK_LONG_MS);
  }, true);
  window.addEventListener('pointermove', (e) => { if (t && Math.hypot(e.clientX - sx, e.clientY - sy) > 12) cancel(); }, true);
  ['pointerup', 'pointercancel', 'scroll', 'wheel'].forEach((ev) => window.addEventListener(ev, cancel, true));
}

// Panel „🔒 Blokady”: wspólne ustawienia wszystkich kłódek + lista kłódek na dashboardach.
class BlokadaUstawienia extends HTMLElement {
  setConfig(config) { this._config = config || {}; }
  getCardSize() { return 12; }
  set hass(h) {
    this._hass = h;
    if (this._form) this._form.hass = h;
    if (!this._built) { this._built = true; this._build(); }
  }

  async _build() {
    this.innerHTML = `<ha-card header="🔒 Wspólne ustawienia kłódek">
      <div style="padding:0 16px 8px;font-size:14px;opacity:.8">Dotyczą wszystkich kłódek na wszystkich dashboardach.
      Kłódka, której ustawienia zmienisz osobno (przytrzymaj ją 3 s → ⚙️), zachowuje swoje zmiany.</div>
      <div class="frm" style="padding:0 16px"></div>
      <div style="display:flex;justify-content:flex-end;gap:12px;padding:12px 16px 16px">
        <button class="def" style="background:none;border:0;color:var(--secondary-text-color);font:600 14px Roboto,sans-serif;cursor:pointer">PRZYWRÓĆ FABRYCZNE</button>
        <button class="sv" style="background:var(--primary-color,#03a9f4);color:#fff;border:0;border-radius:18px;padding:8px 22px;font:600 14px Roboto,sans-serif;cursor:pointer">ZAPISZ</button>
      </div></ha-card>
      <ha-card header="📋 Kłódki na dashboardach" style="margin-top:16px"><div class="lst" style="padding:0 16px 16px;font-size:14px">Wczytuję…</div></ha-card>`;
    const users = await bkUsers(this._hass);
    this._data = Object.assign({}, BK_DEF, this._config.defaults || {});
    const form = document.createElement('ha-form');
    form.hass = this._hass;
    form.schema = bkSchema(users);
    form.data = this._data;
    form.computeLabel = (s) => BK_LABELS[s.name] || s.name;
    form.addEventListener('value-changed', (e) => { this._data = e.detail.value; form.data = this._data; });
    this.querySelector('.frm').appendChild(form);
    this._form = form;
    this.querySelector('.sv').onclick = () => this._save(this._data);
    this.querySelector('.def').onclick = () => { this._data = Object.assign({}, BK_DEF); form.data = this._data; };
    this._list();
  }

  async _save(data) {
    const urlPath = bkUrlPath();
    try {
      const cfg = await this._hass.callWS({ type: 'lovelace/config', url_path: urlPath });
      const defs = {};
      Object.keys(BK_DEF).forEach((k) => { if (data[k] !== undefined) defs[k] = data[k]; });
      let hit = 0;
      const walk = (o) => {
        if (Array.isArray(o)) o.forEach(walk);
        else if (o && typeof o === 'object') {
          if (o.type === 'custom:blokada-ustawienia') { o.defaults = defs; hit++; } else Object.values(o).forEach(walk);
        }
      };
      walk(cfg);
      if (!hit) throw new Error('nie znaleziono karty ustawień');
      await this._hass.callWS({ type: 'lovelace/config/save', url_path: urlPath, config: cfg });
      await bkGlobal(this._hass, true);
      bkToast(this, '🔒 Zapisano wspólne ustawienia kłódek');
    } catch (err) {
      bkToast(this, '🔒 Nie zapisano: ' + (err && err.message ? err.message : err));
    }
  }

  async _list() {
    const box = this.querySelector('.lst');
    let dashes = [];
    try { dashes = await this._hass.callWS({ type: 'lovelace/dashboards/list' }); } catch (_) { /* brak uprawnień */ }
    const all = [{ url_path: null, title: 'Główna' }].concat(dashes.filter((d) => d.mode !== 'yaml'));
    const rows = [];
    for (const d of all) {
      let cfg;
      try { cfg = await this._hass.callWS({ type: 'lovelace/config', url_path: d.url_path }); } catch (_) { continue; }
      (cfg.views || []).forEach((v, i) => {
        let n = 0; let own = 0;
        const walk = (o) => {
          if (Array.isArray(o)) o.forEach(walk);
          else if (o && typeof o === 'object') {
            if (o.type === 'custom:blokada-kafelka') { n++; if (bkOwnKeys(o).length) own++; }
            Object.values(o).forEach(walk);
          }
        };
        walk(v);
        if (n) rows.push({ href: '/' + (d.url_path || 'lovelace') + '/' + (v.path || i), name: `${d.title} › ${v.title || v.path || i}`, n, own });
      });
    }
    box.innerHTML = rows.length ? rows.map((r) => `<a href="${r.href}" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--divider-color);color:inherit;text-decoration:none">
      <span>${r.name}</span><span>🔒 ${r.n}${r.own ? ` · ⚙️ ${r.own} własne` : ''}</span></a>`).join('') : 'Brak kłódek.';
  }
}

if (!customElements.get('blokada-kafelka')) customElements.define('blokada-kafelka', BlokadaKafelka);
if (!customElements.get('blokada-ustawienia')) customElements.define('blokada-ustawienia', BlokadaUstawienia);
if (!customElements.get('blokada-kafelka-editor')) customElements.define('blokada-kafelka-editor', BlokadaKafelkaEditor);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'blokada-kafelka', name: '🔒 Blokada kafelka', description: 'Blokada dowolnej karty: kłódka (przytrzymaj / 2× / PIN / pytanie), auto-blokada, menu kłódki, godziny, wyjątki' });
