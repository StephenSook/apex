import Link from "next/link";

import AnalyzeFlow from "../../components/AnalyzeFlow";

export const metadata = {
  title: "Analyze · APEX",
  description:
    "Upload your telemetry, FIA Certificate of Adaptations, and a sentence of debrief. APEX returns a corner-by-corner coaching report inside two minutes.",
};

export default function AnalyzePage() {
  return (
    <>
      <main id="main" className="flex flex-col">
        <Breadcrumb />
        <AnalyzeFlow />
      </main>
    </>
  );
}

function Breadcrumb() {
  return (
    <nav
      aria-label="Breadcrumb"
      className="border-b border-rule bg-paper"
    >
      <ol className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-4 font-mono text-xs uppercase tracking-wider text-muted lg:px-10">
        <li>
          <Link href="/" className="hover:text-racing-green underline-offset-4 hover:underline">
            APEX
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="text-ink">Analyze</li>
      </ol>
    </nav>
  );
}
