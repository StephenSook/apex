#!/usr/bin/env bash
# APEX pre-submit checklist runner (PLAN.md §8).
# Runs every check Day 11 (final gate) AND on demand during Day 2-10 (regression catcher).
# Usage:
#   bash scripts/pre-submit-checks.sh                  # run all, exit non-zero on any HARD-FAIL
#   bash scripts/pre-submit-checks.sh --soft           # treat Vinh-pending gates as WARN not FAIL
#   bash scripts/pre-submit-checks.sh --only=1,2,5     # run a subset

set -u

GREEN="\033[32m"; RED="\033[31m"; YELLOW="\033[33m"; BLUE="\033[34m"; BOLD="\033[1m"; RESET="\033[0m"

HARD_FAIL=0
SOFT_FAIL=0
MANUAL_PENDING=0
SOFT_MODE=0
ONLY_FILTER=""

for arg in "$@"; do
  case "$arg" in
    --soft) SOFT_MODE=1 ;;
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

PROSE_PATHS=(README.md PLAN.md CLAUDE.md SUBMISSION.md STATUS_DAY1.md STATUS_TEMPLATE.md docs/ app/frontend/app/ app/frontend/components/)

echo -e "${BOLD}APEX pre-submit checklist${RESET} ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
echo "Repo: $(git rev-parse --show-toplevel 2>/dev/null || echo .)"
echo "HEAD: $(git rev-parse --short HEAD 2>/dev/null || echo n/a)"
echo "Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo n/a)"
echo ""

# Check 1 — em-dash sweep (excludes meta-policy refs in CLAUDE.md + pre-mortem.md self-references)
if run_check 1; then
  hits=$(grep -rn "—" "${PROSE_PATHS[@]}" 2>/dev/null \
    | grep -v "node_modules" \
    | grep -v ".next" \
    | grep -v "research/" \
    | grep -v "CLAUDE.md.*No em-dash" \
    | grep -v "pre-mortem.md.*Em-dash in prose" \
    | grep -v "decision-log.md.*em-dash" \
    || true)
  if [[ -z "$hits" ]]; then pass 1 "em-dash sweep clean across prose paths"
  else fail 1 "em-dash found in prose:"; echo "$hits" | sed 's/^/    /'; fi
fi

# Check 2 — AI-tone blocklist (12 words). Allow rule-definition contexts.
if run_check 2; then
  blocklist='delve into|leverage |seamless|robust |comprehensive|unlock|cutting-edge|revolutionary|streamline|ecosystem |easily|simply '
  hits=$(grep -rEn "$blocklist" "${PROSE_PATHS[@]}" 2>/dev/null \
    | grep -v "node_modules" \
    | grep -v ".next" \
    | grep -v "research/" \
    | grep -v "pnpm-lock" \
    | grep -vE "(blocklist|No AI-tone|AI-blocklist|three-brain|leverage layers|lower-leverage)" \
    || true)
  if [[ -z "$hits" ]]; then pass 2 "AI-tone blocklist sweep clean"
  else fail 2 "AI-tone blocklist hits in prose:"; echo "$hits" | sed 's/^/    /'; fi
fi

# Check 3 — en-dash + smart-quote sweep
if run_check 3; then
  smart=$(grep -rEn $'[–‘’“”]' "${PROSE_PATHS[@]}" 2>/dev/null \
    | grep -v "node_modules" \
    | grep -v ".next" \
    | grep -v "research/" \
    || true)
  if [[ -z "$smart" ]]; then pass 3 "en-dash + smart-quote sweep clean"
  else fail 3 "non-ASCII typographic chars found:"; echo "$smart" | sed 's/^/    /'; fi
fi

