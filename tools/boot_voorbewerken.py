#!/usr/bin/env python3
"""
Finally Card — Boot foto voorbewerking
========================================
Verwijdert een effen (zwarte of witte) achtergrond uit een bootfoto en
snijdt de afbeelding bij tot de boot zelf, klaar voor gebruik in de
Finally Card kiosk/mobiele dashboards.

Gebruik:
    python3 boot_voorbewerken.py invoer.png uitvoer.png

Vereisten:
    pip install Pillow numpy --break-system-packages

Tip: lever de bron-afbeelding aan als liggend (landscape) formaat,
     bijv. via een AI achtergrond-verwijderaar die een zwarte of
     witte achtergrond achterlaat. Dit script doet de rest.
"""

import sys
from PIL import Image
import numpy as np

def verwerk(invoer_pad, uitvoer_pad, marge=10, drempel=25):
    img = Image.open(invoer_pad).convert('RGBA')
    data = np.array(img)
    rgb = data[:, :, :3]

    # Detecteer of de achtergrond zwart of wit is door de hoekpixels te checken
    hoeken = [data[0,0,:3], data[0,-1,:3], data[-1,0,:3], data[-1,-1,:3]]
    gem_hoek = np.mean(hoeken, axis=0)
    is_donker = np.mean(gem_hoek) < 128

    if is_donker:
        # Zwarte achtergrond: pixels onder de drempel worden transparant
        mask = np.all(rgb < drempel, axis=2)
        not_bg = np.any(rgb > drempel, axis=2)
    else:
        # Witte achtergrond: pixels boven (255 - drempel) worden transparant
        mask = np.all(rgb > (255 - drempel), axis=2)
        not_bg = np.any(rgb < (255 - drempel), axis=2)

    data[mask, 3] = 0

    rows = np.any(not_bg, axis=1)
    cols = np.any(not_bg, axis=0)
    if not rows.any() or not cols.any():
        print("Waarschuwing: geen duidelijk onderwerp gevonden, controleer de bron-afbeelding.")
        rmin, rmax, cmin, cmax = 0, data.shape[0]-1, 0, data.shape[1]-1
    else:
        rmin, rmax = np.where(rows)[0][[0, -1]]
        cmin, cmax = np.where(cols)[0][[0, -1]]

    rmin = max(0, rmin - marge)
    rmax = min(data.shape[0] - 1, rmax + marge)
    cmin = max(0, cmin - marge)
    cmax = min(data.shape[1] - 1, cmax + marge)

    cropped = data[rmin:rmax+1, cmin:cmax+1]
    result = Image.fromarray(cropped, 'RGBA')
    result.save(uitvoer_pad)

    breedte, hoogte = result.size
    verhouding = breedte / hoogte
    print(f"Klaar: {uitvoer_pad}")
    print(f"Afmeting: {breedte}x{hoogte} (verhouding {verhouding:.2f}:1)")
    if verhouding < 1.2:
        print("Let op: de afbeelding is vrij hoog/smal. Voor het beste resultaat")
        print("in de Finally Card is een liggend formaat (verhouding > 1.3) ideaal.")

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Gebruik: python3 boot_voorbewerken.py invoer.png uitvoer.png")
        sys.exit(1)
    verwerk(sys.argv[1], sys.argv[2])
