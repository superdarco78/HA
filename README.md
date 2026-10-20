# 🏠 HA – karty do Home Assistanta

Karty Lovelace do Home Assistanta, pogrupowane tematycznie. Każda karta ma własny folder z plikiem `.js`, opisem, zrzutami i instrukcją instalacji.

*Lovelace cards for Home Assistant, grouped by topic. Each card has its own folder with the `.js` file, description, screenshots and install guide.*

## 📂 Zawartość

| Temat | Karta | Wersja | Co robi |
|---|---|---|---|
| 🪟 [okna](okna/) | [Roleta dzień-noc](okna/roleta-realistyczna/) | v22 | Roleta dzień-noc na oknie: animacja w tempie silnika, pogoda za oknem, kreator |
| 🪟 [okna](okna/) | [Edytor Enhanced Shutter Card](okna/esc-editor/) | v1 | Edytor wizualny dla karty `enhanced-shutter-card` z HACS |
| 🧩 [pulpit](pulpit/) | [Blokada kafelka](pulpit/blokada-kafelka/) | v6 | Kłódka na dowolną kartę, żeby nikt nie kliknął przez przypadek |
| 📅 [harmonogramy](harmonogramy/) | [Harmonogramy Shelly](harmonogramy/shelly-schedule-card/) | v18 | Harmonogramy w stylu aplikacji Shelly (dane: Scheduler) |

## ⬇️ Instalacja (każda karta)

1. Pobierz plik `.js` z folderu karty i wgraj go do `/config/www/` (np. przez dodatek **File editor** albo **Samba**).
2. **Ustawienia → Pulpity → ⋮ (prawy górny róg) → Zasoby → Dodaj zasób**
   - Adres: `/local/nazwa-pliku.js`
   - Typ: **Moduł JavaScript**
3. Odśwież przeglądarkę (Ctrl+Shift+R) albo aplikację HA.
4. Pulpit → **Edytuj → Dodaj kartę** → wyszukaj kartę po nazwie.

## 📜 Licencja

[CC BY-NC-SA 4.0](LICENSE) – do własnego, niekomercyjnego użytku, z podaniem autora. Sprzedaż i użycie komercyjne zabronione.
