/**
 * MobileInstallQR: install-affordance card pairing a visual QR
 * placeholder with the canonical install URL text. Mounted on
 * /judges header for paddock-side mobile-install UX.
 *
 * Implementation (HEAD-honest 2026-05-25 night per wave-45 deep-
 * review codex MED + comment-analyzer NIT): we render a CSS-grid
 * pseudo-QR visual + the install URL as a clickable link. The
 * visual is NOT scannable; a future wave swap-point lands either
 * a real inline SVG QR encoder (via npm `qrcode` dep) OR a pre-
 * rendered static asset checked into `public/`. For now the URL
 * link is the load-bearing affordance + the QR visual signals
 * intent. Heading + aria-label avoid the "Scan to install"
 * promise that the placeholder cannot keep; the URL is one tap.
 *
 * Per Sookra Methodology Pillar 1 honesty discipline: better to
 * ship the honest visual-placeholder + URL link than to ship a
 * fake "Scan to install" affordance that breaks on first camera.
 */

import Link from "next/link";

export interface MobileInstallQRProps {
  readonly targetUrl?: string;
  readonly heading?: string;
}

export default function MobileInstallQR({
  targetUrl = "https://apex-one-black.vercel.app/judges",
  heading = "Open on phone (PWA install)",
}: MobileInstallQRProps) {
  return (
    <aside
      aria-label="Mobile install URL affordance with QR visual placeholder"
      className="flex flex-col gap-3 rounded-sm border border-racing-green bg-paper p-4 sm:flex-row sm:items-center"
    >
      <div
        aria-hidden="true"
        className="flex h-32 w-32 shrink-0 items-center justify-center rounded-sm border-2 border-rule bg-paper-warm"
      >
        <div className="grid grid-cols-7 gap-px font-mono text-[10px] text-racing-green">
          {Array.from({ length: 49 }, (_, i) => {
            // Deterministic pseudo-QR pattern (NOT scannable; placeholder
            // visual that signals QR-affordance without runtime encode
            // overhead; per Sookra Pillar 1 honesty: full scannable QR
            // lands wave-46 via static-asset bundling).
            const filled = (i * 7) % 11 < 4 || i % 8 === 0 || i % 13 === 0;
            return (
              <span
                key={i}
                className={`h-3 w-3 ${filled ? "bg-racing-green" : "bg-paper-warm"}`}
              />
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <p className="apex-eyebrow">PWA install affordance</p>
        <h4 className="font-display text-lg leading-snug text-ink">{heading}</h4>
        <p className="font-mono text-[11px] leading-relaxed text-ink-soft">
          Open the URL below on your phone to install. The visual signals
          QR-affordance; the URL is the one-tap install path.
        </p>
        <Link
          href={targetUrl}
          className="font-mono text-xs text-racing-green underline decoration-dotted underline-offset-2"
        >
          {targetUrl}
        </Link>
      </div>
    </aside>
  );
}
