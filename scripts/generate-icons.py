#!/usr/bin/env python3
"""Génère public/icon/{16,32,48,96,128}.png — la cocarde à crête, plein cadre.

Usage : python3 scripts/generate-icons.py
Master 1024 px anti-aliasé (downscale LANCZOS). La cocarde tricolore (bleu
#0055A4 au centre, blanc, rouge #EF4135 à l'extérieur — l'ordre de la cocarde
française) gagne une crête de coq : trois lobes rouges fondus dans l'anneau
extérieur. C'est le nom Coquade dessiné — la cocarde qui devient coq. Le bord
extérieur rouge reste lisible sur fond clair comme sombre.

Géométrie calquée sur la maquette validée (viewBox 128, ici ×8) :
lobes (40,30) r13 / (64,19) r16 / (88,30) r13 ; cocarde centre (64,76),
rayons 50 / 31 / 15.5.
"""

from PIL import Image, ImageDraw
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "icon"
SIZES = [16, 32, 48, 96, 128]

BLUE = (0, 85, 164, 255)    # #0055A4 — bleu du drapeau FR du badge
WHITE = (255, 255, 255, 255)
RED = (239, 65, 53, 255)    # #EF4135 — rouge du drapeau FR du badge

S = 2048  # canevas de travail (supersample ×16 de la maquette 128)
K = S / 1024  # géométrie exprimée à l'échelle 1024, comme la maquette ×8
CX = 512
CY = 608  # cocarde décalée vers le bas pour laisser la place à la crête
R_RED = 400
R_WHITE = 248
R_BLUE = 124
# Crête : (cx, cy, r) des trois lobes, fondus dans l'anneau rouge.
COMB = [(320, 240, 104), (512, 152, 128), (704, 240, 104)]

img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
for cx, cy, r in COMB:
    d.ellipse([(cx - r) * K, (cy - r) * K, (cx + r) * K, (cy + r) * K], fill=RED)
for radius, color in ((R_RED, RED), (R_WHITE, WHITE), (R_BLUE, BLUE)):
    d.ellipse(
        [(CX - radius) * K, (CY - radius) * K, (CX + radius) * K, (CY + radius) * K],
        fill=color,
    )

OUT.mkdir(parents=True, exist_ok=True)
for size in SIZES:
    img.resize((size, size), Image.LANCZOS).save(OUT / f"{size}.png")
    print(f"  public/icon/{size}.png")
print("OK")
