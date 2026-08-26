import { useSyncExternalStore } from "react";
import type {
  ActiveLoan,
  AppStatus,
  LoanProduct,
  RepaymentScheduleRow,
  Transaction,
} from "../types";
import { loanProducts } from "./mock-data";

export interface StoredApplication {
  id: string;
  product: string;
  provider: string;
  amount: number;
  durationMonths: number;
  interestRate: number;
  monthlyPayment: number;
  purpose: string;
  phone: string;
  employment: string;
  monthlyIncome: number;
  submitted: string;
  status: AppStatus;
  stage: number;
}

interface LoanStoreData {
  applications: StoredApplication[];
  activeLoan: ActiveLoan | null;
  repaymentSchedule: RepaymentScheduleRow[];
  transactions: Transaction[];
}

const STORAGE_KEY = "shohojrin_loan_store_v1";

const initialStore: LoanStoreData = {
  applications: [],
  activeLoan: null,
  repaymentSchedule: [],
  transactions: [],
};

let storeState: LoanStoreData = { ...initialStore };
const listeners = new Set<() => void>();

function calculateEmi(principal: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 12 / 100;
  if (!principal || !months) return 0;
  if (monthlyRate === 0) return Math.round(principal / months);
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(emi);
}

function generateSchedule(
  principal: number,
  annualRate: number,
  durationMonths: number,
  paidMonths = 0,
): RepaymentScheduleRow[] {
  const emi = calculateEmi(principal, annualRate, durationMonths);
  const monthlyRate = annualRate / 12 / 100;
  let balance = principal;
  const schedule: RepaymentScheduleRow[] = [];
  const today = new Date();

  for (let m = 1; m <= durationMonths; m++) {
    const dueDate = new Date(today);
    dueDate.setMonth(today.getMonth() + m);

    const interest = Math.round(balance * monthlyRate);
    const principalPortion = Math.min(balance, emi - interest);
    balance = Math.max(0, balance - principalPortion);

    let status: RepaymentScheduleRow["status"] = "upcoming";
    if (m <= paidMonths) {
      status = "paid";
    } else if (m === paidMonths + 1) {
      status = "due";
    }

    schedule.push({
      month: m,
      dueDate: dueDate.toISOString().split("T")[0] ?? "",
      principal: principalPortion,
      interest: interest,
      total: emi,
      status,
    });
  }

  return schedule;
}

function loadStore(): LoanStoreData {
  if (typeof window === "undefined") {
    return initialStore;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LoanStoreData;
      return {
        applications: Array.isArray(parsed.applications) ? parsed.applications : [],
        activeLoan: parsed.activeLoan ?? null,
        repaymentSchedule: Array.isArray(parsed.repaymentSchedule) ? parsed.repaymentSchedule : [],
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      };
    }
  } catch {
    // fallback to initial
  }
  return initialStore;
}

function saveStore(next: LoanStoreData) {
  storeState = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage quota error
    }
  }
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  storeState = loadStore();
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      storeState = loadStore();
      listeners.forEach((l) => l());
    }
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): LoanStoreData {
  return storeState;
}

function getServerSnapshot(): LoanStoreData {
  return initialStore;
}

