import Image from "next/image";

interface Row {
  id: string;
  rank: number;
  badge: string;
  name: string;
  imageUrl: string;
  amazonUrl: string;
  bestFor: string;
  specs: string[];
  specList?: { label: string; value: string }[];
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/**
 * Spec labels shared by at least half of the picks (max 4), in first-seen order.
 * Only usable when the guide's data file carries a structured `specList`.
 */
function sharedSpecColumns(products: Row[]) {
  const counts = new Map<string, { label: string; n: number }>();
  for (const p of products) {
    const seen = new Set<string>();
    for (const s of p.specList ?? []) {
      const k = norm(s.label);
      if (seen.has(k)) continue;
      seen.add(k);
      const c = counts.get(k);
      if (c) c.n++;
      else counts.set(k, { label: s.label, n: 1 });
    }
  }
  const min = Math.max(2, Math.ceil(products.length / 2));
  const cols = [...counts.entries()].filter(([, c]) => c.n >= min).slice(0, 4);
  return cols.length >= 2 ? cols : [];
}

/**
 * Side-by-side comparison placed high on the page, above the long reviews.
 * It is the first thing a scanner reads, so every row ends in a buy button:
 * readers who already know what they want convert without scrolling further.
 * Falls back to the free-text `specs` chips when no structured specList exists,
 * so it renders on every guide rather than only the richest ones.
 */
export function QuickCompareTable({ products, productNounPlural }: { products: Row[]; productNounPlural: string }) {
  if (products.length < 2) return null;
  const cols = sharedSpecColumns(products);
  const value = (p: Row, key: string) => p.specList?.find((s) => norm(s.label) === key)?.value ?? "—";

  return (
    <section id="compare" className="mb-12 scroll-mt-24">
      <p className="df-kicker text-cta mb-1.5">Side by side</p>
      <h2 className="text-2xl font-bold text-ink tracking-tight mb-4">
        Compare all {products.length} {productNounPlural.toLowerCase()} at a glance
      </h2>
      <div className="rounded-2xl border border-border bg-white shadow-card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-ink text-white text-left">
              <th scope="col" className="px-4 py-3 font-semibold">Pick</th>
              <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Best for</th>
              {cols.length > 0
                ? cols.map(([k, c]) => (
                    <th key={k} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">{c.label}</th>
                  ))
                : <th scope="col" className="px-4 py-3 font-semibold">Key specs</th>}
              <th scope="col" className="px-4 py-3 font-semibold text-right whitespace-nowrap">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="align-top hover:bg-bg/70 transition-colors">
                <th scope="row" className="px-4 py-3 text-left font-normal">
                  <a href={`#${p.id}`} className="group flex items-center gap-3 min-w-[200px]">
                    <span className="shrink-0 w-12 h-12 rounded-lg bg-white border border-border flex items-center justify-center overflow-hidden">
                      <Image src={p.imageUrl} alt={p.name} width={48} height={48} className="object-contain w-full h-full p-0.5" unoptimized />
                    </span>
                    <span className="leading-snug">
                      <span className="block df-kicker text-cta">#{p.rank} {p.badge}</span>
                      <span className="block font-semibold text-ink group-hover:text-brand transition-colors">{p.name}</span>
                    </span>
                  </a>
                </th>
                <td className="px-4 py-3 text-ink-secondary max-w-[220px]">{p.bestFor}</td>
                {cols.length > 0
                  ? cols.map(([k]) => <td key={k} className="px-4 py-3 text-ink whitespace-nowrap">{value(p, k)}</td>)
                  : (
                    <td className="px-4 py-3">
                      <span className="flex flex-wrap gap-1.5 max-w-[260px]">
                        {p.specs.slice(0, 4).map((s, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-bg border border-border text-ink-secondary">{s}</span>
                        ))}
                      </span>
                    </td>
                  )}
                <td className="px-4 py-3 text-right">
                  <a
                    href={p.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-flex items-center justify-center rounded-btn bg-cta hover:bg-cta-dark px-3 py-2 text-xs font-bold text-white whitespace-nowrap transition-colors"
                  >
                    Check price
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-ink-muted">Prices on Amazon change often &mdash; tap a button for the live price.</p>
    </section>
  );
}
