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
    if (now - this._lastUpdate > 2000) {
      this._lastUpdate = now;
      this._render();
    }
    if (!this._historyLoaded || now - this._lastHistoryLoad > 600000) {
      this._lastHistoryLoad = now;
      this._historyLoaded = true;
      this._loadWaterHistory();
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

  _waterSparkline(w, h) {
    if (!this._waterHistory || this._waterHistory.length < 2) return '';
    const data = this._waterHistory;
    const vals = data.map(d => d.v);
    const times = data.map(d => d.t);
    const minV = Math.min(...vals) - 1, maxV = Math.max(...vals) + 1;
    const minT = Math.min(...times), maxT = Math.max(...times);
    const rng = maxV - minV || 1;
    const px = t => ((t - minT) / (maxT - minT)) * (w - 4) + 2;
    const py = v => h - 4 - ((v - minV) / rng) * (h - 8);
    const pts = data.map(d => px(d.t).toFixed(1) + ',' + py(d.v).toFixed(1)).join(' ');
    const cur = vals[vals.length - 1];
    const lineColor = cur > 0 ? '#00aaff' : cur > -20 ? '#ffa500' : '#ff4444';
    return '<polyline points="' + pts + '" fill="none" stroke="' + lineColor + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'
         + '<circle cx="' + px(times[times.length-1]).toFixed(1) + '" cy="' + py(cur).toFixed(1) + '" r="3" fill="' + lineColor + '"/>';
  }

  _s(e) { try { return parseFloat(this._hass.states[e]?.state) || 0; } catch(x) { return 0; } }
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
    if (!this.shadowRoot) return;
    const hass = this._hass;
    if (!hass) {
      this.shadowRoot.innerHTML = '<div style="padding:24px;color:#fff;font-family:sans-serif;background:#050e1a;min-height:100vh">Laden...</div>';
      return;
    }

    const s  = this._s.bind(this);
    const st = this._st.bind(this);

    // ── Energie ──
    const pvW       = s('sensor.gx_device_pv_power');
    const loadW     = s('sensor.gx_device_consumption_power_l1');
    const loadKleur  = loadW >= 4500 ? '#ff2222' : loadW >= 3000 ? '#ff6600' : loadW > 1500 ? '#ff4444' : loadW > 800 ? '#ffa500' : '#00cc66';
    const loadAlarm  = loadW >= 4500;
    const gridW     = s('sensor.quattro_24_5000_120_2x100_id_276_input_power_l1');
    const battPow   = s('sensor.gx_device_dc_battery_power');
    const battChar  = s('sensor.smartshunt_hq2224ru6gc_stroom') > 0;

    // ── Accu ──
    const battSoc   = s('sensor.smartshunt_hq2224ru6gc_batterij');
    const battV     = s('sensor.smartshunt_hq2224ru6gc_spanning').toFixed(2);
    const battA     = s('sensor.smartshunt_hq2224ru6gc_stroom').toFixed(1);
    const battWh    = s('sensor.accu_beschikbaar_wh').toFixed(0);
    const _battPowM  = s('sensor.gx_device_dc_battery_power');
    const _soc30whM  = s('sensor.accu_beschikbaar_wh') * 0.70;
    const battDuur   = _battPowM < -20 ? (_soc30whM / Math.abs(_battPowM)).toFixed(1) : s('sensor.verwachte_accuduur').toFixed(1);
    const socColor  = this._socColor(battSoc);

    // ── BMS ──
    const bms1Soc   = s('sensor.jk_bms_1_jk_bms_1_soc');
    const bms1Min   = s('sensor.jk_bms_1_jk_bms_1_cell_volt_min').toFixed(3);
    const bms1Max   = s('sensor.jk_bms_1_jk_bms_1_cell_volt_max').toFixed(3);
    const bms1Delta = (s('sensor.jk_bms_1_jk_bms_1_cell_volt_max') - s('sensor.jk_bms_1_jk_bms_1_cell_volt_min')).toFixed(3);
    const bms1Temp  = s('sensor.bms1_temperatuur_netjes').toFixed(1);
    const bms1MosT  = s('sensor.jk_bms_1_jk_bms_1_mos_temperature').toFixed(1);
    const bms1Cycli = s('sensor.jk_bms_1_jk_bms_1_num_cycles');

    const bms2Soc   = s('sensor.jk_bms_2_jk_bms_2_soc');
    const bms2Min   = s('sensor.jk_bms_2_jk_bms_2_cell_volt_min').toFixed(3);
    const bms2Max   = s('sensor.jk_bms_2_jk_bms_2_cell_volt_max').toFixed(3);
    const bms2Delta = (s('sensor.jk_bms_2_jk_bms_2_cell_volt_max') - s('sensor.jk_bms_2_jk_bms_2_cell_volt_min')).toFixed(3);
    const bms2Temp  = s('sensor.bms2_temperatuur_netjes').toFixed(1);
    const bms2MosT  = s('sensor.jk_bms_2_jk_bms_2_mos_temperature').toFixed(1);
    const bms2Cycli = s('sensor.jk_bms_2_jk_bms_2_num_cycles');

    // ── PV ──
    const pvVandaag  = s('sensor.solar_yield_vandaag').toFixed(2);
    const pvGisteren = s('sensor.smartsolar_mppt_ve_can_150_85_rev2_id_279_yield_yesterday').toFixed(2);
    const pvMaand    = s('sensor.solar_yield_maand').toFixed(1);
    const pvMax      = 1800;
    const pvPct      = Math.min(pvW / pvMax * 100, 100);
    const mpptState  = st('sensor.smartsolar_mppt_ve_can_150_85_rev2_id_279_state');
    const pvBesparing = (parseFloat(pvMaand) * 0.50).toFixed(2);
    const walDag     = s('sensor.walstroom_dagverbruik').toFixed(2);
    const walMaand   = s('sensor.walstroom_verbruik_maand').toFixed(2);
    const walKosten  = (parseFloat(walMaand) * 0.50).toFixed(2);
    const loadDag    = s('sensor.gx_device_ac_uitgang_dagverbruik').toFixed(2);
    const loadMaand  = s('sensor.gx_device_quattro_uitgang_maandoverzicht').toFixed(1);
    const acInputLimit = s('number.gx_device_ac_input_limit').toFixed(0);

    // ── Quattro ──
    const acV     = s('sensor.quattro_24_5000_120_2x100_id_276_output_voltage_l1').toFixed(0);
    const acHz    = s('sensor.quattro_24_5000_120_2x100_id_276_output_frequency_l1').toFixed(1);
    const acOutW  = s('sensor.quattro_24_5000_120_2x100_id_276_output_power_l1').toFixed(0);
    const dcV     = s('sensor.quattro_24_5000_120_2x100_id_276_dc_voltage').toFixed(1);
    const acInV   = s('sensor.quattro_24_5000_120_2x100_id_276_input_voltage_l1').toFixed(0);
    const sysState = st('sensor.gx_device_system_state');
    const ok = ['ok','Ok','0','','false','no alarm','No alarm','No Alarm','no_alarm'];
    const alarmTemp = st('sensor.quattro_24_5000_120_2x100_id_276_high_temperature_alarm');
    const alarmOver = st('sensor.quattro_24_5000_120_2x100_id_276_overload_alarm');
    const alarmBatt = st('sensor.quattro_24_5000_120_2x100_id_276_low_battery_alarm');
    const alarmsOk  = ok.includes(alarmTemp) && ok.includes(alarmOver) && ok.includes(alarmBatt);

    // Systeemmodus kleur
    const sl = sysState === 'inverting' ? 'OMVORMEN' : sysState === 'bulk' ? 'BULK LADEN' :
               sysState === 'absorption' ? 'ABSORPTIE' : sysState === 'float' ? 'FLOAT' :
               sysState === 'passthru' ? 'WALSTROOM' : sysState.toUpperCase();
    const sc = sysState.toLowerCase().includes('float') || sysState.toLowerCase().includes('bulk') || sysState.toLowerCase().includes('absorb')
      ? '#00ff88' : sysState.toLowerCase().includes('invert') ? '#00cc66' : '#aaaaff';

    // ── Klimaat ──
    const tempBinnen = '--';
    const wcond      = hass ? st('weather.forecast_thuis') : '--';
    const tempBuiten = hass ? (hass.states['weather.forecast_thuis']?.attributes?.temperature ?? '--') : '--';
    const _wAttr     = hass ? hass.states['weather.forecast_thuis']?.attributes : null;
    const windKmM    = _wAttr ? parseFloat(_wAttr.wind_speed ?? 0).toFixed(1) : '--';
    const _windBearM = _wAttr ? parseFloat(_wAttr.wind_bearing ?? 0) : 0;
    const _windDirsM = ['N','NNO','NO','ONO','O','OZO','ZO','ZZO','Z','ZZW','ZW','WZW','W','WNW','NW','NNW'];
    const windDirM   = _wAttr ? _windDirsM[Math.round(_windBearM / 22.5) % 16] : '--';
    const vocht      = s('sensor.ewelink_snzb_02p_luchtvochtigheid').toFixed(0);
    const windKm     = windKmM;
    const windDir    = windDirM;
    const windBft    = _wAttr ? (parseFloat(windKmM) < 1 ? 0 : parseFloat(windKmM) < 6 ? 1 : parseFloat(windKmM) < 12 ? 2 : parseFloat(windKmM) < 20 ? 3 : parseFloat(windKmM) < 29 ? 4 : parseFloat(windKmM) < 39 ? 5 : parseFloat(windKmM) < 50 ? 6 : parseFloat(windKmM) < 62 ? 7 : 8) : '--';
    const baro       = s('sensor.barometer_hasselt').toFixed(0);
    const water      = s('sensor.hasselt_zwarte_water_waterhoogte').toFixed(0);

    // ── Verwarming ──

    // ── Overig ──
    const genActive  = st('sensor.generator_start_stop_run_state') === 'running';
    const genState   = st('sensor.generator_start_stop_run_state');
    const gridActive  = s('sensor.quattro_24_5000_120_2x100_id_276_input_power_l1') > 20;
    const gridSpanning = parseFloat(acInV) > 100;
    const walSocketAan = st('switch.walstroom_socket_1') === 'on';
    const walOverride  = st('input_boolean.walstroom_override') === 'on';
    const knmiCode   = st('sensor.knmi_weercode');
    const walstroom  = s('sensor.walstroom_verbruik_watt').toFixed(0);

    // ── Zon ──
    const sunState = st('sun.sun');
    const sunAbove = sunState === 'above_horizon';
    const zonOp    = this._zt('sensor.sun_next_rising');
    const zonOnd   = this._zt('sensor.sun_next_setting');
    const sunElev  = parseFloat(this._attr('sun.sun', 'elevation')).toFixed(1);

    // ── Weer / forecast ──
    const knmiTekst    = st('sensor.knmi_tekst');
    const scheepvaart  = st('sensor.scheepvaart_tekst');
    const windDeg      = _wAttr ? parseFloat(_wAttr.wind_bearing ?? 0) : 0;
    const windDirs     = ['N','NNO','NO','ONO','O','OZO','ZO','ZZO','Z','ZZW','ZW','WZW','W','WNW','NW','NNW'];
    const windKompas   = windDirs[Math.round(windDeg / 22.5) % 16];

    // Weer forecast uit Open-Meteo
    const wxState      = hass ? hass.states['weather.forecast_thuis'] : null;
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

    // ── Achtergrond ──
    const _skyRaw = st('sensor.sky_card_image');
    const skyImg  = (_skyRaw && _skyRaw !== 'unknown' && _skyRaw !== 'unavailable' && _skyRaw !== '--') ? _skyRaw : '/local/finally-card/clear-day.png';


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
              + '<div style="font-size:8px;color:rgba(255,255,255,0.3);margin-bottom:2px">C' + i + '</div>'
              + '<div style="font-size:11px;font-weight:700;color:' + clr + '">' + (cv > 0 ? cv.toFixed(3) : '--') + '</div>'
              + '</div>';
      }
      html += '</div>';
      return html;
    };

    this.shadowRoot.innerHTML = `
<style>
  :host {
    display: block;
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
    height: 220px;
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
    font-size: 13px;
    color: rgba(255,255,255,0.55);
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
    font-size: 10px;
    letter-spacing: 2px;
    color: rgba(255,255,255,0.4);
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
    font-size: 9px;
    letter-spacing: 2.5px;
    color: rgba(255,255,255,0.25);
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
    font-size: 9px;
    color: rgba(255,255,255,0.35);
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
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    margin-top: 3px;
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 0.5px solid rgba(255,255,255,0.06);
    font-size: 13px;
  }
  .row:last-child { border-bottom: none; }
  .row-lbl { color: rgba(255,255,255,0.4); }
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
    color: rgba(255,255,255,0.2);
    padding: 0 4px;
  }
  .flow-arrow.active { color: rgba(255,255,255,0.7); }

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
    <img src="/local/finally-card/boot.png" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:100%;height:auto;pointer-events:none;z-index:4;opacity:0.95"/>
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <div class="hero-top">
        <div>
          <div class="tijd-groot">${tijd}</div>
          <div class="datum-sub">${datum}</div>
        </div>
        <div class="hero-modus">
          <div style="font-size:9px;color:rgba(255,255,255,0.35);letter-spacing:2px;margin-bottom:3px">MODUS</div>
          <div style="font-size:15px;font-weight:700;color:${sc}">${sl}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px">${acV} V · ${acHz} Hz</div>
          ${!alarmsOk ? '<div style="font-size:10px;color:#ff4444;margin-top:4px">⚠ ALARM</div>' : ''}
          ${knmiCode !== 'Groen' && knmiCode !== '--' ? '<div style="font-size:10px;font-weight:700;color:'+(knmiCode==='Rood'?'#ff6666':knmiCode==='Oranje'?'#ffaa44':'#ffee44')+';margin-top:2px">⚠ KNMI: ' + knmiCode + '</div>' : ''}
        </div>
      </div>
      <div class="hero-bottom">
        <div class="hero-soc">
          <div class="soc-lbl">TOTAAL SOC · 628Ah LiFePO4</div>
          <div class="soc-getal" style="color:${socColor}">${Math.round(battSoc)}%</div>
          <div class="soc-bar">
            <div class="soc-bar-fill" style="width:${battSoc}%;background:${socColor}"></div>
          </div>
        </div>
        <div class="hero-pv">
          <div style="font-size:9px;color:rgba(255,200,0,0.5);letter-spacing:1px;margin-bottom:2px">ZON NU</div>
          <div style="font-size:22px;font-weight:800;color:#ffd700">${pvW} W</div>
          <div style="font-size:10px;color:rgba(255,200,0,0.5);margin-top:1px">${pvVandaag} kWh vandaag</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ══ ENERGIE FLOW ══ -->
  <div class="section">
    <div class="section-title">Energie flow</div>
    <div class="card" style="padding:12px 14px">
      <div class="flow-row">
        <!-- Zon -->
        <div class="flow-node" style="border:0.5px solid ${pvW > 10 ? 'rgba(255,200,0,0.4)' : 'rgba(255,255,255,0.08)'}">
          <div style="font-size:18px">☀️</div>
          <div style="font-size:9px;color:rgba(255,200,0,0.6);letter-spacing:1px;margin:2px 0">ZON</div>
          <div style="font-size:14px;font-weight:700;color:${pvW > 10 ? '#ffd700' : 'rgba(255,255,255,0.25)'}">${pvW} W</div>
        </div>
        <!-- Pijl zon→boot -->
        <div class="flow-arrow ${pvW > 10 ? 'active' : ''}" style="color:${pvW > 10 ? '#ffd700' : 'rgba(255,255,255,0.12)'}">→</div>
        <!-- Boot (load) -->
        <div class="flow-node" style="border:0.5px solid rgba(255,100,50,0.3)">
          <div style="font-size:18px">⚓</div>
          <div style="font-size:9px;color:rgba(255,100,50,0.6);letter-spacing:1px;margin:2px 0">LOAD</div>
          <div style="font-size:14px;font-weight:700;color:${loadKleur}${loadAlarm?';animation:pulse 0.6s ease-in-out infinite':''}">${loadW}${loadAlarm?' ⚠':''} W</div>
        </div>
        <!-- Pijl boot↔accu -->
        <div class="flow-arrow ${Math.abs(battPow) > 10 ? 'active' : ''}" style="color:${battChar ? '#00ff88' : '#ff9900'}">
          ${battChar ? '←' : '→'}
        </div>
        <!-- Accu -->
        <div class="flow-node" style="border:0.5px solid ${battChar ? 'rgba(0,255,136,0.4)' : battPow < -10 ? 'rgba(255,150,0,0.4)' : socColor+'44'}">
          <div style="font-size:18px">${battChar ? '🔋' : '🪫'}</div>
          <div style="font-size:9px;color:${battChar ? 'rgba(0,255,136,0.6)' : battPow < -10 ? 'rgba(255,150,0,0.6)' : 'rgba(100,200,255,0.6)'};letter-spacing:1px;margin:2px 0">${battChar ? '▲ LADEN' : battPow < -10 ? '▼ ONTLADEN' : 'ACCU'}</div>
          <div style="font-size:14px;font-weight:700;color:${battChar ? '#00ff88' : battPow < -10 ? '#ff9900' : socColor}">${battChar || battPow < -10 ? Math.abs(battPow).toFixed(0)+' W' : Math.round(battSoc)+'%'}</div>
        </div>
      </div>
      <!-- Walstroom -->
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0 0;border-top:0.5px solid rgba(255,255,255,0.06)">
        <span class="dot" style="background:${gridActive ? '#00aaff' : gridSpanning ? '#ffaa00' : 'rgba(255,255,255,0.15)'};${gridActive ? 'box-shadow:0 0 6px #00aaff' : gridSpanning ? 'box-shadow:0 0 6px #ffaa00' : ''}"></span>
        <span style="font-size:12px;color:rgba(255,255,255,0.4)">WALSTROOM</span>
        <span style="font-size:14px;font-weight:700;color:${gridActive ? '#00aaff' : gridSpanning ? '#ffaa00' : 'rgba(255,255,255,0.2)'};margin-left:auto">${gridActive ? gridW + ' W · ' + acInV + ' V' : gridSpanning ? acInV + ' V · stand-by' : 'niet aangesloten'}</span>
      </div>
    </div>
  </div>

  <!-- ══ ENERGIE TEGEL ══ -->
  <div class="section">
    <div class="section-title">Energie</div>
    <div class="card" id="m-energie-tegel" data-action="energie-popup" style="cursor:pointer;border-color:rgba(255,200,0,0.25);background:rgba(40,30,0,0.35)">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:10px;color:rgba(255,200,0,0.5);letter-spacing:1px">ZON BESPARING</div>
          <div style="font-size:22px;font-weight:800;color:#ffd700">€ ${pvBesparing}</div>
          <div style="font-size:11px;color:rgba(255,200,0,0.4)">deze maand</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:10px;color:rgba(0,170,255,0.5);letter-spacing:1px">WALSTROOM KOSTEN</div>
          <div style="font-size:22px;font-weight:800;color:#00aaff">€ ${walKosten}</div>
          <div style="font-size:11px;color:rgba(0,170,255,0.4)">deze maand</div>
        </div>
      </div>
      <div style="font-size:10px;color:rgba(255,255,255,0.3);text-align:center;margin-top:8px">tik voor details ›</div>
    </div>
  </div>

  <!-- ══ ACCU DETAILS ══ -->
  <div class="section">
    <div class="section-title">Accubank</div>
    <div class="card-grid">
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

    <!-- BMS 1 -->
    <div class="card" style="border-color:rgba(0,255,136,0.2);margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:11px;font-weight:700;letter-spacing:1px" class="bms1-accent">BMS 1</div>
        <div style="font-size:18px;font-weight:800;color:${this._socColor(bms1Soc)}">${Math.round(bms1Soc)}%</div>
      </div>
      <div class="row"><span class="row-lbl">Min / Max cel</span><span class="row-val">${bms1Min} / ${bms1Max} V</span></div>
      <div class="row"><span class="row-lbl">Delta</span><span class="row-val" style="color:${this._deltaColor(parseFloat(bms1Delta))}">Δ ${bms1Delta} V</span></div>
      <div class="row"><span class="row-lbl">Temp / MOS</span><span class="row-val">${bms1Temp}° / ${bms1MosT}°C</span></div>
      <div class="row"><span class="row-lbl">Cycli</span><span class="row-val">${bms1Cycli}</span></div>
      ${celRow(1, 'jk_bms_1_jk_bms_1')}
    </div>

    <!-- BMS 2 -->
    <div class="card" style="border-color:rgba(0,170,255,0.2);margin-bottom:0">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:11px;font-weight:700;letter-spacing:1px" class="bms2-accent">BMS 2</div>
        <div style="font-size:18px;font-weight:800;color:${this._socColor(bms2Soc)}">${Math.round(bms2Soc)}%</div>
      </div>
      <div class="row"><span class="row-lbl">Min / Max cel</span><span class="row-val">${bms2Min} / ${bms2Max} V</span></div>
      <div class="row"><span class="row-lbl">Delta</span><span class="row-val" style="color:${this._deltaColor(parseFloat(bms2Delta))}">Δ ${bms2Delta} V</span></div>
      <div class="row"><span class="row-lbl">Temp / MOS</span><span class="row-val">${bms2Temp}° / ${bms2MosT}°C</span></div>
      <div class="row"><span class="row-lbl">Cycli</span><span class="row-val">${bms2Cycli}</span></div>
      ${celRow(2, 'jk_bms_2_jk_bms_2')}
    </div>
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
          <div style="font-size:14px;font-weight:700;color:#00ff88">${mpptState}</div>
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
        <div style="font-size:12px;color:rgba(255,200,0,0.6)">🌅 Op: ${zonOp}</div>
        <div style="font-size:12px;color:rgba(255,130,50,0.6)">🌇 Onder: ${zonOnd}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.4)">Elev: ${sunElev}°</div>
      </div>
    </div>
  </div>

  <!-- ══ KLIMAAT & OMGEVING ══ -->
  <div class="section">
    <div class="section-title">Klimaat & omgeving</div>
    <div class="card-grid-3">
      <div class="mini-card">
        <div class="lbl">Temp</div>
        <div class="val-lg" style="color:#ff8844">${tempBinnen}°C</div>
        <div class="sub">aan boord</div>
      </div>
      <div class="mini-card">
        <div class="lbl">Vochtigheid</div>
        <div class="val-lg" style="color:#00ccff">${vocht}%</div>
      </div>
      <div class="mini-card">
        <div class="lbl">Buiten</div>
        <div class="val-lg" style="color:#88ccff">${tempBuiten}°C</div>
        <div class="sub">${wcond !== '--' ? wcond : 'onbekend'}</div>
      </div>
    </div>
    <div class="card">
      <div class="row"><span class="row-lbl">Wind</span><span class="row-val">${windKm} km/h · ${windDir} · ${windBft} Bft</span></div>
      <div class="row">
        <span class="row-lbl">Waterstand Hasselt</span>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="row-val" style="color:#00ccff">${water} cm</span>
          <svg viewBox="0 0 120 36" style="width:80px;height:24px">${sparkSvg}</svg>
        </div>
      </div>
      <div class="row">
        <span class="row-lbl">Watertank</span>
        <div style="text-align:right">
<span class="row-val">—</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ══ WEER & OMGEVING ══ -->
  <div class="section">
    <div class="section-title">Weer & omgeving</div>

    <!-- KNMI waarschuwing conditioneel -->
    ${knmiCode !== 'Groen' && knmiCode !== '--' ? `
    <div class="card" style="border-color:${knmiCode==='Rood'?'rgba(255,80,80,0.5)':knmiCode==='Oranje'?'rgba(255,140,0,0.5)':'rgba(255,220,0,0.5)'};background:rgba(50,10,10,0.6);margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="font-size:28px">⚠️</div>
        <div>
          <div style="font-size:11px;font-weight:700;color:${knmiCode==='Rood'?'#ff6666':knmiCode==='Oranje'?'#ffaa44':'#ffee44'};letter-spacing:1px">KNMI CODE ${knmiCode}</div>
          <div style="font-size:12px;color:rgba(255,180,180,0.8);margin-top:2px;line-height:1.4">${knmiTekst}</div>
        </div>
      </div>
    </div>` : ''}

    <!-- Huidige condities -->
    <div class="card" style="margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div>
          <div style="font-size:36px">${wxIcon(wxCurrent)}</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.5);margin-top:2px;text-transform:capitalize">${wxCurrent}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:38px;font-weight:700;color:#fff">${wxTemp}°</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.4)">buiten</div>
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
          <div style="font-size:18px;font-weight:700;color:#88ccff">${windKm} km/h</div>
          <div style="font-size:12px;color:rgba(136,204,255,0.7)">${windKompas} (${Math.round(windDeg)}°) · ${windBft} Bft</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:12px;color:rgba(255,255,255,0.4)">Luchtdruk</div>
          <div style="font-size:16px;font-weight:700;color:#aaaaff">${baro} hPa</div>
        </div>
      </div>

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
               + '<div style="font-size:9px;color:rgba(255,255,255,0.35);margin-bottom:3px">' + dagNaam + '</div>'
               + '<div style="font-size:20px">' + ico + '</div>'
               + '<div style="font-size:12px;font-weight:700;color:#fff;margin-top:3px">' + tHigh + '°</div>'
               + '<div style="font-size:10px;color:rgba(255,255,255,0.4)">' + tLow + '°</div>'
               + '</div>';
        }).join('')}
      </div>` : ''}
    </div>
  </div>


    <!-- ══ VERWARMING + SYSTEMEN ══ -->
  <div class="section">
    <div class="section-title">Systemen</div>
    <div class="card-grid">

      <!-- Douchepomp touchknop -->
      <div class="touch-btn" id="m-doucheknop" data-aan="${st('switch.shellyplus1_78ee4cc39480') === 'on'}"
           style="border-color:rgba(0,200,255,${st('switch.shellyplus1_78ee4cc39480') === 'on' ? '0.5' : '0.2'});background:${st('switch.shellyplus1_78ee4cc39480') === 'on' ? 'rgba(0,200,255,0.12)' : 'rgba(255,255,255,0.04)'}">
        <div style="font-size:22px;margin-bottom:4px">🚿</div>
        <div class="lbl">DOUCHEPOMP</div>
        <div style="font-size:18px;font-weight:700;color:${st('switch.shellyplus1_78ee4cc39480') === 'on' ? '#00ccff' : 'rgba(255,255,255,0.3)'}">${st('switch.shellyplus1_78ee4cc39480') === 'on' ? '● AAN' : '○ UIT'}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:4px">tik om te schakelen</div>
      </div>
    </div>
    <div class="card">
      <div class="row"><span class="row-lbl">Generator</span><span class="row-val" style="color:${genActive ? '#00ff88' : 'rgba(255,255,255,0.4)'}">${genActive ? '● Running' : '○ Gestopt'}</span></div>
      <div class="row"><span class="row-lbl">Quattro alarmen</span>
        <div style="display:flex;gap:6px;align-items:center">
          <span class="dot" style="background:${ok.includes(alarmTemp) ? 'rgba(0,255,136,0.6)' : '#ff4444'}"></span>
          <span style="font-size:10px;color:rgba(255,255,255,0.3)">Temp</span>
          <span class="dot" style="background:${ok.includes(alarmOver) ? 'rgba(0,255,136,0.6)' : '#ff4444'}"></span>
          <span style="font-size:10px;color:rgba(255,255,255,0.3)">Overl</span>
          <span class="dot" style="background:${battSoc>35?'#00cc66':battSoc>30?'#ffa500':'#ff4444'}"></span>
          <span style="font-size:10px;color:rgba(255,255,255,0.3)">Accu</span>
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
           style="border-color:rgba(0,255,136,${walSocketAan?'0.5':'0.2'});background:${walSocketAan?'rgba(0,255,136,0.12)':'rgba(255,255,255,0.04)'}">
        <div style="font-size:22px;margin-bottom:4px">🔌</div>
        <div class="lbl">WALSTROOM</div>
        <div style="font-size:20px;font-weight:700;color:${walSocketAan?'#00ff88':'rgba(255,255,255,0.3)'}">${walSocketAan?'● AAN':'○ UIT'}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:4px">tik om te schakelen</div>
      </div>
      <div class="touch-btn" id="m-wal-override-btn"
           style="border-color:rgba(255,165,0,${walOverride?'0.5':'0.2'});background:${walOverride?'rgba(255,165,0,0.12)':'rgba(255,255,255,0.04)'}">
        <div style="font-size:22px;margin-bottom:4px">${walOverride?'🔒':'🤖'}</div>
        <div class="lbl">${walOverride?'HANDMATIG':'AUTO'}</div>
        <div style="font-size:11px;color:${walOverride?'#ffaa44':'rgba(255,255,255,0.3)'};font-weight:700">${walOverride?'tik voor auto':'tik voor handmatig'}</div>
      </div>
    </div>

    <!-- Instellingen knop -->
    <div class="touch-btn" id="m-wal-inst-btn" style="margin-bottom:8px;border-color:rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);text-align:center;padding:10px 16px">
      <span style="font-size:13px;color:rgba(255,255,255,0.4)">&#9881; Drempelwaarden instellen</span>
    </div>

    <div class="card" id="m-wal-limit-tegel" style="cursor:pointer;border-color:rgba(0,170,255,0.25);background:rgba(0,20,40,0.35)">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:10px;color:rgba(0,170,255,0.5);letter-spacing:1px">STROOMLIMIET</div>
          <div style="font-size:28px;font-weight:800;color:#00aaff">${acInputLimit} A</div>
        </div>
        <div style="font-size:32px;color:rgba(0,170,255,0.3)">⚡</div>
      </div>
      <div style="font-size:10px;color:rgba(255,255,255,0.3);text-align:center;margin-top:8px">tik om in te stellen ›</div>
    </div>
  </div>


  <!-- WALSTROOM INSTELLINGEN POPUP -->
  <div id="m-wal-inst-popup" style="display:none;position:fixed;inset:0;z-index:102;background:rgba(0,0,0,0.80);backdrop-filter:blur(8px);align-items:center;justify-content:center">
    <div style="background:rgba(6,16,48,0.97);border:1px solid rgba(100,170,255,0.35);border-radius:20px;padding:28px;width:min(340px,88vw);text-align:center;color:#fff;font-family:'Segoe UI',system-ui,sans-serif">
      <div style="font-size:10px;letter-spacing:3px;color:rgba(255,255,255,0.4);margin-bottom:20px">WALSTROOM INSTELLINGEN</div>

      <div style="margin-bottom:18px">
        <div style="font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:1px;margin-bottom:8px">WALSTROOM AAN ONDER</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:20px">
          <div id="m-wi-soc-aan-min" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">−</div>
          <div id="m-wi-soc-aan-val" style="font-size:32px;font-weight:800;color:#ff9900;min-width:70px">--%</div>
          <div id="m-wi-soc-aan-plus" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">+</div>
        </div>
      </div>

      <div style="margin-bottom:18px">
        <div style="font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:1px;margin-bottom:8px">WALSTROOM UIT BOVEN</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:20px">
          <div id="m-wi-soc-uit-min" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">−</div>
          <div id="m-wi-soc-uit-val" style="font-size:32px;font-weight:800;color:#00cc66;min-width:70px">--%</div>
          <div id="m-wi-soc-uit-plus" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">+</div>
        </div>
      </div>

      <div style="margin-bottom:24px">
        <div style="font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:1px;margin-bottom:8px">ZON DREMPEL (UIT BIJ MEER ZON)</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:20px">
          <div id="m-wi-zon-min" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">−</div>
          <div id="m-wi-zon-val" style="font-size:32px;font-weight:800;color:#ffd700;min-width:70px">-- W</div>
          <div id="m-wi-zon-plus" style="cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">+</div>
        </div>
      </div>

      <div id="m-wi-sluit" style="cursor:pointer;padding:12px 40px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:12px;font-size:14px;color:rgba(255,255,255,0.5);display:inline-block">Sluiten</div>
    </div>
  </div>

  <!-- Walstroom limiet popup -->
  <div id="m-wal-limit-popup" style="display:none;position:fixed;inset:0;z-index:101;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);align-items:center;justify-content:center">
    <div style="background:rgba(6,16,48,0.97);border:1px solid rgba(0,170,255,0.4);border-radius:20px;padding:32px;width:min(340px,88vw);text-align:center;color:#fff;font-family:'Segoe UI',system-ui,sans-serif">
      <div style="font-size:11px;letter-spacing:3px;color:rgba(255,255,255,0.4);margin-bottom:8px">WALSTROOM LIMIET</div>
      <div style="font-size:52px;font-weight:800;color:#00aaff;margin:16px 0" id="m-wal-limit-display">-- A</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:24px;margin-bottom:28px">
        <div id="m-wal-limit-min" style="cursor:pointer;width:60px;height:60px;border-radius:50%;background:rgba(0,170,255,0.1);border:1.5px solid rgba(0,170,255,0.4);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;color:#00aaff">−</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.4)">1A per stap</div>
        <div id="m-wal-limit-plus" style="cursor:pointer;width:60px;height:60px;border-radius:50%;background:rgba(0,170,255,0.1);border:1.5px solid rgba(0,170,255,0.4);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;color:#00aaff">+</div>
      </div>
      <div style="display:flex;gap:10px;justify-content:center">
        <div id="m-wal-limit-set" style="cursor:pointer;padding:12px 28px;background:rgba(0,170,255,0.15);border:1px solid rgba(0,170,255,0.5);border-radius:12px;font-size:14px;font-weight:700;color:#00aaff">Instellen</div>
        <div id="m-wal-limit-sluit" style="cursor:pointer;padding:12px 28px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:12px;font-size:14px;color:rgba(255,255,255,0.5)">Sluiten</div>
      </div>
    </div>
  </div>

  <!-- Energie popup -->
  <div id="m-energie-popup" style="display:none;position:fixed;inset:0;z-index:100;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);align-items:center;justify-content:center">
    <div style="background:rgba(6,16,48,0.97);border:1px solid rgba(255,200,0,0.3);border-radius:20px;padding:24px;width:min(380px,88vw);color:#fff;font-family:'Segoe UI',system-ui,sans-serif;max-height:80vh;overflow-y:auto">
      <div style="font-size:9px;letter-spacing:2px;color:rgba(255,255,255,0.3);margin-bottom:16px">ENERGIE DETAILS</div>

      <!-- Actueel -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
        <div style="background:rgba(255,200,0,0.08);border:0.5px solid rgba(255,200,0,0.2);border-radius:12px;padding:12px;text-align:center">
          <div style="font-size:9px;color:rgba(255,200,0,0.5);letter-spacing:1px">ZON NU</div>
          <div style="font-size:22px;font-weight:800;color:#ffd700">${pvW} W</div>
        </div>
        <div style="background:rgba(255,100,50,0.08);border:0.5px solid rgba(255,100,50,0.2);border-radius:12px;padding:12px;text-align:center">
          <div style="font-size:9px;color:rgba(255,100,50,0.5);letter-spacing:1px">LOAD NU</div>
          <div style="font-size:22px;font-weight:800;color:${loadKleur}${loadAlarm?';animation:pulse 0.6s ease-in-out infinite':''}">${loadAlarm?'⚠ ':''}${loadW} W</div>
        </div>
        <div style="background:rgba(0,170,255,0.08);border:0.5px solid rgba(0,170,255,0.2);border-radius:12px;padding:12px;text-align:center">
          <div style="font-size:9px;color:rgba(0,170,255,0.5);letter-spacing:1px">AC SPANNING</div>
          <div style="font-size:22px;font-weight:800;color:#aaffcc">${acV} V · ${acHz} Hz</div>
        </div>
        <div style="background:rgba(100,200,255,0.08);border:0.5px solid rgba(100,200,255,0.2);border-radius:12px;padding:12px;text-align:center">
          <div style="font-size:9px;color:rgba(100,200,255,0.5);letter-spacing:1px">MODUS</div>
          <div style="font-size:16px;font-weight:800;color:#00cc66">${sysState}</div>
        </div>
      </div>

      <!-- Statistieken -->
      <div style="background:rgba(255,255,255,0.03);border:0.5px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;margin-bottom:14px">
        <div style="font-size:9px;letter-spacing:2px;color:rgba(255,255,255,0.3);margin-bottom:10px">ZONNEPANELEN</div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:rgba(255,255,255,0.4);font-size:12px">Vandaag</span><span style="color:#ffd700;font-weight:700">${pvVandaag} kWh</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:rgba(255,255,255,0.4);font-size:12px">Gisteren</span><span style="color:#ffaa44;font-weight:700">${pvGisteren} kWh</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:rgba(255,255,255,0.4);font-size:12px">Deze maand</span><span style="color:#ff8800;font-weight:700">${pvMaand} kWh</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:rgba(255,255,255,0.4);font-size:12px">Besparing maand</span><span style="color:#ffd700;font-weight:700">€ ${pvBesparing}</span>
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.03);border:0.5px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;margin-bottom:14px">
        <div style="font-size:9px;letter-spacing:2px;color:rgba(255,255,255,0.3);margin-bottom:10px">WALSTROOM & VERBRUIK</div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:rgba(255,255,255,0.4);font-size:12px">Walstroom vandaag</span><span style="color:#00aaff;font-weight:700">${walDag} kWh</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:rgba(255,255,255,0.4);font-size:12px">Walstroom maand</span><span style="color:#00aaff;font-weight:700">${walMaand} kWh</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:rgba(255,255,255,0.4);font-size:12px">Kosten maand</span><span style="color:#00aaff;font-weight:700">€ ${walKosten}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:rgba(255,255,255,0.4);font-size:12px">Verbruik vandaag</span><span style="color:#ff8844;font-weight:700">${loadDag} kWh</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:rgba(255,255,255,0.4);font-size:12px">Verbruik maand</span><span style="color:#ff6622;font-weight:700">${loadMaand} kWh</span>
        </div>
      </div>

      <div id="m-energie-sluit" style="cursor:pointer;padding:12px;text-align:center;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:10px;font-size:14px;color:rgba(255,255,255,0.6)">Sluiten</div>
    </div>
  </div>

  <!-- Verwarming popup mobiel -->
  <div id="m-verw-popup" style="display:none;position:fixed;inset:0;z-index:100;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);align-items:center;justify-content:center">
    <div style="background:rgba(6,16,48,0.97);border:1px solid rgba(255,100,50,0.4);border-radius:20px;padding:28px 28px;width:min(380px,88vw);color:#fff;font-family:'Segoe UI',system-ui,sans-serif">
      <div style="font-size:9px;letter-spacing:2px;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-bottom:16px">Verwarming Boot</div>

      <!-- Huidig / aan-uit -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <div>
          <div style="font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:4px">Huidig</div>
          <div id="m-verw-huidig" style="font-size:38px;font-weight:800;color:#ff8844">--°C</div>
        </div>
        <div id="m-verw-toggle" style="cursor:pointer;padding:12px 24px;border-radius:12px;font-size:15px;font-weight:700;text-align:center;min-width:100px"></div>
      </div>

      <!-- Temperatuur instelling -->
      <div style="background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.1);border-radius:14px;padding:16px;margin-bottom:20px">
        <div style="font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;text-align:center">Ingestelde temperatuur</div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div id="m-verw-min" style="cursor:pointer;width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700">−</div>
          <div style="text-align:center">
            <div id="m-verw-set" style="font-size:44px;font-weight:800;color:#ff8844">--°</div>
          </div>
          <div id="m-verw-plus" style="cursor:pointer;width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700">+</div>
        </div>
      </div>

      <div id="m-verw-sluit" style="cursor:pointer;padding:12px;text-align:center;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:10px;font-size:14px;color:rgba(255,255,255,0.6)">Sluiten</div>
    </div>
  </div>

