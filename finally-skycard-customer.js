/* ============================================================
   Finally Card — Gebundeld bestand voor HACS
   Bevat: FinallySkyCard, FinallySkyCardMobile, FinallyWizard
   Dit bestand wordt door HACS als enige resource gedownload;
   alle drie de custom elements worden hierin geregistreerd.
   ============================================================ */

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
  }

  setConfig(config) {
    this._config = config;
    this._render();
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
    if (now - this._lastUpdate > 1000) {
      this._lastUpdate = now;
      this._render();
    }
    if (!this._historyLoaded || now - this._lastHistoryLoad > 600000) {
      this._lastHistoryLoad = now;
      this._historyLoaded = true;
      this._loadWaterHistory();
      this._loadForecast();
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
        .sb-title { font-size: 11px; letter-spacing: 3px; color: rgba(255,255,255,0.4);
          text-transform: uppercase; margin-bottom: 20px; display: flex;
          justify-content: space-between; align-items: center; }
        .sb-close { font-size: 22px; cursor: pointer; color: rgba(255,255,255,0.4);
          padding: 2px 10px; border-radius: 8px; border: 0.5px solid rgba(255,255,255,0.15); }
        .sb-grid  { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        .sb-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        .sb-card  { background: rgba(255,255,255,0.04); border: 0.5px solid rgba(100,170,255,0.14);
          border-radius: 14px; padding: 12px 14px; }
        .sb-card-lbl { font-size: 9px; color: rgba(255,255,255,0.6); letter-spacing: 1.5px;
          text-transform: uppercase; margin-bottom: 8px; }
        .sb-card-val { font-size: 26px; font-weight: 700; line-height: 1; }
        .sb-card-sub { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 6px; }
        .sb-bar-wrap { height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px;
          overflow: hidden; margin-top: 10px; }
        .sb-bar-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease; }
        .sb-row { display: flex; justify-content: space-between; padding: 5px 0;
          border-bottom: 0.5px solid rgba(255,255,255,0.06); font-size: 13px; }
        .sb-row:last-child { border-bottom: none; }
        .sb-row-lbl { color: rgba(255,255,255,0.6); }
        .sb-row-val { color: #fff; font-weight: 600; }
        .sb-section { font-size: 9px; letter-spacing: 2px; color: rgba(255,255,255,0.5);
          text-transform: uppercase; margin: 16px 0 10px; }
        .sb-stat-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 12px; }
        .sb-mini { background: rgba(255,255,255,0.04); border: 0.5px solid rgba(100,170,255,0.12);
          border-radius: 12px; padding: 14px 12px; text-align: center; }
        .sb-mini-lbl { font-size: 9px; color: rgba(255,255,255,0.6); letter-spacing: 1px;
          text-transform: uppercase; margin-bottom: 6px; }
        .sb-mini-val { font-size: 18px; font-weight: 700; }
        .cel-tile { background: rgba(255,255,255,0.05); border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 7px; padding: 6px 2px; text-align: center; transition: background 0.3s, border-color 0.3s; }
        .cel-nr { font-size: 8px; color: rgba(255,255,255,0.6); margin-bottom: 2px; }
        .cel-v  { font-size: 11px; font-weight: 700; color: #fff; }
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
      accu: '🔋 ACCUBANK — 628Ah LiFePO4', generator: '⚙️ GENERATOR',
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
        <div class="sb-mini"><div class="sb-mini-lbl">PV vandaag</div><div class="sb-mini-val" id="ep-pvd" style="color:#ffd700">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">PV gisteren</div><div class="sb-mini-val" id="ep-pvg" style="color:#ffaa44">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">PV maand</div><div class="sb-mini-val" id="ep-pvm" style="color:#ff8800">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">Walstroom dag</div><div class="sb-mini-val" id="ep-gd" style="color:#00aaff">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">Verbruik dag</div><div class="sb-mini-val" id="ep-ld" style="color:#ff8844">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">Verbruik maand</div><div class="sb-mini-val" id="ep-lm" style="color:#ff6622">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">DC spanning</div><div class="sb-mini-val" id="ep-dcv" style="color:#aaffcc">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">DC vermogen</div><div class="sb-mini-val" id="ep-dcw" style="color:#aaffcc">--</div></div>
      </div>
      <div class="sb-section">Kosten &amp; rendement (&#8364;0.50/kWh)</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px">
        <div class="sb-mini"><div class="sb-mini-lbl">Zon besparing</div><div class="sb-mini-val" id="ep-pvkost" style="color:#ffd700">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">Walstroom kosten</div><div class="sb-mini-val" id="ep-gkost" style="color:#00aaff">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">Rendement</div><div class="sb-mini-val" id="ep-rend" style="color:#aaffcc">--</div></div>
        <div class="sb-mini"><div class="sb-mini-lbl">Gem. verbruik/dag</div><div class="sb-mini-val" id="ep-gemdag" style="color:#ff8844">--</div></div>
      </div>`);

    if (id === 'solar') return h(`
      <div class="sb-grid">
        <div class="sb-card"><div class="sb-card-lbl">Huidig vermogen</div>
          <div class="sb-card-val" id="sp-nu" style="color:#ffd700">-- W</div>
          <div class="sb-bar-wrap"><div class="sb-bar-fill" id="sp-nu-bar" style="background:linear-gradient(90deg,#ff8800,#ffd700)"></div></div></div>
        <div class="sb-card"><div class="sb-card-lbl">MPPT staat</div>
          <div class="sb-card-val" id="sp-staat" style="font-size:16px;color:#00ff88">--</div>
          <div class="sb-card-sub">SmartSolar 150/85 rev2</div></div>
        <div class="sb-card"><div class="sb-card-lbl">PV stroom</div>
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
        <div style="text-align:center;padding:24px;color:rgba(255,255,255,0.35);font-size:13px">
          💡 Verlichtingsentiteiten nog niet geconfigureerd.<br>
          <span style="font-size:11px;opacity:0.6">Voeg je light.* entiteiten toe om hier te bedienen.</span>
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
          <div><div style="font-size:9px;color:rgba(255,255,255,0.3);margin-bottom:4px">AC UIT V</div><div style="font-size:18px;font-weight:700" id="syp-acv">--</div></div>
          <div><div style="font-size:9px;color:rgba(255,255,255,0.3);margin-bottom:4px">AC UIT Hz</div><div style="font-size:18px;font-weight:700" id="syp-ach">--</div></div>
          <div><div style="font-size:9px;color:rgba(255,255,255,0.3);margin-bottom:4px">DC V</div><div style="font-size:18px;font-weight:700" id="syp-dcv">--</div></div>
          <div><div style="font-size:9px;color:rgba(255,255,255,0.3);margin-bottom:4px">VERMOGEN</div><div style="font-size:18px;font-weight:700" id="syp-w">--</div></div>
        </div>
      </div>`);

    return h('<div style="padding:20px;color:rgba(255,255,255,0.4)">Geen data beschikbaar.</div>');
  }

  _fillPopupData(id, container) {
    const hass = this._hass;
    if (!hass) return;
    const _s  = (e) => { const v = parseFloat(hass.states[e]?.state); return isNaN(v) ? 0 : v; };
    const _st = (e) => hass.states[e]?.state ?? '--';
    const _at = (e, a) => hass.states[e]?.attributes?.[a] ?? '--';
    const _nT = (iso) => { try { return new Date(iso).toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'}); } catch(e) { return '--'; } };
    const T = (elId, val) => { const el = container.querySelector('#'+elId); if(el) el.textContent = val; };
    const C = (elId, clr) => { const el = container.querySelector('#'+elId); if(el) el.style.color = clr; };
    const W = (elId, w, max) => { const el = container.querySelector('#'+elId); if(el) el.style.width = Math.min(w/max*100,100).toFixed(1)+'%'; };

    if (id === 'energie') {
      const lW=_s('sensor.gx_device_consumption_power_l1'), pW=_s('sensor.gx_device_pv_power'),
            gW=_s('sensor.quattro_24_5000_120_2x100_id_276_input_power_l1'),
            bW=_s('sensor.gx_device_dc_battery_power'), bA=_s('sensor.smartshunt_hq2224ru6gc_stroom'),
            acV=_s('sensor.quattro_24_5000_120_2x100_id_276_output_voltage_l1').toFixed(0),
            acH=_s('sensor.quattro_24_5000_120_2x100_id_276_output_frequency_l1').toFixed(1),
            dcV=_s('sensor.quattro_24_5000_120_2x100_id_276_dc_voltage').toFixed(1),
            dcW=_s('sensor.quattro_24_5000_120_2x100_id_276_output_power_l1').toFixed(0);
      T('ep-load',lW+' W'); W('ep-load-bar',lW,5000); T('ep-pv',pW+' W'); W('ep-pv-bar',pW,1800);
      T('ep-grid',gW+' W'); W('ep-grid-bar',gW,5000);
      T('ep-batt',(bA>0?'▲ +':'▼ ')+Math.abs(bW).toFixed(0)+' W'); T('ep-batt-sub',bA>0?'Laden':'Ontladen');
      C('ep-batt',bA>0?'#00ff88':'#ff9900');
      T('ep-acv',acV+' V'); T('ep-ach',acH+' Hz'); T('ep-state',_st('sensor.gx_device_system_state')); T('ep-state-sub',dcV+' V DC');
      T('ep-pvd',_s('sensor.solar_yield_vandaag').toFixed(2)+' kWh');
      T('ep-pvg',_s('sensor.smartsolar_mppt_ve_can_150_85_rev2_id_279_yield_yesterday').toFixed(2)+' kWh');
      T('ep-pvm',_s('sensor.solar_yield_maand').toFixed(1)+' kWh');
      T('ep-gd',_s('sensor.walstroom_dagverbruik').toFixed(2)+' kWh');
      T('ep-ld',_s('sensor.gx_device_ac_uitgang_dagverbruik').toFixed(2)+' kWh');
      T('ep-lm',_s('sensor.gx_device_verbruik_aan_boord_maand').toFixed(1)+' kWh');
      T('ep-dcv',dcV+' V'); T('ep-dcw',dcW+' W');
      // Kosten & rendement
      const pvM2  = _s('sensor.solar_yield_maand');
      const walM  = _s('sensor.walstroom_verbruik_maand');
      const uitM  = _s('sensor.gx_device_verbruik_aan_boord_maand');
      const inTot = pvM2 + walM;
      const rend  = inTot > 0 ? ((uitM / inTot) * 100).toFixed(1) + ' %' : '-- %';
      const dagNr = new Date().getDate();
      const gemDag = dagNr > 0 ? (uitM / dagNr).toFixed(2) + ' kWh' : '--';
      T('ep-pvkost', '€ ' + (pvM2 * 0.50).toFixed(2));
      T('ep-gkost',  '€ ' + (walM * 0.50).toFixed(2));
      T('ep-rend',   rend);
      T('ep-gemdag', gemDag);
    }
    else if (id === 'solar') {
      const pW=_s('sensor.gx_device_pv_power'), pA=_s('sensor.gx_device_pv_current').toFixed(1);
      T('sp-nu',pW+' W'); W('sp-nu-bar',pW,1800); T('sp-staat',_st('sensor.smartsolar_mppt_ve_can_150_85_rev2_id_279_state')); T('sp-a',pA+' A');
      T('sp-d',_s('sensor.solar_yield_vandaag').toFixed(2)+' kWh');
      T('sp-g',_s('sensor.smartsolar_mppt_ve_can_150_85_rev2_id_279_yield_yesterday').toFixed(2)+' kWh');
      T('sp-m',_s('sensor.solar_yield_maand').toFixed(1)+' kWh');
      T('sp-elev',parseFloat(_at('sun.sun','elevation')).toFixed(1)+'°');
      T('sp-azim',parseFloat(_at('sun.sun','azimuth')).toFixed(0)+'°');
      T('sp-op',_nT(_at('sun.sun','next_rising'))); T('sp-ond',_nT(_at('sun.sun','next_setting')));
      T('sp-bov',_st('sun.sun')==='above_horizon'?'Ja ☀️':'Nee 🌙');
      try { const r=new Date(_at('sun.sun','next_rising')),s=new Date(_at('sun.sun','next_setting')); T('sp-dag',((s-r)/3600000).toFixed(1)+' uur'); } catch(e){}
    }
    else if (id === 'accu') {
      const soc=_s('sensor.smartshunt_hq2224ru6gc_batterij'),
            v=_s('sensor.smartshunt_hq2224ru6gc_spanning').toFixed(2),
            a=_s('sensor.smartshunt_hq2224ru6gc_stroom').toFixed(1),
            w=_s('sensor.gx_device_dc_battery_power').toFixed(0),
            wh=_s('sensor.accu_beschikbaar_wh').toFixed(0);
            const _soc30 = _s('sensor.accu_beschikbaar_wh') * 0.70;
            const _battP = _s('sensor.gx_device_dc_battery_power');
            const _dis = Math.abs(_battP);
            dur = _battP < -20 ? (_soc30 / _dis).toFixed(1) : _s('sensor.verwachte_accuduur').toFixed(1);
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
        const p=b==='b1'?'jk_bms_1_jk_bms_1':'jk_bms_2_jk_bms_2';
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
      const gs=_st('sensor.generator_start_stop_run_state'), aan=gs==='running';
      T('gp-staat',aan?'● RUNNING':'○ GESTOPT'); C('gp-staat',aan?'#00ff88':'rgba(255,255,255,0.4)');
      T('gp-sub',gs);
      T('gp-acv',_s('sensor.quattro_24_5000_120_2x100_id_276_input_voltage_l1').toFixed(0)+' V');
      T('gp-w',_s('sensor.quattro_24_5000_120_2x100_id_276_input_power_l1').toFixed(0)+' W');
      T('gp-hz',_s('sensor.quattro_24_5000_120_2x100_id_276_output_frequency_l1').toFixed(1)+' Hz');
      [['gp-temp','sensor.quattro_24_5000_120_2x100_id_276_high_temperature_alarm'],
       ['gp-over','sensor.quattro_24_5000_120_2x100_id_276_overload_alarm'],
       ['gp-batt','sensor.quattro_24_5000_120_2x100_id_276_low_battery_alarm']].forEach(([el,s])=>{
        const v=_st(s); T(el,ok.includes(v)?'✓ OK':'⚠ ALARM'); C(el,ok.includes(v)?'#00ff88':'#ff4444');
      });
    }
    else if (id === 'klimaat') {
      T('kp-tin',_s('sensor.ewelink_snzb_02p_temperatuur').toFixed(1)+'°C');
      T('kp-hum',_s('sensor.ewelink_snzb_02p_luchtvochtigheid').toFixed(0)+'%');
      T('kp-wdir',_st('sensor.windrichting'));
    }
    else if (id === 'systeem') {
      T('syp-fw',_st('sensor.gx_device_installed_version'));
      T('syp-state',_st('sensor.gx_device_system_state'));
      T('syp-mppt',_st('sensor.smartsolar_mppt_ve_can_150_85_rev2_id_279_state'));
      T('syp-gen',_st('sensor.generator_start_stop_run_state'));
      T('syp-acv',_s('sensor.quattro_24_5000_120_2x100_id_276_output_voltage_l1').toFixed(0)+' V');
      T('syp-ach',_s('sensor.quattro_24_5000_120_2x100_id_276_output_frequency_l1').toFixed(1)+' Hz');
      T('syp-dcv',_s('sensor.quattro_24_5000_120_2x100_id_276_dc_voltage').toFixed(1)+' V');
      T('syp-w',_s('sensor.quattro_24_5000_120_2x100_id_276_output_power_l1').toFixed(0)+' W');
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

  async _loadForecast() {
    if (!this._hass) return;
    try {
      const result = await this._hass.callWS({
        type: 'weather/get_forecasts',
        entity_ids: ['weather.forecast_thuis'],
        forecast_type: 'daily',
      });
      if (result && result['weather.forecast_thuis']?.forecast) {
        this._forecast = result['weather.forecast_thuis'].forecast;
        this._render();
      }
    } catch(e) {
      try {
        const result2 = await this._hass.callService('weather', 'get_forecasts', {
          entity_id: 'weather.forecast_thuis',
          type: 'daily',
        }, undefined, undefined, true);
        if (result2?.response?.['weather.forecast_thuis']?.forecast) {
          this._forecast = result2.response['weather.forecast_thuis'].forecast;
          this._render();
        }
      } catch(e2) { console.warn('Finally SkyCard: forecast laden mislukt', e2); }
    }
  }

  _waterSparkline(w, h) {
    if (!this._waterHistory || this._waterHistory.length < 2) {
      return `<text x="${w/2}" y="${h/2}" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="10" font-family="sans-serif">laden...</text>`;
    }
    const data = this._waterHistory;
    const vals = data.map(d => d.v);
    const times = data.map(d => d.t);
    const minV = Math.min(...vals) - 1;
    const maxV = Math.max(...vals) + 1;
    const minT = Math.min(...times);
    const maxT = Math.max(...times);
    const rng = maxV - minV || 1;
    const px = t => ((t - minT) / (maxT - minT)) * (w - 4) + 2;
    const py = v => h - 4 - ((v - minV) / rng) * (h - 8);
    const pts = data.map(d => `${px(d.t).toFixed(1)},${py(d.v).toFixed(1)}`).join(' ');
    const cur = vals[vals.length - 1];
    const zero = py(0);
    const lineColor = cur > 0 ? '#00aaff' : cur > -20 ? '#ffa500' : '#ff4444';
    return `
      ${zero >= 0 && zero <= h ? `<line x1="2" y1="${zero.toFixed(1)}" x2="${w-2}" y2="${zero.toFixed(1)}" stroke="rgba(255,255,255,0.15)" stroke-width="0.5" stroke-dasharray="3 2"/>` : ''}
      <polyline points="${pts}" fill="none" stroke="${lineColor}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${px(times[times.length-1]).toFixed(1)}" cy="${py(cur).toFixed(1)}" r="3" fill="${lineColor}"/>
      <text x="2" y="${h}" fill="rgba(255,255,255,0.3)" font-size="8" font-family="sans-serif">-48u</text>
      <text x="${w-2}" y="${h}" text-anchor="end" fill="rgba(255,255,255,0.3)" font-size="8" font-family="sans-serif">nu</text>`;
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
        <div style="font-size:12px;color:rgba(255,255,255,0.3);margin-top:8px">Laden...</div>
      </div>`;
    }
    const items = fc.slice(0, 5).map(day => {
      const d = new Date(day.datetime);
      const dagNaam = days[d.getDay()];
      const tMax = day.temperature !== undefined ? Math.round(day.temperature) : (day.tempmax !== undefined ? Math.round(day.tempmax) : '--');
      const tMin = day.templow !== undefined ? Math.round(day.templow) : (day.temperature_low !== undefined ? Math.round(day.temperature_low) : '--');
      const icon = this._weatherIcon(day.condition, 36);
      const neerslag = day.precipitation !== undefined && day.precipitation > 0 ? `<div style="font-size:10px;color:#66aaff;margin-top:2px">${day.precipitation.toFixed(1)}mm</div>` : '';
      return `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;min-width:68px">
        <div style="font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:1px">${dagNaam}</div>
        ${icon}
        <div style="font-size:14px;font-weight:700;color:#fff">${tMax}°</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.4)">${tMin}°</div>
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
      <div style="font-size:11px;font-weight:700;color:${kleur};letter-spacing:1px">${label}</div>
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
      <div style="font-size:13px;font-weight:700;color:${c}">${Math.round(soc)}%</div>
    </div>`;
  }

  _progressBar(pct, color, maxW) {
    const w = Math.min(Math.max(pct, 0), 100);
    return `<div style="width:${maxW}px;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden">
      <div style="width:${w}%;height:100%;background:${color};border-radius:3px;transition:width 1s ease"></div>
    </div>`;
  }

  _render() {
    if (!this.shadowRoot) return;
    const s = this._s.bind(this);
    const st = this._st.bind(this);
    const hass = this._hass;

    // ── Energie ──
    const pvW        = hass ? s('sensor.gx_device_pv_power') : 0;
    const pvMaxVandaag = hass ? Math.max(s('sensor.smartsolar_mppt_ve_can_150_85_rev2_id_279_max_power_today'), pvW, 100) : 1800;
    const pvMax      = pvMaxVandaag;
    const pvPct      = Math.min((pvW / pvMax) * 100, 100);
    const loadW      = hass ? s('sensor.gx_device_consumption_power_l1') : 0;
    const loadMax    = 5000;
    const loadPct    = Math.min((loadW / loadMax) * 100, 100);
    const loadKleur  = loadW >= 4500 ? '#ff2222' : loadW >= 3000 ? '#ff6600' : '#ff8844';
    const loadAlarm  = loadW >= 4500;
    const gridW      = hass ? s('sensor.quattro_24_5000_120_2x100_id_276_input_power_l1') : 0;
    const acInputLimit = hass ? s('number.gx_device_ac_input_limit').toFixed(0) : '--';
    const battPow    = hass ? s('sensor.gx_device_dc_battery_power') : 0;
    const loadTeken  = (battPow < -10 && gridW < 20) ? '−' : '';  // accu → boot = min teken
    const battSoc    = hass ? s('sensor.smartshunt_hq2224ru6gc_batterij') : 0;
    const battV      = hass ? s('sensor.smartshunt_hq2224ru6gc_spanning').toFixed(1) : '--';
    const battA      = hass ? s('sensor.smartshunt_hq2224ru6gc_stroom').toFixed(1) : '--';
    const battWh     = hass ? s('sensor.accu_beschikbaar_wh').toFixed(0) : '--';
    const _soc30wh   = hass ? s('sensor.accu_beschikbaar_wh') * 0.70 : 0;
    const _battPowR  = hass ? s('sensor.gx_device_dc_battery_power') : 0;
    const _discharge = Math.abs(_battPowR);
    const battDuur   = _battPowR < -20 ? (_soc30wh / _discharge).toFixed(1) : (hass ? s('sensor.verwachte_accuduur').toFixed(1) : '--');
    const pvVandaag  = hass ? s('sensor.solar_yield_vandaag').toFixed(2) : '--';
    const pvMaand    = hass ? s('sensor.solar_yield_maand').toFixed(1) : '--';
    const pvGisteren = hass ? s('sensor.smartsolar_mppt_ve_can_150_85_rev2_id_279_yield_yesterday').toFixed(2) : '--';
    const battChar   = parseFloat(battA) > 0;

    // ── BMS ──
    const bms1Soc   = hass ? s('sensor.jk_bms_1_jk_bms_1_soc') : 0;
    const bms1Temp  = hass ? s('sensor.bms1_temperatuur_netjes').toFixed(1) : '--';
    const bms1MosT  = hass ? s('sensor.jk_bms_1_jk_bms_1_mos_temperature').toFixed(1) : '--';
    const bms1Min   = hass ? s('sensor.jk_bms_1_jk_bms_1_cell_volt_min').toFixed(3) : '--';
    const bms1Max   = hass ? s('sensor.jk_bms_1_jk_bms_1_cell_volt_max').toFixed(3) : '--';
    const bms1Delta = hass ? (s('sensor.jk_bms_1_jk_bms_1_cell_volt_max') - s('sensor.jk_bms_1_jk_bms_1_cell_volt_min')).toFixed(3) : '--';
    const bms1Cycli = hass ? s('sensor.jk_bms_1_jk_bms_1_num_cycles').toFixed(0) : '--';
    const bms2Soc   = hass ? s('sensor.jk_bms_2_jk_bms_2_soc') : 0;
    const bms2Temp  = hass ? s('sensor.bms2_temperatuur_netjes').toFixed(1) : '--';
    const bms2MosT  = hass ? s('sensor.jk_bms_2_jk_bms_2_mos_temperature').toFixed(1) : '--';
    const bms2Min   = hass ? s('sensor.jk_bms_2_jk_bms_2_cell_volt_min').toFixed(3) : '--';
    const bms2Max   = hass ? s('sensor.jk_bms_2_jk_bms_2_cell_volt_max').toFixed(3) : '--';
    const bms2Delta = hass ? (s('sensor.jk_bms_2_jk_bms_2_cell_volt_max') - s('sensor.jk_bms_2_jk_bms_2_cell_volt_min')).toFixed(3) : '--';
    const bms2Cycli = hass ? s('sensor.jk_bms_2_jk_bms_2_num_cycles').toFixed(0) : '--';
    const d1c = parseFloat(bms1Delta) > 0.015 ? '#ff9900' : '#aaffcc';
    const d2c = parseFloat(bms2Delta) > 0.015 ? '#ff9900' : '#aaffcc';

    // ── Systeem ──
    const sysState  = hass ? st('sensor.gx_device_system_state') : '--';
    const mpptState = hass ? st('sensor.smartsolar_mppt_ve_can_150_85_rev2_id_279_state') : '--';
    const acV       = hass ? s('sensor.quattro_24_5000_120_2x100_id_276_output_voltage_l1').toFixed(0) : '--';
    const acHz      = hass ? s('sensor.quattro_24_5000_120_2x100_id_276_output_frequency_l1').toFixed(1) : '--';
    const acInV     = hass ? s('sensor.quattro_24_5000_120_2x100_id_276_input_voltage_l1').toFixed(0) : '--';
    const acOutW    = hass ? s('sensor.quattro_24_5000_120_2x100_id_276_output_power_l1').toFixed(0) : '--';
    const dcV       = hass ? s('sensor.quattro_24_5000_120_2x100_id_276_dc_voltage').toFixed(1) : '--';
    const alarmTemp = hass ? st('sensor.quattro_24_5000_120_2x100_id_276_high_temperature_alarm') : 'ok';
    const alarmOver = hass ? st('sensor.quattro_24_5000_120_2x100_id_276_overload_alarm') : 'ok';
    const alarmBatt = hass ? st('sensor.quattro_24_5000_120_2x100_id_276_low_battery_alarm') : 'ok';
    const sc        = ['bulk','absorption','float'].includes(sysState) ? '#00ff88' : sysState === 'inverting' ? '#00cc66' : '#00aaff';
    const sl        = sysState === 'inverting' ? 'OMVORMEN' : sysState === 'bulk' ? 'BULK LADEN' :
                      sysState === 'absorption' ? 'ABSORPTIE' : sysState === 'float' ? 'FLOAT' :
                      sysState === 'passthru' ? 'WALSTROOM' : sysState.toUpperCase();

    // ── Extra ──
    const genState   = hass ? st('sensor.generator_start_stop_run_state') : '--';
    const genActive  = genState === 'running';

    // ── Omgeving ──
    const tempBinnen = hass ? s('sensor.ewelink_snzb_02p_temperatuur').toFixed(1) : '--';
    const vocht      = hass ? s('sensor.ewelink_snzb_02p_luchtvochtigheid').toFixed(0) : '--';
    const _wAttr     = hass ? hass.states['weather.forecast_thuis']?.attributes : null;
    const windKm     = _wAttr ? parseFloat(_wAttr.wind_speed ?? 0).toFixed(1) : '--';
    const _windBear  = _wAttr ? parseFloat(_wAttr.wind_bearing ?? 0) : 0;
    const _windDirs  = ['N','NNO','NO','ONO','O','OZO','ZO','ZZO','Z','ZZW','ZW','WZW','W','WNW','NW','NNW'];
    const windDir    = _wAttr ? _windDirs[Math.round(_windBear / 22.5) % 16] : '--';
    const windBft    = _wAttr ? (windKm < 1 ? 0 : windKm < 6 ? 1 : windKm < 12 ? 2 : windKm < 20 ? 3 : windKm < 29 ? 4 : windKm < 39 ? 5 : windKm < 50 ? 6 : windKm < 62 ? 7 : windKm < 75 ? 8 : windKm < 89 ? 9 : windKm < 103 ? 10 : windKm < 117 ? 11 : 12) : '--';
    const p2000      = hass ? st('input_text.laatste_p2000_bericht') : '--';
    const scheepvaart = hass ? st('sensor.scheepvaart_tekst') : '--';
    const knmiCode   = hass ? st('sensor.knmi_weercode') : 'Groen';
    const tempBuiten = hass ? (hass.states['weather.forecast_thuis']?.attributes?.temperature ?? '--') : '--';
    const wcond      = hass ? st('weather.forecast_thuis') : '--';
    const wIcon      = {'sunny':'☀️','partlycloudy':'⛅','cloudy':'☁️','overcast':'☁️','rainy':'🌧️','pouring':'🌧️','lightning':'⛈️','lightning-rainy':'⛈️','snowy':'❄️','snowy-rainy':'🌨️','fog':'🌫️','windy':'💨','windy-variant':'💨','clear-night':'🌙'}[wcond] || '🌡️';
    const knmiTekst  = hass ? st('sensor.knmi_tekst') : '';

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
    // Grid: rechte lijn van links naar boot
    const gridX1 = 390, gridY1 = 694;

    // Achtergrond
    const _skyRaw = hass ? (hass.states['sensor.sky_card_image']?.state ?? '--') : '--';
    const skyImg  = (_skyRaw && _skyRaw !== 'unknown' && _skyRaw !== 'unavailable' && _skyRaw !== '--') ? _skyRaw : '/local/finally-card/clear-day.png';


    // Flows actief
    const pvActive   = pvW > 10 && sunAbove;
    const gridActive   = gridW > 20;
    const gridSpanning = parseFloat(acInV) > 100;
    const walSocketAan = hass ? st('switch.walstroom_socket_1') === 'on' : false;
    const walOverride  = hass ? st('input_boolean.walstroom_override') === 'on' : false;
    const battActive = Math.abs(battPow) > 10;

    // Tijd
    const nu    = new Date();
    const tijd  = nu.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    const datum = nu.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });

    const sparkline = this._waterSparkline(160, 44);

    this.shadowRoot.innerHTML = `
<style>
  :host {
    display: block; width: 100vw; height: 100vh; overflow: hidden;
    --lbl-dim: rgba(255,255,255,0.35);
    --lbl-mid: rgba(255,255,255,0.40);
    --lbl-sub: rgba(255,255,255,0.45);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, sans-serif; }
  .wrap { position: relative; width: 100vw; height: 100vh; overflow: hidden; background: #050e1a; }
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
  .lbl { font-size: 13px; color: var(--lbl-dim); letter-spacing: 2px; text-transform: uppercase; }
  .val { font-size: 17px; font-weight: 700; color: #fff; line-height: 1.2; }
  .sub { font-size: 13px; color: var(--lbl-mid); }
  .wrow { display: flex; gap: 22px; align-items: center; flex-wrap: wrap; justify-content: center; width: 100%; }
  .wi { display: flex; align-items: center; gap: 7px; font-size: 17px; color: #fff; }
  .wi svg { flex-shrink: 0; width: 18px; height: 18px; }

  .grid-lbl { position: absolute; left: 300px; top: 640px; z-index: 10; }
  .fbox { background: rgba(4,14,44,0.22); backdrop-filter: blur(10px); border-radius: 10px; padding: 8px 14px; text-align: center; min-width: 100px; }
  .zonlbl { position: absolute; z-index: 10; background: rgba(4,14,44,0.18); backdrop-filter: blur(8px); border-radius: 8px; padding: 4px 10px; text-align: center; border: 0.5px solid rgba(255,200,80,0.2); }

  .batt-panel { position: absolute; right: 8px; top: 200px; z-index: 10; display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
  .batt-row { display: flex; flex-direction: column; gap: 5px; align-items: flex-end; }
  .batt-unit { display: flex; flex-direction: row; align-items: flex-start; gap: 6px; background: rgba(4,14,44,0.22); backdrop-filter: blur(10px); border-radius: 10px; padding: 7px 10px; border: 0.5px solid rgba(100,170,255,0.2); }
  .batt-detail { background: rgba(4,14,44,0.22); backdrop-filter: blur(10px); border: 0.5px solid rgba(100,170,255,0.2); border-radius: 10px; padding: 8px 12px; font-size: 14px; }

  .pwrbars { position: absolute; left: 50%; bottom: 9%; transform: translateX(-50%); z-index: 10; display: flex; flex-direction: row; gap: 100px; }
  .pbrwrap { background: rgba(4,14,44,0.22); backdrop-filter: blur(10px); border: 0.5px solid rgba(100,170,255,0.2); border-radius: 10px; padding: 9px 16px; width: 280px; }
  .pbr-lbl { font-size: 11px; color: var(--lbl-mid); letter-spacing: 1px; margin-bottom: 6px; display: flex; justify-content: space-between; }
  .pbr-bar { height: 10px; background: rgba(255,255,255,0.08); border-radius: 5px; overflow: hidden; }
  .pbr-fill { height: 100%; border-radius: 5px; transition: width 1s ease; }

  .statsbar { position: absolute; bottom: 0; left: 0; right: 0; z-index: 10; padding: 6px 10px 8px; display: flex; gap: 5px; }
  .stat { background: rgba(4,14,44,0.22); backdrop-filter: blur(10px); border: 0.5px solid rgba(100,170,255,0.15); border-radius: 10px; padding: 9px 12px; flex: 1; text-align: center; }
  .sl { font-size: 11px; color: var(--lbl-dim); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 3px; }
  .sv { font-size: 18px; font-weight: 700; color: #fff; line-height: 1.1; }
  .ss { font-size: 12px; color: var(--lbl-dim); margin-top: 2px; }
  .sr { display: flex; justify-content: space-between; margin-top: 2px; align-items: center; }
  .sk { font-size: 13px; color: var(--lbl-mid); }
  .sv2 { font-size: 13px; font-weight: 700; color: #fff; }

  .sidebar { position: absolute; left: 8px; top: 50%; transform: translateY(-50%);
    z-index: 15; display: flex; flex-direction: column; gap: 7px; }
  .sb-btn { width: 96px; background: rgba(4,14,44,0.22); backdrop-filter: blur(14px);
    border: 0.5px solid rgba(100,170,255,0.22); border-radius: 16px; padding: 14px 0;
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    cursor: pointer; user-select: none; -webkit-tap-highlight-color: transparent; }
  .sb-btn:active { background: rgba(4,14,44,0.60); border-color: rgba(100,170,255,0.6); }
  .sb-icon { width: 40px; height: 40px; display: block; }
  .sb-lbl { font-size: 11px; color: var(--lbl-sub); letter-spacing: 0.8px;
    text-transform: uppercase; text-align: center; font-family: sans-serif; }
</style>

<div class="wrap">
  <img class="bg" src="${skyImg}"/>
  <img src="/local/finally-card/boot.png" style="position:absolute;bottom:18%;left:35%;width:38%;height:auto;pointer-events:none;z-index:4;opacity:0.95"/>

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
    <path d="M ${gridX1} ${gridY1} L ${bootFlowX-100} ${bootFlowY}" fill="none"
          stroke="#00aaff" stroke-width="10" stroke-dasharray="14 8"
          opacity="0.2" filter="url(#glow-grid)" class="flow-anim"/>
    <path d="M ${gridX1} ${gridY1} L ${bootFlowX-100} ${bootFlowY}" fill="none"
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
      <div class="sub" style="text-transform:capitalize;font-size:14px;margin-top:3px">${datum}</div>
    </div>
    <div class="tb grow" style="align-items:center;justify-content:center">
      <div class="wrow">
        <div class="wi">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff6644"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 019.5 9 2.5 2.5 0 0112 6.5 2.5 2.5 0 0114.5 9 2.5 2.5 0 0112 11.5z"/></svg>
          <b>${tempBinnen}°C</b> / ${vocht}%
        </div>
        <div class="wi">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffd700" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          <span>${wcond !== '--' ? wcond : 'onbekend'}</span>
        </div>
        <div class="wi">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#88ccff"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>
          ${windKm} km/h ${windDir} (${windBft} Bft)
        </div>
        <div class="wi">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#00ccff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
          -- cm
        </div>

      </div>
      ${knmiCode !== 'Groen' && knmiCode !== '--' ? '<div id="knmi-btn" data-code="'+knmiCode+'" style="cursor:pointer;margin-top:6px;display:inline-block;padding:4px 12px;background:'+(knmiCode==='Rood'?'rgba(80,10,10,0.6)':knmiCode==='Oranje'?'rgba(80,40,0,0.6)':'rgba(60,50,0,0.6)')+';border:1px solid '+(knmiCode==='Rood'?'rgba(255,80,80,0.6)':knmiCode==='Oranje'?'rgba(255,140,0,0.6)':'rgba(255,220,0,0.6)')+';border-radius:8px;font-size:12px;font-weight:700;color:'+(knmiCode==='Rood'?'#ff6666':knmiCode==='Oranje'?'#ffaa44':'#ffee44')+'">⚠ KNMI Code '+knmiCode+'</div>' : ''}
    </div>
    <div class="tb" style="text-align:center;min-width:160px">
      <div class="lbl">MODUS</div>
      <div class="val" style="font-size:22px;color:${sc}">${sl}</div>
      <div class="sub" style="font-size:13px">${acV} V · ${acHz} Hz</div>
    </div>
    <div class="tb" style="text-align:center;min-width:190px">
      <div class="lbl">ZON NU / VANDAAG</div>
      <div class="val" style="font-size:24px;color:#ffd700">${pvW} W</div>
      <div style="margin-top:4px">${this._progressBar(pvPct, 'linear-gradient(90deg,#ff8800,#ffd700)', 155)}</div>
      <div class="sub" style="margin-top:3px;font-size:12px">${pvVandaag} kWh · gisteren ${pvGisteren}</div>
    </div>
    ${this._forecastTegel()}
  </div>

  <!-- GRID label linksboven bij mast -->
  <div class="grid-lbl">
    <div class="fbox" style="border:1.5px solid ${gridActive?'rgba(0,170,255,0.8)':gridSpanning?'rgba(255,165,0,0.7)':'rgba(255,255,255,0.12)'}">
      <div class="lbl" style="letter-spacing:2px;font-size:12px">WALSTROOM</div>
      <div style="font-size:22px;font-weight:800;color:${gridActive?'#00aaff':gridSpanning?'#ffaa00':'rgba(255,255,255,0.55)'}">
        ${gridActive ? gridW+' W' : gridSpanning ? acInV+' V' : 'OFF-GRID'}
      </div>
      ${gridActive ? '<div class="sub" style="color:#00aaff;font-size:13px">&#9679; AAN</div>' : gridSpanning ? '<div class="sub" style="color:#ffaa00;font-size:13px">&#9679; stand-by</div>' : '<div class="sub" style="color:#00ff88;font-size:13px">&#9679; OFF-GRID</div>'}
      <div id="wal-limit-btn" data-action="wal-limit" style="margin-top:6px;cursor:pointer;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:6px;padding:3px 8px;font-size:11px;color:rgba(255,255,255,0.5);text-align:center">
        &#9889; Limiet: ${acInputLimit} A
      </div>
      <div id="wal-socket-btn" style="margin-top:5px;cursor:pointer;background:${walSocketAan?'rgba(0,255,136,0.12)':'rgba(255,255,255,0.06)'};border:1px solid ${walSocketAan?'rgba(0,255,136,0.5)':'rgba(255,255,255,0.2)'};border-radius:6px;padding:5px 8px;font-size:13px;font-weight:700;color:${walSocketAan?'#00ff88':'rgba(255,255,255,0.45)'};text-align:center">
        ${walSocketAan?'&#9679; SOCKET AAN':'&#9675; SOCKET UIT'}
      </div>
      <div id="wal-override-btn" style="margin-top:4px;cursor:pointer;background:${walOverride?'rgba(255,165,0,0.12)':'rgba(0,255,136,0.08)'};border:0.5px solid ${walOverride?'rgba(255,165,0,0.5)':'rgba(0,255,136,0.3)'};border-radius:6px;padding:4px 8px;font-size:11px;font-weight:600;color:${walOverride?'#ffaa44':'#00ff88'};text-align:center;display:flex;align-items:center;justify-content:center;gap:5px">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="${walOverride?'#ffaa44':'#00ff88'}" stroke-width="2.5">${walOverride?'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>':'<circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>'}</svg>
        ${walOverride?'HANDMATIG':'AUTO'}
      </div>
      <div id="wal-instellingen-btn" style="margin-top:4px;cursor:pointer;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.12);border-radius:6px;padding:4px 8px;font-size:11px;color:rgba(255,255,255,0.45);text-align:center;display:flex;align-items:center;justify-content:center;gap:5px">
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
    <div style="font-size:9px;color:rgba(255,200,80,0.5);letter-spacing:1px">ZON OP</div>
    <div style="font-size:14px;font-weight:700;color:rgba(255,210,100,0.9);display:flex;align-items:center;gap:5px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,210,100,0.9)" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><path d="M5 19h14" stroke-width="1.5"/><path d="M12 16v-4" stroke-width="2"/><path d="M9 13l3-3 3 3" stroke-width="2"/></svg>${zonOp}</div>
  </div>



  <!-- LOAD badge zit nu in de flows SVG -->

  <!-- PV + PWR BALKEN naast elkaar breed onder de boot -->
  <div class="pwrbars">
    <div class="pbrwrap" style="border-color:rgba(255,200,0,0.3)">
      <div class="pbr-lbl">
        <span style="color:#ffd700;font-size:13px;font-weight:700">☀ PV</span>
        <span style="color:#ffd700;font-size:13px;font-weight:700">${pvW} W <span style="opacity:0.5;font-weight:400">/ ${pvMax} W</span></span>
      </div>
      <div class="pbr-bar">
        <div class="pbr-fill" style="width:${pvPct.toFixed(1)}%;background:linear-gradient(90deg,#ff8800,#ffd700)"></div>
      </div>
    </div>
    <div class="pbrwrap" style="border-color:rgba(255,100,50,0.3)">
      <div class="pbr-lbl">
        <span style="color:${loadKleur};font-size:13px;font-weight:700${loadAlarm?';animation:pulse 0.6s ease-in-out infinite':''}">⚡ LOAD${loadAlarm?' ⚠':''}</span>
        <span style="color:${loadKleur};font-size:13px;font-weight:700">${loadW} W <span style="opacity:0.5;font-weight:400">/ ${loadMax} W</span></span>
      </div>
      <div class="pbr-bar">
        <div class="pbr-fill" style="width:${loadPct.toFixed(1)}%;background:${loadAlarm?'linear-gradient(90deg,#cc0000,#ff2222)':'linear-gradient(90deg,#ff4400,#ff8844)'}"></div>
      </div>
    </div>
  </div>

  <!-- BATTERIJ PANEEL rechtsonder: elke accu naast zijn BMS tegel -->
  <div class="batt-panel">
    <div class="batt-row">

      <!-- BMS 1: accu + detail naast elkaar -->
      <div class="batt-unit" style="border-color:rgba(0,255,136,0.2)">
        ${this._battSvg(bms1Soc, 'BMS 1', '#00ff88', battChar, 'bc1')}
        <div style="display:flex;flex-direction:column;justify-content:center;gap:3px;min-width:110px">
          <div style="font-size:10px;color:rgba(0,255,136,0.5);letter-spacing:1px;font-weight:700">BMS 1 — ${Math.round(bms1Soc)}%</div>
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
          <div style="font-size:10px;color:rgba(0,170,255,0.5);letter-spacing:1px;font-weight:700">BMS 2 — ${Math.round(bms2Soc)}%</div>
          <div class="sr"><span class="sk">Min/Max</span><span class="sv2">${bms2Min}/${bms2Max} V</span></div>
          <div class="sr"><span class="sk">Delta</span><span class="sv2" style="color:${d2c}">Δ ${bms2Delta} V</span></div>
          <div class="sr"><span class="sk">Temp/MOS</span><span class="sv2">${bms2Temp}°/${bms2MosT}°C</span></div>
          <div class="sr"><span class="sk">Cycli</span><span class="sv2">${bms2Cycli}</span></div>
        </div>
      </div>

    </div>

    <!-- Zon onder + Totaal SOC naast elkaar -->
    <div style="display:flex;flex-direction:row;gap:5px;width:100%">

    <!-- ZON ONDER tegel -->
    <div class="batt-detail" style="text-align:center;padding:10px 12px;display:flex;flex-direction:column;justify-content:center;align-items:center">
      <div style="font-size:9px;color:rgba(255,160,60,0.5);letter-spacing:1px">ZON ONDER</div>
      <div style="font-size:14px;font-weight:700;color:rgba(255,160,80,0.9);display:flex;align-items:center;gap:5px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,160,80,0.9)" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><path d="M5 19h14" stroke-width="1.5"/><path d="M12 12v4" stroke-width="2"/><path d="M9 15l3 3 3-3" stroke-width="2"/></svg>${zonOnd}</div>
    </div>

    <!-- Totaal SOC — grote aparte tegel -->
    <div class="batt-detail" style="flex:1;text-align:center;padding:10px 16px">
      <div style="font-size:9px;color:rgba(255,255,255,0.35);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:4px">Totaal SOC</div>
      <div style="font-size:38px;font-weight:800;color:${battSoc>35?'#00cc66':battSoc>30?'#ffa500':'#ff4444'};line-height:1">${Math.round(battSoc)}%</div>
      <div style="height:5px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;margin-top:8px">
        <div style="width:${battSoc}%;height:100%;background:${battSoc>35?'#00cc66':battSoc>30?'#ffa500':'#ff4444'};border-radius:3px;transition:width 1s ease"></div>
      </div>
    </div>

    </div><!-- einde zon-onder + soc rij -->

    <!-- Details tegel: spanning/stroom/beschikbaar/autonomie -->
    <div class="batt-detail" style="width:100%;display:flex;flex-direction:column;gap:4px;padding:9px 14px">
      <div class="sr" style="gap:10px"><span class="sk">Spanning</span><span class="sv2">${battV} V</span></div>
      <div class="sr" style="gap:10px"><span class="sk">Stroom</span><span class="sv2" style="color:${battChar?'#00ff88':'#ff9900'}">${battChar?'▲':'▼'} ${Math.abs(parseFloat(battA))} A</span></div>
      <div class="sr" style="gap:10px"><span class="sk">Beschikbaar</span><span class="sv2" style="color:#88ccff">${battWh} Wh</span></div>
      <div class="sr" style="gap:10px"><span class="sk">Autonomie</span><span class="sv2" style="color:#aaffcc">${battDuur} uur te gaan</span></div>
    </div>
  </div>


  <!-- VERWARMING POPUP -->
  <!-- KNMI popup -->
  <div id="knmi-popup" style="display:none;position:fixed;inset:0;z-index:101;background:rgba(0,0,0,0.85);backdrop-filter:blur(6px);align-items:center;justify-content:center">
    <div style="background:rgba(6,16,48,0.97);border:1px solid rgba(255,150,50,0.4);border-radius:20px;padding:36px 40px;width:min(520px,88vw);color:#fff;font-family:'Segoe UI',system-ui,sans-serif;text-align:center">
      <div style="font-size:48px;margin-bottom:16px">⚠️</div>
      <div id="knmi-popup-code" style="font-size:26px;font-weight:800;margin-bottom:10px"></div>
      <div style="font-size:14px;color:rgba(255,255,255,0.5);margin-bottom:28px">Overijssel · knmi.nl</div>
      <div style="font-size:14px;color:rgba(255,255,255,0.7);line-height:1.6;margin-bottom:32px">
        De KNMI waarschuwingsdetails zijn beschikbaar op de KNMI website.<br>
        Klik hieronder om de actuele waarschuwing te bekijken.
      </div>

      <div id="knmi-popup-sluit" style="cursor:pointer;padding:10px 24px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:10px;font-size:13px;color:rgba(255,255,255,0.5)">Sluiten</div>
    </div>
  </div>

  <div id="wal-limit-popup" style="display:none;position:fixed;inset:0;z-index:101;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);align-items:center;justify-content:center">
    <div style="background:rgba(6,16,48,0.97);border:1px solid rgba(0,170,255,0.4);border-radius:20px;padding:32px 40px;min-width:320px;text-align:center;color:#fff;font-family:'Segoe UI',system-ui,sans-serif">
      <div style="font-size:11px;letter-spacing:3px;color:rgba(255,255,255,0.4);margin-bottom:8px">WALSTROOM LIMIET</div>
      <div style="font-size:48px;font-weight:800;color:#00aaff;margin:16px 0" id="wal-limit-display">-- A</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:20px;margin-bottom:28px">
        <div id="wal-limit-min" style="cursor:pointer;width:56px;height:56px;border-radius:50%;background:rgba(0,170,255,0.1);border:1.5px solid rgba(0,170,255,0.4);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#00aaff">−</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.4)">1 A per stap</div>
        <div id="wal-limit-plus" style="cursor:pointer;width:56px;height:56px;border-radius:50%;background:rgba(0,170,255,0.1);border:1.5px solid rgba(0,170,255,0.4);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#00aaff">+</div>
      </div>
      <div style="display:flex;gap:10px;justify-content:center">
        <div id="wal-limit-set" style="cursor:pointer;padding:12px 32px;background:rgba(0,170,255,0.15);border:1px solid rgba(0,170,255,0.5);border-radius:12px;font-size:14px;font-weight:700;color:#00aaff">Instellen</div>
        <div id="wal-limit-sluit" style="cursor:pointer;padding:12px 32px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:12px;font-size:14px;color:rgba(255,255,255,0.5)">Sluiten</div>
      </div>
    </div>
  </div>



  <!-- WALSTROOM INSTELLINGEN POPUP -->
  <div id="wal-inst-popup" style="display:none;position:fixed;inset:0;z-index:102;background:rgba(0,0,0,0.80);backdrop-filter:blur(8px);align-items:center;justify-content:center">
    <div style="background:rgba(6,16,48,0.97);border:1px solid rgba(100,170,255,0.35);border-radius:20px;padding:32px 40px;min-width:360px;text-align:center;color:#fff;font-family:'Segoe UI',system-ui,sans-serif">
      <div style="font-size:11px;letter-spacing:3px;color:rgba(255,255,255,0.4);margin-bottom:20px">WALSTROOM INSTELLINGEN</div>

      <div style="margin-bottom:20px">
        <div style="font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:1px;margin-bottom:8px">SOCKET AAN ONDER</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:16px">
          <div id="wi-soc-aan-min" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">−</div>
          <div style="min-width:80px"><div id="wi-soc-aan-val" style="font-size:32px;font-weight:800;color:#ff9900">--%</div></div>
          <div id="wi-soc-aan-plus" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">+</div>
        </div>
      </div>

      <div style="margin-bottom:20px">
        <div style="font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:1px;margin-bottom:8px">SOCKET UIT BOVEN</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:16px">
          <div id="wi-soc-uit-min" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">−</div>
          <div style="min-width:80px"><div id="wi-soc-uit-val" style="font-size:32px;font-weight:800;color:#00cc66">--%</div></div>
          <div id="wi-soc-uit-plus" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">+</div>
        </div>
      </div>

      <div style="margin-bottom:28px">
        <div style="font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:1px;margin-bottom:8px">ZON DREMPEL (UIT BIJ MEER ZON)</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:16px">
          <div id="wi-zon-min" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">−</div>
          <div style="min-width:80px"><div id="wi-zon-val" style="font-size:32px;font-weight:800;color:#ffd700">-- W</div></div>
          <div id="wi-zon-plus" style="cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">+</div>
        </div>
      </div>

      <div id="wi-sluit" style="cursor:pointer;padding:12px 40px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.15);border-radius:12px;font-size:14px;color:rgba(255,255,255,0.5);display:inline-block">Sluiten</div>
    </div>
  </div>

  <div id="verw-popup" style="display:none;position:fixed;inset:0;z-index:100;background:rgba(0,0,0,0.6);backdrop-filter:blur(6px);align-items:center;justify-content:center">
    <div style="background:rgba(8,18,52,0.96);border:1px solid rgba(255,100,50,0.4);border-radius:20px;padding:32px 40px;min-width:340px;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,0.6)">
      <div style="font-size:12px;letter-spacing:3px;color:rgba(255,255,255,0.4);margin-bottom:8px">VERWARMING</div>

      <!-- Aan/uit knop -->
      <div id="verw-toggle" style="display:inline-block;margin-bottom:24px;padding:10px 32px;border-radius:30px;cursor:pointer;font-size:14px;font-weight:700;letter-spacing:2px;transition:all 0.2s"></div>

      <!-- Huidige temp -->
      <div style="font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:4px">Huidige temperatuur</div>
      <div id="verw-huidig" style="font-size:28px;font-weight:300;color:#fff;margin-bottom:24px"></div>

      <!-- Setpoint instellen -->
      <div style="font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:16px">Instelpunt</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:24px;margin-bottom:32px">
        <button id="verw-min" style="width:72px;height:72px;border-radius:50%;border:2px solid rgba(100,160,255,0.5);background:rgba(100,160,255,0.12);color:#88aaff;font-size:40px;font-weight:300;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1">−</button>
        <div id="verw-set-display" style="font-size:52px;font-weight:700;color:#fff;min-width:110px">--°</div>
        <button id="verw-plus" style="width:72px;height:72px;border-radius:50%;border:2px solid rgba(255,130,60,0.5);background:rgba(255,130,60,0.12);color:#ff9944;font-size:40px;font-weight:300;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1">+</button>
      </div>

      <!-- Sluiten -->
      <button id="verw-sluit" style="padding:12px 48px;border-radius:30px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);font-size:13px;cursor:pointer;letter-spacing:1px">SLUITEN</button>
    </div>
  </div>



      <!-- STATS BALK onderaan -->
  <div class="statsbar">

    <div class="stat" style="border-color:rgba(255,200,0,0.2)">
      <div class="sl">PV VANDAAG</div>
      <div class="sv" style="color:#ffd700">${pvVandaag} kWh</div>
      <div class="ss">Maand: ${pvMaand} kWh</div>
      <div class="ss">${mpptState}</div>
    </div>

    <div class="stat" style="max-width:140px;border-color:rgba(0,200,255,0.2)">
      <div class="sl">RESTERENDE TIJD</div>
      <div class="sv" style="color:#00d7ff">${battDuur} uur te gaan</div>
      <div class="ss">${battWh} Wh</div>
    </div>





    <div class="stat" style="flex:1.4;border-color:rgba(${sc.replace('#','').match(/../g)?'100,170,255':'100,170,255'},0.25)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <div class="sl" style="margin:0">OMVORMER</div>
        <div style="display:flex;gap:5px;align-items:center">
          <span style="font-size:9px;color:rgba(255,255,255,0.3)">TEMP</span>
          <span style="width:8px;height:8px;border-radius:50%;background:rgba(0,255,136,0.5);display:inline-block"></span>
          <span style="font-size:9px;color:rgba(255,255,255,0.3)">OVERL</span>
          <span style="width:8px;height:8px;border-radius:50%;background:${['ok','Ok','0','','false','no alarm','No alarm','No Alarm','no_alarm'].includes(alarmOver)?'rgba(0,255,136,0.5)':'#ff4444'};display:inline-block"></span>
          <span style="font-size:9px;color:rgba(255,255,255,0.3)">ACCU</span>
          <span style="width:8px;height:8px;border-radius:50%;background:${battSoc>35?'#00cc66':battSoc>30?'#ffa500':'#ff4444'};display:inline-block"></span>
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <div style="display:flex;flex-direction:column;align-items:center;background:rgba(${sc==='#00ff88'?'0,255,136':'255,153,0'},0.08);border:0.5px solid ${sc};border-radius:6px;padding:3px 8px">
          <div style="font-size:9px;color:rgba(255,255,255,0.35);letter-spacing:1px">MODUS</div>
          <div style="font-size:12px;font-weight:800;color:${sc}">${sl}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:2px;flex:1">
          <div class="sr"><span class="sk">AC uit</span><span class="sv2">${acV} V · ${acHz} Hz</span></div>
          <div class="sr"><span class="sk">AC in</span><span class="sv2" style="color:${gridActive?'#00aaff':gridSpanning?'rgba(0,170,255,0.5)':'rgba(255,255,255,0.3)'}">${gridActive?acInV+' V · '+gridW+' W':gridSpanning?acInV+' V (stand-by)':'—'}</span></div>
          <div class="sr"><span class="sk">DC</span><span class="sv2">${dcV} V</span></div>
          <div class="sr"><span class="sk">Vermogen</span><span class="sv2">${acOutW} W</span></div>
        </div>
      </div>
    </div>





    <div class="stat" style="border-color:rgba(${genActive?'0,255,100':'80,80,120'},0.2)">
      <div class="sl">GENERATOR</div>
      <div class="sv" style="color:${genActive?'#00ff88':'rgba(255,255,255,0.3)'}">${genActive?'AAN':'UIT'}</div>
      <div class="ss">${genActive?genState:'Gestopt'}</div>
    </div>



  </div>
</div>`;

    // Start flow animatie
    this._startFlowAnim();
    // Start regen animatie
    this._startRainAnim(wcond);

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
  }

  _startFlowAnim() {
    // Animatie via CSS keyframes — geen JS nodig



    // Walstroom socket knop
    const walSocketBtn = this.shadowRoot.getElementById('wal-socket-btn');
    if (walSocketBtn && this._hass) {
      walSocketBtn.onclick = (e) => {
        e.stopPropagation();
        const aan = this._hass.states['switch.walstroom_socket_1']?.state === 'on';
        this._hass.callService('switch', aan ? 'turn_off' : 'turn_on', {
          entity_id: 'switch.walstroom_socket_1'
        });
      };
    }

    // Walstroom override knop
    const walOverrideBtn = this.shadowRoot.getElementById('wal-override-btn');
    if (walOverrideBtn && this._hass) {
      walOverrideBtn.onclick = (e) => {
        e.stopPropagation();
        const aan = this._hass.states['input_boolean.walstroom_override']?.state === 'on';
        this._hass.callService('input_boolean', aan ? 'turn_off' : 'turn_on', {
          entity_id: 'input_boolean.walstroom_override'
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
      const aan = parseFloat(this._hass.states['input_number.walstroom_soc_aan']?.state) || 30;
      const uit = parseFloat(this._hass.states['input_number.walstroom_soc_uit']?.state) || 80;
      const zon = parseFloat(this._hass.states['input_number.walstroom_zon_drempel']?.state) || 300;
      wiPopup._socAan = aan; wiPopup._socUit = uit; wiPopup._zon = zon;
      const v1 = wiPopup.querySelector('#wi-soc-aan-val');
      const v2 = wiPopup.querySelector('#wi-soc-uit-val');
      const v3 = wiPopup.querySelector('#wi-zon-val');
      if (v1) v1.textContent = aan + '%';
      if (v2) v2.textContent = uit + '%';
      if (v3) v3.textContent = zon + ' W';
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
        _wiSet('input_number.walstroom_soc_aan', wiPopup._socAan);
      });
      _btn('wi-soc-aan-plus', () => {
        wiPopup._socAan = Math.min(70, (wiPopup._socAan || 30) + 5);
        const el = wiPopup.querySelector('#wi-soc-aan-val'); if (el) el.textContent = wiPopup._socAan + '%';
        _wiSet('input_number.walstroom_soc_aan', wiPopup._socAan);
      });
      _btn('wi-soc-uit-min', () => {
        wiPopup._socUit = Math.max(50, (wiPopup._socUit || 80) - 5);
        const el = wiPopup.querySelector('#wi-soc-uit-val'); if (el) el.textContent = wiPopup._socUit + '%';
        _wiSet('input_number.walstroom_soc_uit', wiPopup._socUit);
      });
      _btn('wi-soc-uit-plus', () => {
        wiPopup._socUit = Math.min(100, (wiPopup._socUit || 80) + 5);
        const el = wiPopup.querySelector('#wi-soc-uit-val'); if (el) el.textContent = wiPopup._socUit + '%';
        _wiSet('input_number.walstroom_soc_uit', wiPopup._socUit);
      });
      _btn('wi-zon-min', () => {
        wiPopup._zon = Math.max(0, (wiPopup._zon || 300) - 50);
        const el = wiPopup.querySelector('#wi-zon-val'); if (el) el.textContent = wiPopup._zon + ' W';
        _wiSet('input_number.walstroom_zon_drempel', wiPopup._zon);
      });
      _btn('wi-zon-plus', () => {
        wiPopup._zon = Math.min(1000, (wiPopup._zon || 300) + 50);
        const el = wiPopup.querySelector('#wi-zon-val'); if (el) el.textContent = wiPopup._zon + ' W';
        _wiSet('input_number.walstroom_zon_drempel', wiPopup._zon);
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

    const wrap = this.shadowRoot.querySelector('.wrap');
    if (!wrap) return;
    wrap.appendChild(canvas);

    const resize = () => {
      canvas.width = wrap.offsetWidth || 1280;
      canvas.height = wrap.offsetHeight || 800;
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
      if (!this.shadowRoot.getElementById('rain-canvas')) return;
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
      manualSerials: {}
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
        .logo p { font-size:15px; letter-spacing:2px; color:rgba(255,255,255,0.3); text-align:center; margin-bottom:44px; }
        .act-box { width:100%; max-width:480px; }
        label { display:block; font-size:13px; letter-spacing:1.5px; color:rgba(255,255,255,0.4); margin-bottom:10px; }
        input { width:100%; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:10px; padding:20px; color:#fff; font-size:24px; font-family:monospace; letter-spacing:3px; outline:none; text-align:center; text-transform:uppercase; }
        input:focus { border-color:rgba(0,170,255,0.5); }
        input.error { border-color:rgba(255,60,60,0.6); }
        .btn { width:100%; margin-top:20px; padding:18px; background:#00aaff; color:#fff; border:none; border-radius:12px; font-size:18px; font-weight:700; cursor:pointer; }
        .btn:hover { background:#0099ee; }
        .msg { font-size:15px; margin-top:14px; padding:13px 18px; border-radius:10px; text-align:center; }
        .msg.err { background:rgba(255,60,60,0.1); color:#ff8888; border:1px solid rgba(255,60,60,0.2); }
        .msg.info { color:rgba(255,255,255,0.3); font-size:14px; margin-top:24px; text-align:center; }
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
        .logo p { font-size:14px; letter-spacing:2px; color:rgba(255,255,255,0.3); margin-top:5px; }

        .steps { display:flex; align-items:center; justify-content:center; gap:0; margin-bottom:36px; }
        .sd { width:38px; height:38px; border-radius:50%; border:2px solid rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700; color:rgba(255,255,255,0.3); background:#050e1f; transition:all 0.3s; }
        .sd.active { border-color:#00aaff; color:#00aaff; }
        .sd.done { border-color:#00cc66; background:#00cc66; color:#fff; }
        .sl { width:48px; height:3px; background:rgba(255,255,255,0.1); transition:background 0.3s; }
        .sl.done { background:#00cc66; }

        h2 { font-size:24px; font-weight:700; margin-bottom:8px; }
        .sub { font-size:15px; color:rgba(255,255,255,0.4); margin-bottom:28px; line-height:1.5; }

        label { display:block; font-size:13px; letter-spacing:1.5px; color:rgba(255,255,255,0.4); margin-bottom:7px; margin-top:20px; }
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
        .ti-checkmark { font-size:14px; color:#fff; display:none; }
        .ti.on .ti-checkmark { display:block; }
        .ti-lbl { font-size:16px; font-weight:600; color:rgba(255,255,255,0.6); transition:color 0.2s; }
        .ti.on .ti-lbl { color:#fff; }
        .ti-sub { font-size:13px; color:rgba(255,255,255,0.25); }
        .ti.on .ti-sub { color:rgba(0,200,255,0.6); }

        .det-item { display:flex; align-items:center; gap:14px; padding:14px 18px; border-radius:10px; margin-bottom:9px; font-size:16px; }
        .det-item.found { background:rgba(0,204,102,0.08); border:1px solid rgba(0,204,102,0.2); }
        .det-item.missing { background:rgba(255,80,80,0.06); border:1px solid rgba(255,80,80,0.15); }
        .det-item.manual { background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.25); }
        .di-name { flex:1; font-weight:600; }
        .di-id { font-size:13px; color:rgba(255,255,255,0.35); font-family:monospace; margin-top:3px; }
        .di-status { font-size:15px; font-weight:700; flex-shrink:0; }
        .found .di-status { color:#00cc66; }
        .missing .di-status { color:#ff4444; }
        .manual .di-status { color:#ffaa44; }

        .manual-inp { width:100%; background:rgba(255,255,255,0.06); border:1px solid rgba(255,165,0,0.3); border-radius:8px; padding:10px 14px; color:#fff; font-size:15px; font-family:monospace; outline:none; margin-top:8px; }
        .manual-inp:focus { border-color:rgba(255,165,0,0.6); }
        .manual-inp::placeholder { color:rgba(255,255,255,0.25); }

        .photo-drop { border:2px dashed rgba(255,255,255,0.15); border-radius:12px; padding:28px; text-align:center; cursor:pointer; transition:all 0.2s; margin-top:6px; overflow:hidden; position:relative; }
        .photo-drop:hover { border-color:rgba(0,170,255,0.4); background:rgba(0,170,255,0.04); }
        .photo-drop img { width:100%; height:240px; border-radius:8px; object-fit:cover; object-position:center; display:block; }
        .photo-drop p { font-size:15px; color:rgba(255,255,255,0.3); margin-top:12px; }
        .photo-overlay { position:absolute; bottom:10px; right:10px; background:rgba(0,0,0,0.6); border-radius:8px; padding:6px 11px; font-size:13px; color:rgba(255,255,255,0.6); }

        .btn-row { display:flex; gap:12px; margin-top:28px; }
        .btn { flex:1; padding:16px; border-radius:12px; font-size:17px; font-weight:700; cursor:pointer; border:none; transition:all 0.2s; }
        .btn-p { background:#00aaff; color:#fff; }
        .btn-p:hover { background:#0099ee; }
        .btn-s { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:rgba(255,255,255,0.6); }

        .msg { font-size:15px; margin-top:14px; padding:13px 18px; border-radius:10px; }
        .msg.err { background:rgba(255,60,60,0.1); color:#ff8888; border:1px solid rgba(255,60,60,0.2); }
        .msg.ok { background:rgba(0,204,102,0.1); color:#00cc66; border:1px solid rgba(0,204,102,0.2); }
        .msg.info { background:rgba(0,170,255,0.1); color:#66ccff; border:1px solid rgba(0,170,255,0.2); }

        .spinner { display:inline-block; width:18px; height:18px; border:2px solid rgba(255,255,255,0.2); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; vertical-align:middle; margin-right:8px; }
        @keyframes spin { to { transform:rotate(360deg); } }

        .finish-details { background:rgba(255,255,255,0.04); border-radius:12px; padding:20px; margin-top:18px; }
        .fr { display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:16px; gap:12px; }
        .fr:last-child { border-bottom:none; }
        .fk { color:rgba(255,255,255,0.4); flex-shrink:0; }
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
    const stepsEl = this.shadowRoot.getElementById('wiz-steps');
    let html = '';
    for (let i = 1; i <= 5; i++) {
      const cls = i < n ? 'sd done' : i === n ? 'sd active' : 'sd';
      const txt = i < n ? '&#10003;' : i;
      html += '<div class="' + cls + '">' + txt + '</div>';
      if (i < 5) html += '<div class="sl' + (i < n ? ' done' : '') + '"></div>';
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
  }

  _goStep(n) {
    this._step = n;
    this._updateSteps();
    this._renderStep();
    if (n === 3) this._detectEntities();
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
    c.innerHTML = '<h2>Serienummers detecteren</h2>' +
      '<p class="sub">Victron apparaten worden automatisch gevonden. Niet gevonden? Voer het serienummer handmatig in.</p>' +
      '<div id="det-list"><div class="msg info"><span class="spinner"></span>Entiteiten ophalen...</div></div>' +
      '<div id="btn3" style="display:none">' +
      '<div class="btn-row">' +
      '<button class="btn btn-s" data-action="step" data-n="2">‹ Terug</button>' +
      '<button class="btn btn-p" data-action="step" data-n="4">Volgende ›</button>' +
      '</div></div>';
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
        const needsManual = !r.found && ['shunt','mppt','quattro'].includes(r.key);
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
        });
      });
    }
    const btn3 = this.shadowRoot.getElementById('btn3');
    if (btn3) btn3.style.display = 'block';
  }

  _renderStep4(c) {
    const foto = this._state.fotoDataUrl;
    c.innerHTML = '<h2>Foto van het schip</h2>' +
      '<p class="sub">Upload een foto — dit wordt de achtergrond van het dashboard. Landschap formaat werkt het best.</p>' +
      '<div class="photo-drop" data-action="photo-click">' +
      (foto
        ? '<img src="' + foto + '" alt="boot"><div class="photo-overlay">&#128247; Klik om te wijzigen</div>'
        : '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" style="display:block;margin:0 auto"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><p>Tik om een foto te kiezen</p><p style="font-size:9px;margin-top:4px;color:rgba(255,255,255,0.2)">JPG, PNG, WEBP</p>') +
      '</div>' +
      '<input type="file" id="foto-input" accept="image/*" style="display:none">' +
      '<div class="btn-row">' +
      '<button class="btn btn-s" data-action="step" data-n="3">‹ Terug</button>' +
      '<button class="btn btn-p" data-action="step" data-n="5">Voltooien ›</button>' +
      '</div>';
  }

  _renderStep5(c) {
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
      '<div class="fr"><span class="fk">Walstroom</span><span class="fv ' + status(s.serials.shelly) + '">' + txt(s.serials.shelly) + '</span></div>' +
      '<div class="fr"><span class="fk">Foto</span><span class="fv ' + (s.fotoDataUrl ? 'ok' : 'warn') + '">' + (s.fotoDataUrl ? '&#10003; geüpload' : '— geen foto') + '</span></div>' +
      '</div>' +
      '<div class="msg ok" style="margin-top:12px" id="save-msg">Klaar om op te slaan.</div>' +
      '<div class="btn-row">' +
      '<button class="btn btn-s" data-action="step" data-n="4">‹ Terug</button>' +
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
    } else if (act === 'save') {
      this._saveConfig();
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
  }

  _saveConfig() {
    const config = {
      bootNaam: this._state.bootNaam,
      fotoDataUrl: this._state.fotoDataUrl,
      entities: this._state.entities,
      serials: this._state.serials,
      apparatuur: this._state.apparatuur,
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
