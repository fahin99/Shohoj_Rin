/**
 * Interest calculation engine for reducing-balance amortization schedules.
 * Core financial math lives here — not in controllers or the frontend.
 */

export interface AmortizationScheduleItem {
  installmentNumber: number;
  dueDate: Date;
  principalAmount: number;
  interestAmount: number;
  totalInstallment: number;
  remainingBalance: number;
}

/**
 * Generate a reducing-balance EMI amortization schedule.
 *
 * @param principal       - Loan principal in taka
 * @param annualRatePct   - Annual interest rate as a percentage (e.g. 8.5 for 8.5%)
 * @param tenureMonths    - Loan tenure in months
 * @param startDate       - Disbursement / start date
 * @returns               - Array of monthly installment breakdowns
 */
export function calculateReducingBalanceSchedule(
  principal: number,
  annualRatePct: number,
  tenureMonths: number,
  startDate: Date = new Date(),
): AmortizationScheduleItem[] {
  const monthlyRate = annualRatePct / 100 / 12;

  // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const emi =
    monthlyRate === 0
      ? principal / tenureMonths
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  let currentBalance = principal;
  const schedule: AmortizationScheduleItem[] = [];

  for (let i = 1; i <= tenureMonths; i++) {
    const interestForMonth = currentBalance * monthlyRate;
    const principalForMonth = emi - interestForMonth;
    currentBalance = Math.max(0, currentBalance - principalForMonth);

    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    schedule.push({
      installmentNumber: i,
      dueDate,
      principalAmount: Math.round(principalForMonth * 100) / 100,
      interestAmount: Math.round(interestForMonth * 100) / 100,
      totalInstallment: Math.round(emi * 100) / 100,
      remainingBalance: Math.round(currentBalance * 100) / 100,
    });
  }

  return schedule;
}

/**
 * Calculate daily interest accrual on a given balance.
 */
export function calculateDailyInterest(balance: number, annualRatePct: number): number {
  return Math.round((balance * (annualRatePct / 100) / 365) * 100) / 100;
}

/**
 * Calculate late fee based on overdue amount and days late.
 */
export function calculateLateFee(
  overdueAmount: number,
  daysLate: number,
  lateFeeRatePct: number = 2,
): number {
  if (daysLate <= 0) return 0;
  return Math.round(overdueAmount * (lateFeeRatePct / 100) * 100) / 100;
}
