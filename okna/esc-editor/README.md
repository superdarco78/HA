# 🪟 Edytor do Enhanced Shutter Card

Karta [Enhanced Shutter Card](https://github.com/marcelhoogantink/enhanced-shutter-card) z HACS nie ma edytora wizualnego. Ten plik go dokłada: encja, nazwa, obrazki okna, rozmiar i położenie, stany. Samej karty nie zmienia, a pola, których edytor nie zna, zostają w YAML bez zmian.

## Wymagania

- Zainstalowana karta `enhanced-shutter-card` (HACS).

## Instalacja

1. Skopiuj `esc-editor.js` do `/config/www/`.
2. **Ustawienia → Pulpity → ⋮ → Zasoby → Dodaj zasób**: `/local/esc-editor.js`, typ **Moduł JavaScript**.
3. Odśwież przeglądarkę (Ctrl+Shift+R). Przy edycji karty Enhanced Shutter pojawi się edytor.

## 📜 Licencja

[CC BY-NC-SA 4.0](../../LICENSE) – autor: [superdarco78](https://github.com/superdarco78).
