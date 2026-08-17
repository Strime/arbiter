#!/usr/bin/env bash
# Génère landing/assets/og-image.png depuis scripts/assets/og-image.html.
#
# Rendu par Chrome headless (texte net, roundel SVG vectoriel) capturé en ×2
# puis réduit en LANCZOS vers 1200×630 — PIL seul rend le texte flou et les
# formes crénelées (aucun anti-aliasing dans ImageDraw).
#
# Usage : bash scripts/generate-og-image.sh
set -euo pipefail
cd "$(dirname "$0")/.."

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ -x "$CHROME" ] || { echo "Chrome introuvable : $CHROME" >&2; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

"$CHROME" --headless=new --disable-gpu \
  --force-device-scale-factor=2 --window-size=1200,630 --hide-scrollbars \
  --screenshot="$TMP/og-2x.png" \
  "file://$PWD/scripts/assets/og-image.html" 2>/dev/null

python3 - "$TMP/og-2x.png" <<'EOF'
import sys
from PIL import Image
shot = Image.open(sys.argv[1])
assert shot.size == (2400, 1260), f"capture inattendue : {shot.size}"
shot.resize((1200, 630), Image.LANCZOS).convert("RGB").save("landing/assets/og-image.png")
print("  landing/assets/og-image.png (1200x630)")
EOF
echo "OK"