export function useLoanStore(): LoanStoreData {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useApplications(): StoredApplication[] {
  const store = useLoanStore();
  return store.applications;
}

export function useActiveLoan(): ActiveLoan | null {
  const store = useLoanStore();
  return store.activeLoan;
}

export function useRepaymentSchedule(): RepaymentScheduleRow[] {
  const store = useLoanStore();
  return store.repaymentSchedule;
}

export function useTransactions(): Transaction[] {
  const store = useLoanStore();
  return store.transactions;
}

export function createApplication(input: {
  loanId: string;
  amount: number;
  duration: string | number;
  purpose: string;
  phone: string;
  employment: string;
  monthlyIncome: number;
}): StoredApplication {
  const product: LoanProduct =
    loanProducts.find((l) => l.id === input.loanId) ?? loanProducts[0] ?? ({} as LoanProduct);
  const durationMonths = Number(input.duration) || product.durationMonths || 24;
  const interestRate = product.interestRate || 10;
  const monthlyPayment = calculateEmi(input.amount, interestRate, durationMonths);

  const newApp: StoredApplication = {
    id: `APP-${Math.floor(1000 + Math.random() * 9000)}`,
    product: product.name || "General Loan",
    provider: product.provider || "Shohoj Rin Partner",
    amount: input.amount,
    durationMonths,
    interestRate,
    monthlyPayment,
    purpose: input.purpose,
    phone: input.phone,
    employment: input.employment,
    monthlyIncome: input.monthlyIncome,
    submitted: new Date().toISOString().split("T")[0] ?? "",
    status: "under-review",
    stage: 2,
  };

  const current = getSnapshot();
  const next: LoanStoreData = {
    ...current,
    applications: [newApp, ...current.applications.filter((a) => a.id !== newApp.id)],
  };
  saveStore(next);
  return newApp;
}

export function verifyApplication(appId: string): ActiveLoan | null {
  const current = getSnapshot();
  const app = current.applications.find((a) => a.id === appId);
  if (!app) return null;

  const totalRepayable = app.monthlyPayment * app.durationMonths;
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);

  const activeLoan: ActiveLoan = {
    id: `SR-${today.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    name: app.product,
    provider: app.provider,
    principal: app.amount,
    interestRate: app.interestRate,
    durationMonths: app.durationMonths,
    paidMonths: 0,
    totalRepayable,
    amountRepaid: 0,
    remainingBalance: totalRepayable,
    interestPaid: 0,
    feesPaid: 0,
    monthlyPayment: app.monthlyPayment,
    nextPaymentDate: nextMonth.toISOString().split("T")[0] ?? "",
  };

  const schedule = generateSchedule(app.amount, app.interestRate, app.durationMonths, 0);

  const disbursementTx: Transaction = {
    id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
    date: today.toISOString().split("T")[0] ?? "",
    description: `Loan disbursement for ${app.product}`,
    amount: app.amount,
    type: "disbursement",
    status: "completed",
  };

  const nextApps = current.applications.map((a) =>
    a.id === appId ? { ...a, status: "disbursed" as AppStatus, stage: 4 } : a,
  );

  const next: LoanStoreData = {
    ...current,
    applications: nextApps,
    activeLoan,
    repaymentSchedule: schedule,
    transactions: [disbursementTx, ...current.transactions],
  };

  saveStore(next);
  return activeLoan;
}

export function recordRepayment(
  amount: number,
  method: string,
): { success: boolean; closed: boolean; receiptId: string } {
  const current = getSnapshot();
  if (!current.activeLoan) {
    return { success: false, closed: false, receiptId: "" };
  }

  const loan = current.activeLoan;
  const newRepaid = loan.amountRepaid + amount;
  const newBalance = Math.max(0, loan.remainingBalance - amount);
  const isClosed = newBalance === 0;

  const paidMonths = Math.min(
    loan.durationMonths,
    Math.max(
      loan.paidMonths,
      isClosed ? loan.durationMonths : Math.floor(newRepaid / loan.monthlyPayment),
    ),
  );

  const updatedSchedule = current.repaymentSchedule.map((row) => {
    if (row.month <= paidMonths) {
      return { ...row, status: "paid" as const };
    }
    if (row.month === paidMonths + 1 && !isClosed) {
      return { ...row, status: "due" as const };
    }
    return { ...row, status: "upcoming" as const };
  });

  const receiptId = `RCPT-${Math.floor(100000 + Math.random() * 900000)}`;
  const today = new Date().toISOString().split("T")[0] ?? "";

  const tx: Transaction = {
    id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
    date: today,
    description: `Instalment repayment via ${method.toUpperCase()} (${receiptId})`,
    amount,
    type: "repayment",
    status: "completed",
  };

  const nextLoan: ActiveLoan | null = isClosed
    ? null
    : {
        ...loan,
        amountRepaid: newRepaid,
        remainingBalance: newBalance,
        paidMonths,
      };

  const next: LoanStoreData = {
    ...current,
    activeLoan: nextLoan,
    repaymentSchedule: updatedSchedule,
    transactions: [tx, ...current.transactions],
  };

  saveStore(next);
  return { success: true, closed: isClosed, receiptId };
}
