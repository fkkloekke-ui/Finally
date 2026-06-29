# Finally Card

Custom Home Assistant dashboard voor boten met Victron Energy-systemen.
Inclusief installatie-wizard, kiosk- en mobiele weergave.

## Installatie via HACS

1. HACS → drie puntjes rechtsboven → **Custom repositories**
2. URL toevoegen: `https://github.com/fkkloekke-ui/Finally`
3. Categorie: **Dashboard** (Lovelace)
4. Zoek "Finally Card" in HACS en installeer
5. Herstart Home Assistant

Na installatie staan de bestanden in `/config/www/community/Finally/`:
- `finally-wizard-customer.js`
- `finally-skycard-customer.js`
- `finally-skycard-mobile-customer.js`

## Resources toevoegen

Ga naar **Instellingen → Dashboards → ⋮ (rechtsboven) → Resources** en voeg toe:

```yaml
- url: /hacsfiles/Finally/finally-wizard-customer.js
  type: module
- url: /hacsfiles/Finally/finally-skycard-customer.js
  type: module
- url: /hacsfiles/Finally/finally-skycard-mobile-customer.js
  type: module
```

(Zie `helpers/resources-voorbeeld.yaml` voor de oude handmatige variant met `/local/`.)

## Dashboard aanmaken

Zie `helpers/dashboard-voorbeeld.yaml` voor een voorbeeld-dashboard met de
wizard, kiosk-view en mobiele view.

## Helpers & automations

In `helpers/` staan de YAML-bestanden voor walstroom-besturing:
- `finally_walstroom_helpers.yaml` — input_number/input_boolean/input_datetime
- `finally_walstroom_automations.yaml` — de automations zelf (entity_id's aanpassen per installatie!)

## Tools (los, niet via HACS)

In `tools/` staan hulpprogramma's die je lokaal op je eigen computer draait,
niet op de klant-installatie:
- `finally-codegenerator.html` — licentiecodes genereren voor klanten
- `boot_voorbewerken.py`, `Finally_Card_Image_Tool*.py` — bootfoto's verwerken tot kiosk/mobiel formaat

## Licentie

Elke installatie vereist een geldige licentiecode (`FC-[jaar]-[naam]-[checksum]`),
te genereren via `tools/finally-codegenerator.html`.
