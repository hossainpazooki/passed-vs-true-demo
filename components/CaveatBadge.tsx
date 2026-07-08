import clsx from "clsx";

type Kind = "caveat" | "warning" | "provenance";

const STYLES: Record<Kind, string> = {
  caveat: "border-sky-700 bg-sky-950/50 text-sky-200",
  warning: "border-amber-600 bg-amber-950/50 text-amber-200",
  provenance: "border-neutral-700 bg-neutral-900 text-neutral-400",
};

export function CaveatBadge({ kind, children }: { kind: Kind; children: React.ReactNode }) {
  return (
    <span role="note" className={clsx("inline-block rounded border px-2 py-0.5 text-xs", STYLES[kind])}>
      {children}
    </span>
  );
}
