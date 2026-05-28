#!/usr/bin/env python3
"""
generate-master-overview.py

One-shot NotebookLM Audio Overview generator for the APEX master overview
that mounts on /judges hero + SUBMISSION.md.

Inputs (4 source files; sized to fit one notebook):
  paper/apex-neurips-workshop-2026.md   - sections 3.1-3.8 + 4
  docs/decision-log.md                  - D-001 through D-070
  docs/architecture-spec.md             - the canonical pipeline doc
  README.md                             - submission landing

Output:
  app/frontend/public/audio/master-overview.mp3   - 10 min deep_dive long

Auth model:
  Cookie-based via teng-lin/notebooklm-py. First run opens Chromium for
  Google sign-in; session persists in ~/.notebooklm/. No GCP billing
  project required.

Usage:
  uv run --with notebooklm-py scripts/generate-master-overview.py

If the first run fails on missing session:
  uv tool install notebooklm-py
  notebooklm login
  uv run --with notebooklm-py scripts/generate-master-overview.py

Tone constraint applied via custom instructions:
  paddock-direct, engineering-confident, no em-dash, no marketing words.
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

try:
    from notebooklm import (  # type: ignore[import-not-found]
        AudioFormat,
        AudioLength,
        NotebookLMClient,
    )
except ImportError:
    sys.stderr.write(
        "notebooklm-py not installed. Run:\n"
        "  uv tool install notebooklm-py\n"
        "  notebooklm login\n"
        "then re-run this script.\n"
    )
    sys.exit(2)


REPO_ROOT = Path(__file__).resolve().parent.parent

SOURCES: list[Path] = [
    REPO_ROOT / "paper" / "apex-neurips-workshop-2026.md",
    REPO_ROOT / "docs" / "decision-log.md",
    REPO_ROOT / "docs" / "architecture-spec.md",
    REPO_ROOT / "README.md",
]

OUTPUT_PATH = (
    REPO_ROOT / "app" / "frontend" / "public" / "audio" / "master-overview.mp3"
)

NOTEBOOK_TITLE = "APEX master overview (judges)"

FOCUS_PROMPT = (
    "Produce a ten-minute deep-dive Audio Overview for IBM SkillsBuild "
    "judges evaluating APEX, an AI race engineer for adaptive racers. "
    "Cover four pillars, in order, with roughly equal time each. "
    "One: the problem. A professional race engineer costs hundreds of "
    "pounds per day, well beyond the budget of adaptive racers, veteran "
    "drivers, and grassroots competitors. The FIA lifted its single-seater "
    "ban on disabled drivers in December 2017, but the economic barrier "
    "replaced the regulatory one. APEX targets the drivers who do not "
    "have a race engineer at all. "
    "Two: the PhysicsTTM three-layer architecture. A frozen Granite "
    "TimeSeries TTM forecaster, wrapped in a two-stage projection-and-"
    "audit layer (Stage 1 differentiable CvxpyLayer convex QP for "
    "friction-ellipse, forward-Euler, and jerk bound; Stage 2 post-"
    "projection feasibility filter for bicycle-model coupling and the "
    "COA-parameterized brake-throttle simultaneity gate), audited by "
    "Granite Guardian 4.1 with BYOC custom rules. Explain why frozen "
    "TSFM plus post-hoc projection is structurally different from a "
    "retrained physics-informed neural network. "
    "Three: the COA-parameterized brake-throttle simultaneity gate "
    "killshot. Existing AI race-engineer tools encode throttle times "
    "brake equals zero because able-bodied drivers do not press both. "
    "Adaptive drivers do, when their FIA Certificate of Adaptations "
    "permits simultaneity through their hand-control system. APEX reads "
    "the COA at tensor level. To the best of the team's literature "
    "review through 2026-Q2, no prior public AI race-engineer workflow "
    "reads COA data as a binding regulatory input. "
    "Four: the fourteen-tool IBM Granite stack honesty tier ladder. "
    "Two tools wired end-to-end at HEAD (Granite Instruct 4.1 8B and "
    "Granite 4.0 Nano 350M). Ten at frontend-integration with canonical "
    "type contracts and backend swap-points. Two build-time accelerators. "
    "Walk the ladder and explain why honest tier labels beat marketing "
    "tool counts. "
    "Tone: paddock-direct, engineering-confident, conversational. Do "
    "not use em-dash. Do not use the words leverage, seamless, robust, "
    "comprehensive, unlock, cutting-edge, revolutionary, streamline, "
    "ecosystem, easily, or simply. Speak at roughly 150 words per "
    "minute. Treat the listener as a technical judge who has read the "
    "abstract and wants the engineering substance, not a sales pitch. "
    "Close on the editorial line: the race engineer for the drivers "
    "who do not have one."
)


async def main() -> int:
    for src in SOURCES:
        if not src.exists():
            sys.stderr.write(f"missing source file: {src}\n")
            return 1

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    async with await NotebookLMClient.from_storage() as client:
        sys.stdout.write("Creating notebook...\n")
        notebook = await client.notebooks.create(NOTEBOOK_TITLE)
        sys.stdout.write(f"  notebook id: {notebook.id}\n")

        for src in SOURCES:
            sys.stdout.write(f"Uploading source: {src.relative_to(REPO_ROOT)}\n")
            # wait=True blocks until NotebookLM finishes processing this
            # source. Doing each file in series with wait=True is the
            # documented pattern; there is no batch wait_for_all method.
            await client.sources.add_file(notebook.id, str(src), wait=True)

        sys.stdout.write("Generating Audio Overview (deep_dive, long)...\n")
        status = await client.artifacts.generate_audio(
            notebook.id,
            instructions=FOCUS_PROMPT,
            audio_format=AudioFormat.DEEP_DIVE,
            audio_length=AudioLength.LONG,
        )
        sys.stdout.write(f"  task id: {status.task_id}\n")

        sys.stdout.write("Polling until complete (10-20 minutes typical)...\n")
        final = await client.artifacts.wait_for_completion(
            notebook.id, status.task_id, timeout=1800
        )
        if not final.is_complete:
            sys.stderr.write(f"generation failed: {final.error}\n")
            return 1

        sys.stdout.write(f"Downloading MP3 to {OUTPUT_PATH}\n")
        await client.artifacts.download_audio(notebook.id, str(OUTPUT_PATH))

        sys.stdout.write("\n")
        sys.stdout.write(f"DONE. master-overview.mp3 saved to {OUTPUT_PATH}\n")
        sys.stdout.write(
            "Next: ping Claude to mount the audio on /judges hero + "
            "SUBMISSION.md.\n"
        )
        return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
