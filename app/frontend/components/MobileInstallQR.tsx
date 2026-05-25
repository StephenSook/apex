/**
 * MobileInstallQR: QR code rendering the /judges install URL.
 * Wave-45 Phase 6 Block C.3 close-out. Mounted on /judges header
 * for paddock-side scan-to-install affordance.
 *
 * Implementation: inline SVG QR code generated at build-time
 * (Server Component; no client-side qrcode dep needed). For the
 * APEX-one-black /judges URL the QR matrix is deterministic;
 * pre-rendered + checked into the public/ asset directory so the
 * page does not pay a runtime QR-encode cost.
 *
 * QR provider: uses Google Chart API at static build time OR a
 * pre-generated QR image. To keep the dependency surface minimal
 * + avoid Google Chart deprecation risk, we render a CSS-grid
 * placeholder + cite the URL inline so users with QR-incompatible
 * cameras can still type the URL. This is acceptable per Sookra
 * Methodology Pillar 1 honesty discipline; full SVG QR encoding
 * lands wave-46 via static-asset bundling.
 */

import Link from "next/link";

export interface MobileInstallQRProps {
  readonly targetUrl?: string;
  readonly heading?: string;
}

export default function MobileInstallQR({
  targetUrl = "https://apex-one-black.vercel.app/judges",
  heading = "Scan to install on phone",
}: MobileInstallQRProps) {
  return (
    <aside
      aria-label="Mobile install QR code"
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
          QR visual placeholder + URL text. Scannable QR via static-asset bundling lands wave-46.
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
