#!/usr/bin/env bash
# APEX pre-submit checklist runner (PLAN.md §8).
# Runs every check Day 11 (final gate) AND on demand during Day 2-10 (regression catcher).
# Usage:
#   bash scripts/pre-submit-checks.sh                  # default (Day 2-10 regression mode)
#   bash scripts/pre-submit-checks.sh --soft           # treat Vinh-pending gates as WARN not FAIL
#   bash scripts/pre-submit-checks.sh --final          # Day 11 strict mode: video/coverage/HF must be GREEN
#   bash scripts/pre-submit-checks.sh --only=1,2,5     # run a subset

set -u

GREEN="\033[32m"; RED="\033[31m"; YELLOW="\033[33m"; BLUE="\033[34m"; BOLD="\033[1m"; RESET="\033[0m"

HARD_FAIL=0
SOFT_FAIL=0
MANUAL_PENDING=0
SOFT_MODE=0
FINAL_MODE=0
ONLY_FILTER=""

for arg in "$@"; do
  case "$arg" in
    --soft) SOFT_MODE=1 ;;
    --final) FINAL_MODE=1 ;;
    --only=*) ONLY_FILTER="${arg#--only=}" ;;
  esac
done

run_check() {
  local n="$1"
  if [[ -n "$ONLY_FILTER" ]]; then
    if ! [[ ",$ONLY_FILTER," == *",$n,"* ]]; then
      return 1
    fi
  fi
  return 0
}

pass()    { printf "${GREEN}[%2d] PASS${RESET} %s\n" "$1" "$2"; }
fail()    { printf "${RED}[%2d] FAIL${RESET} %s\n" "$1" "$2"; HARD_FAIL=$((HARD_FAIL+1)); }
warn()    { printf "${YELLOW}[%2d] WARN${RESET} %s\n" "$1" "$2"; SOFT_FAIL=$((SOFT_FAIL+1)); }
manual()  { printf "${BLUE}[%2d] MANUAL${RESET} %s\n" "$1" "$2"; MANUAL_PENDING=$((MANUAL_PENDING+1)); }
soft_or_fail() { if (( SOFT_MODE )); then warn "$1" "$2"; else fail "$1" "$2"; fi; }
final_or_warn() { if (( FINAL_MODE )); then fail "$1" "$2"; else warn "$1" "$2"; fi; }

PROSE_PATHS=(
  README.md PLAN.md CLAUDE.md SUBMISSION.md STATUS_DAY1.md STATUS_TEMPLATE.md
  docs/ app/frontend/app/ app/frontend/components/
  paper/ deliverables/ bob-sessions/
)

echo -e "${BOLD}APEX pre-submit checklist${RESET} ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
echo "Repo: $(git rev-parse --show-toplevel 2>/dev/null || echo .)"
echo "HEAD: $(git rev-parse --short HEAD 2>/dev/null || echo n/a)"
echo "Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo n/a)"
echo ""

# Check 1 — em-dash sweep (excludes meta-policy refs in CLAUDE.md + pre-mortem.md self-references)
if run_check 1; then
  hits=$(grep -rn "—" \
      --include="*.md" --include="*.ts" --include="*.tsx" --include="*.mdx" --include="*.txt" \
      --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=research --exclude-dir=dist \
      "${PROSE_PATHS[@]}" 2>/dev/null \
    | grep -v "CLAUDE.md.*No em-dash" \
    | grep -v "pre-mortem.md.*Em-dash in prose" \
    | grep -v "decision-log.md.*em-dash" \
    || true)
  if [[ -z "$hits" ]]; then pass 1 "em-dash sweep clean across prose paths"
  else fail 1 "em-dash found in prose:"; echo "$hits" | sed 's/^/    /'; fi
fi

# Check 2 — AI-tone blocklist. Word-boundary + case-insensitive. Synced with CLAUDE.md global list.
# Restricted to prose files (*.md/*.mdx/*.txt). Code files (*.ts/*.tsx) excluded because Tailwind
# utility class names like "transition-transform" or "transform" are not marketing prose.
# Allowlist: rule-definition contexts, Python lib names ("transformers" is HF), technical compounds.
if run_check 2; then
  blocklist='\bdelve into\b|\bleverage\b|\bseamless\w*|\brobust\w*|\bcomprehensive\w*|\bunlock\w*|\bcutting-edge\b|\brevolutionary\w*|\bstreamline\w*|\becosystem\w*|\beasily\b|\bsimply\b|\belevate\w*|\bempower\w*|\bintuitive\w*|\btransform[a-z]*\b|\bsophisticated\w*|\bpowerful\w*|\bamazing\w*|\beffortless\w*'
  hits=$(grep -riEn "$blocklist" \
      --include="*.md" --include="*.mdx" --include="*.txt" \
      --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=research --exclude-dir=dist \
      "${PROSE_PATHS[@]}" 2>/dev/null \
    | grep -v "pnpm-lock" \
    | grep -vE "(blocklist|No AI-tone|AI-blocklist|three-brain|leverage layers|lower-leverage|leverage tools|transformers|granite-tsfm|tsfm)" \
    | grep -vE "transformer\b" \
    || true)
  if [[ -z "$hits" ]]; then pass 2 "AI-tone blocklist sweep clean (case-insensitive, word-boundary, prose-only)"
  else fail 2 "AI-tone blocklist hits in prose:"; echo "$hits" | head -20 | sed 's/^/    /'; fi
