# 📝 Historia zmian – Roleta dzień-noc

## v22

🪄 kreator w 3 krokach (wybierz roletę → co karta wykryła sama → gotowy wygląd), sam się otwiera przy nowej karcie; menu w rozwijanych działach: 🎨 Wygląd, 🪟 Okno, ⏱ Ruch i kalibracja, ⚙️ Zaawansowane; w każdym „↺ Przywróć domyślne”

## v21

edytor: wybrane kółko koloru duże i świecące; pod każdą paletą suwak – przesuwasz palcem i od razu wybierasz kolor; automatyczne wykrywanie: prędkość silnika z tego samego urządzenia co roleta, kontaktrony okna z tego samego pomieszczenia (lewe/prawe po nazwie); w edytorze widać, co wykryto (opcja auto_czujniki, ręczny wybór ma pierwszeństwo); ustawienia globalne: „🌍 Zapisz jako domyślne dla wszystkich kart” – wygląd zapisany w profilu użytkownika HA, każda karta (i każda nowa) go przejmuje, a własne ustawienia karty mają pierwszeństwo; nowa karta sama wybiera grupę rolet

## v20

edytor: palety kolorów w kółkach w jednej przewijanej linii; wybrany kolor podświetlony i przewinięty na środek, pozostałe wyszarzone; nazwa wybranego koloru przy tytule grupy

## v19

kolory ram jak w sklepach z oknami: okleiny drewnopodobne ze słojami (złoty dąb, orzech, mahoń, winchester, dąb bagienny, dąb jasny) i kolory gładkie (szary agat, srebrny, czarny, zieleń, ...); słupek między skrzydłami: stały (zostaje w oknie) albo ruchomy (przy lewym skrzydle, po otwarciu obu skrzydeł środek jest wolny; lewe skrzydło bez klamki) – opcja slupek; edytor: podgląd przypięty u góry (📌) – przy każdym ustawieniu od razu widać, jak wygląda; krótki opis pod każdą grupą; w podglądzie okno zamknięte / uchylone / otwarte, a suwaki uchyłu i otwarcia same pokazują okno w tym położeniu; paleta tkanin dzień-noc jak u producentów (naturalne, szarości, pastele, jaskrawe) i własny kolor; klamki okna jak prawdziwe (w dół zamknięte, poziomo otwarte, w górę uchylone; najpierw obrót klamki, potem skrzydło) – opcja klamki

## v18

poprawka: otwarte skrzydło (lewe i prawe) otwiera się naprawdę do środka pokoju (wolny brzeg w naszą stronę), a nie na zewnątrz; automatyczna kalibracja jednym przyciskiem (roleta sama jedzie góra → dół → góra, karta mierzy i zapisuje czas); karta sama uczy się czasu przejazdu z każdego ruchu rolety, która melduje „otwiera/zamyka się”; ruch krokowy: przyciski ▲ 5% / ▼ 5% – każde kliknięcie to mały krok, kliknięcia się sumują (opcja krok, 0 = wyłączony); 10 jaskrawych kolorów pasów (czerwony, bordo, różowy, fiolet, niebieski, turkus, zielony, limonka, żółty, oliwka) i osobny kolor pasów przezroczystych (opcja siatka, puste = jak pełne); własne szybkie pozycje (opcja pozycje, np. „100,60,30,0”); lekka wibracja telefonu przy kliknięciu (opcja wibracja)

## v17

uniwersalna dla każdego, nic na sztywno: w ustawieniach wybierasz rolety lewego i prawego skrzydła (albo grupę), encje prędkości silników (albo czas), źródło pogody (encja HA / internet / brak), kontaktrony; kalibracja czasu przejazdu stoperem w edytorze; język karty i edytora: auto / polski / English; uchwyty na listwie i środkowy można wyłączyć; ustawienia w edytorze pogrupowane w rozwijane sekcje; suwaki „jak mocno uchylone” (stopnie) i „jak szeroko otwarte” (% szerokości) – oba do środka pokoju; przy uchyleniu i otwarciu widać wyraźną szczelinę, a przez nią to, co za oknem (niebo, widok, pogoda)

## v16

uniwersalnie, także bez integracji pogody: gdy w HA nie ma encji weather.*, karta sama pobiera aktualną pogodę z internetu (Open-Meteo, darmowe, bez klucza) dla lokalizacji domu z HA, odświeżanie co 15 min; niebo zmienia się z porą dnia wg wysokości słońca (sun.sun): dzień, złota godzina przy wschodzie/zachodzie (pomarańczowe niebo, nisko słońce), zmierzch (fioletowe niebo, zapalone okna), noc; uchylenie skrzydła teraz do środka pokoju (góra skrzydła do nas), otwarcie też do środka; dotknięcie rolety jak pilot z jednym przyciskiem: w trakcie jazdy = STOP, kolejne dotknięcie = jazda w przeciwną stronę (stojąca na dole jedzie w górę, na górze w dół)

## v15

