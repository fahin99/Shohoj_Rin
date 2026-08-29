import { Badge } from "./Badge";
import { Button } from "./Button";
import { formatPercent, formatTaka } from "../lib/format";
import type { LoanProduct } from "../types";
const categoryLabel: Record<LoanProduct["category"], string> = {
  education: "Education",
  emergency: "Emergency",
  business: "Small business",
  personal: "Personal",
  development: "Development",
};
const categoryTone: Record<
  LoanProduct["category"],
  "info" | "error" | "warning" | "neutral" | "success"
> = {
  education: "info",
  emergency: "error",
  business: "warning",
  personal: "neutral",
  development: "success",
};
interface LoanCardProps {
  loan: LoanProduct;
  onView: () => void;
  onApply: () => void;
}
export function LoanCard({ loan, onView, onApply }: LoanCardProps) {
  return (
    <article className="flex min-w-0 flex-col rounded-[8px] border-[1.5px] border-stone-200 bg-white transition-shadow hover:border-navy hover:shadow-nb-sm">
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={categoryTone[loan.category]} size="sm">
            {categoryLabel[loan.category]}
          </Badge>
          {loan.tags.slice(0, 1).map((t) => (
            <Badge key={t} variant="neutral" size="sm">
              {t}
            </Badge>
          ))}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-snug text-navy">{loan.name}</h3>
          <p className="mt-0.5 truncate text-xs text-stone-500">{loan.provider}</p>
        </div>
        <p className="line-clamp-2-sr text-sm leading-relaxed text-stone-500">{loan.description}</p>
        <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-stone-200 pt-3 sm:grid-cols-3">
          <div className="min-w-0">
            <dt className="text-xs text-stone-500">Interest</dt>
            <dd className="tabular-nums text-sm font-semibold text-navy">
              {formatPercent(loan.interestRate)}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-stone-500">Up to</dt>
            <dd className="font-display tabular-nums text-sm font-semibold text-navy">
              {formatTaka(loan.maxAmount)}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-stone-500">Tenure</dt>
            <dd className="tabular-nums text-sm font-semibold text-navy">
              {loan.durationMonths} mo
            </dd>
          </div>
        </dl>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-stone-200 p-3 sm:p-4">
        <Button variant="secondary" size="sm" onClick={onView} className="flex-1">
          View details
        </Button>
        <Button variant="primary" size="sm" onClick={onApply} className="flex-1">
          Apply
        </Button>
      </div>
    </article>
  );
}