</div>`;

    // ── Event listeners ──
    const verwknop  = this.shadowRoot.getElementById('m-verwknop');
    const mVerwPopup = this.shadowRoot.getElementById('m-verw-popup');
    const mVerwToggle = this.shadowRoot.getElementById('m-verw-toggle');
    const mVerwHuidig = this.shadowRoot.getElementById('m-verw-huidig');
    const mVerwSet   = this.shadowRoot.getElementById('m-verw-set');
    const mVerwPlus  = this.shadowRoot.getElementById('m-verw-plus');
    const mVerwMin   = this.shadowRoot.getElementById('m-verw-min');
    const mVerwSluit = this.shadowRoot.getElementById('m-verw-sluit');

    const _mVerwUpdate = () => {
      if (!this._hass) return;
      const aan = this._hass.states['climate.verwarming_boot']?.state === 'heat';
      const cur = this._hass.states['climate.verwarming_boot']?.attributes?.current_temperature ?? '--';
      const set = parseFloat(this._hass.states['climate.verwarming_boot']?.attributes?.temperature ?? 19);
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
        const aan = this._hass.states['climate.verwarming_boot']?.state === 'heat';
        this._hass.callService('climate', aan ? 'turn_off' : 'turn_on', { entity_id: 'climate.verwarming_boot' });
        setTimeout(_mVerwUpdate, 500);
      };
    }
    if (mVerwPlus) {
      mVerwPlus.onclick = () => {
        const cur = parseFloat(this._hass.states['climate.verwarming_boot']?.attributes?.temperature ?? 19);
        const newT = Math.min(cur + 0.5, 25);
        this._hass.callService('climate', 'set_temperature', { entity_id: 'climate.verwarming_boot', temperature: newT });
        setTimeout(_mVerwUpdate, 500);
      };
    }
    if (mVerwMin) {
      mVerwMin.onclick = () => {
        const cur = parseFloat(this._hass.states['climate.verwarming_boot']?.attributes?.temperature ?? 19);
        const newT = Math.max(cur - 0.5, 10);
        this._hass.callService('climate', 'set_temperature', { entity_id: 'climate.verwarming_boot', temperature: newT });
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
        this._hass.callService('switch', aan ? 'turn_off' : 'turn_on', { entity_id: 'switch.shellyplus1_78ee4cc39480' });
      };
    }


    // Walstroom instellingen popup
    const mWiBtn   = this.shadowRoot.getElementById('m-wal-inst-btn');
    const mWiPopup = this.shadowRoot.getElementById('m-wal-inst-popup');
    const mWiSluit = this.shadowRoot.getElementById('m-wi-sluit');

    const _mWiLoad = () => {
      if (!this._hass) return;
      const aan = parseFloat(this._hass.states['input_number.walstroom_soc_aan']?.state) || 30;
      const uit = parseFloat(this._hass.states['input_number.walstroom_soc_uit']?.state) || 80;
      const zon = parseFloat(this._hass.states['input_number.walstroom_zon_drempel']?.state) || 300;
      mWiPopup._socAan = aan; mWiPopup._socUit = uit; mWiPopup._zon = zon;
      const v1 = mWiPopup.querySelector('#m-wi-soc-aan-val');
      const v2 = mWiPopup.querySelector('#m-wi-soc-uit-val');
      const v3 = mWiPopup.querySelector('#m-wi-zon-val');
      if (v1) v1.textContent = aan + '%';
      if (v2) v2.textContent = uit + '%';
      if (v3) v3.textContent = zon + ' W';
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
      _mWiBtn('m-wi-soc-aan-min', () => { mWiPopup._socAan = Math.max(10, (mWiPopup._socAan||30)-5); const el=mWiPopup.querySelector('#m-wi-soc-aan-val'); if(el) el.textContent=mWiPopup._socAan+'%'; _mWiSet('input_number.walstroom_soc_aan', mWiPopup._socAan); });
      _mWiBtn('m-wi-soc-aan-plus', () => { mWiPopup._socAan = Math.min(70, (mWiPopup._socAan||30)+5); const el=mWiPopup.querySelector('#m-wi-soc-aan-val'); if(el) el.textContent=mWiPopup._socAan+'%'; _mWiSet('input_number.walstroom_soc_aan', mWiPopup._socAan); });
      _mWiBtn('m-wi-soc-uit-min', () => { mWiPopup._socUit = Math.max(50, (mWiPopup._socUit||80)-5); const el=mWiPopup.querySelector('#m-wi-soc-uit-val'); if(el) el.textContent=mWiPopup._socUit+'%'; _mWiSet('input_number.walstroom_soc_uit', mWiPopup._socUit); });
      _mWiBtn('m-wi-soc-uit-plus', () => { mWiPopup._socUit = Math.min(100, (mWiPopup._socUit||80)+5); const el=mWiPopup.querySelector('#m-wi-soc-uit-val'); if(el) el.textContent=mWiPopup._socUit+'%'; _mWiSet('input_number.walstroom_soc_uit', mWiPopup._socUit); });
      _mWiBtn('m-wi-zon-min', () => { mWiPopup._zon = Math.max(0, (mWiPopup._zon||300)-50); const el=mWiPopup.querySelector('#m-wi-zon-val'); if(el) el.textContent=mWiPopup._zon+' W'; _mWiSet('input_number.walstroom_zon_drempel', mWiPopup._zon); });
      _mWiBtn('m-wi-zon-plus', () => { mWiPopup._zon = Math.min(1000, (mWiPopup._zon||300)+50); const el=mWiPopup.querySelector('#m-wi-zon-val'); if(el) el.textContent=mWiPopup._zon+' W'; _mWiSet('input_number.walstroom_zon_drempel', mWiPopup._zon); });
      if (mWiSluit) mWiSluit.onclick = (e) => { e.stopPropagation(); this._walInstPopupOpen = false; mWiPopup.style.display = 'none'; };
      mWiPopup.onclick = (e) => { if (e.target === mWiPopup) { this._walInstPopupOpen = false; mWiPopup.style.display = 'none'; } };
    }

    // Walstroom socket
    const mWalSocketBtn = this.shadowRoot.getElementById('m-wal-socket-btn');
    if (mWalSocketBtn && this._hass) {
      mWalSocketBtn.onclick = () => {
        const aan = this._hass.states['switch.walstroom_socket_1']?.state === 'on';
        this._hass.callService('switch', aan ? 'turn_off' : 'turn_on', { entity_id: 'switch.walstroom_socket_1' });
      };
    }

    // Walstroom override
    const mWalOverrideBtn = this.shadowRoot.getElementById('m-wal-override-btn');
    if (mWalOverrideBtn && this._hass) {
      mWalOverrideBtn.onclick = () => {
        const aan = this._hass.states['input_boolean.walstroom_override']?.state === 'on';
        this._hass.callService('input_boolean', aan ? 'turn_off' : 'turn_on', { entity_id: 'input_boolean.walstroom_override' });
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
