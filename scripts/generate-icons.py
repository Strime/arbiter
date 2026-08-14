#!/usr/bin/env python3
"""Génère public/icon/{16,32,48,96,128}.png — la cocarde tricolore, plein cadre.

Usage : python3 scripts/generate-icons.py
Master 1024 px anti-aliasé (downscale LANCZOS). Cercles concentriques aux
couleurs du drapeau du badge (bleu #0055A4 au centre, blanc, rouge #EF4135 à
l'extérieur — l'ordre de la cocarde française). Plein cadre, sans tuile : le
bord extérieur est rouge, donc lisible sur fond clair comme sombre.
"""

from PIL import Image, ImageDraw
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "icon"
SIZES = [16, 32, 48, 96, 128]

BLUE = (0, 85, 164, 255)    # #0055A4 — bleu du drapeau FR du badge
WHITE = (255, 255, 255, 255)
RED = (239, 65, 53, 255)    # #EF4135 — rouge du drapeau FR du badge

S = 1024  # canevas de travail (supersample)
C = S // 2
# Rayons calibrés pour rester lisibles à 16 px (≈ 0.97 / 0.62 / 0.31 du rayon).
R_RED = 496
R_WHITE = 318
R_BLUE = 159

img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
for radius, color in ((R_RED, RED), (R_WHITE, WHITE), (R_BLUE, BLUE)):
    d.ellipse([C - radius, C - radius, C + radius, C + radius], fill=color)

OUT.mkdir(parents=True, exist_ok=True)
for size in SIZES:
    img.resize((size, size), Image.LANCZOS).save(OUT / f"{size}.png")
    print(f"  public/icon/{size}.png")
print("OK")