# Check 4 — operator-attribution sweep (named operators in public files)
if run_check 4; then
  named=$(grep -rEn "Jason Arthur|Al Locke|Johnny Dawson-Ellis|Brian Roberts|Aaron Morgan|Bobby Trundley|MME Motorsport|mme-motorsport|MME_Motorsport" \
    README.md PLAN.md SUBMISSION.md STATUS_DAY1.md docs/ app/frontend/app/ app/frontend/components/ 2>/dev/null \
    | grep -v "node_modules" \
    | grep -v ".next" \
    | grep -v "research/" \
    | grep -v "private memory" \
    || true)
  if [[ -z "$named" ]]; then pass 4 "no named operators in public files (pre-consent rule honored)"
  else fail 4 "named operators in public files (operator-unassociation violation):"; echo "$named" | sed 's/^/    /'; fi
fi

# Check 5 — em-dash in commit subjects
if run_check 5; then
  subjects=$(git log --pretty=%s 2>/dev/null | grep "—" || true)
  if [[ -z "$subjects" ]]; then pass 5 "no em-dash in commit subjects"
  else fail 5 "em-dash in commit subjects:"; echo "$subjects" | sed 's/^/    /'; fi
fi

# Check 6 — CI green on main (GitHub Actions). Soft-fail if gh CLI unavailable.
if run_check 6; then
  if command -v gh >/dev/null 2>&1; then
    status=$(gh run list --branch main --limit 1 --json conclusion --jq '.[0].conclusion' 2>/dev/null || echo "unknown")
    case "$status" in
      success) pass 6 "latest GitHub Actions run on main: success" ;;
      failure|cancelled|timed_out|action_required) fail 6 "latest GH Actions run on main: $status" ;;
      ""|null|unknown) warn 6 "no GH Actions runs found yet (workflow not added until Vinh Day 2)" ;;
      *) warn 6 "GH Actions latest status: $status (treat as in-progress)" ;;
    esac
  else warn 6 "gh CLI unavailable, CI status skipped"; fi
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

# Check 9 — Tests pass (vitest frontend + pytest backend)
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
    if (cd app/backend && pytest -q) >/tmp/apex-pytest.log 2>&1; then :
    else test_fail=1; printf "    pytest failed (see /tmp/apex-pytest.log)\n"; fi
  fi
  if (( any_run == 0 )); then warn 9 "no test suites yet (Vinh adds Convergence 14 Day 5-7)"
  elif (( test_fail == 0 )); then pass 9 "tests pass"
  else fail 9 "test failures (see /tmp logs)"; fi
fi

# Check 10 — Hugging Face Space healthy
if run_check 10; then
  hf_url="${APEX_HF_URL:-}"
  if [[ -z "$hf_url" ]]; then warn 10 "HF Space URL not yet set (Vinh Day 9 deploy)"
  else
    code=$(curl -s -o /dev/null -w "%{http_code}" "$hf_url/health" --max-time 30 || echo "000")
    case "$code" in
      200) pass 10 "HF Space /health 200 at $hf_url" ;;
      *) soft_or_fail 10 "HF Space /health returned $code at $hf_url" ;;
    esac
  fi
fi

# Check 11 — Demo video length ≤ 3:00
if run_check 11; then
  vid="deliverables/demo-video.mp4"
  if [[ -f "$vid" ]]; then
    if command -v ffprobe >/dev/null 2>&1; then
      dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$vid" 2>/dev/null | cut -d. -f1)
      if [[ -n "$dur" && "$dur" -le 180 ]]; then pass 11 "demo video duration ${dur}s ≤ 180s"
      else fail 11 "demo video duration ${dur}s > 180s"; fi
    else warn 11 "ffprobe unavailable, video duration unchecked"; fi
  else warn 11 "deliverables/demo-video.mp4 not yet recorded (Day 10)"; fi
fi

# Check 12 — Backup demo video exists
if run_check 12; then
  if [[ -f "deliverables/demo-video-backup.mp4" ]]; then pass 12 "backup demo video present"
  else warn 12 "deliverables/demo-video-backup.mp4 not yet present (Day 10)"; fi
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
