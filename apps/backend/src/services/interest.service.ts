export interface AmortizationScheduleItem {
  installmentNumber: number;
  dueDate: Date;
  principalAmount: number;
  interestAmount: number;
  totalInstallment: number;
  remainingBalance: number;
}

export function calculateReducingBalanceSchedule(
  principal: number,
  annualRatePct: number,
  tenureMonths: number,
  startDate: Date = new Date(),
): AmortizationScheduleItem[] {
  const monthlyRate = annualRatePct / 100 / 12;

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

export function calculateDailyInterest(balance: number, annualRatePct: number): number {
  return Math.round(((balance * (annualRatePct / 100)) / 365) * 100) / 100;
}

export function calculateLateFee(
  overdueAmount: number,
  daysLate: number,
  lateFeeRatePct: number = 2,
): number {
  if (daysLate <= 0) return 0;
  return Math.round(overdueAmount * (lateFeeRatePct / 100) * 100) / 100;
}