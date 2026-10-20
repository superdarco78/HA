// 🪟 esc-editor v1 – edytor wizualny dla custom:enhanced-shutter-card (karta z HACS nie ma własnego).
// Dokłada edytor do istniejącej karty; samej karty nie zmienia. Pola, których tu nie ma, zostają w YAML bez zmian.

const ESC_STATES = [
  { value: 'open', label: 'Otwarta' }, { value: 'opening', label: 'Otwiera się' }, { value: 'closing', label: 'Zamyka się' },
  { value: 'closed', label: 'Zamknięta' }, { value: 'partial_open', label: 'Częściowo otwarta' },
];
const ESC_SCHEMA = [
  { name: 'entity', required: true, selector: { entity: { domain: 'cover' } } },
  { name: 'name', selector: { text: {} } },
  { type: 'expandable', name: '', flatten: true, title: '🖼️ Wygląd okna', schema: [
    { name: 'window_image', selector: { text: {} } },
    { name: 'shutter_slat_image', selector: { text: {} } },
  ] },
  { type: 'expandable', name: '', flatten: true, title: '📐 Rozmiar i położenie', schema: [
    { name: 'base_height_px', selector: { number: { min: 50, max: 1000, step: 1, mode: 'box', unit_of_measurement: 'px' } } },
    { name: 'base_width_px', selector: { number: { min: 50, max: 1000, step: 1, mode: 'box', unit_of_measurement: 'px' } } },
    { name: 'resize_height_pct', selector: { number: { min: 10, max: 400, step: 1, mode: 'box', unit_of_measurement: '%' } } },
    { name: 'resize_width_pct', selector: { number: { min: 10, max: 400, step: 1, mode: 'box', unit_of_measurement: '%' } } },
    { name: 'top_offset_pct', selector: { number: { min: 0, max: 100, step: 1, mode: 'slider', unit_of_measurement: '%' } } },
  ] },
  { type: 'expandable', name: '', flatten: true, title: '🔠 Skalowanie', schema: [
    { name: 'scale_texts', selector: { number: { min: 0.5, max: 3, step: 0.1, mode: 'slider' } } },
    { name: 'scale_buttons', selector: { boolean: {} } },
    { name: 'scale_icons', selector: { boolean: {} } },
  ] },
  { type: 'expandable', name: '', flatten: true, title: '🔘 Kiedy ukryć przyciski', schema: [
    { name: 'button_up_hide_states', selector: { select: { multiple: true, mode: 'list', options: ESC_STATES } } },
    { name: 'button_stop_hide_states', selector: { select: { multiple: true, mode: 'list', options: ESC_STATES } } },
    { name: 'button_down_hide_states', selector: { select: { multiple: true, mode: 'list', options: ESC_STATES } } },
  ] },
];
const ESC_LABELS = {
  entity: 'Roleta (encja)', name: 'Nazwa', window_image: 'Obraz okna (np. esc-window2.png)',
  shutter_slat_image: 'Kolor lub obraz lamel (np. #fc9907)', base_height_px: 'Wysokość bazowa', base_width_px: 'Szerokość bazowa',
  resize_height_pct: 'Powiększenie wysokości', resize_width_pct: 'Powiększenie szerokości', top_offset_pct: 'Przesunięcie od góry',
  scale_texts: 'Skala tekstów', scale_buttons: 'Skaluj przyciski', scale_icons: 'Skaluj ikony',
  button_up_hide_states: '⬆️ Ukryj „w górę”, gdy roleta jest', button_stop_hide_states: '⏹️ Ukryj „stop”, gdy roleta jest',
  button_down_hide_states: '⬇️ Ukryj „w dół”, gdy roleta jest',
};

class EscGuiEditor extends HTMLElement {
  setConfig(config) { this._config = config; this._render(); }
  set hass(h) { this._hass = h; (this._forms || []).forEach((f) => { f.hass = h; }); }
  _ents() { return (this._config.entities || []).map((e) => (typeof e === 'string' ? { entity: e } : e)); }
  _set(list) {
    this._config = Object.assign({}, this._config, { entities: list });
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
  }
  _render() {
    if (!this._config) return;
    const ents = this._ents();
    if (this._forms && this._n === ents.length) { this._forms.forEach((f, i) => { f.data = ents[i]; }); return; }
    this._n = ents.length;
    this.innerHTML = '';
    this._forms = [];
    ents.forEach((e, i) => {
      const box = document.createElement('div');
      box.style.cssText = 'border:1px solid var(--divider-color);border-radius:12px;padding:8px 12px 12px;margin-bottom:12px';
      const hd = document.createElement('div');
      hd.style.cssText = 'display:flex;justify-content:space-between;align-items:center;font-weight:600;margin-bottom:6px';
      hd.innerHTML = `<span>🪟 Okno ${i + 1}</span>`;
      if (ents.length > 1) {
        const del = document.createElement('span');
        del.textContent = '🗑️ Usuń okno';
        del.style.cssText = 'cursor:pointer;color:var(--error-color,#db4437);font-weight:500;font-size:13px';
        del.onclick = () => { const l = this._ents(); l.splice(i, 1); this._set(l); this._render(); };
        hd.appendChild(del);
      }
      box.appendChild(hd);
      const form = document.createElement('ha-form');
      form.hass = this._hass;
      form.schema = ESC_SCHEMA;
      form.data = e;
      form.computeLabel = (s) => ESC_LABELS[s.name] || s.name;
      form.addEventListener('value-changed', (ev) => {
        ev.stopPropagation();
        const l = this._ents();
        l[i] = ev.detail.value;
        this._set(l);
      });
      box.appendChild(form);
      this.appendChild(box);
      this._forms.push(form);
    });
    const add = document.createElement('div');
    add.textContent = '➕ Dodaj okno';
    add.style.cssText = 'cursor:pointer;color:var(--primary-color);font-weight:600;padding:6px 0';
    add.onclick = () => {
      const l = this._ents();
      const last = l[l.length - 1] || {};
      l.push(Object.assign({}, last, { entity: '', name: '' }));
      this._set(l);
      this._render();
    };
    this.appendChild(add);
  }
}
if (!customElements.get('esc-gui-editor')) customElements.define('esc-gui-editor', EscGuiEditor);
customElements.whenDefined('enhanced-shutter-card').then(() => {
  const cls = customElements.get('enhanced-shutter-card');
  if (cls && !cls.getConfigElement) cls.getConfigElement = () => document.createElement('esc-gui-editor');
});
