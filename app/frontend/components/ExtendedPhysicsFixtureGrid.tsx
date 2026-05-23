import type {
  ExtendedPhysicsFixture,
  ExtendedPhysicsFixtureCatalogue,
  ExtendedPhysicsHandler,
} from "../../shared/types";

/**
 * ExtendedPhysicsFixtureGrid renders the 8-tier physics implementation
 * catalogue per D-015 + architecture-spec Appendix W30 Layer 4 expansion.
 * Mirrors ConvergenceFixtureGrid tile layout + Editorial-paddock palette.
 * Each tile surfaces the tier name + summary + plain-text formula +
 * canonical inputs + expected outputs + handler attribution (which part
 * of the SCP solver handles this tier per D-012 + D-014). Hover-state
 * reveals architecture-spec cross-reference.
 */

const HANDLER_LABELS: Record<ExtendedPhysicsHandler, string> = {
  scp_outer_linearisation: "SCP outer-loop linearisation",
  scp_inner_iterate: "SCP inner iterate (convex QP)",
  coa_constraint_layer: "COA constraint layer (lexicographic)",
  internal_state_evolution: "Internal state evolution",
  steady_state_algebraic_substitution: "Steady-state algebraic substitution",
};

function handlerBarClass(handler: ExtendedPhysicsHandler): string {
  if (handler === "scp_inner_iterate") {
    return "bg-racing-green";
  }
  if (handler === "scp_outer_linearisation") {
    return "bg-amber";
  }
  if (handler === "coa_constraint_layer") {
    return "bg-accent";
  }
  if (handler === "internal_state_evolution") {
    return "bg-ink";
  }
  if (handler === "steady_state_algebraic_substitution") {
    return "bg-muted";
  }
  const _exhaustive: never = handler;
  throw new Error(`unknown handler: ${String(_exhaustive)}`);
}

interface ExtendedPhysicsFixtureGridProps {
  readonly fixtures: ExtendedPhysicsFixtureCatalogue;
}

export function ExtendedPhysicsFixtureGrid({ fixtures }: ExtendedPhysicsFixtureGridProps) {
  return (
    <ol className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {fixtures.map((fixture) => (
        <li key={fixture.id} className="flex">
          <ExtendedPhysicsFixtureTile fixture={fixture} />
        </li>
      ))}
    </ol>
  );
}

interface ExtendedPhysicsFixtureTileProps {
  readonly fixture: ExtendedPhysicsFixture;
}

function ExtendedPhysicsFixtureTile({ fixture }: ExtendedPhysicsFixtureTileProps) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-sm border border-rule bg-paper p-5">
      <div
        className={`-mx-5 -mt-5 h-1 rounded-t-sm ${handlerBarClass(fixture.handled_in)}`}
        aria-hidden
      />
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg text-ink">
          <span className="font-mono text-xs text-muted">{fixture.id}</span>
          <span className="ml-2">{fixture.tier_name}</span>
        </h3>
        <span className="rounded-sm border border-rule bg-paper px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-soft">
          tier {fixture.id.slice(3)}
        </span>
      </header>
      <p className="text-sm leading-relaxed text-ink-soft">{fixture.summary}</p>
      <dl className="grid grid-cols-1 gap-2 font-mono text-xs text-muted">
        <div className="flex flex-col">
          <dt className="text-[10px] uppercase tracking-wider text-muted">Handler</dt>
          <dd className="text-ink">{HANDLER_LABELS[fixture.handled_in]}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-[10px] uppercase tracking-wider text-muted">Canonical inputs</dt>
          <dd className="text-ink">
            {fixture.canonical_inputs.length > 0
              ? fixture.canonical_inputs.join(" + ")
              : "(no canonical inputs declared for this tier)"}
          </dd>
        </div>
      </dl>
      <details className="group">
        <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wider text-racing-green group-open:text-accent">
          Formula + outputs
        </summary>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">{fixture.formula}</p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted">Outputs</p>
        {fixture.expected_outputs.length > 0 ? (
          <ul className="mt-1 flex flex-col gap-1 font-mono text-xs leading-relaxed text-ink-soft">
            {fixture.expected_outputs.map((out, idx) => (
              <li key={idx} className="flex gap-2">
                <span aria-hidden="true">{String(idx + 1).padStart(2, "0")}.</span>
                <span>{out}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 font-mono text-xs leading-relaxed text-muted">
            (no expected outputs declared for this tier)
          </p>
        )}
        <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted">
          Arch-spec ref: <span className="normal-case text-ink-soft">{fixture.arch_spec_ref}</span>
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
          Decision-log: <span className="text-ink-soft">{fixture.decision_log_ref}</span>
        </p>
      </details>
    </article>
  );
}
