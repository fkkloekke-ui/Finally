/* ============================================================
   Finally Card — Gebundeld bestand voor HACS
   Versie: 3.5.2
   Bevat: FinallySkyCard, FinallySkyCardMobile, FinallyWizard
   Dit bestand wordt door HACS als enige resource gedownload;
   alle drie de custom elements worden hierin geregistreerd.

   v3.5.2 — Fix op v3.5.1: de walstroom-instellingen-popup (kiosk + mobiel)
   kreeg door de nieuwe OVERBELASTING-sectie een vaste hoogte die op
   kleinere/mobiele schermen buiten beeld viel, zonder scroll-mogelijkheid
   — het onderste deel (uit-drempel/duur, sluitknop) was dan onbereikbaar.
   Popup-container heeft nu max-height + overflow-y:auto (met
   -webkit-overflow-scrolling:touch voor soepel scrollen op iOS/Android).

   v3.5.1 — Walstroom-overbelastingsbeveiliging instelbaar gemaakt in de
   kaart zelf (kiosk + mobiel), i.p.v. alleen via de HA-automation-editor.
   Nieuwe rij "OVERBELASTING" in de bestaande walstroom-instellingen-popup
   met vier +/- regelaars: aan-drempel (W), uit-drempel (W), aan-duur (s),
   uit-duur (s). Achterliggende automations op MS Finally herbouwd van een
   vaste for:-tijd naar een wait_for_trigger-patroon met instelbare timeout
   (native for: kan niet naar een helper-entity verwijzen, timeout: wel) —
   voorkomt dat korte lastpieken (bv. een koffiezetapparaat van 32s) al
   walstroom inschakelen. Nieuwe config-velden (allemaal met sensibele
   defaults, geen wijziging nodig als de installateur de standaard
   helper-namen aanhoudt): walstroom_overbelasting_aan_entity,
   walstroom_overbelasting_uit_entity, walstroom_overbelasting_aan_duur_entity,
   walstroom_overbelasting_uit_duur_entity. Bij nieuwe klantinstallaties:
   vier input_number-helpers aanmaken met exact deze namen (net als de
   bestaande verbruik_gisteren-helper) — geen automatische wizard-detectie,
   want dit zijn generieke helpers, geen Victron-specifieke serienummers.

   v3.5.0 — Nieuwe wizard-stap: "Overige sensoren" (Zigbee/Tuya/MQTT/
   ESPHome). Victron-detectie werkt op vaste namen die de integratie zelf
   bepaalt (betrouwbaar te raden). Zigbee/Tuya-entiteiten krijgen hun naam
   echter van de installateur zelf bij het koppelen — daar is dus niets
   betrouwbaars op te raden. In plaats van te gokken toont deze nieuwe
   stap alle nog niet-toegewezen entiteiten uit deze platforms (via
   config/entity_registry/list, gegroepeerd per platform) met een
   dropdown per entity om 'm aan een rol toe te wijzen (binnentemp,
   luchtvochtigheid, windrichting, verwarming, douchepomp, watertank-
   override). Wizard is hernummerd van 5 naar 6 stappen (nieuwe stap 4,
   Foto/Voltooien geworden stap 5/6). Toegewezen rollen komen automatisch
   mee in de gegenereerde config-YAML op de afrondingspagina, met een
   guard tegen dubbele/tegenstrijdige sleutels als een rol al via
   auto-detectie was ingevuld (bv. watertank_level_entity).

   v3.4.6 — Extra bij v3.4.5: bestandsnaam van de voorgrond-illustratie
   (voorheen altijd 'boot.png') is nu ook los configureerbaar via
   foreground_image, naast de al configureerbare background_folder.
   Voorkomt verwarring bij thema's zonder boot (bv. camper: 'camper.png'
   i.p.v. het bestand nog steeds 'boot.png' te moeten noemen). Standaard
   blijft 'boot.png', dus geen wijziging voor bestaande installaties.

   v3.4.5 — Fix op v3.4.4: boot.png (de bootillustratie bovenop de
   weer-achtergrond, kiosk én mobiel) was nog hardcoded naar
   '/local/finally-card/boot.png' en volgde NIET mee met background_folder.
   Gevolg: met een alternatieve achtergrond-map (bv. camper-thema) bleef
   er toch een boot overheen liggen. Nu volgt boot.png de background_folder
   mee — dus elke thema-map heeft ook zijn eigen boot.png nodig (zelfde
   bestandsnaam, andere illustratie, bv. een camper/bus-silhouet voor de
   camper-map).

   v3.4.4 — Configureerbare achtergrond-map toegevoegd (background_folder).
   finallySkyImagePath() accepteert nu een basePath-parameter i.p.v. de
   hardcoded '/local/finally-card/'; standaard blijft dat pad ongewijzigd
   (geen breaking change voor bestaande installaties). Doel: alternatieve
   tegel-sets met exact dezelfde bestandsnamen (bv. een camper-variant met
   gras i.p.v. water) kunnen nu via één config-regel worden aangewezen,
   zonder aparte codebase of los HACS-bestand:
     background_folder: /local/finally-card-camper/
   Config-regel moet per kaart handmatig worden toegevoegd — komt niet
   automatisch mee bij een HACS-update, die introduceert alleen de optie.

   v3.4.3 — Watertank-detectie (onderdeel van Punt B/tanksensoren) alsnog
   gebouwd. Bleek bij nader onderzoek NIET te bestaan als los _detectTanks()
   met drie routes zoals eerder aangenomen — de wizard had helemaal geen
   tankdetectie, en zowel de kiosk-sidebar (id="syp-wt") als de mobiele
   kaart toonden een permanente placeholder ('--'/'—') zonder ooit een
   echte entity te koppelen. Nu toegevoegd:
   - wizard-detectie op meerdere kandidaat-patronen (percentage-sensoren
     met 'tank' in de naam, victron_gx tank_N_level-patroon, Tuya-stijl
     watertank-sensor) — GEEN van deze patronen is bevestigd op live
     Cerbo-hardware, dus behandel als best-effort met handmatige
     invoer-fallback, niet als geverifieerd;
   - nieuwe config-velden watertank_level_entity (percentage) en
     watertank_capacity_l (optioneel, voor literweergave — niet
     automatisch af te leiden, moet handmatig in config);
   - kiosk- en mobiele Watertank-rij tonen nu echte data i.p.v. een
     permanente placeholder, mits geconfigureerd.
   Dieseltank NIET meegenomen — er bestond geen bestaande UI-stub voor
   (alleen watertank had een dode placeholder-rij), dus dat is een
   nieuwe UI-toevoeging in plaats van het repareren van iets bestaands;
   apart oppakken indien gewenst.

   v3.4.2 — Punt B audit afgerond op resterende gaten:
   1) JK BMS-celdetail (individuele celspanningen, cycli, mos-temp in de
      accu-popup, kiosk én mobiel) gebruikte nog hardcoded het OUDE
      Batmon-naampatroon 'jk_bms_N_jk_bms_N_...' van vóór de rename van
      juni 2026, terwijl SOC/cel-min/max al wél configureerbaar waren.
      Nieuwe gedeelde config-velden bms1_entity_prefix/bms2_entity_prefix
      lossen dit consistent op (fallback blijft het oude patroon).
   2) De wizard (_detectEntities) detecteerde JK BMS 1/2 helemaal niet —
      SmartShunt/MPPT/Quattro/GX Device/Shelly wel, BMS nooit. Toegevoegd:
      auto-detectie op het nieuwe patroon (jk_bms_N_*_soc), handmatige
      invoer-fallback, en opname in de gegenereerde config-YAML + de
      installatie-samenvatting van stap 5.
   3) Generator-run-state/runtime-vandaag/runtime-totaal/service-counter
      waren nog hardcoded terwijl de generator-switch zelf al in v3.3.5
      configureerbaar was gemaakt — nu consistent met dezelfde
      config+fallback-pattern (generator_run_state_entity,
      generator_runtime_today_entity, generator_runtime_total_entity,
      generator_service_counter_entity).
   Bevestigd GEEN wijziging nodig: gx_device_*-sensoren (pv_power,
   dc_battery_power, system_state, ac_input_limit e.d.) zijn universele
   namen binnen de victron_gx-integratie (bevestigd door de wizard's
   eigen detectielogica, die op exact deze naam checkt zonder
   serienummer-variatie); accu_beschikbaar_wh/verwachte_accuduur hebben
   al een correcte berekende fallback via battery_capacity_wh/
   battery_min_soc_pct.

   v3.4.1 — Regressie uit v3.3.9 gefixt: de mobiele dieselkosten-
   instellingen-popup (_genKostenPopupOpen) miste de guard in de
   hass-setter die volledige her-renders onderdrukt terwijl een popup
   open staat (zelfde scroll-reset-mechanisme als _energiePopupOpen /
   _walInstPopupOpen sinds v3.2.7). Zonder deze guard herbouwde de kaart
   elke ~2s de hele DOM terwijl je verbruik/dieselprijs probeerde in te
   stellen. De kiosk-kant had dit probleem niet — die gebruikt de
   generieke sidebar-guard (sbContainer._activePanel), die de nieuwe
   Generator-sectie al automatisch meenam.

   v3.4.0 — Versienummer opgehoogd na verwarring met v3.3.13/v3.3.14 in
   een andere chatsessie: die twee werden per ongeluk gebouwd op een
   oud/onvolledig basisbestand (uit een andere, geïsoleerde sandbox) en
   misten een groot deel van de functionaliteit tot en met v3.3.12. Dit
   bestand is inhoudelijk identiek aan v3.3.12 (alle audit-refactors,
   dieselkosten-tegel, Michiel-fixes, MPPT-Engels-herstel) — alleen het
   versienummer is opgehoogd om de kapotte tussenversies op GitHub te
   overschrijven.

   v3.3.12 — MPPT-status terug naar de rauwe Engelse Victron-waarde
   (bulk/absorption/float/etc.), de Nederlandse vertaling uit v3.3.3
   ("Volop laden" e.d.) weer teruggedraaid op verzoek. Vertaaltabel en
   -functie verwijderd, niet alleen uitgeschakeld.

   v3.3.11 — Generator/dieselkosten nu ook in de kiosk-energiepopup
   (naast Zon/Walstroom-totalen), niet alleen in de mobiele weergave.
   Bijvangst tijdens het bouwen: nog twee gemiste hardcoded entiteiten
   in diezelfde popup — sensor.gx_device_ac_uitgang_dagverbruik en
   sensor.gx_device_verbruik_aan_boord_maand (beide Eriks eigen
   utility_meter-helpers, geen universele Victron-namen, zelfde
   categorie fout als v3.3.8). Nu configureerbaar via load_dag_entity
   (hergebruikt) en het nieuwe load_aan_boord_maand_entity. De
   generator-sectie in de popup is bewust NIET achter show_generator
   gezet — de kiosk toont zijn generatortegel altijd ongeacht die vlag
   (in tegenstelling tot mobiel), dus de popup-sectie volgt dat gedrag.
   Bij Michiel gekoppeld; load_aan_boord_maand_entity wijst daar naar
   dezelfde Quattro Uitgang Maandoverzicht-meter als load_maand_entity
   (geen aparte nieuwe helper-keten, want zelfde onderliggende grootheid).

   v3.3.10 — Dieselkosten-tegel (v3.3.9) verfijnd op twee punten:
   1) Dieselprijs-stapgrootte van €0,05 naar €0,005 (halve cent),
      weergave nu op 3 decimalen zodat de stap zichtbaar is.
   2) "Totaal" was gebaseerd op de levenslange generator-draaiuren-
      teller — dat klopte niet met hoe PV/walstroom het doen (die
      tonen "deze maand"). Nieuw config-veld
      generator_runtime_maand_entity (fallback
      sensor.generator_draaiuren_maand) — een maandelijkse
      utility_meter op generator_start_stop_total_runtime, zelfde
      patroon als de PV/walstroom-maandtellers. Tegel en info-rij
      hernoemd van "totaal" naar "deze maand". Bij Michiel aangemaakt:
      sensor.generator_start_stop_generator_draaiuren_maand.

   v3.3.9 — Nieuwe "Dieselkosten"-tegel naast de generator start/stop-
   knop (mobiel). Ruwe schatting: draaiuren (bestaande universele
   generator_start_stop_*-sensoren) × verbruik (L/u) × dieselprijs (€/L).
   De twee laatste zijn instelbaar per klant via een eigen input_number-
   helper (generator_verbruik_entity / generator_diesel_prijs_entity,
   fallback op input_number.generator_verbruik_lh /
   input_number.generator_diesel_prijs) — tik op de tegel voor een
   instellingen-popup met steppers, net als bij de walstroom-drempels.
   Nieuwe klant-installatiestap: deze twee input_number-helpers moeten
   per klant worden aangemaakt (geen wizard-ondersteuning hiervoor nog).
   Bij Michiel al aangemaakt en gekoppeld
   (input_number.generator_verbruik_l_h, .generator_dieselprijs).

   v3.3.8 — Nog een audit-vondst: load_dag_entity / load_maand_entity
   (Verbruik vandaag/maand in de Walstroom & Verbruik-popup) stonden nog
   hardcoded op sensor.gx_device_ac_uitgang_dagverbruik /
   sensor.gx_device_quattro_uitgang_maandoverzicht. Ondanks de
   "gx_device_"-naam zijn dit GEEN universele Victron-integratie-
   entiteiten (in tegenstelling tot bijv. gx_device_dc_battery_power) —
   het zijn Eriks eigen utility_meter-helpers (Riemann-som op
   gx_device_consumption_power_l1, dus wel een universele bron, maar
   zelf per installatie opnieuw opgebouwd). Nu configureerbaar. Bij
   Michiel ontbrak deze hele helper-keten; opnieuw opgebouwd op zijn
   systeem (zelfde opzet: integration-helper → maand-utility_meter →
   dag-utility_meter erop).

   v3.3.7 — Punt B (audit-refactor), afronding blok 6 + weer-entity:
   - weather_entity is nu configureerbaar (11 plekken hardcoded op Eriks
     eigen weather.forecast_thuis — dit domein miste de vorige audit-scan
     volledig). Fallback blijft weather.forecast_thuis.
   - sky_card_image-afhankelijkheid volledig verwijderd: de dag/nacht +
     weertype → achtergrond-PNG-logica (Eriks eigen templates.yaml-sensor)
     is nu rechtstreeks in de kaart gebouwd (nieuwe functie
     finallySkyImagePath), op basis van het ingebouwde sun.sun-elevatie-
     attribuut + de (nu configureerbare) weather_entity. Klanten hoeven
     dus geen losse template-helper meer te bouwen — scheelt een stap in
     de installatiehandleiding. Bestandsnamen gebruiken de bestaande
     klant-conventie (/local/finally-card/<naam>.png, geen "sky-" prefix).
   - Dode code opgeruimd: p2000/scheepvaart-variabelen (input_text.laatste_
     p2000_bericht, sensor.scheepvaart_tekst) werden nog berekend maar
     nergens meer gerenderd — restant van een allang opgegeven feature.
     Verwijderd uit kiosk + mobiel. Op MS Finally zelf bleek scheepvaart_
     tekst al niet meer te bestaan; sensor.p2000 (platform "p2000") staat
     daar nog wel, maar buiten configuration.yaml/templates.yaml om — komt
     vermoedelijk uit een oude custom_component, nog niet gelokaliseerd.

   v3.3.6 — Punt B (audit-refactor), eerste tranche: 26 entiteiten die nog
   hardcoded stonden op Eriks eigen namen zijn nu configureerbaar via
   this._config, met fallback op Eriks eigen entiteiten:
   - JK BMS (10): bms1/bms2_cell_min/max_entity, bms1/bms2_soc_entity,
     bms1/bms2_cycles_entity, bms1/bms2_mos_temp_entity
   - BMS temp-helpers (2): bms1/bms2_temp_netjes_entity
   - Binnenklimaat (2): indoor_temp_entity, indoor_humidity_entity —
     show_indoor_climate bestond al sinds v3.3.2, maar verborg alleen de
     tegel; de onderliggende sensor was nog steeds Eriks eigen ewelink-
     sensor. Nu pas echt configureerbaar.
   - Verwarming/douchepomp mobiel (2): heating_climate_entity,
     douchepomp_switch_entity — zelfde verhaal: hide_douchepomp bestond
     al, de entity zelf niet.
   - Locatie/weer (7): waterhoogte_entity, waterhoogte_verwacht_entity,
     weer_tekst_entity, weer_code_entity, sun_next_rising_entity,
     sun_next_setting_entity, wind_direction_entity
   - Walstroom-instellingen-popup (3): walstroom_soc_aan_entity,
     walstroom_soc_uit_entity, walstroom_zon_drempel_entity
   Bewust NIET aangepast: de gx_device_* en generator_start_stop_*
   entiteiten (GX-kern + generator-sensoren, ~14 stuks) — geverifieerd bij
   Michiel dat de victron_gx/mqtt-integratie deze altijd met identieke
   naam aanmaakt (vaste device-naam, geen serienummer), dus deze zijn al
   universeel en hoeven niet configureerbaar te worden. sky_card_image en
   scheepvaart_tekst nog open — eerst bepalen of dit config-opties worden
   of Erik-only blijven.

   v3.3.5 — Generator handmatig start/stop-knop (kiosk + mobiel) is nu
   configureerbaar via generator_switch_entity (this._config), met
   fallback op Eriks eigen switch.generator_start_stop_manual_start.
   Zonder dit config-veld werkte de knop nergens anders dan bij Erik zelf
   (zelfde patroon als walstroom_switch_entity in v3.2.3). De overige
   generator-sensoren (run_state, runtime vandaag/totaal, service counter)
   staan nog hardcoded — volgt bij de bredere audit-refactor (punt B).

   v3.3.4 — Nieuwe optionele "Machinekamer"-tegel (mobiel) in de
   Weer & omgeving-sectie: toont temperatuur van een configureerbare sensor
   (engine_room_temp_entity), met vorstwaarschuwing (rood, ⚠️) zodra de
   temperatuur op of onder engine_room_frost_temp komt (standaard 5°C).
   Verborgen als engine_room_temp_entity niet is ingesteld.

   v3.3.3 — MPPT-status (kiosk + mobiel) toonde de ruwe Engelse
   Victron-waarde (bijv. "bulk", "absorption", "float"). Nu vertaald naar
   leesbaar Nederlands ("Volop laden", "Absorptie", "Druppellading", etc.)
   via een gedeelde vertaaltabel; onbekende waarden vallen terug op de
   ruwe tekst.

   v3.3.2 — Mobiel: "Klimaat & omgeving" samengevoegd met "Weer &
   omgeving". Binnentemp/vochtigheid zijn nu uit te zetten via
   show_indoor_climate: false (standaard nog aan, voor klanten die dat wél
   hebben). Luchtdruk kwam voorheen van Eriks eigen barometer-sensor (die
   voor andere klanten altijd op 0 bleef staan) — leest nu de pressure-
   attribuut van de al gebruikte generieke weerentiteit, geen aparte sensor
   meer nodig.

   v3.3.1 — Kiosk: batterij-icoontje bij Totaal SOC stond liggend (breed,
   plat) en leek op kleine schermen op een minteken. Nu rechtop (staand
   accu-icoon, vulling van onder naar boven) en iets groter
   (soc_icon_size default 30 → 34px).

   v3.3.0 — Mobiele kaart: Generator-sectie verplaatst naar helemaal
   onderaan, direct na Walstroom, zodat beide AC-invoerbronnen (AC-in-1
   generator, AC-in-2 walstroom) bij elkaar staan.

   v3.2.9 — Mobiele generator-tegel opgesplitst: aparte grote drukknop
   (zelfde .touch-btn stijl als walstroom, met bevestigingspopup) om te
   starten/stoppen, en een losse info-kaart met alleen status, draaiuren
   vandaag/totaal en draaiuren sinds onderhoud (nieuwe generieke sensor
   generator_start_stop_service_counter). Kiosk-tegel ongewijzigd (compacte
   layout, minder ruimte voor een grote knop).

   v3.2.8 — Accubank "tijd te gaan" is nu configureerbaar via
   battery_capacity_wh + battery_min_soc_pct (nieuwe berekening: bruikbare
   Wh = capaciteit × (huidige SOC% − minimale SOC%), gedeeld door huidig
   ontlaadvermogen). Zonder deze twee velden valt de kaart terug op Eriks
   eigen Template Helpers (accu_beschikbaar_wh/verwachte_accuduur). Ook de
   accu-popup gebruikte nog hardcoded SmartShunt-entities i.p.v. de
   configureerbare velden — dat is nu ook rechtgezet.

   v3.2.7 — Scroll-reset in de mobiele energie-popup gefixt: de hass-update
   deed elke 2 seconden een volledige herrender, ook terwijl deze popup open
   stond, waardoor scrollen telkens terugsprong naar boven. Zelfde patroon
   als eerder toegepast op Eriks eigen kaart (skip volledige render zolang
   een popup open is).

   v3.2.6 — PV-opbrengst (vandaag/maand) in de energie-tegel is nu
   configureerbaar via pv_vandaag_entity en pv_maand_entity, met fallback
   op Eriks eigen Template Helpers. "Gisteren" was al configureerbaar sinds
   v3.2.1 via mppt_yield_yesterday_entity.

   v3.2.5 — Walstroom-verbruik in de energie-flow/popup is nu configureerbaar
   via walstroom_dagverbruik_entity, walstroom_verbruik_maand_entity en
   walstroom_verbruik_watt_entity, met fallback op Eriks eigen
   Shelly-sensoren. Zonder Shelly-vermogenmeting bij een klant tonen
   dagverbruik/maandverbruik nog altijd 0,00 kWh (geen bron beschikbaar) —
   het instant-vermogen kan wel gekoppeld worden aan de bestaande AC-input
   power-sensor.

   v3.2.4 — Bevestigingspopup toegevoegd bij handmatig inschakelen van
   walstroom én bij handmatig starten van de generator (kiosk + mobiel), om
   per ongeluk aan-/uitzetten te voorkomen. Uitschakelen/stoppen blijft
   direct werken, geen bevestiging nodig.

   v3.2.3 — Walstroom-tegel/override zijn nu configureerbaar via
   walstroom_switch_entity en walstroom_override_entity (this._config), met
   fallback op Eriks eigen switch.walstroom_socket_1 /
   input_boolean.walstroom_override. Zonder deze config-velden ingevuld
   werkte de knop nergens anders dan bij Erik zelf.

   v3.2.2 — Leesbaarheid buiten/in fel licht: alle grijze/gedimde tekst
   (rgba(255,255,255,0.1–0.7)) is nu bijna wit (0.95), en kleine labels/tekst
   t/m 14px zijn 1px vergroot. Grote hero-cijfers ongewijzigd om de
   pixel-precieze kiosklayout niet te verstoren.

   v3.2.1 — MPPT (SmartSolar) en Quattro-alarmen/meetwaarden zijn nu
   configureerbaar via this._config (mppt_state_entity, mppt_yield_yesterday_entity,
   mppt_max_power_today_entity, quattro_dc_voltage_entity, quattro_high_temp_alarm_entity,
   quattro_input_power_l1_entity, quattro_input_voltage_l1_entity,
   quattro_low_battery_alarm_entity, quattro_output_frequency_l1_entity,
   quattro_output_power_l1_entity, quattro_output_voltage_l1_entity,
   quattro_overload_alarm_entity), met fallback op Eriks eigen serienummers.
   ============================================================ */

// Achtergrondafbeelding op basis van weertype + zonshoogte + uur van de dag.
// Zelfde logica als Eriks eigen "sky_card_image" template-sensor (templates.yaml),
// nu rechtstreeks in de kaart zodat klanten geen losse helper-sensor meer hoeven te
// bouwen. Bestandsnamen volgen de klant-conventie: /local/finally-card/<naam>.png
// (geen "sky-" prefix — dat was alleen Eriks eigen padnaam).
function finallySkyImagePath(condition, elev, hour, basePath) {
  const bp = basePath || '/local/finally-card/';
  const isDay = elev >= 0;
  if (!isDay) {
    if (condition === 'sunny' || condition === 'clear-night') return bp + 'night-clear.png';
    if (condition === 'cloudy' || condition === 'overcast') return bp + 'cloudy-night.png';
    return bp + 'partlycloudy-night.png';
  }
  if (elev < 6 && hour < 12) return bp + 'clear-dawn.png';
  if (elev < 6 && hour >= 12) return bp + 'clear-dusk.png';
  if (condition === 'sunny' || condition === 'clear-night') return bp + 'clear-day.png';
  if (condition === 'cloudy' || condition === 'overcast') return bp + 'cloudy-day.png';
  if (condition === 'partlycloudy') return bp + 'partlycloudy-day.png';
  if (condition === 'rainy' || condition === 'pouring') return bp + 'rainy-day.png';
  if (condition === 'lightning' || condition === 'lightning-rainy') return bp + 'thunderstorm.png';
  if (condition === 'snowy' || condition === 'snowy-rainy') return bp + 'snowy-day.png';
  if (condition === 'fog') return bp + 'fog-day.png';
  return bp + 'partlycloudy-day.png';
}

class FinallySkyCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = {};
    this._lastUpdate = 0;
    this._waterHistory = [];
    this._historyLoaded = false;
    this._lastHistoryLoad = 0;
    this._animRunning = false;
    this._walLimitPopupOpen = false;
    this._walLimitVal = 16;
    this._walInstPopupOpen = false;
    this._walConfirmPopupOpen = false;
    this._genConfirmPopupOpen = false;
    this._resizeHandler = () => this._applyScale();
    window.addEventListener('resize', this._resizeHandler);
    this._activeBuf = null; // t.b.v. stable_render dubbele buffering (voorkomt zwarte flits bij herrender)
  }

  // Past nieuw gerenderde HTML toe op de shadow DOM.
  // Drie dingen worden precies ÉÉN keer neergezet en daarna nooit meer aangeraakt:
  // - het CSS-stijlblok (honderden regels, nooit dynamisch)
  // - de "schil" rond de content: .wrap/.design-canvas + de achtergrond- en bootafbeelding
  //   (een <img> opnieuw aanmaken dwingt de browser 'm opnieuw te decoderen, ook al is de
  //   src identiek — dat bleek de resterende bron van de zichtbare flits)
  // Alleen het stuk tussen de FCDYN-markers (alle tegels/popups) wordt nog per render vervangen.
  // Met stable_render:true gebeurt dat via dubbele buffering (buiten beeld opbouwen, dan pas tonen).
  _applyRenderedHtml(html, skyImg, afterSwap) {
    const startMarker = '<!--FCDYN_START-->';
    const endMarker = '<!--FCDYN_END-->';
    const startIdx = html.indexOf(startMarker);
    const endIdx = html.indexOf(endMarker);
    if (startIdx === -1 || endIdx === -1) {
      // Veiligheidsnet: markers niet gevonden (bijv. door een toekomstige wijziging) —
      // val terug op de oude, altijd-werkende volledige vervanging.
      this.shadowRoot.innerHTML = (this._styleBlock || '') + html;
      if (afterSwap) afterSwap();
      return;
    }
    const shellPrefix = html.slice(0, startIdx + startMarker.length);
    const dynContent = html.slice(startIdx + startMarker.length, endIdx);
    const shellSuffix = html.slice(endIdx);

    if (!this._shellInjected) {
      this.shadowRoot.innerHTML = (this._styleBlock || '')
        + shellPrefix + '<div id="fc-dyn"></div>' + shellSuffix;
      this._shellInjected = true;
    }
    const bgImg = this.shadowRoot.getElementById('fc-bg-img');
    if (bgImg && bgImg.src !== skyImg) bgImg.src = skyImg; // alleen echt bijwerken bij verandering

    const dynRoot = this.shadowRoot.getElementById('fc-dyn');
    if (!dynRoot) { this._shellInjected = false; return this._applyRenderedHtml(html, skyImg, afterSwap); }

    if (!(this._config && this._config.stable_render)) {
      dynRoot.innerHTML = dynContent;
      if (afterSwap) afterSwap();
      return;
    }
    if (!this._activeBuf) {
      // Eerste render: bouw de twee buffer-lagen op. Beide starten "on-screen"; de inactieve
      // wordt hieronder direct off-screen gezet (niet visibility:hidden).
      dynRoot.innerHTML = `
        <div id="fc-buf-a" style="position:fixed;inset:0"></div>
        <div id="fc-buf-b" style="position:fixed;top:0;left:-9999px;width:100vw;height:100vh"></div>
      `;
      this._activeBuf = 'a';
    }
    const showId = this._activeBuf === 'a' ? 'fc-buf-b' : 'fc-buf-a';
    const hideId = this._activeBuf === 'a' ? 'fc-buf-a' : 'fc-buf-b';
    const showEl = this.shadowRoot.getElementById(showId);
    const hideEl = this.shadowRoot.getElementById(hideId);
    if (!showEl || !hideEl) {
      dynRoot.innerHTML = dynContent;
      this._activeBuf = null;
      if (afterSwap) afterSwap();
      return;
    }
    showEl.innerHTML = dynContent; // buiten beeld (links van het canvas) opbouwen — browser rendert dit gewoon echt
    this._activeBuf = this._activeBuf === 'a' ? 'b' : 'a';
    // Dubbele rAF: geeft de browser twee volledige frames om de nieuwe inhoud daadwerkelijk
    // te tekenen voordat we 'm on-screen zetten — pas dan is de swap echt naadloos.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        showEl.style.left = '0';
        hideEl.style.left = '-9999px';
        hideEl.innerHTML = ''; // meteen leegmaken: voorkomt dubbele elementen met hetzelfde ID
                                // (anders pakt getElementById soms de verkeerde/verborgen kopie,
                                // bijv. bij _applyScale() -> canvas "vliegt" heen en weer)
        if (afterSwap) afterSwap(); // schaal/animaties/listeners pas NU, op de echte zichtbare buffer
      });
    });
  }

  _applyScale() {
    const canvas = this.shadowRoot && this.shadowRoot.getElementById('design-canvas');
    if (!canvas) return;
    let scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    // Op kleine schermen (bijv. 10" kiosk-touchscreens) mag de tekst niet onleesbaar klein worden.
    // Config-optie 'min_scale' zet een ondergrens; de kaart wordt dan uitgesneden (overflow:hidden op .wrap)
    // in plaats van dat alles in verhouding krimpt. Standaard uit (geen wijziging voor bestaande grote schermen).
    const minScale = (this._config && this._config.min_scale) ? Number(this._config.min_scale) : null;
    if (minScale && scale < minScale) scale = minScale;
    canvas.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  setConfig(config) {
    this._config = config;
    this._render();
  }

  disconnectedCallback() {
    if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
  }

  set hass(hass) {
    this._hass = hass;
    const now = Date.now();
    // Render niet als verwarming popup open is
    const verwPopup = this.shadowRoot && this.shadowRoot.getElementById('verw-popup');
    if (verwPopup && verwPopup.style.display === 'flex') return;
    // Render niet als walstroom instellingen popup open is
    if (this._walInstPopupOpen) return;
    // Render niet als KNMI popup open is
    const knmiPopup = this.shadowRoot && this.shadowRoot.getElementById('knmi-popup');
    if (knmiPopup && knmiPopup.style.display === 'flex') return;
    // Als sidebar popup open is: alleen data refreshen, GEEN volledige render (voorkomt scroll-reset)
    const sbContainer = this.shadowRoot && this.shadowRoot.getElementById('sb-overlay-container');
    if (sbContainer && sbContainer.style.display !== 'none' && sbContainer._activePanel) {
      if (now - this._lastUpdate > 1000) {
        this._lastUpdate = now;
        this._fillPopupData(sbContainer._activePanel, sbContainer);
      }
      return;
    }
    if (now - this._lastUpdate > ((this._config && this._config.render_throttle_ms) || 1000)) {
      this._lastUpdate = now;
      this._render();
    }
    if (!this._historyLoaded || now - this._lastHistoryLoad > 600000) {
      this._lastHistoryLoad = now;
      this._historyLoaded = true;
      this._loadWaterHistory();
      this._loadForecast();
      this._loadWaterForecast();
    }
  }


  _openSidebar(id) {
    // Zorg dat popup container bestaat
    let container = this.shadowRoot.getElementById('sb-overlay-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'sb-overlay-container';
      this._overlayContainer = container;
      // Voeg popup CSS toe
      const style = document.createElement('style');
      style.textContent = `
        #sb-overlay-container { position: fixed; inset: 0; z-index: 200; display: flex;
          align-items: center; justify-content: center;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(6px); }
        .sb-panel { background: rgba(6,16,48,0.97); border: 1px solid rgba(100,170,255,0.3);
          border-radius: 20px; padding: 28px 36px; width: min(960px, 92vw); max-height: 92vh;
          overflow-y: auto; box-shadow: 0 8px 48px rgba(0,0,0,0.7);
          color: #fff; font-family: 'Segoe UI', system-ui, sans-serif; }
        .sb-title { font-size: 12px; letter-spacing: 3px; color: rgba(255,255,255,0.95);
          text-transform: uppercase; margin-bottom: 20px; display: flex;
          justify-content: space-between; align-items: center; }
        .sb-close { font-size: 22px; cursor: pointer; color: rgba(255,255,255,0.95);
          padding: 2px 10px; border-radius: 8px; border: 0.5px solid rgba(255,255,255,0.15); }
        .sb-grid  { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        .sb-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        .sb-card  { background: rgba(255,255,255,0.04); border: 0.5px solid rgba(100,170,255,0.14);
          border-radius: 14px; padding: 12px 14px; }
        .sb-card-lbl { font-size: 10px; color: rgba(255,255,255,0.95); letter-spacing: 1.5px;
          text-transform: uppercase; margin-bottom: 8px; }
        .sb-card-val { font-size: 26px; font-weight: 700; line-height: 1; }
        .sb-card-sub { font-size: 13px; color: rgba(255,255,255,0.95); margin-top: 6px; }
        .sb-bar-wrap { height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px;
          overflow: hidden; margin-top: 10px; }
        .sb-bar-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease; }
        .sb-row { display: flex; justify-content: space-between; padding: 5px 0;
          border-bottom: 0.5px solid rgba(255,255,255,0.06); font-size: 14px; }
        .sb-row:last-child { border-bottom: none; }
        .sb-row-lbl { color: rgba(255,255,255,0.95); }
        .sb-row-val { color: #fff; font-weight: 600; }
        .sb-section { font-size: 10px; letter-spacing: 2px; color: rgba(255,255,255,0.95);
          text-transform: uppercase; margin: 16px 0 10px; }
        .sb-stat-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 12px; }
        .sb-mini { background: rgba(255,255,255,0.04); border: 0.5px solid rgba(100,170,255,0.12);
          border-radius: 12px; padding: 14px 12px; text-align: center; }
        .sb-mini-lbl { font-size: 10px; color: rgba(255,255,255,0.95); letter-spacing: 1px;
          text-transform: uppercase; margin-bottom: 6px; }
        .sb-mini-val { font-size: 18px; font-weight: 700; }
        .cel-tile { background: rgba(255,255,255,0.05); border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 7px; padding: 6px 2px; text-align: center; transition: background 0.3s, border-color 0.3s; }
        .cel-nr { font-size: 9px; color: rgba(255,255,255,0.95); margin-bottom: 2px; }
        .cel-v  { font-size: 12px; font-weight: 700; color: #fff; }
      `;
      container.appendChild(style);
      // Klik buiten panel = sluiten
      container.onclick = (e) => { if (e.target === container) this._closeSidebar(); };
      this.shadowRoot.appendChild(container);
    }

    // Bouw popup inhoud — bewaar style element
    const existingStyle = container.querySelector('style');
    container.innerHTML = '';
    if (existingStyle) container.appendChild(existingStyle);
    const panel = document.createElement('div');
    panel.className = 'sb-panel';
    panel.innerHTML = this._buildPopupHTML(id);
    // Sluiten knop
    panel.querySelector('.sb-close').onclick = () => this._closeSidebar();
    container.appendChild(panel);
    container.style.display = 'flex';
    container._activePanel = id;  // Bijhouden welk panel open is

    // Vul met actuele data
    this._fillPopupData(id, container);
  }

  _closeSidebar() {
    const c = this.shadowRoot.getElementById('sb-overlay-container');
    if (c) { c.style.display = 'none'; c._activePanel = null; }
  }

  _buildPopupHTML(id) {
    const titles = {
      energie: '⚡ ENERGIE — REAL-TIME', solar: '☀️ ZONNEPANELEN',
      accu: `🔋 ACCUBANK${(this._config && this._config.hide_battery_label) ? '' : ` — ${(this._config && this._config.battery_bank_label) || '628Ah LiFePO4'}`}`, generator: '⚙️ GENERATOR',
      klimaat: '🌡️ KLIMAAT AAN BOORD', verlichting: '💡 VERLICHTING', systeem: '🖥️ SYSTEEM'
    };
    const h = (s) => `<div class="sb-title"><span>${titles[id]||id}</span><span class="sb-close">✕</span></div>` + s;

    if (id === 'energie') return h(`
      <div class="sb-grid">
        <div class="sb-card"><div class="sb-card-lbl">Verbruik aan boord</div>
          <div class="sb-card-val" id="ep-load" style="color:#ff8844">-- W</div>
          <div class="sb-bar-wrap"><div class="sb-bar-fill" id="ep-load-bar" style="background:linear-gradient(90deg,#ff4400,#ff8844)"></div></div></div>
        <div class="sb-card"><div class="sb-card-lbl">Zonneopbrengst</div>
          <div class="sb-card-val" id="ep-pv" style="color:#ffd700">-- W</div>
          <div class="sb-bar-wrap"><div class="sb-bar-fill" id="ep-pv-bar" style="background:linear-gradient(90deg,#ff8800,#ffd700)"></div></div></div>
        <div class="sb-card"><div class="sb-card-lbl">Walstroom ingang</div>
          <div class="sb-card-val" id="ep-grid" style="color:#00aaff">-- W</div>
          <div class="sb-bar-wrap"><div class="sb-bar-fill" id="ep-grid-bar" style="background:linear-gradient(90deg,#0066ff,#00aaff)"></div></div></div>
      </div>
      <div class="sb-grid">
        <div class="sb-card"><div class="sb-card-lbl">Batterij</div>
          <div class="sb-card-val" id="ep-batt">-- W</div><div class="sb-card-sub" id="ep-batt-sub">--</div></div>
        <div class="sb-card"><div class="sb-card-lbl">AC uit</div>
          <div class="sb-card-val" id="ep-acv" style="color:#aaffcc">-- V</div>
          <div class="sb-card-sub" id="ep-ach">-- Hz</div></div>
        <div class="sb-card"><div class="sb-card-lbl">Systeemstatus</div>
          <div class="sb-card-val" id="ep-state" style="font-size:16px">--</div>
          <div class="sb-card-sub" id="ep-state-sub">--</div></div>
      </div>
      <div class="sb-section">Dagstatistieken</div>
      <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:10px;margin-bottom:12px">
        <div class="sb-mini"><div class="sb-mini-lbl">Zonnepanelen vandaag</div><div class="sb-mini-val" id="ep-pvd" style="color:#ffd700">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">Zonnepanelen gisteren</div><div class="sb-mini-val" id="ep-pvg" style="color:#ffaa44">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">Zonnepanelen maand</div><div class="sb-mini-val" id="ep-pvm" style="color:#ff8800">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">Walstroom dag</div><div class="sb-mini-val" id="ep-gd" style="color:#00aaff">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">Verbruik dag</div><div class="sb-mini-val" id="ep-ld" style="color:#ff8844">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">Verbruik maand</div><div class="sb-mini-val" id="ep-lm" style="color:#ff6622">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">DC spanning</div><div class="sb-mini-val" id="ep-dcv" style="color:#aaffcc">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">DC vermogen</div><div class="sb-mini-val" id="ep-dcw" style="color:#aaffcc">--</div></div>
      </div>
      <div class="sb-section">Kosten &amp; rendement (&#8364;${((this._config && this._config.walstroom_kwh_prijs_entity && this._hass && parseFloat(this._hass.states[this._config.walstroom_kwh_prijs_entity]?.state)) || 0.50).toFixed(2)}/kWh)</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px">
        <div class="sb-mini"><div class="sb-mini-lbl">Zon besparing</div><div class="sb-mini-val" id="ep-pvkost" style="color:#ffd700">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">Walstroom kosten</div><div class="sb-mini-val" id="ep-gkost" style="color:#00aaff">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">Rendement</div><div class="sb-mini-val" id="ep-rend" style="color:#aaffcc">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">Gem. verbruik/dag</div><div class="sb-mini-val" id="ep-gemdag" style="color:#ff8844">--</div></div>
      </div>
      <div class="sb-section">Generator</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:12px">
        <div class="sb-mini"><div class="sb-mini-lbl">Draaiuren deze maand</div><div class="sb-mini-val" id="ep-gendraai" style="color:#ffcc44">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">Dieselkosten deze maand</div><div class="sb-mini-val" id="ep-genkost" style="color:#ffcc44">--</div></div>
      </div>
      `);

    if (id === 'solar') return h(`
      <div class="sb-grid">
        <div class="sb-card"><div class="sb-card-lbl">Huidig vermogen</div>
          <div class="sb-card-val" id="sp-nu" style="color:#ffd700">-- W</div>
          <div class="sb-bar-wrap"><div class="sb-bar-fill" id="sp-nu-bar" style="background:linear-gradient(90deg,#ff8800,#ffd700)"></div></div></div>
        <div class="sb-card"><div class="sb-card-lbl">MPPT staat</div>
          <div class="sb-card-val" id="sp-staat" style="font-size:16px;color:#00ff88">--</div>
          <div class="sb-card-sub">SmartSolar 150/85 rev2</div></div>
        <div class="sb-card"><div class="sb-card-lbl">Zonnepanelen stroom</div>
          <div class="sb-card-val" id="sp-a" style="color:#ffcc44">-- A</div></div>
      </div>
      <div class="sb-section">Opbrengst</div>
      <div class="sb-stat-row">
        <div class="sb-mini"><div class="sb-mini-lbl">Vandaag</div><div class="sb-mini-val" id="sp-d" style="color:#ffd700">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">Gisteren</div><div class="sb-mini-val" id="sp-g" style="color:#ffaa44">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">Deze maand</div><div class="sb-mini-val" id="sp-m" style="color:#ff8800">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">Max installatie</div><div class="sb-mini-val" style="color:#ffdd88">1800 W</div></div>
      </div>
      <div class="sb-section">Zon positie</div>
      <div class="sb-grid2">
        <div class="sb-card">
          <div class="sb-row"><span class="sb-row-lbl">Elevatie</span><span class="sb-row-val" id="sp-elev">--°</span></div>
          <div class="sb-row"><span class="sb-row-lbl">Azimut</span><span class="sb-row-val" id="sp-azim">--°</span></div>
          <div class="sb-row"><span class="sb-row-lbl">Zon op</span><span class="sb-row-val" id="sp-op">--</span></div>
          <div class="sb-row"><span class="sb-row-lbl">Zon onder</span><span class="sb-row-val" id="sp-ond">--</span></div>
        </div>
        <div class="sb-card">
          <div class="sb-row"><span class="sb-row-lbl">Daglengte</span><span class="sb-row-val" id="sp-dag">--</span></div>
          <div class="sb-row"><span class="sb-row-lbl">Boven horizon</span><span class="sb-row-val" id="sp-bov">--</span></div>
          <div class="sb-row"><span class="sb-row-lbl">Type</span><span class="sb-row-val">SmartSolar 150/85</span></div>
        </div>
      </div>`);

    if (id === 'accu') return h(`
      <div class="sb-grid">
        <div class="sb-card" style="text-align:center">
          <div class="sb-card-lbl">Totaal SOC</div>
          <div class="sb-card-val" id="ap-soc" style="font-size:44px">--%</div>
          <div class="sb-bar-wrap"><div class="sb-bar-fill" id="ap-soc-bar"></div></div>
        </div>
        <div class="sb-card">
          <div class="sb-card-lbl">Spanning / Stroom</div>
          <div class="sb-card-val" id="ap-v" style="color:#aaffcc">-- V</div>
          <div class="sb-card-sub" id="ap-a">-- A</div>
          <div class="sb-card-sub" id="ap-w">-- W</div>
        </div>
        <div class="sb-card">
          <div class="sb-card-lbl">Beschikbaar</div>
          <div class="sb-card-val" id="ap-wh" style="font-size:20px;color:#88ccff">-- Wh</div>
          <div class="sb-card-sub" id="ap-dur">-- uur te gaan</div>
        </div>
      </div>
      <div class="sb-grid2">
        <div class="sb-card">
          <div class="sb-card-lbl" style="color:rgba(0,255,136,0.7);margin-bottom:10px">BMS 1 &mdash; Cellen</div>
          <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:6px">
            <div id="ap-b1c1" class="cel-tile"><div class="cel-nr">C1</div><div class="cel-v">--</div></div>
            <div id="ap-b1c2" class="cel-tile"><div class="cel-nr">C2</div><div class="cel-v">--</div></div>
            <div id="ap-b1c3" class="cel-tile"><div class="cel-nr">C3</div><div class="cel-v">--</div></div>
            <div id="ap-b1c4" class="cel-tile"><div class="cel-nr">C4</div><div class="cel-v">--</div></div>
            <div id="ap-b1c5" class="cel-tile"><div class="cel-nr">C5</div><div class="cel-v">--</div></div>
            <div id="ap-b1c6" class="cel-tile"><div class="cel-nr">C6</div><div class="cel-v">--</div></div>
            <div id="ap-b1c7" class="cel-tile"><div class="cel-nr">C7</div><div class="cel-v">--</div></div>
            <div id="ap-b1c8" class="cel-tile"><div class="cel-nr">C8</div><div class="cel-v">--</div></div>
          </div>
          <div style="margin-top:10px">
            <div class="sb-row"><span class="sb-row-lbl">SOC</span><span class="sb-row-val" id="ap-b1soc" style="color:#00ff88">--%</span></div>
            <div class="sb-row"><span class="sb-row-lbl">Delta</span><span class="sb-row-val" id="ap-b1del">-- V</span></div>
            <div class="sb-row"><span class="sb-row-lbl">Temp / MOS</span><span class="sb-row-val" id="ap-b1tmp">--</span></div>
            <div class="sb-row"><span class="sb-row-lbl">Cycli</span><span class="sb-row-val" id="ap-b1cyc">--</span></div>
          </div>
        </div>
        <div class="sb-card">
          <div class="sb-card-lbl" style="color:rgba(0,170,255,0.7);margin-bottom:10px">BMS 2 &mdash; Cellen</div>
          <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:6px">
            <div id="ap-b2c1" class="cel-tile"><div class="cel-nr">C1</div><div class="cel-v">--</div></div>
            <div id="ap-b2c2" class="cel-tile"><div class="cel-nr">C2</div><div class="cel-v">--</div></div>
            <div id="ap-b2c3" class="cel-tile"><div class="cel-nr">C3</div><div class="cel-v">--</div></div>
            <div id="ap-b2c4" class="cel-tile"><div class="cel-nr">C4</div><div class="cel-v">--</div></div>
            <div id="ap-b2c5" class="cel-tile"><div class="cel-nr">C5</div><div class="cel-v">--</div></div>
            <div id="ap-b2c6" class="cel-tile"><div class="cel-nr">C6</div><div class="cel-v">--</div></div>
            <div id="ap-b2c7" class="cel-tile"><div class="cel-nr">C7</div><div class="cel-v">--</div></div>
            <div id="ap-b2c8" class="cel-tile"><div class="cel-nr">C8</div><div class="cel-v">--</div></div>
          </div>
          <div style="margin-top:10px">
            <div class="sb-row"><span class="sb-row-lbl">SOC</span><span class="sb-row-val" id="ap-b2soc" style="color:#00aaff">--%</span></div>
            <div class="sb-row"><span class="sb-row-lbl">Delta</span><span class="sb-row-val" id="ap-b2del">-- V</span></div>
            <div class="sb-row"><span class="sb-row-lbl">Temp / MOS</span><span class="sb-row-val" id="ap-b2tmp">--</span></div>
            <div class="sb-row"><span class="sb-row-lbl">Cycli</span><span class="sb-row-val" id="ap-b2cyc">--</span></div>
          </div>
        </div>
      </div>`);

        if (id === 'generator') return h(`
      <div class="sb-grid2">
        <div class="sb-card" style="text-align:center">
          <div class="sb-card-lbl">Status</div>
          <div class="sb-card-val" id="gp-staat" style="font-size:20px">--</div>
          <div class="sb-card-sub" id="gp-sub">--</div></div>
        <div class="sb-card">
          <div class="sb-card-lbl">Quattro ingang</div>
          <div class="sb-row"><span class="sb-row-lbl">Spanning AC</span><span class="sb-row-val" id="gp-acv">-- V</span></div>
          <div class="sb-row"><span class="sb-row-lbl">Vermogen</span><span class="sb-row-val" id="gp-w">-- W</span></div>
          <div class="sb-row"><span class="sb-row-lbl">Frequentie</span><span class="sb-row-val" id="gp-hz">-- Hz</span></div>
        </div>
      </div>
      <div class="sb-card" style="margin-top:10px">
        <div class="sb-card-lbl">Quattro alarmen</div>
        <div class="sb-row"><span class="sb-row-lbl">Temperatuur</span><span class="sb-row-val" id="gp-temp">--</span></div>
        <div class="sb-row"><span class="sb-row-lbl">Overbelasting</span><span class="sb-row-val" id="gp-over">--</span></div>
        <div class="sb-row"><span class="sb-row-lbl">Accu alarm</span><span class="sb-row-val" id="gp-batt">--</span></div>
      </div>`);

    if (id === 'klimaat') return h(`
      <div class="sb-grid">
        <div class="sb-card" style="text-align:center">
          <div class="sb-card-lbl">Temp aan boord</div>
          <div class="sb-card-val" id="kp-tin" style="color:#ff8844;font-size:36px">--°C</div></div>
        <div class="sb-card" style="text-align:center">
          <div class="sb-card-lbl">Luchtvochtigheid</div>
          <div class="sb-card-val" id="kp-hum" style="color:#00ccff;font-size:36px">--%</div></div>
        <div class="sb-card" style="text-align:center">
          <div class="sb-card-lbl">Luchtdruk</div>
          <div class="sb-card-val" id="kp-bar" style="color:#aaaaff;font-size:28px">-- hPa</div></div>
      </div>
      <div class="sb-grid2" style="margin-top:10px">
        <div class="sb-card">
          <div class="sb-card-lbl">Verwarming</div>
          <div class="sb-row"><span class="sb-row-lbl">Status</span><span class="sb-row-val" id="kp-vstat">--</span></div>
          <div class="sb-row"><span class="sb-row-lbl">Ingesteld</span><span class="sb-row-val" id="kp-vset">--</span></div>
          <div class="sb-row"><span class="sb-row-lbl">Gasfles</span><span class="sb-row-val" id="kp-gas">--</span></div>
        </div>
        <div class="sb-card">
          <div class="sb-card-lbl">Buiten / Water</div>
          <div class="sb-row"><span class="sb-row-lbl">Wind</span><span class="sb-row-val" id="kp-wind">--</span></div>
          <div class="sb-row"><span class="sb-row-lbl">Windrichting</span><span class="sb-row-val" id="kp-wdir">--</span></div>
        </div>
      </div>`);

    if (id === 'verlichting') return h(`
      <div class="sb-card">
        <div style="text-align:center;padding:24px;color:rgba(255,255,255,0.95);font-size:14px">
          💡 Verlichtingsentiteiten nog niet geconfigureerd.<br>
          <span style="font-size:12px;opacity:0.6">Voeg je light.* entiteiten toe om hier te bedienen.</span>
        </div>
      </div>`);

    if (id === 'systeem') return h(`
      <div class="sb-grid2">
        <div class="sb-card">
          <div class="sb-card-lbl">Cerbo GX</div>
          <div class="sb-row"><span class="sb-row-lbl">Firmware</span><span class="sb-row-val" id="syp-fw">--</span></div>
          <div class="sb-row"><span class="sb-row-lbl">Systeemstaat</span><span class="sb-row-val" id="syp-state">--</span></div>
          <div class="sb-row"><span class="sb-row-lbl">MPPT staat</span><span class="sb-row-val" id="syp-mppt">--</span></div>
        </div>
        <div class="sb-card">
          <div class="sb-card-lbl">Boot systemen</div>
          <div class="sb-row"><span class="sb-row-lbl">Watertank</span><span class="sb-row-val" id="syp-wt">--</span></div>
          <div class="sb-row"><span class="sb-row-lbl">Gasfles</span><span class="sb-row-val" id="syp-gas">--</span></div>
          <div class="sb-row"><span class="sb-row-lbl">Generator</span><span class="sb-row-val" id="syp-gen">--</span></div>
        </div>
      </div>
      <div class="sb-card" style="margin-top:10px">
        <div class="sb-card-lbl">Quattro 24/5000</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:8px;text-align:center">
          <div><div style="font-size:10px;color:rgba(255,255,255,0.95);margin-bottom:4px">AC UIT V</div><div style="font-size:18px;font-weight:700" id="syp-acv">--</div></div>
          <div><div style="font-size:10px;color:rgba(255,255,255,0.95);margin-bottom:4px">AC UIT Hz</div><div style="font-size:18px;font-weight:700" id="syp-ach">--</div></div>
          <div><div style="font-size:10px;color:rgba(255,255,255,0.95);margin-bottom:4px">DC V</div><div style="font-size:18px;font-weight:700" id="syp-dcv">--</div></div>
          <div><div style="font-size:10px;color:rgba(255,255,255,0.95);margin-bottom:4px">VERMOGEN</div><div style="font-size:18px;font-weight:700" id="syp-w">--</div></div>
        </div>
      </div>`);

    return h('<div style="padding:20px;color:rgba(255,255,255,0.95)">Geen data beschikbaar.</div>');
  }

  _fillPopupData(id, container) {
    const indoorTempEntity = (this._config && this._config.indoor_temp_entity) || 'sensor.ewelink_snzb_02p_temperatuur';
    const indoorHumidityEntity = (this._config && this._config.indoor_humidity_entity) || 'sensor.ewelink_snzb_02p_luchtvochtigheid';
    const windDirectionEntity = (this._config && this._config.wind_direction_entity) || 'sensor.windrichting';
    const hass = this._hass;
    if (!hass) return;
    const _s  = (e) => { const v = parseFloat(hass.states[e]?.state); return isNaN(v) ? 0 : v; };
    const _st = (e) => hass.states[e]?.state ?? '--';
    const _at = (e, a) => hass.states[e]?.attributes?.[a] ?? '--';
    const _nT = (iso) => { try { return new Date(iso).toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'}); } catch(e) { return '--'; } };
    const T = (elId, val) => { const el = container.querySelector('#'+elId); if(el) el.textContent = val; };
    const C = (elId, clr) => { const el = container.querySelector('#'+elId); if(el) el.style.color = clr; };
    const W = (elId, w, max) => { const el = container.querySelector('#'+elId); if(el) el.style.width = Math.min(w/max*100,100).toFixed(1)+'%'; };

    // ── MPPT / Quattro (configureerbaar, valt terug op Eriks eigen serienummers) ──
    const mpptStateEntity = (this._config && this._config.mppt_state_entity) || 'sensor.smartsolar_mppt_ve_can_150_85_rev2_id_279_state';
    const mpptYieldYesterdayEntity = (this._config && this._config.mppt_yield_yesterday_entity) || 'sensor.smartsolar_mppt_ve_can_150_85_rev2_id_279_yield_yesterday';
    const mpptMaxPowerTodayEntity = (this._config && this._config.mppt_max_power_today_entity) || 'sensor.smartsolar_mppt_ve_can_150_85_rev2_id_279_max_power_today';
    const quattroDcVoltageEntity = (this._config && this._config.quattro_dc_voltage_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_dc_voltage';
    const quattroHighTempAlarmEntity = (this._config && this._config.quattro_high_temp_alarm_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_high_temperature_alarm';
    const quattroInputPowerL1Entity = (this._config && this._config.quattro_input_power_l1_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_input_power_l1';
    const quattroInputVoltageL1Entity = (this._config && this._config.quattro_input_voltage_l1_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_input_voltage_l1';
    const quattroLowBatteryAlarmEntity = (this._config && this._config.quattro_low_battery_alarm_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_low_battery_alarm';
    const quattroOutputFrequencyL1Entity = (this._config && this._config.quattro_output_frequency_l1_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_output_frequency_l1';
    const quattroOutputPowerL1Entity = (this._config && this._config.quattro_output_power_l1_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_output_power_l1';
    const quattroOutputVoltageL1Entity = (this._config && this._config.quattro_output_voltage_l1_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_output_voltage_l1';
    const quattroOverloadAlarmEntity = (this._config && this._config.quattro_overload_alarm_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_overload_alarm';
    // Walstroom-verbruik (configureerbaar, valt terug op Eriks eigen Shelly-sensoren)
    const walstroomDagverbruikEntity = (this._config && this._config.walstroom_dagverbruik_entity) || 'sensor.walstroom_dagverbruik';
    const walstroomVerbruikMaandEntity = (this._config && this._config.walstroom_verbruik_maand_entity) || 'sensor.walstroom_verbruik_maand';
    const walstroomKwhPrijsEntity = (this._config && this._config.walstroom_kwh_prijs_entity) || null;
    const walstroomVerbruikWattEntity = (this._config && this._config.walstroom_verbruik_watt_entity) || 'sensor.walstroom_verbruik_watt';
    // PV-opbrengst (configureerbaar, valt terug op Eriks eigen Template Helpers)
    const pvVandaagEntity = (this._config && this._config.pv_vandaag_entity) || 'sensor.solar_yield_vandaag';
    const pvMaandEntity = (this._config && this._config.pv_maand_entity) || 'sensor.solar_yield_maand';
    // SmartShunt (configureerbaar, valt terug op Eriks eigen serienummer)
    const socEntity  = (this._config && this._config.smartshunt_soc_entity) || 'sensor.smartshunt_hq2224ru6gc_batterij';
    const voltEntity = (this._config && this._config.smartshunt_voltage_entity) || 'sensor.smartshunt_hq2224ru6gc_spanning';
    const currEntity = (this._config && this._config.smartshunt_current_entity) || 'sensor.smartshunt_hq2224ru6gc_stroom';
    // Accu-capaciteit (configureerbaar; zonder deze twee velden valt de kaart terug op Eriks eigen Template Helpers)
    const battCapacityWh = this._config && this._config.battery_capacity_wh;
    const battMinSocPct = this._config && this._config.battery_min_soc_pct;
    const loadDagEntity = (this._config && this._config.load_dag_entity) || 'sensor.gx_device_ac_uitgang_dagverbruik';
    const loadAanBoordMaandEntity = (this._config && this._config.load_aan_boord_maand_entity) || 'sensor.gx_device_verbruik_aan_boord_maand';
    const genVerbruikEntityP = (this._config && this._config.generator_verbruik_entity) || 'input_number.generator_verbruik_lh';
    const genDieselPrijsEntityP = (this._config && this._config.generator_diesel_prijs_entity) || 'input_number.generator_diesel_prijs';
    const genRuntimeMaandEntityP = (this._config && this._config.generator_runtime_maand_entity) || 'sensor.generator_draaiuren_maand';
    const genRunStateEntityP = (this._config && this._config.generator_run_state_entity) || 'sensor.generator_start_stop_run_state';
    // BMS entity-prefix (configureerbaar; fallback is Eriks eigen OUDE Batmon-naamgeving van vóór de rename
    // van juni 2026 — nieuwe klantinstallaties moeten dit expliciet instellen, zie _detectBMS() in de wizard)
    const bms1PrefixP = (this._config && this._config.bms1_entity_prefix) || 'jk_bms_1_jk_bms_1';
    const bms2PrefixP = (this._config && this._config.bms2_entity_prefix) || 'jk_bms_2_jk_bms_2';
    // Watertank (configureerbaar; geen betrouwbare universele default — ongeconfigureerd blijft de tegel '--')
    const watertankLevelEntityP = this._config && this._config.watertank_level_entity;
    const watertankCapacityLP = this._config && this._config.watertank_capacity_l;

    if (id === 'energie') {
      const lW=_s('sensor.gx_device_consumption_power_l1'), pW=_s('sensor.gx_device_pv_power'),
            gW=_s(quattroInputPowerL1Entity),
            bW=_s('sensor.gx_device_dc_battery_power'), bA=_s(currEntity),
            acV=_s(quattroOutputVoltageL1Entity).toFixed(0),
            acH=_s(quattroOutputFrequencyL1Entity).toFixed(1),
            dcV=_s(quattroDcVoltageEntity).toFixed(1),
            dcW=_s(quattroOutputPowerL1Entity).toFixed(0);
      T('ep-load',lW+' W'); W('ep-load-bar',lW,5000); T('ep-pv',pW+' W'); W('ep-pv-bar',pW,1800);
      T('ep-grid',gW+' W'); W('ep-grid-bar',gW,5000);
      T('ep-batt',(bA>0?'▲ +':'▼ ')+Math.abs(bW).toFixed(0)+' W'); T('ep-batt-sub',bA>0?'Laden':'Ontladen');
      C('ep-batt',bA>0?'#00ff88':'#ff9900');
      T('ep-acv',acV+' V'); T('ep-ach',acH+' Hz'); T('ep-state',_st('sensor.gx_device_system_state')); T('ep-state-sub',dcV+' V DC');
      T('ep-pvd',_s(pvVandaagEntity).toFixed(2)+' kWh');
      T('ep-pvg',_s(mpptYieldYesterdayEntity).toFixed(2)+' kWh');
      T('ep-pvm', this._hasEntity(pvMaandEntity) ? _s(pvMaandEntity).toFixed(1)+' kWh' : '--');
      T('ep-gd', this._hasEntity(walstroomDagverbruikEntity) ? _s(walstroomDagverbruikEntity).toFixed(2)+' kWh' : '--');
      T('ep-ld', this._hasEntity(loadDagEntity) ? _s(loadDagEntity).toFixed(2)+' kWh' : '--');
      T('ep-lm', this._hasEntity(loadAanBoordMaandEntity) ? _s(loadAanBoordMaandEntity).toFixed(1)+' kWh' : '--');
      T('ep-dcv',dcV+' V'); T('ep-dcw',dcW+' W');
      // Kosten & rendement
      const pvM2  = _s(pvMaandEntity);
      const walM  = _s(walstroomVerbruikMaandEntity);
      const uitM  = _s(loadAanBoordMaandEntity);
      const inTot = pvM2 + walM;
      const rend  = inTot > 0 ? ((uitM / inTot) * 100).toFixed(1) + ' %' : '-- %';
      const dagNr = new Date().getDate();
      const gemDag = (dagNr > 0 && this._hasEntity(loadAanBoordMaandEntity)) ? (uitM / dagNr).toFixed(2) + ' kWh' : '--';
      const _kwhPrijs = walstroomKwhPrijsEntity ? (parseFloat(this._hass.states[walstroomKwhPrijsEntity]?.state) || 0.50) : 0.50;
      T('ep-pvkost', this._hasEntity(pvMaandEntity) ? '€ ' + (pvM2 * _kwhPrijs).toFixed(2) : '--');
      T('ep-gkost',  this._hasEntity(walstroomVerbruikMaandEntity) ? '€ ' + (walM * _kwhPrijs).toFixed(2) : '--');
      T('ep-rend',   rend);
      T('ep-gemdag', gemDag);
      // Generator dieselkosten
      const genVerbr = _s(genVerbruikEntityP);
      const genPrijs = _s(genDieselPrijsEntityP);
      const genUrenMaand = _s(genRuntimeMaandEntityP);
      T('ep-gendraai', genUrenMaand.toFixed(1)+' u');
      T('ep-genkost', '€ ' + (genUrenMaand * genVerbr * genPrijs).toFixed(2));
    }
    else if (id === 'solar') {
      const pW=_s('sensor.gx_device_pv_power'), pA=_s('sensor.gx_device_pv_current').toFixed(1);
      T('sp-nu',pW+' W'); W('sp-nu-bar',pW,1800); T('sp-staat',_st(mpptStateEntity)); T('sp-a',pA+' A');
      T('sp-d',_s(pvVandaagEntity).toFixed(2)+' kWh');
      T('sp-g',_s(mpptYieldYesterdayEntity).toFixed(2)+' kWh');
      T('sp-m',_s(pvMaandEntity).toFixed(1)+' kWh');
      T('sp-elev',parseFloat(_at('sun.sun','elevation')).toFixed(1)+'°');
      T('sp-azim',parseFloat(_at('sun.sun','azimuth')).toFixed(0)+'°');
      T('sp-op',_nT(_at('sun.sun','next_rising'))); T('sp-ond',_nT(_at('sun.sun','next_setting')));
      T('sp-bov',_st('sun.sun')==='above_horizon'?'Ja ☀️':'Nee 🌙');
      try { const r=new Date(_at('sun.sun','next_rising')),s=new Date(_at('sun.sun','next_setting')); T('sp-dag',((s-r)/3600000).toFixed(1)+' uur'); } catch(e){}
    }
    else if (id === 'accu') {
      const soc=_s(socEntity),
            v=_s(voltEntity).toFixed(2),
            a=_s(currEntity).toFixed(1),
            w=_s('sensor.gx_device_dc_battery_power').toFixed(0);
      const _battP = _s('sensor.gx_device_dc_battery_power');
      const _dis = Math.abs(_battP);
      let wh, dur;
      if (battCapacityWh && battMinSocPct != null) {
        const usableWh = Math.max(0, battCapacityWh * (soc - battMinSocPct) / 100);
        wh = usableWh.toFixed(0);
        dur = _battP < -20 ? (usableWh / _dis).toFixed(1) : '--';
      } else {
        wh = _s('sensor.accu_beschikbaar_wh').toFixed(0);
        const _soc30 = _s('sensor.accu_beschikbaar_wh') * 0.70;
        dur = _battP < -20 ? (_soc30 / _dis).toFixed(1) : _s('sensor.verwachte_accuduur').toFixed(1);
      }
      const c=soc>35?'#00cc66':soc>30?'#ffa500':'#ff4444';
      T('ap-soc',Math.round(soc)+'%'); C('ap-soc',c);
      const bar=container.querySelector('#ap-soc-bar');
      if(bar){bar.style.width=soc+'%';bar.style.background=c;}
      T('ap-v',v+' V');
      T('ap-a',parseFloat(a)>0?'+ '+a+' A (laden)':Math.abs(parseFloat(a))+' A (ontladen)');
      T('ap-w',w+' W'); T('ap-wh',wh+' Wh'); T('ap-dur',dur+' uur te gaan');
      const cClr=(v)=>v===0?'rgba(255,255,255,0.3)':v<3.25?'#ff4444':v<3.30?'#ff9900':'#00cc66';
      const cBg =(v)=>v===0?'rgba(255,255,255,0.03)':v<3.25?'rgba(255,60,60,0.12)':v<3.30?'rgba(255,150,0,0.12)':'rgba(0,200,80,0.10)';
      const cBrd=(v)=>v===0?'rgba(255,255,255,0.08)':v<3.25?'rgba(255,60,60,0.5)':v<3.30?'rgba(255,150,0,0.5)':'rgba(0,200,80,0.35)';
      ['b1','b2'].forEach(b=>{
        const p=b==='b1'?bms1PrefixP:bms2PrefixP;
        const tp=b==='b1'?'bms1_temperatuur_netjes':'bms2_temperatuur_netjes';
        T('ap-'+b+'soc',_s('sensor.'+p+'_soc').toFixed(0)+'%');
        const d=(_s('sensor.'+p+'_cell_volt_max')-_s('sensor.'+p+'_cell_volt_min')).toFixed(3);
        T('ap-'+b+'del',d+' V'); C('ap-'+b+'del',parseFloat(d)>0.015?'#ff9900':'#aaffcc');
        T('ap-'+b+'tmp',_s('sensor.'+tp).toFixed(1)+'/ '+_s('sensor.'+p+'_mos_temperature').toFixed(1)+'C');
        T('ap-'+b+'cyc',_s('sensor.'+p+'_num_cycles').toFixed(0));
        for(let i=1;i<=8;i++){
          const cv=_s('sensor.'+p+'_cell_volt_'+i);
          const el=container.querySelector('#ap-'+b+'c'+i);
          if(el){
            el.style.background=cBg(cv); el.style.borderColor=cBrd(cv);
            const vEl=el.querySelector('.cel-v');
            if(vEl){vEl.textContent=cv>0?cv.toFixed(3):'--'; vEl.style.color=cClr(cv);}
          }
        }
      });
    }
        else if (id === 'generator') {
      const ok=['ok','Ok','0','','false','no alarm','No alarm','No Alarm','no_alarm'];
      const gs=_st(genRunStateEntityP), aan=gs==='running';
      T('gp-staat',aan?'● RUNNING':'○ GESTOPT'); C('gp-staat',aan?'#00ff88':'rgba(255,255,255,0.4)');
      T('gp-sub',gs);
      T('gp-acv',_s(quattroInputVoltageL1Entity).toFixed(0)+' V');
      T('gp-w',_s(quattroInputPowerL1Entity).toFixed(0)+' W');
      T('gp-hz',_s(quattroOutputFrequencyL1Entity).toFixed(1)+' Hz');
      [['gp-temp',quattroHighTempAlarmEntity],
       ['gp-over',quattroOverloadAlarmEntity],
       ['gp-batt',quattroLowBatteryAlarmEntity]].forEach(([el,s])=>{
        const v=_st(s); T(el,ok.includes(v)?'✓ OK':'⚠ ALARM'); C(el,ok.includes(v)?'#00ff88':'#ff4444');
      });
    }
    else if (id === 'klimaat') {
      T('kp-tin', this._hasEntity(indoorTempEntity) ? _s(indoorTempEntity).toFixed(1)+'°C' : '--');
      T('kp-hum', this._hasEntity(indoorHumidityEntity) ? _s(indoorHumidityEntity).toFixed(0)+'%' : '--');
      T('kp-wdir',_st(windDirectionEntity));
    }
    else if (id === 'systeem') {
      T('syp-fw',_st('sensor.gx_device_installed_version'));
      T('syp-state',_st('sensor.gx_device_system_state'));
      T('syp-mppt',_st(mpptStateEntity));
      T('syp-gen',_st(genRunStateEntityP));
      T('syp-acv',_s(quattroOutputVoltageL1Entity).toFixed(0)+' V');
      T('syp-ach',_s(quattroOutputFrequencyL1Entity).toFixed(1)+' Hz');
      T('syp-dcv',_s(quattroDcVoltageEntity).toFixed(1)+' V');
      T('syp-w',_s(quattroOutputPowerL1Entity).toFixed(0)+' W');
      if (watertankLevelEntityP) {
        const pct = _s(watertankLevelEntityP);
        const litersTxt = watertankCapacityLP ? ' ('+Math.round(pct/100*watertankCapacityLP)+' L)' : '';
        T('syp-wt', pct.toFixed(0)+'%'+litersTxt);
      }
    }
  }


  _skyLabelProfile(skyImg) {
    const img = skyImg || '';
    // LICHTE achtergronden — blauwe/witte lucht — tekst moet donkerder/contrastrijker
    // STRAK BLAUW — alleen clear-day volledig helder
    if (img.includes('clear-day') && !img.includes('partly')) {
      return {
        dim: 'rgba(255,255,255,0.75)',
        mid: 'rgba(255,255,255,0.85)',
        sub: 'rgba(255,255,255,0.80)',
      };
    }
    // ALLE OVERIGE — wit, altijd leesbaar
    return {
      dim: 'rgba(255,255,255,0.70)',
      mid: 'rgba(255,255,255,0.80)',
      sub: 'rgba(255,255,255,0.75)',
    };
  }
  async _loadWaterHistory() {
    if (!this._hass) return;
    try {
      const end = new Date();
      const start = new Date(end - 48 * 3600 * 1000);
      const result = await this._hass.callApi('GET',
        `history/period/${start.toISOString()}?filter_entity_id=sensor.hasselt_zwarte_water_waterhoogte&end_time=${end.toISOString()}&minimal_response=true`
      );
      if (result && result[0]) {
        this._waterHistory = result[0]
          .filter(s => s.state !== 'unavailable' && s.state !== 'unknown')
          .map(s => ({ t: new Date(s.last_changed).getTime(), v: parseFloat(s.state) }))
          .filter(s => !isNaN(s.v));
        this._render();
      }
    } catch(e) { console.warn('Finally SkyCard: waterhistorie laden mislukt', e); }
  }

  _loadWaterForecast() {
    const waterhoogteVerwachtEntity = (this._config && this._config.waterhoogte_verwacht_entity) || 'sensor.hasselt_zwarte_water_waterhoogte_verwacht';
    if (!this._hass) return;
    try {
      const fc = this._hass.states[waterhoogteVerwachtEntity]?.attributes?.Forecast;
      if (Array.isArray(fc) && fc.length) {
        this._waterForecast = fc
          .map(p => ({ t: new Date(p.Time).getTime(), v: parseFloat(p.Value) }))
          .filter(p => !isNaN(p.v) && !isNaN(p.t));
        this._render();
      }
    } catch(e) { console.warn('Finally SkyCard: waterprognose laden mislukt', e); }
  }

  async _loadForecast() {
    if (!this._hass) return;
    const weatherEntity = (this._config && this._config.weather_entity) || 'weather.forecast_thuis';
    try {
      const result = await this._hass.callWS({
        type: 'weather/get_forecasts',
        entity_ids: [weatherEntity],
        forecast_type: 'daily',
      });
      if (result && result[weatherEntity]?.forecast) {
        this._forecast = result[weatherEntity].forecast;
        this._render();
      }
    } catch(e) {
      try {
        const result2 = await this._hass.callService('weather', 'get_forecasts', {
          entity_id: weatherEntity,
          type: 'daily',
        }, undefined, undefined, true);
        if (result2?.response?.[weatherEntity]?.forecast) {
          this._forecast = result2.response[weatherEntity].forecast;
          this._render();
        }
      } catch(e2) { console.warn('Finally SkyCard: forecast laden mislukt', e2); }
    }
  }

  _waterSparkline(w, h) {
    if (!this._waterHistory || this._waterHistory.length < 2) {
      return `<text x="${w/2}" y="${h/2}" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="10" font-family="sans-serif">laden...</text>`;
    }
    const hist = this._waterHistory;
    const fc   = (this._waterForecast && this._waterForecast.length) ? this._waterForecast : [];
    const all  = hist.concat(fc);
    const vals = all.map(d => d.v);
    const times = all.map(d => d.t);
    const minV = Math.min(...vals) - 1;
    const maxV = Math.max(...vals) + 1;
    const minT = Math.min(...times);
    const maxT = Math.max(...times);
    const rng = maxV - minV || 1;
    const px = t => ((t - minT) / (maxT - minT || 1)) * (w - 4) + 2;
    const py = v => h - 4 - ((v - minV) / rng) * (h - 8);
    const histPts = hist.map(d => `${px(d.t).toFixed(1)},${py(d.v).toFixed(1)}`).join(' ');
    const cur = hist[hist.length - 1].v;
    const zero = py(0);
    const lineColor = cur > 0 ? '#00aaff' : cur > -20 ? '#ffa500' : '#ff4444';
    // Prognoselijn: begint bij het laatste echte meetpunt, loopt door in stippellijn
    const fcPts = fc.length
      ? [`${px(hist[hist.length-1].t).toFixed(1)},${py(cur).toFixed(1)}`].concat(fc.map(d => `${px(d.t).toFixed(1)},${py(d.v).toFixed(1)}`)).join(' ')
      : '';
    return `
      ${zero >= 0 && zero <= h ? `<line x1="2" y1="${zero.toFixed(1)}" x2="${w-2}" y2="${zero.toFixed(1)}" stroke="rgba(255,255,255,0.15)" stroke-width="0.5" stroke-dasharray="3 2"/>` : ''}
      <polyline points="${histPts}" fill="none" stroke="${lineColor}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
      ${fcPts ? `<polyline points="${fcPts}" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.4" stroke-dasharray="3 2" stroke-linejoin="round" stroke-linecap="round"/>` : ''}
      <circle cx="${px(hist[hist.length-1].t).toFixed(1)}" cy="${py(cur).toFixed(1)}" r="3" fill="${lineColor}"/>
      <text x="2" y="${h}" fill="rgba(255,255,255,0.3)" font-size="8" font-family="sans-serif">-48u</text>
      <text x="${w-2}" y="${h}" text-anchor="end" fill="rgba(255,255,255,0.3)" font-size="8" font-family="sans-serif">${fc.length ? '+24u' : 'nu'}</text>`;
  }

  _weatherIcon(condition, size=32) {
    const c = (condition || '').toLowerCase();
    if (c.includes('sunny') || c.includes('clear')) return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" fill="#ffd700"/><g stroke="#ffd700" stroke-width="1.5" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></g></svg>`;
    if (c.includes('partlycloudy')) return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"><circle cx="10" cy="9" r="4" fill="#ffd700"/><ellipse cx="13" cy="15" rx="6" ry="4" fill="#aac"/><ellipse cx="8" cy="16" rx="4" ry="3" fill="#ccd"/></svg>`;
    if (c.includes('cloudy') || c.includes('overcast')) return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"><ellipse cx="13" cy="13" rx="7" ry="5" fill="#99a"/><ellipse cx="8" cy="14" rx="5" ry="4" fill="#aab"/></svg>`;
    if (c.includes('rainy') || c.includes('pouring')) return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="10" rx="7" ry="4" fill="#778"/><line x1="8" y1="16" x2="6" y2="20" stroke="#66aaff" stroke-width="1.5" stroke-linecap="round"/><line x1="12" y1="16" x2="10" y2="20" stroke="#66aaff" stroke-width="1.5" stroke-linecap="round"/><line x1="16" y1="16" x2="14" y2="20" stroke="#66aaff" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    if (c.includes('lightning')) return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="9" rx="7" ry="4" fill="#556"/><polygon points="13,13 10,18 12,18 11,22 15,16 13,16" fill="#ffd700"/></svg>`;
    if (c.includes('snowy')) return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="10" rx="7" ry="4" fill="#aab"/><g fill="#ddf"><circle cx="8" cy="17" r="1.2"/><circle cx="12" cy="19" r="1.2"/><circle cx="16" cy="17" r="1.2"/><circle cx="10" cy="21" r="1"/><circle cx="14" cy="21" r="1"/></g></svg>`;
    if (c.includes('fog') || c.includes('hazy')) return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"><g stroke="rgba(200,210,230,0.7)" stroke-width="1.5" stroke-linecap="round"><line x1="4" y1="10" x2="20" y2="10"/><line x1="4" y1="13" x2="20" y2="13"/><line x1="6" y1="16" x2="18" y2="16"/></g></svg>`;
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="7" ry="5" fill="#778"/></svg>`;
  }

  _forecastTegel() {
    const days = ['Zo','Ma','Di','Wo','Do','Vr','Za'];
    const fc = this._forecast;
    if (!fc || fc.length === 0) {
      return `<div class="tb" style="min-width:380px;max-width:500px;justify-content:center;align-items:center">
        <div class="lbl">WEERSVOORSPELLING</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.95);margin-top:8px">Laden...</div>
      </div>`;
    }
    const items = fc.slice(0, 5).map(day => {
      const d = new Date(day.datetime);
      const dagNaam = days[d.getDay()];
      const tMax = day.temperature !== undefined ? Math.round(day.temperature) : (day.tempmax !== undefined ? Math.round(day.tempmax) : '--');
      const tMin = day.templow !== undefined ? Math.round(day.templow) : (day.temperature_low !== undefined ? Math.round(day.temperature_low) : '--');
      const icon = this._weatherIcon(day.condition, 36);
      const neerslag = day.precipitation !== undefined && day.precipitation > 0 ? `<div style="font-size:11px;color:#66aaff;margin-top:2px">${day.precipitation.toFixed(1)}mm</div>` : '';
      return `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;min-width:68px">
        <div style="font-size:12px;color:rgba(255,255,255,0.95);letter-spacing:1px">${dagNaam}</div>
        ${icon}
        <div style="font-size:15px;font-weight:700;color:#fff">${tMax}°</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.95)">${tMin}°</div>
        ${neerslag}
      </div>`;
    }).join('');
    return `<div class="tb" style="min-width:380px;max-width:500px">
      <div class="lbl" style="margin-bottom:10px">WEERSVOORSPELLING</div>
      <div style="display:flex;flex-direction:row;justify-content:space-between;align-items:flex-start;gap:4px;width:100%">
        ${items}
      </div>
    </div>`;
  }
  _s(e) { try { return parseFloat(this._hass.states[e]?.state) || 0; } catch(x) { return 0; } }
  _hasEntity(e) { return !!(this._hass && this._hass.states && this._hass.states[e]); }
  _st(e) { try { return this._hass.states[e]?.state || '--'; } catch(x) { return '--'; } }
  _attr(e, a) { try { return this._hass.states[e]?.attributes[a] ?? null; } catch(x) { return null; } }
  _zt(e) {
    try {
      const v = this._hass.states[e]?.state;
      return v ? new Date(v).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : '--:--';
    } catch(x) { return '--:--'; }
  }

  _battSvg(soc, label, kleur, charging, id) {
    const c = soc > 35 ? '#00cc66' : soc > 30 ? '#ffa500' : '#ff4444';
    const h = Math.round(Math.min(Math.max(soc, 0), 100) * 1.04);
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px">
      <div style="font-size:12px;font-weight:700;color:${kleur};letter-spacing:1px">${label}</div>
      <svg viewBox="0 0 60 120" style="width:52px;height:104px">
        <defs><filter id="bg${id}"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        <rect x="18" y="1" width="24" height="8" rx="3" fill="rgba(255,255,255,0.2)"/>
        <rect x="3" y="9" width="54" height="108" rx="8" fill="#050f1e" stroke="${c}" stroke-width="1.5"/>
        <clipPath id="${id}"><rect x="5" y="11" width="50" height="104" rx="6"/></clipPath>
        <rect x="5" y="${11+104-h*1.04}" width="50" height="${h*1.04}" fill="${c}" opacity="0.7" clip-path="url(#${id})"/>
        <rect x="5" y="${11+104-h*1.04}" width="50" height="8" fill="${c}" opacity="0.3" clip-path="url(#${id})"/>
        <text x="30" y="68" text-anchor="middle" font-size="15" font-weight="800" fill="#fff" font-family="sans-serif">${Math.round(soc)}%</text>
        ${charging ? '<text x="30" y="92" text-anchor="middle" font-size="18" fill="#00ff88" font-family="sans-serif">⚡</text>' : ''}
      </svg>
      <div style="font-size:14px;font-weight:700;color:${c}">${Math.round(soc)}%</div>
    </div>`;
  }

  _progressBar(pct, color, maxW) {
    const w = Math.min(Math.max(pct, 0), 100);
    return `<div style="width:${maxW}px;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden">
      <div style="width:${w}%;height:100%;background:${color};border-radius:3px;transition:width 1s ease"></div>
    </div>`;
  }

  _render() {
    // BMS entity-prefix (configureerbaar; fallback is Eriks eigen OUDE Batmon-naamgeving van vóór de rename
    // van juni 2026 — nieuwe klantinstallaties moeten dit expliciet instellen, zie _detectBMS() in de wizard)
    const bms1Prefix = (this._config && this._config.bms1_entity_prefix) || 'jk_bms_1_jk_bms_1';
    const bms2Prefix = (this._config && this._config.bms2_entity_prefix) || 'jk_bms_2_jk_bms_2';
    const bms1CellMinEntity = (this._config && this._config.bms1_cell_min_entity) || ('sensor.' + bms1Prefix + '_cell_volt_min');
    const bms1CellMaxEntity = (this._config && this._config.bms1_cell_max_entity) || ('sensor.' + bms1Prefix + '_cell_volt_max');
    const bms1SocEntity = (this._config && this._config.bms1_soc_entity) || ('sensor.' + bms1Prefix + '_soc');
    const bms1CyclesEntity = (this._config && this._config.bms1_cycles_entity) || ('sensor.' + bms1Prefix + '_num_cycles');
    const bms1MosTempEntity = (this._config && this._config.bms1_mos_temp_entity) || ('sensor.' + bms1Prefix + '_mos_temperature');
    const bms2CellMinEntity = (this._config && this._config.bms2_cell_min_entity) || ('sensor.' + bms2Prefix + '_cell_volt_min');
    const bms2CellMaxEntity = (this._config && this._config.bms2_cell_max_entity) || ('sensor.' + bms2Prefix + '_cell_volt_max');
    const bms2SocEntity = (this._config && this._config.bms2_soc_entity) || ('sensor.' + bms2Prefix + '_soc');
    const bms2CyclesEntity = (this._config && this._config.bms2_cycles_entity) || ('sensor.' + bms2Prefix + '_num_cycles');
    const bms2MosTempEntity = (this._config && this._config.bms2_mos_temp_entity) || ('sensor.' + bms2Prefix + '_mos_temperature');
    const bms1TempNetjesEntity = (this._config && this._config.bms1_temp_netjes_entity) || 'sensor.bms1_temperatuur_netjes';
    const bms2TempNetjesEntity = (this._config && this._config.bms2_temp_netjes_entity) || 'sensor.bms2_temperatuur_netjes';
    const indoorTempEntity = (this._config && this._config.indoor_temp_entity) || 'sensor.ewelink_snzb_02p_temperatuur';
    const indoorHumidityEntity = (this._config && this._config.indoor_humidity_entity) || 'sensor.ewelink_snzb_02p_luchtvochtigheid';
    const waterhoogteEntity = (this._config && this._config.waterhoogte_entity) || 'sensor.hasselt_zwarte_water_waterhoogte';
    const waterhoogteVerwachtEntity = (this._config && this._config.waterhoogte_verwacht_entity) || 'sensor.hasselt_zwarte_water_waterhoogte_verwacht';
    const weerTekstEntity = (this._config && this._config.weer_tekst_entity) || 'sensor.knmi_tekst';
    const weerCodeEntity = (this._config && this._config.weer_code_entity) || 'sensor.knmi_weercode';
    const weatherEntity = (this._config && this._config.weather_entity) || 'weather.forecast_thuis';
    if (!this.shadowRoot) return;
    const s = this._s.bind(this);
    const st = this._st.bind(this);
    const hass = this._hass;

    // ── MPPT / Quattro (configureerbaar, valt terug op Eriks eigen serienummers) ──
    const mpptStateEntity = (this._config && this._config.mppt_state_entity) || 'sensor.smartsolar_mppt_ve_can_150_85_rev2_id_279_state';
    const mpptYieldYesterdayEntity = (this._config && this._config.mppt_yield_yesterday_entity) || 'sensor.smartsolar_mppt_ve_can_150_85_rev2_id_279_yield_yesterday';
    const mpptMaxPowerTodayEntity = (this._config && this._config.mppt_max_power_today_entity) || 'sensor.smartsolar_mppt_ve_can_150_85_rev2_id_279_max_power_today';
    const quattroDcVoltageEntity = (this._config && this._config.quattro_dc_voltage_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_dc_voltage';
    const quattroHighTempAlarmEntity = (this._config && this._config.quattro_high_temp_alarm_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_high_temperature_alarm';
    const quattroInputPowerL1Entity = (this._config && this._config.quattro_input_power_l1_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_input_power_l1';
    const quattroInputVoltageL1Entity = (this._config && this._config.quattro_input_voltage_l1_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_input_voltage_l1';
    const quattroLowBatteryAlarmEntity = (this._config && this._config.quattro_low_battery_alarm_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_low_battery_alarm';
    const quattroOutputFrequencyL1Entity = (this._config && this._config.quattro_output_frequency_l1_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_output_frequency_l1';
    const quattroOutputPowerL1Entity = (this._config && this._config.quattro_output_power_l1_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_output_power_l1';
    const quattroOutputVoltageL1Entity = (this._config && this._config.quattro_output_voltage_l1_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_output_voltage_l1';
    const quattroOverloadAlarmEntity = (this._config && this._config.quattro_overload_alarm_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_overload_alarm';

    // ── Energie ──
    const pvW        = hass ? s('sensor.gx_device_pv_power') : 0;
    const pvMaxVandaag = hass ? Math.max(s(mpptMaxPowerTodayEntity), pvW, 100) : 1800;
    const pvMax      = pvMaxVandaag;
    const pvPct      = Math.min((pvW / pvMax) * 100, 100);
    const loadW      = hass ? s('sensor.gx_device_consumption_power_l1') : 0;
    const loadMax    = 5000;
    const loadPct    = Math.min((loadW / loadMax) * 100, 100);
    const loadKleur  = loadW >= 4500 ? '#ff2222' : loadW >= 3000 ? '#ff6600' : '#ff8844';
    const loadAlarm  = loadW >= 4500;
    const gridW      = hass ? s(quattroInputPowerL1Entity) : 0;
    const acInputLimit = hass ? s('number.gx_device_ac_input_limit').toFixed(0) : '--';
    const battPow    = hass ? s('sensor.gx_device_dc_battery_power') : 0;
    const loadTeken  = (battPow < -10 && gridW < 20) ? '−' : '';  // accu → boot = min teken
    const socEntity  = (this._config && this._config.smartshunt_soc_entity) || 'sensor.smartshunt_hq2224ru6gc_batterij';
    const voltEntity = (this._config && this._config.smartshunt_voltage_entity) || 'sensor.smartshunt_hq2224ru6gc_spanning';
    const currEntity = (this._config && this._config.smartshunt_current_entity) || 'sensor.smartshunt_hq2224ru6gc_stroom';
    // Accu-capaciteit (configureerbaar; zonder deze twee velden valt de kaart terug op Eriks eigen Template Helpers)
    const battCapacityWh = this._config && this._config.battery_capacity_wh;
    const battMinSocPct = this._config && this._config.battery_min_soc_pct;
    const battSoc    = hass ? s(socEntity) : 0;
    const battV      = hass ? s(voltEntity).toFixed(1) : '--';
    const battVGeneric = hass ? s('sensor.gx_device_dc_battery_voltage').toFixed(2) : '--';
    const windEntity  = (this._config && this._config.wind_entity) || 'sensor.wind_vermogen';
    const windW       = hass ? s(windEntity).toFixed(0) : '--';
    const battA      = hass ? s(currEntity).toFixed(1) : '--';
    const _battPowR  = hass ? s('sensor.gx_device_dc_battery_power') : 0;
    const _discharge = Math.abs(_battPowR);
    let battWh, battDuur;
    const timeToGoEntity = (this._config && this._config.time_to_go_entity) || null;
    const _ttgRaw = timeToGoEntity && hass ? parseFloat(hass.states[timeToGoEntity]?.state) : NaN;
    if (timeToGoEntity && hass && Number.isFinite(_ttgRaw)) {
      battDuur = (_ttgRaw / 3600).toFixed(1);
      battWh = (hass && battCapacityWh && battMinSocPct != null)
        ? Math.max(0, battCapacityWh * (battSoc - battMinSocPct) / 100).toFixed(0)
        : (hass && this._hasEntity('sensor.accu_beschikbaar_wh') ? s('sensor.accu_beschikbaar_wh').toFixed(0) : '--');
    } else if (timeToGoEntity && hass && this._hasEntity(timeToGoEntity)) {
      // Sensor bestaat, maar geeft nu geen geldig getal (bijv. Victron rapporteert 'unavailable'
      // tijdens het laden, want "tijd tot leeg" is dan niet van toepassing).
      battDuur = '--';
      battWh = (hass && battCapacityWh && battMinSocPct != null)
        ? Math.max(0, battCapacityWh * (battSoc - battMinSocPct) / 100).toFixed(0)
        : (hass && this._hasEntity('sensor.accu_beschikbaar_wh') ? s('sensor.accu_beschikbaar_wh').toFixed(0) : '--');
    } else if (hass && battCapacityWh && battMinSocPct != null) {
      const _usableWh = Math.max(0, battCapacityWh * (battSoc - battMinSocPct) / 100);
      battWh = _usableWh.toFixed(0);
      battDuur = _battPowR < -20 ? (_usableWh / _discharge).toFixed(1) : '--';
    } else {
      battWh = hass ? s('sensor.accu_beschikbaar_wh').toFixed(0) : '--';
      const _soc30wh = hass ? s('sensor.accu_beschikbaar_wh') * 0.70 : 0;
      battDuur = _battPowR < -20 ? (_soc30wh / _discharge).toFixed(1) : (hass ? s('sensor.verwachte_accuduur').toFixed(1) : '--');
    }
    // PV-opbrengst (configureerbaar, valt terug op Eriks eigen Template Helpers)
    const pvVandaagEntity = (this._config && this._config.pv_vandaag_entity) || 'sensor.solar_yield_vandaag';
    const pvMaandEntity = (this._config && this._config.pv_maand_entity) || 'sensor.solar_yield_maand';
    const pvVandaag  = hass ? s(pvVandaagEntity).toFixed(2) : '--';
    const pvMaand    = hass ? s(pvMaandEntity).toFixed(1) : '--';
    const pvGisteren = hass ? s(mpptYieldYesterdayEntity).toFixed(2) : '--';
    const battChar   = parseFloat(battA) > 0;

    // ── BMS ──
    const bms1Soc   = hass ? s(bms1SocEntity) : 0;
    const bms1Temp  = hass ? s(bms1TempNetjesEntity).toFixed(1) : '--';
    const bms1MosT  = hass ? s(bms1MosTempEntity).toFixed(1) : '--';
    const bms1Min   = hass ? s(bms1CellMinEntity).toFixed(3) : '--';
    const bms1Max   = hass ? s(bms1CellMaxEntity).toFixed(3) : '--';
    const bms1Delta = hass ? (s(bms1CellMaxEntity) - s(bms1CellMinEntity)).toFixed(3) : '--';
    const bms1Cycli = hass ? s(bms1CyclesEntity).toFixed(0) : '--';
    const bms2Soc   = hass ? s(bms2SocEntity) : 0;
    const bms2Temp  = hass ? s(bms2TempNetjesEntity).toFixed(1) : '--';
    const bms2MosT  = hass ? s(bms2MosTempEntity).toFixed(1) : '--';
    const bms2Min   = hass ? s(bms2CellMinEntity).toFixed(3) : '--';
    const bms2Max   = hass ? s(bms2CellMaxEntity).toFixed(3) : '--';
    const bms2Delta = hass ? (s(bms2CellMaxEntity) - s(bms2CellMinEntity)).toFixed(3) : '--';
    const bms2Cycli = hass ? s(bms2CyclesEntity).toFixed(0) : '--';
    const d1c = parseFloat(bms1Delta) > 0.015 ? '#ff9900' : '#aaffcc';
    const d2c = parseFloat(bms2Delta) > 0.015 ? '#ff9900' : '#aaffcc';

    // ── Systeem ──
    const sysState  = hass ? st('sensor.gx_device_system_state') : '--';
    const mpptState = hass ? st(mpptStateEntity) : '--';
    const acV       = hass ? s(quattroOutputVoltageL1Entity).toFixed(0) : '--';
    const acHz      = hass ? s(quattroOutputFrequencyL1Entity).toFixed(1) : '--';
    const acInV     = hass ? s(quattroInputVoltageL1Entity).toFixed(0) : '--';
    const acOutW    = hass ? s(quattroOutputPowerL1Entity).toFixed(0) : '--';
    const dcV       = hass ? s(quattroDcVoltageEntity).toFixed(1) : '--';
    const alarmTemp = hass ? st(quattroHighTempAlarmEntity) : 'ok';
    const alarmOver = hass ? st(quattroOverloadAlarmEntity) : 'ok';
    const alarmBatt = hass ? st(quattroLowBatteryAlarmEntity) : 'ok';
    const sc        = ['bulk','absorption','float'].includes(sysState) ? '#00ff88' : sysState === 'inverting' ? '#00cc66' : '#00aaff';
    const sl        = sysState === 'inverting' ? 'OMVORMEN' : sysState === 'bulk' ? 'BULK LADEN' :
                      sysState === 'absorption' ? 'ABSORPTIE' : sysState === 'float' ? 'FLOAT' :
                      sysState === 'passthru' ? 'WALSTROOM' : sysState.toUpperCase();

    // ── Extra ──
    const generatorRunStateEntity = (this._config && this._config.generator_run_state_entity) || 'sensor.generator_start_stop_run_state';
    const generatorRuntimeTodayEntity = (this._config && this._config.generator_runtime_today_entity) || 'sensor.generator_start_stop_today_runtime';
    const generatorRuntimeTotalEntity = (this._config && this._config.generator_runtime_total_entity) || 'sensor.generator_start_stop_total_runtime';
    const genState   = hass ? st(generatorRunStateEntity) : '--';
    const genActive  = genState === 'running';
    const generatorSwitchEntity = (this._config && this._config.generator_switch_entity) || 'switch.generator_start_stop_manual_start';
    const genManualOn    = hass ? st(generatorSwitchEntity) : 'off';
    const genRuntimeToday = hass ? s(generatorRuntimeTodayEntity).toFixed(1) : '--';
    const genRuntimeTotal = hass ? s(generatorRuntimeTotalEntity).toFixed(0) : '--';
    const kabolaEntity     = (this._config && this._config.kabola_climate_entity) || 'climate.kabola';
    const kabolaState      = hass ? hass.states[kabolaEntity] : null;
    const kabolaActief     = kabolaState ? (kabolaState.state !== 'off' && kabolaState.state !== 'unavailable') : false;
    const kabolaDoelTemp   = kabolaState ? (kabolaState.attributes.temperature ?? '--') : '--';
    const kabolaHuidigeTemp = kabolaState ? (kabolaState.attributes.current_temperature ?? '--') : '--';

    // ── Omgeving ──
    const tempBinnen = (hass && this._hasEntity(indoorTempEntity)) ? s(indoorTempEntity).toFixed(1) : '--';
    const vocht      = (hass && this._hasEntity(indoorHumidityEntity)) ? s(indoorHumidityEntity).toFixed(0) : '--';
    const _wAttr     = hass ? hass.states[weatherEntity]?.attributes : null;
    const vochtBuiten = _wAttr ? (_wAttr.humidity ?? '--') : '--';
    const windKm     = _wAttr ? parseFloat(_wAttr.wind_speed ?? 0).toFixed(1) : '--';
    const windUnitMs = (this._config && this._config.wind_unit === 'ms');
    const windDisplay = windKm === '--' ? '--' : (windUnitMs ? (parseFloat(windKm) / 3.6).toFixed(1) : windKm);
    const windUnitLbl = windUnitMs ? 'm/s' : 'km/h';
    const _windBear  = _wAttr ? parseFloat(_wAttr.wind_bearing ?? 0) : 0;
    const _windDirs  = ['N','NNO','NO','ONO','O','OZO','ZO','ZZO','Z','ZZW','ZW','WZW','W','WNW','NW','NNW'];
    const windDir    = _wAttr ? _windDirs[Math.round(_windBear / 22.5) % 16] : '--';
    const windBft    = _wAttr ? (windKm < 1 ? 0 : windKm < 6 ? 1 : windKm < 12 ? 2 : windKm < 20 ? 3 : windKm < 29 ? 4 : windKm < 39 ? 5 : windKm < 50 ? 6 : windKm < 62 ? 7 : windKm < 75 ? 8 : windKm < 89 ? 9 : windKm < 103 ? 10 : windKm < 117 ? 11 : 12) : '--';
    const waterhoogte     = hass ? s(waterhoogteEntity).toFixed(0) : '--';
    const waterhoogteVerw = hass ? s(waterhoogteVerwachtEntity).toFixed(0) : '--';
    const knmiCode   = hass ? st(weerCodeEntity) : 'Groen';
    const tempBuiten = hass ? (hass.states[weatherEntity]?.attributes?.temperature ?? '--') : '--';
    const wcond      = hass ? st(weatherEntity) : '--';
    const wIcon      = {'sunny':'☀️','partlycloudy':'⛅','cloudy':'☁️','overcast':'☁️','rainy':'🌧️','pouring':'🌧️','lightning':'⛈️','lightning-rainy':'⛈️','snowy':'❄️','snowy-rainy':'🌨️','fog':'🌫️','windy':'💨','windy-variant':'💨','clear-night':'🌙'}[wcond] || '🌡️';
    const knmiTekst  = hass ? st(weerTekstEntity) : '';

    // ── Zon — Exacte Khan methode ──
    // Khan SVG viewBox = 520x520, boog punten: links(42,161) top(260,54) rechts(472,161)
    // Wij schalen naar 1920x1080
    const _KHAN_W = 520, _KHAN_H = 520;
    const _SCALE_X = 1920 / _KHAN_W;
    const _SCALE_Y = 1080 / _KHAN_H;

    const _sA = hass ? (this._hass.states['sun.sun']?.attributes || {}) : {};
    const _nT = iso => {
      if (!iso) return null;
      try {
        const f = new Date(iso);
        if ((f - Date.now()) > 18 * 3600000) f.setDate(f.getDate() - 1);
        return String(f.getHours()).padStart(2,'0') + ':' + String(f.getMinutes()).padStart(2,'0');
      } catch(e) { return null; }
    };
    const zonOp  = _nT(_sA.next_rising)  || '06:00';
    const zonOnd = _nT(_sA.next_setting) || '20:00';
    const _tm = ts => { const p = ts.split(':').map(Number); return p[0]*60+p[1]; };
    const _nm = new Date().getHours()*60 + new Date().getMinutes();
    const _R = _tm(zonOp), _S = _tm(zonOnd), _dL = _S - _R;
    const sunT = _dL > 0 ? Math.max(0, Math.min(1, (_nm - _R) / _dL)) : 0.5;
    let sunAbove = true, sunBell = 0.5;
    if (_sA.elevation != null) {
      const elev = parseFloat(_sA.elevation);
      sunAbove = elev >= 0;
      sunBell = Math.max(0, Math.sin(Math.max(0, elev) * Math.PI / 180));
    } else {
      sunAbove = _nm >= _R && _nm <= _S;
      sunBell = 1 - Math.pow(Math.abs(2 * sunT - 1), 1.5);
    }
    // Exacte Khan quadratic bezier: bx,by in Khan 520x520 SVG coördinaten
    const _kbx = Math.round((1-sunT)*(1-sunT)*42 + 2*(1-sunT)*sunT*260 + sunT*sunT*472);
    const _kby = Math.round((1-sunT)*(1-sunT)*161 + 2*(1-sunT)*sunT*54  + sunT*sunT*161);
    // Schalen naar ons 1920x1080 flow SVG
    const sunFlowX = Math.round(_kbx * _SCALE_X);
    const sunFlowY = Math.round(_kby * _SCALE_Y);
    // sunSvgX/Y voor de sunboog SVG (die heeft viewBox 0 0 1920 594)
    const sunSvgX = Math.round(_kbx * (1920 / 472));
    const sunSvgY = Math.round(_kby * (594 / 280));

    // Boot positie in onze afbeelding: ~55% breed, ~52% hoog
    const bootFlowX = Math.round(1920 * 0.58);  // 1114
    const bootFlowY = Math.round(1080 * 0.61);  // 659

    // Batterij paneel staat nu rechtsboven: top ~88px, right 8px
    // Midden tussen de twee BMS units: ca. 93% breed, ~28% hoog
    const battFlowX = Math.round(1920 * 0.91);  // ~1750 - midden tussen de twee accu's
    const battFlowY = Math.round(1080 * 0.28);  // ~300 - hoogte midden batt-panel

    // PV flow lijn: van zon omlaag naar boot
    // Start: onder de zon (+58px)
    // Control 1: recht onder de zon (+150px)
    // Control 2: boven de boot (-160px)
    // Eind: boot centrum
    const _pvStartX = sunFlowX + 75;
    const _pvStartY = sunFlowY + 58;
    const _pvCp1X = sunFlowX + (bootFlowX - sunFlowX) * 0.1;
    const _pvCp1Y = sunFlowY + 150;
    const _pvCp2X = sunFlowX + (bootFlowX - sunFlowX) * 0.6;
    const _pvCp2Y = bootFlowY - 120;
    const pvCurve = `M ${_pvStartX},${_pvStartY} C ${_pvCp1X.toFixed(0)},${_pvCp1Y} ${_pvCp2X.toFixed(0)},${_pvCp2Y} ${bootFlowX},${bootFlowY}`;

    // Batterij flow: van boot naar batterij rechts
    // Gebogen pad boot → batterij
    const _bCpX = Math.round((bootFlowX + battFlowX) / 2);
    const _bCpY = Math.round(Math.min(bootFlowY, battFlowY) - 60);
    const battCurveIn  = `M ${bootFlowX},${bootFlowY} Q ${_bCpX},${_bCpY} ${battFlowX},${battFlowY}`;
    const battCurveOut = `M ${battFlowX},${battFlowY} Q ${_bCpX},${_bCpY} ${bootFlowX},${bootFlowY}`;
    // Boot midden op ca. 62% van breedte, 52% van hoogte in 1920x1080
    // Boot en batterij posities komen uit Khan berekening hierboven (bootFlowX/Y, battFlowX/Y)

    // pvCurve al berekend in zon sectie hierboven
    // battCurve al berekend in zon sectie hierboven
    // Grid: rechte lijn van walstroom-tegel naar boot (positie instelbaar i.v.m. verplaatste OFF-GRID-tegel)
    const gridX1 = (this._config && this._config.grid_line_x) || 390;
    const gridY1 = (this._config && this._config.grid_line_y) || 694;

    // Achtergrond (configureerbaar: background_folder laat een alternatieve tegel-set toe, bv. camper-versie
    // met exact dezelfde bestandsnamen als de standaard boot-tegels — zie background_path_voorbeeld)
    const backgroundFolder = (this._config && this._config.background_folder) || '/local/finally-card/';
    const foregroundImage = (this._config && this._config.foreground_image) || 'boot.png';
    const skyImg  = hass ? finallySkyImagePath(wcond, parseFloat(_sA.elevation ?? 0), new Date().getHours(), backgroundFolder) : backgroundFolder + 'clear-day.png';


    // Flows actief
    const pvActive   = pvW > 10 && sunAbove;
    const gridActive   = gridW > 20;
    const gridSpanning = parseFloat(acInV) > 100;
    const walstroomSwitchEntity = (this._config && this._config.walstroom_switch_entity) || 'switch.walstroom_socket_1';
    const walstroomOverrideEntity = (this._config && this._config.walstroom_override_entity) || 'input_boolean.walstroom_override';
    const walSocketAan = hass ? st(walstroomSwitchEntity) === 'on' : false;
    const walOverride  = hass ? st(walstroomOverrideEntity) === 'on' : false;
    const walstroomSpanningEntity = (this._config && this._config.walstroom_spanning_entity) || null;
    const walStandby = (hass && walstroomSpanningEntity) ? (!walSocketAan && s(walstroomSpanningEntity) > 200) : false;
    const battActive = Math.abs(battPow) > 10;

    // Tijd
    const nu    = new Date();
    const tijd  = nu.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    const datum = nu.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });

    const sparkline = this._waterSparkline(160, 44);

    this._styleBlock = `
<style>
  :host {
    display: block; width: 100vw; height: 100vh; overflow: hidden;
    --lbl-dim: rgba(255,255,255,0.35);
    --lbl-mid: rgba(255,255,255,0.40);
    --lbl-sub: rgba(255,255,255,0.45);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, sans-serif; }
  .wrap { position: relative; width: 100vw; height: 100vh; overflow: hidden; background: #050e1a; }
  .design-canvas { position: absolute; top: 50%; left: 50%; width: 1920px; height: 1080px;
    transform-origin: center center; will-change: transform; }
  .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; }
  .ov-bot { position: absolute; bottom: 0; left: 0; right: 0; height: 44%; background: linear-gradient(transparent, rgba(0,4,18,0.88)); z-index: 2; pointer-events: none; }
  .ov-top { position: absolute; top: 0; left: 0; right: 0; height: 16%; background: linear-gradient(rgba(0,4,18,0.6), transparent); z-index: 2; pointer-events: none; }
  svg.sunboog { position: absolute; top: 0; left: 0; width: 100%; height: 55%; z-index: 3; pointer-events: none; }
  svg.flows { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 4; pointer-events: none; overflow: visible; }

  @keyframes dash {
    to { stroke-dashoffset: -28; }
  }
  .flow-anim { animation: dash 1.2s linear infinite; }
  .flow-anim-slow { animation: dash 2s linear infinite; }
  @keyframes rain-fall {
    0% { transform: translate(0, 0); opacity: 0.7; }
    100% { transform: translate(-40px, 820px); opacity: 0.2; }
  }
  .rdrop { animation-name: rain-fall; animation-timing-function: linear; animation-iteration-count: infinite; }
  @keyframes dot-glow-pulse {
    0%, 100% { opacity: 0.9; r: 7; }
    50% { opacity: 1; r: 9; }
  }

  .topbar { position: absolute; top: 10px; left: 12px; right: 12px; display: flex; gap: 8px; z-index: 10; }
  .tb { background: rgba(4,14,44,0.22); backdrop-filter: blur(14px); border: 0.5px solid rgba(100,170,255,0.22); border-radius: 10px; padding: 8px 16px; display: flex; flex-direction: column; justify-content: center; }
  .tb.grow { flex: 1; }
  .lbl { font-size: 14px; color: var(--lbl-dim); letter-spacing: 2px; text-transform: uppercase; }
  .val { font-size: 17px; font-weight: 700; color: #fff; line-height: 1.2; }
  .sub { font-size: 14px; color: var(--lbl-mid); }
  .wrow { display: flex; gap: 22px; align-items: center; flex-wrap: wrap; justify-content: center; width: 100%; }
  .wi { display: flex; align-items: center; gap: 7px; font-size: var(--weather-font, 17px); color: #fff; }
  .wi svg { flex-shrink: 0; width: 18px; height: 18px; }

  .grid-lbl { position: absolute; left: 300px; top: 640px; z-index: 10; }
  .fbox { background: rgba(4,14,44,0.22); backdrop-filter: blur(10px); border-radius: 10px; padding: 8px 14px; text-align: center; min-width: 100px; }
  .zonlbl { position: absolute; z-index: 10; background: rgba(4,14,44,0.18); backdrop-filter: blur(8px); border-radius: 8px; padding: 4px 10px; text-align: center; border: 0.5px solid rgba(255,200,80,0.2); }

  .batt-panel { position: absolute; right: 8px; top: 200px; z-index: 10; display: flex; flex-direction: column; align-items: flex-end; gap: 5px; min-width: var(--soc-panel-width, 280px); }
  .batt-row { display: flex; flex-direction: column; gap: 5px; align-items: flex-end; }
  .batt-unit { display: flex; flex-direction: row; align-items: flex-start; gap: 6px; background: rgba(4,14,44,0.22); backdrop-filter: blur(10px); border-radius: 10px; padding: 7px 10px; border: 0.5px solid rgba(100,170,255,0.2); }
  .batt-detail { background: rgba(4,14,44,0.22); backdrop-filter: blur(10px); border: 0.5px solid rgba(100,170,255,0.2); border-radius: 10px; padding: 8px 12px; font-size: 15px; }

  .pwrbars { position: absolute; left: 50%; bottom: var(--pwrbars-bottom, 9%); transform: translateX(-50%); z-index: 10; display: flex; flex-direction: row; gap: 100px; }
  .pbrwrap { background: rgba(4,14,44,0.22); backdrop-filter: blur(10px); border: 0.5px solid rgba(100,170,255,0.2); border-radius: 10px; padding: 9px 16px; width: 280px; }
  .pbr-lbl { font-size: 12px; color: var(--lbl-mid); letter-spacing: 1px; margin-bottom: 6px; display: flex; justify-content: space-between; }
  .pbr-bar { height: 10px; background: rgba(255,255,255,0.08); border-radius: 5px; overflow: hidden; }
  .pbr-fill { height: 100%; border-radius: 5px; transition: width 1s ease; }

  .statsbar { position: absolute; bottom: 0; left: 0; right: 0; z-index: 10; padding: 6px 10px 8px; display: flex; gap: 5px; }
  .stat { background: rgba(4,14,44,0.22); backdrop-filter: blur(10px); border: 0.5px solid rgba(100,170,255,0.15); border-radius: 10px; padding: 9px 12px; flex: 1; text-align: center; }
  .sl { font-size: calc(11px * var(--bottom-scale, 1)); color: var(--lbl-dim); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 3px; }
  .sv { font-size: calc(18px * var(--bottom-scale, 1)); font-weight: 700; color: #fff; line-height: 1.1; }
  .ss { font-size: calc(12px * var(--bottom-scale, 1)); color: var(--lbl-dim); margin-top: 2px; }
  .sr { display: flex; justify-content: space-between; margin-top: 2px; align-items: center; }
  .sk { font-size: 14px; color: var(--lbl-mid); }
  .sv2 { font-size: 14px; font-weight: 700; color: #fff; }

  .sidebar { position: absolute; left: 8px; top: 50%; transform: translateY(-50%);
    z-index: 15; display: flex; flex-direction: column; gap: 7px; }
  .sb-btn { width: var(--sb-width, 96px); background: rgba(4,14,44,0.22); backdrop-filter: blur(14px);
    border: 0.5px solid rgba(100,170,255,0.22); border-radius: 16px; padding: 14px 0;
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    cursor: pointer; user-select: none; -webkit-tap-highlight-color: transparent; }
  .sb-btn:active { background: rgba(4,14,44,0.60); border-color: rgba(100,170,255,0.6); }
  .sb-icon { width: var(--sb-icon, 40px); height: var(--sb-icon, 40px); display: block; }
  .sb-lbl { font-size: var(--sb-font, 11px); color: var(--lbl-sub); letter-spacing: 0.8px;
    text-transform: uppercase; text-align: center; font-family: sans-serif; }
</style>`;
    const __html = `

<div class="wrap" style="${(() => {
  const c = this._config || {};
  const vars = [];
  if (c.sidebar_width) vars.push(`--sb-width:${c.sidebar_width}px`);
  if (c.sidebar_icon_size) vars.push(`--sb-icon:${c.sidebar_icon_size}px`);
  if (c.sidebar_font_size) vars.push(`--sb-font:${c.sidebar_font_size}px`);
  if (c.weather_font_size) vars.push(`--weather-font:${c.weather_font_size}px`);
  if (c.bottom_font_scale) vars.push(`--bottom-scale:${c.bottom_font_scale}`);
  if (c.pwrbars_bottom) vars.push(`--pwrbars-bottom:${c.pwrbars_bottom}%`);
  if (c.soc_panel_width) vars.push(`--soc-panel-width:${c.soc_panel_width}px`);
  return vars.join(';');
})()}">
 <div class="design-canvas" id="design-canvas">
  <img class="bg" id="fc-bg-img" src="${skyImg}"/>
  ${(this._config && this._config.bg_darken) ? `<div style="position:absolute;inset:0;z-index:1;background:rgba(0,0,10,${this._config.bg_darken});pointer-events:none"></div>` : ''}
  <img id="fc-boat-img" src="${backgroundFolder}${foregroundImage}" style="position:absolute;bottom:18%;left:${(this._config && this._config.boat_left_pct) || 35}%;width:${(this._config && this._config.boat_size_pct) || 38}%;height:auto;pointer-events:none;z-index:4;opacity:0.95"/>
<!--FCDYN_START-->
  <!-- Erik op SUP — alleen bij mooi weer -->
  ${(wcond === 'sunny' || wcond === 'partlycloudy') && sunAbove ? `

  ` : ''}

  <!-- Annet op achterdek — alleen bij mooi weer -->
  ${(wcond === 'sunny' || wcond === 'partlycloudy') && sunAbove ? `

  ` : ''}


  <div class="ov-top"></div>
  <div class="ov-bot"></div>

  <!-- ZON BOOG SVG -->
  <svg class="sunboog" viewBox="0 0 1920 594">
    <defs>
      <filter id="sg"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <radialGradient id="sunglow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffe066" stop-opacity="1"/>
        <stop offset="60%" stop-color="#ffaa00" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#ff6600" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <!-- Boog pad -->
    <path d="M 58 558 Q 960 -60 1862 558"
          fill="none" stroke="rgba(255,220,100,0.2)" stroke-width="1.5" stroke-dasharray="8 6"/>
    <circle cx="58" cy="558" r="5" fill="#ffa500" opacity="0.8"/>
    <circle cx="1862" cy="558" r="5" fill="#ff6600" opacity="0.8"/>
    <text x="960" y="36" text-anchor="middle" fill="rgba(255,255,255,0.18)" font-size="16" font-family="sans-serif">12:00</text>

    ${sunAbove
      ? '<circle cx="'+sunSvgX+'" cy="'+sunSvgY+'" r="60" fill="url(#sunglow)" opacity="0.6"/>'
        +'<circle cx="'+sunSvgX+'" cy="'+sunSvgY+'" r="38" fill="rgba(255,220,50,0.15)" filter="url(#sg)"/>'
        +'<circle cx="'+sunSvgX+'" cy="'+sunSvgY+'" r="24" fill="rgba(255,220,50,0.3)" filter="url(#sg)"/>'
        +'<circle cx="'+sunSvgX+'" cy="'+sunSvgY+'" r="15" fill="#ffe566" filter="url(#sg)"/>'
        +(pvActive ? '<rect x="'+(sunSvgX-72)+'" y="'+(sunSvgY-62)+'" width="144" height="36" rx="9" fill="rgba(0,0,0,0.7)" stroke="rgba(255,210,0,0.5)" stroke-width="1"/><text x="'+sunSvgX+'" y="'+(sunSvgY-38)+'" text-anchor="middle" fill="#ffd700" font-size="20" font-weight="bold" font-family="sans-serif">'+pvW+' W</text>' : '')
      : '<circle cx="960" cy="540" r="12" fill="rgba(255,100,50,0.2)"/>'
        +'<text x="960" y="530" text-anchor="middle" fill="rgba(255,150,100,0.4)" font-size="14" font-family="sans-serif">nacht</text>'
    }
  </svg>

  <!-- FLOW LIJNEN SVG (1920x1080) -->
  <svg class="flows" viewBox="0 0 1920 1080" overflow="visible">
    <defs>
      <filter id="glow-pv" x="-200%" y="-200%" width="500%" height="500%">
        <feGaussianBlur stdDeviation="8" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="glow-grid" x="-200%" y="-200%" width="500%" height="500%">
        <feGaussianBlur stdDeviation="8" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="glow-batt" x="-200%" y="-200%" width="500%" height="500%">
        <feGaussianBlur stdDeviation="8" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <!-- PV → boot: glow + stippellijn -->
    ${pvActive ? '<path d="'+pvCurve+'" fill="none" stroke="#ffd700" stroke-width="10" stroke-dasharray="14 8" stroke-linecap="round" opacity="0.2" filter="url(#glow-pv)" class="flow-anim"/>' : ''}
    <path d="${pvCurve}" fill="none"
          stroke="${pvActive ? '#ffd700' : 'rgba(255,200,0,0.06)'}"
          stroke-width="${pvActive ? 3 : 1.5}"
          stroke-dasharray="${pvActive ? '14 8' : 'none'}"
          stroke-linecap="round"
          opacity="${pvActive ? 0.7 : 0.2}"
          ${pvActive ? 'class="flow-anim"' : ''}/>

    <!-- Grid → boot: alleen zichtbaar bij actieve stroom -->
    ${gridActive ? `
    <path d="M ${gridX1} ${gridY1} L ${bootFlowX} ${bootFlowY}" fill="none"
          stroke="#00aaff" stroke-width="10" stroke-dasharray="14 8"
          opacity="0.2" filter="url(#glow-grid)" class="flow-anim"/>
    <path d="M ${gridX1} ${gridY1} L ${bootFlowX} ${bootFlowY}" fill="none"
          stroke="#00aaff" stroke-width="3" stroke-dasharray="14 8"
          opacity="0.7" class="flow-anim"/>
    ` : ''}
    <!-- Boot ↔ batterij: glow + stippellijn -->
    ${battActive ? '<path d="'+(battChar?battCurveIn:battCurveOut)+'" fill="none" stroke="'+(battChar?'#00ff88':'#ff9900')+'" stroke-width="10" stroke-dasharray="14 8" stroke-linecap="round" opacity="0.2" filter="url(#glow-batt)" class="'+(battChar?'flow-anim':'flow-anim-slow')+'"/>' : ''}
    <path d="${battChar ? battCurveIn : battCurveOut}" fill="none"
          stroke="${battActive ? (battChar ? '#00ff88' : '#ff9900') : 'rgba(100,200,150,0.15)'}"
          stroke-width="${battActive ? 3 : 1.5}" stroke-dasharray="${battActive ? '14 8' : 'none'}"
          stroke-linecap="round"
          opacity="${battActive ? 0.7 : 0.2}"
          ${battActive ? 'class="'+(battChar ? 'flow-anim' : 'flow-anim-slow')+'"' : ''}/>

    <!-- BATT badge op de batterij-flowlijn (halverwege boot↔batterij) -->
    ${(() => {
      const lx = Math.round(0.25 * bootFlowX + 0.5 * _bCpX + 0.25 * battFlowX);
      const ly = Math.round(0.25 * bootFlowY + 0.5 * _bCpY + 0.25 * battFlowY) - 50;
      const bw = 160, bh = 44;
      const bPow = Math.abs(battPow).toFixed(0);
      const isCharging = battPow > 10;
      const isDischarging = battPow < -10;
      const battKleur = isCharging ? '#00ff88' : isDischarging ? '#ff9900' : '#aaaaaa';
      const battStroke = isCharging ? 'rgba(0,255,136,0.6)' : isDischarging ? 'rgba(255,150,0,0.6)' : 'rgba(150,150,150,0.3)';
      const battLabel = isCharging ? '▲ LADEN' : isDischarging ? '▼ ONTLADEN' : 'STANDBY';
      const battWaarde = (isCharging || isDischarging) ? bPow + ' W' : '--';
      return `<rect x="${lx - bw/2}" y="${ly - bh/2}" width="${bw}" height="${bh}" rx="10"
        fill="rgba(4,14,44,0.22)" stroke="${battStroke}" stroke-width="1.5"/>
      <text x="${lx}" y="${ly - 8}" text-anchor="middle" fill="${battKleur}" opacity="0.7"
        font-size="11" font-weight="700" font-family="sans-serif" letter-spacing="2">${battLabel}</text>
      <text x="${lx}" y="${ly + 14}" text-anchor="middle" fill="${battKleur}"
        font-size="22" font-weight="800" font-family="sans-serif">${battWaarde}</text>`;
    })()}
  </svg>

  <!-- TOPBALK -->
  <div class="topbar">
    <div class="tb">
      <div class="val" style="font-size:38px;letter-spacing:2px;font-weight:800;line-height:1">${tijd}</div>
      <div class="sub" style="text-transform:capitalize;font-size:15px;margin-top:3px">${datum}</div>
    </div>
    <div class="tb grow" style="align-items:center;justify-content:center">
      <div class="wrow">
        <div class="wi">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff6644"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 019.5 9 2.5 2.5 0 0112 6.5 2.5 2.5 0 0114.5 9 2.5 2.5 0 0112 11.5z"/></svg>
          <b>${(this._config && this._config.outdoor_climate) ? tempBuiten : tempBinnen}°C</b> / ${(this._config && this._config.outdoor_climate) ? vochtBuiten : vocht}%
        </div>
        <div class="wi">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffd700" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          <span>${wcond !== '--' ? wcond : 'onbekend'}</span>
        </div>
        <div class="wi">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#88ccff"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>
          ${windDisplay} ${windUnitLbl} ${windDir} (${windBft} Bft)
        </div>
      </div>
      ${knmiCode !== 'Groen' && knmiCode !== '--' ? '<div id="knmi-btn" data-code="'+knmiCode+'" style="cursor:pointer;margin-top:6px;display:inline-block;padding:4px 12px;background:'+(knmiCode==='Rood'?'rgba(80,10,10,0.6)':knmiCode==='Oranje'?'rgba(80,40,0,0.6)':'rgba(60,50,0,0.6)')+';border:1px solid '+(knmiCode==='Rood'?'rgba(255,80,80,0.6)':knmiCode==='Oranje'?'rgba(255,140,0,0.6)':'rgba(255,220,0,0.6)')+';border-radius:8px;font-size:13px;font-weight:700;color:'+(knmiCode==='Rood'?'#ff6666':knmiCode==='Oranje'?'#ffaa44':'#ffee44')+'">⚠ KNMI Code '+knmiCode+'</div>' : ''}
    </div>
    <div class="tb" style="text-align:center;min-width:160px">
      <div class="lbl">MODUS</div>
      <div class="val" style="font-size:22px;color:${sc}">${sl}</div>
      <div class="sub" style="font-size:14px">${acV} V · ${acHz} Hz</div>
    </div>
    <div class="tb" style="text-align:center;min-width:190px">
      <div class="lbl">ZON NU / VANDAAG</div>
      <div class="val" style="font-size:24px;color:#ffd700">${pvW} W</div>
      <div style="margin-top:4px">${this._progressBar(pvPct, 'linear-gradient(90deg,#ff8800,#ffd700)', 155)}</div>
      <div class="sub" style="margin-top:3px;font-size:13px">${pvVandaag} kWh · gisteren ${pvGisteren}</div>
    </div>
    ${this._forecastTegel()}
  </div>

  <!-- GRID label linksboven bij mast -->
  <div class="grid-lbl" style="${(this._config && this._config.walstroom_scale) ? `transform:scale(${this._config.walstroom_scale});transform-origin:top ${(this._config && this._config.walstroom_right !== undefined) ? 'right' : 'left'};` : ''}${(this._config && this._config.walstroom_right !== undefined) ? `right:${this._config.walstroom_right}px;left:auto;` : ''}${(this._config && this._config.walstroom_top !== undefined) ? `top:${this._config.walstroom_top}px;` : ''}">
    <div class="fbox" style="border:1.5px solid ${gridActive?'rgba(0,170,255,0.8)':gridSpanning?'rgba(255,165,0,0.7)':'rgba(255,255,255,0.12)'};${(this._config && this._config.walstroom_width) ? `min-width:${this._config.walstroom_width}px;` : ''}">
      <div class="lbl" style="letter-spacing:2px;font-size:13px">WALSTROOM</div>
      <div style="font-size:22px;font-weight:800;color:${gridActive?'#00aaff':gridSpanning?'#ffaa00':'rgba(255,255,255,0.55)'}">
        ${gridActive ? gridW+' W' : gridSpanning ? acInV+' V' : 'OFF-GRID'}
      </div>
      ${gridActive ? '<div class="sub" style="color:#00aaff;font-size:14px">&#9679; AAN</div>' : gridSpanning ? '<div class="sub" style="color:#ffaa00;font-size:14px">&#9679; stand-by</div>' : '<div class="sub" style="color:#00ff88;font-size:14px">&#9679; OFF-GRID</div>'}
      <div id="wal-limit-btn" data-action="wal-limit" style="margin-top:6px;cursor:pointer;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:6px;padding:3px 8px;font-size:12px;color:rgba(255,255,255,0.95);text-align:center">
        &#9889; Limiet: ${acInputLimit} A
      </div>
      <div id="wal-socket-btn" style="margin-top:5px;cursor:pointer;background:${walSocketAan?'rgba(0,255,136,0.12)':(walStandby?'rgba(255,165,0,0.12)':'rgba(255,255,255,0.06)')};border:1px solid ${walSocketAan?'rgba(0,255,136,0.5)':(walStandby?'rgba(255,165,0,0.5)':'rgba(255,255,255,0.2)')};border-radius:6px;padding:5px 8px;font-size:14px;font-weight:700;color:${walSocketAan?'#00ff88':(walStandby?'#ffa500':'rgba(255,255,255,0.45)')};text-align:center">
        ${walSocketAan?'&#9679; WAL AAN':(walStandby?'&#9680; WAL STANDBY':'&#9675; WAL UIT')}
      </div>
      <div id="wal-override-btn" style="margin-top:4px;cursor:pointer;background:${walOverride?'rgba(255,165,0,0.12)':'rgba(0,255,136,0.08)'};border:0.5px solid ${walOverride?'rgba(255,165,0,0.5)':'rgba(0,255,136,0.3)'};border-radius:6px;padding:4px 8px;font-size:12px;font-weight:600;color:${walOverride?'#ffaa44':'#00ff88'};text-align:center;display:flex;align-items:center;justify-content:center;gap:5px">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="${walOverride?'#ffaa44':'#00ff88'}" stroke-width="2.5">${walOverride?'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>':'<circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>'}</svg>
        ${walOverride?'HANDMATIG':'AUTO'}
      </div>
      <div id="wal-instellingen-btn" style="margin-top:4px;cursor:pointer;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.12);border-radius:6px;padding:4px 8px;font-size:12px;color:rgba(255,255,255,0.95);text-align:center;display:flex;align-items:center;justify-content:center;gap:5px">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        INSTELLINGEN
      </div>
    </div>
  </div>


  <!-- ZIJBALK -->
  <div class="sidebar">
    <div class="sb-btn" data-sid="energie"><span class="sb-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#ffd700" stroke-width="2" stroke-linecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></span><span class="sb-lbl">Energie</span></div>
    <div class="sb-btn" data-sid="solar"><span class="sb-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#ffd700" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></svg></span><span class="sb-lbl">Zon</span></div>
    <div class="sb-btn" data-sid="accu"><span class="sb-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#00d7ff" stroke-width="2" stroke-linecap="round"><rect x="6" y="7" width="12" height="14" rx="2"/><path d="M10 7V5h4v2"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg></span><span class="sb-lbl">Accu</span></div>
    <div class="sb-btn" data-sid="generator"><span class="sb-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#aaaaff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg></span><span class="sb-lbl">Gen.</span></div>
    <div class="sb-btn" data-sid="klimaat"><span class="sb-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#ff8844" stroke-width="2" stroke-linecap="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg></span><span class="sb-lbl">Klimaat</span></div>
    <div class="sb-btn" data-sid="verlichting"><span class="sb-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#ffe066" stroke-width="2" stroke-linecap="round"><path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.22-1.21 4.16-3 5.2V18H9v-3.8A6.002 6.002 0 0 1 6 9a6 6 0 0 1 6-6z"/></svg></span><span class="sb-lbl">Licht</span></div>
    <div class="sb-btn" data-sid="systeem"><span class="sb-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#88ccff" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></span><span class="sb-lbl">Systeem</span></div>
  </div>

  <!-- ZON OP label linksonder bij boog start -->
  <div class="zonlbl" style="left:160px;top:640px">
    <div style="font-size:10px;color:rgba(255,200,80,0.5);letter-spacing:1px">ZON OP</div>
    <div style="font-size:15px;font-weight:700;color:rgba(255,210,100,0.9);display:flex;align-items:center;gap:5px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,210,100,0.9)" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><path d="M5 19h14" stroke-width="1.5"/><path d="M12 16v-4" stroke-width="2"/><path d="M9 13l3-3 3 3" stroke-width="2"/></svg>${zonOp}</div>
  </div>

${(this._config && this._config.zononder_left !== undefined && this._config.zononder_top !== undefined) ? `
  <!-- ZON ONDER losse tegel — vrij te positioneren, i.p.v. in de accu-kolom -->
  <div class="zonlbl" style="left:${this._config.zononder_left}px;top:${this._config.zononder_top}px">
    <div style="font-size:10px;color:rgba(255,180,90,0.85);letter-spacing:1px">ZON ONDER</div>
    <div style="font-size:15px;font-weight:700;color:#ffb050;display:flex;align-items:center;gap:5px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffb050" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><path d="M5 19h14" stroke-width="1.5"/><path d="M12 12v4" stroke-width="2"/><path d="M9 15l3 3 3-3" stroke-width="2"/></svg>${zonOnd}</div>
  </div>
` : ''}



  <!-- LOAD badge zit nu in de flows SVG -->

  <!-- PV + PWR BALKEN naast elkaar breed onder de boot -->
  <div class="pwrbars">
    <div class="pbrwrap" style="border-color:rgba(255,200,0,0.3)">
      <div class="pbr-lbl">
        <span style="color:#ffd700;font-size:12px;font-weight:700;white-space:nowrap">☀ ZONNEPANELEN</span>
        <span style="color:#ffd700;font-size:14px;font-weight:700;white-space:nowrap">${pvW} W <span style="opacity:0.5;font-weight:400">/ ${pvMax} W</span></span>
      </div>
      <div class="pbr-bar">
        <div class="pbr-fill" style="width:${pvPct.toFixed(1)}%;background:linear-gradient(90deg,#ff8800,#ffd700)"></div>
      </div>
    </div>
    <div class="pbrwrap" style="border-color:rgba(255,100,50,0.3)">
      <div class="pbr-lbl">
        <span style="color:${loadKleur};font-size:12px;font-weight:700;white-space:nowrap${loadAlarm?';animation:pulse 0.6s ease-in-out infinite':''}">⚡ GEBRUIK NU${loadAlarm?' ⚠':''}</span>
        <span style="color:${loadKleur};font-size:14px;font-weight:700;white-space:nowrap">${loadW} W <span style="opacity:0.5;font-weight:400">/ ${loadMax} W</span></span>
      </div>
      <div class="pbr-bar">
        <div class="pbr-fill" style="width:${loadPct.toFixed(1)}%;background:${loadAlarm?'linear-gradient(90deg,#cc0000,#ff2222)':'linear-gradient(90deg,#ff4400,#ff8844)'}"></div>
      </div>
    </div>
  </div>

  <!-- BATTERIJ PANEEL rechtsonder: elke accu naast zijn BMS tegel -->
  <div class="batt-panel">
    <div class="batt-row">
${(this._config && this._config.hide_bms) ? '' : `
      <!-- BMS 1: accu + detail naast elkaar -->
      <div class="batt-unit" style="border-color:rgba(0,255,136,0.2)">
        ${this._battSvg(bms1Soc, 'BMS 1', '#00ff88', battChar, 'bc1')}
        <div style="display:flex;flex-direction:column;justify-content:center;gap:3px;min-width:110px">
          <div style="font-size:11px;color:rgba(0,255,136,0.5);letter-spacing:1px;font-weight:700">BMS 1 — ${Math.round(bms1Soc)}%</div>
          <div class="sr"><span class="sk">Min/Max</span><span class="sv2">${bms1Min}/${bms1Max} V</span></div>
          <div class="sr"><span class="sk">Delta</span><span class="sv2" style="color:${d1c}">Δ ${bms1Delta} V</span></div>
          <div class="sr"><span class="sk">Temp/MOS</span><span class="sv2">${bms1Temp}°/${bms1MosT}°C</span></div>
          <div class="sr"><span class="sk">Cycli</span><span class="sv2">${bms1Cycli}</span></div>
        </div>
      </div>

      <!-- BMS 2: accu + detail naast elkaar -->
      <div class="batt-unit" style="border-color:rgba(0,170,255,0.2)">
        ${this._battSvg(bms2Soc, 'BMS 2', '#00aaff', battChar, 'bc2')}
        <div style="display:flex;flex-direction:column;justify-content:center;gap:3px;min-width:110px">
          <div style="font-size:11px;color:rgba(0,170,255,0.5);letter-spacing:1px;font-weight:700">BMS 2 — ${Math.round(bms2Soc)}%</div>
          <div class="sr"><span class="sk">Min/Max</span><span class="sv2">${bms2Min}/${bms2Max} V</span></div>
          <div class="sr"><span class="sk">Delta</span><span class="sv2" style="color:${d2c}">Δ ${bms2Delta} V</span></div>
          <div class="sr"><span class="sk">Temp/MOS</span><span class="sv2">${bms2Temp}°/${bms2MosT}°C</span></div>
          <div class="sr"><span class="sk">Cycli</span><span class="sv2">${bms2Cycli}</span></div>
        </div>
      </div>
`}
    </div>

    <!-- Totaal SOC — nu volle breedte (was voorheen samen met Zon Onder) -->
    <div class="batt-detail" style="width:100%;flex:${(this._config && this._config.soc_tile_flex) || 1};text-align:center;padding:10px 16px">
      <div style="font-size:10px;color:rgba(255,255,255,0.95);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:4px">Totaal SOC</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:10px">
        <svg width="${(this._config && this._config.soc_icon_size) || 34}" height="${((this._config && this._config.soc_icon_size) || 34) * 1.85}" viewBox="0 0 26 48" fill="none">
          <rect x="9" y="1" width="8" height="4" rx="1.5" fill="rgba(255,255,255,0.55)"/>
          <rect x="1" y="5" width="24" height="42" rx="4" stroke="rgba(255,255,255,0.55)" stroke-width="2.5"/>
          <rect x="5" y="${42 - Math.max(4, 34 * (battSoc/100))}" width="16" height="${Math.max(4, 34 * (battSoc/100))}" rx="2" fill="${battSoc>35?'#00cc66':battSoc>30?'#ffa500':'#ff4444'}"/>
        </svg>
        <div style="font-size:${(this._config && this._config.soc_font_size) || 38}px;font-weight:800;color:${battSoc>35?'#00cc66':battSoc>30?'#ffa500':'#ff4444'};line-height:1">${battSoc.toFixed(1)}%</div>
      </div>
      <div style="height:5px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;margin-top:8px">
        <div style="width:${battSoc}%;height:100%;background:${battSoc>35?'#00cc66':battSoc>30?'#ffa500':'#ff4444'};border-radius:3px;transition:width 1s ease"></div>
      </div>
    </div>

${(this._config && this._config.show_battery_voltage) ? `
    <!-- ACCUSPANNING tegel — optioneel, handig voor installaties zonder BMS/SOC-%  (bv. loodaccu's) -->
    <div class="batt-detail" style="width:100%;text-align:center;padding:8px 14px">
      <div style="font-size:10px;color:rgba(255,255,255,0.95);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:2px">Accuspanning</div>
      <div style="font-size:22px;font-weight:800;color:${battChar?'#00cc66':'#ffa500'}">${battVGeneric} V</div>
    </div>
` : ''}

    <!-- Details tegel: spanning/stroom/(beschikbaar/autonomie optioneel) -->
    <div class="batt-detail" style="width:100%;display:flex;flex-direction:column;gap:4px;padding:9px 14px">
      <div class="sr" style="gap:10px"><span class="sk" style="${(this._config && this._config.hide_autonomie) ? 'font-size:17px' : ''}">Spanning</span><span class="sv2" style="${(this._config && this._config.hide_autonomie) ? 'font-size:17px' : ''}">${battV} V</span></div>
      <div class="sr" style="gap:10px"><span class="sk" style="${(this._config && this._config.hide_autonomie) ? 'font-size:17px' : ''}">Stroom</span><span class="sv2" style="color:${battChar?'#00ff88':'#ff9900'};${(this._config && this._config.hide_autonomie) ? 'font-size:17px' : ''}">${battChar?'▲':'▼'} ${Math.abs(parseFloat(battA))} A</span></div>
      ${(this._config && this._config.hide_autonomie) ? '' : `
      <div class="sr" style="gap:10px"><span class="sk">Beschikbaar</span><span class="sv2" style="color:#88ccff">${battWh} Wh</span></div>
      <div class="sr" style="gap:10px"><span class="sk">Autonomie</span><span class="sv2" style="color:#aaffcc">${battDuur} uur te gaan</span></div>
      `}
      ${(this._config && this._config.battery_temp_entity && this._hasEntity(this._config.battery_temp_entity)) ? `
      <div class="sr" style="gap:10px"><span class="sk" style="${(this._config && this._config.hide_autonomie) ? 'font-size:17px' : ''}">Temp accu</span><span class="sv2" style="color:#ffaa66;${(this._config && this._config.hide_autonomie) ? 'font-size:17px' : ''}">${s(this._config.battery_temp_entity).toFixed(1)}°C</span></div>
      ` : ''}
    </div>

${(this._config && this._config.show_wind) ? `
    <!-- WIND tegel — optioneel, voor installaties met een windturbine -->
    <div class="batt-detail" style="width:100%;background:rgba(4,14,44,0.55);text-align:center;padding:10px 12px;display:flex;flex-direction:column;justify-content:center;align-items:center">
      <div style="font-size:10px;color:rgba(150,220,255,0.85);letter-spacing:1px">WIND</div>
      <div style="font-size:16px;font-weight:700;color:#96dcff;display:flex;align-items:center;gap:5px">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#96dcff" stroke-width="2" stroke-linecap="round"><path d="M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2M17.6 7.6A2 2 0 1 1 19 11H2"/></svg>
        ${windW} W
      </div>
    </div>
` : ''}

${(this._config && this._config.hide_zon_onder) ? '' : `
    <!-- ZON ONDER tegel — nu onderaan, volle breedte -->
    <div class="batt-detail" style="width:100%;background:rgba(4,14,44,0.55);text-align:center;padding:10px 12px;display:flex;flex-direction:column;justify-content:center;align-items:center">
      <div style="font-size:10px;color:rgba(255,180,90,0.85);letter-spacing:1px">ZON ONDER</div>
      <div style="font-size:15px;font-weight:700;color:#ffb050;display:flex;align-items:center;gap:5px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffb050" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><path d="M5 19h14" stroke-width="1.5"/><path d="M12 12v4" stroke-width="2"/><path d="M9 15l3 3 3-3" stroke-width="2"/></svg>${zonOnd}</div>
    </div>
`}
  </div>


  <!-- VERWARMING POPUP -->
  <!-- KNMI popup -->
  <div id="knmi-popup" style="display:none;position:fixed;inset:0;z-index:101;background:rgba(0,0,0,0.85);backdrop-filter:blur(6px);align-items:center;justify-content:center">
    <div style="background:rgba(6,16,48,0.97);border:1px solid rgba(255,150,50,0.4);border-radius:20px;padding:36px 40px;width:min(520px,88vw);color:#fff;font-family:'Segoe UI',system-ui,sans-serif;text-align:center">
      <div style="font-size:48px;margin-bottom:16px">⚠️</div>
      <div id="knmi-popup-code" style="font-size:26px;font-weight:800;margin-bottom:10px"></div>
      <div style="font-size:15px;color:rgba(255,255,255,0.95);margin-bottom:28px">Overijssel · knmi.nl</div>
      <div style="font-size:15px;color:rgba(255,255,255,0.95);line-height:1.6;margin-bottom:32px">
        De KNMI waarschuwingsdetails zijn beschikbaar op de KNMI website.<br>
        Klik hieronder om de actuele waarschuwing te bekijken.
      </div>

      <div id="knmi-popup-sluit" style="cursor:pointer;padding:10px 24px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:10px;font-size:14px;color:rgba(255,255,255,0.95)">Sluiten</div>
    </div>
  </div>

  <div id="wal-limit-popup" style="display:none;position:fixed;inset:0;z-index:101;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);align-items:center;justify-content:center">
    <div style="background:rgba(6,16,48,0.97);border:1px solid rgba(0,170,255,0.4);border-radius:20px;padding:32px 40px;min-width:320px;text-align:center;color:#fff;font-family:'Segoe UI',system-ui,sans-serif">
      <div style="font-size:12px;letter-spacing:3px;color:rgba(255,255,255,0.95);margin-bottom:8px">WALSTROOM LIMIET</div>
      <div style="font-size:48px;font-weight:800;color:#00aaff;margin:16px 0" id="wal-limit-display">-- A</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:20px;margin-bottom:28px">
        <div id="wal-limit-min" style="cursor:pointer;width:56px;height:56px;border-radius:50%;background:rgba(0,170,255,0.1);border:1.5px solid rgba(0,170,255,0.4);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#00aaff">−</div>
        <div style="font-size:14px;color:rgba(255,255,255,0.95)">1 A per stap</div>
        <div id="wal-limit-plus" style="cursor:pointer;width:56px;height:56px;border-radius:50%;background:rgba(0,170,255,0.1);border:1.5px solid rgba(0,170,255,0.4);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#00aaff">+</div>
      </div>
      <div style="display:flex;gap:10px;justify-content:center">
        <div id="wal-limit-set" style="cursor:pointer;padding:12px 32px;background:rgba(0,170,255,0.15);border:1px solid rgba(0,170,255,0.5);border-radius:12px;font-size:15px;font-weight:700;color:#00aaff">Instellen</div>
        <div id="wal-limit-sluit" style="cursor:pointer;padding:12px 32px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:12px;font-size:15px;color:rgba(255,255,255,0.95)">Sluiten</div>
      </div>
    </div>
  </div>



  <!-- WALSTROOM INSTELLINGEN POPUP -->
  <div id="wal-inst-popup" style="display:none;position:fixed;inset:0;z-index:102;background:rgba(0,0,0,0.80);backdrop-filter:blur(8px);align-items:center;justify-content:center">
    <div style="background:rgba(6,16,48,0.97);border:1px solid rgba(100,170,255,0.35);border-radius:20px;padding:32px 40px;min-width:360px;max-height:88vh;overflow-y:auto;-webkit-overflow-scrolling:touch;text-align:center;color:#fff;font-family:'Segoe UI',system-ui,sans-serif">
      <div style="font-size:12px;letter-spacing:3px;color:rgba(255,255,255,0.95);margin-bottom:20px">WALSTROOM INSTELLINGEN</div>

      <div style="margin-bottom:20px">
        <div style="font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:1px;margin-bottom:8px">SOCKET AAN ONDER</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:16px">
          <div id="wi-soc-aan-min" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">−</div>
          <div style="min-width:80px"><div id="wi-soc-aan-val" style="font-size:32px;font-weight:800;color:#ff9900">--%</div></div>
          <div id="wi-soc-aan-plus" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">+</div>
        </div>
      </div>

      <div style="margin-bottom:20px">
        <div style="font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:1px;margin-bottom:8px">SOCKET UIT BOVEN</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:16px">
          <div id="wi-soc-uit-min" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">−</div>
          <div style="min-width:80px"><div id="wi-soc-uit-val" style="font-size:32px;font-weight:800;color:#00cc66">--%</div></div>
          <div id="wi-soc-uit-plus" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">+</div>
        </div>
      </div>

      <div style="margin-bottom:28px">
        <div style="font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:1px;margin-bottom:8px">ZON DREMPEL (UIT BIJ MEER ZON)</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:16px">
          <div id="wi-zon-min" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">−</div>
          <div style="min-width:80px"><div id="wi-zon-val" style="font-size:32px;font-weight:800;color:#ffd700">-- W</div></div>
          <div id="wi-zon-plus" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">+</div>
        </div>
      </div>

      ${(this._config && this._config.walstroom_kwh_prijs_entity) ? `
      <div style="margin-bottom:28px">
        <div style="font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:1px;margin-bottom:8px">STROOMPRIJS (PER KWH)</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:16px">
          <div id="wi-prijs-min" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">−</div>
          <div style="min-width:80px"><div id="wi-prijs-val" style="font-size:32px;font-weight:800;color:#66ccff">-- €</div></div>
          <div id="wi-prijs-plus" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">+</div>
        </div>
      </div>
      ` : ''}

      <div style="border-top:1px solid rgba(255,255,255,0.12);padding-top:20px;margin-bottom:8px">
        <div style="font-size:11px;letter-spacing:2px;color:rgba(255,120,120,0.9);margin-bottom:16px">OVERBELASTING</div>
      </div>

      <div style="margin-bottom:20px">
        <div style="font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:1px;margin-bottom:8px">AAN BOVEN</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:16px">
          <div id="wi-ovl-aan-min" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">−</div>
          <div style="min-width:80px"><div id="wi-ovl-aan-val" style="font-size:32px;font-weight:800;color:#ff4444">-- W</div></div>
          <div id="wi-ovl-aan-plus" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">+</div>
        </div>
      </div>

      <div style="margin-bottom:20px">
        <div style="font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:1px;margin-bottom:8px">AAN NA</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:16px">
          <div id="wi-ovl-aanduur-min" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">−</div>
          <div style="min-width:80px"><div id="wi-ovl-aanduur-val" style="font-size:32px;font-weight:800;color:#ff8844">-- s</div></div>
          <div id="wi-ovl-aanduur-plus" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">+</div>
        </div>
      </div>

      <div style="margin-bottom:20px">
        <div style="font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:1px;margin-bottom:8px">UIT ONDER</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:16px">
          <div id="wi-ovl-uit-min" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">−</div>
          <div style="min-width:80px"><div id="wi-ovl-uit-val" style="font-size:32px;font-weight:800;color:#00cc66">-- W</div></div>
          <div id="wi-ovl-uit-plus" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">+</div>
        </div>
      </div>

      <div style="margin-bottom:28px">
        <div style="font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:1px;margin-bottom:8px">UIT NA</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:16px">
          <div id="wi-ovl-uitduur-min" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">−</div>
          <div style="min-width:80px"><div id="wi-ovl-uitduur-val" style="font-size:32px;font-weight:800;color:#66ccff">-- s</div></div>
          <div id="wi-ovl-uitduur-plus" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">+</div>
        </div>
      </div>

      <div id="wi-sluit" style="cursor:pointer;padding:12px 40px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:12px;font-size:15px;color:rgba(255,255,255,0.95);display:inline-block">Sluiten</div>
    </div>
  </div>

  <div id="wal-confirm-popup" style="display:none;position:fixed;inset:0;z-index:103;background:rgba(0,0,0,0.80);backdrop-filter:blur(8px);align-items:center;justify-content:center">
    <div style="background:rgba(6,16,48,0.97);border:1px solid rgba(255,153,0,0.45);border-radius:20px;padding:32px 40px;min-width:340px;text-align:center;color:#fff;font-family:'Segoe UI',system-ui,sans-serif">
      <div style="font-size:12px;letter-spacing:3px;color:rgba(255,255,255,0.95);margin-bottom:16px">WALSTROOM INSCHAKELEN</div>
      <div style="font-size:14px;color:rgba(255,255,255,0.95);margin-bottom:28px;line-height:1.5">Weet je zeker dat je walstroom<br>handmatig wilt inschakelen?</div>
      <div style="display:flex;gap:12px;justify-content:center">
        <div id="wal-confirm-nee" style="cursor:pointer;padding:12px 28px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:12px;font-size:15px;color:rgba(255,255,255,0.95)">Annuleren</div>
        <div id="wal-confirm-ja" style="cursor:pointer;padding:12px 28px;background:rgba(255,153,0,0.18);border:0.5px solid rgba(255,153,0,0.5);border-radius:12px;font-size:15px;color:#ffaa33;font-weight:700">Ja, inschakelen</div>
      </div>
    </div>
  </div>

  <div id="gen-confirm-popup" style="display:none;position:fixed;inset:0;z-index:103;background:rgba(0,0,0,0.80);backdrop-filter:blur(8px);align-items:center;justify-content:center">
    <div style="background:rgba(6,16,48,0.97);border:1px solid rgba(255,90,60,0.5);border-radius:20px;padding:32px 40px;min-width:340px;text-align:center;color:#fff;font-family:'Segoe UI',system-ui,sans-serif">
      <div style="font-size:12px;letter-spacing:3px;color:rgba(255,255,255,0.95);margin-bottom:16px">GENERATOR STARTEN</div>
      <div style="font-size:14px;color:rgba(255,255,255,0.95);margin-bottom:28px;line-height:1.5">Weet je zeker dat je de generator<br>handmatig wilt starten?</div>
      <div style="display:flex;gap:12px;justify-content:center">
        <div id="gen-confirm-nee" style="cursor:pointer;padding:12px 28px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:12px;font-size:15px;color:rgba(255,255,255,0.95)">Annuleren</div>
        <div id="gen-confirm-ja" style="cursor:pointer;padding:12px 28px;background:rgba(255,90,60,0.2);border:0.5px solid rgba(255,90,60,0.55);border-radius:12px;font-size:15px;color:#ff8866;font-weight:700">Ja, starten</div>
      </div>
    </div>
  </div>

  <div id="verw-popup" style="display:none;position:fixed;inset:0;z-index:100;background:rgba(0,0,0,0.6);backdrop-filter:blur(6px);align-items:center;justify-content:center">
    <div style="background:rgba(8,18,52,0.96);border:1px solid rgba(255,100,50,0.4);border-radius:20px;padding:32px 40px;min-width:340px;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,0.6)">
      <div style="font-size:13px;letter-spacing:3px;color:rgba(255,255,255,0.95);margin-bottom:8px">VERWARMING</div>

      <!-- Aan/uit knop -->
      <div id="verw-toggle" style="display:inline-block;margin-bottom:24px;padding:10px 32px;border-radius:30px;cursor:pointer;font-size:15px;font-weight:700;letter-spacing:2px;transition:all 0.2s"></div>

      <!-- Huidige temp -->
      <div style="font-size:14px;color:rgba(255,255,255,0.95);margin-bottom:4px">Huidige temperatuur</div>
      <div id="verw-huidig" style="font-size:28px;font-weight:300;color:#fff;margin-bottom:24px"></div>

      <!-- Setpoint instellen -->
      <div style="font-size:14px;color:rgba(255,255,255,0.95);margin-bottom:16px">Instelpunt</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:24px;margin-bottom:32px">
        <button id="verw-min" style="width:72px;height:72px;border-radius:50%;border:2px solid rgba(100,160,255,0.5);background:rgba(100,160,255,0.12);color:#88aaff;font-size:40px;font-weight:300;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1">−</button>
        <div id="verw-set-display" style="font-size:52px;font-weight:700;color:#fff;min-width:110px">--°</div>
        <button id="verw-plus" style="width:72px;height:72px;border-radius:50%;border:2px solid rgba(255,130,60,0.5);background:rgba(255,130,60,0.12);color:#ff9944;font-size:40px;font-weight:300;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1">+</button>
      </div>

      <!-- Sluiten -->
      <button id="verw-sluit" style="padding:12px 48px;border-radius:30px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.95);font-size:14px;cursor:pointer;letter-spacing:1px">SLUITEN</button>
    </div>
  </div>



      <!-- STATS BALK onderaan -->
  <div class="statsbar">

    <div class="stat" style="flex:${(this._config && this._config.pv_flex) || 1};border-color:rgba(255,200,0,0.2)">
      <div class="sl">ZONNEPANELEN VANDAAG</div>
      <div class="sv" style="color:#ffd700">${pvVandaag} kWh</div>
      <div class="ss">Maand: ${pvMaand} kWh</div>
      <div class="ss">${mpptState}</div>
    </div>

    <div class="stat" style="max-width:${(this._config && this._config.resterende_width) || 140}px;border-color:rgba(0,200,255,0.2)">
      <div class="sl">RESTERENDE TIJD</div>
      <div class="sv" style="color:#00d7ff">${battDuur} uur te gaan</div>
      <div class="ss">${battWh} Wh</div>
    </div>





    <div class="stat" style="flex:${(this._config && this._config.omvormer_flex) || 1};border-color:rgba(${sc.replace('#','').match(/../g)?'100,170,255':'100,170,255'},0.25)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <div class="sl" style="margin:0">OMVORMER</div>
        <div style="display:flex;gap:5px;align-items:center">
          <span style="font-size:10px;color:rgba(255,255,255,0.95)">TEMP</span>
          <span style="width:8px;height:8px;border-radius:50%;background:rgba(0,255,136,0.5);display:inline-block"></span>
          <span style="font-size:10px;color:rgba(255,255,255,0.95)">OVERL</span>
          <span style="width:8px;height:8px;border-radius:50%;background:${['ok','Ok','0','','false','no alarm','No alarm','No Alarm','no_alarm'].includes(alarmOver)?'rgba(0,255,136,0.5)':'#ff4444'};display:inline-block"></span>
          <span style="font-size:10px;color:rgba(255,255,255,0.95)">ACCU</span>
          <span style="width:8px;height:8px;border-radius:50%;background:${battSoc>35?'#00cc66':battSoc>30?'#ffa500':'#ff4444'};display:inline-block"></span>
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <div style="display:flex;flex-direction:column;align-items:center;background:rgba(${sc==='#00ff88'?'0,255,136':'255,153,0'},0.08);border:0.5px solid ${sc};border-radius:6px;padding:5px 12px">
          <div style="font-size:12px;color:rgba(255,255,255,0.95);letter-spacing:1px">MODUS</div>
          <div style="font-size:16px;font-weight:800;color:${sc}">${sl}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;flex:1">
          <div class="sr" style="font-size:15px"><span class="sk">AC uit</span><span class="sv2">${acV} V · ${acHz} Hz</span></div>
          <div class="sr" style="font-size:15px"><span class="sk">AC in</span><span class="sv2" style="color:${gridActive?'#00aaff':gridSpanning?'rgba(0,170,255,0.5)':'rgba(255,255,255,0.3)'}">${gridActive?acInV+' V · '+gridW+' W':gridSpanning?acInV+' V (stand-by)':'—'}</span></div>
          <div class="sr" style="font-size:15px"><span class="sk">DC</span><span class="sv2">${dcV} V</span></div>
          <div class="sr" style="font-size:15px"><span class="sk">Vermogen</span><span class="sv2">${acOutW} W</span></div>
        </div>
      </div>
    </div>





    <div class="stat" style="flex:${(this._config && this._config.generator_flex) || 1};border-color:rgba(${genActive?'0,255,100':'80,80,120'},0.2);display:flex;flex-direction:column;gap:4px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div class="sl" style="margin:0">GENERATOR</div>
        <div id="gen-toggle-btn" data-entity="${generatorSwitchEntity}" data-state="${genManualOn}"
             style="cursor:pointer;width:38px;height:20px;border-radius:10px;background:${genManualOn==='on'?'#00cc66':'rgba(255,255,255,0.15)'};position:relative;transition:background 0.2s">
          <div style="position:absolute;top:2px;left:${genManualOn==='on'?'20px':'2px'};width:16px;height:16px;border-radius:50%;background:#fff;transition:left 0.2s"></div>
        </div>
      </div>
      <div class="sv" style="color:${genActive?'#00ff88':'rgba(255,255,255,0.3)'}">${genActive?'AAN':'UIT'}</div>
      <div class="ss">${genActive?genState:'Gestopt'}${genActive && gridW>20 ? ' · '+gridW+' W' : ''}</div>
      <div style="display:flex;gap:10px;margin-top:2px">
        <div><span style="font-size:10px;color:rgba(255,255,255,0.95)">VANDAAG</span><br><span style="font-size:13px;font-weight:700">${genRuntimeToday} u</span></div>
        <div><span style="font-size:10px;color:rgba(255,255,255,0.95)">TOTAAL</span><br><span style="font-size:13px;font-weight:700">${genRuntimeTotal} u</span></div>
      </div>
    </div>

${(this._config && this._config.show_kabola) ? `
    <!-- KABOLA verwarming — optioneel, alleen zichtbaar met show_kabola:true + kabola_climate_entity -->
    <div class="stat" data-kabola-toggle style="cursor:pointer;flex:${(this._config.kabola_flex) || 1};border-color:rgba(255,120,60,0.2);display:flex;flex-direction:column;gap:4px">
      <div class="sl" style="margin:0">KABOLA</div>
      <div class="sv" style="color:${kabolaActief?'#ff8844':'rgba(255,255,255,0.3)'}">${kabolaActief?'AAN':'UIT'}</div>
      <div class="ss">Doel: ${kabolaDoelTemp}°C · Nu: ${kabolaHuidigeTemp}°C</div>
    </div>
` : ''}

${(this._config && this._config.hide_waterhoogte) ? '' : `
    <div class="stat" style="border-color:rgba(0,204,255,0.2)">
      <div class="sl">WATERHOOGTE</div>
      <div class="sv" style="color:#00d7ff">${waterhoogte} cm</div>
      <svg viewBox="0 0 160 44" width="100%" height="44" style="margin-top:2px;display:block">${sparkline}</svg>
    </div>
`}

${(this._config && this._config.dc_load_entity) ? `
    <div class="stat" style="border-color:rgba(255,200,0,0.2);display:flex;flex-direction:column;gap:4px">
      <div class="sl" style="font-size:13px">VERBRUIK</div>
      <div class="sr" style="gap:10px"><span class="sk" style="font-size:17px">12V</span><span class="sv2" style="color:#ffcc00;font-size:17px">${s(this._config.dc_load_entity).toFixed(0)} W</span></div>
      <div class="sr" style="gap:10px"><span class="sk" style="font-size:17px">230V</span><span class="sv2" style="color:#00d7ff;font-size:17px">${(this._config.ac_load_entity ? s(this._config.ac_load_entity) : 0).toFixed(0)} W</span></div>
    </div>
` : ''}




<!--FCDYN_END-->
  </div>
 </div>
</div>`;
    this._applyRenderedHtml(__html, skyImg, () => {
      // Pas de 1920x1080-canvas schaal toe op het huidige schermformaat
      this._applyScale();

      // Start flow animatie
      this._startFlowAnim();
      // Start regen animatie (uit te zetten via disable_rain_animation, scheelt onnodig herrenderen op kiosk-schermen)
      if (!(this._config && this._config.disable_rain_animation)) {
        this._startRainAnim(wcond);
      }

      // Herattach overlay container als die bestaat (overleeft geen innerHTML reset)
      if (this._overlayContainer) {
        this.shadowRoot.appendChild(this._overlayContainer);
      }

      // Pas tekstkleur aan op basis van achtergrond
      const profile = this._skyLabelProfile(skyImg);
      const host = this.shadowRoot.host || this.shadowRoot.querySelector(':host') || this;
      this.style.setProperty('--lbl-dim', profile.dim);
      this.style.setProperty('--lbl-mid', profile.mid);
      this.style.setProperty('--lbl-sub', profile.sub);
    });
  }

  _startFlowAnim() {
    const walstroomSocAanEntity = (this._config && this._config.walstroom_soc_aan_entity) || 'input_number.walstroom_soc_aan';
    const walstroomSocUitEntity = (this._config && this._config.walstroom_soc_uit_entity) || 'input_number.walstroom_soc_uit';
    const walstroomZonDrempelEntity = (this._config && this._config.walstroom_zon_drempel_entity) || 'input_number.walstroom_zon_drempel';
    const walstroomKwhPrijsEntity = (this._config && this._config.walstroom_kwh_prijs_entity) || null;
    const walstroomOvlAanEntity = (this._config && this._config.walstroom_overbelasting_aan_entity) || 'input_number.walstroom_overbelasting_aan';
    const walstroomOvlUitEntity = (this._config && this._config.walstroom_overbelasting_uit_entity) || 'input_number.walstroom_overbelasting_uit';
    const walstroomOvlAanDuurEntity = (this._config && this._config.walstroom_overbelasting_aan_duur_entity) || 'input_number.walstroom_overbelasting_aan_duur';
    const walstroomOvlUitDuurEntity = (this._config && this._config.walstroom_overbelasting_uit_duur_entity) || 'input_number.walstroom_overbelasting_uit_duur';
    // Animatie via CSS keyframes — geen JS nodig



    // Walstroom socket knop (configureerbaar, valt terug op Eriks eigen socket)
    const walstroomSwitchEntity = (this._config && this._config.walstroom_switch_entity) || 'switch.walstroom_socket_1';
    const walConfirmPopup = this.shadowRoot.getElementById('wal-confirm-popup');
    const walConfirmJa = this.shadowRoot.getElementById('wal-confirm-ja');
    const walConfirmNee = this.shadowRoot.getElementById('wal-confirm-nee');
    if (walConfirmPopup) {
      if (this._walConfirmPopupOpen) walConfirmPopup.style.display = 'flex';
      const sluitConfirm = () => { this._walConfirmPopupOpen = false; walConfirmPopup.style.display = 'none'; };
      if (walConfirmNee) walConfirmNee.onclick = (e) => { e.stopPropagation(); sluitConfirm(); };
      walConfirmPopup.onclick = (e) => { if (e.target === walConfirmPopup) sluitConfirm(); };
      if (walConfirmJa) walConfirmJa.onclick = (e) => {
        e.stopPropagation();
        if (this._hass) this._hass.callService('switch', 'turn_on', { entity_id: walstroomSwitchEntity });
        sluitConfirm();
      };
    }
    const walSocketBtn = this.shadowRoot.getElementById('wal-socket-btn');
    if (walSocketBtn && this._hass) {
      walSocketBtn.onclick = (e) => {
        e.stopPropagation();
        const aan = this._hass.states[walstroomSwitchEntity]?.state === 'on';
        if (aan) {
          // Uitschakelen mag direct, geen bevestiging nodig
          this._hass.callService('switch', 'turn_off', { entity_id: walstroomSwitchEntity });
        } else {
          // Inschakelen: eerst bevestiging vragen om per ongeluk aanzetten te voorkomen
          this._walConfirmPopupOpen = true;
          if (walConfirmPopup) walConfirmPopup.style.display = 'flex';
        }
      };
    }

    // Generator start/stop knop (configureerbaar, valt terug op Eriks eigen manual-start switch)
    const generatorSwitchEntity = (this._config && this._config.generator_switch_entity) || 'switch.generator_start_stop_manual_start';
    const genConfirmPopup = this.shadowRoot.getElementById('gen-confirm-popup');
    const genConfirmJa = this.shadowRoot.getElementById('gen-confirm-ja');
    const genConfirmNee = this.shadowRoot.getElementById('gen-confirm-nee');
    if (genConfirmPopup) {
      if (this._genConfirmPopupOpen) genConfirmPopup.style.display = 'flex';
      const sluitGenConfirm = () => { this._genConfirmPopupOpen = false; genConfirmPopup.style.display = 'none'; };
      if (genConfirmNee) genConfirmNee.onclick = (e) => { e.stopPropagation(); sluitGenConfirm(); };
      genConfirmPopup.onclick = (e) => { if (e.target === genConfirmPopup) sluitGenConfirm(); };
      if (genConfirmJa) genConfirmJa.onclick = (e) => {
        e.stopPropagation();
        if (this._hass) this._hass.callService('switch', 'turn_on', { entity_id: generatorSwitchEntity });
        sluitGenConfirm();
      };
    }
    const genToggleBtn = this.shadowRoot.getElementById('gen-toggle-btn');
    if (genToggleBtn && this._hass) {
      genToggleBtn.onclick = (e) => {
        e.stopPropagation();
        const aan = this._hass.states[generatorSwitchEntity]?.state === 'on';
        if (aan) {
          // Stoppen mag direct, geen bevestiging nodig
          this._hass.callService('switch', 'turn_off', { entity_id: generatorSwitchEntity });
        } else {
          // Starten: eerst bevestiging vragen om per ongeluk starten te voorkomen
          this._genConfirmPopupOpen = true;
          if (genConfirmPopup) genConfirmPopup.style.display = 'flex';
        }
      };
    }

    // Kabola verwarming aan/uit (indien geconfigureerd)
    const kabolaTile = this.shadowRoot.querySelector('[data-kabola-toggle]');
    if (kabolaTile && this._hass && this._config && this._config.kabola_climate_entity) {
      kabolaTile.onclick = (e) => {
        e.stopPropagation();
        const ent = this._config.kabola_climate_entity;
        const aan = this._hass.states[ent]?.state !== 'off';
        this._hass.callService('climate', 'set_hvac_mode', {
          entity_id: ent, hvac_mode: aan ? 'off' : 'heat'
        });
      };
    }

    // Walstroom override knop (configureerbaar, valt terug op Eriks eigen helper)
    const walstroomOverrideEntity = (this._config && this._config.walstroom_override_entity) || 'input_boolean.walstroom_override';
    const walOverrideBtn = this.shadowRoot.getElementById('wal-override-btn');
    if (walOverrideBtn && this._hass) {
      walOverrideBtn.onclick = (e) => {
        e.stopPropagation();
        const aan = this._hass.states[walstroomOverrideEntity]?.state === 'on';
        this._hass.callService('input_boolean', aan ? 'turn_off' : 'turn_on', {
          entity_id: walstroomOverrideEntity
        });
      };
    }

    // Zijbalk knoppen via event delegation
    const sidebar = this.shadowRoot.querySelector('.sidebar');
    if (sidebar) {
      sidebar.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-sid]');
        if (btn) this._openSidebar(btn.dataset.sid);
      });
    }

    // Verwarming popup


    // Walstroom instellingen popup
    const wiBtn   = this.shadowRoot.getElementById('wal-instellingen-btn');
    const wiPopup = this.shadowRoot.getElementById('wal-inst-popup');
    const wiSluit = this.shadowRoot.getElementById('wi-sluit');

    const _wiLoad = () => {
      if (!this._hass) return;
      const aan = parseFloat(this._hass.states[walstroomSocAanEntity]?.state) || 30;
      const uit = parseFloat(this._hass.states[walstroomSocUitEntity]?.state) || 80;
      const zon = parseFloat(this._hass.states[walstroomZonDrempelEntity]?.state) || 300;
      const prijs = walstroomKwhPrijsEntity ? (parseFloat(this._hass.states[walstroomKwhPrijsEntity]?.state) || 0.50) : 0.50;
      const ovlAan = parseFloat(this._hass.states[walstroomOvlAanEntity]?.state) || 4500;
      const ovlUit = parseFloat(this._hass.states[walstroomOvlUitEntity]?.state) || 3000;
      const ovlAanDuur = parseFloat(this._hass.states[walstroomOvlAanDuurEntity]?.state) || 30;
      const ovlUitDuur = parseFloat(this._hass.states[walstroomOvlUitDuurEntity]?.state) || 30;
      wiPopup._socAan = aan; wiPopup._socUit = uit; wiPopup._zon = zon; wiPopup._prijs = prijs;
      wiPopup._ovlAan = ovlAan; wiPopup._ovlUit = ovlUit; wiPopup._ovlAanDuur = ovlAanDuur; wiPopup._ovlUitDuur = ovlUitDuur;
      const v1 = wiPopup.querySelector('#wi-soc-aan-val');
      const v2 = wiPopup.querySelector('#wi-soc-uit-val');
      const v3 = wiPopup.querySelector('#wi-zon-val');
      const v3b = wiPopup.querySelector('#wi-prijs-val');
      const v4 = wiPopup.querySelector('#wi-ovl-aan-val');
      const v5 = wiPopup.querySelector('#wi-ovl-uit-val');
      const v6 = wiPopup.querySelector('#wi-ovl-aanduur-val');
      const v7 = wiPopup.querySelector('#wi-ovl-uitduur-val');
      if (v1) v1.textContent = aan + '%';
      if (v2) v2.textContent = uit + '%';
      if (v3) v3.textContent = zon + ' W';
      if (v3b) v3b.textContent = '€ ' + prijs.toFixed(2);
      if (v4) v4.textContent = ovlAan + ' W';
      if (v5) v5.textContent = ovlUit + ' W';
      if (v6) v6.textContent = ovlAanDuur + ' s';
      if (v7) v7.textContent = ovlUitDuur + ' s';
    };

    const _wiSet = (entity, value) => {
      this._hass.callService('input_number', 'set_value', { entity_id: entity, value });
    };

    if (wiBtn && wiPopup && this._hass) {
      if (this._walInstPopupOpen) { wiPopup.style.display = 'flex'; _wiLoad(); }
      wiBtn.onclick = (e) => { e.stopPropagation(); this._walInstPopupOpen = true; _wiLoad(); wiPopup.style.display = 'flex'; };

      const _btn = (id, fn) => {
        const el = wiPopup.querySelector('#' + id);
        if (el) el.onclick = (e) => { e.stopPropagation(); fn(); };
      };

      _btn('wi-soc-aan-min', () => {
        wiPopup._socAan = Math.max(10, (wiPopup._socAan || 30) - 5);
        const el = wiPopup.querySelector('#wi-soc-aan-val'); if (el) el.textContent = wiPopup._socAan + '%';
        _wiSet(walstroomSocAanEntity, wiPopup._socAan);
      });
      _btn('wi-soc-aan-plus', () => {
        wiPopup._socAan = Math.min(70, (wiPopup._socAan || 30) + 5);
        const el = wiPopup.querySelector('#wi-soc-aan-val'); if (el) el.textContent = wiPopup._socAan + '%';
        _wiSet(walstroomSocAanEntity, wiPopup._socAan);
      });
      _btn('wi-soc-uit-min', () => {
        wiPopup._socUit = Math.max(50, (wiPopup._socUit || 80) - 5);
        const el = wiPopup.querySelector('#wi-soc-uit-val'); if (el) el.textContent = wiPopup._socUit + '%';
        _wiSet(walstroomSocUitEntity, wiPopup._socUit);
      });
      _btn('wi-soc-uit-plus', () => {
        wiPopup._socUit = Math.min(100, (wiPopup._socUit || 80) + 5);
        const el = wiPopup.querySelector('#wi-soc-uit-val'); if (el) el.textContent = wiPopup._socUit + '%';
        _wiSet(walstroomSocUitEntity, wiPopup._socUit);
      });
      _btn('wi-zon-min', () => {
        wiPopup._zon = Math.max(0, (wiPopup._zon || 300) - 50);
        const el = wiPopup.querySelector('#wi-zon-val'); if (el) el.textContent = wiPopup._zon + ' W';
        _wiSet(walstroomZonDrempelEntity, wiPopup._zon);
      });
      _btn('wi-zon-plus', () => {
        wiPopup._zon = Math.min(1000, (wiPopup._zon || 300) + 50);
        const el = wiPopup.querySelector('#wi-zon-val'); if (el) el.textContent = wiPopup._zon + ' W';
        _wiSet(walstroomZonDrempelEntity, wiPopup._zon);
      });
      _btn('wi-prijs-min', () => {
        wiPopup._prijs = Math.max(0, Math.round(((wiPopup._prijs || 0.50) - 0.01) * 100) / 100);
        const el = wiPopup.querySelector('#wi-prijs-val'); if (el) el.textContent = '€ ' + wiPopup._prijs.toFixed(2);
        if (walstroomKwhPrijsEntity) _wiSet(walstroomKwhPrijsEntity, wiPopup._prijs);
      });
      _btn('wi-prijs-plus', () => {
        wiPopup._prijs = Math.min(2, Math.round(((wiPopup._prijs || 0.50) + 0.01) * 100) / 100);
        const el = wiPopup.querySelector('#wi-prijs-val'); if (el) el.textContent = '€ ' + wiPopup._prijs.toFixed(2);
        if (walstroomKwhPrijsEntity) _wiSet(walstroomKwhPrijsEntity, wiPopup._prijs);
      });
      _btn('wi-ovl-aan-min', () => {
        wiPopup._ovlAan = Math.max(2000, (wiPopup._ovlAan || 4500) - 100);
        const el = wiPopup.querySelector('#wi-ovl-aan-val'); if (el) el.textContent = wiPopup._ovlAan + ' W';
        _wiSet(walstroomOvlAanEntity, wiPopup._ovlAan);
      });
      _btn('wi-ovl-aan-plus', () => {
        wiPopup._ovlAan = Math.min(5000, (wiPopup._ovlAan || 4500) + 100);
        const el = wiPopup.querySelector('#wi-ovl-aan-val'); if (el) el.textContent = wiPopup._ovlAan + ' W';
        _wiSet(walstroomOvlAanEntity, wiPopup._ovlAan);
      });
      _btn('wi-ovl-uit-min', () => {
        wiPopup._ovlUit = Math.max(1000, (wiPopup._ovlUit || 3000) - 100);
        const el = wiPopup.querySelector('#wi-ovl-uit-val'); if (el) el.textContent = wiPopup._ovlUit + ' W';
        _wiSet(walstroomOvlUitEntity, wiPopup._ovlUit);
      });
      _btn('wi-ovl-uit-plus', () => {
        wiPopup._ovlUit = Math.min(4500, (wiPopup._ovlUit || 3000) + 100);
        const el = wiPopup.querySelector('#wi-ovl-uit-val'); if (el) el.textContent = wiPopup._ovlUit + ' W';
        _wiSet(walstroomOvlUitEntity, wiPopup._ovlUit);
      });
      _btn('wi-ovl-aanduur-min', () => {
        wiPopup._ovlAanDuur = Math.max(5, (wiPopup._ovlAanDuur || 30) - 5);
        const el = wiPopup.querySelector('#wi-ovl-aanduur-val'); if (el) el.textContent = wiPopup._ovlAanDuur + ' s';
        _wiSet(walstroomOvlAanDuurEntity, wiPopup._ovlAanDuur);
      });
      _btn('wi-ovl-aanduur-plus', () => {
        wiPopup._ovlAanDuur = Math.min(300, (wiPopup._ovlAanDuur || 30) + 5);
        const el = wiPopup.querySelector('#wi-ovl-aanduur-val'); if (el) el.textContent = wiPopup._ovlAanDuur + ' s';
        _wiSet(walstroomOvlAanDuurEntity, wiPopup._ovlAanDuur);
      });
      _btn('wi-ovl-uitduur-min', () => {
        wiPopup._ovlUitDuur = Math.max(5, (wiPopup._ovlUitDuur || 30) - 5);
        const el = wiPopup.querySelector('#wi-ovl-uitduur-val'); if (el) el.textContent = wiPopup._ovlUitDuur + ' s';
        _wiSet(walstroomOvlUitDuurEntity, wiPopup._ovlUitDuur);
      });
      _btn('wi-ovl-uitduur-plus', () => {
        wiPopup._ovlUitDuur = Math.min(300, (wiPopup._ovlUitDuur || 30) + 5);
        const el = wiPopup.querySelector('#wi-ovl-uitduur-val'); if (el) el.textContent = wiPopup._ovlUitDuur + ' s';
        _wiSet(walstroomOvlUitDuurEntity, wiPopup._ovlUitDuur);
      });

      if (wiSluit) wiSluit.onclick = (e) => { e.stopPropagation(); this._walInstPopupOpen = false; wiPopup.style.display = 'none'; };
      wiPopup.onclick = (e) => { if (e.target === wiPopup) { this._walInstPopupOpen = false; wiPopup.style.display = 'none'; } };
    }

    // Walstroom limiet popup
    const walLimitBtn   = this.shadowRoot.getElementById('wal-limit-btn');
    const walLimitPopup = this.shadowRoot.getElementById('wal-limit-popup');
    const walLimitDisp  = this.shadowRoot.getElementById('wal-limit-display');
    const walLimitMin   = this.shadowRoot.getElementById('wal-limit-min');
    const walLimitPlus  = this.shadowRoot.getElementById('wal-limit-plus');
    const walLimitSet   = this.shadowRoot.getElementById('wal-limit-set');
    const walLimitSluit = this.shadowRoot.getElementById('wal-limit-sluit');

    if (walLimitBtn && walLimitPopup && this._hass) {
      if (this._walLimitPopupOpen) {
        walLimitPopup.style.display = 'flex';
        if (walLimitDisp) walLimitDisp.textContent = this._walLimitVal + ' A';
      }
      walLimitBtn.onclick = (e) => {
        e.stopPropagation();
        const cur = parseFloat(this._hass.states['number.gx_device_ac_input_limit']?.state) || 16;
        this._walLimitVal = cur;
        this._walLimitPopupOpen = true;
        if (walLimitDisp) walLimitDisp.textContent = cur + ' A';
        walLimitPopup.style.display = 'flex';
      };
      if (walLimitMin) walLimitMin.onclick = (e) => {
        e.stopPropagation();
        this._walLimitVal = Math.max(0, (this._walLimitVal || 16) - 1);
        if (walLimitDisp) walLimitDisp.textContent = this._walLimitVal + ' A';
      };
      if (walLimitPlus) walLimitPlus.onclick = (e) => {
        e.stopPropagation();
        this._walLimitVal = Math.min(25, (this._walLimitVal || 16) + 1);
        if (walLimitDisp) walLimitDisp.textContent = this._walLimitVal + ' A';
      };
      if (walLimitSet) walLimitSet.onclick = (e) => {
        e.stopPropagation();
        this._hass.callService('number', 'set_value', {
          entity_id: 'number.gx_device_ac_input_limit',
          value: this._walLimitVal
        });
        this._walLimitPopupOpen = false;
        walLimitPopup.style.display = 'none';
      };
      if (walLimitSluit) walLimitSluit.onclick = (e) => { e.stopPropagation(); this._walLimitPopupOpen = false; walLimitPopup.style.display = 'none'; };
      walLimitPopup.onclick = (e) => { if (e.target === walLimitPopup) { this._walLimitPopupOpen = false; walLimitPopup.style.display = 'none'; } };
    }
  }

  getCardSize() { return 10; }
  static getStubConfig() { return {}; }

  _startRainAnim(condition) {
    if (this._rainAnimId) { cancelAnimationFrame(this._rainAnimId); this._rainAnimId = null; }

    const c = (condition || '').toLowerCase();
    const isRain = c.includes('rainy') || c.includes('pouring') || c.includes('lightning');
    const isHeavy = c.includes('pouring');
    const drops = isHeavy ? 100 : isRain ? 45 : 0;

    // Verwijder bestaand canvas
    const old = this.shadowRoot.getElementById('rain-canvas');
    if (old) old.remove();
    if (drops === 0) return;

    // Maak canvas aan en voeg toe aan wrap container
    const canvas = document.createElement('canvas');
    canvas.id = 'rain-canvas';
    canvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:6';

    const wrap = this.shadowRoot.querySelector('#design-canvas');
    if (!wrap) return;
    wrap.appendChild(canvas);

    const resize = () => {
      canvas.width = 1920;
      canvas.height = 1080;
      canvas.style.width = canvas.width + 'px';
      canvas.style.height = canvas.height + 'px';
    };
    resize();

    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext('2d');

    const raindrops = Array.from({length: drops}, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      len: 10 + Math.random() * 14,
      speed: 7 + Math.random() * 9,
      opacity: 0.25 + Math.random() * 0.45,
    }));

    const draw = () => {
      if (this.shadowRoot.getElementById('rain-canvas') !== canvas) return; // stopt zodra dit niet meer de actuele canvas is (voorkomt opstapelende lussen)
      ctx.clearRect(0, 0, W, H);
      raindrops.forEach(d => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(180,210,255,${d.opacity.toFixed(2)})`;
        ctx.lineWidth = 1;
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 2, d.y + d.len);
        ctx.stroke();
        d.y += d.speed;
        d.x -= 0.8;
        if (d.y > H + d.len) { d.y = -d.len; d.x = Math.random() * W; }
        if (d.x < -10) { d.x = W + Math.random() * 50; }
      });
      this._rainAnimId = requestAnimationFrame(draw);
    };

    setTimeout(draw, 50);
  }
}

customElements.define('finally-skycard-customer', FinallySkyCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'finally-skycard-customer',
  name: 'Finally SkyCard', // v282
  description: 'Volledig schermvullend energiedashboard voor de boot Finally'
});


class FinallySkyCardMobile extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = {};
    this._lastUpdate = 0;
    this._waterHistory = [];
    this._historyLoaded = false;
    this._lastHistoryLoad = 0;
    this._energiePopupOpen = false;
    this._walLimitPopupOpen = false;
    this._walInstPopupOpen = false;
    this._walConfirmPopupOpen = false;
    this._genConfirmPopupOpen = false;
    this._walLimitVal = 16;
  }

  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    const now = Date.now();
    const mVerwPop = this.shadowRoot && this.shadowRoot.getElementById('m-verw-popup');
    if (mVerwPop && mVerwPop.style.display === 'flex') return;
    if (this._walInstPopupOpen) return;
    // Render niet als energie-popup open is (voorkomt scroll-reset)
    if (this._energiePopupOpen) return;
    // Render niet als generator-dieselkosten-instellingen open is (zelfde reden)
    if (this._genKostenPopupOpen) return;
    if (now - this._lastUpdate > 2000) {
      this._lastUpdate = now;
      this._render();
    }
    if (!this._historyLoaded || now - this._lastHistoryLoad > 600000) {
      this._lastHistoryLoad = now;
      this._historyLoaded = true;
      this._loadWaterHistory();
      this._loadWaterForecast();
    }
  }

  async _loadWaterHistory() {
    if (!this._hass) return;
    try {
      const end = new Date();
      const start = new Date(end - 24 * 3600 * 1000);
      const result = await this._hass.callApi('GET',
        'history/period/' + start.toISOString() + '?filter_entity_id=sensor.hasselt_zwarte_water_waterhoogte&end_time=' + end.toISOString() + '&minimal_response=true'
      );
      if (result && result[0]) {
        this._waterHistory = result[0]
          .filter(s => s.state !== 'unavailable' && s.state !== 'unknown')
          .map(s => ({ t: new Date(s.last_changed).getTime(), v: parseFloat(s.state) }))
          .filter(s => !isNaN(s.v));
        this._render();
      }
    } catch(e) { console.warn('Finally Mobile: waterhistorie laden mislukt', e); }
  }

  _loadWaterForecast() {
    const waterhoogteVerwachtEntity = (this._config && this._config.waterhoogte_verwacht_entity) || 'sensor.hasselt_zwarte_water_waterhoogte_verwacht';
    if (!this._hass) return;
    try {
      const fc = this._hass.states[waterhoogteVerwachtEntity]?.attributes?.Forecast;
      if (Array.isArray(fc) && fc.length) {
        this._waterForecast = fc
          .map(p => ({ t: new Date(p.Time).getTime(), v: parseFloat(p.Value) }))
          .filter(p => !isNaN(p.v) && !isNaN(p.t));
        this._render();
      }
    } catch(e) { console.warn('Finally Mobile: waterprognose laden mislukt', e); }
  }

  _waterSparkline(w, h) {
    if (!this._waterHistory || this._waterHistory.length < 2) return '';
    const hist = this._waterHistory;
    const fc   = (this._waterForecast && this._waterForecast.length) ? this._waterForecast : [];
    const all  = hist.concat(fc);
    const vals = all.map(d => d.v);
    const times = all.map(d => d.t);
    const minV = Math.min(...vals) - 1, maxV = Math.max(...vals) + 1;
    const minT = Math.min(...times), maxT = Math.max(...times);
    const rng = maxV - minV || 1;
    const px = t => ((t - minT) / (maxT - minT || 1)) * (w - 4) + 2;
    const py = v => h - 4 - ((v - minV) / rng) * (h - 8);
    const histPts = hist.map(d => px(d.t).toFixed(1) + ',' + py(d.v).toFixed(1)).join(' ');
    const cur = hist[hist.length - 1].v;
    const lineColor = cur > 0 ? '#00aaff' : cur > -20 ? '#ffa500' : '#ff4444';
    const fcPts = fc.length
      ? [px(hist[hist.length-1].t).toFixed(1) + ',' + py(cur).toFixed(1)].concat(fc.map(d => px(d.t).toFixed(1) + ',' + py(d.v).toFixed(1))).join(' ')
      : '';
    return '<polyline points="' + histPts + '" fill="none" stroke="' + lineColor + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'
         + (fcPts ? '<polyline points="' + fcPts + '" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.6" stroke-dasharray="3 2" stroke-linejoin="round" stroke-linecap="round"/>' : '')
         + '<circle cx="' + px(hist[hist.length-1].t).toFixed(1) + '" cy="' + py(cur).toFixed(1) + '" r="3" fill="' + lineColor + '"/>';
  }

  _s(e) { try { return parseFloat(this._hass.states[e]?.state) || 0; } catch(x) { return 0; } }
  _hasEntity(e) { return !!(this._hass && this._hass.states && this._hass.states[e]); }
  _st(e) { try { return this._hass.states[e]?.state || '--'; } catch(x) { return '--'; } }
  _attr(e, a) { try { return this._hass.states[e]?.attributes[a] ?? '--'; } catch(x) { return '--'; } }
  _zt(e) {
    try {
      const v = this._hass.states[e]?.state;
      return v ? new Date(v).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : '--:--';
    } catch(x) { return '--:--'; }
  }

  _socColor(soc) { return soc > 35 ? '#00cc66' : soc > 30 ? '#ffa500' : '#ff4444'; }
  _deltaColor(d) { return d < 0.010 ? '#00ff88' : d < 0.020 ? '#ffd700' : '#ff4444'; }

  _render() {
    // BMS entity-prefix (configureerbaar; fallback is Eriks eigen OUDE Batmon-naamgeving van vóór de rename
    // van juni 2026 — nieuwe klantinstallaties moeten dit expliciet instellen, zie _detectBMS() in de wizard)
    const bms1Prefix = (this._config && this._config.bms1_entity_prefix) || 'jk_bms_1_jk_bms_1';
    const bms2Prefix = (this._config && this._config.bms2_entity_prefix) || 'jk_bms_2_jk_bms_2';
    const bms1CellMinEntity = (this._config && this._config.bms1_cell_min_entity) || ('sensor.' + bms1Prefix + '_cell_volt_min');
    const bms1CellMaxEntity = (this._config && this._config.bms1_cell_max_entity) || ('sensor.' + bms1Prefix + '_cell_volt_max');
    const bms1SocEntity = (this._config && this._config.bms1_soc_entity) || ('sensor.' + bms1Prefix + '_soc');
    const bms1CyclesEntity = (this._config && this._config.bms1_cycles_entity) || ('sensor.' + bms1Prefix + '_num_cycles');
    const bms1MosTempEntity = (this._config && this._config.bms1_mos_temp_entity) || ('sensor.' + bms1Prefix + '_mos_temperature');
    const bms2CellMinEntity = (this._config && this._config.bms2_cell_min_entity) || ('sensor.' + bms2Prefix + '_cell_volt_min');
    const bms2CellMaxEntity = (this._config && this._config.bms2_cell_max_entity) || ('sensor.' + bms2Prefix + '_cell_volt_max');
    const bms2SocEntity = (this._config && this._config.bms2_soc_entity) || ('sensor.' + bms2Prefix + '_soc');
    const bms2CyclesEntity = (this._config && this._config.bms2_cycles_entity) || ('sensor.' + bms2Prefix + '_num_cycles');
    const bms2MosTempEntity = (this._config && this._config.bms2_mos_temp_entity) || ('sensor.' + bms2Prefix + '_mos_temperature');
    const bms1TempNetjesEntity = (this._config && this._config.bms1_temp_netjes_entity) || 'sensor.bms1_temperatuur_netjes';
    const bms2TempNetjesEntity = (this._config && this._config.bms2_temp_netjes_entity) || 'sensor.bms2_temperatuur_netjes';
    const indoorHumidityEntity = (this._config && this._config.indoor_humidity_entity) || 'sensor.ewelink_snzb_02p_luchtvochtigheid';
    const heatingClimateEntity = (this._config && this._config.heating_climate_entity) || 'climate.verwarming_boot';
    const douchepompSwitchEntity = (this._config && this._config.douchepomp_switch_entity) || 'switch.shellyplus1_78ee4cc39480';
    const waterhoogteEntity = (this._config && this._config.waterhoogte_entity) || 'sensor.hasselt_zwarte_water_waterhoogte';
    const waterhoogteVerwachtEntity = (this._config && this._config.waterhoogte_verwacht_entity) || 'sensor.hasselt_zwarte_water_waterhoogte_verwacht';
    // Watertank (configureerbaar; geen betrouwbare universele default — ongeconfigureerd blijft de tegel '—')
    const watertankLevelEntity = this._config && this._config.watertank_level_entity;
    const watertankCapacityL = this._config && this._config.watertank_capacity_l;
    const watertankPct = watertankLevelEntity ? s(watertankLevelEntity) : null;
    const watertankTxt = watertankPct == null ? '—' :
      watertankPct.toFixed(0) + '%' + (watertankCapacityL ? ' (' + Math.round(watertankPct/100*watertankCapacityL) + ' L)' : '');
    const weerTekstEntity = (this._config && this._config.weer_tekst_entity) || 'sensor.knmi_tekst';
    const weerCodeEntity = (this._config && this._config.weer_code_entity) || 'sensor.knmi_weercode';
    const sunNextRisingEntity = (this._config && this._config.sun_next_rising_entity) || 'sensor.sun_next_rising';
    const sunNextSettingEntity = (this._config && this._config.sun_next_setting_entity) || 'sensor.sun_next_setting';
    const walstroomSocAanEntity = (this._config && this._config.walstroom_soc_aan_entity) || 'input_number.walstroom_soc_aan';
    const walstroomSocUitEntity = (this._config && this._config.walstroom_soc_uit_entity) || 'input_number.walstroom_soc_uit';
    const walstroomZonDrempelEntity = (this._config && this._config.walstroom_zon_drempel_entity) || 'input_number.walstroom_zon_drempel';
    const walstroomKwhPrijsEntity = (this._config && this._config.walstroom_kwh_prijs_entity) || null;
    const walstroomOvlAanEntity = (this._config && this._config.walstroom_overbelasting_aan_entity) || 'input_number.walstroom_overbelasting_aan';
    const walstroomOvlUitEntity = (this._config && this._config.walstroom_overbelasting_uit_entity) || 'input_number.walstroom_overbelasting_uit';
    const walstroomOvlAanDuurEntity = (this._config && this._config.walstroom_overbelasting_aan_duur_entity) || 'input_number.walstroom_overbelasting_aan_duur';
    const walstroomOvlUitDuurEntity = (this._config && this._config.walstroom_overbelasting_uit_duur_entity) || 'input_number.walstroom_overbelasting_uit_duur';
    if (!this.shadowRoot) return;
    const hass = this._hass;
    if (!hass) {
      this.shadowRoot.innerHTML = '<div style="padding:24px;color:#fff;font-family:sans-serif;background:#050e1a;min-height:100vh">Laden...</div>';
      return;
    }

    const s  = this._s.bind(this);
    const st = this._st.bind(this);

    // ── MPPT / Quattro (configureerbaar, valt terug op Eriks eigen serienummers) ──
    const mpptStateEntity = (this._config && this._config.mppt_state_entity) || 'sensor.smartsolar_mppt_ve_can_150_85_rev2_id_279_state';
    const mpptYieldYesterdayEntity = (this._config && this._config.mppt_yield_yesterday_entity) || 'sensor.smartsolar_mppt_ve_can_150_85_rev2_id_279_yield_yesterday';
    const mpptMaxPowerTodayEntity = (this._config && this._config.mppt_max_power_today_entity) || 'sensor.smartsolar_mppt_ve_can_150_85_rev2_id_279_max_power_today';
    const quattroDcVoltageEntity = (this._config && this._config.quattro_dc_voltage_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_dc_voltage';
    const quattroHighTempAlarmEntity = (this._config && this._config.quattro_high_temp_alarm_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_high_temperature_alarm';
    const quattroInputPowerL1Entity = (this._config && this._config.quattro_input_power_l1_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_input_power_l1';
    const quattroInputVoltageL1Entity = (this._config && this._config.quattro_input_voltage_l1_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_input_voltage_l1';
    const quattroLowBatteryAlarmEntity = (this._config && this._config.quattro_low_battery_alarm_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_low_battery_alarm';
    const quattroOutputFrequencyL1Entity = (this._config && this._config.quattro_output_frequency_l1_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_output_frequency_l1';
    const quattroOutputPowerL1Entity = (this._config && this._config.quattro_output_power_l1_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_output_power_l1';
    const quattroOutputVoltageL1Entity = (this._config && this._config.quattro_output_voltage_l1_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_output_voltage_l1';
    const quattroOverloadAlarmEntity = (this._config && this._config.quattro_overload_alarm_entity) || 'sensor.quattro_24_5000_120_2x100_id_276_overload_alarm';

    // ── Energie ──
    const pvW       = s('sensor.gx_device_pv_power');
    const loadW     = s('sensor.gx_device_consumption_power_l1');
    const loadKleur  = loadW >= 4500 ? '#ff2222' : loadW >= 3000 ? '#ff6600' : loadW > 1500 ? '#ff4444' : loadW > 800 ? '#ffa500' : '#00cc66';
    const loadAlarm  = loadW >= 4500;
    const gridW     = s(quattroInputPowerL1Entity);
    const battPow   = s('sensor.gx_device_dc_battery_power');
    const socEntity  = (this._config && this._config.smartshunt_soc_entity) || 'sensor.smartshunt_hq2224ru6gc_batterij';
    const voltEntity = (this._config && this._config.smartshunt_voltage_entity) || 'sensor.smartshunt_hq2224ru6gc_spanning';
    const currEntity = (this._config && this._config.smartshunt_current_entity) || 'sensor.smartshunt_hq2224ru6gc_stroom';
    const battChar  = s(currEntity) > 0;

    // ── Accu ──
    const battSoc   = s(socEntity);
    const battV     = s(voltEntity).toFixed(2);
    const battVGeneric = s('sensor.gx_device_dc_battery_voltage').toFixed(2);
    const battA     = s(currEntity).toFixed(1);
    // Accu-capaciteit (configureerbaar; zonder deze twee velden valt de kaart terug op Eriks eigen Template Helpers)
    const battCapacityWh = this._config && this._config.battery_capacity_wh;
    const battMinSocPct = this._config && this._config.battery_min_soc_pct;
    const _battPowM  = s('sensor.gx_device_dc_battery_power');
    let battWh, battDuur;
    const timeToGoEntity = (this._config && this._config.time_to_go_entity) || null;
    const _ttgRawM = timeToGoEntity ? parseFloat(this._hass?.states[timeToGoEntity]?.state) : NaN;
    if (timeToGoEntity && Number.isFinite(_ttgRawM)) {
      battDuur = (_ttgRawM / 3600).toFixed(1);
      battWh = (battCapacityWh && battMinSocPct != null)
        ? Math.max(0, battCapacityWh * (battSoc - battMinSocPct) / 100).toFixed(0)
        : (this._hasEntity('sensor.accu_beschikbaar_wh') ? s('sensor.accu_beschikbaar_wh').toFixed(0) : '--');
    } else if (timeToGoEntity && this._hasEntity(timeToGoEntity)) {
      battDuur = '--';
      battWh = (battCapacityWh && battMinSocPct != null)
        ? Math.max(0, battCapacityWh * (battSoc - battMinSocPct) / 100).toFixed(0)
        : (this._hasEntity('sensor.accu_beschikbaar_wh') ? s('sensor.accu_beschikbaar_wh').toFixed(0) : '--');
    } else if (battCapacityWh && battMinSocPct != null) {
      const _usableWhM = Math.max(0, battCapacityWh * (battSoc - battMinSocPct) / 100);
      battWh = _usableWhM.toFixed(0);
      battDuur = _battPowM < -20 ? (_usableWhM / Math.abs(_battPowM)).toFixed(1) : '--';
    } else {
      battWh = s('sensor.accu_beschikbaar_wh').toFixed(0);
      const _soc30whM = s('sensor.accu_beschikbaar_wh') * 0.70;
      battDuur = _battPowM < -20 ? (_soc30whM / Math.abs(_battPowM)).toFixed(1) : s('sensor.verwachte_accuduur').toFixed(1);
    }
    const socColor  = this._socColor(battSoc);

    // ── BMS ──
    const bms1Soc   = s(bms1SocEntity);
    const bms1Min   = s(bms1CellMinEntity).toFixed(3);
    const bms1Max   = s(bms1CellMaxEntity).toFixed(3);
    const bms1Delta = (s(bms1CellMaxEntity) - s(bms1CellMinEntity)).toFixed(3);
    const bms1Temp  = s(bms1TempNetjesEntity).toFixed(1);
    const bms1MosT  = s(bms1MosTempEntity).toFixed(1);
    const bms1Cycli = s(bms1CyclesEntity);

    const bms2Soc   = s(bms2SocEntity);
    const bms2Min   = s(bms2CellMinEntity).toFixed(3);
    const bms2Max   = s(bms2CellMaxEntity).toFixed(3);
    const bms2Delta = (s(bms2CellMaxEntity) - s(bms2CellMinEntity)).toFixed(3);
    const bms2Temp  = s(bms2TempNetjesEntity).toFixed(1);
    const bms2MosT  = s(bms2MosTempEntity).toFixed(1);
    const bms2Cycli = s(bms2CyclesEntity);

    // ── PV ──
    // PV-opbrengst (configureerbaar, valt terug op Eriks eigen Template Helpers)
    const pvVandaagEntity = (this._config && this._config.pv_vandaag_entity) || 'sensor.solar_yield_vandaag';
    const pvMaandEntity = (this._config && this._config.pv_maand_entity) || 'sensor.solar_yield_maand';
    const pvVandaag  = s(pvVandaagEntity).toFixed(2);
    const pvGisteren = s(mpptYieldYesterdayEntity).toFixed(2);
    const pvMaand    = s(pvMaandEntity).toFixed(1);
    const pvMax      = 1800;
    const pvPct      = Math.min(pvW / pvMax * 100, 100);
    const mpptState  = st(mpptStateEntity);
    const _kwhPrijsM = walstroomKwhPrijsEntity ? (parseFloat(this._hass?.states[walstroomKwhPrijsEntity]?.state) || 0.50) : 0.50;
    const pvBesparing = (parseFloat(pvMaand) * _kwhPrijsM).toFixed(2);
    // Walstroom-verbruik (configureerbaar, valt terug op Eriks eigen Shelly-sensoren)
    const walstroomDagverbruikEntity = (this._config && this._config.walstroom_dagverbruik_entity) || 'sensor.walstroom_dagverbruik';
    const walstroomVerbruikMaandEntity = (this._config && this._config.walstroom_verbruik_maand_entity) || 'sensor.walstroom_verbruik_maand';
    const walstroomVerbruikWattEntity = (this._config && this._config.walstroom_verbruik_watt_entity) || 'sensor.walstroom_verbruik_watt';
    const walDag     = s(walstroomDagverbruikEntity).toFixed(2);
    const walMaand   = s(walstroomVerbruikMaandEntity).toFixed(2);
    const walKosten  = (parseFloat(walMaand) * _kwhPrijsM).toFixed(2);
    const loadDagEntity = (this._config && this._config.load_dag_entity) || 'sensor.gx_device_ac_uitgang_dagverbruik';
    const loadMaandEntity = (this._config && this._config.load_maand_entity) || 'sensor.gx_device_quattro_uitgang_maandoverzicht';
    const loadDag    = s(loadDagEntity).toFixed(2);
    const loadMaand  = s(loadMaandEntity).toFixed(1);
    const acInputLimit = s('number.gx_device_ac_input_limit').toFixed(0);

    // ── Quattro ──
    const acV     = s(quattroOutputVoltageL1Entity).toFixed(0);
    const acHz    = s(quattroOutputFrequencyL1Entity).toFixed(1);
    const acOutW  = s(quattroOutputPowerL1Entity).toFixed(0);
    const dcV     = s(quattroDcVoltageEntity).toFixed(1);
    const acInV   = s(quattroInputVoltageL1Entity).toFixed(0);
    const sysState = st('sensor.gx_device_system_state');
    const ok = ['ok','Ok','0','','false','no alarm','No alarm','No Alarm','no_alarm'];
    const alarmTemp = st(quattroHighTempAlarmEntity);
    const alarmOver = st(quattroOverloadAlarmEntity);
    const alarmBatt = st(quattroLowBatteryAlarmEntity);
    const alarmsOk  = ok.includes(alarmTemp) && ok.includes(alarmOver) && ok.includes(alarmBatt);

    // Systeemmodus kleur
    const sl = sysState === 'inverting' ? 'OMVORMEN' : sysState === 'bulk' ? 'BULK LADEN' :
               sysState === 'absorption' ? 'ABSORPTIE' : sysState === 'float' ? 'FLOAT' :
               sysState === 'passthru' ? 'WALSTROOM' : sysState.toUpperCase();
    const sc = sysState.toLowerCase().includes('float') || sysState.toLowerCase().includes('bulk') || sysState.toLowerCase().includes('absorb')
      ? '#00ff88' : sysState.toLowerCase().includes('invert') ? '#00cc66' : '#aaaaff';

    // ── Klimaat ──
    const tempBinnen = '--';
    const showIndoorClimate = (this._config && this._config.show_indoor_climate) !== false;
    const showEngineRoomTemp = !!(this._config && this._config.engine_room_temp_entity);
    const engineRoomTempEntity = (this._config && this._config.engine_room_temp_entity) || '';
    const engineRoomFrostTemp = (this._config && this._config.engine_room_frost_temp) != null ? this._config.engine_room_frost_temp : 5;
    const engineRoomTemp = showEngineRoomTemp ? s(engineRoomTempEntity) : 0;
    const engineRoomFrostRisk = showEngineRoomTemp && engineRoomTemp <= engineRoomFrostTemp;
    const weatherEntity = (this._config && this._config.weather_entity) || 'weather.forecast_thuis';
    const wcond      = hass ? st(weatherEntity) : '--';
    const tempBuiten = hass ? (hass.states[weatherEntity]?.attributes?.temperature ?? '--') : '--';
    const _wAttr     = hass ? hass.states[weatherEntity]?.attributes : null;
    const vochtBuiten = _wAttr ? (_wAttr.humidity ?? '--') : '--';
    const windKmM    = _wAttr ? parseFloat(_wAttr.wind_speed ?? 0).toFixed(1) : '--';
    const _windBearM = _wAttr ? parseFloat(_wAttr.wind_bearing ?? 0) : 0;
    const _windDirsM = ['N','NNO','NO','ONO','O','OZO','ZO','ZZO','Z','ZZW','ZW','WZW','W','WNW','NW','NNW'];
    const windDirM   = _wAttr ? _windDirsM[Math.round(_windBearM / 22.5) % 16] : '--';
    const vocht      = this._hasEntity(indoorHumidityEntity) ? s(indoorHumidityEntity).toFixed(0) : '--';
    const windKm     = windKmM;
    const windDir    = windDirM;
    const windUnitMs = (this._config && this._config.wind_unit === 'ms');
    const windDisplay = windKm === '--' ? '--' : (windUnitMs ? (parseFloat(windKm) / 3.6).toFixed(1) : windKm);
    const windUnitLbl = windUnitMs ? 'm/s' : 'km/h';
    const windBft    = _wAttr ? (parseFloat(windKmM) < 1 ? 0 : parseFloat(windKmM) < 6 ? 1 : parseFloat(windKmM) < 12 ? 2 : parseFloat(windKmM) < 20 ? 3 : parseFloat(windKmM) < 29 ? 4 : parseFloat(windKmM) < 39 ? 5 : parseFloat(windKmM) < 50 ? 6 : parseFloat(windKmM) < 62 ? 7 : 8) : '--';
    const pressureEntity = (this._config && this._config.pressure_entity) || null;
    const _pressureAttr = pressureEntity ? this._hass?.states[pressureEntity]?.attributes?.pressure : null;
    const baro       = (_pressureAttr != null) ? Math.round(_pressureAttr) : (_wAttr && _wAttr.pressure != null) ? Math.round(_wAttr.pressure) : '--';
    const water      = s(waterhoogteEntity).toFixed(0);
    const waterVerw  = s(waterhoogteVerwachtEntity).toFixed(0);

    // ── Verwarming ──

    // ── Overig ──
    const generatorRunStateEntity = (this._config && this._config.generator_run_state_entity) || 'sensor.generator_start_stop_run_state';
    const generatorRuntimeTodayEntity = (this._config && this._config.generator_runtime_today_entity) || 'sensor.generator_start_stop_today_runtime';
    const generatorRuntimeTotalEntity = (this._config && this._config.generator_runtime_total_entity) || 'sensor.generator_start_stop_total_runtime';
    const generatorServiceCounterEntity = (this._config && this._config.generator_service_counter_entity) || 'sensor.generator_start_stop_service_counter';
    const genActive  = st(generatorRunStateEntity) === 'running';
    const genState   = st(generatorRunStateEntity);
    const generatorSwitchEntity = (this._config && this._config.generator_switch_entity) || 'switch.generator_start_stop_manual_start';
    const genManualOn    = st(generatorSwitchEntity);
    const genRuntimeToday = s(generatorRuntimeTodayEntity).toFixed(1);
    const genRuntimeTotal = s(generatorRuntimeTotalEntity).toFixed(0);
    const genVerbruikEntity = (this._config && this._config.generator_verbruik_entity) || 'input_number.generator_verbruik_lh';
    const genDieselPrijsEntity = (this._config && this._config.generator_diesel_prijs_entity) || 'input_number.generator_diesel_prijs';
    const genRuntimeMaandEntity = (this._config && this._config.generator_runtime_maand_entity) || 'sensor.generator_draaiuren_maand';
    const genVerbruik = s(genVerbruikEntity);
    const genDieselPrijs = s(genDieselPrijsEntity);
    const genRuntimeMaand = s(genRuntimeMaandEntity).toFixed(1);
    const genKostenMaand = (parseFloat(genRuntimeMaand) * genVerbruik * genDieselPrijs).toFixed(2);
    const genKostenVandaag = (parseFloat(genRuntimeToday) * genVerbruik * genDieselPrijs).toFixed(2);
    const genServiceCounter = s(generatorServiceCounterEntity).toFixed(0);
    const windEntity  = (this._config && this._config.wind_entity) || 'sensor.wind_vermogen';
    const windW       = s(windEntity).toFixed(0);
    const kabolaEntity      = (this._config && this._config.kabola_climate_entity) || 'climate.kabola';
    const kabolaState        = this._hass ? this._hass.states[kabolaEntity] : null;
    const kabolaActief       = kabolaState ? (kabolaState.state !== 'off' && kabolaState.state !== 'unavailable') : false;
    const kabolaDoelTemp     = kabolaState ? (kabolaState.attributes.temperature ?? '--') : '--';
    const kabolaHuidigeTemp  = kabolaState ? (kabolaState.attributes.current_temperature ?? '--') : '--';
    const gridActive  = s(quattroInputPowerL1Entity) > 20;
    const gridSpanning = parseFloat(acInV) > 100;
    const walstroomSwitchEntity = (this._config && this._config.walstroom_switch_entity) || 'switch.walstroom_socket_1';
    const walstroomOverrideEntity = (this._config && this._config.walstroom_override_entity) || 'input_boolean.walstroom_override';
    const walSocketAan = st(walstroomSwitchEntity) === 'on';
    const walOverride  = st(walstroomOverrideEntity) === 'on';
    const walstroomSpanningEntity = (this._config && this._config.walstroom_spanning_entity) || null;
    const walStandby = walstroomSpanningEntity ? (!walSocketAan && s(walstroomSpanningEntity) > 200) : false;
    const knmiCode   = st(weerCodeEntity);
    const walstroom  = s(walstroomVerbruikWattEntity).toFixed(0);

    // ── Zon ──
    const sunState = st('sun.sun');
    const sunAbove = sunState === 'above_horizon';
    const zonOp    = this._zt(sunNextRisingEntity);
    const zonOnd   = this._zt(sunNextSettingEntity);
    const sunElev  = parseFloat(this._attr('sun.sun', 'elevation')).toFixed(1);

    // ── Weer / forecast ──
    const knmiTekst    = st(weerTekstEntity);
    const windDeg      = _wAttr ? parseFloat(_wAttr.wind_bearing ?? 0) : 0;
    const windDirs     = ['N','NNO','NO','ONO','O','OZO','ZO','ZZO','Z','ZZW','ZW','WZW','W','WNW','NW','NNW'];
    const windKompas   = windDirs[Math.round(windDeg / 22.5) % 16];

    // Weer forecast uit Open-Meteo
    const wxState      = hass ? hass.states[weatherEntity] : null;
    const wxCurrent    = wxState ? wxState.state : '--';
    const wxTemp       = wxState && wxState.attributes.temperature != null ? wxState.attributes.temperature : '--';
    const wxForecast   = (wxState && wxState.attributes.forecast) || [];

    // Weer icoon mapping
    const wxIcon = (condition) => {
      const map = {
        'sunny': '☀️', 'clear-night': '🌙', 'partlycloudy': '⛅', 'cloudy': '☁️',
        'rainy': '🌧️', 'pouring': '🌧️', 'snowy': '❄️', 'snowy-rainy': '🌨️',
        'windy': '💨', 'windy-variant': '🌬️', 'fog': '🌫️', 'hail': '🌨️',
        'lightning': '⚡', 'lightning-rainy': '⛈️', 'exceptional': '⚠️'
      };
      return map[condition] || '🌡️';
    };

    // Watertank gauge

    // Gasfles

    // ── Tijd ──
    const nu    = new Date();
    const tijd  = nu.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    const datum = nu.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });

    // ── Achtergrond ── (configureerbaar: background_folder, zie toelichting bij FinallySkyCard)
    const backgroundFolderM = (this._config && this._config.background_folder) || '/local/finally-card/';
    const foregroundImageM = (this._config && this._config.foreground_image) || 'boot.png';
    const skyImg  = finallySkyImagePath(wcond, parseFloat(sunElev), new Date().getHours(), backgroundFolderM);


    // ── Sparkline ──
    const sparkSvg = this._waterSparkline(120, 36);

    // ── Cel voltages BMS ──
    const celRow = (bms, prefix) => {
      let html = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:8px">';
      for (let i = 1; i <= 8; i++) {
        const cv = s('sensor.' + prefix + '_cell_volt_' + i);
        const clr = cv === 0 ? 'rgba(255,255,255,0.3)' : cv < 3.25 ? '#ff4444' : cv < 3.30 ? '#ffa500' : '#00cc66';
        const bg  = cv === 0 ? 'rgba(255,255,255,0.03)' : cv < 3.25 ? 'rgba(255,60,60,0.15)' : cv < 3.30 ? 'rgba(255,200,0,0.12)' : 'rgba(0,200,80,0.10)';
        html += '<div style="background:' + bg + ';border-radius:6px;padding:5px 2px;text-align:center">'
              + '<div style="font-size:9px;color:rgba(255,255,255,0.95);margin-bottom:2px">C' + i + '</div>'
              + '<div style="font-size:12px;font-weight:700;color:' + clr + '">' + (cv > 0 ? cv.toFixed(3) : '--') + '</div>'
              + '</div>';
      }
      html += '</div>';
      return html;
    };

    this.shadowRoot.innerHTML = `
<style>
  :host {
    display: block;
    --hero-height: ${(this._config && this._config.hero_height) || 220}px;
    font-family: 'Segoe UI', system-ui, sans-serif;
    background: #050e1a;
    min-height: 100vh;
    color: #fff;
    -webkit-tap-highlight-color: transparent;
    overflow-x: hidden;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .page {
    background: #050e1a;
    min-height: 100vh;
    padding-bottom: 16px;
    overflow-x: hidden;
  }

  /* ── Hero header met achtergrond ── */
  .hero {
    position: relative;
    width: 100%;
    height: var(--hero-height, 220px);
    overflow: hidden;
  }
  .hero-bg {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: center 30%;
  }
  .hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, rgba(5,14,26,0.1) 0%, rgba(5,14,26,0.75) 100%);
  }
  .hero-content {
    position: relative; z-index: 2;
    padding: 16px 16px 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .hero-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .tijd-groot {
    font-size: 38px;
    font-weight: 800;
    letter-spacing: 2px;
    line-height: 1;
    color: #fff;
  }
  .datum-sub {
    font-size: 14px;
    color: rgba(255,255,255,0.95);
    text-transform: capitalize;
    margin-top: 2px;
  }
  .hero-modus {
    text-align: right;
  }
  .hero-bottom {
    padding-bottom: 14px;
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }
  .hero-soc {
    flex: 1;
  }
  .soc-getal {
    font-size: 44px;
    font-weight: 800;
    line-height: 1;
  }
  .soc-lbl {
    font-size: 11px;
    letter-spacing: 2px;
    color: rgba(255,255,255,0.95);
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .soc-bar {
    height: 5px;
    background: rgba(255,255,255,0.1);
    border-radius: 3px;
    overflow: hidden;
    margin-top: 6px;
  }
  .soc-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 1s ease;
  }
  .hero-pv {
    text-align: right;
    padding-bottom: 4px;
  }

  /* ── Secties ── */
  .section {
    margin: 12px 12px 0;
  }
  .section-title {
    font-size: 10px;
    letter-spacing: 2.5px;
    color: rgba(255,255,255,0.95);
    text-transform: uppercase;
    margin-bottom: 8px;
    padding-left: 2px;
  }

  /* ── Kaartjes ── */
  .card {
    background: rgba(255,255,255,0.04);
    border: 0.5px solid rgba(100,170,255,0.15);
    border-radius: 14px;
    padding: 14px 16px;
    margin-bottom: 8px;
  }
  .card-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 8px;
  }
  .card-grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 6px;
    margin-bottom: 8px;
    min-width: 0;
  }
  .mini-card {
    background: rgba(255,255,255,0.04);
    border: 0.5px solid rgba(100,170,255,0.12);
    border-radius: 12px;
    min-width: 0;
    overflow: hidden;
    padding: 12px 14px;
  }
  .lbl {
    font-size: 10px;
    color: rgba(255,255,255,0.95);
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .val-lg {
    font-size: 26px;
    font-weight: 700;
    line-height: 1;
  }
  .val-md {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.1;
  }
  .val-sm {
    font-size: 15px;
    font-weight: 700;
  }
  .sub {
    font-size: 12px;
    color: rgba(255,255,255,0.95);
    margin-top: 3px;
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 0.5px solid rgba(255,255,255,0.06);
    font-size: 14px;
  }
  .row:last-child { border-bottom: none; }
  .row-lbl { color: rgba(255,255,255,0.95); }
  .row-val { font-weight: 600; }
  .bar-wrap {
    height: 7px;
    background: rgba(255,255,255,0.08);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 8px;
  }
  .bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 1s ease;
  }

  /* ── Energie flow ── */
  .flow-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr auto 1fr;
    gap: 0;
    align-items: center;
    margin-bottom: 8px;
  }
  .flow-node {
    background: rgba(255,255,255,0.05);
    border-radius: 10px;
    padding: 10px 8px;
    text-align: center;
  }
  .flow-arrow {
    text-align: center;
    font-size: 18px;
    color: rgba(255,255,255,0.95);
    padding: 0 4px;
  }
  .flow-arrow.active { color: rgba(255,255,255,0.95); }

  /* ── Dot indicators ── */
  .dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    display: inline-block;
  }

  /* ── Touch knoppen ── */
  .touch-btn {
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    border-radius: 12px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.04);
    border: 0.5px solid rgba(100,170,255,0.2);
    text-align: center;
    transition: background 0.15s;
  }
  .touch-btn:active {
    background: rgba(100,170,255,0.15);
  }

  /* ── BMS kleur ── */
  .bms1-accent { color: rgba(0,255,136,0.8); }
  .bms2-accent { color: rgba(0,170,255,0.8); }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .pulsing { animation: pulse 2s ease-in-out infinite; }
</style>

<div class="page">

  <!-- ══ HERO ══ -->
  <div class="hero">
    <img class="hero-bg" src="${skyImg}"/>
    ${(this._config && this._config.boat_below_hero) ? '' : `
    <img src="${backgroundFolderM}${foregroundImageM}" style="position:absolute;bottom:${(this._config && this._config.hero_boat_bottom) || 20}%;left:50%;transform:translateX(-50%);width:${(this._config && this._config.hero_boat_size_pct) || 62}%;height:auto;pointer-events:none;z-index:1;opacity:0.95"/>
    `}
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <div class="hero-top">
        <div>
          <div class="tijd-groot">${tijd}</div>
          <div class="datum-sub">${datum}</div>
        </div>
        <div class="hero-modus">
          <div style="font-size:10px;color:rgba(255,255,255,0.95);letter-spacing:2px;margin-bottom:3px">MODUS</div>
          <div style="font-size:15px;font-weight:700;color:${sc}">${sl}</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.95);margin-top:2px">${acV} V · ${acHz} Hz</div>
          ${!alarmsOk ? '<div style="font-size:11px;color:#ff4444;margin-top:4px">⚠ ALARM</div>' : ''}
          ${knmiCode !== 'Groen' && knmiCode !== '--' ? '<div style="font-size:11px;font-weight:700;color:'+(knmiCode==='Rood'?'#ff6666':knmiCode==='Oranje'?'#ffaa44':'#ffee44')+';margin-top:2px">⚠ KNMI: ' + knmiCode + '</div>' : ''}
        </div>
      </div>
      <div class="hero-bottom">
        <div class="hero-soc">
          <div class="soc-lbl">TOTAAL SOC${(this._config && this._config.hide_battery_label) ? '' : ` · ${(this._config && this._config.battery_bank_label) || '628Ah LiFePO4'}`}</div>
          <div class="soc-getal" style="color:${socColor}">${battSoc.toFixed(1)}%</div>
          <div class="soc-bar">
            <div class="soc-bar-fill" style="width:${battSoc}%;background:${socColor}"></div>
          </div>
        </div>
        <div class="hero-pv">
          <div style="font-size:10px;color:rgba(255,200,0,0.5);letter-spacing:1px;margin-bottom:2px">ZON NU</div>
          <div style="font-size:22px;font-weight:800;color:#ffd700">${pvW} W</div>
          <div style="font-size:11px;color:rgba(255,200,0,0.5);margin-top:1px">${pvVandaag} kWh vandaag</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ══ BOOT AFBEELDING — optioneel los van hero (boat_below_hero:true), voor staande-formaat afbeeldingen die anders afgeknipt worden ══ -->
${(this._config && this._config.boat_below_hero) ? `
  <div style="text-align:center;margin:14px 0">
    <img src="${backgroundFolderM}${foregroundImageM}" style="width:${(this._config && this._config.mobile_boat_size_pct) || 70}%;height:auto;opacity:0.95"/>
  </div>
` : ''}

  <!-- ══ ENERGIE FLOW ══ -->
  <div class="section">
    <div class="section-title">Energie flow</div>
    <div class="card" style="padding:12px 14px">
      <div class="flow-row">
        <!-- Zon -->
        <div class="flow-node" style="border:0.5px solid ${pvW > 10 ? 'rgba(255,200,0,0.4)' : 'rgba(255,255,255,0.08)'}">
          <div style="font-size:18px">☀️</div>
          <div style="font-size:10px;color:rgba(255,200,0,0.6);letter-spacing:1px;margin:2px 0">ZON</div>
          <div style="font-size:15px;font-weight:700;color:${pvW > 10 ? '#ffd700' : 'rgba(255,255,255,0.25)'}">${pvW} W</div>
        </div>
        <!-- Pijl zon→boot -->
        <div class="flow-arrow ${pvW > 10 ? 'active' : ''}" style="color:${pvW > 10 ? '#ffd700' : 'rgba(255,255,255,0.12)'}">→</div>
        <!-- Boot (load) -->
        <div class="flow-node" style="border:0.5px solid rgba(255,100,50,0.3)">
          <div style="font-size:18px">⚓</div>
          <div style="font-size:10px;color:rgba(255,100,50,0.6);letter-spacing:1px;margin:2px 0">GEBRUIK NU</div>
          <div style="font-size:15px;font-weight:700;color:${loadKleur}${loadAlarm?';animation:pulse 0.6s ease-in-out infinite':''}">${loadW}${loadAlarm?' ⚠':''} W</div>
        </div>
        <!-- Pijl boot↔accu -->
        <div class="flow-arrow ${Math.abs(battPow) > 10 ? 'active' : ''}" style="color:${battChar ? '#00ff88' : '#ff9900'}">
          ${battChar ? '←' : '→'}
        </div>
        <!-- Accu -->
        <div class="flow-node" style="border:0.5px solid ${battChar ? 'rgba(0,255,136,0.4)' : battPow < -10 ? 'rgba(255,150,0,0.4)' : socColor+'44'}">
          <div style="font-size:18px">${battChar ? '🔋' : '🪫'}</div>
          <div style="font-size:10px;color:${battChar ? 'rgba(0,255,136,0.6)' : battPow < -10 ? 'rgba(255,150,0,0.6)' : 'rgba(100,200,255,0.6)'};letter-spacing:1px;margin:2px 0">${battChar ? '▲ LADEN' : battPow < -10 ? '▼ ONTLADEN' : 'ACCU'}</div>
          <div style="font-size:15px;font-weight:700;color:${battChar ? '#00ff88' : battPow < -10 ? '#ff9900' : socColor}">${battChar || battPow < -10 ? Math.abs(battPow).toFixed(0)+' W' : Math.round(battSoc)+'%'}</div>
        </div>
      </div>
      <!-- Walstroom -->
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0 0;border-top:0.5px solid rgba(255,255,255,0.06)">
        <span class="dot" style="background:${gridActive ? '#00aaff' : (gridSpanning || walStandby) ? '#ffaa00' : 'rgba(255,255,255,0.15)'};${gridActive ? 'box-shadow:0 0 6px #00aaff' : (gridSpanning || walStandby) ? 'box-shadow:0 0 6px #ffaa00' : ''}"></span>
        <span style="font-size:13px;color:rgba(255,255,255,0.95)">WALSTROOM</span>
        <span style="font-size:15px;font-weight:700;color:${gridActive ? '#00aaff' : (gridSpanning || walStandby) ? '#ffaa00' : 'rgba(255,255,255,0.2)'};margin-left:auto">${gridActive ? gridW + ' W · ' + acInV + ' V' : gridSpanning ? acInV + ' V · stand-by' : walStandby ? 'stand-by (socket uit)' : 'niet aangesloten'}</span>
      </div>
    </div>
  </div>

  <!-- ══ ENERGIE TEGEL ══ -->
  <div class="section">
    <div class="section-title">Energie</div>
    <div class="card" id="m-energie-tegel" data-action="energie-popup" style="cursor:pointer;border-color:rgba(255,200,0,0.25);background:rgba(40,30,0,0.35)">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:11px;color:rgba(255,200,0,0.5);letter-spacing:1px">ZON BESPARING</div>
          <div style="font-size:22px;font-weight:800;color:#ffd700">€ ${pvBesparing}</div>
          <div style="font-size:12px;color:rgba(255,200,0,0.4)">deze maand</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:rgba(0,170,255,0.5);letter-spacing:1px">WALSTROOM KOSTEN</div>
          <div style="font-size:22px;font-weight:800;color:#00aaff">€ ${walKosten}</div>
          <div style="font-size:12px;color:rgba(0,170,255,0.4)">deze maand</div>
        </div>
      </div>
      <div style="font-size:11px;color:rgba(255,255,255,0.95);text-align:center;margin-top:8px">tik voor details ›</div>
    </div>
  </div>

  <!-- ══ ACCU DETAILS ══ -->
  <div class="section">
    <div class="section-title">Accubank</div>
    <div class="card-grid">
      ${(this._config && this._config.show_battery_voltage) ? `
      <div class="mini-card">
        <div class="lbl">Accuspanning</div>
        <div class="val-lg" style="color:${battChar ? '#00cc66' : '#ffa500'}">${battVGeneric} V</div>
        <div class="sub">DC bus</div>
      </div>
      ` : ''}
      <div class="mini-card">
        <div class="lbl">Spanning</div>
        <div class="val-lg" style="color:#aaffcc">${battV} V</div>
        <div class="sub">DC bus</div>
      </div>
      <div class="mini-card">
        <div class="lbl">Stroom</div>
        <div class="val-lg" style="color:${battChar ? '#00ff88' : Math.abs(parseFloat(battA))<80?'#00cc66':Math.abs(parseFloat(battA))<120?'#ffa500':'#ff4444'}">${battChar ? '▲' : '▼'} ${Math.abs(parseFloat(battA))} A</div>
        <div class="sub">${battChar ? 'Laden' : 'Ontladen'}</div>
      </div>
      <div class="mini-card">
        <div class="lbl">Beschikbaar</div>
        <div class="val-md" style="color:#88ccff">${battWh} Wh</div>
      </div>
      <div class="mini-card">
        <div class="lbl">Resterende tijd</div>
        <div class="val-md" style="color:#aaffcc">${battDuur} uur te gaan</div>
      </div>
    </div>

    ${(this._config && this._config.hide_bms) ? '' : `
    <!-- BMS 1 -->
    <div class="card" style="border-color:rgba(0,255,136,0.2);margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:12px;font-weight:700;letter-spacing:1px" class="bms1-accent">BMS 1</div>
        <div style="font-size:18px;font-weight:800;color:${this._socColor(bms1Soc)}">${Math.round(bms1Soc)}%</div>
      </div>
      <div class="row"><span class="row-lbl">Min / Max cel</span><span class="row-val">${bms1Min} / ${bms1Max} V</span></div>
      <div class="row"><span class="row-lbl">Delta</span><span class="row-val" style="color:${this._deltaColor(parseFloat(bms1Delta))}">Δ ${bms1Delta} V</span></div>
      <div class="row"><span class="row-lbl">Temp / MOS</span><span class="row-val">${bms1Temp}° / ${bms1MosT}°C</span></div>
      <div class="row"><span class="row-lbl">Cycli</span><span class="row-val">${bms1Cycli}</span></div>
      ${celRow(1, bms1Prefix)}
    </div>

    <!-- BMS 2 -->
    <div class="card" style="border-color:rgba(0,170,255,0.2);margin-bottom:0">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:12px;font-weight:700;letter-spacing:1px" class="bms2-accent">BMS 2</div>
        <div style="font-size:18px;font-weight:800;color:${this._socColor(bms2Soc)}">${Math.round(bms2Soc)}%</div>
      </div>
      <div class="row"><span class="row-lbl">Min / Max cel</span><span class="row-val">${bms2Min} / ${bms2Max} V</span></div>
      <div class="row"><span class="row-lbl">Delta</span><span class="row-val" style="color:${this._deltaColor(parseFloat(bms2Delta))}">Δ ${bms2Delta} V</span></div>
      <div class="row"><span class="row-lbl">Temp / MOS</span><span class="row-val">${bms2Temp}° / ${bms2MosT}°C</span></div>
      <div class="row"><span class="row-lbl">Cycli</span><span class="row-val">${bms2Cycli}</span></div>
      ${celRow(2, bms2Prefix)}
    </div>
    `}
  </div>

  <!-- ══ ZONNEPANELEN ══ -->
  <div class="section">
    <div class="section-title">Zonnepanelen</div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div>
          <div class="lbl">Huidig vermogen</div>
          <div class="val-lg" style="color:#ffd700">${pvW} W</div>
        </div>
        <div style="text-align:right">
          <div class="lbl">MPPT staat</div>
          <div style="font-size:15px;font-weight:700;color:#00ff88">${mpptState}</div>
        </div>
      </div>
      <div class="bar-wrap">
        <div class="bar-fill" style="width:${pvPct.toFixed(1)}%;background:linear-gradient(90deg,#ff8800,#ffd700)"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px">
        <div style="text-align:center">
          <div class="lbl">Vandaag</div>
          <div class="val-sm" style="color:#ffd700">${pvVandaag} kWh</div>
        </div>
        <div style="text-align:center">
          <div class="lbl">Gisteren</div>
          <div class="val-sm" style="color:#ffaa44">${pvGisteren} kWh</div>
        </div>
        <div style="text-align:center">
          <div class="lbl">Maand</div>
          <div class="val-sm" style="color:#ff8800">${pvMaand} kWh</div>
        </div>
      </div>
      <div style="margin-top:10px;padding-top:8px;border-top:0.5px solid rgba(255,255,255,0.06);display:flex;justify-content:space-between">
        <div style="font-size:13px;color:rgba(255,200,0,0.6)">🌅 Op: ${zonOp}</div>
        <div style="font-size:13px;color:rgba(255,130,50,0.6)">🌇 Onder: ${zonOnd}</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.95)">Elev: ${sunElev}°</div>
      </div>
    </div>
  </div>


${(this._config && this._config.show_kabola) ? `
  <!-- ══ KABOLA VERWARMING ══ -->
  <div class="section">
    <div class="section-title">Kabola verwarming</div>
    <div class="card" id="m-kabola-toggle" style="cursor:pointer">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:18px;font-weight:800;color:${kabolaActief?'#ff8844':'rgba(255,255,255,0.3)'}">${kabolaActief?'AAN':'UIT'}</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.95)">Doel: ${kabolaDoelTemp}°C · Nu: ${kabolaHuidigeTemp}°C</div>
        </div>
        <div style="font-size:28px">🔥</div>
      </div>
    </div>
  </div>
` : ''}

  <!-- ══ WEER & OMGEVING ══ -->
  <div class="section">
    <div class="section-title">Weer & omgeving</div>

    <div class="card-grid-3">
      ${(showIndoorClimate && !(this._config && this._config.outdoor_climate)) ? `
      <div class="mini-card">
        <div class="lbl">Temp</div>
        <div class="val-lg" style="color:#ff8844">${tempBinnen}°C</div>
        <div class="sub">aan boord</div>
      </div>
      ` : ''}
      ${showIndoorClimate ? `
      <div class="mini-card">
        <div class="lbl">Vochtigheid</div>
        <div class="val-lg" style="color:#00ccff">${(this._config && this._config.outdoor_climate) ? vochtBuiten : vocht}%</div>
      </div>
      ` : ''}
      <div class="mini-card">
        <div class="lbl">Buiten</div>
        <div class="val-lg" style="color:#88ccff">${tempBuiten}°C</div>
        <div class="sub">${wcond !== '--' ? wcond : 'onbekend'}</div>
      </div>
      ${showEngineRoomTemp ? `
      <div class="mini-card" style="${engineRoomFrostRisk ? 'border-color:rgba(255,60,60,0.5);background:rgba(255,60,60,0.08)' : ''}">
        <div class="lbl">Machinekamer</div>
        <div class="val-lg" style="color:${engineRoomFrostRisk ? '#ff4444' : '#00cc66'}">${engineRoomTemp.toFixed(1)}°C</div>
        <div class="sub">${engineRoomFrostRisk ? '⚠️ Vorstrisico' : 'normaal'}</div>
      </div>
      ` : ''}
    </div>
    <div class="card" style="margin-bottom:8px">
      <div class="row"><span class="row-lbl">Wind</span><span class="row-val">${windDisplay} ${windUnitLbl} · ${windDir} · ${windBft} Bft</span></div>
      ${(this._config && this._config.dc_load_entity) ? `
      <div class="row">
        <span class="row-lbl">Verbruik 12V</span>
        <span class="row-val" style="color:#ffcc00">${s(this._config.dc_load_entity).toFixed(0)} W</span>
      </div>
      <div class="row">
        <span class="row-lbl">Verbruik 230V</span>
        <span class="row-val" style="color:#00d7ff">${(this._config.ac_load_entity ? s(this._config.ac_load_entity) : 0).toFixed(0)} W</span>
      </div>
      ` : ''}
      ${(this._config && this._config.hide_waterhoogte) ? '' : `
      <div class="row">
        <span class="row-lbl">Waterstand Hasselt</span>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="row-val" style="color:#00ccff">${water} cm <span style="font-size:0.7em;opacity:0.6">(verw. ${waterVerw})</span></span>
          <svg viewBox="0 0 120 36" style="width:80px;height:24px">${sparkSvg}</svg>
        </div>
      </div>
      `}
      ${(this._config && this._config.hide_watertank) ? '' : `
      <div class="row">
        <span class="row-lbl">Watertank</span>
        <div style="text-align:right">
<span class="row-val">${watertankTxt}</span>
        </div>
      </div>
      `}
    </div>

    <!-- KNMI waarschuwing conditioneel -->
    ${knmiCode !== 'Groen' && knmiCode !== '--' ? `
    <div class="card" style="border-color:${knmiCode==='Rood'?'rgba(255,80,80,0.5)':knmiCode==='Oranje'?'rgba(255,140,0,0.5)':'rgba(255,220,0,0.5)'};background:rgba(50,10,10,0.6);margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="font-size:28px">⚠️</div>
        <div>
          <div style="font-size:12px;font-weight:700;color:${knmiCode==='Rood'?'#ff6666':knmiCode==='Oranje'?'#ffaa44':'#ffee44'};letter-spacing:1px">KNMI CODE ${knmiCode}</div>
          <div style="font-size:13px;color:rgba(255,180,180,0.8);margin-top:2px;line-height:1.4">${knmiTekst}</div>
        </div>
      </div>
    </div>` : ''}

    <!-- Huidige condities -->
    <div class="card" style="margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div>
          <div style="font-size:36px">${wxIcon(wxCurrent)}</div>
          <div style="font-size:14px;color:rgba(255,255,255,0.95);margin-top:2px;text-transform:capitalize">${wxCurrent}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:38px;font-weight:700;color:#fff">${wxTemp}°</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.95)">buiten</div>
        </div>
      </div>
      <!-- Wind kompas + info -->
      <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-top:0.5px solid rgba(255,255,255,0.06);border-bottom:0.5px solid rgba(255,255,255,0.06);margin-bottom:8px">
        <!-- Kompas cirkel -->
        <div style="position:relative;width:52px;height:52px;flex-shrink:0">
          <svg viewBox="0 0 52 52" style="width:52px;height:52px">
            <circle cx="26" cy="26" r="24" fill="rgba(255,255,255,0.04)" stroke="rgba(100,170,255,0.2)" stroke-width="1"/>
            <text x="26" y="9" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="7" font-family="sans-serif">N</text>
            <text x="26" y="47" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="7" font-family="sans-serif">Z</text>
            <text x="8" y="29" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="7" font-family="sans-serif">W</text>
            <text x="44" y="29" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="7" font-family="sans-serif">O</text>
            <!-- Windpijl, roteer op windrichting + 180° (pijl wijst naar waar wind vandaan komt) -->
            <g transform="rotate(${windDeg}, 26, 26)">
              <polygon points="26,8 23,22 26,20 29,22" fill="#88ccff"/>
              <polygon points="26,44 23,30 26,32 29,30" fill="rgba(136,204,255,0.3)"/>
            </g>
          </svg>
        </div>
        <div style="flex:1">
          <div style="font-size:18px;font-weight:700;color:#88ccff">${windDisplay} ${windUnitLbl}</div>
          <div style="font-size:13px;color:rgba(136,204,255,0.7)">${windKompas} (${Math.round(windDeg)}°) · ${windBft} Bft</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:13px;color:rgba(255,255,255,0.95)">Luchtdruk</div>
          <div style="font-size:16px;font-weight:700;color:#aaaaff">${baro} hPa</div>
        </div>
      </div>

      ${(this._config && this._config.show_wind) ? `
      <div class="row" style="border-top:0.5px solid rgba(255,255,255,0.06);padding-top:8px;margin-top:8px">
        <span class="row-lbl">Windturbine vermogen</span>
        <span class="row-val" style="color:#96dcff">${windW} W</span>
      </div>
      ` : ''}

      <!-- 5-daagse forecast -->
      ${wxForecast.length > 0 ? `
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px">
        ${wxForecast.slice(0,5).map(day => {
          const d = new Date(day.datetime);
          const dagNaam = d.toLocaleDateString('nl-NL', {weekday:'short'});
          const ico = wxIcon(day.condition);
          const tHigh = day.temperature != null ? Math.round(day.temperature) : '--';
          const tLow  = day.templow != null ? Math.round(day.templow) : '--';
          return '<div style="text-align:center;background:rgba(255,255,255,0.03);border-radius:8px;padding:6px 2px">'
               + '<div style="font-size:10px;color:rgba(255,255,255,0.95);margin-bottom:3px">' + dagNaam + '</div>'
               + '<div style="font-size:20px">' + ico + '</div>'
               + '<div style="font-size:13px;font-weight:700;color:#fff;margin-top:3px">' + tHigh + '°</div>'
               + '<div style="font-size:11px;color:rgba(255,255,255,0.95)">' + tLow + '°</div>'
               + '</div>';
        }).join('')}
      </div>` : ''}
    </div>
  </div>


    <!-- ══ VERWARMING + SYSTEMEN ══ -->
  <div class="section">
    <div class="section-title">Systemen</div>
    ${(this._config && this._config.hide_douchepomp) ? '' : `
    <div class="card-grid">

      <!-- Douchepomp touchknop -->
      <div class="touch-btn" id="m-doucheknop" data-aan="${st(douchepompSwitchEntity) === 'on'}"
           style="border-color:rgba(0,200,255,${st(douchepompSwitchEntity) === 'on' ? '0.5' : '0.2'});background:${st(douchepompSwitchEntity) === 'on' ? 'rgba(0,200,255,0.12)' : 'rgba(255,255,255,0.04)'}">
        <div style="font-size:22px;margin-bottom:4px">🚿</div>
        <div class="lbl">DOUCHEPOMP</div>
        <div style="font-size:18px;font-weight:700;color:${st(douchepompSwitchEntity) === 'on' ? '#00ccff' : 'rgba(255,255,255,0.3)'}">${st(douchepompSwitchEntity) === 'on' ? '● AAN' : '○ UIT'}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.95);margin-top:4px">tik om te schakelen</div>
      </div>
    </div>
    `}
    <div class="card">
      <div class="row"><span class="row-lbl">Generator</span><span class="row-val" style="color:${genActive ? '#00ff88' : 'rgba(255,255,255,0.4)'}">${genActive ? '● Running' : '○ Gestopt'}</span></div>
      <div class="row"><span class="row-lbl">Quattro alarmen</span>
        <div style="display:flex;gap:6px;align-items:center">
          <span class="dot" style="background:${ok.includes(alarmTemp) ? 'rgba(0,255,136,0.6)' : '#ff4444'}"></span>
          <span style="font-size:11px;color:rgba(255,255,255,0.95)">Temp</span>
          <span class="dot" style="background:${ok.includes(alarmOver) ? 'rgba(0,255,136,0.6)' : '#ff4444'}"></span>
          <span style="font-size:11px;color:rgba(255,255,255,0.95)">Overl</span>
          <span class="dot" style="background:${battSoc>35?'#00cc66':battSoc>30?'#ffa500':'#ff4444'}"></span>
          <span style="font-size:11px;color:rgba(255,255,255,0.95)">Accu</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ══ WALSTROOM LIMIET ══ -->
  <div class="section">
    <div class="section-title">Walstroom</div>

    <!-- Socket schakelaar -->
    <div class="card-grid" style="margin-bottom:8px">
      <div class="touch-btn" id="m-wal-socket-btn"
           style="border-color:rgba(${walSocketAan?'0,255,136':(walStandby?'255,165,0':'255,255,255')},${walSocketAan?'0.5':(walStandby?'0.5':'0.2')});background:${walSocketAan?'rgba(0,255,136,0.12)':(walStandby?'rgba(255,165,0,0.12)':'rgba(255,255,255,0.04)')}">
        <div style="font-size:16px;font-weight:800;color:${gridActive?'#00aaff':(gridSpanning||walStandby)?'#ffaa00':'rgba(255,255,255,0.55)'}">
          ${gridActive ? gridW+' W' : (gridSpanning||walStandby) ? acInV+' V' : 'OFF-GRID'}
        </div>
        ${gridActive ? '<div style="color:#00aaff;font-size:12px;margin-bottom:4px">&#9679; AAN</div>' : (gridSpanning||walStandby) ? '<div style="color:#ffaa00;font-size:12px;margin-bottom:4px">&#9679; stand-by</div>' : '<div style="color:#00ff88;font-size:12px;margin-bottom:4px">&#9679; OFF-GRID</div>'}
        <div style="font-size:22px;margin-bottom:4px">🔌</div>
        <div class="lbl">WALSTROOM</div>
        <div style="font-size:20px;font-weight:700;color:${walSocketAan?'#00ff88':(walStandby?'#ffa500':'rgba(255,255,255,0.3)')}">${walSocketAan?'● WAL AAN':(walStandby?'◐ WAL STANDBY':'○ WAL UIT')}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.95);margin-top:4px">${walStandby ? 'spanning aanwezig, niet ingeschakeld' : 'tik om te schakelen'}</div>
      </div>
      <div class="touch-btn" id="m-wal-override-btn"
           style="border-color:rgba(255,165,0,${walOverride?'0.5':'0.2'});background:${walOverride?'rgba(255,165,0,0.12)':'rgba(255,255,255,0.04)'}">
        <div style="font-size:22px;margin-bottom:4px">${walOverride?'🔒':'🤖'}</div>
        <div class="lbl">${walOverride?'HANDMATIG':'AUTO'}</div>
        <div style="font-size:12px;color:${walOverride?'#ffaa44':'rgba(255,255,255,0.3)'};font-weight:700">${walOverride?'tik voor auto':'tik voor handmatig'}</div>
      </div>
    </div>

    <!-- Instellingen knop -->
    <div class="touch-btn" id="m-wal-inst-btn" style="margin-bottom:8px;border-color:rgba(255,255,255,0.95);background:rgba(255,255,255,0.03);text-align:center;padding:10px 16px">
      <span style="font-size:14px;color:rgba(255,255,255,0.95)">&#9881; Drempelwaarden instellen</span>
    </div>

    <div class="card" id="m-wal-limit-tegel" style="cursor:pointer;border-color:rgba(0,170,255,0.25);background:rgba(0,20,40,0.35)">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:11px;color:rgba(0,170,255,0.5);letter-spacing:1px">STROOMLIMIET</div>
          <div style="font-size:28px;font-weight:800;color:#00aaff">${acInputLimit} A</div>
        </div>
        <div style="font-size:32px;color:rgba(0,170,255,0.3)">⚡</div>
      </div>
      <div style="font-size:11px;color:rgba(255,255,255,0.95);text-align:center;margin-top:8px">tik om in te stellen ›</div>
    </div>
  </div>

${(this._config && this._config.show_generator) ? `
  <!-- ══ GENERATOR (AC-in-1) ══ -->
  <div class="section">
    <div class="section-title">Generator</div>

    <!-- Start/stop knop -->
    <div class="card-grid" style="margin-bottom:8px">
      <div class="touch-btn" id="m-gen-toggle" data-entity="${generatorSwitchEntity}"
           style="border-color:rgba(0,255,136,${genManualOn==='on'?'0.5':'0.2'});background:${genManualOn==='on'?'rgba(0,255,136,0.12)':'rgba(255,255,255,0.04)'}">
        <div style="font-size:22px;margin-bottom:4px">⚡</div>
        <div class="lbl">GENERATOR</div>
        <div style="font-size:20px;font-weight:700;color:${genManualOn==='on'?'#00ff88':'rgba(255,255,255,0.3)'}">${genManualOn==='on'?'● AAN':'○ UIT'}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.95);margin-top:4px">tik om te schakelen</div>
      </div>
      <div class="touch-btn" id="m-gen-kosten-btn"
           style="border-color:rgba(255,204,68,0.3);background:rgba(255,204,68,0.06)">
        <div style="font-size:22px;margin-bottom:4px">⛽</div>
        <div class="lbl">DIESELKOSTEN</div>
        <div style="font-size:20px;font-weight:700;color:#ffcc44">€ ${genKostenMaand}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.95);margin-top:4px">tik om in te stellen</div>
      </div>
    </div>

    <!-- Info -->
    <div class="card">
      <div style="font-size:18px;font-weight:800;color:${genActive?'#00ff88':'rgba(255,255,255,0.3)'};margin-bottom:2px">${genActive?'AAN':'UIT'}</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.95);margin-bottom:10px">${genActive?genState:'Gestopt'}</div>
      <div class="row"><span class="row-lbl">Draaiuren vandaag</span><span class="row-val">${genRuntimeToday} u</span></div>
      <div class="row"><span class="row-lbl">Draaiuren totaal</span><span class="row-val">${genRuntimeTotal} u</span></div>
      <div class="row"><span class="row-lbl">Sinds onderhoud</span><span class="row-val">${genServiceCounter} u</span></div>
      <div class="row"><span class="row-lbl">Dieselkosten vandaag</span><span class="row-val">€ ${genKostenVandaag}</span></div>
      <div class="row"><span class="row-lbl">Dieselkosten deze maand</span><span class="row-val">€ ${genKostenMaand}</span></div>
    </div>
  </div>
` : ''}


  <!-- WALSTROOM INSTELLINGEN POPUP -->
  <div id="m-wal-inst-popup" style="display:none;position:fixed;inset:0;z-index:102;background:rgba(0,0,0,0.80);backdrop-filter:blur(8px);align-items:center;justify-content:center">
    <div style="background:rgba(6,16,48,0.97);border:1px solid rgba(100,170,255,0.35);border-radius:20px;padding:28px;width:min(340px,88vw);max-height:85vh;overflow-y:auto;-webkit-overflow-scrolling:touch;text-align:center;color:#fff;font-family:'Segoe UI',system-ui,sans-serif">
      <div style="font-size:11px;letter-spacing:3px;color:rgba(255,255,255,0.95);margin-bottom:20px">WALSTROOM INSTELLINGEN</div>

      <div style="margin-bottom:18px">
        <div style="font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:1px;margin-bottom:8px">WALSTROOM AAN ONDER</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:20px">
          <div id="m-wi-soc-aan-min" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">−</div>
          <div id="m-wi-soc-aan-val" style="font-size:32px;font-weight:800;color:#ff9900;min-width:70px">--%</div>
          <div id="m-wi-soc-aan-plus" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">+</div>
        </div>
      </div>

      <div style="margin-bottom:18px">
        <div style="font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:1px;margin-bottom:8px">WALSTROOM UIT BOVEN</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:20px">
          <div id="m-wi-soc-uit-min" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">−</div>
          <div id="m-wi-soc-uit-val" style="font-size:32px;font-weight:800;color:#00cc66;min-width:70px">--%</div>
          <div id="m-wi-soc-uit-plus" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">+</div>
        </div>
      </div>

      <div style="margin-bottom:24px">
        <div style="font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:1px;margin-bottom:8px">ZON DREMPEL (UIT BIJ MEER ZON)</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:20px">
          <div id="m-wi-zon-min" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">−</div>
          <div id="m-wi-zon-val" style="font-size:32px;font-weight:800;color:#ffd700;min-width:70px">-- W</div>
          <div id="m-wi-zon-plus" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">+</div>
        </div>
      </div>

      ${(this._config && this._config.walstroom_kwh_prijs_entity) ? `
      <div style="margin-bottom:24px">
        <div style="font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:1px;margin-bottom:8px">STROOMPRIJS (PER KWH)</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:20px">
          <div id="m-wi-prijs-min" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">−</div>
          <div id="m-wi-prijs-val" style="font-size:32px;font-weight:800;color:#66ccff;min-width:70px">-- €</div>
          <div id="m-wi-prijs-plus" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">+</div>
        </div>
      </div>
      ` : ''}

      <div style="border-top:1px solid rgba(255,255,255,0.12);padding-top:18px;margin-bottom:8px">
        <div style="font-size:11px;letter-spacing:2px;color:rgba(255,120,120,0.9);margin-bottom:14px">OVERBELASTING</div>
      </div>

      <div style="margin-bottom:18px">
        <div style="font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:1px;margin-bottom:8px">AAN BOVEN</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:20px">
          <div id="m-wi-ovl-aan-min" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">−</div>
          <div id="m-wi-ovl-aan-val" style="font-size:32px;font-weight:800;color:#ff4444;min-width:70px">-- W</div>
          <div id="m-wi-ovl-aan-plus" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">+</div>
        </div>
      </div>

      <div style="margin-bottom:18px">
        <div style="font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:1px;margin-bottom:8px">AAN NA</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:20px">
          <div id="m-wi-ovl-aanduur-min" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">−</div>
          <div id="m-wi-ovl-aanduur-val" style="font-size:32px;font-weight:800;color:#ff8844;min-width:70px">-- s</div>
          <div id="m-wi-ovl-aanduur-plus" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">+</div>
        </div>
      </div>

      <div style="margin-bottom:18px">
        <div style="font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:1px;margin-bottom:8px">UIT ONDER</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:20px">
          <div id="m-wi-ovl-uit-min" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">−</div>
          <div id="m-wi-ovl-uit-val" style="font-size:32px;font-weight:800;color:#00cc66;min-width:70px">-- W</div>
          <div id="m-wi-ovl-uit-plus" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">+</div>
        </div>
      </div>

      <div style="margin-bottom:24px">
        <div style="font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:1px;margin-bottom:8px">UIT NA</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:20px">
          <div id="m-wi-ovl-uitduur-min" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">−</div>
          <div id="m-wi-ovl-uitduur-val" style="font-size:32px;font-weight:800;color:#66ccff;min-width:70px">-- s</div>
          <div id="m-wi-ovl-uitduur-plus" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">+</div>
        </div>
      </div>

      <div id="m-wi-sluit" style="cursor:pointer;padding:12px 40px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:12px;font-size:15px;color:rgba(255,255,255,0.95);display:inline-block">Sluiten</div>
    </div>
  </div>

  <div id="m-gen-kosten-popup" style="display:none;position:fixed;inset:0;z-index:102;background:rgba(0,0,0,0.80);backdrop-filter:blur(8px);align-items:center;justify-content:center">
    <div style="background:rgba(6,16,48,0.97);border:1px solid rgba(255,204,68,0.35);border-radius:20px;padding:28px;width:min(340px,88vw);text-align:center;color:#fff;font-family:'Segoe UI',system-ui,sans-serif">
      <div style="font-size:11px;letter-spacing:3px;color:rgba(255,255,255,0.95);margin-bottom:20px">DIESELKOSTEN INSTELLEN</div>

      <div style="margin-bottom:18px">
        <div style="font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:1px;margin-bottom:8px">VERBRUIK (LITER PER UUR)</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:20px">
          <div id="m-gk-verbr-min" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">−</div>
          <div id="m-gk-verbr-val" style="font-size:32px;font-weight:800;color:#ffcc44;min-width:90px">-- L/u</div>
          <div id="m-gk-verbr-plus" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">+</div>
        </div>
      </div>

      <div style="margin-bottom:24px">
        <div style="font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:1px;margin-bottom:8px">DIESELPRIJS (PER LITER)</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:20px">
          <div id="m-gk-prijs-min" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">−</div>
          <div id="m-gk-prijs-val" style="font-size:32px;font-weight:800;color:#ffd700;min-width:90px">€ --</div>
          <div id="m-gk-prijs-plus" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">+</div>
        </div>
      </div>

      <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:16px;line-height:1.5">Ruwe schatting op basis van draaiuren × verbruik × prijs — geen exacte meting.</div>

      <div id="m-gk-sluit" style="cursor:pointer;padding:12px 40px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:12px;font-size:15px;color:rgba(255,255,255,0.95);display:inline-block">Sluiten</div>
    </div>
  </div>

  <div id="m-wal-confirm-popup" style="display:none;position:fixed;inset:0;z-index:103;background:rgba(0,0,0,0.80);backdrop-filter:blur(8px);align-items:center;justify-content:center">
    <div style="background:rgba(6,16,48,0.97);border:1px solid rgba(255,153,0,0.45);border-radius:20px;padding:28px;width:min(320px,88vw);text-align:center;color:#fff;font-family:'Segoe UI',system-ui,sans-serif">
      <div style="font-size:11px;letter-spacing:3px;color:rgba(255,255,255,0.95);margin-bottom:16px">WALSTROOM INSCHAKELEN</div>
      <div style="font-size:14px;color:rgba(255,255,255,0.95);margin-bottom:24px;line-height:1.5">Weet je zeker dat je walstroom<br>handmatig wilt inschakelen?</div>
      <div style="display:flex;gap:12px;justify-content:center">
        <div id="m-wal-confirm-nee" style="cursor:pointer;padding:12px 24px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:12px;font-size:14px;color:rgba(255,255,255,0.95)">Annuleren</div>
        <div id="m-wal-confirm-ja" style="cursor:pointer;padding:12px 24px;background:rgba(255,153,0,0.18);border:0.5px solid rgba(255,153,0,0.5);border-radius:12px;font-size:14px;color:#ffaa33;font-weight:700">Ja, inschakelen</div>
      </div>
    </div>
  </div>

  <div id="m-gen-confirm-popup" style="display:none;position:fixed;inset:0;z-index:103;background:rgba(0,0,0,0.80);backdrop-filter:blur(8px);align-items:center;justify-content:center">
    <div style="background:rgba(6,16,48,0.97);border:1px solid rgba(255,90,60,0.5);border-radius:20px;padding:28px;width:min(320px,88vw);text-align:center;color:#fff;font-family:'Segoe UI',system-ui,sans-serif">
      <div style="font-size:11px;letter-spacing:3px;color:rgba(255,255,255,0.95);margin-bottom:16px">GENERATOR STARTEN</div>
      <div style="font-size:14px;color:rgba(255,255,255,0.95);margin-bottom:24px;line-height:1.5">Weet je zeker dat je de generator<br>handmatig wilt starten?</div>
      <div style="display:flex;gap:12px;justify-content:center">
        <div id="m-gen-confirm-nee" style="cursor:pointer;padding:12px 24px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:12px;font-size:14px;color:rgba(255,255,255,0.95)">Annuleren</div>
        <div id="m-gen-confirm-ja" style="cursor:pointer;padding:12px 24px;background:rgba(255,90,60,0.2);border:0.5px solid rgba(255,90,60,0.55);border-radius:12px;font-size:14px;color:#ff8866;font-weight:700">Ja, starten</div>
      </div>
    </div>
  </div>

  <!-- Walstroom limiet popup -->
  <div id="m-wal-limit-popup" style="display:none;position:fixed;inset:0;z-index:101;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);align-items:center;justify-content:center">
    <div style="background:rgba(6,16,48,0.97);border:1px solid rgba(0,170,255,0.4);border-radius:20px;padding:32px;width:min(340px,88vw);text-align:center;color:#fff;font-family:'Segoe UI',system-ui,sans-serif">
      <div style="font-size:12px;letter-spacing:3px;color:rgba(255,255,255,0.95);margin-bottom:8px">WALSTROOM LIMIET</div>
      <div style="font-size:52px;font-weight:800;color:#00aaff;margin:16px 0" id="m-wal-limit-display">-- A</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:24px;margin-bottom:28px">
        <div id="m-wal-limit-min" style="cursor:pointer;width:60px;height:60px;border-radius:50%;background:rgba(0,170,255,0.1);border:1.5px solid rgba(0,170,255,0.4);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;color:#00aaff">−</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.95)">1A per stap</div>
        <div id="m-wal-limit-plus" style="cursor:pointer;width:60px;height:60px;border-radius:50%;background:rgba(0,170,255,0.1);border:1.5px solid rgba(0,170,255,0.4);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;color:#00aaff">+</div>
      </div>
      <div style="display:flex;gap:10px;justify-content:center">
        <div id="m-wal-limit-set" style="cursor:pointer;padding:12px 28px;background:rgba(0,170,255,0.15);border:1px solid rgba(0,170,255,0.5);border-radius:12px;font-size:15px;font-weight:700;color:#00aaff">Instellen</div>
        <div id="m-wal-limit-sluit" style="cursor:pointer;padding:12px 28px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:12px;font-size:15px;color:rgba(255,255,255,0.95)">Sluiten</div>
      </div>
    </div>
  </div>

  <!-- Energie popup -->
  <div id="m-energie-popup" style="display:none;position:fixed;inset:0;z-index:100;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);align-items:center;justify-content:center">
    <div style="background:rgba(6,16,48,0.97);border:1px solid rgba(255,200,0,0.3);border-radius:20px;padding:24px;width:min(380px,88vw);color:#fff;font-family:'Segoe UI',system-ui,sans-serif;max-height:80vh;overflow-y:auto">
      <div style="font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.95);margin-bottom:16px">ENERGIE DETAILS</div>

      <!-- Actueel -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
        <div style="background:rgba(255,200,0,0.08);border:0.5px solid rgba(255,200,0,0.2);border-radius:12px;padding:12px;text-align:center">
          <div style="font-size:10px;color:rgba(255,200,0,0.5);letter-spacing:1px">ZON NU</div>
          <div style="font-size:22px;font-weight:800;color:#ffd700">${pvW} W</div>
        </div>
        <div style="background:rgba(255,100,50,0.08);border:0.5px solid rgba(255,100,50,0.2);border-radius:12px;padding:12px;text-align:center">
          <div style="font-size:10px;color:rgba(255,100,50,0.5);letter-spacing:1px">GEBRUIK NU</div>
          <div style="font-size:22px;font-weight:800;color:${loadKleur}${loadAlarm?';animation:pulse 0.6s ease-in-out infinite':''}">${loadAlarm?'⚠ ':''}${loadW} W</div>
        </div>
        <div style="background:rgba(0,170,255,0.08);border:0.5px solid rgba(0,170,255,0.2);border-radius:12px;padding:12px;text-align:center">
          <div style="font-size:10px;color:rgba(0,170,255,0.5);letter-spacing:1px">AC SPANNING</div>
          <div style="font-size:22px;font-weight:800;color:#aaffcc">${acV} V · ${acHz} Hz</div>
        </div>
        <div style="background:rgba(100,200,255,0.08);border:0.5px solid rgba(100,200,255,0.2);border-radius:12px;padding:12px;text-align:center">
          <div style="font-size:10px;color:rgba(100,200,255,0.5);letter-spacing:1px">MODUS</div>
          <div style="font-size:16px;font-weight:800;color:#00cc66">${sysState}</div>
        </div>
      </div>

      <!-- Statistieken -->
      <div style="background:rgba(255,255,255,0.03);border:0.5px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;margin-bottom:14px">
        <div style="font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.95);margin-bottom:10px">ZONNEPANELEN</div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:rgba(255,255,255,0.95);font-size:13px">Vandaag</span><span style="color:#ffd700;font-weight:700">${pvVandaag} kWh</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:rgba(255,255,255,0.95);font-size:13px">Gisteren</span><span style="color:#ffaa44;font-weight:700">${pvGisteren} kWh</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:rgba(255,255,255,0.95);font-size:13px">Deze maand</span><span style="color:#ff8800;font-weight:700">${pvMaand} kWh</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:rgba(255,255,255,0.95);font-size:13px">Besparing maand</span><span style="color:#ffd700;font-weight:700">€ ${pvBesparing}</span>
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.03);border:0.5px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;margin-bottom:14px">
        <div style="font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.95);margin-bottom:10px">WALSTROOM & VERBRUIK</div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:rgba(255,255,255,0.95);font-size:13px">Walstroom vandaag</span><span style="color:#00aaff;font-weight:700">${walDag} kWh</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:rgba(255,255,255,0.95);font-size:13px">Walstroom maand</span><span style="color:#00aaff;font-weight:700">${walMaand} kWh</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:rgba(255,255,255,0.95);font-size:13px">Kosten maand</span><span style="color:#00aaff;font-weight:700">€ ${walKosten}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:rgba(255,255,255,0.95);font-size:13px">Verbruik vandaag</span><span style="color:#ff8844;font-weight:700">${loadDag} kWh</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:rgba(255,255,255,0.95);font-size:13px">Verbruik maand</span><span style="color:#ff6622;font-weight:700">${loadMaand} kWh</span>
        </div>
      </div>

      <div id="m-energie-sluit" style="cursor:pointer;padding:12px;text-align:center;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:10px;font-size:15px;color:rgba(255,255,255,0.95)">Sluiten</div>
    </div>
  </div>

  <!-- Verwarming popup mobiel -->
  <div id="m-verw-popup" style="display:none;position:fixed;inset:0;z-index:100;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);align-items:center;justify-content:center">
    <div style="background:rgba(6,16,48,0.97);border:1px solid rgba(255,100,50,0.4);border-radius:20px;padding:28px 28px;width:min(380px,88vw);color:#fff;font-family:'Segoe UI',system-ui,sans-serif">
      <div style="font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.95);text-transform:uppercase;margin-bottom:16px">Verwarming Boot</div>

      <!-- Huidig / aan-uit -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <div>
          <div style="font-size:14px;color:rgba(255,255,255,0.95);margin-bottom:4px">Huidig</div>
          <div id="m-verw-huidig" style="font-size:38px;font-weight:800;color:#ff8844">--°C</div>
        </div>
        <div id="m-verw-toggle" style="cursor:pointer;padding:12px 24px;border-radius:12px;font-size:15px;font-weight:700;text-align:center;min-width:100px"></div>
      </div>

      <!-- Temperatuur instelling -->
      <div style="background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.1);border-radius:14px;padding:16px;margin-bottom:20px">
        <div style="font-size:12px;color:rgba(255,255,255,0.95);letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;text-align:center">Ingestelde temperatuur</div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div id="m-verw-min" style="cursor:pointer;width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700">−</div>
          <div style="text-align:center">
            <div id="m-verw-set" style="font-size:44px;font-weight:800;color:#ff8844">--°</div>
          </div>
          <div id="m-verw-plus" style="cursor:pointer;width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700">+</div>
        </div>
      </div>

      <div id="m-verw-sluit" style="cursor:pointer;padding:12px;text-align:center;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:10px;font-size:15px;color:rgba(255,255,255,0.95)">Sluiten</div>
    </div>
  </div>

</div>`;

    // ── Event listeners ──
    const verwknop  = this.shadowRoot.getElementById('m-verwknop');

    // Generator start/stop knop
    const mGenConfirmPopup = this.shadowRoot.getElementById('m-gen-confirm-popup');
    const mGenConfirmJa = this.shadowRoot.getElementById('m-gen-confirm-ja');
    const mGenConfirmNee = this.shadowRoot.getElementById('m-gen-confirm-nee');
    if (mGenConfirmPopup) {
      if (this._genConfirmPopupOpen) mGenConfirmPopup.style.display = 'flex';
      const mSluitGenConfirm = () => { this._genConfirmPopupOpen = false; mGenConfirmPopup.style.display = 'none'; };
      if (mGenConfirmNee) mGenConfirmNee.onclick = (e) => { e.stopPropagation(); mSluitGenConfirm(); };
      mGenConfirmPopup.onclick = (e) => { if (e.target === mGenConfirmPopup) mSluitGenConfirm(); };
      if (mGenConfirmJa) mGenConfirmJa.onclick = (e) => {
        e.stopPropagation();
        if (this._hass) this._hass.callService('switch', 'turn_on', { entity_id: generatorSwitchEntity });
        mSluitGenConfirm();
      };
    }
    const mGenToggle = this.shadowRoot.getElementById('m-gen-toggle');
    if (mGenToggle && this._hass) {
      mGenToggle.onclick = (e) => {
        e.stopPropagation();
        const aan = this._hass.states[generatorSwitchEntity]?.state === 'on';
        if (aan) {
          this._hass.callService('switch', 'turn_off', { entity_id: generatorSwitchEntity });
        } else {
          this._genConfirmPopupOpen = true;
          if (mGenConfirmPopup) mGenConfirmPopup.style.display = 'flex';
        }
      };
    }

    // Kabola verwarming aan/uit
    const mKabolaToggle = this.shadowRoot.getElementById('m-kabola-toggle');
    if (mKabolaToggle && this._hass && this._config && this._config.kabola_climate_entity) {
      mKabolaToggle.onclick = (e) => {
        e.stopPropagation();
        const ent = this._config.kabola_climate_entity;
        const aan = this._hass.states[ent]?.state !== 'off';
        this._hass.callService('climate', 'set_hvac_mode', {
          entity_id: ent, hvac_mode: aan ? 'off' : 'heat'
        });
      };
    }
    const mVerwPopup = this.shadowRoot.getElementById('m-verw-popup');
    const mVerwToggle = this.shadowRoot.getElementById('m-verw-toggle');
    const mVerwHuidig = this.shadowRoot.getElementById('m-verw-huidig');
    const mVerwSet   = this.shadowRoot.getElementById('m-verw-set');
    const mVerwPlus  = this.shadowRoot.getElementById('m-verw-plus');
    const mVerwMin   = this.shadowRoot.getElementById('m-verw-min');
    const mVerwSluit = this.shadowRoot.getElementById('m-verw-sluit');

    const _mVerwUpdate = () => {
      if (!this._hass) return;
      const aan = this._hass.states[heatingClimateEntity]?.state === 'heat';
      const cur = this._hass.states[heatingClimateEntity]?.attributes?.current_temperature ?? '--';
      const set = parseFloat(this._hass.states[heatingClimateEntity]?.attributes?.temperature ?? 19);
      if (mVerwHuidig) mVerwHuidig.textContent = cur + '°C';
      if (mVerwSet) mVerwSet.textContent = set.toFixed(1) + '°';
      if (mVerwToggle) {
        mVerwToggle.textContent = aan ? '● AAN' : '○ UIT';
        mVerwToggle.style.background = aan ? 'rgba(255,100,50,0.25)' : 'rgba(255,255,255,0.06)';
        mVerwToggle.style.border = aan ? '1px solid rgba(255,100,50,0.5)' : '1px solid rgba(255,255,255,0.15)';
        mVerwToggle.style.color = aan ? '#ff8844' : 'rgba(255,255,255,0.5)';
      }
    };

    if (verwknop && mVerwPopup && this._hass) {
      verwknop.onclick = () => {
        _mVerwUpdate();
        mVerwPopup.style.display = 'flex';
      };
    }
    if (mVerwToggle) {
      mVerwToggle.onclick = () => {
        const aan = this._hass.states[heatingClimateEntity]?.state === 'heat';
        this._hass.callService('climate', aan ? 'turn_off' : 'turn_on', { entity_id: heatingClimateEntity });
        setTimeout(_mVerwUpdate, 500);
      };
    }
    if (mVerwPlus) {
      mVerwPlus.onclick = () => {
        const cur = parseFloat(this._hass.states[heatingClimateEntity]?.attributes?.temperature ?? 19);
        const newT = Math.min(cur + 0.5, 25);
        this._hass.callService('climate', 'set_temperature', { entity_id: heatingClimateEntity, temperature: newT });
        setTimeout(_mVerwUpdate, 500);
      };
    }
    if (mVerwMin) {
      mVerwMin.onclick = () => {
        const cur = parseFloat(this._hass.states[heatingClimateEntity]?.attributes?.temperature ?? 19);
        const newT = Math.max(cur - 0.5, 10);
        this._hass.callService('climate', 'set_temperature', { entity_id: heatingClimateEntity, temperature: newT });
        setTimeout(_mVerwUpdate, 500);
      };
    }
    if (mVerwSluit) mVerwSluit.onclick = () => { mVerwPopup.style.display = 'none'; };
    if (mVerwPopup) mVerwPopup.onclick = (e) => { if (e.target === mVerwPopup) mVerwPopup.style.display = 'none'; };

    const mEnergiePopup = this.shadowRoot.getElementById('m-energie-popup');
    const mEnergieSluit = this.shadowRoot.getElementById('m-energie-sluit');
    const mEnergieTegel = this.shadowRoot.getElementById('m-energie-tegel');
    if (mEnergiePopup && this._energiePopupOpen) mEnergiePopup.style.display = 'flex';
    if (mEnergieTegel) mEnergieTegel.onclick = (e) => { e.stopPropagation(); this._energiePopupOpen = true; if (mEnergiePopup) mEnergiePopup.style.display = 'flex'; };
    if (mEnergieSluit) mEnergieSluit.onclick = (e) => { e.stopPropagation(); this._energiePopupOpen = false; mEnergiePopup.style.display = 'none'; };
    if (mEnergiePopup) mEnergiePopup.onclick = (e) => { if (e.target === mEnergiePopup) { this._energiePopupOpen = false; mEnergiePopup.style.display = 'none'; } };

    // Walstroom limiet popup
    const mWalLimitPopup = this.shadowRoot.getElementById('m-wal-limit-popup');
    const mWalLimitTegel = this.shadowRoot.getElementById('m-wal-limit-tegel');
    const mWalLimitDisp  = this.shadowRoot.getElementById('m-wal-limit-display');
    const mWalLimitMin   = this.shadowRoot.getElementById('m-wal-limit-min');
    const mWalLimitPlus  = this.shadowRoot.getElementById('m-wal-limit-plus');
    const mWalLimitSet   = this.shadowRoot.getElementById('m-wal-limit-set');
    const mWalLimitSluit = this.shadowRoot.getElementById('m-wal-limit-sluit');
    if (mWalLimitPopup && this._walLimitPopupOpen) { mWalLimitPopup.style.display = 'flex'; if (mWalLimitDisp) mWalLimitDisp.textContent = this._walLimitVal + ' A'; }
    if (mWalLimitTegel) mWalLimitTegel.onclick = (e) => {
      e.stopPropagation();
      const cur = parseFloat(this._hass?.states['number.gx_device_ac_input_limit']?.state) || 16;
      this._walLimitVal = cur;
      this._walLimitPopupOpen = true;
      if (mWalLimitDisp) mWalLimitDisp.textContent = cur + ' A';
      if (mWalLimitPopup) mWalLimitPopup.style.display = 'flex';
    };
    if (mWalLimitMin) mWalLimitMin.onclick = (e) => { e.stopPropagation(); this._walLimitVal = Math.max(0, (this._walLimitVal||16)-1); if (mWalLimitDisp) mWalLimitDisp.textContent = this._walLimitVal+' A'; };
    if (mWalLimitPlus) mWalLimitPlus.onclick = (e) => { e.stopPropagation(); this._walLimitVal = Math.min(25, (this._walLimitVal||16)+1); if (mWalLimitDisp) mWalLimitDisp.textContent = this._walLimitVal+' A'; };
    if (mWalLimitSet) mWalLimitSet.onclick = (e) => {
      e.stopPropagation();
      this._hass?.callService('number', 'set_value', { entity_id: 'number.gx_device_ac_input_limit', value: this._walLimitVal });
      this._walLimitPopupOpen = false;
      if (mWalLimitPopup) mWalLimitPopup.style.display = 'none';
    };
    if (mWalLimitSluit) mWalLimitSluit.onclick = (e) => { e.stopPropagation(); this._walLimitPopupOpen = false; if (mWalLimitPopup) mWalLimitPopup.style.display = 'none'; };
    if (mWalLimitPopup) mWalLimitPopup.onclick = (e) => { if (e.target === mWalLimitPopup) { this._walLimitPopupOpen = false; mWalLimitPopup.style.display = 'none'; } };

    const doucheknop = this.shadowRoot.getElementById('m-doucheknop');
    if (doucheknop && this._hass) {
      doucheknop.onclick = () => {
        const aan = doucheknop.dataset.aan === 'true';
        this._hass.callService('switch', aan ? 'turn_off' : 'turn_on', { entity_id: douchepompSwitchEntity });
      };
    }


    // Walstroom instellingen popup
    const mWiBtn   = this.shadowRoot.getElementById('m-wal-inst-btn');
    const mWiPopup = this.shadowRoot.getElementById('m-wal-inst-popup');
    const mWiSluit = this.shadowRoot.getElementById('m-wi-sluit');

    const _mWiLoad = () => {
      if (!this._hass) return;
      const aan = parseFloat(this._hass.states[walstroomSocAanEntity]?.state) || 30;
      const uit = parseFloat(this._hass.states[walstroomSocUitEntity]?.state) || 80;
      const zon = parseFloat(this._hass.states[walstroomZonDrempelEntity]?.state) || 300;
      const prijs = walstroomKwhPrijsEntity ? (parseFloat(this._hass.states[walstroomKwhPrijsEntity]?.state) || 0.50) : 0.50;
      const ovlAan = parseFloat(this._hass.states[walstroomOvlAanEntity]?.state) || 4500;
      const ovlUit = parseFloat(this._hass.states[walstroomOvlUitEntity]?.state) || 3000;
      const ovlAanDuur = parseFloat(this._hass.states[walstroomOvlAanDuurEntity]?.state) || 30;
      const ovlUitDuur = parseFloat(this._hass.states[walstroomOvlUitDuurEntity]?.state) || 30;
      mWiPopup._socAan = aan; mWiPopup._socUit = uit; mWiPopup._zon = zon; mWiPopup._prijs = prijs;
      mWiPopup._ovlAan = ovlAan; mWiPopup._ovlUit = ovlUit; mWiPopup._ovlAanDuur = ovlAanDuur; mWiPopup._ovlUitDuur = ovlUitDuur;
      const v1 = mWiPopup.querySelector('#m-wi-soc-aan-val');
      const v2 = mWiPopup.querySelector('#m-wi-soc-uit-val');
      const v3 = mWiPopup.querySelector('#m-wi-zon-val');
      const v3b = mWiPopup.querySelector('#m-wi-prijs-val');
      const v4 = mWiPopup.querySelector('#m-wi-ovl-aan-val');
      const v5 = mWiPopup.querySelector('#m-wi-ovl-uit-val');
      const v6 = mWiPopup.querySelector('#m-wi-ovl-aanduur-val');
      const v7 = mWiPopup.querySelector('#m-wi-ovl-uitduur-val');
      if (v1) v1.textContent = aan + '%';
      if (v2) v2.textContent = uit + '%';
      if (v3) v3.textContent = zon + ' W';
      if (v3b) v3b.textContent = '€ ' + prijs.toFixed(2);
      if (v4) v4.textContent = ovlAan + ' W';
      if (v5) v5.textContent = ovlUit + ' W';
      if (v6) v6.textContent = ovlAanDuur + ' s';
      if (v7) v7.textContent = ovlUitDuur + ' s';
    };
    const _mWiSet = (entity, value) => {
      this._hass.callService('input_number', 'set_value', { entity_id: entity, value });
    };
    const _mWiBtn = (id, fn) => {
      const el = mWiPopup ? mWiPopup.querySelector('#' + id) : null;
      if (el) el.onclick = (e) => { e.stopPropagation(); fn(); };
    };

    if (mWiBtn && mWiPopup && this._hass) {
      if (this._walInstPopupOpen) { mWiPopup.style.display = 'flex'; _mWiLoad(); }
      mWiBtn.onclick = () => { this._walInstPopupOpen = true; _mWiLoad(); mWiPopup.style.display = 'flex'; };
      _mWiBtn('m-wi-soc-aan-min', () => { mWiPopup._socAan = Math.max(10, (mWiPopup._socAan||30)-5); const el=mWiPopup.querySelector('#m-wi-soc-aan-val'); if(el) el.textContent=mWiPopup._socAan+'%'; _mWiSet(walstroomSocAanEntity, mWiPopup._socAan); });
      _mWiBtn('m-wi-soc-aan-plus', () => { mWiPopup._socAan = Math.min(70, (mWiPopup._socAan||30)+5); const el=mWiPopup.querySelector('#m-wi-soc-aan-val'); if(el) el.textContent=mWiPopup._socAan+'%'; _mWiSet(walstroomSocAanEntity, mWiPopup._socAan); });
      _mWiBtn('m-wi-soc-uit-min', () => { mWiPopup._socUit = Math.max(50, (mWiPopup._socUit||80)-5); const el=mWiPopup.querySelector('#m-wi-soc-uit-val'); if(el) el.textContent=mWiPopup._socUit+'%'; _mWiSet(walstroomSocUitEntity, mWiPopup._socUit); });
      _mWiBtn('m-wi-soc-uit-plus', () => { mWiPopup._socUit = Math.min(100, (mWiPopup._socUit||80)+5); const el=mWiPopup.querySelector('#m-wi-soc-uit-val'); if(el) el.textContent=mWiPopup._socUit+'%'; _mWiSet(walstroomSocUitEntity, mWiPopup._socUit); });
      _mWiBtn('m-wi-zon-min', () => { mWiPopup._zon = Math.max(0, (mWiPopup._zon||300)-50); const el=mWiPopup.querySelector('#m-wi-zon-val'); if(el) el.textContent=mWiPopup._zon+' W'; _mWiSet(walstroomZonDrempelEntity, mWiPopup._zon); });
      _mWiBtn('m-wi-zon-plus', () => { mWiPopup._zon = Math.min(1000, (mWiPopup._zon||300)+50); const el=mWiPopup.querySelector('#m-wi-zon-val'); if(el) el.textContent=mWiPopup._zon+' W'; _mWiSet(walstroomZonDrempelEntity, mWiPopup._zon); });
      _mWiBtn('m-wi-prijs-min', () => { mWiPopup._prijs = Math.max(0, Math.round(((mWiPopup._prijs||0.50)-0.01)*100)/100); const el=mWiPopup.querySelector('#m-wi-prijs-val'); if(el) el.textContent='€ '+mWiPopup._prijs.toFixed(2); if (walstroomKwhPrijsEntity) _mWiSet(walstroomKwhPrijsEntity, mWiPopup._prijs); });
      _mWiBtn('m-wi-prijs-plus', () => { mWiPopup._prijs = Math.min(2, Math.round(((mWiPopup._prijs||0.50)+0.01)*100)/100); const el=mWiPopup.querySelector('#m-wi-prijs-val'); if(el) el.textContent='€ '+mWiPopup._prijs.toFixed(2); if (walstroomKwhPrijsEntity) _mWiSet(walstroomKwhPrijsEntity, mWiPopup._prijs); });
      _mWiBtn('m-wi-ovl-aan-min', () => { mWiPopup._ovlAan = Math.max(2000, (mWiPopup._ovlAan||4500)-100); const el=mWiPopup.querySelector('#m-wi-ovl-aan-val'); if(el) el.textContent=mWiPopup._ovlAan+' W'; _mWiSet(walstroomOvlAanEntity, mWiPopup._ovlAan); });
      _mWiBtn('m-wi-ovl-aan-plus', () => { mWiPopup._ovlAan = Math.min(5000, (mWiPopup._ovlAan||4500)+100); const el=mWiPopup.querySelector('#m-wi-ovl-aan-val'); if(el) el.textContent=mWiPopup._ovlAan+' W'; _mWiSet(walstroomOvlAanEntity, mWiPopup._ovlAan); });
      _mWiBtn('m-wi-ovl-uit-min', () => { mWiPopup._ovlUit = Math.max(1000, (mWiPopup._ovlUit||3000)-100); const el=mWiPopup.querySelector('#m-wi-ovl-uit-val'); if(el) el.textContent=mWiPopup._ovlUit+' W'; _mWiSet(walstroomOvlUitEntity, mWiPopup._ovlUit); });
      _mWiBtn('m-wi-ovl-uit-plus', () => { mWiPopup._ovlUit = Math.min(4500, (mWiPopup._ovlUit||3000)+100); const el=mWiPopup.querySelector('#m-wi-ovl-uit-val'); if(el) el.textContent=mWiPopup._ovlUit+' W'; _mWiSet(walstroomOvlUitEntity, mWiPopup._ovlUit); });
      _mWiBtn('m-wi-ovl-aanduur-min', () => { mWiPopup._ovlAanDuur = Math.max(5, (mWiPopup._ovlAanDuur||30)-5); const el=mWiPopup.querySelector('#m-wi-ovl-aanduur-val'); if(el) el.textContent=mWiPopup._ovlAanDuur+' s'; _mWiSet(walstroomOvlAanDuurEntity, mWiPopup._ovlAanDuur); });
      _mWiBtn('m-wi-ovl-aanduur-plus', () => { mWiPopup._ovlAanDuur = Math.min(300, (mWiPopup._ovlAanDuur||30)+5); const el=mWiPopup.querySelector('#m-wi-ovl-aanduur-val'); if(el) el.textContent=mWiPopup._ovlAanDuur+' s'; _mWiSet(walstroomOvlAanDuurEntity, mWiPopup._ovlAanDuur); });
      _mWiBtn('m-wi-ovl-uitduur-min', () => { mWiPopup._ovlUitDuur = Math.max(5, (mWiPopup._ovlUitDuur||30)-5); const el=mWiPopup.querySelector('#m-wi-ovl-uitduur-val'); if(el) el.textContent=mWiPopup._ovlUitDuur+' s'; _mWiSet(walstroomOvlUitDuurEntity, mWiPopup._ovlUitDuur); });
      _mWiBtn('m-wi-ovl-uitduur-plus', () => { mWiPopup._ovlUitDuur = Math.min(300, (mWiPopup._ovlUitDuur||30)+5); const el=mWiPopup.querySelector('#m-wi-ovl-uitduur-val'); if(el) el.textContent=mWiPopup._ovlUitDuur+' s'; _mWiSet(walstroomOvlUitDuurEntity, mWiPopup._ovlUitDuur); });
      if (mWiSluit) mWiSluit.onclick = (e) => { e.stopPropagation(); this._walInstPopupOpen = false; mWiPopup.style.display = 'none'; };
      mWiPopup.onclick = (e) => { if (e.target === mWiPopup) { this._walInstPopupOpen = false; mWiPopup.style.display = 'none'; } };
    }

    // Generator dieselkosten instellingen
    const mGkBtn   = this.shadowRoot.getElementById('m-gen-kosten-btn');
    const mGkPopup = this.shadowRoot.getElementById('m-gen-kosten-popup');
    const mGkSluit = this.shadowRoot.getElementById('m-gk-sluit');
    const _mGkLoad = () => {
      if (!this._hass) return;
      const verbr = parseFloat(this._hass.states[genVerbruikEntity]?.state) || 3;
      const prijs = parseFloat(this._hass.states[genDieselPrijsEntity]?.state) || 1.80;
      mGkPopup._verbr = verbr; mGkPopup._prijs = prijs;
      const v1 = mGkPopup.querySelector('#m-gk-verbr-val');
      const v2 = mGkPopup.querySelector('#m-gk-prijs-val');
      if (v1) v1.textContent = verbr.toFixed(1) + ' L/u';
      if (v2) v2.textContent = '€ ' + prijs.toFixed(3);
    };
    const _mGkSet = (entity, value) => {
      if (this._hass) this._hass.callService('input_number', 'set_value', { entity_id: entity, value: value });
    };
    if (mGkBtn && mGkPopup && this._hass) {
      if (this._genKostenPopupOpen) { mGkPopup.style.display = 'flex'; _mGkLoad(); }
      mGkBtn.onclick = () => { this._genKostenPopupOpen = true; _mGkLoad(); mGkPopup.style.display = 'flex'; };
      const _mGkBtn = (id, fn) => { const el = mGkPopup.querySelector('#' + id); if (el) el.onclick = (e) => { e.stopPropagation(); fn(); }; };
      _mGkBtn('m-gk-verbr-min', () => { mGkPopup._verbr = Math.max(0.5, (mGkPopup._verbr||3)-0.5); const el=mGkPopup.querySelector('#m-gk-verbr-val'); if(el) el.textContent=mGkPopup._verbr.toFixed(1)+' L/u'; _mGkSet(genVerbruikEntity, mGkPopup._verbr); });
      _mGkBtn('m-gk-verbr-plus', () => { mGkPopup._verbr = Math.min(15, (mGkPopup._verbr||3)+0.5); const el=mGkPopup.querySelector('#m-gk-verbr-val'); if(el) el.textContent=mGkPopup._verbr.toFixed(1)+' L/u'; _mGkSet(genVerbruikEntity, mGkPopup._verbr); });
      _mGkBtn('m-gk-prijs-min', () => { mGkPopup._prijs = Math.max(0.50, (mGkPopup._prijs||1.80)-0.005); const el=mGkPopup.querySelector('#m-gk-prijs-val'); if(el) el.textContent='€ '+mGkPopup._prijs.toFixed(3); _mGkSet(genDieselPrijsEntity, mGkPopup._prijs); });
      _mGkBtn('m-gk-prijs-plus', () => { mGkPopup._prijs = Math.min(3.00, (mGkPopup._prijs||1.80)+0.005); const el=mGkPopup.querySelector('#m-gk-prijs-val'); if(el) el.textContent='€ '+mGkPopup._prijs.toFixed(3); _mGkSet(genDieselPrijsEntity, mGkPopup._prijs); });
      if (mGkSluit) mGkSluit.onclick = (e) => { e.stopPropagation(); this._genKostenPopupOpen = false; mGkPopup.style.display = 'none'; };
      mGkPopup.onclick = (e) => { if (e.target === mGkPopup) { this._genKostenPopupOpen = false; mGkPopup.style.display = 'none'; } };
    }

    // Walstroom socket (configureerbaar, valt terug op Eriks eigen socket — zie declaratie boven in deze functie)
    const mWalConfirmPopup = this.shadowRoot.getElementById('m-wal-confirm-popup');
    const mWalConfirmJa = this.shadowRoot.getElementById('m-wal-confirm-ja');
    const mWalConfirmNee = this.shadowRoot.getElementById('m-wal-confirm-nee');
    if (mWalConfirmPopup) {
      if (this._walConfirmPopupOpen) mWalConfirmPopup.style.display = 'flex';
      const mSluitConfirm = () => { this._walConfirmPopupOpen = false; mWalConfirmPopup.style.display = 'none'; };
      if (mWalConfirmNee) mWalConfirmNee.onclick = (e) => { e.stopPropagation(); mSluitConfirm(); };
      mWalConfirmPopup.onclick = (e) => { if (e.target === mWalConfirmPopup) mSluitConfirm(); };
      if (mWalConfirmJa) mWalConfirmJa.onclick = (e) => {
        e.stopPropagation();
        if (this._hass) this._hass.callService('switch', 'turn_on', { entity_id: walstroomSwitchEntity });
        mSluitConfirm();
      };
    }
    const mWalSocketBtn = this.shadowRoot.getElementById('m-wal-socket-btn');
    if (mWalSocketBtn && this._hass) {
      mWalSocketBtn.onclick = () => {
        const aan = this._hass.states[walstroomSwitchEntity]?.state === 'on';
        if (aan) {
          this._hass.callService('switch', 'turn_off', { entity_id: walstroomSwitchEntity });
        } else {
          this._walConfirmPopupOpen = true;
          if (mWalConfirmPopup) mWalConfirmPopup.style.display = 'flex';
        }
      };
    }

    // Walstroom override (configureerbaar, valt terug op Eriks eigen helper)
    const mWalOverrideBtn = this.shadowRoot.getElementById('m-wal-override-btn');
    if (mWalOverrideBtn && this._hass) {
      mWalOverrideBtn.onclick = () => {
        const aan = this._hass.states[walstroomOverrideEntity]?.state === 'on';
        this._hass.callService('input_boolean', aan ? 'turn_off' : 'turn_on', { entity_id: walstroomOverrideEntity });
      };
    }
  }

  getCardSize() { return 15; }
  static getStubConfig() { return {}; }
}

customElements.define('finally-skycard-mobile-customer', FinallySkyCardMobile);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'finally-skycard-mobile-customer',
  name: 'Finally SkyCard Mobile', // v135
  description: 'Portret-vriendelijk energiedashboard voor de boot Finally'
});


class FinallyWizard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._step = 1;
    this._state = {
      bootNaam: '',
      fotoDataUrl: null,
      apparatuur: { cerbo: true, shunt: true, quattro: true, mppt: true, generator: false, tanks: false, shelly: false },
      serials: {},
      entities: {},
      manualSerials: {},
      otherRoles: {},
      detectMode: 'lokaal',
      vrm: { portalId: '', token: '', idSite: null, devices: [] }
    };
    this._activated = false;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this._rendered = true;
      this._render();
    }
  }


  _renderActivation() {
    this.shadowRoot.innerHTML = `
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :host { display: block; font-family: 'Segoe UI', system-ui, sans-serif; font-size: 16px; }
        .wrap { background: rgba(5,14,31,0.97); border-radius: 20px; padding: 56px 48px; color: #fff; min-height: 380px; max-width: 640px; margin: 0 auto; display:flex; flex-direction:column; align-items:center; justify-content:center; }
        .logo h1 { font-size:30px; font-weight:800; letter-spacing:4px; color:#00aaff; text-align:center; margin-bottom:6px; }
        .logo p { font-size:15px; letter-spacing:2px; color:rgba(255,255,255,0.95); text-align:center; margin-bottom:44px; }
        .act-box { width:100%; max-width:480px; }
        label { display:block; font-size:14px; letter-spacing:1.5px; color:rgba(255,255,255,0.95); margin-bottom:10px; }
        input { width:100%; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:10px; padding:20px; color:#fff; font-size:24px; font-family:monospace; letter-spacing:3px; outline:none; text-align:center; text-transform:uppercase; }
        input:focus { border-color:rgba(0,170,255,0.5); }
        input.error { border-color:rgba(255,60,60,0.6); }
        .btn { width:100%; margin-top:20px; padding:18px; background:#00aaff; color:#fff; border:none; border-radius:12px; font-size:18px; font-weight:700; cursor:pointer; }
        .btn:hover { background:#0099ee; }
        .msg { font-size:15px; margin-top:14px; padding:13px 18px; border-radius:10px; text-align:center; }
        .msg.err { background:rgba(255,60,60,0.1); color:#ff8888; border:1px solid rgba(255,60,60,0.2); }
        .msg.info { color:rgba(255,255,255,0.95); font-size:15px; margin-top:24px; text-align:center; }
      </style>
      <div class="wrap">
        <div class="logo">
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none" style="display:block;margin:0 auto 8px">
            <circle cx="24" cy="24" r="22" stroke="#00aaff" stroke-width="1.5" stroke-dasharray="4 2"/>
            <path d="M8 30 Q24 10 40 30" stroke="#00aaff" stroke-width="2" fill="none"/>
            <rect x="20" y="28" width="8" height="10" rx="1" fill="#00aaff" opacity="0.6"/>
          </svg>
          <h1>FINALLY CARD</h1>
          <p>INSTALLATIE WIZARD</p>
        </div>
        <div class="act-box">
          <label>ACTIVATIECODE</label>
          <input type="text" id="act-code" placeholder="FC-2026-XXXX-0000" maxlength="20"/>
          <div id="act-msg"></div>
          <button class="btn" id="act-btn">Activeren</button>
          <div class="msg info">Voer de activatiecode in die u van Finally Card heeft ontvangen.</div>
        </div>
      </div>
    `;

    const inp = this.shadowRoot.getElementById('act-code');
    const btn = this.shadowRoot.getElementById('act-btn');
    const msg = this.shadowRoot.getElementById('act-msg');

    // Auto-format input
    inp.addEventListener('input', () => {
      let val = inp.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      if (val.length > 2) val = val.slice(0,2) + '-' + val.slice(2);
      if (val.length > 7) val = val.slice(0,7) + '-' + val.slice(7);
      if (val.length > 12) val = val.slice(0,12) + '-' + val.slice(12);
      inp.value = val.slice(0,20);
    });

    btn.addEventListener('click', () => {
      const code = inp.value.trim().toUpperCase();
      if (this._validateCode(code)) {
        this._activated = true;
        localStorage.setItem('finally_wizard_activated', code);
        this._render();
      } else {
        inp.classList.add('error');
        msg.className = 'msg err';
        msg.textContent = '✗ Ongeldige activatiecode. Controleer de code en probeer opnieuw.';
        setTimeout(() => inp.classList.remove('error'), 1000);
      }
    });

    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') btn.click(); });

    // Check of al eerder geactiveerd
    const saved = localStorage.getItem('finally_wizard_activated');
    if (saved && this._validateCode(saved)) {
      this._activated = true;
      this._render();
    }
  }

  _validateCode(code) {
    try {
      const parts = code.trim().toUpperCase().split('-');
      if (parts.length !== 4 || parts[0] !== 'FC') return false;
      const jaar = parseInt(parts[1]);
      if (jaar < 2026 || jaar > 2035) return false;
      const naam = parts[2];
      if (naam.length < 2 || naam.length > 4) return false;
      const checksum = parseInt(parts[3]);
      if (isNaN(checksum)) return false;
      // Valideer checksum via djb2 hash (geen crypto nodig in browser)
      const raw = 'FC-' + jaar + '-' + naam + '-8472-FINALLY';
      let hash = 5381;
      for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) + hash) + raw.charCodeAt(i);
        hash = hash & hash; // 32bit int
      }
      const expected = Math.abs(hash) % 9999;
      return checksum === expected;
    } catch(e) { return false; }
  }

  setConfig(config) { this._config = config; }
  getCardSize() { return 8; }

  _render() {
    if (!this._activated) {
      this._renderActivation();
      return;
    }
    this.shadowRoot.innerHTML = `
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :host { display: block; font-family: 'Segoe UI', system-ui, sans-serif; font-size: 16px; }
        .wrap { background: rgba(5,14,31,0.97); border-radius: 20px; padding: 44px 40px; color: #fff; min-height: 480px; max-width: 720px; margin: 0 auto; }
        .logo { text-align:center; margin-bottom:36px; }
        .logo h1 { font-size:26px; font-weight:800; letter-spacing:4px; color:#00aaff; }
        .logo p { font-size:15px; letter-spacing:2px; color:rgba(255,255,255,0.95); margin-top:5px; }

        .steps { display:flex; align-items:center; justify-content:center; gap:0; margin-bottom:36px; }
        .sd { width:38px; height:38px; border-radius:50%; border:2px solid rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700; color:rgba(255,255,255,0.95); background:#050e1f; transition:all 0.3s; }
        .sd.active { border-color:#00aaff; color:#00aaff; }
        .sd.done { border-color:#00cc66; background:#00cc66; color:#fff; }
        .sl { width:48px; height:3px; background:rgba(255,255,255,0.1); transition:background 0.3s; }
        .sl.done { background:#00cc66; }

        h2 { font-size:24px; font-weight:700; margin-bottom:8px; }
        .sub { font-size:15px; color:rgba(255,255,255,0.95); margin-bottom:28px; line-height:1.5; }

        label { display:block; font-size:14px; letter-spacing:1.5px; color:rgba(255,255,255,0.95); margin-bottom:7px; margin-top:20px; }
        label:first-of-type { margin-top:0; }
        input[type=text] { width:100%; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:10px; padding:15px 17px; color:#fff; font-size:18px; outline:none; }
        input[type=text]:focus { border-color:rgba(0,170,255,0.5); }

        .toggle-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:6px; }
        .ti {
          display:flex; align-items:center; gap:12px;
          background:rgba(255,255,255,0.03);
          border:2px solid rgba(255,255,255,0.08);
          border-radius:10px; padding:14px 16px;
          cursor:pointer; transition:all 0.2s; user-select:none;
        }
        .ti.on {
          border-color:#00aaff;
          background:rgba(0,170,255,0.12);
          box-shadow: 0 0 0 1px rgba(0,170,255,0.3);
        }
        .ti-check { width:22px; height:22px; border-radius:50%; border:2px solid rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s; }
        .ti.on .ti-check { border-color:#00aaff; background:#00aaff; }
        .ti-checkmark { font-size:15px; color:#fff; display:none; }
        .ti.on .ti-checkmark { display:block; }
        .ti-lbl { font-size:16px; font-weight:600; color:rgba(255,255,255,0.95); transition:color 0.2s; }
        .ti.on .ti-lbl { color:#fff; }
        .ti-sub { font-size:14px; color:rgba(255,255,255,0.95); }
        .ti.on .ti-sub { color:rgba(0,200,255,0.6); }

        .det-item { display:flex; align-items:center; gap:14px; padding:14px 18px; border-radius:10px; margin-bottom:9px; font-size:16px; }
        .det-item.found { background:rgba(0,204,102,0.08); border:1px solid rgba(0,204,102,0.2); }
        .det-item.missing { background:rgba(255,80,80,0.06); border:1px solid rgba(255,80,80,0.15); }
        .det-item.manual { background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.25); }
        .di-name { flex:1; font-weight:600; }
        .di-id { font-size:14px; color:rgba(255,255,255,0.95); font-family:monospace; margin-top:3px; }
        .di-status { font-size:15px; font-weight:700; flex-shrink:0; }
        .found .di-status { color:#00cc66; }
        .missing .di-status { color:#ff4444; }
        .manual .di-status { color:#ffaa44; }

        .manual-inp { width:100%; background:rgba(255,255,255,0.06); border:1px solid rgba(255,165,0,0.3); border-radius:8px; padding:10px 14px; color:#fff; font-size:15px; font-family:monospace; outline:none; margin-top:8px; }
        .manual-inp:focus { border-color:rgba(255,165,0,0.6); }
        .manual-inp::placeholder { color:rgba(255,255,255,0.95); }

        .photo-drop { border:2px dashed rgba(255,255,255,0.15); border-radius:12px; padding:28px; text-align:center; cursor:pointer; transition:all 0.2s; margin-top:6px; overflow:hidden; position:relative; }
        .photo-drop:hover { border-color:rgba(0,170,255,0.4); background:rgba(0,170,255,0.04); }
        .photo-drop img { width:100%; height:240px; border-radius:8px; object-fit:cover; object-position:center; display:block; }
        .photo-drop p { font-size:15px; color:rgba(255,255,255,0.95); margin-top:12px; }
        .photo-overlay { position:absolute; bottom:10px; right:10px; background:rgba(0,0,0,0.6); border-radius:8px; padding:6px 11px; font-size:14px; color:rgba(255,255,255,0.95); }

        .btn-row { display:flex; gap:12px; margin-top:28px; }
        .btn { flex:1; padding:16px; border-radius:12px; font-size:17px; font-weight:700; cursor:pointer; border:none; transition:all 0.2s; }
        .btn-p { background:#00aaff; color:#fff; }
        .btn-p:hover { background:#0099ee; }
        .btn-s { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:rgba(255,255,255,0.95); }

        .msg { font-size:15px; margin-top:14px; padding:13px 18px; border-radius:10px; }
        .msg.err { background:rgba(255,60,60,0.1); color:#ff8888; border:1px solid rgba(255,60,60,0.2); }
        .msg.ok { background:rgba(0,204,102,0.1); color:#00cc66; border:1px solid rgba(0,204,102,0.2); }
        .msg.info { background:rgba(0,170,255,0.1); color:#66ccff; border:1px solid rgba(0,170,255,0.2); }

        .spinner { display:inline-block; width:18px; height:18px; border:2px solid rgba(255,255,255,0.2); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; vertical-align:middle; margin-right:8px; }
        @keyframes spin { to { transform:rotate(360deg); } }

        .finish-details { background:rgba(255,255,255,0.04); border-radius:12px; padding:20px; margin-top:18px; }
        .fr { display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:16px; gap:12px; }
        .fr:last-child { border-bottom:none; }
        .fk { color:rgba(255,255,255,0.95); flex-shrink:0; }
        .fv { font-weight:600; font-family:monospace; font-size:15px; text-align:right; word-break:break-all; }
        .fv.ok { color:#00cc66; }
        .fv.warn { color:#ffaa44; }
        .fv.missing { color:#ff4444; }
      </style>
      <div class="wrap">
        <div class="logo">
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none" style="display:block;margin:0 auto 6px">
            <circle cx="24" cy="24" r="22" stroke="#00aaff" stroke-width="1.5" stroke-dasharray="4 2"/>
            <path d="M8 30 Q24 10 40 30" stroke="#00aaff" stroke-width="2" fill="none"/>
            <rect x="20" y="28" width="8" height="10" rx="1" fill="#00aaff" opacity="0.6"/>
          </svg>
          <h1>FINALLY CARD</h1>
          <p>INSTALLATIE WIZARD</p>
        </div>
        <div class="steps" id="wiz-steps"></div>
        <div id="wiz-content"></div>
      </div>
    `;
    this._updateSteps();
    this._renderStep();
    this.shadowRoot.addEventListener('click', (e) => this._handleClick(e));
    this.shadowRoot.addEventListener('change', (e) => this._handleChange(e));
  }

  _updateSteps() {
    const n = this._step;
    const total = 6;
    const stepsEl = this.shadowRoot.getElementById('wiz-steps');
    let html = '';
    for (let i = 1; i <= total; i++) {
      const cls = i < n ? 'sd done' : i === n ? 'sd active' : 'sd';
      const txt = i < n ? '&#10003;' : i;
      html += '<div class="' + cls + '">' + txt + '</div>';
      if (i < total) html += '<div class="sl' + (i < n ? ' done' : '') + '"></div>';
    }
    stepsEl.innerHTML = html;
  }

  _renderStep() {
    const c = this.shadowRoot.getElementById('wiz-content');
    if (this._step === 1) this._renderStep1(c);
    else if (this._step === 2) this._renderStep2(c);
    else if (this._step === 3) this._renderStep3(c);
    else if (this._step === 4) this._renderStep4(c);
    else if (this._step === 5) this._renderStep5(c);
    else if (this._step === 6) this._renderStep6(c);
  }

  _goStep(n) {
    this._step = n;
    this._updateSteps();
    this._renderStep();
    if (n === 3 && this._state.detectMode === 'lokaal') this._detectEntities();
    if (n === 4) this._fetchOtherEntities();
  }

  _renderStep1(c) {
    c.innerHTML = '<h2>Welkom aan boord!</h2>' +
      '<p class="sub">Deze wizard configureert de Finally Card voor dit schip. Volg de stappen om te beginnen.</p>' +
      '<label>NAAM VAN HET SCHIP</label>' +
      '<input type="text" id="inp-bootnaam" placeholder="bijv. Twin Dolphins" value="' + (this._state.bootNaam || '') + '">' +
      '<div id="msg1"></div>' +
      '<div class="btn-row"><button class="btn btn-p" data-action="step1next">Volgende ›</button></div>';
  }

  _renderStep2(c) {
    const a = this._state.apparatuur;
    const items = [
      { key:'cerbo', lbl:'Cerbo GX', sub:'GX apparaat' },
      { key:'shunt', lbl:'SmartShunt', sub:'Accubewaking' },
      { key:'quattro', lbl:'Quattro / Multiplus', sub:'Omvormer/lader' },
      { key:'mppt', lbl:'SmartSolar MPPT', sub:'Zonnelader' },
      { key:'shelly', lbl:'Shelly schakelaar', sub:'Walstroom' },
      { key:'generator', lbl:'Generator', sub:'Noodstroom' },
      { key:'tanks', lbl:'Tanksensoren', sub:'Water / diesel' },
    ];
    c.innerHTML = '<h2>Aanwezige apparatuur</h2>' +
      '<p class="sub">Selecteer wat aanwezig is op dit schip. Geselecteerde items zijn blauw omrand.</p>' +
      '<div class="toggle-grid">' +
      items.map(it => '<div class="ti ' + (a[it.key] ? 'on' : '') + '" data-action="toggle" data-key="' + it.key + '">' +
        '<div class="ti-check"><span class="ti-checkmark">&#10003;</span></div>' +
        '<div><div class="ti-lbl">' + it.lbl + '</div><div class="ti-sub">' + it.sub + '</div></div>' +
        '</div>').join('') +
      '</div>' +
      '<div class="btn-row">' +
      '<button class="btn btn-s" data-action="step" data-n="1">‹ Terug</button>' +
      '<button class="btn btn-p" data-action="step" data-n="3">Volgende ›</button>' +
      '</div>';
  }

  _renderStep3(c) {
    const mode = this._state.detectMode;
    const vrm = this._state.vrm;
    c.innerHTML = '<h2>Serienummers detecteren</h2>' +
      '<p class="sub">Victron apparaten worden automatisch gevonden. Niet gevonden? Voer het serienummer handmatig in.</p>' +
      '<div class="toggle-grid" style="grid-template-columns:1fr 1fr;margin-bottom:20px">' +
      '<div class="ti ' + (mode==='lokaal'?'on':'') + '" data-action="detectmode" data-mode="lokaal">' +
      '<div class="ti-check"><span class="ti-checkmark">&#10003;</span></div>' +
      '<div><div class="ti-lbl">Lokaal detecteren</div><div class="ti-sub">Dit apparaat, hier ter plaatse</div></div></div>' +
      '<div class="ti ' + (mode==='vrm'?'on':'') + '" data-action="detectmode" data-mode="vrm">' +
      '<div class="ti-check"><span class="ti-checkmark">&#10003;</span></div>' +
      '<div><div class="ti-lbl">Op afstand via VRM</div><div class="ti-sub">Portal-ID + Access Token</div></div></div>' +
      '</div>' +
      (mode === 'vrm' ?
        '<div id="vrm-form" style="margin-bottom:20px">' +
        '<label>VRM PORTAL-ID</label>' +
        '<input type="text" id="vrm-portalid" placeholder="bijv. 48e7da8657a1" value="' + (vrm.portalId||'') + '">' +
        '<label style="margin-top:14px">VRM ACCESS TOKEN</label>' +
        '<input type="text" id="vrm-token" placeholder="Token uit VRM \u2192 Preferences \u2192 Access tokens" value="' + (vrm.token||'') + '">' +
        '<div class="btn-row"><button class="btn btn-p" data-action="vrmfetch" style="width:100%">Apparaten ophalen via VRM</button></div>' +
        '</div>' : '') +
      '<div id="det-list">' + (mode === 'vrm' ? '<div class="msg info">Vul Portal-ID en Access Token in, en klik op "Apparaten ophalen".</div>' : '<div class="msg info"><span class="spinner"></span>Entiteiten ophalen...</div>') + '</div>' +
      '<div id="btn3" style="display:none">' +
      '<div class="btn-row">' +
      '<button class="btn btn-s" data-action="step" data-n="2">‹ Terug</button>' +
      '<button class="btn btn-p" data-action="step" data-n="4">Volgende ›</button>' +
      '</div></div>';
  }

  async _fetchVrmDevices() {
    const s = this._state;
    const list = this.shadowRoot.getElementById('det-list');
    const portalId = (this.shadowRoot.getElementById('vrm-portalid')||{}).value?.trim() || '';
    const token = (this.shadowRoot.getElementById('vrm-token')||{}).value?.trim() || '';
    s.vrm.portalId = portalId;
    s.vrm.token = token;
    if (!portalId || !token) {
      list.innerHTML = '<div class="msg err">✗ Vul zowel Portal-ID als Access Token in.</div>';
      return;
    }
    list.innerHTML = '<div class="msg info"><span class="spinner"></span>Verbinden met VRM (via Home Assistant)...</div>';
    try {
      if (!this._hass) throw new Error('Geen verbinding met Home Assistant beschikbaar.');

      // Stap A: numerieke gebruikers-ID ophalen (VRM accepteert 'me' niet in /installations)
      const meResult = await this._hass.callService('rest_command', 'vrm_me', { token }, undefined, true, true);
      const meStatus = meResult?.response?.status_code;
      if (meStatus && meStatus >= 400) throw new Error('VRM-login mislukt (HTTP ' + meStatus + '). Klopt de token nog?');
      const meContent = meResult?.response?.content;
      if (!meContent) throw new Error('Geen antwoord ontvangen van de rest_command-service "vrm_me". Is configuration.yaml bijgewerkt en HA herstart?');
      const meData = (typeof meContent === 'string') ? JSON.parse(meContent) : meContent;
      const userId = meData?.user?.id;
      if (!userId) throw new Error('Kon gebruikers-ID niet uit VRM-antwoord halen.');

      // Server-side call via rest_command — omzeilt browser-CORS omdat HA zelf de aanroep doet, niet de browser.
      const instResult = await this._hass.callService('rest_command', 'vrm_installations', { token, user_id: userId }, undefined, true, true);
      const instStatus = instResult?.response?.status_code;
      if (instStatus && instStatus >= 400) throw new Error('VRM-login mislukt (HTTP ' + instStatus + '). Klopt de token nog?');
      const instContent = instResult?.response?.content;
      if (!instContent) throw new Error('Geen antwoord ontvangen van de rest_command-service. Is "rest_command: vrm_installations" toegevoegd aan configuration.yaml en is HA herstart?');
      const instData = (typeof instContent === 'string') ? JSON.parse(instContent) : instContent;
      console.log('VRM installations raw response:', instData);
      const records = instData.records || [];
      const inst = records.find(r => r.identifier === portalId) || records.find(r => String(r.idSite) === portalId);
      if (!inst) throw new Error('Portal-ID "' + portalId + '" niet gevonden bij dit account. Gevonden installaties: ' + (records.map(r=>r.identifier).join(', ') || '(geen)'));
      s.vrm.idSite = inst.idSite;

      const diagResult = await this._hass.callService('rest_command', 'vrm_diagnostics', { token, id_site: inst.idSite }, undefined, true, true);
      const diagStatus = diagResult?.response?.status_code;
      if (diagStatus && diagStatus >= 400) throw new Error('Kon apparaten niet ophalen (HTTP ' + diagStatus + ')');
      const diagContent = diagResult?.response?.content;
      if (!diagContent) throw new Error('Geen antwoord ontvangen van de rest_command-service voor diagnostics.');
      const diagData = (typeof diagContent === 'string') ? JSON.parse(diagContent) : diagContent;
      s.vrm.devices = diagData.records || diagData || [];
      console.log('VRM diagnostics raw data (JSON, eerste 30):\n' + JSON.stringify(s.vrm.devices.slice(0, 30), null, 2));
      this._parseVrmDevices(list);
    } catch (err) {
      list.innerHTML = '<div class="msg err">✗ ' + err.message + '</div>';
      console.error('VRM fetch (server-side) fout:', err);
    }
  }

  _parseVrmDevices(list) {
    const s = this._state;
    const devices = s.vrm.devices;

    // Groepeer diagnostics-regels per apparaat: Device-type + instance (echte VRM-veldnamen)
    const byDevice = {};
    devices.forEach(r => {
      const dev = r.Device || 'Onbekend';
      const inst = r.instance !== undefined ? r.instance : 0;
      const key = dev + '#' + inst;
      if (!byDevice[key]) byDevice[key] = [];
      byDevice[key].push(r);
    });

    const results = [];
    const findVal = (rows, ...descriptions) => {
      const row = rows.find(r => descriptions.some(d => (r.description || '').toLowerCase() === d.toLowerCase()));
      return row ? (row.formattedValue ?? row.rawValue ?? '') : null;
    };

    const deviceTypeMap = {
      'gateway': 'cerbo',
      've.bus system': 'quattro',
      'battery monitor': 'shunt',
      'solar charger': 'mppt'
    };
    const nameFieldMap = {
      cerbo: 'MachineName',
      quattro: 'Mk2 product name',
      shunt: 'Model',
      mppt: 'Solarcharger model'
    };
    const serialFieldMap = {
      cerbo: 'Machine serial number',
      quattro: 'Serial number of 1st device',
      shunt: 'Serial Number',
      mppt: 'Solar charger serial number'
    };

    Object.entries(byDevice).forEach(([key, rows]) => {
      const deviceType = String(rows[0]?.Device || '').toLowerCase();
      const mapped = deviceTypeMap[deviceType];
      if (!mapped) return; // System overview / BMS / Generator start-stop / Temperature sensor: geen van de vier hoofdapparaten
      const productName = findVal(rows, nameFieldMap[mapped]) || rows[0]?.Device || '';
      const serial = findVal(rows, serialFieldMap[mapped]) || ('instance-' + key);
      const niceNames = { cerbo: 'GX Device', quattro: 'Quattro/MultiPlus', shunt: 'SmartShunt', mppt: 'SmartSolar MPPT' };
      s.serials[mapped] = serial;
      if (mapped === 'cerbo') s.entities.load = serial; // GX Device wordt in stap 5 via entities.load getoond
      results.push({ key: mapped, found: true, name: productName || niceNames[mapped], id: serial });
    });

    console.log('VRM apparaat-groepen gevonden (Device#instance → MachineName):',
      Object.entries(byDevice).map(([key, rows]) => key + ' → ' + (findVal(rows, 'MachineName') || '(geen MachineName)')).join(' | '));
    console.log('VRM velden per apparaatgroep:', Object.entries(byDevice).map(([key, rows]) =>
      key + ' → beschrijvingen: ' + [...new Set(rows.map(r => r.description))].join(', ')
    ).join('\n'));

    if (results.length === 0) {
      list.innerHTML = '<div class="msg err">✗ Verbinding gelukt, maar geen herkenbare apparaten gevonden in de diagnostics-data. Mogelijk is het dataformaat van VRM anders dan verwacht — meld dit terug met de ruwe data (console).</div>';
      console.log('VRM diagnostics raw data (JSON, eerste 30):\n' + JSON.stringify(devices.slice(0, 30), null, 2));
      return;
    }

    list.innerHTML = '<div class="msg info" style="margin-bottom:12px">✓ Verbonden via VRM — ' + results.length + ' apparaat/apparaten gevonden.</div>' +
      results.map(r => '<div class="det-item found"><div style="flex:1">' +
        '<div class="di-name">' + r.name + '</div>' +
        '<div class="di-id">' + r.id + '</div></div>' +
        '<div class="di-status">&#10003; via VRM</div></div>').join('');

    const btn3 = this.shadowRoot.getElementById('btn3');
    if (btn3) btn3.style.display = 'block';
  }

  _detectEntities() {
    if (!this._hass) return;
    const states = this._hass.states;
    const allKeys = Object.keys(states);
    const results = [];
    const s = this._state;

    // SmartShunt — zoek op meerdere patronen
    let shuntE = allKeys.find(e => e.startsWith('sensor.smartshunt_') && e.endsWith('_spanning'));
    if (!shuntE) shuntE = allKeys.find(e => e.startsWith('sensor.smartshunt_') && e.includes('_state_of_charge'));
    if (!shuntE) shuntE = allKeys.find(e => e.startsWith('sensor.smartshunt_') && e.includes('_voltage'));
    if (shuntE) {
      const parts = shuntE.replace('sensor.smartshunt_', '').split('_');
      const serial = parts.slice(0, -1).join('_');
      s.serials.shunt = serial;
      s.entities.batterij = 'sensor.smartshunt_' + serial + '_batterij';
      s.entities.spanning = 'sensor.smartshunt_' + serial + '_spanning';
      s.entities.stroom = 'sensor.smartshunt_' + serial + '_stroom';
      results.push({ key:'shunt', found: true, name: 'SmartShunt', id: serial });
    } else {
      results.push({ key:'shunt', found: false, name: 'SmartShunt', id: s.manualSerials.shunt || '' });
    }

    // MPPT — zoek op meerdere patronen (VE.Direct en VE.Can)
    let mpptE = allKeys.find(e => e.includes('smartsolar') && e.includes('pv_power') && !e.includes('pv_yield_power'));
    if (!mpptE) mpptE = allKeys.find(e => e.includes('smartsolar') && e.includes('pv_yield_power'));
    if (!mpptE) mpptE = allKeys.find(e => e.includes('mppt') && e.includes('pv_power'));
    if (!mpptE) mpptE = allKeys.find(e => e.includes('smartsolar') && e.includes('yield_today'));
    if (mpptE) {
      const serial = mpptE.replace('sensor.', '')
        .replace(/_pv_yield_power_\d+$/, '')
        .replace(/_pv_power$/, '')
        .replace(/_yield_today$/, '');
      s.serials.mppt = serial;
      s.entities.pvPower = mpptE;
      // Extra velden voor mppt_*_entity config-overrides — alleen zetten als de entity ook echt bestaat
      const mpptStateE = 'sensor.' + serial + '_state';
      const mpptYieldYesterdayE = 'sensor.' + serial + '_yield_yesterday';
      const mpptMaxPowerTodayE = 'sensor.' + serial + '_max_power_today';
      if (allKeys.includes(mpptStateE)) s.entities.mpptState = mpptStateE;
      if (allKeys.includes(mpptYieldYesterdayE)) s.entities.mpptYieldYesterday = mpptYieldYesterdayE;
      if (allKeys.includes(mpptMaxPowerTodayE)) s.entities.mpptMaxPowerToday = mpptMaxPowerTodayE;
      results.push({ key:'mppt', found: true, name: 'SmartSolar MPPT', id: serial });
    } else {
      results.push({ key:'mppt', found: false, name: 'SmartSolar MPPT', id: s.manualSerials.mppt || '' });
    }

    // Quattro/Multiplus
    let quattroE = allKeys.find(e => (e.includes('quattro') || e.includes('multiplus')) && e.endsWith('_input_voltage_l1'));
    if (!quattroE) quattroE = allKeys.find(e => (e.includes('quattro') || e.includes('multiplus')) && e.includes('input_voltage'));
    if (quattroE) {
      const serial = quattroE.replace('sensor.', '').replace(/_input_voltage.*$/, '');
      s.serials.quattro = serial;
      s.entities.acInV = quattroE;
      s.entities.acInW = 'sensor.' + serial + '_input_power_l1';
      // Extra velden voor quattro_*_entity config-overrides — alleen zetten als de entity ook echt bestaat
      const quattroFields = {
        quattroDcVoltage: '_dc_voltage',
        quattroHighTempAlarm: '_high_temperature_alarm',
        quattroLowBatteryAlarm: '_low_battery_alarm',
        quattroOverloadAlarm: '_overload_alarm',
        quattroOutputVoltageL1: '_output_voltage_l1',
        quattroOutputFrequencyL1: '_output_frequency_l1',
        quattroOutputPowerL1: '_output_power_l1',
      };
      Object.entries(quattroFields).forEach(([key, suffix]) => {
        const e = 'sensor.' + serial + suffix;
        if (allKeys.includes(e)) s.entities[key] = e;
      });
      results.push({ key:'quattro', found: true, name: 'Quattro / Multiplus', id: serial });
    } else {
      results.push({ key:'quattro', found: false, name: 'Quattro / Multiplus', id: s.manualSerials.quattro || '' });
    }

    // GX Device
    const gxPv = allKeys.find(e => e === 'sensor.gx_device_pv_power');
    if (gxPv) {
      s.entities.pvPower = 'sensor.gx_device_pv_power';
      s.entities.load = 'sensor.gx_device_consumption_power_l1';
      s.entities.dcBattery = 'sensor.gx_device_dc_battery_power';
      results.push({ key:'cerbo', found: true, name: 'GX Device', id: 'gx_device' });
    } else {
      results.push({ key:'cerbo', found: false, name: 'GX Device', id: 'niet gevonden' });
    }

    // JK BMS 1 & 2 — zoek op patroon jk_bms_N_<alias>_soc (naamgeving sinds de Batmon-rename van juni 2026;
    // vóór die rename heette dit sensor.jk_bms_N_jk_bms_N_soc, wat NIET meer als universele default geldt)
    const bms1E = allKeys.find(e => /^sensor\.jk_bms_1_.+_soc$/.test(e));
    if (bms1E) {
      const prefix = bms1E.replace(/^sensor\./, '').replace(/_soc$/, '');
      s.serials.bms1 = prefix;
      s.entities.bms1Prefix = prefix;
      results.push({ key:'bms1', found: true, name: 'JK BMS 1', id: prefix });
    } else {
      results.push({ key:'bms1', found: false, name: 'JK BMS 1', id: s.manualSerials.bms1 || '' });
    }
    const bms2E = allKeys.find(e => /^sensor\.jk_bms_2_.+_soc$/.test(e));
    if (bms2E) {
      const prefix = bms2E.replace(/^sensor\./, '').replace(/_soc$/, '');
      s.serials.bms2 = prefix;
      s.entities.bms2Prefix = prefix;
      results.push({ key:'bms2', found: true, name: 'JK BMS 2', id: prefix });
    } else {
      results.push({ key:'bms2', found: false, name: 'JK BMS 2', id: s.manualSerials.bms2 || '' });
    }

    // Watertank — patroon nog niet bevestigd op live Cerbo-tanksysteem, dus breed zoeken op
    // meerdere mogelijke naamgevingen (officiële victron_gx tank-integratie, Tuya-niveausensor, generiek).
    // Percentage-sensoren de voorkeur geven boven liter-sensoren zodat capaciteit apart configureerbaar blijft.
    let tankE = allKeys.find(e => /^sensor\..*tank.*(niveau|level)/i.test(e) && states[e]?.attributes?.unit_of_measurement === '%');
    if (!tankE) tankE = allKeys.find(e => /^sensor\.gx_device_tank_\d+_level/.test(e));
    if (!tankE) tankE = allKeys.find(e => /watertank/i.test(e) && states[e]?.attributes?.unit_of_measurement === '%');
    if (tankE) {
      s.entities.watertankLevel = tankE;
      results.push({ key:'tank', found: true, name: 'Watertank', id: tankE });
    } else {
      results.push({ key:'tank', found: false, name: 'Watertank', id: s.manualSerials.tank || '' });
    }

    // Shelly
    const shellyE = allKeys.find(e => e.startsWith('switch.shelly'));
    if (shellyE) {
      s.serials.shelly = shellyE;
      s.entities.walstroom = shellyE;
      results.push({ key:'shelly', found: true, name: 'Shelly (walstroom)', id: shellyE });
    } else {
      results.push({ key:'shelly', found: false, name: 'Shelly (walstroom)', id: s.manualSerials.shelly || '' });
    }

    const list = this.shadowRoot.getElementById('det-list');
    if (list) {
      list.innerHTML = results.map(r => {
        const needsManual = !r.found && ['shunt','mppt','quattro','bms1','bms2','tank'].includes(r.key);
        return '<div class="det-item ' + (r.found ? 'found' : needsManual ? 'manual' : 'missing') + '">' +
          '<div style="flex:1">' +
          '<div class="di-name">' + r.name + '</div>' +
          '<div class="di-id">' + (r.found ? r.id : '') + '</div>' +
          (needsManual ? '<input type="text" class="manual-inp" data-manual="' + r.key + '" placeholder="Voer serienummer in..." value="' + (r.id || '') + '">' : '') +
          '</div>' +
          '<div class="di-status">' + (r.found ? '&#10003; gevonden' : needsManual ? '&#9998; handmatig' : '&#8722; n.v.t.') + '</div>' +
          '</div>';
      }).join('');

      // Luister naar handmatige invoer
      list.querySelectorAll('.manual-inp').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const key = e.target.dataset.manual;
          s.manualSerials[key] = e.target.value.trim();
          if (key === 'shunt' && e.target.value.trim()) {
            const serial = e.target.value.trim();
            s.serials.shunt = serial;
            s.entities.batterij = 'sensor.smartshunt_' + serial + '_batterij';
            s.entities.spanning = 'sensor.smartshunt_' + serial + '_spanning';
            s.entities.stroom = 'sensor.smartshunt_' + serial + '_stroom';
          }
          if (key === 'mppt' && e.target.value.trim()) {
            s.serials.mppt = e.target.value.trim();
          }
          if (key === 'quattro' && e.target.value.trim()) {
            const serial = e.target.value.trim();
            s.serials.quattro = serial;
            s.entities.acInV = 'sensor.' + serial + '_input_voltage_l1';
            s.entities.acInW = 'sensor.' + serial + '_input_power_l1';
          }
          if (key === 'bms1' && e.target.value.trim()) {
            s.serials.bms1 = e.target.value.trim();
            s.entities.bms1Prefix = e.target.value.trim();
          }
          if (key === 'bms2' && e.target.value.trim()) {
            s.serials.bms2 = e.target.value.trim();
            s.entities.bms2Prefix = e.target.value.trim();
          }
          if (key === 'tank' && e.target.value.trim()) {
            s.entities.watertankLevel = e.target.value.trim();
          }
        });
      });
    }
    const btn3 = this.shadowRoot.getElementById('btn3');
    if (btn3) btn3.style.display = 'block';
  }

  _renderStep4(c) {
    c.innerHTML = '<h2>Overige sensoren</h2>' +
      '<p class="sub">Zigbee-, Tuya- en andere niet-Victron sensoren die je eventueel wilt koppelen (binnentemperatuur, windrichting, verwarming, douchepomp, etc). Volledig optioneel — sla over als niet van toepassing.</p>' +
      '<div id="other-list"><div class="msg info"><span class="spinner"></span>Entiteiten ophalen...</div></div>' +
      '<div class="btn-row">' +
      '<button class="btn btn-s" data-action="step" data-n="3">‹ Terug</button>' +
      '<button class="btn btn-p" data-action="step" data-n="5">Volgende ›</button>' +
      '</div>';
  }

  async _fetchOtherEntities() {
    const list = this.shadowRoot.getElementById('other-list');
    if (!list) return;
    if (!this._hass) {
      list.innerHTML = '<div class="msg err">Geen verbinding met Home Assistant beschikbaar.</div>';
      return;
    }
    list.innerHTML = '<div class="msg info"><span class="spinner"></span>Entiteiten ophalen...</div>';
    try {
      const registry = await this._hass.callWS({ type: 'config/entity_registry/list' });
      // Entiteiten die al bij Victron/BMS/Watertank/Shelly zijn toegewezen (stap 3) niet nogmaals tonen
      const known = new Set(Object.values(this._state.entities).filter(v => typeof v === 'string'));
      // Voor de zekerheid ook uitsluiten op naampatroon, mocht een Victron-achtige entity niet in s.entities zitten
      const excludePattern = /^(sensor|switch|number)\.(gx_device_|quattro_|multiplus_|smartsolar_|smartshunt_|jk_bms_|shelly)/i;
      const relevantDomains = ['sensor', 'binary_sensor', 'switch', 'climate'];
      // Platforms die doorgaans "eigen" installateur-gekozen entity-namen hebben — niet met zekerheid te
      // raden zoals de Victron-namen, dus hier tonen we ze als keuzelijst i.p.v. te proberen te detecteren
      const relevantPlatforms = ['tuya', 'tuya_local', 'zha', 'zigbee2mqtt', 'mqtt', 'esphome'];
      const groups = {};
      registry.forEach(entry => {
        if (!entry || entry.disabled_by) return;
        const domain = entry.entity_id.split('.')[0];
        if (!relevantDomains.includes(domain)) return;
        if (known.has(entry.entity_id)) return;
        if (excludePattern.test(entry.entity_id)) return;
        const platform = entry.platform || '';
        if (!relevantPlatforms.includes(platform)) return;
        if (!groups[platform]) groups[platform] = [];
        groups[platform].push(entry.entity_id);
      });
      this._otherEntityGroups = groups;
      this._renderOtherEntities();
    } catch (err) {
      list.innerHTML = '<div class="msg err">Kon entiteiten-register niet ophalen: ' + (err && err.message ? err.message : err) + '</div>';
    }
  }

  _otherRoleOptions() {
    return [
      ['', '— niet gebruiken —'],
      ['indoor_temp_entity', 'Binnentemperatuur'],
      ['indoor_humidity_entity', 'Binnenluchtvochtigheid'],
      ['wind_direction_entity', 'Windrichting'],
      ['wind_entity', 'Windvermogen/snelheid'],
      ['heating_climate_entity', 'Verwarming (climate)'],
      ['kabola_climate_entity', 'Kabola-thermostaat (climate)'],
      ['douchepomp_switch_entity', 'Douchepomp (switch)'],
      ['watertank_level_entity', 'Watertank niveau (override)'],
    ];
  }

  _renderOtherEntities() {
    const list = this.shadowRoot.getElementById('other-list');
    if (!list) return;
    const groups = this._otherEntityGroups || {};
    const platformNames = { tuya: 'Tuya', tuya_local: 'Tuya (lokaal)', zha: 'Zigbee (ZHA)', zigbee2mqtt: 'Zigbee2MQTT', mqtt: 'MQTT', esphome: 'ESPHome' };
    const roleOptions = this._otherRoleOptions();
    const otherRoles = this._state.otherRoles || {};
    const reverseMap = {};
    Object.entries(otherRoles).forEach(([k, v]) => { reverseMap[v] = k; });
    const platforms = Object.keys(groups);
    if (platforms.length === 0) {
      list.innerHTML = '<div class="msg info">Geen aanvullende Zigbee/Tuya/MQTT/ESPHome-sensoren gevonden (of alles was al gekoppeld bij een eerdere stap). Dat is geen probleem — deze stap is optioneel.</div>';
      return;
    }
    let html = '';
    platforms.forEach(p => {
      html += '<div style="margin:14px 0 6px;font-size:12px;font-weight:700;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.5px">' + (platformNames[p] || p) + '</div>';
      groups[p].forEach(entityId => {
        const st = this._hass && this._hass.states[entityId];
        const friendly = (st && st.attributes && st.attributes.friendly_name) || entityId;
        const currentRole = reverseMap[entityId] || '';
        html += '<div class="fr" style="align-items:center;gap:8px">' +
          '<span class="fk" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + friendly +
          '<br><span style="font-size:10px;opacity:0.5">' + entityId + '</span></span>' +
          '<select data-role-entity="' + entityId + '" style="max-width:180px;flex-shrink:0">' +
          roleOptions.map(([k, lbl]) => '<option value="' + k + '"' + (k === currentRole ? ' selected' : '') + '>' + lbl + '</option>').join('') +
          '</select>' +
          '</div>';
      });
    });
    list.innerHTML = html;
  }

  _renderStep5(c) {
    const foto = this._state.fotoDataUrl;
    c.innerHTML = '<h2>Foto van het schip</h2>' +
      '<p class="sub">Upload een foto — dit wordt de achtergrond van het dashboard. Landschap formaat werkt het best.</p>' +
      '<div class="photo-drop" data-action="photo-click">' +
      (foto
        ? '<img src="' + foto + '" alt="boot"><div class="photo-overlay">&#128247; Klik om te wijzigen</div>'
        : '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" style="display:block;margin:0 auto"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><p>Tik om een foto te kiezen</p><p style="font-size:10px;margin-top:4px;color:rgba(255,255,255,0.95)">JPG, PNG, WEBP</p>') +
      '</div>' +
      '<input type="file" id="foto-input" accept="image/*" style="display:none">' +
      '<div class="btn-row">' +
      '<button class="btn btn-s" data-action="step" data-n="4">‹ Terug</button>' +
      '<button class="btn btn-p" data-action="step" data-n="6">Voltooien ›</button>' +
      '</div>';
  }

  _buildEntityConfigYaml() {
    const e = this._state.entities;
    const map = [
      ['smartshunt_soc_entity', e.batterij],
      ['smartshunt_voltage_entity', e.spanning],
      ['smartshunt_current_entity', e.stroom],
      ['mppt_state_entity', e.mpptState],
      ['mppt_yield_yesterday_entity', e.mpptYieldYesterday],
      ['mppt_max_power_today_entity', e.mpptMaxPowerToday],
      ['quattro_dc_voltage_entity', e.quattroDcVoltage],
      ['quattro_high_temp_alarm_entity', e.quattroHighTempAlarm],
      ['quattro_input_power_l1_entity', e.acInW],
      ['quattro_input_voltage_l1_entity', e.acInV],
      ['quattro_low_battery_alarm_entity', e.quattroLowBatteryAlarm],
      ['quattro_output_frequency_l1_entity', e.quattroOutputFrequencyL1],
      ['quattro_output_power_l1_entity', e.quattroOutputPowerL1],
      ['quattro_output_voltage_l1_entity', e.quattroOutputVoltageL1],
      ['quattro_overload_alarm_entity', e.quattroOverloadAlarm],
      ['bms1_entity_prefix', e.bms1Prefix],
      ['bms2_entity_prefix', e.bms2Prefix],
      ['watertank_level_entity', e.watertankLevel],
    ];
    const usedKeys = new Set(map.filter(([, val]) => !!val).map(([key]) => key));
    Object.entries(this._state.otherRoles || {}).forEach(([key, val]) => {
      if (val && !usedKeys.has(key)) map.push([key, val]);
    });
    const lines = map.filter(([, val]) => !!val).map(([key, val]) => key + ': ' + val);
    return lines.join('\n');
  }

  _renderStep6(c) {
    const s = this._state;
    const status = (val) => val ? 'ok' : 'missing';
    const txt = (val) => val || '— niet geconfigureerd';

    c.innerHTML = '<h2 style="text-align:center">&#9875; Installatie voltooid!</h2>' +
      '<p class="sub" style="text-align:center">Controleer de configuratie en sla op.</p>' +
      (s.fotoDataUrl
        ? '<img src="' + s.fotoDataUrl + '" style="width:100%;height:120px;border-radius:8px;object-fit:cover;object-position:center;margin-bottom:14px;display:block">'
        : '') +
      '<div class="finish-details">' +
      '<div class="fr"><span class="fk">Schip</span><span class="fv ok">' + (s.bootNaam || '—') + '</span></div>' +
      '<div class="fr"><span class="fk">SmartShunt</span><span class="fv ' + status(s.serials.shunt) + '">' + txt(s.serials.shunt) + '</span></div>' +
      '<div class="fr"><span class="fk">MPPT</span><span class="fv ' + status(s.serials.mppt) + '">' + txt(s.serials.mppt) + '</span></div>' +
      '<div class="fr"><span class="fk">Quattro/Multi</span><span class="fv ' + status(s.serials.quattro) + '">' + txt(s.serials.quattro) + '</span></div>' +
      '<div class="fr"><span class="fk">GX Device</span><span class="fv ' + status(s.entities.load) + '">' + (s.entities.load ? '&#10003; gevonden' : '— niet gevonden') + '</span></div>' +
      '<div class="fr"><span class="fk">JK BMS 1</span><span class="fv ' + status(s.entities.bms1Prefix) + '">' + txt(s.entities.bms1Prefix) + '</span></div>' +
      '<div class="fr"><span class="fk">JK BMS 2</span><span class="fv ' + status(s.entities.bms2Prefix) + '">' + txt(s.entities.bms2Prefix) + '</span></div>' +
      '<div class="fr"><span class="fk">Watertank</span><span class="fv ' + status(s.entities.watertankLevel) + '">' + txt(s.entities.watertankLevel) + '</span></div>' +
      '<div class="fr"><span class="fk">Overige sensoren</span><span class="fv ' + (Object.keys(s.otherRoles || {}).length ? 'ok' : 'missing') + '">' + (Object.keys(s.otherRoles || {}).length ? Object.keys(s.otherRoles).length + ' gekoppeld' : '— geen gekoppeld') + '</span></div>' +
      '<div class="fr"><span class="fk">Walstroom</span><span class="fv ' + status(s.serials.shelly) + '">' + txt(s.serials.shelly) + '</span></div>' +
      '<div class="fr"><span class="fk">Foto</span><span class="fv ' + (s.fotoDataUrl ? 'ok' : 'warn') + '">' + (s.fotoDataUrl ? '&#10003; geüpload' : '— geen foto') + '</span></div>' +
      '</div>' +
      '<div class="msg ok" style="margin-top:12px" id="save-msg">Klaar om op te slaan.</div>' +
      (this._buildEntityConfigYaml()
        ? '<div style="margin-top:14px">' +
          '<p class="sub" style="margin-bottom:6px">Plak deze regels in de <code>this._config</code> van je dashboard-kaart (onder de bestaande instellingen). Dit koppelt de kaart aan de zojuist gedetecteerde SmartShunt/MPPT/Quattro op dit schip in plaats van aan Eriks eigen serienummers. Voeg bij een gevonden watertank ook handmatig <code>watertank_capacity_l: &lt;liters&gt;</code> toe — dat kan niet automatisch worden afgeleid:</p>' +
          '<textarea id="entity-config-yaml" readonly style="width:100%;min-height:180px;font-family:monospace;font-size:12px;background:rgba(0,0,0,0.3);color:#aaffcc;border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:8px;box-sizing:border-box" onclick="this.select()">' + this._buildEntityConfigYaml() + '</textarea>' +
          '<button class="btn btn-s" style="margin-top:6px" data-action="copy-config">&#128203; Kopieer naar klembord</button>' +
          '<span id="copy-msg" style="margin-left:8px;font-size:12px;color:#aaffcc"></span>' +
          '</div>'
        : '') +
      '<div class="btn-row">' +
      '<button class="btn btn-s" data-action="step" data-n="5">‹ Terug</button>' +
      '<button class="btn btn-p" data-action="save">&#128190; Opslaan & toepassen</button>' +
      '</div>';
  }

  _handleClick(e) {
    const action = e.target.closest('[data-action]');
    if (!action) return;
    const act = action.dataset.action;

    if (act === 'step') {
      this._goStep(parseInt(action.dataset.n));
    } else if (act === 'toggle') {
      const key = action.dataset.key;
      this._state.apparatuur[key] = !this._state.apparatuur[key];
      action.classList.toggle('on');
    } else if (act === 'step1next') {
      const inp = this.shadowRoot.getElementById('inp-bootnaam');
      if (!inp || !inp.value.trim()) {
        const msg = this.shadowRoot.getElementById('msg1');
        if (msg) { msg.className = 'msg err'; msg.textContent = 'Vul een naam in voor het schip.'; }
        return;
      }
      this._state.bootNaam = inp.value.trim();
      this._goStep(2);
    } else if (act === 'photo-click') {
      const inp = this.shadowRoot.getElementById('foto-input');
      if (inp) inp.click();
    } else if (act === 'detectmode') {
      this._state.detectMode = action.dataset.mode;
      this._renderStep();
      if (this._state.detectMode === 'lokaal') this._detectEntities();
    } else if (act === 'vrmfetch') {
      this._fetchVrmDevices();
    } else if (act === 'save') {
      this._saveConfig();
    } else if (act === 'copy-config') {
      const ta = this.shadowRoot.getElementById('entity-config-yaml');
      const msg = this.shadowRoot.getElementById('copy-msg');
      if (!ta) return;
      const done = () => { if (msg) msg.textContent = '&#10003; gekopieerd!'.replace('&#10003;', '✓'); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ta.value).then(done).catch(() => {
          ta.select(); document.execCommand('copy'); done();
        });
      } else {
        ta.select(); document.execCommand('copy'); done();
      }
    }
  }

  _handleChange(e) {
    if (e.target.id === 'foto-input') {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        this._state.fotoDataUrl = ev.target.result;
        this._renderStep();
      };
      reader.readAsDataURL(file);
    }
    if (e.target.dataset.roleEntity) {
      const entityId = e.target.dataset.roleEntity;
      const roleKey = e.target.value;
      const s = this._state;
      if (!s.otherRoles) s.otherRoles = {};
      // Deze entity uit een eventuele eerder toegewezen rol halen, voorkomt dubbele toewijzing
      Object.keys(s.otherRoles).forEach(k => { if (s.otherRoles[k] === entityId) delete s.otherRoles[k]; });
      if (roleKey) s.otherRoles[roleKey] = entityId;
    }
  }

  _saveConfig() {
    const config = {
      bootNaam: this._state.bootNaam,
      fotoDataUrl: this._state.fotoDataUrl,
      entities: this._state.entities,
      serials: this._state.serials,
      apparatuur: this._state.apparatuur,
      otherRoles: this._state.otherRoles,
      savedAt: new Date().toISOString()
    };
    const msg = this.shadowRoot.getElementById('save-msg');
    try {
      localStorage.setItem('finally_card_customer_config', JSON.stringify(config));
      if (msg) { msg.className = 'msg ok'; msg.textContent = '&#10003; Configuratie opgeslagen!'; }
    } catch(e) {
      if (msg) { msg.className = 'msg err'; msg.textContent = 'Fout bij opslaan: ' + e.message; }
    }
  }
}

customElements.define('finally-wizard-customer', FinallyWizard);
