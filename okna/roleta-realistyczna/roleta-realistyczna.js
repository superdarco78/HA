/* roleta-realistyczna v7 – roleta dzień-noc (zebra) na oknie 2-skrzydłowym, z animacją (Dom v2)
   type: custom:roleta-realistyczna
   entity (cover lub grupa coverów – każde skrzydło dostaje swoją roletę), name,
   kolor (pasy pełne), rama (kolor ramy), czas (s pełnego przejazdu), wysokosc (px),
   skrzydla (1/2), przyciski, niebo, osobno (przeciąganie rusza jedno skrzydło), odwroc (odwrócona pozycja) */
/* Zmiany:
   v1 – okno 2-skrzydłowe, biała kasetka, pasy dzień-noc, przeciąganie, przyciski, niebo dzień/noc, edytor wizualny
   v2 – przeciąganie ustawia oba skrzydła naraz (opcja „osobno” = jedno); animacja 1:1 w tempie silnika (czas przejazdu),
        rusza od razu po kliknięciu; poprawka silników Zigbee, które przy „open” podają 0%; opcja „odwroc”; numer wersji w konsoli
   v3 – śledzenie silnika: każdy meldunek pozycji z silnika od razu (płynnie, ~0,5 s) przesuwa roletę na zgłoszone miejsce,
        a między meldunkami jedzie w tempie silnika; chwilowe „0%” przy stanie otwarta jest pomijane (błąd meldunku Zigbee)
   v4 – tempo animacji z prawdziwej prędkości silnika Moes (encja number.*_motor_speed, obr/min) osobno dla każdego skrzydła:
        czas przejazdu = „czas” × („obroty_ref” / obroty silnika); zmiana prędkości silnika w HA od razu zmienia animację
   v5 – numer wersji widoczny na karcie (obok nazwy) i w nazwie karty na liście kart
   v6 – edytor graficzny jak symulator: kółka kolorów (pasy i rama, plus własny kolor), przyciski skrzydeł, suwaki,
        przełączniki i żywy podgląd z przyciskiem „Pokaż animację” (udawany silnik w tempie prawdziwych silników)
   v7 – „open 0%” na końcu opuszczania jest przyjmowane (to prawdziwe 0%), na starcie podnoszenia pomijane;
        czas zmierzony na prawdziwych roletach 20.10: 40 obr/min ≈ 30 s, 255 obr/min ≈ 22 s → czas = 20,2 + 394 / obroty
        (tryb „auto”, domyślny); ruch startuje też, gdy roletę ruszy ktoś inny (pilot, automatyzacja, inny panel) –
        silnik Moes od razu zmienia stan na „open”/„closed”, a pozycję podaje dopiero na końcu; ręczny czas nadal możliwy
   v8 – prawdziwa pogoda za oknem z Home Assistanta (encja weather, domyślnie weather.dom): słońce, chmury płynące po niebie,
        deszcz, ulewa, burza z błyskami, śnieg, mgła, wiatr; w nocy księżyc i migające gwiazdy (wg sun.sun);
        temperatura i opis pogody w podtytule; w edytorze wybór encji pogody i przyciski „pogoda w podglądzie”;
        uchwyt do podnoszenia na środku dolnej listwy każdego skrzydła
   v9 – pogoda rusza się też na telefonie z włączonym „ograniczeniem ruchu” / oszczędzaniem baterii (v8 ją wtedy zamrażała);
        błysk burzy w obu skrzydłach naraz
   v10 – animacja nie skacze od fałszywych meldunków Moes (test Dariusza 20.10 19:28: przy „50%” silniki meldowały 0 i 100
        w trakcie jazdy, prawy nawet na końcu 100, choć oba stanęły w połowie): po komendzie z karty liczy się cel komendy,
        meldunki 0/100 niezgodne z celem są pomijane, a każdy meldunek brany jest tylko raz; po przeciągnięciu lub kliknięciu
        przerywana linia z „→ 50%” pokazuje, gdzie roleta jedzie, aż dojedzie; w nagłówku „32% → 50%”
   v11 – 3 uchwyty: uchwyt na dolnej listwie skrzydła steruje tylko tym skrzydłem, okrągły uchwyt na środku okna (na słupku)
        steruje oboma naraz; przeciąganie w innym miejscu szyby jak dotąd (oba, albo jedno z opcją „osobno”)
   v12 – własne zdjęcie widoku zza okna jako tło (opcja „tlo”, np. /local/okno.jpg): jedno zdjęcie przez oba skrzydła,
        na nim animowana pogoda (chmury, deszcz, śnieg, mgła, błyski), przyciemnienie wg pogody i noc (ciemno + gwiazdy)
   v13 – poprawka: po STOP i po dojechaniu animacja nie skacze od spóźnionych meldunków silnika (Moes potrafi wysłać
        fałszywe 100% nawet 50 s później) – okno spokoju wydłużone do 60 s i działa też po STOP
   v14 – rysowany widok za oknem (gdy nie ma zdjęcia): wzgórza, domy, drzewa, ulica i latarnia, jeden widok przez oba skrzydła;
        zmienia się z pogodą: śnieg na dachach i trawie, mokra ulica z odbiciami przy deszczu, drzewa kołyszą się przy wietrze
        i burzy, pochmurno = szarzej; w nocy zapalone okna i świecące latarnie; jedno słońce/księżyc na całe okno;
        opcja „widok” (wyłączenie = samo niebo)
   v15 – okno uchylone albo otwarte wg kontaktronu: dla lewego i prawego skrzydła wybierasz czujnik (binary_sensor)
        i tryb – „uchyl” (góra skrzydła odchyla się do środka) albo „otworz” (skrzydło otwiera się na zawiasach);
        animacja ruchu skrzydła, za skrzydłem widać to, co za oknem; w podtytule „okno lewe uchylone”
   v16 – uniwersalnie, także bez integracji pogody: gdy w HA nie ma encji weather.*, karta sama pobiera aktualną pogodę
        z internetu (Open-Meteo, darmowe, bez klucza) dla lokalizacji domu z HA, odświeżanie co 15 min;
        niebo zmienia się z porą dnia wg wysokości słońca (sun.sun): dzień, złota godzina przy wschodzie/zachodzie
        (pomarańczowe niebo, nisko słońce), zmierzch (fioletowe niebo, zapalone okna), noc;
        uchylenie skrzydła teraz do środka pokoju (góra skrzydła do nas), otwarcie też do środka;
        dotknięcie rolety jak pilot z jednym przyciskiem: w trakcie jazdy = STOP, kolejne dotknięcie = jazda w przeciwną
        stronę (stojąca na dole jedzie w górę, na górze w dół)
   v17 – uniwersalna dla każdego, nic na sztywno: w ustawieniach wybierasz rolety lewego i prawego skrzydła (albo grupę),
        encje prędkości silników (albo czas), źródło pogody (encja HA / internet / brak), kontaktrony; kalibracja czasu
        przejazdu stoperem w edytorze; język karty i edytora: auto / polski / English; uchwyty na listwie i środkowy
        można wyłączyć; ustawienia w edytorze pogrupowane w rozwijane sekcje; suwaki „jak mocno uchylone” (stopnie)
        i „jak szeroko otwarte” (% szerokości) – oba do środka pokoju; przy uchyleniu i otwarciu widać wyraźną szczelinę,
        a przez nią to, co za oknem (niebo, widok, pogoda)
   v18 – poprawka: otwarte skrzydło (lewe i prawe) otwiera się naprawdę do środka pokoju (wolny brzeg w naszą stronę), a nie na zewnątrz;
        automatyczna kalibracja jednym przyciskiem (roleta sama jedzie góra → dół → góra, karta mierzy i zapisuje czas);
        karta sama uczy się czasu przejazdu z każdego ruchu rolety, która melduje „otwiera/zamyka się”;
        ruch krokowy: przyciski ▲ 5% / ▼ 5% – każde kliknięcie to mały krok, kliknięcia się sumują (opcja krok, 0 = wyłączony);
        10 jaskrawych kolorów pasów (czerwony, bordo, różowy, fiolet, niebieski, turkus, zielony, limonka, żółty, oliwka)
        i osobny kolor pasów przezroczystych (opcja siatka, puste = jak pełne);
        własne szybkie pozycje (opcja pozycje, np. „100,60,30,0”); lekka wibracja telefonu przy kliknięciu (opcja wibracja)
   v19 – kolory ram jak w sklepach z oknami: okleiny drewnopodobne ze słojami (złoty dąb, orzech, mahoń, winchester, dąb bagienny,
        dąb jasny) i kolory gładkie (szary agat, srebrny, czarny, zieleń, ...); słupek między skrzydłami: stały (zostaje w oknie)
        albo ruchomy (przy lewym skrzydle, po otwarciu obu skrzydeł środek jest wolny; lewe skrzydło bez klamki) – opcja slupek;
        edytor: podgląd przypięty u góry (📌) – przy każdym ustawieniu od razu widać, jak wygląda; krótki opis pod każdą grupą;
        w podglądzie okno zamknięte / uchylone / otwarte, a suwaki uchyłu i otwarcia same pokazują okno w tym położeniu;
        paleta tkanin dzień-noc jak u producentów (naturalne, szarości, pastele, jaskrawe) i własny kolor;
        klamki okna jak prawdziwe (w dół zamknięte, poziomo otwarte, w górę uchylone; najpierw obrót klamki, potem skrzydło) – opcja klamki
   v20 – edytor: palety kolorów w kółkach w jednej przewijanej linii; wybrany kolor podświetlony i przewinięty na środek,
        pozostałe wyszarzone; nazwa wybranego koloru przy tytule grupy
   v21 – edytor: wybrane kółko koloru duże i świecące; pod każdą paletą suwak – przesuwasz palcem i od razu wybierasz kolor;
        automatyczne wykrywanie: prędkość silnika z tego samego urządzenia co roleta, kontaktrony okna z tego samego pomieszczenia
        (lewe/prawe po nazwie); w edytorze widać, co wykryto (opcja auto_czujniki, ręczny wybór ma pierwszeństwo);
        ustawienia globalne: „🌍 Zapisz jako domyślne dla wszystkich kart” – wygląd zapisany w profilu użytkownika HA,
        każda karta (i każda nowa) go przejmuje, a własne ustawienia karty mają pierwszeństwo; nowa karta sama wybiera grupę rolet
   v22 – 🪄 kreator w 3 krokach (wybierz roletę → co karta wykryła sama → gotowy wygląd), sam się otwiera przy nowej karcie;
        menu w rozwijanych działach: 🎨 Wygląd, 🪟 Okno, ⏱ Ruch i kalibracja, ⚙️ Zaawansowane; w każdym „↺ Przywróć domyślne” */
const RR_WERSJA = 'v22';
console.info('%c roleta-realistyczna ' + RR_WERSJA + ' ', 'background:#232427;color:#fff;border-radius:3px');
const RR_KOLORY = {
  czarny: '#232427', grafit: '#3a3d42', szary: '#6d7076', bezowy: '#bfae94', kremowy: '#e6dcc8',
  bialy: '#efefec', braz: '#5a4030', granat: '#25324d', pomaranczowy: '#fc9907',
  /* v19: tkaniny dzień-noc jak w kolekcjach producentów */
  piaskowy: '#d9c7a4', cappuccino: '#a88c72', mokka: '#6f5544', wenge: '#3d2f28', popiel: '#a9aaa6', srebrny: '#c4c6c8', stalowy: '#4f5a66',
  lawendowy: '#b9a8d6', pudrowy: '#e4b9b9', mietowy: '#a9dcc6', blekitny: '#9cc6e6', morski: '#1d6f7a', butelkowy: '#1f4d3a', musztardowy: '#c99a1a', terakota: '#b9583a', sliwkowy: '#5b2c4a',
  /* v18: jaskrawe */
  czerwony: '#e02424', bordo: '#7a1f2b', rozowy: '#ff4f9a', fiolet: '#8a3ffc', niebieski: '#1e6ff2', turkus: '#00b3b3',
  zielony: '#22a447', limonka: '#9bd426', zolty: '#ffd000', oliwka: '#6b7a3a'
};
const RR_DEF = { kolor: 'czarny', rama: '#f4f4f2', czas: 'auto', wysokosc: 260, skrzydla: 2, przyciski: true, niebo: true, osobno: false, odwroc: false, pogoda: 'auto', tlo: '', widok: true, czujnik_lewe: '', tryb_lewe: 'uchyl', czujnik_prawe: '', tryb_prawe: 'uchyl',
  roleta_lewa: '', roleta_prawa: '', predkosc_lewa: '', predkosc_prawa: '', zrodlo: 'auto', jezyk: 'auto', uchwyty: true, uchwyt_srodek: true, kat_uchyl: 14, otwarcie: 40, krok: 5, siatka: '', pozycje: '100,75,50,25,0', wibracja: true, slupek: 'staly', klamki: true, auto_czujniki: true };
const rrCzas = (c, rpm, ucz) => c === 'auto' || !(+c > 0) ? (rpm > 0 ? 20.2 + 394 / rpm : ucz > 0 ? ucz : 30) : Math.max(3, +c);   // s pełnego przejazdu
/* v18: czas przejazdu, którego karta sama się nauczyła z prawdziwych ruchów rolety (pamięć przeglądarki) */
const rrUcz = { get: e => { try { return +localStorage.getItem('rr-czas:' + e) || 0; } catch (x) { return 0; } },
  set: (e, v) => { try { localStorage.setItem('rr-czas:' + e, v.toFixed(1)); } catch (x) { /* brak pamięci – trudno */ } } };
const RR_PAS = 16, RR_SIATKA = 10;          // wysokość pasa pełnego i półprzezroczystego (px)
const RR_OKRES = RR_PAS + RR_SIATKA;
const RR_KASETA = 12, RR_LISTWA = 5;

/* pogoda HA → wygląd nieba */
const RR_WX = { sunny: 'sun', 'clear-night': 'sun', partlycloudy: 'partly', cloudy: 'cloudy', exceptional: 'cloudy', fog: 'fog',
  rainy: 'rain', pouring: 'pour', hail: 'pour', lightning: 'storm', 'lightning-rainy': 'storm', snowy: 'snow', 'snowy-rainy': 'sleet',
  windy: 'wind', 'windy-variant': 'wind' };
const RR_WX_PL = { sunny: 'słonecznie', 'clear-night': 'pogodnie', partlycloudy: 'częściowe zachmurzenie', cloudy: 'pochmurno', exceptional: 'wyjątkowa pogoda',
  fog: 'mgła', rainy: 'deszcz', pouring: 'ulewa', hail: 'grad', lightning: 'burza', 'lightning-rainy': 'burza z deszczem', snowy: 'śnieg',
  'snowy-rainy': 'deszcz ze śniegiem', windy: 'wietrznie', 'windy-variant': 'wietrznie, pochmurno' };
const RR_NIEBO = {   // [dzień, noc]
  sun: ['#4f9be3,#9fd0f5 60%,#e3f2fc', '#08112b,#1b2a52'], partly: ['#6aa6dc,#b7d8f0 60%,#e2eef7', '#0d1630,#24304f'],
  cloudy: ['#8e9ba7,#c3ccd4', '#151b27,#2b3242'], wind: ['#7f9db8,#c4d3df', '#121a2a,#283247'], fog: ['#a9b2b9,#d6dbde', '#1f242b,#3a4048'],
  rain: ['#5c6874,#8f9aa4', '#10151d,#262d38'], pour: ['#48525c,#737e88', '#0c1017,#1f252e'], storm: ['#2f363e,#59626b', '#07090d,#1a1f27'],
  snow: ['#a7b3be,#e3e8ec', '#1b2230,#3a4352'], sleet: ['#7d8893,#b5bec6', '#141a24,#2f3744']
};
const rrLos = (a, b) => a + Math.random() * (b - a);
/* rysowany widok za oknem (v14) – współrzędne 200×80, lewe skrzydło widzi 0–100, prawe 100–200 */
const RR_DOMY = [[8, 34, 22, '#c9a27e', '#8c3b2e'], [36, 46, 18, '#d8c8a8', '#5d4a3c'], [60, 30, 26, '#b8bfc6', '#4a5560'],
  [112, 40, 20, '#e0d2b6', '#8c3b2e'], [140, 28, 24, '#c7b39a', '#6b4a32'], [170, 42, 20, '#bcc6cc', '#4a5560']];
