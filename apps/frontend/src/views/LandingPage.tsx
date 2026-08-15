import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import type { PageName } from '../types';

interface LandingPageProps {
  onNavigate: (page: PageName) => void;
}

const loanCategories = [
  {
    name: 'Education',
    emoji: '📚',
    desc: 'Study now, pay as you earn. Flexible plans for tuition, books, and living costs.',
    rate: 'From 8% p.a.',
    amount: 'Up to ৳5,00,000',
    color: 'bg-sky-light border-sky/30',
    accent: 'text-sky',
  },
  {
    name: 'Emergency',
    emoji: '⛑',
    desc: 'Quick access when it matters most. Medical, urgent repairs, and critical expenses.',
    rate: 'From 10% p.a.',
    amount: 'Up to ৳2,00,000',
    color: 'bg-coral-light border-coral/30',
    accent: 'text-coral',
  },
  {
    name: 'Small Business',
    emoji: '🏪',
    desc: 'Grow your business with accessible working capital and equipment financing.',
    rate: 'From 12% p.a.',
    amount: 'Up to ৳15,00,000',
    color: 'bg-yellow-light border-yellow/30',
    accent: 'text-stone-700',
  },
  {
    name: 'Personal Development',
    emoji: '🌱',
    desc: 'Invest in yourself. Skills training, professional courses, and career advancement.',
    rate: 'From 9% p.a.',
    amount: 'Up to ৳1,00,000',
    color: 'bg-emerald-light border-emerald/30',
    accent: 'text-emerald',
  },
];

const howItWorks = [
  { step: '01', title: 'Explore', desc: 'Browse loan products matched to your profile and financial goals. Compare rates, terms, and eligibility clearly.' },
  { step: '02', title: 'Understand', desc: 'Every loan comes with plain-language explanations. Know exactly what you will repay before you apply.' },
  { step: '03', title: 'Apply', desc: 'A simple multi-step application with no confusing jargon. Upload documents, review, and submit in minutes.' },
  { step: '04', title: 'Manage', desc: 'Track your repayments, get reminders, and access your full loan history from one clear dashboard.' },
];

const trustPoints = [
  { icon: '◉', title: 'Transparent Terms', desc: 'Every fee, rate, and condition is clearly stated before you apply. No surprises.' },
  { icon: '⊡', title: 'Secure Data', desc: 'Bank-grade encryption protects your personal and financial information at all times.' },
  { icon: '◈', title: 'Clear Repayments', desc: 'See your full repayment schedule upfront. Know every due date and amount.' },
  { icon: '⊙', title: 'No Hidden Charges', desc: 'What you see is what you pay. Processing fees and costs are declared up front.' },
];