fi

# Check 3 — en-dash + smart-quote sweep
if run_check 3; then
  smart=$(grep -rEn $'[–‘’“”]' \
      --include="*.md" --include="*.ts" --include="*.tsx" --include="*.mdx" --include="*.txt" \
      --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=research --exclude-dir=dist \
      "${PROSE_PATHS[@]}" 2>/dev/null \
    || true)
  if [[ -z "$smart" ]]; then pass 3 "en-dash + smart-quote sweep clean"
  else fail 3 "non-ASCII typographic chars found:"; echo "$smart" | sed 's/^/    /'; fi
fi

# Check 4 — operator-attribution sweep (named operators + personal contact info in public files)
if run_check 4; then
  named=$(grep -rEn "Jason Arthur|Al Locke|Johnny Dawson-Ellis|Brian Roberts|Aaron Morgan|Bobby Trundley|MME Motorsport|mme-motorsport|MME_Motorsport|stephensookra@gmail|ssookra@students" \
      --include="*.md" --include="*.ts" --include="*.tsx" --include="*.mdx" \
      --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=research --exclude-dir=dist \
      README.md PLAN.md SUBMISSION.md STATUS_DAY1.md docs/ app/frontend/app/ app/frontend/components/ 2>/dev/null \
    | grep -v "private memory" \
    | grep -v "kept private" \
    || true)
  if [[ -z "$named" ]]; then pass 4 "no named operators or personal contact info in public files (pre-consent rule honored)"
  else fail 4 "named operators or personal contact info in public files (operator-unassociation violation):"; echo "$named" | sed 's/^/    /'; fi
fi

# Check 5 — em-dash in commit subjects
if run_check 5; then
  subjects=$(git log --pretty=%s 2>/dev/null | grep "—" || true)
  if [[ -z "$subjects" ]]; then pass 5 "no em-dash in commit subjects"
  else fail 5 "em-dash in commit subjects:"; echo "$subjects" | sed 's/^/    /'; fi
fi