const RR_LAMPY = [78, 124];
const RR_DRZEWA = [[3, 9], [30, 8], [55, 10], [92, 11], [104, 9], [134, 8], [164, 10], [195, 9]];
function rrWidok(typ, noc, i, n, pora) {
  const snieg = typ === 'snow' || typ === 'sleet', mokro = ['rain', 'pour', 'storm', 'sleet'].includes(typ);
  const wiatr = typ === 'wind' || typ === 'storm' || typ === 'pour';
  const szaro = { cloudy: .82, fog: .85, rain: .7, pour: .6, storm: .5, sleet: .7, wind: .9, snow: .92 }[typ] || 1;
  const filtr = pora === 'zmierzch' ? 'brightness(.55) saturate(.7) hue-rotate(-12deg)' : noc ? 'brightness(.38) saturate(.6) hue-rotate(10deg)'
    : pora === 'zloto' ? `brightness(${szaro * .95}) sepia(.3) saturate(1.25)` : `brightness(${szaro}) saturate(${szaro})`;
  const vb = n > 1 ? `${i ? 100 : 0} 0 100 80` : '0 0 200 80';
  const pa = (n > 1 ? (i ? 'xMinYMax' : 'xMaxYMax') : 'xMidYMax') + ' slice';   // skrzydła stykają się przy słupku – widok ciągły
  const g = [];
  g.push(`<path d="M0 52 Q30 38 60 48 T120 44 T200 50 V80 H0Z" fill="${snieg ? '#e8eef2' : '#7fa86a'}"/>`);
  g.push(`<path d="M0 60 Q50 52 100 58 T200 56 V80 H0Z" fill="${snieg ? '#f4f7f9' : '#6a9a58'}"/>`);
  RR_DOMY.forEach(([x, y, w, sc, da]) => {
    g.push(`<rect x="${x}" y="${y}" width="${w}" height="${66 - y}" fill="${sc}"/>`);
    g.push(`<path d="M${x - 2} ${y} L${x + w / 2} ${y - w * .45} L${x + w + 2} ${y}Z" fill="${da}"/>`);
    if (snieg) g.push(`<path d="M${x - 2} ${y} L${x + w / 2} ${y - w * .45} L${x + w + 2} ${y} L${x + w} ${y - 1.5} L${x + w / 2} ${y - w * .45 + 2} L${x} ${y - 1.5}Z" fill="#fff"/>`);
    for (let r = y + 4; r < 60; r += 9) for (let c = x + 3; c < x + w - 4; c += 8) g.push(`<rect class="okn" x="${c}" y="${r}" width="4" height="5" fill="#9fb7c9"/>`);
  });
  RR_DRZEWA.forEach(([x, r]) => {
    g.push(`<g class="${wiatr ? 'drz' : ''}" style="transform-origin:${x}px 66px;animation-delay:-${(x % 7) / 3}s"><rect x="${x - 1}" y="${66 - r}" width="2" height="${r}" fill="#5b4030"/>`
      + `<circle cx="${x}" cy="${66 - r}" r="${r * .6}" fill="${snieg ? '#dfe8e4' : '#3f7f3a'}"/><circle cx="${x - r * .35}" cy="${66 - r * .7}" r="${r * .45}" fill="${snieg ? '#cfdcd6' : '#357235'}"/></g>`);
  });
  g.push(`<rect x="0" y="66" width="200" height="14" fill="${snieg ? '#e9eef1' : mokro ? '#3c4248' : '#6c6f73'}"/>`);
  g.push(`<rect x="0" y="72" width="200" height="1" fill="${snieg ? '#fff' : '#d8d8d0'}" opacity=".5"/>`);
  if (mokro) for (let k = 0; k < 12; k++) g.push(`<rect x="${k * 17 + 4}" y="${68 + (k % 3) * 3}" width="7" height=".6" fill="#9fb1c0" opacity=".6"/>`);
  RR_LAMPY.forEach(x => g.push(`<rect x="${x - .7}" y="46" width="1.4" height="20" fill="#30343a"/><rect x="${x - 3.5}" y="45" width="7" height="1.6" rx=".8" fill="#30343a"/>`));
  /* światła nocą – osobna warstwa bez przyciemnienia */
  const sw = [];
  if (noc) {
    RR_DOMY.forEach(([x, y, w], d) => {
      let k = 0;
      for (let r = y + 4; r < 60; r += 9) for (let c = x + 3; c < x + w - 4; c += 8) if ((d * 7 + k++ * 3) % 5 < 3) sw.push(`<rect x="${c}" y="${r}" width="4" height="5" fill="#ffd27a"/>`);
    });
    RR_LAMPY.forEach(x => sw.push(`<circle cx="${x}" cy="47.5" r="9" fill="url(#rrlamp)"/><circle cx="${x}" cy="47" r="1.6" fill="#fff4c8"/>`
      + `<ellipse cx="${x}" cy="70" rx="14" ry="3" fill="#ffd27a" opacity="${mokro ? .45 : .25}"/>`));
  }
  return `<svg class="scn" viewBox="${vb}" preserveAspectRatio="${pa}" style="filter:${filtr}">${g.join('')}</svg>`
    + (sw.length ? `<svg class="scn" viewBox="${vb}" preserveAspectRatio="${pa}"><defs><radialGradient id="rrlamp"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".9"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient></defs>${sw.join('')}</svg>` : '');
}
/* przyciemnienie zdjęcia zza okna wg pogody (v12) */
const RR_TINT = { sun: 0, partly: .06, wind: .18, cloudy: .32, fog: 0, rain: .4, pour: .5, storm: .6, snow: 0, sleet: .38 };
/* pogoda z internetu (v16) – kody WMO z Open-Meteo → stany pogody HA; jedna kopia na całą stronę */
const RR_OM = { t: 0, data: null, busy: false, cb: new Set() };
function rrWmo(k, dzien, wiatr) {
  const s = k === 0 ? (dzien ? 'sunny' : 'clear-night') : k <= 2 ? 'partlycloudy' : k === 3 ? 'cloudy' : k <= 48 ? 'fog'
    : k <= 63 || k === 80 || k === 81 ? 'rainy' : k === 65 || k === 82 ? 'pouring' : k <= 67 ? 'snowy-rainy'
    : k <= 77 || k === 85 || k === 86 ? 'snowy' : k === 95 ? 'lightning-rainy' : k >= 96 ? 'hail' : 'cloudy';
  return wiatr > 40 && ['sunny', 'partlycloudy', 'cloudy'].includes(s) ? (s === 'cloudy' ? 'windy-variant' : 'windy') : s;
}
function rrInternet(hass, cb) {
  const lat = hass?.config?.latitude, lon = hass?.config?.longitude;
  if (lat == null || lon == null) return null;
  if (Date.now() - RR_OM.t < 15 * 60000) return RR_OM.data;
  RR_OM.cb.add(cb);
  if (!RR_OM.busy) {
    RR_OM.busy = true;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m,is_day,wind_speed_10m`)
      .then(r => r.json()).then(j => {
        const c = j.current;
        RR_OM.data = { state: rrWmo(c.weather_code, c.is_day, c.wind_speed_10m), attributes: { temperature: c.temperature_2m, temperature_unit: '°C', zrodlo: 'internet' } };
      }).catch(() => {}).finally(() => { RR_OM.t = Date.now(); RR_OM.busy = false; RR_OM.cb.forEach(f => f()); RR_OM.cb.clear(); });
  }
  return RR_OM.data;
}
function rrPogoda(typ, noc, i, foto, n, widok, pora) {
  const h = [], dark = ['rain', 'pour', 'storm', 'sleet'].includes(typ);
  if (noc && ['sun', 'partly', 'wind'].includes(typ))
    for (let k = 0; k < 16; k++) h.push(`<i class="st" style="left:${rrLos(4, 96)}%;top:${rrLos(4, 80)}%;animation-delay:-${rrLos(0, 4)}s;animation-duration:${rrLos(2, 5)}s"></i>`);
  if (!foto && !(n > 1 && i === 0) && (typ === 'sun' || typ === 'partly' || typ === 'wind')) h.push(noc ?   // jedno słońce/księżyc na całe okno
    `<i class="moon" style="${i ? 'left:22%' : 'right:20%'}"></i>` : `<i class="sun${pora === 'zloto' ? ' zl' : ''}" style="${i ? 'left:16%' : 'right:14%'}"></i>`);
  const nc = { sun: 0, partly: 2, wind: 3, cloudy: 4, fog: 2, rain: 4, pour: 5, storm: 5, snow: 4, sleet: 4 }[typ] || 0;
  const kol = noc ? (dark ? '#2a303a' : '#3b4354') : typ === 'storm' ? '#4c535b' : typ === 'pour' ? '#6b747c' : dark ? '#8b949c' : typ === 'partly' || typ === 'wind' ? '#ffffff' : '#e4e8eb';
  const czas = typ === 'wind' ? [9, 15] : [40, 75];
  for (let k = 0; k < nc; k++) {
    const d = rrLos(...czas);
    h.push(`<i class="cl" style="top:${rrLos(-4, 78)}%;width:${rrLos(45, 75)}%;background:${kol};opacity:${rrLos(.8, .97).toFixed(2)};animation-duration:${d}s;animation-delay:-${rrLos(0, d)}s"></i>`);
  }
  if (!foto && widok) h.push(rrWidok(typ, noc, i, n, pora));
  if (typ === 'fog') for (let k = 0; k < 4; k++) h.push(`<i class="fog" style="top:${15 + k * 22}%;animation-duration:${rrLos(14, 24)}s;animation-delay:-${rrLos(0, 10)}s"></i>`);
  const dr = { rain: 22, pour: 40, storm: 34, sleet: 14 }[typ] || 0;
  for (let k = 0; k < dr; k++) h.push(`<i class="dr" style="left:${rrLos(-5, 105)}%;animation-duration:${rrLos(typ === 'pour' ? .45 : .6, typ === 'pour' ? .65 : .9).toFixed(2)}s;animation-delay:-${rrLos(0, 1).toFixed(2)}s"></i>`);
  const fl = { snow: 26, sleet: 10 }[typ] || 0;
  for (let k = 0; k < fl; k++) { const z = rrLos(2, 5).toFixed(1); h.push(`<i class="fl" style="left:${rrLos(0, 100)}%;width:${z}px;height:${z}px;animation-duration:${rrLos(5, 10).toFixed(1)}s;animation-delay:-${rrLos(0, 10).toFixed(1)}s"></i>`); }
  if (typ === 'storm') h.push(`<i class="fla"></i>`);
  const g = RR_NIEBO[typ] || RR_NIEBO.sun;
  if (foto) {   // zdjęcie: jedno przez oba skrzydła (lewe pokazuje lewą część, prawe prawą), na nim pogoda
    const t = RR_TINT[typ] || 0, w = typ === 'fog' ? 'rgba(228,232,235,.55)' : typ === 'snow' ? 'rgba(225,232,238,.3)' : `rgba(40,48,58,${t})`;
    const nc = noc ? 'linear-gradient(rgba(4,8,28,.72),rgba(10,16,40,.6)),' : '';
    const poz = n > 1 ? (i ? 'right' : 'left') + ' center/auto 100%' : 'center/cover';
    return { bg: `${nc}linear-gradient(${w},${w}),url("${foto}") ${poz} no-repeat`, html: h.join('') };
  }
  const jasno = ['sun', 'partly', 'wind'].includes(typ);
  const niebo = pora === 'zloto' && jasno ? '#4a62a8,#e98a5c 70%,#fcc77c' : pora === 'zmierzch' ? (jasno ? '#141d48,#5c4a8c 60%,#d8766a' : '#1b2033,#4b4560 70%,#7a5f66') : g[noc ? 1 : 0];
  return { bg: `linear-gradient(180deg,${niebo})`, html: h.join('') };
}

/* teksty karty (v17): polski i angielski */
const RR_TXT = {
  pl: { open: 'Zwinięta', closed: 'Opuszczona', opening: 'Zwija się…', closing: 'Opuszcza się…', unavailable: 'Niedostępna', unknown: 'Nieznany stan',
    czesc: 'Częściowo opuszczona', up: 'Zwiń', stop: 'Stop', down: 'Opuść', brak: 'Nie znaleziono encji', okno: 'okno', lewe: 'lewe ', prawe: 'prawe ',
    otw: 'otwarte', uchyl: 'uchylone', oba: 'Oba skrzydła naraz', wx: null },
  en: { open: 'Open', closed: 'Closed', opening: 'Opening…', closing: 'Closing…', unavailable: 'Unavailable', unknown: 'Unknown',
    czesc: 'Partly closed', up: 'Open', stop: 'Stop', down: 'Close', brak: 'Entity not found', okno: 'window', lewe: 'left ', prawe: 'right ',
    otw: 'open', uchyl: 'tilted', oba: 'Both sashes', wx: { sunny: 'sunny', 'clear-night': 'clear', partlycloudy: 'partly cloudy', cloudy: 'cloudy',
      exceptional: 'exceptional', fog: 'fog', rainy: 'rain', pouring: 'pouring', hail: 'hail', lightning: 'lightning', 'lightning-rainy': 'thunderstorm',
      snowy: 'snow', 'snowy-rainy': 'sleet', windy: 'windy', 'windy-variant': 'windy, cloudy' } }
};
const rrJezyk = (c, hass) => c?.jezyk === 'pl' || c?.jezyk === 'en' ? c.jezyk : String(hass?.language || navigator.language || 'pl').startsWith('pl') ? 'pl' : 'en';
/* prędkość silnika: wybrana encja albo zgadnięta po nazwie (Moes/Tuya w zigbee2mqtt: number.<nazwa>_motor_speed) */
const rrRpmId = (hass, cover, enc) => {
  if (enc) return enc;
  const g = String(cover).replace('cover.', 'number.') + '_motor_speed';
  if (hass?.states[g]) return g;
  /* v21: encja prędkości z tego samego urządzenia co roleta */
  const dev = hass?.entities?.[cover]?.device_id;
  return dev ? Object.keys(hass.entities).find(k => k.startsWith('number.') && hass.entities[k].device_id === dev && /speed|predkos|rpm/i.test(k)) : undefined;
};
const rrRpm = (hass, cover, enc) => parseFloat(hass?.states[rrRpmId(hass, cover, enc)]?.state);
/* v21: kontaktrony okna z tego samego pomieszczenia co roleta (device_class window/door), lewe/prawe po nazwie */
const rrCzujnikiAuto = (hass, cover) => {
  const E = hass?.entities, D = hass?.devices; if (!E || !E[cover]) return [];
  const area = e => E[e]?.area_id || D?.[E[e]?.device_id]?.area_id;
  const a = area(cover); if (!a) return [];
  const ok = Object.keys(E).filter(k => k.startsWith('binary_sensor.') && area(k) === a && ['window', 'door', 'opening'].includes(hass.states[k]?.attributes?.device_class)).sort();
  const nm = k => (k + ' ' + (hass.states[k]?.attributes?.friendly_name || '')).toLowerCase();
  const l = ok.find(k => /lew|left/.test(nm(k))), r = ok.find(k => /praw|right/.test(nm(k)));
  if (l || r) return [l || ok.find(k => k !== r), r || ok.find(k => k !== l)];
  return ok.slice(0, 2);
};
/* encja pogody: wybrana albo typowa nazwa z HA albo pierwsza znaleziona */
const rrPogodaId = (c, hass) => c.pogoda && c.pogoda !== 'auto' ? c.pogoda
  : ['weather.forecast_home', 'weather.home', 'weather.dom'].find(k => hass.states[k]) || Object.keys(hass.states).find(k => k.startsWith('weather.'));

function rrHex(c) { return RR_KOLORY[c] || c || RR_KOLORY.czarny; }
function rrShade(hex, p) {
  let h = String(hex).replace('#', '');
  if (h.length === 3) h = h.split('').map(x => x + x).join('');
  const n = parseInt(h, 16); if (isNaN(n)) return hex;
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = p < 0 ? 0 : 255, t = Math.abs(p);
  r = Math.round((f - r) * t + r); g = Math.round((f - g) * t + g); b = Math.round((f - b) * t + b);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function rrRgba(hex, a) {
  const h = rrShade(hex, 0).replace('#', ''), n = parseInt(h, 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}

/* v22: gotowe wyglądy w kreatorze */
const RR_PRESETY = [{ rama: '#3b3f45', kolor: 'grafit' }, { rama: '#8a5a3b', kolor: 'bezowy' }, { rama: '#f4f4f2', kolor: 'kremowy' },
  { rama: '#1f2124', kolor: 'czarny' }, { rama: '#5a3a26', kolor: 'piaskowy' }, { rama: '#f4f4f2', kolor: 'turkus', siatka: 'bialy' }];
/* v21: ustawienia globalne – wspólny wygląd wszystkich kart, zapisany w profilu użytkownika HA (bez HA: w przeglądarce) */
const RR_GKLUCZE = ['kolor', 'siatka', 'rama', 'skrzydla', 'slupek', 'wysokosc', 'klamki', 'uchwyty', 'uchwyt_srodek', 'przyciski', 'niebo', 'widok',
  'krok', 'pozycje', 'wibracja', 'kat_uchyl', 'otwarcie', 'jezyk', 'zrodlo', 'auto_czujniki'];
const RR_G = { v: null, p: null };
const rrGlobLoad = hass => {
  if (!RR_G.p) RR_G.p = (hass?.callWS ? hass.callWS({ type: 'frontend/get_user_data', key: 'roleta-realistyczna' }).then(r => r?.value)
    : Promise.resolve().then(() => { try { return JSON.parse(localStorage.getItem('rr-glob') || 'null'); } catch (x) { return null; } }))
    .catch(() => null).then(v => { RR_G.v = v || {}; });
  return RR_G.p;
};
const rrGlobSave = (hass, v) => {
  RR_G.v = v; RR_G.p = Promise.resolve();
  window.dispatchEvent(new Event('rr-glob'));
  if (hass?.callWS) return hass.callWS({ type: 'frontend/set_user_data', key: 'roleta-realistyczna', value: v });
  try { localStorage.setItem('rr-glob', JSON.stringify(v)); } catch (x) { /* bez pamięci */ }
  return Promise.resolve();
};

class RoletaRealistyczna extends HTMLElement {
  static getStubConfig(hass) {
    const cov = Object.keys(hass?.states || {}).filter(k => k.startsWith('cover.'));
    const e = cov.find(k => (hass.states[k].attributes?.entity_id || []).length > 1) || cov[0];   // v21: najpierw grupa rolet (okno 2-skrzydłowe)
    return { entity: e || 'cover.roleta' };
  }
  static getConfigElement() { return document.createElement('roleta-realistyczna-editor'); }

  setConfig(cfg) {
    if (!cfg || !cfg.entity) throw new Error('Wybierz encję rolety (cover.*)');
    this._raw = cfg;
    this._cfg = Object.assign({}, RR_DEF, RR_G.v || {}, cfg);
    this._built = false; this._sh = [];
    if (this._hass) this._render();
  }
  set hass(h) {
    this._hass = h;
    if (!this._gok) { this._gok = 1; rrGlobLoad(h).then(() => { if (this._raw) this.setConfig(this._raw); }); }
    this._render();
  }
  getCardSize() { return Math.ceil((this._cfg?.wysokosc || 260) / 50) + 2; }
  getGridOptions() { return { columns: 12, min_columns: 6, rows: 'auto' }; }
  disconnectedCallback() { cancelAnimationFrame(this._raf); this._raf = null; if (this._gl) window.removeEventListener('rr-glob', this._gl); }
  connectedCallback() {
    if (this._built) this._tick();
    this._gl = this._gl || (() => { if (this._raw) this.setConfig(this._raw); });
    window.addEventListener('rr-glob', this._gl);
  }

  _pos(st, goal) {
    let p = st?.attributes?.current_position;
    if (typeof p !== 'number') return st?.state === 'closed' ? 0 : 100;
    if (this._cfg.odwroc) p = 100 - p;
    /* silniki Zigbee czasem meldują „open” z 0% – to błąd meldunku, pomijamy go (null = bez zmian) */
    /* Moes: „open 0%” / „closed 100%” to zwykle stara pozycja w chwili ruszenia – chyba że silnik właśnie tam jechał */
    if (st.state === 'open' && p === 0 && goal !== 0) return null;
    if (st.state === 'closed' && p === 100 && goal !== 100) return null;
    /* v10: w trakcie jazdy do celu silnik potrafi meldować skrajne 0/100 – to nie jest prawda */
    if (goal !== undefined && (p === 0 || p === 100) && p !== goal) return null;
    return p;
  }
  _call(svc, ent, data) {
    ent = ent || this._cfg.entity;
    /* animacja startuje od razu i jedzie w tempie silnika (1:1), bo te silniki nie zgłaszają ruchu w trakcie */
    const target = svc === 'open_cover' ? 100 : svc === 'close_cover' ? 0 : svc === 'set_cover_position' ? data.position : null;
    const now = performance.now();
    (this._mem || []).forEach((m, i) => {
      const o = this._sh[i]; if (!o || (ent !== this._cfg.entity && ent !== m)) return;
      o.catch = null; o.auto = null;
      const cz = o.czas || rrCzas(this._cfg.czas, 0);
      o.rest = null;
      if (target === null) { o.target = o.shown; o.last = Math.round(o.shown); o.cmd = null; o.rest = { p: o.last, t: now + Math.max(60, cz * 2) * 1000 }; }   // po STOP silnik też melduje bzdury
      else {
        o.target = target;
        /* t1 = kiedy silnik powinien dojechać; t = koniec czekania na meldunek (potem wierzymy komendzie) */
        o.cmd = { p: target, t1: now + (Math.abs(target - o.shown) / 100 * cz + 3) * 1000, t: now + (cz * 2 + 10) * 1000 };
      }
    });
    this._tick();
    if (this._cfg.wibracja !== false) try { navigator.vibrate?.(12); } catch (x) { /* telefon bez wibracji */ }   // v18: lekkie „pyk” pod palcem
    let d = data || {};
    if (svc === 'set_cover_position' && this._cfg.odwroc) d = { position: 100 - d.position };
    this._hass.callService('cover', svc, Object.assign({ entity_id: ent }, d));
  }
  /* encje skrzydeł: członkowie grupy, a jak to nie grupa – ta sama encja */
  _members() {
    const st = this._hass.states[this._cfg.entity];
    const n = +this._cfg.skrzydla === 1 ? 1 : 2;
    const m = (st?.attributes?.entity_id || []).filter(e => this._hass.states[e]);
    const out = [];
    for (let i = 0; i < n; i++) out.push(m.length ? m[Math.min(i, m.length - 1)] : this._cfg.entity);
    /* v17: rolety skrzydeł wybrane ręcznie mają pierwszeństwo */
    const wyb = [this._cfg.roleta_lewa, this._cfg.roleta_prawa];
    return out.map((e, i) => wyb[i] && this._hass.states[wyb[i]] ? wyb[i] : e);
  }

  _build(n) {
    const c = this._cfg, col = rrHex(c.kolor), H = c.wysokosc, rama = c.rama, T = this._t;
    /* v19: okleina drewnopodobna = delikatne słoje na ramie i skrzydłach */
    const sloje = RR_RAMY[rama]?.[2] ? 'repeating-linear-gradient(90deg,rgba(0,0,0,.07) 0 1px,transparent 1px 4px,rgba(255,255,255,.05) 4px 5px,transparent 5px 9px),repeating-linear-gradient(0deg,rgba(0,0,0,.05) 0 1px,transparent 1px 5px,rgba(255,255,255,.04) 5px 6px,transparent 6px 11px)' : '';
    const ruch = n > 1 && c.slupek === 'ruchomy';
    const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
    root.innerHTML = '';
    const card = document.createElement('ha-card');
    const sash = i => `
  <div class="slot"><div class="out"><div class="osky"></div><div class="wx owx"></div></div><div class="sash" data-i="${i}">
   <div class="glass"><div class="sky"></div><div class="wx"></div>
    <div class="refl"></div>
    <div class="fabric"></div><div class="bar"></div>
    <div class="cas"></div>
    <div class="ghost"><span></span></div>
    <div class="mv"><ha-icon></ha-icon></div>
   </div>
   ${c.klamki !== false ? '<div class="handle"></div>' : ''}
  </div></div>`;
    card.innerHTML = `
<style>
:host{display:block}
.rr{padding:14px 14px 12px;user-select:none;-webkit-user-select:none}
.hd{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.hd ha-icon{--mdc-icon-size:22px;color:var(--primary-text-color);background:rgba(127,127,127,.18);border-radius:50%;padding:8px}
.nm{font-size:16px;font-weight:500;color:var(--primary-text-color)}
.ver{font-size:10px;font-weight:500;color:var(--secondary-text-color);border:1px solid var(--divider-color,rgba(127,127,127,.4));border-radius:8px;padding:0 5px;margin-left:6px;vertical-align:2px}
.sb{font-size:13px;color:var(--secondary-text-color)}
.pc{margin-left:auto;white-space:nowrap;font-size:22px;font-weight:600;color:var(--primary-text-color);font-variant-numeric:tabular-nums}
.win{position:relative;display:flex;height:${H}px;max-width:${Math.round(H * (n === 1 ? .55 : .9))}px;margin:0 auto;padding:6px;border-radius:3px;
 background:${sloje ? sloje + ',' : ''}${rama};box-shadow:inset 0 0 0 1px rgba(0,0,0,.18),0 3px 10px rgba(0,0,0,.45)}
.win.stal .slot+.slot{margin-left:10px}
.win.ruch .slot{margin:0;box-shadow:inset 0 8px 8px -8px rgba(0,0,0,.6),inset 0 -8px 8px -8px rgba(0,0,0,.6)}
.win.ruch .sash[data-i="0"]{padding-right:13px;background-image:linear-gradient(90deg,transparent calc(100% - 7px),rgba(0,0,0,.2) calc(100% - 7px),rgba(0,0,0,.2) calc(100% - 6px),rgba(255,255,255,.25) calc(100% - 6px),rgba(255,255,255,.25) calc(100% - 5px),transparent calc(100% - 5px))${sloje ? ',' + sloje : ''}}
.win.ruch .sash[data-i="0"] .handle{display:none}
.slot{position:relative;flex:1;margin:0 1.5px;perspective:700px;border-radius:2px;background:#2b3138;box-shadow:inset 0 0 8px rgba(0,0,0,.6)}
.sash{position:relative;height:100%;box-sizing:border-box;transition:transform 1.4s cubic-bezier(.4,.1,.2,1);padding:7px;border-radius:2px;background:${sloje ? sloje + ',' : ''}${rrShade(rama, -.03)};
 box-shadow:inset 0 0 0 1px rgba(0,0,0,.16),0 1px 2px rgba(0,0,0,.22);touch-action:none;cursor:ns-resize}
.handle{position:absolute;top:56%;width:6px;height:14px;margin-top:-7px;border-radius:3px;z-index:4;
 background:linear-gradient(90deg,${rrShade(rama, -.1)},${rrShade(rama, .25)},${rrShade(rama, -.16)});box-shadow:0 1px 2px rgba(0,0,0,.35)}
/* v19: klamka obraca się jak w prawdziwym oknie: w dół = zamknięte, poziomo = otwarte, w górę = uchylone;
   przy otwieraniu najpierw klamka, potem skrzydło – przy zamykaniu odwrotnie */
.handle:after{content:"";position:absolute;left:.5px;top:3px;width:5px;height:24px;border-radius:2.5px;transform-origin:2.5px 4px;
 background:linear-gradient(90deg,${rrShade(rama, -.14)},#fff,${rrShade(rama, -.2)});box-shadow:0 2px 3px rgba(0,0,0,.4);transition:transform .5s 1.3s}
.sash.otw[data-i="0"] .handle:after{transform:rotate(90deg);transition-delay:0s}
.sash.otw[data-i="1"] .handle:after{transform:rotate(-90deg);transition-delay:0s}
.sash.uchyl .handle:after{transform:rotate(180deg);transition-delay:0s}
.sash.otw,.sash.uchyl{transition-delay:.45s}
.sash[data-i="0"] .handle{right:0}.sash[data-i="1"] .handle{left:0}
.glass{position:relative;height:100%;overflow:hidden;border-radius:1px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.18),inset 0 3px 8px rgba(0,0,0,.28)}
.sky{position:absolute;inset:0}
.sky.day{background:linear-gradient(180deg,#5ea4e6 0%,#9fd0f5 60%,#d9eefb 100%)}
.sky.night{background:radial-gradient(1px 1px at 20% 40%,#fff 50%,transparent 51%),radial-gradient(1px 1px at 70% 62%,#fff 50%,transparent 51%),
 radial-gradient(1.5px 1.5px at 45% 78%,#fff 50%,transparent 51%),radial-gradient(1px 1px at 80% 88%,#fff 50%,transparent 51%),
 linear-gradient(180deg,#0b1430 0%,#1b2a52 100%)}
.sky.plain{background:linear-gradient(180deg,#5b6b7a,#8d9aa6)}
.wx{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.wx i{position:absolute;display:block}
.wx .scn{position:absolute;left:0;bottom:0;width:100%;height:58%;display:block}
.drz{animation:rrdrz 2.4s ease-in-out infinite alternate}
@keyframes rrdrz{from{transform:rotate(-4deg)}to{transform:rotate(4deg)}}
.sun{top:52%;width:26%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#fffbe0 0 30%,#ffd84d 45%,rgba(255,216,77,.35) 58%,rgba(255,216,77,0) 70%);animation:rrsun 5s ease-in-out infinite}
@keyframes rrsun{50%{transform:scale(1.08);filter:brightness(1.1)}}
.sun.zl{top:66%;background:radial-gradient(circle,#fff0c0 0 28%,#ff9a3c 46%,rgba(255,120,50,.35) 60%,rgba(255,120,50,0) 72%)}
.moon{top:50%;width:15%;aspect-ratio:1;border-radius:50%;box-shadow:inset -6px 3px 0 0 #f1edcf;filter:drop-shadow(0 0 5px rgba(241,237,207,.55))}
.st{width:2px;height:2px;border-radius:50%;background:#fff;animation:rrst 3s ease-in-out infinite}
@keyframes rrst{50%{opacity:.15}}
.cl{left:-60%;aspect-ratio:3.2;border-radius:999px;filter:blur(.6px);animation:rrcl 60s linear infinite}
.cl:before,.cl:after{content:"";position:absolute;border-radius:50%;background:inherit}
.cl:before{left:14%;bottom:30%;width:38%;aspect-ratio:1}.cl:after{left:42%;bottom:22%;width:44%;aspect-ratio:1}
@keyframes rrcl{to{left:110%}}
.fog{left:-50%;width:200%;height:20%;background:linear-gradient(90deg,transparent,rgba(236,239,241,.75) 30%,rgba(236,239,241,.55) 70%,transparent);filter:blur(5px);animation:rrfog 18s ease-in-out infinite alternate}
@keyframes rrfog{to{transform:translateX(22%)}}
.dr{top:-14%;width:1.5px;height:12%;background:linear-gradient(rgba(225,236,247,0),rgba(225,236,247,.85));transform:skewX(-12deg);animation:rrdr .8s linear infinite}
@keyframes rrdr{to{transform:translate(-14px,1000%) skewX(-12deg)}}
.fl{top:-5%;border-radius:50%;background:#fff;opacity:.92;box-shadow:0 0 2px rgba(255,255,255,.8);animation:rrfl 7s linear infinite}
@keyframes rrfl{0%{top:-5%;transform:translateX(0)}25%{transform:translateX(7px)}75%{transform:translateX(-7px)}100%{top:105%;transform:translateX(0)}}
.fla{inset:0;background:#fff;opacity:0;animation:rrfla 7s linear infinite}
@keyframes rrfla{0%,88%,91%,93%,100%{opacity:0}89%,92%{opacity:.55}}
.refl{position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.15) 38%,transparent 46%)}
.cas{position:absolute;left:-1px;right:-1px;top:0;height:${RR_KASETA}px;z-index:4;border-radius:0 0 6px 6px;
 background:linear-gradient(180deg,#ffffff 0%,#f1f1f1 55%,#cfcfcf 100%);box-shadow:0 2px 3px rgba(0,0,0,.35)}
.cas:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:#e2e2e2;border-radius:0 0 0 6px;box-shadow:1px 0 0 rgba(0,0,0,.08)}
.cas:after{content:"";position:absolute;right:0;top:0;bottom:0;width:4px;background:#e2e2e2;border-radius:0 0 6px 0;box-shadow:-1px 0 0 rgba(0,0,0,.08)}
.fabric{position:absolute;left:1px;right:1px;top:${RR_KASETA - 2}px;height:0;z-index:2;
 background:
  linear-gradient(90deg,rgba(0,0,0,.22),rgba(255,255,255,.05) 30%,rgba(0,0,0,0) 60%,rgba(0,0,0,.2)),
  repeating-linear-gradient(90deg,rgba(255,255,255,.07) 0 1px,transparent 1px 3px),
  linear-gradient(180deg,
   ${rrShade(col, .12)} 0px,${col} 2px,${col} ${RR_PAS - 3}px,${rrShade(col, -.25)} ${RR_PAS}px,
   ${rrRgba(c.siatka ? rrHex(c.siatka) : rrShade(col, .3), .62)} ${RR_PAS}px,${rrRgba(c.siatka ? rrShade(rrHex(c.siatka), .1) : rrShade(col, .4), .55)} ${RR_OKRES}px);
 background-size:100% 100%,100% 100%,100% ${RR_OKRES}px}
.bar{position:absolute;left:0;right:0;height:${RR_LISTWA}px;top:${RR_KASETA}px;z-index:3;border-radius:1px;
 background:linear-gradient(180deg,#fafafa,#bdbdbd);box-shadow:0 2px 3px rgba(0,0,0,.4)}
/* uchwyt do podnoszenia na środku dolnej listwy – złap i przeciągnij */
.bar:after{content:"";position:absolute;left:50%;top:100%;width:22px;height:9px;transform:translateX(-50%);border-radius:0 0 7px 7px;
 background:linear-gradient(180deg,#e9e9e9,#a9a9a9);box-shadow:0 2px 3px rgba(0,0,0,.45),inset 0 -2px 0 rgba(0,0,0,.12);cursor:grab}
.sash:active .bar:after{cursor:grabbing;filter:brightness(1.08)}
/* środkowy uchwyt (v11): na słupku między skrzydłami, na wysokości listew – rusza oba skrzydła */
.mid{position:absolute;left:50%;top:0;z-index:7;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;cursor:grab;touch-action:none;
 background:radial-gradient(circle at 35% 30%,#fff,#dcdcdc 70%,#bdbdbd);box-shadow:0 2px 5px rgba(0,0,0,.5),0 0 0 2px var(--primary-color,#03a9f4);
 display:flex;align-items:center;justify-content:center;color:#444}
.mid:active{cursor:grabbing;transform:scale(1.1)}
.mid svg{width:20px;height:20px;fill:currentColor}
.bezuch .bar:after,.bezuch .bar:before{display:none}
.bar:before{content:"";position:absolute;left:50%;top:-12px;width:48px;height:34px;transform:translateX(-50%);cursor:grab}
/* okno uchylone / otwarte (v15) – skrzydło razem z roletą (kaseta na skrzydle) */
.out{position:absolute;inset:3px;overflow:hidden;border-radius:2px}
.osky{position:absolute;inset:0}
.sash.uchyl{transform-origin:50% 100%;transform:rotateX(calc(-1deg * var(--rr-uch,14))) scaleY(calc(1 - var(--rr-uch,14) / 140));box-shadow:0 6px 14px rgba(0,0,0,.55)}   /* góra skrzydła do środka pokoju */
.sash.otw[data-i="0"]{transform-origin:0 50%;transform:rotateY(calc(-1deg * var(--rr-otw,41)));z-index:8}
.sash.otw[data-i="1"]{transform-origin:100% 50%;transform:rotateY(calc(1deg * var(--rr-otw,41)));z-index:8}
.sash.otw{box-shadow:0 0 14px rgba(0,0,0,.55)}
.ghost{position:absolute;left:0;right:0;height:0;border-top:2px dashed var(--primary-color,#03a9f4);z-index:6;display:none}
.ghost span{position:absolute;left:50%;transform:translateX(-50%);top:-22px;background:var(--primary-color,#03a9f4);color:#fff;font-size:12px;font-weight:600;padding:1px 7px;border-radius:9px;white-space:nowrap}
.mv{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);z-index:5;color:#fff;background:rgba(0,0,0,.5);
 width:26px;height:26px;border-radius:50%;display:none;align-items:center;justify-content:center}
.mv ha-icon{--mdc-icon-size:18px;animation:rrb 1s ease-in-out infinite}
@keyframes rrb{50%{transform:translateY(var(--rr-dy,-3px))}}
.bt{display:flex;gap:8px;margin-top:12px}
.bt button{flex:1;height:42px;border:none;border-radius:12px;cursor:pointer;color:var(--primary-text-color);
 background:var(--secondary-background-color,rgba(127,127,127,.15));display:flex;align-items:center;justify-content:center;transition:background .15s}
.bt button:active{background:rgba(127,127,127,.35)}
.bt button[disabled]{opacity:.35;cursor:default}
.bt ha-icon{--mdc-icon-size:22px}
.qk{display:flex;gap:6px;margin-top:8px}
.qk button{flex:1;height:28px;border:none;border-radius:9px;font-size:12px;cursor:pointer;color:var(--secondary-text-color);background:transparent;box-shadow:inset 0 0 0 1px var(--divider-color,rgba(127,127,127,.3))}
.qk button.on{color:var(--text-primary-color,#fff);background:var(--primary-color,#03a9f4);box-shadow:none}
</style>
<div class="rr">
 <div class="hd"><ha-icon icon="mdi:roller-shade"></ha-icon>
  <div><div><span class="nm"></span><span class="ver">${RR_WERSJA}</span></div><div class="sb"></div></div><div class="pc"></div></div>
 <div class="win ${ruch ? 'ruch' : 'stal'}">${Array.from({ length: n }, (_, i) => sash(i)).join('')}${n > 1 && c.uchwyt_srodek !== false ? `<div class="mid" title="${T.oba}"><svg viewBox="0 0 24 24"><path d="M12,2L7,7H11V17H7L12,22L17,17H13V7H17L12,2Z"/></svg></div>` : ''}</div>
 <div class="bt">
  <button class="up" title="${T.up}"><ha-icon icon="mdi:arrow-up"></ha-icon></button>
  <button class="stop" title="${T.stop}"><ha-icon icon="mdi:stop"></ha-icon></button>
  <button class="down" title="${T.down}"><ha-icon icon="mdi:arrow-down"></ha-icon></button>
 </div>
 ${+c.krok > 0 ? `<div class="qk kr"><button data-k="1">▲ ${+c.krok}%</button><button data-k="-1">▼ ${+c.krok}%</button></div>` : ''}
 <div class="qk">${String(c.pozycje ?? '100,75,50,25,0').split(/[,; ]+/).map(Number).filter(x => x >= 0 && x <= 100 && String(x) !== '').slice(0, 7)
   .map(x => `<button data-p="${x}">${x === 100 ? T.open : x === 0 ? T.closed : x + '%'}</button>`).join('')}</div>
</div>`;
    root.appendChild(card);
    const q = s => card.querySelector(s);
    this._el = {
      nm: q('.nm'), sb: q('.sb'), pc: q('.pc'),
      up: q('.up'), stop: q('.stop'), down: q('.down'), qk: card.querySelectorAll('.qk button'),
      bt: q('.bt'), qkw: q('.qk'),
      sash: [...card.querySelectorAll('.sash')].map(s => ({
        root: s, glass: s.querySelector('.glass'), sky: s.querySelector('.sky'), wx: s.querySelector('.glass .wx'), osky: s.parentElement.querySelector('.osky'), owx: s.parentElement.querySelector('.owx'),
        fabric: s.querySelector('.fabric'), bar: s.querySelector('.bar'),
        ghost: s.querySelector('.ghost'), gl: s.querySelector('.ghost span'), mv: s.querySelector('.mv'), mvi: s.querySelector('.mv ha-icon')
      }))
    };
    const E = this._el;
    E.up.onclick = () => this._call('open_cover');
    E.down.onclick = () => this._call('close_cover');
    E.stop.onclick = () => this._call('stop_cover');
    E.qk.forEach(b => b.dataset.p && (b.onclick = () => this._call('set_cover_position', null, { position: +b.dataset.p })));
    /* ruch krokowy (v18): każde kliknięcie = mały krok od miejsca, do którego roleta właśnie jedzie (kliknięcia się sumują) */
    card.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
      const sh = this._sh.filter(Boolean), base = sh.length ? sh.reduce((a, o) => a + o.target, 0) / sh.length : 50;
      this._call('set_cover_position', null, { position: Math.max(0, Math.min(100, Math.round(base + b.dataset.k * c.krok))) });
    });
    if (!c.przyciski) { E.bt.style.display = 'none'; E.qkw.style.display = 'none'; }
    if (c.uchwyty === false) card.classList.add('bezuch');
    /* jak mocno uchylone (stopnie) i jak szeroko otwarte (% szerokości → kąt: szczelina = 1 − cos) */
    card.style.setProperty('--rr-uch', Math.min(30, Math.max(3, +c.kat_uchyl || 14)));
    card.style.setProperty('--rr-otw', Math.round(Math.acos(1 - Math.min(90, Math.max(5, +c.otwarcie || 40)) / 100) * 180 / Math.PI));
    E.mid = q('.mid');
    E.sash.forEach((s, i) => this._drag(s, i));
    if (E.mid) this._drag({ root: E.mid, glass: E.sash[0].glass, mid: true }, 0);
    this._n = n; this._built = true;
  }

  /* górna krawędź listwy dolnej dla pozycji p (100 = zwinięta) */
  _barTop(gh, p) { return RR_KASETA - 2 + (gh - RR_KASETA - RR_LISTWA - 7 + 2) * (100 - p) / 100; }
  _yToPos(s, y) {
    const r = s.glass.getBoundingClientRect(), gh = r.height;
    const f = Math.min(1, Math.max(0, (y - r.top - RR_KASETA) / (gh - RR_KASETA - RR_LISTWA - 7)));
    return Math.round(100 - f * 100);
  }
  _drag(s, i) {
    let on = false, y0 = 0, val = null;
    const el = s.root;
    let solo = false;
    el.addEventListener('pointerdown', e => {
      /* uchwyt na listwie = tylko to skrzydło; uchwyt środkowy = oba; reszta szyby wg opcji „osobno” */
      solo = !s.mid && (this._cfg.osobno || (this._cfg.uchwyty !== false && e.composedPath().includes(s.bar)));
      on = true; this._dr = true; y0 = e.clientY; val = null; el.setPointerCapture?.(e.pointerId); e.stopPropagation();
    });
    el.addEventListener('pointermove', e => {
      if (!on) return;
      if (val === null && Math.abs(e.clientY - y0) < 6) return;
      val = this._yToPos(s, e.clientY);
      const gh = s.glass.getBoundingClientRect().height;
      (solo ? [s] : this._el.sash).forEach(x => {
        x.ghost.style.display = 'block'; x.ghost.style.top = (this._barTop(gh, val) + RR_LISTWA) + 'px'; x.gl.textContent = val + '%';
      });
    });
    const end = () => {
      if (!on) return; on = false; this._dr = false;
      this._el.sash.forEach(x => x.ghost.style.display = 'none');
      if (val !== null) this._call('set_cover_position', solo ? this._mem[i] : null, { position: val });
      else if (!s.mid) this._tap(solo ? this._mem[i] : null, i);   // samo dotknięcie = stop / w drugą stronę
    };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  }

  /* jeden przycisk jak w pilocie (v16): jedzie → stop; stoi → w przeciwną stronę niż ostatnio */
  _tap(ent, i) {
    const o = this._sh[i]; if (!o) return;
    const jedzie = Math.abs(o.target - o.shown) > .5;
    if (jedzie) { this._kier = o.target > o.shown ? 'up' : 'down'; this._call('stop_cover', ent); return; }
    const kier = o.shown >= 99.5 ? 'down' : o.shown <= .5 ? 'up' : this._kier === 'up' ? 'down' : 'up';
    this._kier = kier;
    this._call(kier === 'up' ? 'open_cover' : 'close_cover', ent);
  }
  _render() {
    if (!this._hass || !this._cfg) return;
    const c = this._cfg, st = this._hass.states[c.entity];
    const mem = this._members();
    const lang = rrJezyk(c, this._hass);
    if (lang !== this._lang) { this._lang = lang; this._t = RR_TXT[lang]; this._built = false; }
    const T = this._t;
    if (!this._built || this._n !== mem.length) this._build(mem.length);
    this._mem = mem;
    const E = this._el;
    if (!st) { E.nm.textContent = c.name || c.entity; E.sb.textContent = T.brak; return; }
    let pos = this._pos(st); const s = st.state;
    if (pos === null) pos = this._gpos ?? (s === 'open' ? 100 : 0);
    this._gpos = pos;
    let sb = T[s] || s;
    if (s === 'open' && pos > 0 && pos < 100) sb = T.czesc;
    E.nm.textContent = c.name || st.attributes.friendly_name || c.entity;
    /* pogoda za oknem (v8) */
    const wid = c.zrodlo === 'auto' || !c.zrodlo ? rrPogodaId(c, this._hass) : null;
    /* bez encji pogody w HA – pogoda z internetu (Open-Meteo) dla lokalizacji domu */
    const ws = !c.niebo || c.zrodlo === 'brak' ? null : wid && this._hass.states[wid] ? this._hass.states[wid] : rrInternet(this._hass, () => this._render());
    const WX = T.wx || RR_WX_PL;
    if (ws && WX[ws.state]) {
      const t = ws.attributes?.temperature;
      sb += ' · ' + WX[ws.state] + (typeof t === 'number' ? ' ' + Math.round(t) + (ws.attributes.temperature_unit || '°C') : '');
    }
    /* kontaktrony okna (v15) */
    const okno = [0, 1].map(k => {
      if (this._czAc !== c.entity) { this._czAc = c.entity; this._czA = rrCzujnikiAuto(this._hass, c.entity); }   // v21: raz na encję
      const id = c[k ? 'czujnik_prawe' : 'czujnik_lewe'] || (c.auto_czujniki !== false && this._czA[k]), st2 = id && this._hass.states[id];
      return st2 && st2.state === 'on' ? (c[k ? 'tryb_prawe' : 'tryb_lewe'] === 'otworz' ? 'otw' : 'uchyl') : '';
    });
    okno.forEach((t, k) => { if (t && k < mem.length) sb += ` · ${T.okno} ${mem.length > 1 ? (k ? T.prawe : T.lewe) : ''}${t === 'otw' ? T.otw : T.uchyl}`; });
    E.sb.textContent = sb;
    E.pc.textContent = pos + '%';
    E.up.disabled = pos >= 100 && s !== 'closing';
    E.down.disabled = pos <= 0 && s !== 'opening';
    E.qk.forEach(b => b.dataset.p && b.classList.toggle('on', +b.dataset.p === pos && s !== 'opening' && s !== 'closing'));
    /* pora dnia z wysokości słońca (v16): dzien / zloto (wschód, zachód) / zmierzch / noc */
    const sun = this._hass.states['sun.sun'], el = sun?.attributes?.elevation;
    const night = sun?.state === 'below_horizon' || (!sun && ws?.state === 'clear-night');
    const pora = night ? (typeof el === 'number' && el > -7 ? 'zmierzch' : 'noc') : typeof el === 'number' && el < 8 ? 'zloto' : 'dzien';
    const typ = !c.niebo ? 'plain' : ws ? (RR_WX[ws.state] || 'cloudy') : 'sun', wkey = typ + pora + (c.tlo || '') + (c.widok !== false);
    mem.forEach((e, i) => {
      const S = E.sash[i], ms = this._hass.states[e] || st, mst = ms.state;
      const o0 = this._sh[i];
      /* v10: każdy meldunek silnika bierzemy pod uwagę tylko raz (gdy się pojawi), potem już nie wraca */
      const now = performance.now();
      const raw = ms.attributes?.current_position;
      const stamp = (ms.last_updated || '') + '|' + mst + '|' + raw;
      let mp = null;
      const spoko = o0 && o0.rest && now < o0.rest.t ? o0.rest.p : undefined;   // po dojechaniu silnik jeszcze chwilę „śmieci” 0/100
      if (o0 && stamp !== o0.stamp) mp = this._pos(ms, o0.cmd ? o0.cmd.p : o0.auto ? o0.auto.p : spoko);
      if (!o0) mp = typeof raw === 'number' ? (c.odwroc ? 100 - raw : raw) : (mst === 'open' ? 100 : 0);
      S.root.classList.toggle('uchyl', okno[i] === 'uchyl'); S.root.classList.toggle('otw', okno[i] === 'otw');
      /* za otwartym/uchylonym skrzydłem widać to, co za oknem – ta sama pogoda i widok */
      const okey = okno[i] ? wkey : '';
      if (S.okey !== okey) { S.okey = okey; S.osky.style.background = okey && S.w ? S.w.bg : ''; S.owx.innerHTML = okey && S.w ? S.w.html : ''; }
      if (S.wkey !== wkey) {   // przebudowa nieba tylko gdy zmieni się pogoda albo pora dnia
        S.wkey = wkey;
        if (typ === 'plain') { S.sky.className = 'sky plain'; S.sky.style.background = ''; S.wx.innerHTML = ''; S.root.parentElement.style.background = ''; }
        else {
          const w = rrPogoda(typ, night, i, c.tlo, mem.length, c.widok !== false, pora); S.sky.className = 'sky'; S.sky.style.background = w.bg; S.wx.innerHTML = w.html;
          S.w = w; if (okno[i]) { S.okey = wkey; S.osky.style.background = w.bg; S.owx.innerHTML = w.html; }
          S.root.parentElement.style.background = w.bg;   // to widać za otwartym skrzydłem
        }
      }
      const moving = mst === 'opening' || mst === 'closing';
      S.mv.style.display = moving ? 'flex' : 'none';
      if (moving) {
        S.mvi.setAttribute('icon', mst === 'opening' ? 'mdi:chevron-double-up' : 'mdi:chevron-double-down');
        S.mvi.style.setProperty('--rr-dy', mst === 'opening' ? '-3px' : '3px');
      }
      const o = o0 || (this._sh[i] = { shown: mp, target: mp, last: mp });
      o.stamp = stamp;
      /* prędkość silnika Moes: number.<nazwa>_motor_speed (obr/min) → czas przejazdu tego skrzydła */
      const rpm = rrRpm(this._hass, e, c[i ? 'predkosc_prawa' : 'predkosc_lewa']);
      o.czas = rrCzas(c.czas, rpm, rrUcz.get(e));
      if (o0 && mp !== null) {
        /* meldunek daleko od celu, zanim silnik mógł dojechać = stara pozycja z chwili ruszenia – pomijamy */
        if (o.cmd && (now < o.cmd.t1 - 5000 || Math.abs(mp - o.cmd.p) > 10 && now < o.cmd.t1)) mp = null;   // za wcześnie na prawdziwy meldunek
        else { if (o.cmd || o.auto) o.rest = { p: mp, t: now + Math.max(60, o.czas * 2) * 1000 }; o.last = mp; o.cmd = null; o.auto = null; if (Math.abs(mp - o.shown) > .5) o.catch = mp; }   // prawdziwy meldunek – dociągnij
      }
      /* zmiana stanu bez nowej pozycji = silnik właśnie ruszył (Moes melduje pozycję dopiero na końcu) */
      if (mp === null && o.st !== undefined && mst !== o.st && !o.cmd && spoko === undefined && (mst === 'open' || mst === 'closed')) {
        const goal = mst === 'open' ? 100 : 0;
        if (Math.round(o.shown) !== goal) o.auto = { p: goal, t: now + (o.czas * 1.5 + 5) * 1000 };
      }
      /* v18: karta sama uczy się czasu przejazdu z prawdziwych ruchów (rolety, które meldują „otwiera/zamyka się”) */
      const jedzie = mst === 'opening' || mst === 'closing';
      if (jedzie && !o.ucz) o.ucz = { t: now, p: o.last };
      if (!jedzie && o.ucz) {
        const rp = typeof raw === 'number' ? (c.odwroc ? 100 - raw : raw) : null, dp = rp === null ? 0 : Math.abs(rp - o.ucz.p), dt = (now - o.ucz.t) / 1000;
        if (dp >= 30 && dt > 2) { const v = dt * 100 / dp, u = rrUcz.get(e); rrUcz.set(e, u ? u * .6 + v * .4 : v); }
        o.ucz = null;
      }
      o.st = mst;
      /* brak wiarygodnego meldunku do końca czekania – wierzymy komendzie */
      if (o.auto && now > o.auto.t) { o.last = o.auto.p; o.auto = null; }
      if (o.cmd && now > o.cmd.t) { o.last = o.cmd.p; o.rest = { p: o.cmd.p, t: now + 60000 }; o.cmd = null; }
      o.target = o.cmd ? o.cmd.p : o.auto ? o.auto.p : mst === 'opening' ? 100 : mst === 'closing' ? 0 : o.last;
    });
    this._tick();
  }

  /* płynna animacja: meldunki silnika = szybkie dociągnięcie, między nimi ruch w tempie silnika */
  _tick() {
    const speed = 100 / rrCzas(this._cfg.czas, 0);
    this._paint();
    if (this._raf) return;
    let last = performance.now();
    const step = now => {
      const dt = Math.min(.1, (now - last) / 1000); last = now;
      let busy = false;
      this._sh.forEach(o => {
        /* najpierw szybkie dociągnięcie do ostatniego meldunku silnika, potem dalej w tempie silnika do celu */
        const goal = o.catch != null ? o.catch : o.target;
        const d = goal - o.shown;
        if (Math.abs(d) < .2) { o.shown = goal; if (o.catch != null) { o.catch = null; busy = true; } return; }
        busy = true;
        const sp = o.czas ? 100 / o.czas : speed;
        const v = o.catch != null ? Math.max(sp, Math.abs(d) * 6) : sp;
        o.shown += Math.sign(d) * Math.min(Math.abs(d), v * dt);
      });
      this._paint();
      this._raf = busy ? requestAnimationFrame(step) : null;
    };
    this._raf = requestAnimationFrame(step);
  }
  _paint() {
    /* nagłówek: gdzie roleta jest teraz (animacja) i dokąd jedzie */
    const sh = this._sh.filter(Boolean);
    if (sh.length) {
      const cel = sh.find(o => o.cmd && Math.abs(o.shown - o.cmd.p) > .5);
      this._el.pc.textContent = Math.round(sh.reduce((x, o) => x + o.shown, 0) / sh.length) + '%' + (cel ? ' → ' + cel.cmd.p + '%' : '');
    }
    this._el.sash.forEach((S, i) => {
      const o = this._sh[i]; if (!o) return;
      const gh = S.glass.clientHeight || this._cfg.wysokosc - 26;
      if (!this._dr) {   // linia celu zostaje, aż roleta dojedzie
        const g = o.cmd && Math.abs(o.shown - o.cmd.p) > .5 ? o.cmd.p : null;
        if (g === null) S.ghost.style.display = 'none';
        else { S.ghost.style.display = 'block'; S.ghost.style.top = (this._barTop(gh, g) + RR_LISTWA) + 'px'; S.gl.textContent = '→ ' + g + '%'; }
      }
      const bt = this._barTop(gh, o.shown), fh = Math.max(0, bt - (RR_KASETA - 2));
      S.fabric.style.height = fh + 'px';
      S.bar.style.top = bt + 'px';
      S.bt = S.root.parentElement.offsetTop + S.root.offsetTop + S.glass.offsetTop + bt + RR_LISTWA / 2;
      /* pasy przyklejone do dolnej listwy – zwijają się razem z materiałem i zawsze stoją równo */
      S.fabric.style.backgroundPosition = `0 0,0 0,0 ${fh % RR_OKRES}px`;
    });
    const E = this._el;   // środkowy uchwyt jedzie na średniej wysokości listew
    if (E.mid && E.sash.every(S => S.bt != null)) E.mid.style.top = (E.sash.reduce((x, S) => x + S.bt, 0) / E.sash.length + 8) + 'px';
  }
}
customElements.define('roleta-realistyczna', RoletaRealistyczna);

/* Edytor graficzny (v6): jak symulator – kółka kolorów, suwaki, przełączniki i żywy podgląd z animacją.
   Podgląd steruje udawanym silnikiem, nigdy prawdziwą roletą. */
const RR_KOL_NAZWY = { pl: { bezowy: 'beżowy', bialy: 'biały', braz: 'brąz', pomaranczowy: 'pomarańcz.', rozowy: 'różowy', zolty: 'żółty', mietowy: 'miętowy', blekitny: 'błękitny', sliwkowy: 'śliwkowy' },
  en: { czarny: 'black', grafit: 'graphite', szary: 'grey', bezowy: 'beige', kremowy: 'cream', bialy: 'white', braz: 'brown', granat: 'navy', pomaranczowy: 'orange',
    czerwony: 'red', bordo: 'burgundy', rozowy: 'pink', fiolet: 'purple', niebieski: 'blue', turkus: 'turquoise', zielony: 'green', limonka: 'lime', zolty: 'yellow', oliwka: 'olive',
    piaskowy: 'sand', cappuccino: 'cappuccino', mokka: 'mocha', wenge: 'wenge', popiel: 'ash', srebrny: 'silver', stalowy: 'steel', lawendowy: 'lavender', pudrowy: 'powder pink',
    mietowy: 'mint', blekitny: 'sky blue', morski: 'teal', butelkowy: 'bottle green', musztardowy: 'mustard', terakota: 'terracotta', sliwkowy: 'plum' } };
/* kolory ram (v19): popularne kolory i okleiny okien PCV; trzeci element = okleina drewnopodobna (słoje) */
const RR_RAMY = { '#f4f4f2': ['biała', 'white'], '#d8d2c6': ['kremowa', 'cream'], '#a3a6a8': ['szary agat', 'agate grey'], '#b9bdc1': ['srebrna', 'silver'],
  '#6e7378': ['szara', 'grey'], '#3b3f45': ['antracyt', 'anthracite'], '#1f2124': ['czarna', 'black'], '#28402f': ['zielona', 'green'], '#2b3a55': ['granatowa', 'navy'],
  '#8a5a3b': ['złoty dąb', 'golden oak', 1], '#b39370': ['dąb jasny', 'light oak', 1], '#a26a43': ['winchester', 'winchester', 1],
  '#c9cbcc': ['jasnoszara', 'light grey'], '#6d6c66': ['szary kwarc', 'quartz grey'], '#4a4d50': ['bazaltowa', 'basalt grey'], '#5d1f23': ['bordowa', 'burgundy'],
  '#c49a5c': ['sosna', 'pine', 1], '#9d8064': ['dąb sheffield', 'sheffield oak', 1], '#9b6a3c': ['oregon', 'oregon', 1], '#6d4a33': ['siena', 'siena', 1],
  '#5a3a26': ['orzech', 'walnut', 1], '#6a2e22': ['mahoń', 'mahogany', 1], '#3e3830': ['dąb bagienny', 'bog oak', 1], '#6b4a32': ['brąz', 'brown'] };
/* teksty edytora (v17) */
const RR_ED = {
  pl: { pv: 'Podgląd na żywo – nie rusza prawdziwej rolety', play: '▶ Pokaż animację',
    wxl: ['prawdziwa', '☀️ słońce', '⛅ chmurki', '☁️ pochmurno', '🌧️ deszcz', '💧 ulewa', '⛈️ burza', '❄️ śnieg', '🌫️ mgła', '💨 wiatr', '🌙 noc'],
    kol: 'Kolor pasów', ram: 'Kolor ramy okna', own: 'własny', sk: 'Skrzydła okna', sk1: '1 skrzydło', sk2: '2 skrzydła', pin: 'Przypnij podgląd u góry', okp: ['🪟 zamknięte', '↘ uchylone', '↔ otwarte'],
    d_kol: 'Kolor pełnych (zaciemniających) pasów. Kolory jak w kolekcjach tkanin dzień-noc, a „własny” to dowolny kolor.', d_sia: 'Kolor pasów przepuszczających światło. „Jak pełne” = jaśniejszy odcień koloru pasów.',
    d_ram: 'Kolor ramy i skrzydeł. Kolory ze słojami to okleiny drewnopodobne.', d_sk: 'Ile skrzydeł ma okno. Przy dwóch każde skrzydło może mieć swoją roletę.',
    d_okn: 'Pokazuje się, gdy kontaktron zgłosi otwarte okno. Ruszając suwakiem widzisz okno w podglądzie.',
    d_kr: 'Przyciski ▲ i ▼ pod roletą przesuwają ją o mały krok. Szybkie pozycje to przyciski z procentami.', sl: 'Słupek między skrzydłami', sl1: 'stały', sl2: 'ruchomy',
    slh: 'Stały zostaje w oknie. Ruchomy jest przy lewym skrzydle i po otwarciu obu skrzydeł środek jest wolny.',
    roz: 'Rozmiar i tempo', wys: 'Wysokość okna', auto: 'Czas przejazdu automatycznie z prędkości silnika', czas: 'Czas pełnego przejazdu (ręcznie)',
    obr: (r, t) => `Silniki tej rolety: ${r} obr/min → pełny przejazd ok. ${t} s`, obr0: 'Ta roleta nie podaje prędkości silnika', obrA: ' – przyjęto 30 s (karta nauczy się czasu sama albo użyj kalibracji).', obrU: t => ` – karta sama nauczyła się czasu: ${t} s.`, obrM: ' (zmierzone na roletach Moes)',
    kal: 'Kalibracja czasu przejazdu', kalh: 'Ręcznie stoperem: kliknij, a gdy roleta dojedzie do końca – „Dojechała”. Najlepiej od samej góry do samego dołu.',
    sia: 'Kolor pasów przezroczystych', siaj: 'jak pełne', poz: 'Szybkie pozycje (procenty po przecinku, 100 = zwinięta)',
    sec_wyg: '🎨 Wygląd', sec_okn: '🪟 Okno', sec_ruch: '⏱ Ruch i kalibracja', sec_zaaw: '⚙️ Zaawansowane', rst: '↺ Przywróć domyślne',
    wz: '🪄 Kreator', wzK: n => `krok ${n} z 3`, wzW: '← Wstecz', wzD: 'Dalej →', wzG: 'Gotowe ✔', wzGr: n => `grupa: ${n} rolety (okno ${n}-skrzydłowe)`,
    wz1: 'Wybierz roletę albo grupę rolet. Grupy są na górze.', wz2: 'Karta sama sprawdziła Twój dom:', wz3: 'Wybierz gotowy wygląd. Później zmienisz wszystko w dziale 🎨 Wygląd.',
    wzR: (a, m) => `Roleta: ${a}${m ? ` → skrzydła: ${m}` : ''}`, wzS: (r, t) => `Silnik: ${r} obr/min → przejazd ok. ${t} s`, wzS0: 'Silnik nie podaje prędkości – karta nauczy się czasu sama (albo kalibracja w dziale ⏱)',
    wzC: t => `Kontaktrony okna: ${t}`, wzC0: 'Nie znaleziono kontaktronów w tym pomieszczeniu (można dodać później w dziale 🪟)', wzP: t => `Pogoda: ${t}`, wzP0: 'Pogoda: z internetu (Open-Meteo, lokalizacja domu)',
    pre: ['Nowoczesny (antracyt + grafit)', 'Klasyczne drewno (złoty dąb + beż)', 'Skandynawski (biel + krem)', 'Ciemny (czarna + czarne pasy)', 'Ciepły orzech (orzech + piasek)', 'Kolorowy (biel + turkus)'],
    glob: '🌍 Ustawienia globalne', globh: 'Zapisz ten wygląd (kolory, rama, okno, przyciski, opcje) jako domyślny dla wszystkich kart rolet – także nowych. Każda karta może go nadal zmienić u siebie.',
    gSave: '🌍 Zapisz jako domyślne dla wszystkich kart', gClr: 'Wyczyść', gIle: n => `Zapisane globalnie: ${n} ustawień. Wszystkie karty je przejmują.`, gBrak: 'Brak ustawień globalnych – karty używają domyślnych.',
    wibracja: 'Lekka wibracja telefonu przy kliknięciu', auto_czujniki: 'Sama szukaj kontaktronów okna w tym pomieszczeniu',
    czA: t => `🔎 Wykryte automatycznie (lewe / prawe): ${t}. Ręczny wybór wyżej ma pierwszeństwo.`, czA0: '🔎 Nie wykryto kontaktronów w pomieszczeniu tej rolety – wybierz je wyżej, jeśli masz.', klamki: 'Klamki okna (obracają się przy uchyleniu i otwarciu)',
    kr: 'Ruch krokowy', krs: 'Jedno kliknięcie ▲/▼ przesuwa roletę o', kr0: 'wyłączony',
    ak: '🤖 Kalibruj automatycznie', akx: '■ Przerwij', akh: 'Uwaga: rusza prawdziwą roletę. Roleta sama zjedzie na górę, potem na sam dół i znowu do góry. Karta zmierzy czas i sama go zapisze.',
    ak0: 'Ustawiam roletę na samej górze…', ak1: t => `Mierzę opuszczanie… ${t} s`, ak2: (a, t) => `Opuszczanie: ${a} s. Mierzę zwijanie… ${t} s`,
    akok: t => `Gotowe ✔ Zapisano czas przejazdu ${t} s`, akstop: 'Przerwano – roleta zatrzymana.',
    akrpm: t => `Silniki podają swoją prędkość, więc karta już sama liczy czas (${t} s). Kalibracja nie jest potrzebna ✔`,
    aktm: 'Roleta nie zgłosiła końca jazdy. Zmierz ręcznie stoperem poniżej.',
    kd: '⬇ Opuść i mierz', ku: '⬆ Zwiń i mierz', kok: '✔ Dojechała', kzap: 'Zapisz ten czas', kwyn: t => `Zmierzono: ${t} s`,
    opc: 'Opcje', jez: 'Język karty', jauto: 'auto',
    przyciski: 'Przyciski i szybkie pozycje', niebo: 'Niebo i pogoda za oknem', widok: 'Rysowany widok: domy, drzewa, ulica',
    uchwyty: 'Uchwyty na listwach (rusza jedno skrzydło)', uchwyt_srodek: 'Środkowy uchwyt ⇕ (rusza oba skrzydła)',
    osobno: 'Przeciąganie po szybie rusza tylko jedno skrzydło', odwroc: 'Odwróć pozycję (silnik liczy odwrotnie)',
    s_enc: 'Rolety i silniki', s_pog: 'Pogoda i widok', s_okn: 'Okno – kontaktrony', uch: 'Jak mocno uchylone (do środka)', otw: 'Jak szeroko otwarte (do środka)',
    f: { entity: 'Roleta albo grupa rolet (lewa + prawa)', name: 'Nazwa', roleta_lewa: 'Roleta lewego skrzydła (opcjonalnie)', roleta_prawa: 'Roleta prawego skrzydła (opcjonalnie)',
      predkosc_lewa: 'Prędkość silnika lewej rolety (number, obr/min – opcjonalnie)', predkosc_prawa: 'Prędkość silnika prawej rolety (number, obr/min – opcjonalnie)',
      zrodlo: 'Skąd brać pogodę', pogoda: 'Encja pogody (puste = automatycznie)', tlo: 'Zdjęcie zza okna (np. /local/okno.jpg – plik w folderze www)',
      czujnik_lewe: 'Kontaktron lewego skrzydła (lub jedynego)', tryb_lewe: 'Lewe skrzydło po otwarciu jest…', czujnik_prawe: 'Kontaktron prawego skrzydła', tryb_prawe: 'Prawe skrzydło po otwarciu jest…' },
    zr: [['auto', 'z encji HA, a gdy jej nie ma – z internetu'], ['internet', 'z internetu (Open-Meteo, lokalizacja domu)'], ['brak', 'bez pogody (samo niebo)']],
    tr: [['uchyl', 'uchylone (góra do środka)'], ['otworz', 'otwarte (na zawiasach do środka)']] },
  en: { pv: 'Live preview – does not move the real blind', play: '▶ Show animation',
    wxl: ['real', '☀️ sun', '⛅ partly', '☁️ cloudy', '🌧️ rain', '💧 downpour', '⛈️ storm', '❄️ snow', '🌫️ fog', '💨 wind', '🌙 night'],
    kol: 'Stripe colour', ram: 'Window frame colour', own: 'custom', sk: 'Window sashes', sk1: '1 sash', sk2: '2 sashes', pin: 'Pin preview to top', okp: ['🪟 closed', '↘ tilted', '↔ open'],
    d_kol: 'Colour of the solid (blackout) stripes, as in day-night fabric collections; “custom” = any colour.', d_sia: 'Colour of the sheer stripes. “Like solid” = a lighter shade of the stripe colour.',
    d_ram: 'Colour of the frame and sashes. Colours with grain are wood-look veneers.', d_sk: 'Number of window sashes. With two, each sash can have its own blind.',
    d_okn: 'Shown when a contact sensor reports the window open. Move a slider to see it in the preview.',
    d_kr: 'The ▲ and ▼ buttons move the blind by a small step. Quick positions are the percentage buttons.', sl: 'Mullion between sashes', sl1: 'fixed', sl2: 'moving',
    slh: 'A fixed mullion stays in the frame. A moving one is part of the left sash, so with both sashes open the middle is free.',
    roz: 'Size and speed', wys: 'Window height', auto: 'Travel time from motor speed (auto)', czas: 'Full travel time (manual)',
    obr: (r, t) => `Motor speed: ${r} rpm → full travel approx. ${t} s`, obr0: 'This blind does not report motor speed', obrA: ' – assuming 30 s (the card will learn it, or use calibration).', obrU: t => ` – learned travel time: ${t} s.`, obrM: ' (measured on Moes motors)',
    kal: 'Travel time calibration', kalh: 'Manual stopwatch: click, then press “Arrived” when the blind reaches the end. Best from fully open to fully closed.',
    sia: 'Sheer stripe colour', siaj: 'like solid', poz: 'Quick positions (percent, comma separated, 100 = open)',
    sec_wyg: '🎨 Look', sec_okn: '🪟 Window', sec_ruch: '⏱ Motion and calibration', sec_zaaw: '⚙️ Advanced', rst: '↺ Restore defaults',
    wz: '🪄 Wizard', wzK: n => `step ${n} of 3`, wzW: '← Back', wzD: 'Next →', wzG: 'Done ✔', wzGr: n => `group: ${n} blinds (${n}-sash window)`,
    wz1: 'Pick a blind or a blind group. Groups are at the top.', wz2: 'The card checked your home by itself:', wz3: 'Pick a ready-made look. You can change everything later in 🎨 Look.',
    wzR: (a, m) => `Blind: ${a}${m ? ` → sashes: ${m}` : ''}`, wzS: (r, t) => `Motor: ${r} rpm → travel approx. ${t} s`, wzS0: 'The motor does not report speed – the card will learn the time (or calibrate in ⏱)',
    wzC: t => `Window contact sensors: ${t}`, wzC0: 'No contact sensors found in this room (add them later in 🪟)', wzP: t => `Weather: ${t}`, wzP0: 'Weather: from the internet (Open-Meteo, home location)',
    pre: ['Modern (anthracite + graphite)', 'Classic wood (golden oak + beige)', 'Scandinavian (white + cream)', 'Dark (black + black stripes)', 'Warm walnut (walnut + sand)', 'Colourful (white + turquoise)'],
    glob: '🌍 Global settings', globh: 'Save this look (colours, frame, window, buttons, options) as the default for all blind cards, including new ones. Each card can still change it.',
    gSave: '🌍 Save as default for all cards', gClr: 'Clear', gIle: n => `Saved globally: ${n} settings. All cards use them.`, gBrak: 'No global settings – cards use the defaults.',
    wibracja: 'Light phone vibration on tap', auto_czujniki: 'Find window contact sensors in this room automatically',
    czA: t => `🔎 Detected automatically (left / right): ${t}. Manual choice above takes priority.`, czA0: '🔎 No contact sensors found in this blind’s room – pick them above if you have any.', klamki: 'Window handles (turn when tilted or opened)',
    kr: 'Step movement', krs: 'One tap ▲/▼ moves the blind by', kr0: 'off',
    ak: '🤖 Calibrate automatically', akx: '■ Abort', akh: 'Note: this moves the real blind. It goes fully up, fully down and up again. The card measures the time and saves it.',
    ak0: 'Moving the blind to the top…', ak1: t => `Timing closing… ${t} s`, ak2: (a, t) => `Closing: ${a} s. Timing opening… ${t} s`,
    akok: t => `Done ✔ Saved travel time ${t} s`, akstop: 'Aborted – blind stopped.',
    akrpm: t => `The motors report their speed, so the card already computes the time (${t} s). No calibration needed ✔`,
    aktm: 'The blind did not report the end of travel. Use the manual stopwatch below.',
    kd: '⬇ Close & time', ku: '⬆ Open & time', kok: '✔ Arrived', kzap: 'Save this time', kwyn: t => `Measured: ${t} s`,
    opc: 'Options', jez: 'Card language', jauto: 'auto',
    przyciski: 'Buttons and quick positions', niebo: 'Sky and weather outside', widok: 'Drawn view: houses, trees, street',
    uchwyty: 'Handles on bottom rails (move one sash)', uchwyt_srodek: 'Centre handle ⇕ (moves both sashes)',
    osobno: 'Dragging on the glass moves one sash only', odwroc: 'Invert position (motor counts reversed)',
    s_enc: 'Blinds and motors', s_pog: 'Weather and view', s_okn: 'Window – contact sensors', uch: 'Tilt amount (inward)', otw: 'Opening width (inward)',
    f: { entity: 'Blind or blind group (left + right)', name: 'Name', roleta_lewa: 'Left sash blind (optional)', roleta_prawa: 'Right sash blind (optional)',
      predkosc_lewa: 'Left motor speed (number, rpm – optional)', predkosc_prawa: 'Right motor speed (number, rpm – optional)',
      zrodlo: 'Weather source', pogoda: 'Weather entity (empty = automatic)', tlo: 'Photo of the view (e.g. /local/window.jpg – file in www folder)',
      czujnik_lewe: 'Left sash contact sensor (or the only one)', tryb_lewe: 'When open, the left sash is…', czujnik_prawe: 'Right sash contact sensor', tryb_prawe: 'When open, the right sash is…' },
    zr: [['auto', 'HA entity, internet if there is none'], ['internet', 'internet (Open-Meteo, home location)'], ['brak', 'no weather (plain sky)']],
    tr: [['uchyl', 'tilted (top inward)'], ['otworz', 'open (on hinges, inward)']] }
};
const RR_POLA = ['entity', 'name', 'roleta_lewa', 'roleta_prawa', 'predkosc_lewa', 'predkosc_prawa', 'zrodlo', 'pogoda', 'tlo', 'czujnik_lewe', 'tryb_lewe', 'czujnik_prawe', 'tryb_prawe'];
const RR_PRZEL = ['auto_czujniki', 'klamki', 'wibracja', 'przyciski', 'niebo', 'widok', 'uchwyty', 'uchwyt_srodek', 'osobno', 'odwroc'];
class RoletaRealistycznaEditor extends HTMLElement {
  setConfig(c) { this._cfg = Object.assign({}, c); this._go(); }
  set hass(h) { this._hass = h; this._go(); }
  disconnectedCallback() { clearInterval(this._loop); this._loop = null; clearInterval(this._kalI); clearInterval(this._ak); this._ak = null; cancelAnimationFrame(this._raf); this._raf = null; }
  connectedCallback() { if (this._built) this._startMotor(); }
  _val(k) { return this._cfg[k] ?? RR_G.v?.[k] ?? RR_DEF[k]; }
  _set(k, v) {
    const c = Object.assign({}, this._cfg);
    if (v === RR_DEF[k] || v === '' || v == null) delete c[k]; else c[k] = v;   // zapisujemy tylko to, co różni się od domyślnych
    this._cfg = c;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: c }, bubbles: true, composed: true }));
    this._sync(); this._preview();
    /* v19: mignięcie podglądu – widać, że ustawienie już działa */
    const pv = this._r?.querySelector('.pv'); if (pv) { pv.classList.add('fl'); clearTimeout(this._flT); this._flT = setTimeout(() => pv.classList.remove('fl'), 500); }
  }
  _go() {
    if (!this._hass || !this._cfg) return;
    const lang = rrJezyk(this._cfg, this._hass);
    if (this._built && lang !== this._lang) { clearInterval(this._loop); this._loop = null; this._built = false; }   // zmiana języka = nowy edytor
    if (!this._built) { this._lang = lang; this._build(); }
    this._f.hass = this._hass;
    const d = {};
    RR_POLA.forEach(k => { d[k] = k === 'pogoda' && this._cfg.pogoda === 'auto' ? undefined : this._cfg[k] ?? (RR_DEF[k] === '' ? undefined : RR_DEF[k]); });
    this._f.data = d;
    this._sync(); this._preview();
  }
  _build() {
    const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
    const L = RR_ED[this._lang], KN = RR_KOL_NAZWY[this._lang], ri = this._lang === 'en' ? 1 : 0;
    const chip = (grp, val, color, label) => `<button class="dot" data-g="${grp}" data-v="${val}" title="${label}"><i style="background:${color}"></i><span>${label}</span></button>`;
    root.innerHTML = `
<style>
:host{display:block}
.ed{display:grid;gap:16px}
.pv{background:var(--secondary-background-color,rgba(127,127,127,.12));border-radius:12px;padding:10px;display:grid;gap:8px;transition:box-shadow .3s}
.pv.pin{position:sticky;top:0;z-index:6;box-shadow:0 6px 14px rgba(0,0,0,.35);background:var(--card-background-color,var(--ha-card-background,#1c1c1c))}
.pv.pin .slot{zoom:.5}
.pv.pin .wxp.wx1,.pv.pin .pvh>span:first-child{display:none}.pv.pin .pvh{justify-content:flex-end}
.pv.fl{box-shadow:0 0 0 2px var(--primary-color,#03a9f4),0 6px 14px rgba(0,0,0,.35)}
.pin-b{border:none;background:none;cursor:pointer;font-size:16px;opacity:.45;padding:2px 4px}.pv.pin .pin-b{opacity:1}
.wxp{display:flex;flex-wrap:wrap;gap:6px}
.wxp button{border:none;border-radius:14px;padding:4px 10px;font:inherit;font-size:12px;cursor:pointer;color:var(--primary-text-color);background:transparent;box-shadow:inset 0 0 0 1px var(--divider-color,rgba(127,127,127,.4))}
.wxp button[aria-pressed="true"]{background:var(--primary-color,#03a9f4);color:var(--text-primary-color,#fff);box-shadow:none}
.pvh{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;color:var(--secondary-text-color)}
.play{border:none;border-radius:16px;padding:6px 12px;font:inherit;font-size:13px;cursor:pointer;background:var(--primary-color,#03a9f4);color:var(--text-primary-color,#fff)}
.grp{display:grid;gap:8px}
.lb{font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:var(--secondary-text-color)}
.dots{display:flex;flex-wrap:nowrap;gap:6px;overflow-x:auto;scroll-snap-type:x proximity;padding:6px 2px 6px;scrollbar-width:thin;-webkit-overflow-scrolling:touch}
.dots .dot{flex:0 0 auto;scroll-snap-align:center}
.dots:has([aria-pressed="true"]) .dot:not([aria-pressed="true"]) i,.dots:has([aria-pressed="true"]) .dot:not([aria-pressed="true"]) .own{filter:grayscale(1);opacity:.38;transition:filter .2s,opacity .2s}
.dots .dot:not([aria-pressed="true"]):hover i{filter:none;opacity:1}
.dot[aria-pressed="true"] .own{box-shadow:0 0 0 3px var(--card-background-color,#1c1c1c),0 0 0 6px var(--primary-color,#03a9f4),0 0 16px 6px var(--primary-color,#03a9f4);transform:scale(1.35)}
.sec{border-radius:12px;box-shadow:inset 0 0 0 1px var(--divider-color,rgba(127,127,127,.3));padding:0 12px}
.sec>summary{cursor:pointer;padding:12px 0;font-size:15px;font-weight:500;color:var(--primary-text-color);list-style:none}
.sec>summary::-webkit-details-marker{display:none}.sec>summary:after{content:"▾";float:right;transition:transform .2s}.sec[open]>summary:after{transform:rotate(180deg)}
.sec[open]{padding-bottom:12px}
.sec>.grp{margin-bottom:18px}
.rst{justify-self:start;border:none;background:none;color:var(--primary-color,#03a9f4);font:inherit;font-size:13px;cursor:pointer;padding:4px 0}
.wiz{border-radius:14px;padding:12px;display:grid;gap:10px;background:var(--secondary-background-color,rgba(127,127,127,.12));box-shadow:inset 0 0 0 2px var(--primary-color,#03a9f4)}
.wiz[hidden]{display:none}
.wzh{display:flex;align-items:center;gap:8px}.wzh span{font-size:12px;color:var(--secondary-text-color)}.wzx{margin-left:auto;border:none;background:none;color:inherit;cursor:pointer;font-size:16px}
.wzl{display:grid;gap:6px}.wzl button{text-align:left;border:none;border-radius:10px;padding:10px;font:inherit;font-size:14px;cursor:pointer;color:var(--primary-text-color);background:var(--card-background-color,rgba(127,127,127,.1));box-shadow:inset 0 0 0 1px var(--divider-color,rgba(127,127,127,.3))}
.wzl button[aria-pressed="true"]{box-shadow:inset 0 0 0 2px var(--primary-color,#03a9f4)}.wzl small{display:block;color:var(--secondary-text-color);font-size:12px}
.wzl .sw2{display:inline-block;width:22px;height:22px;border-radius:5px;vertical-align:middle;margin-right:8px;box-shadow:inset 0 0 0 1px rgba(127,127,127,.4)}
.wzi{margin:0;padding-left:4px;list-style:none;display:grid;gap:6px;font-size:14px}
.lb .kn{text-transform:none;letter-spacing:0;color:var(--primary-text-color);margin-left:6px}
.dot{display:flex;flex-direction:column;align-items:center;gap:3px;border:none;background:none;cursor:pointer;padding:0;color:var(--secondary-text-color);font:inherit;font-size:11px;width:52px}
.dot i{width:34px;height:34px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(127,127,127,.5);transition:transform .15s}
.dot[aria-pressed="true"] i{box-shadow:0 0 0 3px var(--card-background-color,#1c1c1c),0 0 0 6px var(--primary-color,#03a9f4),0 0 16px 6px var(--primary-color,#03a9f4);transform:scale(1.35)}
.dots .dot[aria-pressed="true"]{width:70px;font-weight:600}
.dots .dot[aria-pressed="true"] i,.dots .dot[aria-pressed="true"] .own{margin:4px 0 9px}
.dots{padding:14px 10px 8px}
.psl{width:100%;margin:2px 0 0;accent-color:var(--primary-color,#03a9f4);height:28px}
.dot[aria-pressed="true"]{color:var(--primary-text-color)}
.own{position:relative;width:34px;height:34px;border-radius:50%;overflow:hidden;background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red);box-shadow:inset 0 0 0 1px rgba(127,127,127,.5)}
.own input{position:absolute;inset:-8px;width:50px;height:50px;opacity:0;cursor:pointer}
.seg{display:inline-flex;border-radius:10px;overflow:hidden;box-shadow:inset 0 0 0 1px var(--divider-color,rgba(127,127,127,.4))}
.seg button{border:none;background:none;padding:8px 16px;font:inherit;font-size:14px;cursor:pointer;color:var(--primary-text-color)}
.seg button[aria-pressed="true"]{background:var(--primary-color,#03a9f4);color:var(--text-primary-color,#fff)}
.sl{display:grid;gap:2px}
.sl div{display:flex;justify-content:space-between;font-size:14px;color:var(--primary-text-color)}
.sl b{font-weight:500;font-variant-numeric:tabular-nums}
.sl input{width:100%;accent-color:var(--primary-color,#03a9f4)}
.sl input.txt{box-sizing:border-box;padding:8px 10px;border-radius:8px;border:1px solid var(--divider-color,rgba(127,127,127,.4));background:transparent;color:inherit;font:inherit}
.sw{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:14px;color:var(--primary-text-color);padding:4px 0}
.hint{font-size:12px;color:var(--secondary-text-color);line-height:1.4;margin:0}
.ver{font-size:11px;color:var(--secondary-text-color);text-align:right}
.kal{display:flex;flex-wrap:wrap;gap:8px}.kal .ok{background:#2e7d32}.play[disabled]{opacity:.4;cursor:default}
.kalw{display:flex;align-items:center;gap:12px;font-size:20px;font-variant-numeric:tabular-nums;color:var(--primary-text-color)}
</style>
<div class="ed">
 <div class="wiz" hidden><div class="wzh"><b>${L.wz}</b><span id="wzK"></span><button class="wzx" title="✕">✕</button></div>
  <div id="wzB"></div><div class="kal"><button class="play" id="wzW">${L.wzW}</button><button class="play" id="wzD">${L.wzD}</button></div></div>
 <div class="f"></div>
 <div class="pv">
  <div class="pvh"><span>${L.pv}</span><span><button class="pin-b wzo" style="opacity:1" title="${L.wz}">🪄</button><button class="pin-b" title="${L.pin}">📌</button> <button class="play">${L.play}</button></span></div>
  <div class="wxp wx1">${['', 'sunny', 'partlycloudy', 'cloudy', 'rainy', 'pouring', 'lightning-rainy', 'snowy', 'fog', 'windy', 'clear-night'].map((v, k) => `<button data-wx="${v}">${L.wxl[k]}</button>`).join('')}</div>
  <div class="wxp">${['', 'uchyl', 'otworz'].map((v, k) => `<button data-okp="${v}">${L.okp[k]}</button>`).join('')}</div>
  <div class="slot"></div>
 </div>
 <details class="sec" data-sec="wyg" open><summary>${L.sec_wyg}</summary>
 <div class="grp"><div class="lb">${L.kol}<span class="kn" data-kn="kolor"></span></div><div class="dots" id="kol">
  ${Object.keys(RR_KOLORY).map(k => chip('kolor', k, RR_KOLORY[k], KN[k] || k)).join('')}
  <label class="dot" data-own="kolor" title="${L.own}"><span class="own"><input type="color" id="kolOwn"></span><span>${L.own}</span></label></div>
  <input type="range" class="psl" data-psl="kolor" min="0" step="1"><p class="hint">${L.d_kol}</p></div>
 <div class="grp"><div class="lb">${L.sia}<span class="kn" data-kn="siatka"></span></div><div class="dots" id="sia">
  ${chip('siatka', '', 'repeating-linear-gradient(180deg,#888 0 4px,#ddd 4px 7px)', L.siaj)}
  ${Object.keys(RR_KOLORY).map(k => chip('siatka', k, RR_KOLORY[k], KN[k] || k)).join('')}
  <label class="dot" data-own="siatka" title="${L.own}"><span class="own"><input type="color" id="siaOwn"></span><span>${L.own}</span></label></div>
  <input type="range" class="psl" data-psl="siatka" min="0" step="1"><p class="hint">${L.d_sia}</p></div>
 <div class="grp"><div class="lb">${L.ram}<span class="kn" data-kn="rama"></span></div><div class="dots" id="ram">
  ${Object.keys(RR_RAMY).map(k => chip('rama', k, k, RR_RAMY[k][ri])).join('')}
  <label class="dot" data-own="rama" title="${L.own}"><span class="own"><input type="color" id="ramOwn"></span><span>${L.own}</span></label></div>
  <input type="range" class="psl" data-psl="rama" min="0" step="1"><p class="hint">${L.d_ram}</p></div>
 <div class="grp"><div class="lb">${L.sk}</div><div class="seg"><button data-sk="1">${L.sk1}</button><button data-sk="2">${L.sk2}</button></div><p class="hint">${L.d_sk}</p></div>
 <div class="grp" id="slGrp"><div class="lb">${L.sl}</div><div class="seg"><button data-sl="staly">${L.sl1}</button><button data-sl="ruchomy">${L.sl2}</button></div><p class="hint">${L.slh}</p></div>
 <div class="grp"><label class="sl"><div>${L.wys} <b id="wysV"></b></div><input type="range" id="wys" min="140" max="460" step="10"></label></div>
 <button class="rst" data-rst="wyg">${L.rst}</button></details>
 <details class="sec" data-sec="okn"><summary>${L.sec_okn}</summary>
 <div class="grp"><div class="lb">${L.s_okn}</div>
  <label class="sl"><div>${L.uch} <b id="uchV"></b></div><input type="range" id="uch" min="3" max="30" step="1"></label>
  <label class="sl"><div>${L.otw} <b id="otwV"></b></div><input type="range" id="otw" min="5" max="90" step="5"></label><p class="hint">${L.d_okn}</p><p class="hint" id="czA"></p></div>
 <button class="rst" data-rst="okn">${L.rst}</button></details>
 <details class="sec" data-sec="ruch"><summary>${L.sec_ruch}</summary>
 <div class="grp"><div class="lb">${L.roz}</div>
  <label class="sw">${L.auto} <ha-switch id="auto"></ha-switch></label>
  <label class="sl" id="czasBox"><div>${L.czas} <b id="czasV"></b></div><input type="range" id="czas" min="3" max="90" step="0.5"></label>
  <p class="hint" id="obrH"></p></div>
 <div class="grp"><div class="lb">${L.kr}</div>
  <label class="sl"><div>${L.krs} <b id="krV"></b></div><input type="range" id="kr" min="0" max="25" step="1"></label>
  <label class="sl"><div>${L.poz}</div><input type="text" id="poz" inputmode="numeric" class="txt"></label><p class="hint">${L.d_kr}</p></div>
 <div class="grp"><div class="lb">${L.kal}</div>
  <p class="hint">${L.akh}</p>
  <div class="kal"><button class="play" id="akal">${L.ak}</button></div><p class="hint" id="akV"></p>
  <p class="hint">${L.kalh}</p>
  <div class="kal"><button class="play" data-kal="down">${L.kd}</button><button class="play" data-kal="up">${L.ku}</button><button class="play ok" id="kalOk" disabled>${L.kok}</button></div>
  <div class="kalw"><b id="kalV">0.0 s</b><button class="play" id="kalZap" hidden>${L.kzap}</button></div></div>
 <button class="rst" data-rst="ruch">${L.rst}</button></details>
 <details class="sec" data-sec="zaaw"><summary>${L.sec_zaaw}</summary>
 <div class="grp"><div class="lb">${L.jez}</div><div class="seg">${[['auto', L.jauto], ['pl', 'Polski'], ['en', 'English']].map(([v, t]) => `<button data-jz="${v}">${t}</button>`).join('')}</div></div>
 <div class="grp"><div class="lb">${L.opc}</div>
  ${RR_PRZEL.map(k => `<label class="sw">${L[k]} <ha-switch id="${k}"></ha-switch></label>`).join('')}</div>
 <div class="grp"><div class="lb">${L.glob}</div><p class="hint">${L.globh}</p>
  <div class="kal"><button class="play" id="gSave">${L.gSave}</button><button class="play" id="gClr" style="background:var(--secondary-text-color)">${L.gClr}</button></div><p class="hint" id="gInfo"></p></div>
 <button class="rst" data-rst="zaaw">${L.rst}</button></details>
 <div class="ver">roleta-realistyczna ${RR_WERSJA}</div>
</div>`;
    const $ = s => root.querySelector(s);
    this._r = root;
    this._f = document.createElement('ha-form');
    /* wszystko do wyboru (v17) – rozwijane sekcje, nic na sztywno */
    const sel = d => ({ entity: { domain: d } }), opt = a => ({ select: { mode: 'dropdown', options: a.map(([value, label]) => ({ value, label })) } });
    this._f.schema = [{ name: 'entity', required: true, selector: sel('cover') }, { name: 'name', selector: { text: {} } },
      { type: 'expandable', flatten: true, name: '', title: L.s_enc, icon: 'mdi:roller-shade', schema: [
        { name: 'roleta_lewa', selector: sel('cover') }, { name: 'roleta_prawa', selector: sel('cover') },
        { name: 'predkosc_lewa', selector: sel('number') }, { name: 'predkosc_prawa', selector: sel('number') }] },
      { type: 'expandable', flatten: true, name: '', title: L.s_pog, icon: 'mdi:weather-partly-cloudy', schema: [
        { name: 'zrodlo', selector: opt(L.zr) }, { name: 'pogoda', selector: sel('weather') }, { name: 'tlo', selector: { text: {} } }] },
      { type: 'expandable', flatten: true, name: '', title: L.s_okn, icon: 'mdi:window-open-variant', schema: [
        { name: 'czujnik_lewe', selector: sel('binary_sensor') }, { name: 'tryb_lewe', selector: opt(L.tr) },
        { name: 'czujnik_prawe', selector: sel('binary_sensor') }, { name: 'tryb_prawe', selector: opt(L.tr) }] }];
    this._f.computeLabel = s => L.f[s.name] || s.title || s.name;
    this._f.addEventListener('value-changed', e => { const v = e.detail.value;
      RR_POLA.forEach(k => this._set(k, v[k] || (k === 'pogoda' ? 'auto' : RR_DEF[k]))); });
    root.querySelectorAll('[data-jz]').forEach(b => b.onclick = () => this._set('jezyk', b.dataset.jz));
    root.querySelectorAll('[data-kal]').forEach(b => b.onclick = () => this._kal(b.dataset.kal));
    $('#kalOk').onclick = () => this._kalOk();
    $('#akal').onclick = () => this._akal();
    /* v22: przywracanie domyślnych w każdym dziale */
    const RST = { wyg: ['kolor', 'siatka', 'rama', 'skrzydla', 'slupek', 'wysokosc'], okn: ['kat_uchyl', 'otwarcie'], ruch: ['czas', 'krok', 'pozycje'], zaaw: ['jezyk', ...RR_PRZEL] };
    root.querySelectorAll('[data-rst]').forEach(b => b.onclick = () => RST[b.dataset.rst].forEach(k => this._set(k, null)));
    /* v22: kreator */
    $('.wzo').onclick = () => this._wiz(1);
    $('.wzx').onclick = () => { $('.wiz').hidden = true; };
    $('#wzW').onclick = () => this._wiz(this._wk - 1);
    $('#wzD').onclick = () => this._wk >= 3 ? ($('.wiz').hidden = true) : this._wiz(this._wk + 1);
    if (!Object.keys(this._cfg).some(k => k !== 'type' && k !== 'entity')) this._wiz(1);   // nowa karta = kreator od razu
    /* v21: ustawienia globalne */
    const gInfo = () => { const n = Object.keys(RR_G.v || {}).length; $('#gInfo').textContent = n ? L.gIle(n) : L.gBrak; };
    rrGlobLoad(this._hass).then(() => { gInfo(); this._sync(); this._preview(); });
    $('#gSave').onclick = () => {
      const v = {}; RR_GKLUCZE.forEach(k => { const x = this._val(k); if (x !== RR_DEF[k] && x !== '' && x != null) v[k] = x; });
      rrGlobSave(this._hass, v).then(() => { gInfo(); $('#gInfo').textContent += ' ✔'; });
      /* ta karta przejmuje wygląd z globalnych – zostawiamy w niej tylko encje i to, co nie jest wyglądem */
      const c = Object.assign({}, this._cfg); RR_GKLUCZE.forEach(k => delete c[k]); this._cfg = c;
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: c }, bubbles: true, composed: true }));
      this._sync(); this._preview();
    };
    $('#gClr').onclick = () => rrGlobSave(this._hass, {}).then(() => { gInfo(); this._sync(); this._preview(); });
    $('#kalZap').onclick = () => { if (this._kalWyn) this._set('czas', this._kalWyn); };
    root.querySelectorAll('[data-wx]').forEach(b => b.onclick = () => { this._wx = b.dataset.wx; this._sync(); this._feed(); });
    $('.f').appendChild(this._f);
    root.querySelectorAll('.dot[data-g]').forEach(b => b.onclick = () => this._set(b.dataset.g, b.dataset.v));
    /* v21: suwak pod paletą – przesuwasz i od razu wybierasz kolor z linii */
    root.querySelectorAll('[data-psl]').forEach(sl => {
      const g = sl.dataset.psl, dots = [...root.querySelectorAll(`.dot[data-g="${g}"]`)];
      sl.max = dots.length - 1;
      sl.oninput = () => { const b = dots[+sl.value]; if (b && b.dataset.v !== String(this._val(g) || '')) this._set(g, b.dataset.v); };
    });
    $('#kolOwn').oninput = e => this._set('kolor', e.target.value);
    $('#siaOwn').oninput = e => this._set('siatka', e.target.value);
    $('#ramOwn').oninput = e => this._set('rama', e.target.value);
    root.querySelectorAll('[data-sk]').forEach(b => b.onclick = () => this._set('skrzydla', +b.dataset.sk));
    root.querySelectorAll('[data-sl]').forEach(b => b.onclick = () => this._set('slupek', b.dataset.sl));
    $('#wys').oninput = e => this._set('wysokosc', +e.target.value);
    $('#uch').oninput = e => { this._okp = 'uchyl'; this._set('kat_uchyl', +e.target.value); };
    $('#otw').oninput = e => { this._okp = 'otworz'; this._set('otwarcie', +e.target.value); };
    root.querySelectorAll('[data-okp]').forEach(b => b.onclick = () => { this._okp = b.dataset.okp; this._sync(); this._preview(); });
    let pin = true; try { pin = localStorage.getItem('rr-pin') !== '0'; } catch (x) { /* bez pamięci */ }
    $('.pv').classList.toggle('pin', pin);
    $('.pin-b:not(.wzo)').onclick = () => { const on = $('.pv').classList.toggle('pin'); try { localStorage.setItem('rr-pin', on ? '1' : '0'); } catch (x) { /* bez pamięci */ } };
    $('#kr').oninput = e => this._set('krok', +e.target.value);
    $('#poz').onchange = e => this._set('pozycje', e.target.value.replace(/[^0-9,; ]/g, '').trim() || RR_DEF.pozycje);
    $('#czas').oninput = e => this._set('czas', +e.target.value);
    $('#auto').addEventListener('change', e => this._set('czas', e.target.checked ? 'auto' : Math.round(rrCzas('auto', this._rpm()[0]))));
    RR_PRZEL.forEach(k => $('#' + k).addEventListener('change', e => this._set(k, e.target.checked)));
    $('.play').onclick = () => this._demo();
    /* podgląd: prawdziwa karta z udawanym silnikiem */
    this._card = document.createElement('roleta-realistyczna');
    $('.slot').appendChild(this._card);
    this._m = { 'cover.podglad_l': { pos: 60, target: 60 }, 'cover.podglad_p': { pos: 60, target: 60 } };
    this._built = true;
    this._startMotor();
  }
  _rpm() {   // prędkość prawdziwych silników wybranej rolety (jeśli są) – podgląd jedzie w tym samym tempie
    const st = this._hass?.states[this._cfg.entity];
    const m = (st?.attributes?.entity_id || [this._cfg.entity]).slice(0, 2);
    if (m.length < 2) m.push(m[0]);
    const wyb = [this._cfg.roleta_lewa, this._cfg.roleta_prawa];
    return m.map((e, i) => rrRpm(this._hass, wyb[i] || e, this._cfg[i ? 'predkosc_prawa' : 'predkosc_lewa']));
  }
  _startMotor() {
    if (this._loop) return;
    let last = performance.now();
    this._loop = setInterval(() => {
      const now = performance.now(), dt = (now - last) / 1000; last = now;
      const rpm = this._rpm();
      let ch = false;
      Object.keys(this._m).forEach((id, i) => {
        const m = this._m[id], r = rpm[i] || rpm[0];
        const sp = 100 / rrCzas(this._val('czas'), r);
        const d = m.target - m.pos;
        if (Math.abs(d) > .01) { m.pos += Math.sign(d) * Math.min(Math.abs(d), sp * dt); ch = true; }
      });
      if (ch || this._was) this._feed();
      this._was = ch;
    }, 500);   // jak prawdziwy silnik: meldunek co pół sekundy
  }
  _feed() {
    if (!this._card || !this._hass) return;
    const ids = Object.keys(this._m), st = {};
    const rpm = this._rpm();
    ids.forEach((id, i) => {
      const m = this._m[id], s = m.target > m.pos + .01 ? 'opening' : m.target < m.pos - .01 ? 'closing' : m.pos <= 0 ? 'closed' : 'open';
      let p = Math.round(m.pos); if (this._val('odwroc')) p = 100 - p;
      st[id] = { state: s, attributes: { current_position: p } };
      if (rpm[i] || rpm[0]) st[id.replace('cover.', 'number.') + '_motor_speed'] = { state: String(rpm[i] || rpm[0]) };
    });
    const avg = Math.round(ids.reduce((a, id) => a + this._m[id].pos, 0) / ids.length);
    const ss = ids.map(id => st[id].state);
    st['cover.podglad'] = { state: ss.includes('opening') ? 'opening' : ss.includes('closing') ? 'closing' : avg <= 0 ? 'closed' : 'open',
      attributes: { current_position: this._val('odwroc') ? 100 - avg : avg, friendly_name: 'Podgląd', entity_id: ids } };
    /* pogoda w podglądzie: prawdziwa albo wybrana do testu */
    const wid = this._val('zrodlo') === 'auto' ? rrPogodaId(this._cfg, this._hass) : null;
    const real = this._val('zrodlo') === 'brak' ? null : (wid && this._hass.states[wid]) || rrInternet(this._hass, () => this._feed());
    st['weather.podglad'] = this._wx ? { state: this._wx, attributes: { temperature: this._wx === 'snowy' ? -2 : this._wx === 'sunny' ? 24 : 12, temperature_unit: '°C' } } : real;
    ['czujnik_lewe', 'czujnik_prawe'].forEach(k => { const id = this._cfg[k]; if (id && this._hass.states[id]) st[id] = this._hass.states[id]; });   // prawdziwe kontaktrony w podglądzie
    if (this._okp) st['binary_sensor.podglad_l'] = st['binary_sensor.podglad_p'] = { state: 'on' };
    st['sun.sun'] = this._wx ? { state: this._wx === 'clear-night' ? 'below_horizon' : 'above_horizon' } : this._hass.states['sun.sun'];
    const ed = this;
    this._card.hass = { states: st, language: this._hass.language, config: this._hass.config, callService(dom, svc, data) {
      const list = data.entity_id === 'cover.podglad' ? ids : [data.entity_id];
      let p = data.position; if (p != null && ed._val('odwroc')) p = 100 - p;
      list.forEach(id => { const m = ed._m[id]; m.target = svc === 'open_cover' ? 100 : svc === 'close_cover' ? 0 : svc === 'stop_cover' ? m.pos : p; });
      ed._feed();
    } };
  }
  _preview() {
    if (!this._card) return;
    const c = Object.assign({}, this._cfg, { entity: 'cover.podglad', name: this._cfg.name || RR_ED[this._lang].pv.split(' – ')[0], pogoda: 'weather.podglad', zrodlo: 'auto',
      roleta_lewa: '', roleta_prawa: '', predkosc_lewa: '', predkosc_prawa: '' });
    /* v19: okno w podglądzie (zamknięte / uchylone / otwarte) – udawane kontaktrony */
    if (this._okp) Object.assign(c, { czujnik_lewe: 'binary_sensor.podglad_l', czujnik_prawe: 'binary_sensor.podglad_p', tryb_lewe: this._okp, tryb_prawe: this._okp });
    const key = JSON.stringify(c);
    if (key !== this._pk) { this._pk = key; this._card.setConfig(c); }
    this._feed();
  }
  /* kalibracja stoperem (v17): komenda do prawdziwej rolety, użytkownik klika „Dojechała” */
  _kal(kier) {
    this._hass.callService('cover', kier === 'down' ? 'close_cover' : 'open_cover', { entity_id: this._cfg.entity });
    this._kalT = performance.now(); this._kalWyn = null;
    const r = this._r; r.querySelector('#kalOk').disabled = false; r.querySelector('#kalZap').hidden = true;
    clearInterval(this._kalI);
    this._kalI = setInterval(() => { r.querySelector('#kalV').textContent = ((performance.now() - this._kalT) / 1000).toFixed(1) + ' s'; }, 100);
  }
  /* v22: kreator w 3 krokach */
  _wiz(n) {
    const r = this._r, L = RR_ED[this._lang], h = this._hass, B = r.querySelector('#wzB');
    this._wk = n = Math.max(1, Math.min(3, n));
    r.querySelector('.wiz').hidden = false;
    r.querySelector('#wzK').textContent = L.wzK(n);
    r.querySelector('#wzW').style.visibility = n > 1 ? '' : 'hidden';
    r.querySelector('#wzD').textContent = n === 3 ? L.wzG : L.wzD;
    const nm = id => h.states[id]?.attributes?.friendly_name || id;
    if (n === 1) {
      const cov = Object.keys(h.states).filter(k => k.startsWith('cover.')).sort((a, b) => (h.states[b].attributes?.entity_id?.length || 0) - (h.states[a].attributes?.entity_id?.length || 0));
      B.innerHTML = `<p class="hint">${L.wz1}</p><div class="wzl">${cov.map(k => { const g = h.states[k].attributes?.entity_id?.length;
        return `<button data-wc="${k}">${nm(k)}<small>${g ? L.wzGr(g) : k}</small></button>`; }).join('')}</div>`;
      B.querySelectorAll('[data-wc]').forEach(b => { b.setAttribute('aria-pressed', b.dataset.wc === this._cfg.entity);
        b.onclick = () => { this._set('entity', b.dataset.wc); this._wiz(2); }; });
    } else if (n === 2) {
      const e = this._cfg.entity, m = (h.states[e]?.attributes?.entity_id || []), rpm = this._rpm().filter(x => x > 0), cz = rrCzujnikiAuto(h, e).filter(Boolean);
      const wid = rrPogodaId(this._cfg, h);
      const li = (ok, t) => `<li>${ok ? '✅' : 'ℹ️'} ${t}</li>`;
      B.innerHTML = `<p class="hint">${L.wz2}</p><ul class="wzi">
        ${li(true, L.wzR(nm(e), m.length ? m.map(nm).join(', ') : ''))}
        ${li(rpm.length, rpm.length ? L.wzS(rpm[0], rrCzas('auto', rpm[0]).toFixed(1)) : L.wzS0)}
        ${li(cz.length, cz.length ? L.wzC(cz.map(nm).join(', ')) : L.wzC0)}
        ${li(true, wid ? L.wzP(nm(wid)) : L.wzP0)}</ul>`;
    } else {
      const P = RR_PRESETY;
      B.innerHTML = `<p class="hint">${L.wz3}</p><div class="wzl">${P.map((p, i) => `<button data-wp="${i}"><span class="sw2" style="background:linear-gradient(135deg,${p.rama} 50%,${rrHex(p.kolor)} 50%)"></span>${L.pre[i]}</button>`).join('')}</div>`;
      B.querySelectorAll('[data-wp]').forEach(b => b.onclick = () => {
        const p = P[+b.dataset.wp]; ['rama', 'kolor', 'siatka'].forEach(k => this._set(k, p[k] ?? null));
        B.querySelectorAll('[data-wp]').forEach(x => x.setAttribute('aria-pressed', x === b));
      });
    }
  }
  /* automatyczna kalibracja (v18): góra → dół (mierzone) → góra (mierzone), średnia zapisana jako czas */
  _akal() {
    const r = this._r, L = RR_ED[this._lang], out = r.querySelector('#akV'), btn = r.querySelector('#akal'), e = this._cfg.entity;
    const koniec = txt => { clearInterval(this._ak); this._ak = null; btn.textContent = L.ak; out.textContent = txt; };
    if (this._ak) { this._hass.callService('cover', 'stop_cover', { entity_id: e }); koniec(L.akstop); return; }
    const rpm = this._rpm()[0];
    if (rpm > 0) { out.textContent = L.akrpm(rrCzas('auto', rpm).toFixed(1)); return; }
    const kroki = [['open_cover', 100], ['close_cover', 0], ['open_cover', 100]], wyn = [];
    const stan = () => { const s = this._hass.states[e] || {}; const p = s.attributes?.current_position;
      return { mv: s.state === 'opening' || s.state === 'closing', p: this._cfg.odwroc && typeof p === 'number' ? 100 - p : p, k: (s.last_updated || '') + s.state + p }; };
    let n = -1, t0, ruch, k0;
    const dalej = () => {
      n++;
      if (n === kroki.length) { const t = Math.round((wyn[0] + wyn[1]) * 10 / 2) / 10; this._set('czas', t); koniec(L.akok(t)); return; }
      this._hass.callService('cover', kroki[n][0], { entity_id: e }); t0 = performance.now(); ruch = false; k0 = stan().k;
    };
    btn.textContent = L.akx; out.textContent = L.ak0;
    this._ak = setInterval(() => {
      const s = stan(), el = (performance.now() - t0) / 1000, cel = kroki[n][1];
      if (s.mv) ruch = true;
      /* koniec jazdy: roleta przestała meldować „jedzie” albo (silnik bez tego stanu) przyszła pozycja docelowa */
      const dojechala = ruch ? !s.mv && el > 1 : el > 4 && s.k !== k0 && s.p === cel || n === 0 && el > 3 && s.p === cel;
      if (dojechala) { if (n) wyn.push(el); dalej(); }
      else if (el > 240) koniec(L.aktm);
      else if (this._ak) out.textContent = n === 0 ? L.ak0 : n === 1 ? L.ak1(el.toFixed(1)) : L.ak2(wyn[0].toFixed(1), el.toFixed(1));
    }, 200);
    dalej();
  }
  _kalOk() {
    if (!this._kalT) return;
    clearInterval(this._kalI);
    this._kalWyn = Math.round((performance.now() - this._kalT) / 100) / 10; this._kalT = null;
    const r = this._r, L = RR_ED[this._lang];
    r.querySelector('#kalV').textContent = L.kwyn(this._kalWyn);
    r.querySelector('#kalOk').disabled = true; r.querySelector('#kalZap').hidden = false;
  }
  _demo() {   // pokaz: opuść do końca, potem zwiń do połowy
    const ids = Object.keys(this._m);
    ids.forEach(id => this._m[id].target = 0); this._feed();
    clearTimeout(this._dt);
    const t = rrCzas(this._val('czas'), this._rpm()[0]);
    this._dt = setTimeout(() => { ids.forEach(id => this._m[id].target = 50); this._feed(); }, t * 1000 * .7 + 800);
  }
  _sync() {
    if (!this._r) return;
    const r = this._r, kol = this._val('kolor'), rama = this._val('rama');
    r.querySelectorAll('.dot[data-g="kolor"]').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === kol));
    r.querySelectorAll('.dot[data-g="rama"]').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === rama));
    r.querySelectorAll('.dot[data-g="siatka"]').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === (this._val('siatka') || '')));
    /* v20: własny kolor podświetlony, gdy wartości nie ma w palecie; nazwa wybranego koloru przy tytule; wybrany na środek linii */
    ['kolor', 'siatka', 'rama'].forEach(g => {
      const v = g === 'siatka' ? this._val(g) || '' : this._val(g), sel = [...r.querySelectorAll(`.dot[data-g="${g}"]`)].find(b => b.dataset.v === v);
      const own = r.querySelector(`[data-own="${g}"]`); own.setAttribute('aria-pressed', !sel);
      own.querySelector('.own').style.background = sel ? '' : rrHex(v);
      r.querySelector(`[data-kn="${g}"]`).textContent = '· ' + (sel ? sel.title : (/^#/.test(v) ? v : RR_ED[this._lang].own));
      const el = sel || own, sl = r.querySelector(`[data-psl="${g}"]`);
      if (sel && r.activeElement !== sl) sl.value = [...r.querySelectorAll(`.dot[data-g="${g}"]`)].indexOf(sel);
      if (this._kn?.[g] !== v) { (this._kn = this._kn || {})[g] = v; const d = el.parentElement; d.scrollTo({ left: el.offsetLeft - d.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' }); }
    });
    r.querySelector('#kolOwn').value = /^#[0-9a-f]{6}$/i.test(rrHex(kol)) ? rrHex(kol) : '#232427';
    r.querySelector('#ramOwn').value = /^#[0-9a-f]{6}$/i.test(rama) ? rama : '#f4f4f2';
    r.querySelectorAll('[data-sk]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.sk === +this._val('skrzydla')));
    r.querySelectorAll('[data-sl]').forEach(b => b.setAttribute('aria-pressed', b.dataset.sl === this._val('slupek')));
    r.querySelector('#slGrp').style.display = +this._val('skrzydla') === 1 ? 'none' : '';
    const set = (id, v, txt) => { const el = r.querySelector('#' + id); if (r.activeElement !== el) el.value = v; r.querySelector('#' + id + 'V').textContent = txt; };
    set('wys', this._val('wysokosc'), this._val('wysokosc') + ' px');
    set('uch', this._val('kat_uchyl'), this._val('kat_uchyl') + '°');
    set('otw', this._val('otwarcie'), this._val('otwarcie') + ' %');
    if (r.activeElement !== r.querySelector('#poz')) r.querySelector('#poz').value = this._val('pozycje');
    set('kr', this._val('krok'), +this._val('krok') > 0 ? '▲▼ ' + this._val('krok') + ' %' : RR_ED[this._lang].kr0);
    const auto = this._val('czas') === 'auto';
    r.querySelector('#auto').checked = auto;
    r.querySelector('#czasBox').style.display = auto ? 'none' : '';
    if (!auto) set('czas', this._val('czas'), this._val('czas') + ' s');
    const rpm = this._rpm().filter(x => x > 0);
    const L = RR_ED[this._lang];
    r.querySelector('#obrH').textContent = rpm.length
      ? L.obr([...new Set(rpm)].join(', '), rrCzas(this._val('czas'), rpm[0]).toFixed(1)) + (auto ? L.obrM : '')
      : L.obr0 + (auto ? (rrUcz.get(this._cfg.entity) ? L.obrU(rrUcz.get(this._cfg.entity).toFixed(1)) : L.obrA) : '.');
    RR_PRZEL.forEach(k => { r.querySelector('#' + k).checked = !!this._val(k); });
    r.querySelectorAll('[data-jz]').forEach(b => b.setAttribute('aria-pressed', b.dataset.jz === this._val('jezyk')));
    r.querySelectorAll('[data-wx]').forEach(b => b.setAttribute('aria-pressed', b.dataset.wx === (this._wx || '')));
    /* v21: co karta wykryła sama */
    const czA = this._val('auto_czujniki') !== false ? rrCzujnikiAuto(this._hass, this._cfg.entity) : [];
    const nz = id => this._hass.states[id]?.attributes?.friendly_name || id;
    r.querySelector('#czA').textContent = czA.filter(Boolean).length ? L.czA(czA.map(x => x ? nz(x) : '–').join(' / ')) : L.czA0;
    r.querySelectorAll('[data-okp]').forEach(b => b.setAttribute('aria-pressed', b.dataset.okp === (this._okp || '')));
  }
}
customElements.define('roleta-realistyczna-editor', RoletaRealistycznaEditor);

window.customCards = window.customCards || [];
window.customCards.push({ type: 'roleta-realistyczna', name: 'Roleta dzień-noc ' + RR_WERSJA, description: 'Realistyczna roleta dzień-noc na oknie 2-skrzydłowym z animacją, przeciąganiem i prawdziwą pogodą za oknem', preview: true });
