#!/usr/bin/env python3
"""Génère les assets de la landing — favicon, icon-128, apple-touch-icon.

Usage : python3 scripts/generate-landing-assets.py
Produit dans landing/assets/ :
  - favicon-32.png, icon-128.png : cocarde à crête sur fond transparent ;
  - apple-touch-icon.png : 180 px sur fond blanc (iOS arrondit lui-même).

L'og-image n'est PAS générée ici : le rendu de texte PIL est flou — elle est
capturée par Chrome headless via scripts/generate-og-image.sh (source :
scripts/assets/og-image.html).

La géométrie de la cocarde à crête est calquée sur generate-icons.py — garder
les deux scripts synchronisés si elle évolue.
"""

from PIL import Image, ImageDraw
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "landing" / "assets"

BLUE = (0, 85, 164, 255)     # #0055A4 — bleu du drapeau FR du badge
WHITE = (255, 255, 255, 255)
RED = (239, 65, 53, 255)     # #EF4135 — rouge du drapeau FR du badge
def draw_coquade_master(s: int = 1024) -> Image.Image:
    """Cocarde à crête, géométrie ×(s/1024) de generate-icons.py."""
    k = s / 1024
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    comb = [(320, 240, 104), (512, 152, 128), (704, 240, 104)]
    for cx, cy, r in comb:
        d.ellipse([(cx - r) * k, (cy - r) * k, (cx + r) * k, (cy + r) * k], fill=RED)
    for radius, color in ((400, RED), (248, WHITE), (124, BLUE)):
        d.ellipse(
            [(512 - radius) * k, (608 - radius) * k, (512 + radius) * k, (608 + radius) * k],
            fill=color,
        )
    return img


def save_favicons(master: Image.Image) -> None:
    for name, size in (("favicon-32.png", 32), ("icon-128.png", 128)):
        master.resize((size, size), Image.LANCZOS).save(OUT / name)
        print(f"  landing/assets/{name}")


def save_apple_touch(master: Image.Image) -> None:
    size, inner = 180, 156
    img = Image.new("RGBA", (size, size), WHITE)
    icon = master.resize((inner, inner), Image.LANCZOS)
    img.paste(icon, ((size - inner) // 2, (size - inner) // 2), icon)
    img.save(OUT / "apple-touch-icon.png")
    print("  landing/assets/apple-touch-icon.png")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    master = draw_coquade_master(2048)
    save_favicons(master)
    save_apple_touch(master)
    print("OK (og-image : bash scripts/generate-og-image.sh)")
