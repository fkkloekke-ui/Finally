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