# Check 6 — CI green on main (GitHub Actions). PER-JOB check (PLAN.md §8 explicit).
if run_check 6; then
  if command -v gh >/dev/null 2>&1; then
    run_id=$(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId' 2>/dev/null)
    if [[ -z "$run_id" || "$run_id" == "null" ]]; then
      final_or_warn 6 "no GH Actions runs found yet (workflow added Day 2 by Vinh)"
    else
      jobs_json=$(gh run view "$run_id" --json jobs 2>/dev/null || echo '{"jobs":[]}')
      failing=$(echo "$jobs_json" | jq -r '.jobs[] | select(.conclusion!="success" and .conclusion!=null) | "\(.name): \(.conclusion)"' 2>/dev/null || echo "")
      pending=$(echo "$jobs_json" | jq -r '.jobs[] | select(.conclusion==null) | "\(.name): in_progress"' 2>/dev/null || echo "")
      if [[ -n "$failing" ]]; then fail 6 "CI per-job not green:"; echo "$failing" | sed 's/^/    /'
      elif [[ -n "$pending" ]]; then warn 6 "CI per-job has in-progress jobs:"; echo "$pending" | sed 's/^/    /'
      else pass 6 "CI per-job green on main run $run_id"; fi
    fi
  else final_or_warn 6 "gh CLI unavailable, CI status unverifiable"; fi
fi

# Check 7 — TypeScript clean
if run_check 7; then
  if [[ -f app/frontend/package.json ]]; then
    if (cd app/frontend && pnpm tsc --noEmit) >/tmp/apex-tsc.log 2>&1; then
      pass 7 "tsc --noEmit clean (frontend)"
    else fail 7 "tsc errors (see /tmp/apex-tsc.log)"; fi
  else warn 7 "app/frontend/package.json missing, tsc skipped"; fi
fi

# Check 8 — Lint clean (frontend eslint + backend ruff)
if run_check 8; then
  lint_fail=0
  if [[ -f app/frontend/package.json ]]; then
    if (cd app/frontend && pnpm lint) >/tmp/apex-eslint.log 2>&1; then :
    else lint_fail=1; printf "    eslint failed (see /tmp/apex-eslint.log)\n"; fi
  fi
  if [[ -f app/backend/pyproject.toml ]]; then
    if (cd app/backend && ruff check .) >/tmp/apex-ruff.log 2>&1; then :
    else lint_fail=1; printf "    ruff failed (see /tmp/apex-ruff.log)\n"; fi
  else printf "    (backend ruff skipped: app/backend/pyproject.toml not yet created by Vinh)\n"; fi
  if (( lint_fail == 0 )); then pass 8 "lint clean (eslint frontend)"
  else fail 8 "lint errors"; fi
fi

# Check 9 — Tests pass (vitest frontend + pytest backend). Final mode: enforce 70% backend coverage.
if run_check 9; then
  test_fail=0
  any_run=0
  if [[ -f app/frontend/package.json ]] && grep -q '"test"' app/frontend/package.json; then
    any_run=1
    if (cd app/frontend && pnpm test --run) >/tmp/apex-vitest.log 2>&1; then :
    else test_fail=1; printf "    vitest failed (see /tmp/apex-vitest.log)\n"; fi
  fi
  if [[ -d app/backend/tests ]] && [[ -f app/backend/pyproject.toml ]]; then
    any_run=1
    pytest_args="-q"
    if (( FINAL_MODE )); then pytest_args="-q --cov=apex --cov-fail-under=70"; fi
    if (cd app/backend && pytest $pytest_args) >/tmp/apex-pytest.log 2>&1; then :
    else test_fail=1; printf "    pytest failed (see /tmp/apex-pytest.log)\n"; fi
  fi
  if (( any_run == 0 )); then final_or_warn 9 "no test suites yet (Vinh adds Convergence 14 Day 5-7)"
  elif (( test_fail == 0 )); then pass 9 "tests pass$([[ $FINAL_MODE == 1 ]] && echo ', coverage ≥ 70% enforced')"
  else fail 9 "test failures (see /tmp logs)"; fi
fi

# Check 10 — Hugging Face Space healthy. Final mode: required.
if run_check 10; then
  hf_url="${APEX_HF_URL:-}"
  if [[ -z "$hf_url" ]]; then final_or_warn 10 "HF Space URL not yet set (Vinh Day 9 deploy). Set APEX_HF_URL env var."
  else
    code=$(curl -s -o /dev/null -w "%{http_code}" "$hf_url/health" --max-time 30 || echo "000")
    case "$code" in
      200) pass 10 "HF Space /health 200 at $hf_url" ;;
      *) soft_or_fail 10 "HF Space /health returned $code at $hf_url" ;;
    esac
  fi
fi

# Check 11 — Demo video length ≤ 3:00. Final mode: required + ffprobe required.
if run_check 11; then
  vid="deliverables/demo-video.mp4"
  if [[ -f "$vid" ]]; then
    if command -v ffprobe >/dev/null 2>&1; then
      dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$vid" 2>/dev/null | cut -d. -f1)
      if [[ -n "$dur" && "$dur" -le 180 ]]; then pass 11 "demo video duration ${dur}s ≤ 180s"
      else fail 11 "demo video duration ${dur}s > 180s"; fi
    else final_or_warn 11 "ffprobe unavailable, video duration unchecked (install ffmpeg)"; fi
  else final_or_warn 11 "deliverables/demo-video.mp4 not yet recorded (Day 10)"; fi
fi

# Check 11b — 30-second highlight clip exists (PLAN §16.4 + Stretch S7).
if run_check 11; then
  clip="deliverables/demo-video-30s.mp4"
  if [[ -f "$clip" ]]; then
    if command -v ffprobe >/dev/null 2>&1; then
      dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$clip" 2>/dev/null | cut -d. -f1)
      if [[ -n "$dur" && "$dur" -ge 25 && "$dur" -le 35 ]]; then printf "${GREEN}[11b] PASS${RESET} 30-second highlight clip duration ${dur}s (target 30s)\n"
      else fail 11 "30-second highlight clip duration ${dur}s (target 25-35s)"; fi
    else printf "${YELLOW}[11b] WARN${RESET} ffprobe unavailable, 30s clip duration unchecked\n"; SOFT_FAIL=$((SOFT_FAIL+1)); fi
  else
    if (( FINAL_MODE )); then fail 11 "deliverables/demo-video-30s.mp4 missing (PLAN §16.4, Stretch S7 Day 10)"
    else printf "${YELLOW}[11b] WARN${RESET} deliverables/demo-video-30s.mp4 not yet recorded (Day 10)\n"; SOFT_FAIL=$((SOFT_FAIL+1)); fi
  fi
