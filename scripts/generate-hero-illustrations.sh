#!/usr/bin/env bash
# generate-hero-illustrations.sh
#
# Generates three editorial-paddock illustrations for the APEX landing page
# via the Gemini API (gemini-3-pro-image-preview, aka Nano Banana Pro).
#
# Renders at 4K (4096x4096px equivalent, 2000 output tokens) using the
# editorial-paddock palette + Fraunces / IBM Plex pairing locked in CLAUDE.md.
#
# Requires:
#   - GOOGLE_API_KEY env var (Tier 1 Gemini API key with billing enabled;
#     gemini-3-pro-image-preview has no free tier as of 2026-05-28)
#   - curl, jq, base64, python3 (python3 used only as a base64-decode fallback
#     when `base64 -d` rejects long single-line input on macOS)
#
# Cost:
#   3 images x $0.24 per 4K image = $0.72 total (Standard tier).
#   Add ~$0.003 input-token cost for prompts. Round to <$1 total.
#
# Outputs:
#   app/frontend/public/hero-illustration-4k.png
#   app/frontend/public/sarah-reynolds-portrait-4k.png
#   app/frontend/public/coa-gate-illustration-4k.png
#
# Usage:
#   export GOOGLE_API_KEY="..."
#   ./scripts/generate-hero-illustrations.sh
#
# Optional:
#   ASPECT_HERO        default "16:9"  (landscape cinematic hero)
#   ASPECT_PORTRAIT    default "3:4"   (vertical portrait)
#   ASPECT_INFOGRAPHIC default "16:9"  (landscape infographic)
#   IMAGE_SIZE         default "4K"    (1K / 2K / 4K; uppercase K required)
#   DRY_RUN            set to 1 to print the request body and exit without calling the API

set -euo pipefail

# --------------------------------------------------------------------------
# Config
# --------------------------------------------------------------------------

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${REPO_ROOT}/app/frontend/public"
MODEL="gemini-3-pro-image-preview"
ENDPOINT="https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent"

ASPECT_HERO="${ASPECT_HERO:-16:9}"
ASPECT_PORTRAIT="${ASPECT_PORTRAIT:-3:4}"
ASPECT_INFOGRAPHIC="${ASPECT_INFOGRAPHIC:-16:9}"
IMAGE_SIZE="${IMAGE_SIZE:-4K}"
DRY_RUN="${DRY_RUN:-0}"

# Editorial-paddock palette (locked in CLAUDE.md):
#   cream         #F4EBD8  background
#   racing green  #0A2818  primary ink
#   clay red      #C1492C  signal accent
#   amber         #D9A441  highlight glow
#   near-black    #0F1410  type
# Type pairing: Fraunces (display, variable italic SOFT+WONK+opsz) +
#   IBM Plex Sans (body) + IBM Plex Mono (numerics).

PALETTE_BLURB="warm cream paper background hex F4EBD8, deep racing green hex 0A2818, signal clay red hex C1492C, amber highlight hex D9A441, near-black ink hex 0F1410"
TYPE_BLURB="Fraunces variable italic display typography for headlines, IBM Plex Sans for body lines, IBM Plex Mono for numeric callouts"
STYLE_BLURB="editorial paddock magazine illustration, painterly, warm golden hour light, soft grain, hand-drawn linework with controlled wash, NOT photographic, NOT 3D render, NOT photoreal, NOT a photograph"

mkdir -p "${OUT_DIR}"

# --------------------------------------------------------------------------
# Prompts (verbatim per CLAUDE.md identity + Lane K persona-decouple rule)
# --------------------------------------------------------------------------

PROMPT_HERO="A cinematic editorial-paddock illustration of a single-seater race cockpit photographed from inside, at golden hour. Hand-controls visible on the steering wheel: a brake paddle and a throttle ring instead of foot pedals. Through the windscreen, a clay-red apex curb sweeps off to the right; amber dashboard telemetry glow reflects on the inside of the visor. ${STYLE_BLURB}. Palette: ${PALETTE_BLURB}. Composition: rule-of-thirds, deep depth of field, dust motes catching low side-light, no driver face visible. Reserve clean negative space in the upper-left for a Fraunces italic headline overlay (do NOT render any text in the image; leave the negative space empty). Magazine-grade, atmospheric, not glossy, not chrome-y."

PROMPT_SARAH="An ILLUSTRATED (not photographic) profile portrait of a fictional adaptive driver persona named Sarah Reynolds, painterly editorial style, three-quarter side view from the right, seated in the cockpit of a Britcar Trophy BMW M240i race car. Electronic hand-controls clearly visible on the steering wheel: a paddle-style brake actuator and a throttle ring. Sarah wears a plain unbranded race suit and an open-faced helmet pushed back, calm focused expression, mid-thirties, no real-person likeness. ${STYLE_BLURB}. Palette: ${PALETTE_BLURB}. Lighting: warm pit-lane backlight from the right, racing-green shadow side, amber rim light on helmet edge. Composition: portrait orientation, subject occupies left two-thirds, cockpit interior in soft focus behind. Clearly stylized illustration so the persona reads as fictional. Do NOT render any text or logos in the image."

