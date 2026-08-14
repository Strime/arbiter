#!/usr/bin/env python3
"""Génère public/icon/{16,32,48,96,128}.png — balance blanche sur fond bleu FR (#1e40af).

Usage : python3 scripts/generate-icons.py
Master 512 px anti-aliasé (supersampling x2 + LANCZOS), design volontairement
massif pour rester lisible à 16 px.
"""

from PIL import Image, ImageDraw
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "icon"
SIZES = [16, 32, 48, 96, 128]
BG = (30, 64, 175, 255)  # #1e40af — le bleu "FR" du badge
FG = (255, 255, 255, 255)

S = 1024  # canevas de travail (supersample)
img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# Fond : carré arrondi plein cadre
d.rounded_rectangle([32, 32, S - 32, S - 32], radius=200, fill=BG)

cx = S // 2
beam_y = 340
beam_w = 64

# Pivot
d.ellipse([cx - 56, 232, cx + 56, 344], fill=FG)
# Fléau (barre horizontale)
d.rounded_rectangle([200, beam_y - beam_w // 2, S - 200, beam_y + beam_w // 2], radius=beam_w // 2, fill=FG)
# Colonne
d.rounded_rectangle([cx - 32, beam_y, cx + 32, 800], radius=32, fill=FG)
# Socle
d.rounded_rectangle([320, 780, S - 320, 852], radius=36, fill=FG)

# Plateaux : demi-disques suspendus aux extrémités du fléau
for px in (256, S - 256):
    # suspente
    d.rounded_rectangle([px - 24, beam_y, px + 24, 480], radius=24, fill=FG)
    # plateau (demi-disque, corde vers le haut)
    d.pieslice([px - 140, 340, px + 140, 620], start=0, end=180, fill=FG)

OUT.mkdir(parents=True, exist_ok=True)
for size in SIZES:
    img.resize((size, size), Image.LANCZOS).save(OUT / f"{size}.png")
    print(f"  public/icon/{size}.png")
print("OK")