fi

# Check 12 — Backup demo video exists. Final mode: required.
if run_check 12; then
  if [[ -f "deliverables/demo-video-backup.mp4" ]]; then pass 12 "backup demo video present"
  else final_or_warn 12 "deliverables/demo-video-backup.mp4 not yet present (Day 10)"; fi
fi

# Check 13 — Deck PDF renders
if run_check 13; then
  if [[ -f "docs/deck.pdf" ]]; then
    sz=$(stat -f%z "docs/deck.pdf" 2>/dev/null || stat -c%s "docs/deck.pdf" 2>/dev/null)
    if [[ -n "$sz" && "$sz" -gt 1000 ]]; then pass 13 "docs/deck.pdf present (${sz} bytes)"
    else fail 13 "docs/deck.pdf < 1KB (corrupt?)"; fi
  else warn 13 "docs/deck.pdf not yet rendered (Day 11)"; fi
fi

# Check 14 — README has working demo URL
if run_check 14; then
  url=$(grep -oE 'https://[^[:space:]\)]+vercel\.app[^[:space:]\)]*' README.md 2>/dev/null | head -1)
  if [[ -z "$url" ]]; then warn 14 "no Vercel demo URL in README yet"
  else
    code=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 15 || echo "000")
    case "$code" in
      200|301|302) pass 14 "demo URL $url returns $code" ;;
      000) warn 14 "demo URL $url unreachable (network or sleeping Vercel)" ;;
      *) soft_or_fail 14 "demo URL $url returns $code" ;;
    esac
  fi
fi

# Check 15 — LICENSE present + Apache 2.0
if run_check 15; then
  if [[ -f LICENSE ]] && grep -q "Apache License" LICENSE && grep -q "Version 2.0" LICENSE; then
    pass 15 "LICENSE present + Apache 2.0"
  else fail 15 "LICENSE missing or not Apache 2.0"; fi
fi

# Check 16 — All 8 IBM tools cited in README
if run_check 16; then
  tools=(
    "Granite-Docling"
    "Granite Vision 4.1"
    "Granite TimeSeries TTM|Granite TTM"
    "Granite 4.1 8B Instruct|Granite 4.1 Instruct"
    "Granite Guardian 4.1|Granite Guardian"
    "Langflow"
    "Docling library|Docling "
    "IBM Bob"
  )
  missing=()
  for t in "${tools[@]}"; do
    if ! grep -qE "$t" README.md 2>/dev/null; then missing+=("$t"); fi
  done
  if [[ ${#missing[@]} -eq 0 ]]; then pass 16 "all 8 IBM tools cited in README"
  else fail 16 "missing tool citations in README: ${missing[*]}"; fi
fi

# Check 17 — Q&A flashcards memorized (manual)
if run_check 17; then manual 17 "Q&A flashcards memorized cold (5 cards, <30s each, 3 hostile passes)"; fi

# Check 18 — Multi-track BeMyApp entries verified (manual)
if run_check 18; then manual 18 "every eligible BeMyApp track checkbox ticked"; fi

# Check 19 — Stakeholder quotes attributed (manual, per-surface consent)
if run_check 19; then manual 19 "any endorsement quote has name+org+per-surface consent"; fi

# Check 20 — Git in sync
if run_check 20; then
  unstaged=$(git status --short 2>/dev/null | wc -l | tr -d ' ')
  if (( unstaged > 0 )); then fail 20 "${unstaged} unstaged/uncommitted file(s) in working tree"
  else
    git fetch origin main --quiet 2>/dev/null || true
    behind=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "0")
    ahead=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")
    if [[ "$behind" == "0" && "$ahead" == "0" ]]; then pass 20 "git in sync with origin/main"
    else fail 20 "git out of sync: ahead=${ahead} behind=${behind}"; fi
  fi
fi

echo ""
echo -e "${BOLD}Summary${RESET}"
printf "  HARD-FAIL : %d\n" "$HARD_FAIL"
printf "  SOFT-WARN : %d\n" "$SOFT_FAIL"
printf "  MANUAL    : %d (verify by hand before submit)\n" "$MANUAL_PENDING"

if (( HARD_FAIL > 0 )); then
  echo -e "${RED}${BOLD}DO NOT SUBMIT${RESET} until all HARD-FAIL items are resolved."
  exit 1
elif (( MANUAL_PENDING > 0 )); then
  echo -e "${YELLOW}Manual checks still pending. Verify by hand before submit.${RESET}"
  exit 0
else
  echo -e "${GREEN}${BOLD}All automated checks green.${RESET}"
  exit 0
fi
