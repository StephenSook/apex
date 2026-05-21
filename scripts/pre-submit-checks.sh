#!/usr/bin/env bash
# APEX pre-submit checklist runner (PLAN.md §8).
# Runs every check Day 11 (final gate) AND on demand during Day 2-10 (regression catcher).
# Usage:
#   bash scripts/pre-submit-checks.sh                  # default (Day 2-10 regression mode)
#   bash scripts/pre-submit-checks.sh --soft           # treat Vinh-pending gates as WARN not FAIL
#   bash scripts/pre-submit-checks.sh --final          # Day 11 strict mode: video/coverage/HF must be GREEN
#   bash scripts/pre-submit-checks.sh --only=1,2,5     # run a subset

set -u
set -o pipefail

GREEN="\033[32m"; RED="\033[31m"; YELLOW="\033[33m"; BLUE="\033[34m"; BOLD="\033[1m"; RESET="\033[0m"

HARD_FAIL=0
SOFT_FAIL=0
MANUAL_PENDING=0
SOFT_MODE=0
FINAL_MODE=0
ONLY_FILTER=""

print_usage() {
  cat <<USAGE
Usage:
  bash scripts/pre-submit-checks.sh                  default (Day 2-10 regression mode)
  bash scripts/pre-submit-checks.sh --soft           treat Vinh-pending gates as WARN
  bash scripts/pre-submit-checks.sh --final          Day 11 strict mode (video/coverage/HF must be GREEN)
  bash scripts/pre-submit-checks.sh --only=1,2,5     run a subset
  bash scripts/pre-submit-checks.sh -h|--help        this help
USAGE
}

for arg in "$@"; do
  case "$arg" in
    --soft) SOFT_MODE=1 ;;
    --final) FINAL_MODE=1 ;;
    --only=*) ONLY_FILTER="${arg#--only=}" ;;
    -h|--help) print_usage; exit 0 ;;
    *)
      echo "ERROR: unknown flag '$arg'. See --help." >&2
      exit 2
      ;;
  esac
done

if (( SOFT_MODE )) && (( FINAL_MODE )); then
  echo "ERROR: --soft and --final are mutually exclusive." >&2
  exit 2
fi

if [[ -n "$ONLY_FILTER" ]]; then
  IFS=',' read -ra _filter_list <<< "$ONLY_FILTER"
  for n in "${_filter_list[@]}"; do
    if ! [[ "$n" =~ ^[0-9]+[a-z]?$ ]]; then
      echo "ERROR: --only must be comma-separated check numbers (e.g. 1,2,11b), got '$n'" >&2
      exit 2
    fi
  done
fi

cleanup() {
  local rc=$?
  if (( rc != 0 )) && (( rc != 1 )); then
    echo ""
    echo -e "${RED}${BOLD}SCRIPT ABORTED${RESET} (rc=$rc). Partial results above. Counters at abort: HARD-FAIL=$HARD_FAIL  SOFT-WARN=$SOFT_FAIL  MANUAL=$MANUAL_PENDING" >&2
  fi
}
trap cleanup EXIT

run_check() {
  local n="$1"
  if [[ -n "$ONLY_FILTER" ]]; then
    if ! [[ ",$ONLY_FILTER," == *",$n,"* ]]; then
      return 1
    fi
  fi
  return 0
}

pass()    { printf "${GREEN}[%2s] PASS${RESET} %s\n" "$1" "$2"; }
fail()    { printf "${RED}[%2s] FAIL${RESET} %s\n" "$1" "$2"; HARD_FAIL=$((HARD_FAIL+1)); }
warn()    { printf "${YELLOW}[%2s] WARN${RESET} %s\n" "$1" "$2"; SOFT_FAIL=$((SOFT_FAIL+1)); }
manual()  { printf "${BLUE}[%2s] MANUAL${RESET} %s\n" "$1" "$2"; MANUAL_PENDING=$((MANUAL_PENDING+1)); }
soft_or_fail() { if (( SOFT_MODE )); then warn "$1" "$2"; else fail "$1" "$2"; fi; }
final_or_warn() { if (( FINAL_MODE )); then fail "$1" "$2"; else warn "$1" "$2"; fi; }

