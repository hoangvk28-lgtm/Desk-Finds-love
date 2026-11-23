import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SITE_URL } from "@/lib/seo";
import { AtAGlance } from "@/components/product/AtAGlance";
import { AmazonBountyBanner } from "@/components/affiliate/AmazonBountyBanner";
import { QuickCompareTable } from "@/components/guide/QuickCompareTable";
import { MobileProductCTA } from "@/components/guide/MobileProductCTA";
import { getAuthorBySlug } from "@/data/authors";

export interface GuideProduct {
  id: string;
  rank: number;
  badge: string;
  name: string;
  price: string;
  // Never rendered (Amazon rating/review display is forbidden per CLAUDE.md), but kept
  // loosely typed since older data/guides/<slug>.ts files stored this as a string.
  rating?: number | string | null;
  reviews?: number | string | null;
  imageUrl: string;
  amazonUrl: string;
  description: string;
  specs: string[];
  specList?: { label: string; value: string }[];
  ctaLabel?: string;
  shortCtaLabel?: string;
  pros: string[];
  cons: string[];
  bestFor: string;
}

export interface HowToChooseSection {
  subheading: string;
  intro?: string;
  table?: { headers: string[]; rows: string[][] };
  cards?: { label: string; text: string }[];
  note?: string;
}

export interface RichGuidePageProps {
  slug: string;
  guideTitle: string;
  metaDescription: string;
  mainKeyword?: string;
  introParagraphs?: string[];
  lastUpdated: string;
  readTime: string;
  heroImage: string;
  products: GuideProduct[];
  howWeEvaluated?: { title: string; description: string }[];
  howToChoose?: HowToChooseSection[];
  buyingCriteria?: { criterion: string; explanation: string }[];
  faq?: { q: string; a: string }[];
  relatedGuides?: { href: string; title: string }[];
  expertTake?: string;
}

// Mirrors scripts/generate-guide-page.mjs's toBreadcrumbTitle/toAmazonSearchQuery/
// toProductNounSingular helpers exactly, so demoted guides render byte-identical
// breadcrumbs/headings/Amazon search links to their previous statically-generated page.
function toBreadcrumbTitle(guideTitle: string) {
  return guideTitle.replace(/^\d+\s+/, "").replace(/\s+in\s+2026$/i, "");
}

function toAmazonSearchQuery(mainKeyword: string | undefined, slug: string) {
  const kw = (mainKeyword || slug.replace(/-/g, " ")).trim();
  return kw.replace(/\s+/g, "+");
}

function toProductNounSingular(breadcrumbTitle: string) {
  const words = breadcrumbTitle.replace(/^Best\s+/i, "").trim();
  if (/ies$/i.test(words)) return words.replace(/ies$/i, "y");
  if (/ches$|shes$|xes$|sses$/i.test(words)) return words.replace(/es$/i, "");
  if (/s$/i.test(words) && !/ss$/i.test(words)) return words.replace(/s$/i, "");
  return words;
}

const AMAZON_ICON = (
  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.26 18.36C9.18 20.34 4.76 21.38 1 20.16c-.38-.13-.33-.44.08-.35 3.47.67 7.77-.07 10.6-1.82.47-.27.87.17.58.37zm1.06-1.17c-.43-.56-2.85-.27-3.94-.13-.33.04-.38-.25-.08-.46 1.93-1.36 5.1-.97 5.47-.51.37.46-.1 3.63-1.91 5.14-.28.23-.54.11-.42-.2.41-.98 1.32-3.28.88-3.84z" />
  </svg>
);

function BuyButton({ href, label, compact = false }: { href: string; label: string; compact?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`inline-flex items-center justify-center gap-2 rounded-btn font-bold text-white bg-cta hover:bg-cta-dark shadow-card transition-colors ${compact ? "px-3 py-2 text-xs" : "px-5 py-3 text-sm w-full sm:w-auto"}`}
    >
      {AMAZON_ICON}
      {label}
    </a>
  );
}

