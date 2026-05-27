#!/usr/bin/env bash
set -euo pipefail

# APEX demo video stitch script.
# Adapted from github.com/StephenSook/context-mod-devvit/scripts/demo/stitch.sh
# for the 3-minute 2-person Stephen+Vinh script v3.
#
# Concatenates per-beat raw OBS clips, muxes VO, bakes captions, outputs final mp4.
#
# Usage:
#   bash scripts/build-demo-video-stitch.sh
#
# Reads from:    raw-obs/{beat}.mkv  +  raw-vo/vo-{beat}.wav
# Writes to:     beats/concat-raw.mp4  +  beats/final.mp4
# Captions src:  deliverables/audio-raw/demo-video-captions.srt
#
# Beats 1 + 8 produce TWO VO files each (vo-cold-open-stephen.wav + vo-cold-open-vinh.wav
# + vo-close-vinh.wav + vo-close-stephen.wav). The script concatenates the
# two VO files per beat before muxing with the OBS clip.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

mkdir -p beats raw-obs raw-vo

# Beat ordered list. Single-narrator beats use one VO file; cold-open + close
# use two VO files (Stephen + Vinh in order).
declare -a BEATS=(cold-open problem sarah architecture coa demo stack team close)
declare -A BEAT_DURATIONS=(
  [cold-open]=8  [problem]=17 [sarah]=17 [architecture]=48
  [coa]=30       [demo]=30    [stack]=8  [team]=12       [close]=8
)
# Beats with two VO files (Stephen + Vinh).
declare -a TWO_VOICE_BEATS=(cold-open close)

CAPTION_SRT="deliverables/audio-raw/demo-video-captions.srt"

echo "[stitch] beats: ${BEATS[*]}"
echo "[stitch] caption src: $CAPTION_SRT"

# Pre-step: for two-voice beats, concatenate the two VO files into a single vo-<beat>.wav
for beat in "${TWO_VOICE_BEATS[@]}"; do
  stephen_vo="raw-vo/vo-${beat}-stephen.wav"
  vinh_vo="raw-vo/vo-${beat}-vinh.wav"
  combined="raw-vo/vo-${beat}.wav"
  if [[ -f "$stephen_vo" && -f "$vinh_vo" ]]; then
    # Cold-open order: Stephen first, Vinh second. Close order: Vinh first, Stephen second.
    if [[ "$beat" == "cold-open" ]]; then
      /opt/homebrew/bin/ffmpeg -y -i "$stephen_vo" -i "$vinh_vo" \
        -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1[a]" -map "[a]" "$combined" 2>&1 | tail -1
    else
      /opt/homebrew/bin/ffmpeg -y -i "$vinh_vo" -i "$stephen_vo" \
        -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1[a]" -map "[a]" "$combined" 2>&1 | tail -1
    fi
    echo "[stitch] concatenated $beat dual-voice VO"
  fi
done

# 1. Per-beat: mux OBS video + VO audio, trim to exact beat length, force 1920x1080 30fps.
for beat in "${BEATS[@]}"; do
  obs="raw-obs/${beat}.mkv"
  vo="raw-vo/vo-${beat}.wav"
  out="beats/${beat}.mp4"
  dur="${BEAT_DURATIONS[$beat]}"

  if [[ ! -f "$obs" ]]; then
    echo "[stitch] WARN: $obs missing -- skipping beat $beat (will fail at concat)"
    continue
  fi
  if [[ ! -f "$vo" ]]; then
    echo "[stitch] WARN: $vo missing -- using silence track for beat $beat"
    /opt/homebrew/bin/ffmpeg -y -i "$obs" -f lavfi -i "anullsrc=channel_layout=mono:sample_rate=48000" \
      -t "$dur" -vf "scale=1920:1080,fps=30" -c:v libx264 -preset slow -crf 18 \
      -c:a aac -b:a 192k -shortest "$out" 2>&1 | tail -1
  else
    /opt/homebrew/bin/ffmpeg -y -i "$obs" -i "$vo" \
      -t "$dur" -vf "scale=1920:1080,fps=30" -c:v libx264 -preset slow -crf 18 \
      -c:a aac -b:a 192k -map 0:v:0 -map 1:a:0 -shortest "$out" 2>&1 | tail -1
  fi
  echo "[stitch] built $out ($dur s)"
done

# 2. Concat per-beat clips into single raw mp4.
: > beats/list.txt
for beat in "${BEATS[@]}"; do
  if [[ -f "beats/${beat}.mp4" ]]; then
    echo "file '${beat}.mp4'" >> beats/list.txt
  fi
done

/opt/homebrew/bin/ffmpeg -y -f concat -safe 0 -i beats/list.txt -c copy beats/concat-raw.mp4 2>&1 | tail -1
echo "[stitch] concatenated raw -> beats/concat-raw.mp4"

# 3. Bake captions via libass. IBM Plex Mono if installed (system-wide via fc-cache).
# Editorial-paddock palette: ink #0F1410 = &H100F14 in libass BGR; cream
# background not used (transparent burned-in for legibility on dynamic frames).
if [[ -f "$CAPTION_SRT" ]]; then
  PLEX_INSTALLED=$(fc-list 2>/dev/null | grep -i "plex mono" | head -1 || true)
  if [[ -n "$PLEX_INSTALLED" ]]; then
    FONT_STYLE="FontName=IBM Plex Mono,FontSize=22,PrimaryColour=&Hf5ebf4,Outline=1.5,Shadow=0.5,MarginV=40"
    echo "[stitch] baking captions with IBM Plex Mono"
  else
    FONT_STYLE="FontSize=22,PrimaryColour=&Hf5ebf4,Outline=1.5,Shadow=0.5,MarginV=40"
    echo "[stitch] IBM Plex Mono not installed; using libass default font"
  fi
  /opt/homebrew/bin/ffmpeg -y -i beats/concat-raw.mp4 \
    -vf "subtitles=$CAPTION_SRT:force_style='$FONT_STYLE'" \
    -c:v libx264 -preset slow -crf 18 -c:a copy beats/final.mp4 2>&1 | tail -1
  echo "[stitch] baked captions -> beats/final.mp4"
else
  echo "[stitch] WARN: caption SRT missing at $CAPTION_SRT; copying raw without caption bake"
  cp beats/concat-raw.mp4 beats/final.mp4
fi

echo ""
echo "[stitch] DONE."
echo "[stitch] Per-beat: beats/<beat>.mp4"
echo "[stitch] Concatenated raw: beats/concat-raw.mp4"
echo "[stitch] Final with captions: beats/final.mp4"
echo ""
echo "[stitch] Upload beats/final.mp4 to YouTube unlisted. Paste URL into BeMyApp form."