const literacyCards = [
  { title: 'Understanding Interest Rates', tag: 'Basics', read: '4 min read', desc: 'Learn how simple and compound interest affect your total repayment amount.' },
  { title: 'How Loan Repayment Works', tag: 'Repayment', read: '5 min read', desc: 'Understand EMIs, amortisation, and how your payments are split between principal and interest.' },
  { title: 'What Affects Your Loan Cost', tag: 'Credit', read: '3 min read', desc: 'Duration, amount, credit history — see which factors influence the rate you receive.' },
];

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="bg-offwhite min-h-screen">
      <Navbar onNavigate={onNavigate} />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-light border border-teal/30 rounded-[4px] text-xs font-medium text-teal mb-6">
            <span className="w-1.5 h-1.5 bg-teal rounded-full" />
            Trusted by 50,000+ users across Bangladesh
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-navy leading-[1.1] mb-5">
            Finance made<br />
            <em className="not-italic text-teal">simpler.</em>
          </h1>
          <p className="text-lg text-stone-500 leading-relaxed max-w-lg mb-8">
            Discover loans that fit your life, understand every term clearly, and manage your repayments without stress. Shohoj Rin is built for first-time borrowers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="primary" size="lg" onClick={() => onNavigate('auth')}>
              Start Exploring Loans
            </Button>
            <Button variant="secondary" size="lg" onClick={() => onNavigate('education')}>
              Learn About Borrowing
            </Button>
          </div>
          <div className="flex items-center gap-6 mt-8 pt-8 border-t border-stone-200">
            {[['৳240 Cr+', 'Loans facilitated'], ['50K+', 'Active borrowers'], ['98%', 'Repayment rate']].map(([val, label]) => (
              <div key={label}>
                <p className="font-display tabular-nums text-xl font-semibold text-navy">{val}</p>
                <p className="text-xs text-stone-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual: floating loan card */}
        <div className="relative lg:flex justify-end hidden">
          <div className="relative w-full max-w-sm">
            {/* Background decorative block */}
            <div className="absolute -bottom-4 -right-4 w-full h-full bg-teal-light border-[1.5px] border-teal/30 rounded-[8px]" />
            {/* Main card */}
            <div className="relative bg-white border-[1.5px] border-navy rounded-[8px] shadow-nb-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">Education Loan</p>
                  <p className="font-display tabular-nums text-xl font-semibold text-navy mt-0.5">৳2,00,000</p>
                </div>
                <span className="px-2 py-1 bg-emerald-light text-emerald text-xs font-medium rounded-[4px] border border-emerald/30">Approved</span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Interest rate</span>
                  <span className="tabular-nums font-medium text-navy">8.5% p.a.</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Monthly payment</span>
                  <span className="tabular-nums font-medium text-navy">৳4,500</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Duration</span>
                  <span className="font-medium text-navy">48 months</span>
                </div>
              </div>
              <div className="bg-stone-50 border border-stone-200 rounded-[4px] p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-stone-500">Repayment progress</span>
                  <span className="text-xs tabular-nums text-navy">14 / 48 months</span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div className="h-full bg-teal rounded-full" style={{ width: '29%' }} />
                </div>
                <p className="text-xs text-stone-400 mt-1.5">Next payment: Dec 15, 2025</p>
              </div>
            </div>
            {/* Small floating secondary card */}
            <div className="absolute -top-6 -left-10 bg-white border-[1.5px] border-navy rounded-[6px] shadow-nb p-3 w-40">
              <p className="text-xs text-stone-500">Total repaid</p>
              <p className="font-display tabular-nums text-base font-semibold text-navy">৳63,000</p>
              <p className="text-xs text-emerald mt-0.5">↑ On track</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-teal-light border-y border-teal/20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal mb-2">Simple by design</p>
            <h2 className="font-display text-4xl text-navy">How Shohoj Rin works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item) => (
              <div key={item.step} className="bg-white border-[1.5px] border-navy rounded-[6px] shadow-nb p-5">
                <p className="font-display tabular-nums text-3xl font-medium text-stone-200 mb-3">{item.step}</p>
                <h3 className="text-base font-semibold text-navy mb-2">{item.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loan categories */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal mb-2">What we offer</p>
            <h2 className="font-display text-4xl text-navy">Loan categories</h2>
          </div>
          <Button variant="tertiary" size="sm" onClick={() => onNavigate('loan-marketplace')}>
            View all loans →
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loanCategories.map((cat) => (
            <div
              key={cat.name}
              className={`border-[1.5px] rounded-[6px] shadow-nb-sm p-5 flex flex-col gap-3 cursor-pointer hover:shadow-nb transition-shadow ${cat.color}`}
              onClick={() => onNavigate('loan-marketplace')}
            >
              <div className="text-2xl">{cat.emoji}</div>
              <div>
                <h3 className="font-semibold text-navy text-base">{cat.name}</h3>
                <p className="text-sm text-stone-500 mt-1 leading-relaxed">{cat.desc}</p>
              </div>
              <div className="mt-auto pt-3 border-t border-stone-200/60 flex items-center justify-between">
                <span className={`text-xs font-medium tabular-nums ${cat.accent}`}>{cat.rate}</span>
                <span className="text-xs text-stone-500">{cat.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Financial literacy */}
      <section id="education" className="bg-white border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-teal mb-2">Build your knowledge</p>
              <h2 className="font-display text-4xl text-navy">Financial education</h2>
              <p className="text-stone-500 mt-2 max-w-lg">
                Understanding money should come before borrowing it. Our guides make financial concepts approachable.
              </p>
            </div>
            <Button variant="tertiary" size="sm" onClick={() => onNavigate('education')}>
              All articles →
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {literacyCards.map((card, i) => (
              <div
                key={i}
                className="border-[1.5px] border-stone-200 rounded-[6px] p-5 hover:border-navy hover:shadow-nb-sm transition-all cursor-pointer bg-offwhite"
                onClick={() => onNavigate('education')}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-teal-light text-teal px-2 py-0.5 rounded-[3px] font-medium border border-teal/20">{card.tag}</span>
                  <span className="text-xs text-stone-400">{card.read}</span>
                </div>
                <h3 className="font-semibold text-navy text-sm mb-2">{card.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal mb-2">Why Shohoj Rin</p>
          <h2 className="font-display text-4xl text-navy mb-3">Built on trust</h2>
          <p className="text-stone-500 max-w-lg mx-auto">
            We designed every part of this platform so you always know exactly where you stand financially.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {trustPoints.map((tp, i) => (
            <div key={i} className="flex gap-4 p-5 bg-white border-[1.5px] border-stone-200 rounded-[6px] hover:border-navy transition-colors">
              <div className="w-10 h-10 shrink-0 rounded-[6px] bg-teal-light border border-teal/20 flex items-center justify-center text-teal text-lg font-mono">
                {tp.icon}
              </div>
              <div>
                <h3 className="font-semibold text-navy text-sm mb-1">{tp.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{tp.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-navy">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-display text-4xl text-white mb-3">
              Ready to take<br />control of your finances?
            </h2>
            <p className="text-stone-400 max-w-md leading-relaxed">
              Join over 50,000 people who have used Shohoj Rin to find the right loan and manage their repayments clearly.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button variant="primary" size="lg" onClick={() => onNavigate('auth')}>
              Create free account
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="border-stone-500 text-white hover:bg-stone-700 bg-transparent"
              onClick={() => onNavigate('loan-marketplace')}
            >
              Explore loans first
            </Button>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