# Build the prose-sweep path list dynamically; skip paths that don't exist yet
# (paper/, deliverables/, bob-sessions/ are Day-9+ artifacts). Verified existing
# paths only, so grep does not silently swallow "No such file" warnings.
ALL_PROSE_PATHS=(
  README.md PLAN.md CLAUDE.md SUBMISSION.md STATUS_DAY1.md STATUS_DAY2.md STATUS_TEMPLATE.md
  docs/ app/frontend/app/ app/frontend/components/
  paper/ deliverables/ bob-sessions/
)
PROSE_PATHS=()
for p in "${ALL_PROSE_PATHS[@]}"; do
  if [[ -e "$p" ]]; then PROSE_PATHS+=("$p"); fi
done
if (( ${#PROSE_PATHS[@]} == 0 )); then
  echo "ERROR: no prose paths exist to scan (PROSE_PATHS list misconfigured)." >&2
  exit 2
fi

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

# Check 4 — operator-attribution sweep (named operators + personal contact info in public files).
# Patterns live in a gitignored private file so the watchlist is not itself a public artifact
# (Codex wave-11 BLOCKER #3). Override path with APEX_PRIVATE_DENYLIST env var.
# Allowlist: files that explicitly say "kept private" or "private memory" (deliberate references).
if run_check 4; then
  denylist_file="${APEX_PRIVATE_DENYLIST:-scripts/private-denylist.txt}"
  if [[ ! -f "$denylist_file" ]]; then
    final_or_warn 4 "private denylist file '$denylist_file' missing. Create it (one pattern per line) or set APEX_PRIVATE_DENYLIST. See scripts/private-denylist.txt.example."
  else
    patterns=$(grep -v '^#' "$denylist_file" | grep -v '^$' || true)
    if [[ -z "$patterns" ]]; then
      warn 4 "private denylist '$denylist_file' is empty (no patterns to sweep)"
    else
      named=$(echo "$patterns" | grep -rF -f - \
          --include="*.md" --include="*.ts" --include="*.tsx" --include="*.mdx" \
          --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=research --exclude-dir=dist \
          README.md PLAN.md SUBMISSION.md STATUS_DAY1.md STATUS_DAY2.md docs/ app/frontend/app/ app/frontend/components/ 2>/dev/null \
        | grep -v "private memory" \
        | grep -v "kept private" \
        || true)
      if [[ -z "$named" ]]; then pass 4 "no named operators or personal contact info in public files (pre-consent rule honored)"
      else fail 4 "named operators or personal contact info in public files (operator-unassociation violation):"; echo "$named" | sed 's/^/    /'; fi
    fi
  fi
fi

# Check 5 — em-dash in commit subjects
if run_check 5; then
  subjects=$(git log --pretty=%s 2>/dev/null | grep "—" || true)
  if [[ -z "$subjects" ]]; then pass 5 "no em-dash in commit subjects"
  else fail 5 "em-dash in commit subjects:"; echo "$subjects" | sed 's/^/    /'; fi
fi

# Check 6 — CI green on main (GitHub Actions). PER-JOB (PLAN.md §8).
# When gh or jq cannot answer the question, do NOT silently pass; the whole point of
# the gate is to verify CI green. Default to FAIL when verification is impossible.
if run_check 6; then
  if ! command -v gh >/dev/null 2>&1; then
    final_or_warn 6 "gh CLI unavailable, CI status unverifiable"
  elif ! command -v jq >/dev/null 2>&1; then
    fail 6 "jq unavailable, cannot parse gh JSON output"
  else
    run_id=$(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId' 2>/tmp/apex-gh-list.log || echo "")
    if [[ -z "$run_id" || "$run_id" == "null" ]]; then
      if [[ -s /tmp/apex-gh-list.log ]]; then
        fail 6 "gh run list errored (see /tmp/apex-gh-list.log)"
      else
        final_or_warn 6 "no GH Actions runs found yet (workflow added Day 2 by Vinh)"
      fi
    else
      if jobs_json=$(gh run view "$run_id" --json jobs 2>/tmp/apex-gh-view.log); then
        if failing=$(echo "$jobs_json" | jq -r '.jobs[] | select(.conclusion!="success" and .conclusion!=null and .conclusion!="skipped") | "\(.name): \(.conclusion)"' 2>/tmp/apex-jq.log) \
           && pending=$(echo "$jobs_json" | jq -r '.jobs[] | select(.conclusion==null) | "\(.name): in_progress"' 2>>/tmp/apex-jq.log); then
          if [[ -n "$failing" ]]; then fail 6 "CI per-job not green:"; echo "$failing" | sed 's/^/    /'
          elif [[ -n "$pending" ]]; then warn 6 "CI per-job has in-progress jobs:"; echo "$pending" | sed 's/^/    /'
          else pass 6 "CI per-job green on main run $run_id"; fi
        else
          fail 6 "jq parse error on gh output (see /tmp/apex-jq.log)"
        fi
      else
        fail 6 "gh run view failed (see /tmp/apex-gh-view.log) - CI status UNKNOWN, do not submit"
      fi
    fi
  fi
fi

# Check 7 — TypeScript clean
if run_check 7; then
  if [[ -f app/frontend/package.json ]]; then
    if (cd app/frontend && pnpm tsc --noEmit) >/tmp/apex-tsc.log 2>&1; then
      pass 7 "tsc --noEmit clean (frontend)"
    else fail 7 "tsc errors (see /tmp/apex-tsc.log)"; fi
  else warn 7 "app/frontend/package.json missing, tsc skipped"; fi
fi

# Check 8 — Lint clean (frontend eslint + backend ruff). ESLint internal crashes soft-fail
# (env breaks are not lint findings). Day 1 EOD pre-mortem row 26 tracks the residual.
if run_check 8; then
  lint_fail=0
  lint_env_break=0
  if [[ -f app/frontend/package.json ]]; then
    if (cd app/frontend && pnpm lint) >/tmp/apex-eslint.log 2>&1; then :
    else
      if grep -qE "TypeError|Oops! Something went wrong|LazyLoadingRuleMap|Invalid package config" /tmp/apex-eslint.log 2>/dev/null; then
        lint_env_break=1
        printf "    eslint env break (not lint findings; pre-mortem row 26): %s\n" "$(grep -m1 -E 'TypeError|Oops' /tmp/apex-eslint.log)"
      else
        lint_fail=1
        printf "    eslint failed with lint findings (see /tmp/apex-eslint.log)\n"
      fi
    fi
  fi
  if [[ -f app/backend/pyproject.toml ]]; then
    if (cd app/backend && ruff check .) >/tmp/apex-ruff.log 2>&1; then :
    else lint_fail=1; printf "    ruff failed (see /tmp/apex-ruff.log)\n"; fi
  else printf "    (backend ruff skipped: app/backend/pyproject.toml not yet created by Vinh)\n"; fi
  if (( lint_fail == 0 )) && (( lint_env_break == 0 )); then pass 8 "lint clean"
  elif (( lint_fail == 0 )) && (( lint_env_break == 1 )); then final_or_warn 8 "lint env break only (env, not lint findings)"
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

# Check 11 — Demo video length ≤ 3:00. Final mode: file + ffprobe both required.
if run_check 11; then
  vid="deliverables/demo-video.mp4"
  if [[ ! -f "$vid" ]]; then
    final_or_warn 11 "deliverables/demo-video.mp4 not yet recorded (Day 10)"
  elif ! command -v ffprobe >/dev/null 2>&1; then
    final_or_warn 11 "ffprobe unavailable, video duration unchecked (install ffmpeg)"
  else
    dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$vid" 2>/tmp/apex-ffprobe-demo.log | cut -d. -f1)
    if [[ -z "$dur" || ! "$dur" =~ ^[0-9]+$ ]]; then
      fail 11 "ffprobe could not read $vid duration (see /tmp/apex-ffprobe-demo.log)"
    elif (( dur > 180 )); then
      fail 11 "demo video duration ${dur}s > 180s"
    else
      pass 11 "demo video duration ${dur}s ≤ 180s"
    fi
  fi
fi

# Check 11b — 30-second highlight clip (PLAN §16.4 + Stretch S7). Final mode: required.
if run_check 11; then
  clip="deliverables/demo-video-30s.mp4"
  if [[ ! -f "$clip" ]]; then
    final_or_warn "11b" "deliverables/demo-video-30s.mp4 not yet recorded (Day 10)"
  elif ! command -v ffprobe >/dev/null 2>&1; then
    final_or_warn "11b" "ffprobe unavailable, 30s clip duration unchecked"
  else
    dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$clip" 2>/tmp/apex-ffprobe-30s.log | cut -d. -f1)
    if [[ -z "$dur" || ! "$dur" =~ ^[0-9]+$ ]]; then
      fail "11b" "ffprobe could not read $clip duration (see /tmp/apex-ffprobe-30s.log)"
    elif (( dur < 25 || dur > 35 )); then
      fail "11b" "30-second highlight clip duration ${dur}s (target 25-35s)"
    else
      pass "11b" "30-second highlight clip duration ${dur}s (target 30s)"
    fi
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