okno uchylone albo otwarte wg kontaktronu: dla lewego i prawego skrzydła wybierasz czujnik (binary_sensor) i tryb – „uchyl” (góra skrzydła odchyla się do środka) albo „otworz” (skrzydło otwiera się na zawiasach); animacja ruchu skrzydła, za skrzydłem widać to, co za oknem; w podtytule „okno lewe uchylone”

## v14

rysowany widok za oknem (gdy nie ma zdjęcia): wzgórza, domy, drzewa, ulica i latarnia, jeden widok przez oba skrzydła; zmienia się z pogodą: śnieg na dachach i trawie, mokra ulica z odbiciami przy deszczu, drzewa kołyszą się przy wietrze i burzy, pochmurno = szarzej; w nocy zapalone okna i świecące latarnie; jedno słońce/księżyc na całe okno; opcja „widok” (wyłączenie = samo niebo)

## v13

poprawka: po STOP i po dojechaniu animacja nie skacze od spóźnionych meldunków silnika (Moes potrafi wysłać fałszywe 100% nawet 50 s później) – okno spokoju wydłużone do 60 s i działa też po STOP

## v12

własne zdjęcie widoku zza okna jako tło (opcja „tlo”, np. /local/okno.jpg): jedno zdjęcie przez oba skrzydła, na nim animowana pogoda (chmury, deszcz, śnieg, mgła, błyski), przyciemnienie wg pogody i noc (ciemno + gwiazdy)

## v11

3 uchwyty: uchwyt na dolnej listwie skrzydła steruje tylko tym skrzydłem, okrągły uchwyt na środku okna (na słupku) steruje oboma naraz; przeciąganie w innym miejscu szyby jak dotąd (oba, albo jedno z opcją „osobno”)

## v10

animacja nie skacze od fałszywych meldunków Moes (test Dariusza 20.10 19:28: przy „50%” silniki meldowały 0 i 100 w trakcie jazdy, prawy nawet na końcu 100, choć oba stanęły w połowie): po komendzie z karty liczy się cel komendy, meldunki 0/100 niezgodne z celem są pomijane, a każdy meldunek brany jest tylko raz; po przeciągnięciu lub kliknięciu przerywana linia z „→ 50%” pokazuje, gdzie roleta jedzie, aż dojedzie; w nagłówku „32% → 50%”

## v9

pogoda rusza się też na telefonie z włączonym „ograniczeniem ruchu” / oszczędzaniem baterii (v8 ją wtedy zamrażała); błysk burzy w obu skrzydłach naraz

## v8

prawdziwa pogoda za oknem z Home Assistanta (encja weather, domyślnie weather.dom): słońce, chmury płynące po niebie, deszcz, ulewa, burza z błyskami, śnieg, mgła, wiatr; w nocy księżyc i migające gwiazdy (wg sun.sun); temperatura i opis pogody w podtytule; w edytorze wybór encji pogody i przyciski „pogoda w podglądzie”; uchwyt do podnoszenia na środku dolnej listwy każdego skrzydła

## v7

„open 0%” na końcu opuszczania jest przyjmowane (to prawdziwe 0%), na starcie podnoszenia pomijane; czas zmierzony na prawdziwych roletach 20.10: 40 obr/min ≈ 30 s, 255 obr/min ≈ 22 s → czas = 20,2 + 394 / obroty (tryb „auto”, domyślny); ruch startuje też, gdy roletę ruszy ktoś inny (pilot, automatyzacja, inny panel) – silnik Moes od razu zmienia stan na „open”/„closed”, a pozycję podaje dopiero na końcu; ręczny czas nadal możliwy

## v6

edytor graficzny jak symulator: kółka kolorów (pasy i rama, plus własny kolor), przyciski skrzydeł, suwaki, przełączniki i żywy podgląd z przyciskiem „Pokaż animację” (udawany silnik w tempie prawdziwych silników)

## v5

numer wersji widoczny na karcie (obok nazwy) i w nazwie karty na liście kart

## v4

tempo animacji z prawdziwej prędkości silnika Moes (encja number.*_motor_speed, obr/min) osobno dla każdego skrzydła: czas przejazdu = „czas” × („obroty_ref” / obroty silnika); zmiana prędkości silnika w HA od razu zmienia animację

## v3

śledzenie silnika: każdy meldunek pozycji z silnika od razu (płynnie, ~0,5 s) przesuwa roletę na zgłoszone miejsce, a między meldunkami jedzie w tempie silnika; chwilowe „0%” przy stanie otwarta jest pomijane (błąd meldunku Zigbee)

## v2

przeciąganie ustawia oba skrzydła naraz (opcja „osobno” = jedno); animacja 1:1 w tempie silnika (czas przejazdu), rusza od razu po kliknięciu; poprawka silników Zigbee, które przy „open” podają 0%; opcja „odwroc”; numer wersji w konsoli

## v1

okno 2-skrzydłowe, biała kasetka, pasy dzień-noc, przeciąganie, przyciski, niebo dzień/noc, edytor wizualny
