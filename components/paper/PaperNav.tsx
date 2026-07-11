import Link from "next/link";

export function PaperNav() {
  return (
    <nav className="mb-8 flex items-baseline gap-4 border-b border-neutral-800 pb-3 text-sm print:hidden">
      <Link href="/" className="underline decoration-dotted underline-offset-2">
        ← Narrative demo
      </Link>
      <span className="text-neutral-500">Formal writeup (technical)</span>
    </nav>
  );
}
