#!/usr/bin/env bash
# Génère les images de fiche store (1280×800) depuis scripts/assets/store/*.html.
#
# Chaque frame est rendue par Chrome headless (texte net, SVG vectoriels)
# capturée en ×2 puis réduite en LANCZOS — même pipeline que l'og-image.
# Les frames 2 et 3 embarquent les captures réelles docs/store-assets/
# screenshot-{carrefour,auchan}.png (chemins relatifs dans les HTML).
#
# Sortie : docs/store-assets/store-0N-<nom>.png
# Usage : bash scripts/generate-store-screenshots.sh
set -euo pipefail
cd "$(dirname "$0")/.."

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ -x "$CHROME" ] || { echo "Chrome introuvable : $CHROME" >&2; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

FRAMES="1-hero 2-carrefour 3-auchan 4-detail"

for frame in $FRAMES; do
  "$CHROME" --headless=new --disable-gpu \
    --force-device-scale-factor=2 --window-size=1280,800 --hide-scrollbars \
    --screenshot="$TMP/$frame.png" \
    "file://$PWD/scripts/assets/store/frame-$frame.html" 2>/dev/null

  python3 - "$TMP/$frame.png" "$frame" <<'EOF'
import sys
from PIL import Image
shot = Image.open(sys.argv[1])
assert shot.size == (2560, 1600), f"capture inattendue : {shot.size}"
num, name = sys.argv[2].split("-", 1)
out = f"docs/store-assets/store-0{num}-{name}.png"
shot.resize((1280, 800), Image.LANCZOS).convert("RGB").save(out)
print(f"  {out} (1280x800)")
EOF
done
echo "OK"
