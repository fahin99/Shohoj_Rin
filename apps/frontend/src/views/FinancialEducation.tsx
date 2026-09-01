import { useMemo, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Button } from "../components/Button";
import { Tabs } from "../components/Tabs";
import { SearchInput, TextInput } from "../components/Input";
import { EmptyState, EmptyIcons } from "../components/EmptyState";
import { formatTaka } from "../lib/format";

// Static educational content — not financial data, safe to keep client-side
const educationArticles = [
  {
    id: "ea-01",
    title: "Understanding Microloans: A Beginner's Guide",
    category: "Basics",
    readTime: "5 min",
    summary:
      "Learn what microloans are, how they work in Bangladesh, and whether they're right for your financial needs.",
    content:
      "Microloans are small loans typically ranging from ৳10,000 to ৳5,00,000, designed for individuals who may not qualify for traditional bank loans...",
  },
  {
    id: "ea-02",
    title: "How to Improve Your Trust Score",
    category: "Credit",
    readTime: "4 min",
    summary:
      "Your Trust Score determines your loan eligibility and interest rates. Here's how to build and maintain a strong score.",
    content:
      "Your Shohoj Rin Trust Score is calculated based on five key factors: repayment history (35%), financial capacity (25%)...",
  },
  {
    id: "ea-03",
    title: "Smart Repayment Strategies",
    category: "Repayment",
    readTime: "6 min",
    summary: "Practical strategies to manage your loan repayments effectively and avoid late fees.",
    content:
      "Managing loan repayments requires planning and discipline. Here are proven strategies used by successful borrowers...",
  },
  {
    id: "ea-04",
    title: "Building a Personal Budget",
    category: "Planning",
    readTime: "7 min",
    summary:
      "Create a realistic budget that accounts for loan repayments while meeting your daily needs.",
    content:
      "A well-structured budget is your best tool for financial health. Start by tracking your income and expenses for one month...",
  },
  {
    id: "ea-05",
    title: "Emergency Funds: Why and How",
    category: "Planning",
    readTime: "4 min",
    summary:
      "Learn why having an emergency fund matters and how to start building one even with limited income.",
    content:
      "An emergency fund is money set aside for unexpected expenses — medical bills, urgent repairs, or sudden job loss...",
  },
  {
    id: "ea-06",
    title: "Getting Help When You Can't Repay",
    category: "Support",
    readTime: "3 min",
    summary:
      "If you're struggling with repayments, don't wait. Here are the steps you can take and support available.",
    content:
      "Financial difficulties can happen to anyone. If you're struggling to make your loan repayments, the worst thing you can do is ignore the situation...",
  },
];
import type { PageName } from "../types";
import type { StoredUserProfile } from "../lib/session";
interface Props {
  onNavigate: (page: PageName) => void;
  user: StoredUserProfile | null;
}
const categories = ["All", "Basics", "Repayment", "Credit", "Planning", "Support"];
const glossary = [
  {
    term: "EMI",
    def: "Equated Monthly Instalment — the fixed amount you pay each month, covering part principal and part interest.",
  },
  {
    term: "APR",
    def: "Annual Percentage Rate — the yearly cost of a loan including interest, expressed as a percentage.",
  },
  { term: "Principal", def: "The original amount borrowed, before interest is added." },
  { term: "Tenure", def: "The total duration of the loan, usually stated in months." },
  {
    term: "Collateral",
    def: "An asset pledged as security for a loan, which the lender can claim if you default.",
  },
  { term: "Default", def: "Failing to repay a loan according to the agreed terms." },
  {
    term: "Grace period",
    def: "A set window after disbursement or a missed payment during which no penalty is charged.",
  },
];
const faqs = [
  {
    q: "How is my interest rate decided?",
    a: "Your rate depends on the loan product, requested amount, tenure, and your credit history. Shorter tenures and smaller amounts often carry lower rates.",
  },
  {
    q: "Can I repay my loan early?",
    a: "Most Shohoj Rin partner products allow early repayment. Check the specific loan\u2019s terms for any prepayment charges before applying.",
  },
  {
    q: "What happens if I miss a payment?",
    a: "A short grace period usually applies before a late fee. Contact your lender early — many offer restructuring options rather than default.",
  },
  {
    q: "Do I need collateral for every loan?",
    a: "No. Many personal, education, and emergency loans on Shohoj Rin are collateral-free, though larger business loans may require security.",
  },
];
export default function FinancialEducation({ onNavigate, user }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [amount, setAmount] = useState(150000);
  const [rate, setRate] = useState(10);
  const [months, setMonths] = useState(24);
  const filtered = useMemo(() => {
    return educationArticles.filter((a) => {
      const matchesCat = category === "All" || a.category === category;
      const matchesQuery =
        query.trim() === "" ||
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.summary.toLowerCase().includes(query.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [query, category]);
  const featured = educationArticles[0];
  const rest = filtered.filter((a) => a.id !== featured.id);
  const monthlyRate = rate / 12 / 100;
  const emi =
    monthlyRate === 0
      ? amount / Math.max(months, 1)
      : (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
  const totalRepayment = emi * months;
  const totalInterest = totalRepayment - amount;
  return (
    <div className="bg-offwhite min-h-screen">
      <Navbar onNavigate={onNavigate} user={user} />
      {}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pt-14 pb-12">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal mb-2">
            Financial education
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-navy leading-[1.1] mb-4">
            Understand money
            <br />
            <em className="not-italic text-teal">before you borrow it.</em>
          </h1>
          <p className="text-stone-500 leading-relaxed">
            Clear, jargon-free guides on interest, repayment, credit, and planning — written for
            first-time borrowers across Bangladesh.
          </p>
        </div>
      </section>
      {}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-5">
          <div className="w-full sm:max-w-xs">
            <SearchInput
              placeholder="Search articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery("")}
              aria-label="Search articles"
            />
          </div>
        </div>
        <Tabs
          variant="pill"
          tabs={categories.map((c) => ({ id: c, label: c }))}
          activeTab={category}
          onChange={setCategory}
        />
      </section>
      {}
      {category === "All" && query.trim() === "" && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 pb-10">
          <div className="bg-teal border-[1.5px] border-navy rounded-[8px] shadow-nb-lg p-6 md:p-8 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
            <span className="inline-flex px-2.5 py-1 rounded-[4px] bg-white text-teal text-xs font-semibold uppercase tracking-wide w-fit">
              Featured
            </span>
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold text-white mb-2">{featured.title}</h2>
              <p className="text-teal-light/90 leading-relaxed mb-4 max-w-xl">{featured.summary}</p>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigate("loan-marketplace")}
                >
                  Read guide
                </Button>
                <span className="text-xs text-white/80">{featured.readTime}</span>
              </div>
            </div>
          </div>
        </section>
      )}
      {}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16">
        {rest.length === 0 ? (
          <EmptyState
            icon={EmptyIcons.search}
            title="No articles found"
            description="Try a different search term or category."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((a) => (
              <div
                key={a.id}
                className="border-[1.5px] border-stone-200 rounded-[6px] p-5 bg-white hover:border-navy hover:shadow-nb-sm transition-all cursor-pointer flex flex-col min-w-0"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-teal-light text-teal px-2 py-0.5 rounded-[3px] font-medium border border-teal/20 shrink-0">
                    {a.category}
                  </span>
                  <span className="text-xs text-stone-400">{a.readTime}</span>
                </div>
                <h3 className="font-semibold text-navy text-sm mb-2">{a.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed line-clamp-2-sr">
                  {a.summary}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
      {}
      <section className="bg-white border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal mb-2">
              Try it yourself
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-navy mb-2">
              Loan cost calculator
            </h2>
            <p className="text-stone-500">
              See how amount, rate, and tenure change your monthly instalment.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-8 bg-offwhite border-[1.5px] border-navy rounded-[8px] shadow-nb p-6">
            <div className="flex flex-col gap-5 min-w-0">
              <TextInput
                label="Loan amount"
                type="number"
                min={1000}
                step={1000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                prefix="৳"
                className="tabular-nums"
              />
              <TextInput
                label="Interest rate (% p.a.)"
                type="number"
                min={0}
                step={0.25}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value) || 0)}
                className="tabular-nums"
              />
              <TextInput
                label="Tenure (months)"
                type="number"
                min={1}
                step={1}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value) || 1)}
                className="tabular-nums"
              />
            </div>
            <div className="flex flex-col gap-3 min-w-0">
              <div className="bg-white border-[1.5px] border-teal rounded-[6px] p-4">
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">
                  Monthly instalment (EMI)
                </p>
                <p className="font-display tabular-nums text-2xl font-semibold text-teal mt-1">
                  {formatTaka(Math.round(emi))}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-stone-200 rounded-[6px] p-4">
                  <p className="text-xs text-stone-500 font-medium">Total interest</p>
                  <p className="tabular-nums text-lg font-semibold text-navy mt-1">
                    {formatTaka(Math.round(totalInterest))}
                  </p>
                </div>
                <div className="bg-white border border-stone-200 rounded-[6px] p-4">
                  <p className="text-xs text-stone-500 font-medium">Total repayment</p>
                  <p className="tabular-nums text-lg font-semibold text-navy mt-1">
                    {formatTaka(Math.round(totalRepayment))}
                  </p>
                </div>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                Estimate only. Actual offers depend on the lender and your eligibility.
              </p>
            </div>
          </div>
        </div>
      </section>
      {}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal mb-2">
            Key terms
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-navy">Glossary</h2>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          {glossary.map((g) => (
            <div key={g.term} className="min-w-0 border-b border-stone-200 pb-4">
              <dt className="font-semibold text-navy text-sm mb-1">{g.term}</dt>
              <dd className="text-sm text-stone-500 leading-relaxed">{g.def}</dd>
            </div>
          ))}
        </dl>
      </section>
      {}
      <section className="bg-teal-light border-y border-teal/20">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-16">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal mb-2">
              Common questions
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-navy">FAQ</h2>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="group bg-white border-[1.5px] border-stone-200 rounded-[6px] open:border-navy transition-colors"
              >
                <summary className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer list-none">
                  <span className="text-sm font-medium text-navy min-w-0">{f.q}</span>
                  <span className="shrink-0 text-teal text-lg group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="px-4 pb-4 text-sm text-stone-500 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      {}
      <section className="bg-navy">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl text-white mb-3">
              Ready to put this into practice?
            </h2>
            <p className="text-stone-400 max-w-md leading-relaxed">
              Explore real loan products with transparent terms matched to your needs.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="shrink-0"
            onClick={() => onNavigate("loan-marketplace")}
          >
            Explore loans
          </Button>
        </div>
      </section>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
