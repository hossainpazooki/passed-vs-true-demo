const STATES = ["DECLARED", "PLANNED", "EXECUTING", "VALIDATING", "ACHIEVED", "FAILED"] as const;

export function LifecycleStateMachine() {
  return (
    <div className="rounded-lg border border-neutral-800 p-4">
      <div className="flex flex-wrap items-center gap-2">
        {STATES.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            <span className={s === "ACHIEVED" ? "rounded bg-green-800 px-2 py-1 text-sm" : s === "FAILED" ? "rounded bg-red-900 px-2 py-1 text-sm" : "rounded bg-neutral-800 px-2 py-1 text-sm"}>
              {s}
            </span>
            {i < STATES.length - 2 && <span className="text-neutral-600">→</span>}
          </span>
        ))}
      </div>
      <p className="mt-2 text-sm text-neutral-400">
        <code>all_passed()</code> in the Go intent-controller is the single authority for ACHIEVED — the exact gate both CLUE and correct-shaped-lies build on.
      </p>
    </div>
  );
}