PROMPT_COA="An editorial infographic illustration of two telemetry traces crossing at the apex of a corner. Top trace is brake pressure in deep racing green, descending. Bottom trace is throttle in clay red, ascending. They cross at the apex point, with a soft amber halo radiating from the crossing point. Cream paper background with subtle paper-grain texture. Hand-drawn ruler-and-pen aesthetic, light grid lines, small tick marks on each axis. Composition: landscape, traces occupy the lower two-thirds. Reserve negative space in the upper-left for a Fraunces italic headline overlay and a small IBM Plex Mono numeric callout block in the lower-right (do NOT render any text in the image; leave both negative-space regions empty for typographic overlay in post). ${STYLE_BLURB}. Palette: ${PALETTE_BLURB}. ${TYPE_BLURB}. NOT a chart screenshot, NOT a software UI, NOT a 3D render. Painterly editorial infographic only."

# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------

require_env() {
  if [[ -z "${GOOGLE_API_KEY:-}" ]]; then
    echo "FATAL: GOOGLE_API_KEY not set." >&2
    echo "Run: export GOOGLE_API_KEY=\"your_key_here\"" >&2
    echo "See docs/nano-banana-runbook.md for key-creation steps." >&2
    exit 1
  fi
}

require_bin() {
  local bin="$1"
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "FATAL: required binary not found on PATH: $bin" >&2
    exit 1
  fi
}

# Build request body for a single prompt.
# Args: $1 prompt text, $2 aspect ratio, $3 image size
build_body() {
  local prompt="$1"
  local aspect="$2"
  local size="$3"
  jq -n \
    --arg prompt "$prompt" \
    --arg aspect "$aspect" \
    --arg size "$size" \
    '{
      contents: [
        {
          role: "user",
          parts: [ { text: $prompt } ]
        }
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio: $aspect,
          imageSize: $size
        }
      }
    }'
}

# Decode base64 reliably on macOS, where `base64 -d` chokes on long
# single-line inputs without a wrap flag. Falls back to python3 -m base64.
decode_b64_to_file() {
  local b64="$1"
  local out="$2"
  if printf '%s' "$b64" | base64 -d > "$out" 2>/dev/null; then
    return 0
  fi
  if command -v python3 >/dev/null 2>&1; then
    printf '%s' "$b64" | python3 -c "import sys, base64; sys.stdout.buffer.write(base64.b64decode(sys.stdin.read()))" > "$out"
    return 0
  fi
  echo "FATAL: could not decode base64 (neither base64 -d nor python3 worked)." >&2
  return 1
}

# Generate one illustration.
# Args: $1 label, $2 prompt, $3 aspect, $4 out_filename
generate_one() {
  local label="$1"
  local prompt="$2"
  local aspect="$3"
  local filename="$4"
  local out_path="${OUT_DIR}/${filename}"

  echo
  echo "=========================================================="
  echo "[${label}] generating ${filename}"
  echo "  aspect=${aspect}  size=${IMAGE_SIZE}  model=${MODEL}"
  echo "=========================================================="

  local body
  body="$(build_body "$prompt" "$aspect" "$IMAGE_SIZE")"

  if [[ "$DRY_RUN" == "1" ]]; then
    echo "[DRY_RUN=1] request body:"
    echo "$body"
    return 0
  fi

  local raw_resp
  local http_status
  raw_resp="$(mktemp)"
  http_status="$(curl -sS -o "$raw_resp" -w '%{http_code}' \
    -X POST "$ENDPOINT" \
    -H "x-goog-api-key: ${GOOGLE_API_KEY}" \
    -H "Content-Type: application/json" \
    --data-binary "$body")"

  echo "  HTTP ${http_status}"

  if [[ "$http_status" != "200" ]]; then
    echo "FAIL: non-200 response from Gemini API. Body follows:" >&2
    cat "$raw_resp" >&2
    rm -f "$raw_resp"
    return 1
  fi

  # Extract the first inlineData.data block from candidates[0].content.parts
  local b64
  b64="$(jq -r '.candidates[0].content.parts[] | select(.inlineData != null) | .inlineData.data' "$raw_resp" | head -n 1)"
  if [[ -z "$b64" || "$b64" == "null" ]]; then
    echo "FAIL: no inlineData found in response. Full response:" >&2
    cat "$raw_resp" >&2
    rm -f "$raw_resp"
    return 1
  fi

  local mime
  mime="$(jq -r '.candidates[0].content.parts[] | select(.inlineData != null) | .inlineData.mimeType' "$raw_resp" | head -n 1)"

  decode_b64_to_file "$b64" "$out_path"
  rm -f "$raw_resp"

  local bytes
  bytes="$(wc -c < "$out_path" | tr -d ' ')"
  local kb=$(( bytes / 1024 ))
  echo "  SAVED: ${out_path}"
  echo "  mimeType: ${mime}"
  echo "  size: ${bytes} bytes (~${kb} KB)"
}

# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------

require_bin curl
require_bin jq
require_env

echo "APEX hero-illustration generator"
echo "  model:    ${MODEL}"
echo "  size:     ${IMAGE_SIZE}"
echo "  out_dir:  ${OUT_DIR}"
echo "  est cost: 3 x \$0.24 = \$0.72 USD (Gemini API Standard tier, 4K)"

generate_one "1/3 hero"      "$PROMPT_HERO"  "$ASPECT_HERO"        "hero-illustration-4k.png"
generate_one "2/3 portrait"  "$PROMPT_SARAH" "$ASPECT_PORTRAIT"    "sarah-reynolds-portrait-4k.png"
generate_one "3/3 coa-gate"  "$PROMPT_COA"   "$ASPECT_INFOGRAPHIC" "coa-gate-illustration-4k.png"

echo
echo "=========================================================="
echo "DONE. Three 4K illustrations saved under:"
echo "  ${OUT_DIR}/"
echo "Next: ping Claude with 'illustrations landed, wire them up'."
echo "=========================================================="
