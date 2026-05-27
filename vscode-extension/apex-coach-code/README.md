# APEX Coach Code (VS Code extension)

Wave-47 G6 ship per APEX galaxy-stretch counter-position #6.

Right-click any selection in your editor + pick **APEX: Get coach feedback on selection**. The extension opens a side-panel webview, sends the selection + an optional question to the public APEX `/api/coach-code` endpoint, and renders the Granite 4.1 8B Instruct response inline. HARD-COMPLIANCE regulatory-anchor scrubber + Self-Correcting Retry Loop fire server-side so the response is safe-by-construction.

## Install (sideload)

```
git clone https://github.com/StephenSook/apex
cd apex/vscode-extension/apex-coach-code
npm install -g @vscode/vsce
vsce package --no-dependencies --out apex-coach-code-0.1.0.vsix
# In VS Code: Extensions -> "..." -> Install from VSIX -> pick the file
```

## Use

1. Open any source file.
2. Select code (under 32 KiB).
3. Right-click -> **APEX: Get coach feedback on selection** (or run the command from the palette).
4. Optionally type a question. Default question: "Review this snippet against the APEX three-layer architecture + flag any HARD-COMPLIANCE risks."
5. Side panel opens with the response, engine label, retry count, and model name.

## Configuration

- `apexCoachCode.deploymentUrl` (default `https://apex-one-black.vercel.app`) override only if running a local mirror of APEX.
- `apexCoachCode.defaultQuestion` override the default coaching question.

## Privacy

The extension sends the selected code + the question to the configured deployment URL. The deployment is public-source under Apache 2.0 (github.com/StephenSook/apex); no key required. Body is bounded to 32 KiB and the request has a 12-second timeout.

## License

Apache 2.0. See repo root `LICENSE`.