function SectionTitle({ kicker, title, sub, id }: { kicker: string; title: string; sub?: string; id?: string }) {
  return (
    <div className="mb-6" id={id}>
      <p className="df-kicker text-cta mb-1.5">{kicker}</p>
      <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">{title}</h2>
      {sub && <p className="text-sm text-ink-secondary mt-2 max-w-2xl">{sub}</p>}
    </div>
  );
}

function ProductSection({ product }: { product: GuideProduct }) {
  const ctaLabel = product.ctaLabel ?? "Check price on Amazon";
  return (
    <section id={product.id} className="mb-12 scroll-mt-24">
      <article className="rounded-2xl border border-border bg-white overflow-hidden shadow-card">
        {/* Dark rank header: the name itself is the first click target. */}
        <header className="flex items-center gap-4 px-5 py-4 bg-ink text-white">
          <span className="text-3xl font-bold text-white/40 leading-none tabular-nums shrink-0">
            {String(product.rank).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <span className="df-kicker !text-white/60 block">{product.badge}</span>
            <h3 className="text-lg sm:text-xl font-bold leading-snug break-words">
              <a
                href={product.amazonUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="!text-white hover:!text-accent underline-offset-4 hover:underline decoration-2 transition-colors"
              >
                {product.name}
              </a>
            </h3>
          </div>
        </header>

        <div className="grid md:grid-cols-[260px_1fr]">
          <div className="p-5 border-b md:border-b-0 md:border-r border-border flex flex-col gap-4">
            <a
              href={product.amazonUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group flex items-center justify-center h-56 rounded-xl bg-white border border-border hover:border-cta transition-colors overflow-hidden"
            >
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={240}
                height={220}
                className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105"
                unoptimized
              />
            </a>
            {product.specs.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.specs.map((spec, i) => (
                  <span key={i} className="text-[11px] px-2 py-1 rounded bg-bg border border-border text-ink-secondary font-medium">
                    {spec}
                  </span>
                ))}
              </div>
            )}
            <BuyButton href={product.amazonUrl} label={ctaLabel} />
          </div>

          <div className="p-5 sm:p-6">
            <div className="mb-4 rounded-xl bg-cta-light border border-cta/20 px-4 py-3 text-sm text-ink">
              <span className="font-bold">Best for:</span> {product.bestFor}
            </div>
            <div className="space-y-3 mb-5">
              {product.description.split("\n\n").map((para, i) => (
                <p key={i} className="text-[15px] text-ink-secondary leading-relaxed">{para}</p>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-green-200 bg-green-50/60 p-4">
                <p className="df-kicker text-green-700 mb-2">What works</p>
                <ul className="space-y-1.5">
                  {product.pros.map((pro, i) => (
                    <li key={i} className="flex gap-2 text-sm text-ink">
                      <span className="text-green-700 font-bold" aria-hidden="true">+</span>{pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                <p className="df-kicker text-amber-700 mb-2">Watch out for</p>
                <ul className="space-y-1.5">
                  {product.cons.map((con, i) => (
                    <li key={i} className="flex gap-2 text-sm text-ink">
                      <span className="text-amber-700 font-bold" aria-hidden="true">&minus;</span>{con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Second CTA under the pros/cons, where the decision is actually made. */}
            <div className="mt-5 md:hidden">
              <BuyButton href={product.amazonUrl} label={ctaLabel} />
            </div>
          </div>
        </div>

        {product.specList && product.specList.length > 0 && (
          <div className="border-t border-border bg-bg/60">
            <p className="df-kicker text-ink-muted px-5 pt-4">Spec sheet</p>
            <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 px-5 pb-4 pt-2">
              {product.specList.map((spec, i) => (
                <div key={i} className="flex justify-between gap-3 py-2 border-b border-dashed border-border-dark/60 text-sm">
                  <dt className="text-ink-secondary">{spec.label}</dt>
                  <dd className="text-ink font-medium text-right">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </article>
    </section>
  );
}

export function RichGuidePage(props: RichGuidePageProps) {
  const {
    slug, guideTitle, metaDescription, mainKeyword, readTime,
    heroImage, products, lastUpdated, expertTake,
  } = props;
  const introParagraphs = props.introParagraphs ?? [];
  const howWeEvaluated = props.howWeEvaluated ?? [];
  const howToChoose = props.howToChoose ?? [];
  const buyingCriteria = props.buyingCriteria ?? [];
  const faq = props.faq ?? [];
  const relatedGuides = props.relatedGuides ?? [];

  const bountyVariant = slug.includes("dorm")
    ? "primeYoungAdults"
    : slug.includes("budget")
    ? "haul"
    : "prime";

  const breadcrumbTitle = toBreadcrumbTitle(guideTitle);
  const amazonQuery = toAmazonSearchQuery(mainKeyword, slug);
  const productNoun = toProductNounSingular(breadcrumbTitle);
  const productNounPlural = breadcrumbTitle.replace(/^Best\s+/i, "").trim();
  const author = getAuthorBySlug("jamie-cole");
  const updatedLabel = new Date(lastUpdated).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const toc = [
    { id: "top-picks", label: "Top picks" },
    { id: "compare", label: "Compare all", show: products.length >= 2 },
    { id: "buying-criteria", label: "What to look for", show: buyingCriteria.length > 0 },
    { id: "reviews", label: "Detailed reviews" },
    { id: "how-we-evaluated", label: "How we evaluated", show: howWeEvaluated.length > 0 },
    { id: "how-to-choose", label: "How to choose", show: howToChoose.length > 0 },
    { id: "faq", label: "FAQ", show: faq.length > 0 },
  ].filter((t) => t.show !== false);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guideTitle,
    description: metaDescription,
    datePublished: lastUpdated,
    dateModified: lastUpdated,
    author: {
      "@type": "Person",
      name: "Jamie Cole",
      jobTitle: author?.role,
      url: `${SITE_URL}/author/jamie-cole`,
      ...(author?.avatarUrl ? { image: `${SITE_URL}${author.avatarUrl}` } : {}),
    },
    publisher: { "@type": "Organization", name: "DeskFinds", url: SITE_URL },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/guide/${slug}` },
    image: heroImage,
    about: [{ "@type": "Thing", name: breadcrumbTitle }],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Buying Guides", item: `${SITE_URL}/guide` },
      { "@type": "ListItem", position: 3, name: breadcrumbTitle, item: `${SITE_URL}/guide/${slug}` },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: guideTitle,
    description: metaDescription,
    numberOfItems: products.length,
    itemListElement: products.map((p) => ({
      "@type": "ListItem",
      position: p.rank,
      name: `${p.name} - ${p.badge}`,
      url: `${SITE_URL}/guide/${slug}#${p.id}`,
    })),
  };

  const faqSchema = faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      {/* ── Header band: title, trust signals and the #1 pick above the fold ── */}
      <section className="relative bg-ink text-white overflow-hidden">
        <div className="absolute inset-0 df-grid-bg" aria-hidden="true" />
        <Container className="relative py-8 sm:py-12">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-white/50 mb-5" aria-label="Breadcrumb">
            <Link prefetch={false} href="/" className="!text-white/70 hover:!text-white transition-colors">Home</Link>
            <span>/</span>
            <Link prefetch={false} href="/guide" className="!text-white/70 hover:!text-white transition-colors">Buying Guides</Link>
            <span>/</span>
            <span className="text-white/80">{breadcrumbTitle}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_340px] gap-8 lg:gap-12 items-center">
            <div>
              <p className="df-kicker text-accent mb-3">
                Buying guide &middot; {readTime} read &middot; Updated {updatedLabel}
              </p>
              <h1 className="!text-white text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight mb-4">
                {guideTitle}
              </h1>
              <p className="text-base sm:text-lg !text-white/75 max-w-2xl leading-relaxed">{metaDescription}</p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-6 text-xs text-white/60">
                <Link prefetch={false} href="/author/jamie-cole" className="group flex items-center gap-3">
                  {author?.avatarUrl && (
                    <Image
                      src={author.avatarUrl}
                      alt={`${author.name}, ${author.role}`}
                      width={44}
                      height={44}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-white/25 group-hover:ring-accent transition-colors shrink-0"
                      unoptimized
                    />
                  )}
                  <span className="leading-tight">
                    <span className="block text-sm font-semibold !text-white group-hover:!text-accent transition-colors">By Jamie Cole</span>
                    <span className="block text-xs text-white/55">Lead Product Researcher</span>
                  </span>
                </Link>
                <span>{products.length} options evaluated</span>
                <span>No paid placement</span>
              </div>
            </div>

            {/* Top-pick card: a buy button inside the first viewport on every guide. */}
            {products[0] && (
              <aside className="rounded-2xl bg-white p-4 shadow-card">
                <p className="df-kicker text-cta mb-2">Our top pick</p>
                <a
                  href={products[0].amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="block h-40 sm:h-44 mb-3"
                >
                  <Image
                    src={products[0].imageUrl || heroImage}
                    alt={products[0].name}
                    width={360}
                    height={220}
                    className="w-full h-full object-contain"
                    priority
                    unoptimized
                  />
                </a>
                <p className="text-sm font-bold text-ink leading-snug mb-1">{products[0].name}</p>
                <p className="text-xs text-ink-muted mb-3 line-clamp-2">{products[0].bestFor}</p>
                <BuyButton href={products[0].amazonUrl} label={products[0].ctaLabel ?? "Check price on Amazon"} />
                <a href={`#${products[0].id}`} className="block mt-2 text-center text-xs text-ink-muted hover:text-brand transition-colors">
                  Read why it won &darr;
                </a>
              </aside>
            )}
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_240px] gap-10">
          <div className="min-w-0">
            <div className="mb-6 p-3 rounded-xl bg-bg border border-border text-xs text-ink-secondary">
              <strong className="text-ink">Quick note:</strong> We may earn a commission when you buy through Amazon links. Picks are based on specs, buyer feedback and use cases, never paid placement.{" "}
              <Link prefetch={false} href="/affiliate-disclosure" className="text-brand hover:underline">Affiliate disclosure</Link>.
            </div>

            {expertTake && (
              <aside className="mb-8 rounded-2xl border-l-4 border-cta bg-white p-5 sm:p-6 shadow-card">
                <p className="df-kicker text-cta mb-2">Editor&apos;s take</p>
                <p className="text-[17px] leading-relaxed text-ink">{expertTake}</p>
              </aside>
            )}

            <section id="top-picks" className="mb-10 scroll-mt-24">
              <SectionTitle kicker="At a glance" title="Our top picks" />
              <AtAGlance
                items={products.map((product) => ({
                  rank: product.rank,
                  badge: product.badge,
                  name: product.name,
                  brand: "",
                  imageUrl: product.imageUrl,
                  affiliateUrl: product.amazonUrl,
                  price: "",
                  pros: product.pros.map((text) => ({ text })),
                  cons: product.cons.map((text) => ({ text, severity: "minor" as const })),
                  anchorId: product.id,
                }))}
              />
            </section>

            <QuickCompareTable products={products} productNounPlural={productNounPlural} />

            {introParagraphs.length > 0 && (
              <section className="mb-12 space-y-4 text-[17px] text-ink-secondary leading-relaxed">
                {introParagraphs.map((p, i) => <p key={i}>{p}</p>)}
              </section>
            )}

            <AmazonBountyBanner variant={bountyVariant} />

            {buyingCriteria.length > 0 && (
              <section id="buying-criteria" className="mb-14 scroll-mt-24">
                <SectionTitle
                  kicker="Before you buy"
                  title={`${buyingCriteria.length} Criteria to Look For Before Buying ${/^[aeiou]/i.test(productNoun) ? "an" : "a"} ${productNoun}`}
                />
                <ol className="space-y-4">
                  {buyingCriteria.map((item, i) => (
                    <li key={i} className="rounded-2xl border border-border bg-white p-5 flex gap-4 shadow-card">
                      <span className="shrink-0 w-8 h-8 rounded-lg bg-brand text-white text-xs font-bold flex items-center justify-center tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-ink mb-1.5">{item.criterion}</h3>
                        {item.explanation.split("\n\n").map((para, j) => (
                          <p key={j} className={`text-[15px] text-ink-secondary leading-relaxed ${j > 0 ? "mt-2" : ""}`}>{para}</p>
                        ))}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <div id="reviews" className="scroll-mt-24">
              <SectionTitle
                kicker="Detailed reviews"
                title={`The ${products.length} best ${productNounPlural.toLowerCase()}, explained`}
              />
              {products.map((product) => (
                <ProductSection key={product.id} product={product} />
              ))}
            </div>

            {howWeEvaluated.length > 0 && (
              <section id="how-we-evaluated" className="mb-14 scroll-mt-24">
                <SectionTitle
                  kicker="Methodology"
                  title={`How We Evaluated These ${productNounPlural}`}
                  sub={`Each pick was assessed across ${howWeEvaluated.length} criteria weighted for real-world use.`}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  {howWeEvaluated.map((item, i) => (
                    <div key={i} className="rounded-2xl border border-border bg-white p-5">
                      <h3 className="text-base font-bold text-ink mb-1.5">{item.title}</h3>
                      <p className="text-sm text-ink-secondary leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {howToChoose.length > 0 && (
              <section id="how-to-choose" className="mb-14 scroll-mt-24">
                <SectionTitle kicker="Decision guide" title={`How to Choose the Right ${productNounPlural}`} />
                <div className="space-y-10">
                  {howToChoose.map((sub, i) => (
                    <div key={i}>
                      <h3 className="text-xl font-bold text-ink mb-3">{sub.subheading}</h3>
                      {sub.intro && <p className="text-[15px] text-ink-secondary leading-relaxed mb-4">{sub.intro}</p>}
                      {sub.table && (
                        <div className="overflow-x-auto rounded-2xl border border-border mb-3 bg-white">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-ink text-white">
                                {sub.table.headers.map((h, hi) => (
                                  <th key={hi} className="text-left px-4 py-3 font-semibold">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {sub.table.rows.map((row, ri) => (
                                <tr key={ri} className="hover:bg-cta-light/40 transition-colors">
                                  {row.map((cell, ci) => (
                                    <td key={ci} className={`px-4 py-3 align-top ${ci === 0 ? "text-ink font-medium" : "text-ink-secondary"}`}>{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {sub.cards && (
                        <div className="grid sm:grid-cols-2 gap-4 mb-3">
                          {sub.cards.map((c, ci) => (
                            <div key={ci} className="rounded-2xl border border-border border-t-4 border-t-cta bg-white p-5">
                              <p className="font-bold text-ink mb-1.5">{c.label}</p>
                              <p className="text-sm text-ink-secondary leading-relaxed">{c.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {sub.note && (
                        <p className="text-sm text-ink bg-accent-light/60 border border-accent/30 rounded-xl px-4 py-3">{sub.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {faq.length > 0 && (
              <section id="faq" className="mb-14 scroll-mt-24">
                <SectionTitle kicker="FAQ" title="Frequently Asked Questions" />
                <div className="space-y-3">
                  {faq.map((item, i) => (
                    <details key={i} className="group rounded-2xl border border-border bg-white open:shadow-card" open={i === 0}>
                      <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 font-bold text-ink">
                        {item.q}
                        <span className="text-cta text-xl leading-none transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                      </summary>
                      <p className="px-5 pb-5 text-[15px] text-ink-secondary leading-relaxed">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* ── Bottom line: one last buy button per pick, for scroll-to-end readers ── */}
            <section className="relative overflow-hidden mb-14 rounded-2xl bg-ink text-white p-6 sm:p-8">
              <div className="absolute inset-0 df-grid-bg" aria-hidden="true" />
              <p className="relative df-kicker text-accent mb-2">Bottom line</p>
              <h2 className="relative !text-white text-2xl font-bold mb-5">The short version</h2>
              <ul className="relative space-y-3">
                {products.map((p) => (
                  <li key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 last:border-0">
                    <div className="min-w-0">
                      <p className="df-kicker !text-white/50">{p.badge}</p>
                      <a href={`#${p.id}`} className="!text-white font-semibold hover:!text-accent transition-colors">{p.name}</a>
                    </div>
                    <BuyButton href={p.amazonUrl} label={p.shortCtaLabel ?? "Check price"} compact />
                  </li>
                ))}
              </ul>
              <a
                href={`https://www.amazon.com/s?k=${amazonQuery}&tag=deskfinds0d-20`}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="relative inline-block mt-6 text-sm !text-white/70 hover:!text-white underline underline-offset-4"
              >
                {`Browse more ${productNounPlural.toLowerCase()} on Amazon `}&rarr;
              </a>
            </section>

            {author && (
              <section className="mb-14 rounded-2xl border border-border bg-white p-6 shadow-card flex flex-col sm:flex-row gap-5">
                <Link prefetch={false} href="/author/jamie-cole" className="shrink-0 self-start">
                  {author.avatarUrl && (
                    <Image
                      src={author.avatarUrl}
                      alt={`${author.name}, ${author.role}`}
                      width={96}
                      height={96}
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-brand/15 hover:ring-brand/40 transition-colors"
                      unoptimized
                    />
                  )}
                </Link>
                <div className="min-w-0">
                  <p className="df-kicker text-cta mb-1">About the author</p>
                  <Link prefetch={false} href="/author/jamie-cole" className="text-xl font-bold !text-ink hover:!text-brand transition-colors">
                    {author.name}
                  </Link>
                  <p className="text-sm text-ink-muted mb-2">{author.role}, DeskFinds</p>
                  <p className="text-[15px] text-ink-secondary leading-relaxed">{author.bio}</p>
                  <Link prefetch={false} href="/author/jamie-cole" className="inline-block mt-3 text-sm font-semibold text-brand hover:text-brand-dark transition-colors">
                    More from Jamie &rarr;
                  </Link>
                </div>
              </section>
            )}

            {relatedGuides.length > 0 && (
              <section>
                <SectionTitle kicker="Keep reading" title="Related guides" />
                <div className="grid sm:grid-cols-2 gap-3">
                  {relatedGuides.map((g) => {
                    const isExternal = /^https?:\/\//.test(g.href);
                    const cardClass = "flex items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-white hover:border-cta transition-colors group";
                    const inner = (
                      <>
                        <span className="font-semibold text-ink text-sm group-hover:text-cta transition-colors">{g.title}</span>
                        <span className="text-cta shrink-0" aria-hidden="true">&rarr;</span>
                      </>
                    );
                    return isExternal ? (
                      <a key={g.href} href={g.href} target="_blank" rel="noopener noreferrer" className={cardClass}>{inner}</a>
                    ) : (
                      <Link prefetch={false} key={g.href} href={g.href} className={cardClass}>{inner}</Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* ── Sticky sidebar: jump nav + a buy button that follows the reader ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <nav className="rounded-2xl border border-border bg-white p-4" aria-label="On this page">
                <p className="df-kicker text-ink-muted mb-3">On this page</p>
                <ul className="space-y-1">
                  {toc.map((t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`} className="block text-sm text-ink-secondary hover:text-cta py-1 transition-colors">{t.label}</a>
                    </li>
                  ))}
                </ul>
              </nav>
              {products[0] && (
                <div className="rounded-2xl border border-border bg-white p-4">
                  <p className="df-kicker text-cta mb-2">Top pick</p>
                  <div className="h-32 flex items-center justify-center mb-3">
                    <Image src={products[0].imageUrl} alt={products[0].name} width={160} height={128} className="h-full w-auto object-contain" unoptimized />
                  </div>
                  <p className="text-sm font-semibold text-ink mb-3 leading-snug">{products[0].name}</p>
                  <BuyButton href={products[0].amazonUrl} label="Check price" compact />
                </div>
              )}
            </div>
          </aside>
        </div>
      </Container>

      <MobileProductCTA items={products.map((p) => ({ id: p.id, name: p.name, amazonUrl: p.amazonUrl }))} />
    </>
  );
}
