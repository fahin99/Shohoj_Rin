import { pool, closePool } from "../lib/db.js";
import { seedLoanProducts } from "./seed-loan-products.js";

const api_base = process.env.SHOHOJRIN_API_BASE ?? "http://localhost:5000/api/v1";
const PASSWORD = process.env.SHOHOJRIN_TEST_PASSWORD ?? "DevPass123!";
const ADMIN_EMAIL = process.env.admin_email ?? "admin@admin.com";
const ADMIN_PASSWORD = process.env.admin_password ?? "admin000";
const TEST_EMAIL_DOMAIN = "wf-test.local";
const RUN_TAG =
  process.env.SHOHOJRIN_TEST_RUN ??
  `r${Date.now().toString(36)}${Math.floor(Math.random() * 46656).toString(36)}`;

interface StepResult {
  ok: boolean;
  detail: string;
}

interface BorrowerDef {
  key: string;
  username: string;
  name: string;
  purpose: string;
  amount: number;
}

interface LenderDef {
  key: string;
  username: string;
  name: string;
  categories: string[];
}

const report: Record<string, StepResult> = {};
const failedSteps: string[] = [];

function check(label: string, ok: boolean, detail: string) {
  report[label] = { ok, detail };
  console.log(`  ${ok ? "✅" : "❌"} ${label}: ${detail}`);
  if (!ok) failedSteps.push(label);
}

function info(label: string, detail: string) {
  console.log(`  ℹ️  ${label}: ${detail}`);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function defaultPhone(seed: string): string {
  return `017${String(hashString(seed)).slice(-9).padStart(9, "0")}`;
}

interface ApiResult {
  status: number;
  payload: any;
  headers: Headers;
}

interface CallOpts {
  method?: string;
  token?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function api(path: string, opts: CallOpts = {}): Promise<ApiResult> {
  const headers: Record<string, string> = { ...(opts.headers ?? {}) };
  let body: string | undefined;
  if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;
  const res = await fetch(`${api_base}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body,
  });
  const text = await res.text();
  let payload: any = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }
  return { status: res.status, payload, headers: res.headers };
}

async function call(
  path: string,
  opts: CallOpts,
  expected: number[],
  label: string,
): Promise<any> {
  const result = await api(path, opts);
  if (!expected.includes(result.status)) {
    throw new Error(
      `${label}: expected HTTP ${expected.join("/")}, got ${result.status} — ${
        result.payload?.error?.message ?? JSON.stringify(result.payload).slice(0, 400)
      }`,
    );
  }
  return result.payload.data;
}

function extractToken(headers: Headers): string {
  const setCookie = (headers as any).getSetCookie?.() ?? [];
  for (const raw of setCookie) {
    const match = raw.match(/^shohojrin_access_token=([^;]+)/);
    if (match) return match[1];
  }
  throw new Error("Access token not found in response cookies");
}

async function registerUser(username: string, role: "borrower" | "lender") {
  const email = `${username}@${TEST_EMAIL_DOMAIN}`;
  const result = await api("/auth/register", {
    method: "POST",
    body: {
      username,
      email,
      phone: defaultPhone(username),
      password: PASSWORD,
      role,
    },
  });
  if (result.status !== 201) {
    throw new Error(
      `register ${username} failed (${result.status}): ${
        result.payload?.error?.message ?? JSON.stringify(result.payload).slice(0, 300)
      }`,
    );
  }
  return {
    userId: result.payload.data.user.userId as string,
    email,
    token: extractToken(result.headers),
  };
}

async function loginUser(email: string) {
  const result = await api("/auth/login", {
    method: "POST",
    body: { identifier: email, password: PASSWORD },
  });
  if (result.status !== 200) {
    throw new Error(
      `login ${email} failed (${result.status}): ${
        result.payload?.error?.message ?? JSON.stringify(result.payload).slice(0, 300)
      }`,
    );
  }
  return {
    userId: result.payload.data.user.userId as string,
    token: extractToken(result.headers),
  };
}
async function loginAdmin() {
  if (!ADMIN_EMAIL) {
    throw new Error("admin_email is required");
  }

  if (!ADMIN_PASSWORD) {
    throw new Error("admin_password is required");
  }

  const result = await api("/auth/login", {
    method: "POST",
    body: {
      identifier: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    },
  });

  if (result.status !== 200) {
    throw new Error(
      `admin login failed (${result.status}): ${
        result.payload?.error?.message ??
        JSON.stringify(result.payload).slice(0, 300)
      }`,
    );
  }

  const user = result.payload.data.user;

  if (user.role !== "admin") {
    throw new Error(
      `Configured admin account ${ADMIN_EMAIL} has role '${user.role}', not 'admin'`,
    );
  }

  return {
    email: ADMIN_EMAIL,
    userId: user.userId as string,
    token: extractToken(result.headers),
  };
}

async function updateProfile(token: string, data: Record<string, unknown>) {
  return call("/profile", { method: "PUT", token, body: data }, [200], "update profile");
}

async function updateInvestorProfile(token: string, data: Record<string, unknown>) {
  return call("/investor/profile", { method: "PUT", token, body: data }, [200], "update investor profile");
}

async function recalcTrustScore(token: string) {
  return call("/trust-score/recalculate", { method: "POST", token }, [200], "recalculate trust score");
}

async function waitForBackend(maxMs = 30000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(`${api_base}/health`);
      if (res.ok) return;
    } catch {
      // backend not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Backend at ${api_base} is not reachable after ${maxMs}ms`);
}

async function ensureLoanProducts() {
  const res = await api("/loan-products?limit=1");
  const total = res.payload?.data?.total ?? 0;
  if (total > 0) {
    console.log(`  ℹ️  Loan products already present (${total})`);
    return;
  }
  console.log("  🌱 Seeding loan products...");
  await seedLoanProducts();
  console.log("  ✅ Loan products seeded");
}

async function getProducts() {
  const data = await call("/loan-products?limit=50", {}, [200], "list loan products");
  return (data.products ?? []) as any[];
}

// ── PostgreSQL verification helpers ──
async function dbRows(text: string, params: any[] = []): Promise<Record<string, any>[]> {
  const result = await pool.query(text, params);
  return result.rows as Record<string, any>[];
}

async function dbCount(text: string, params: any[] = []): Promise<number> {
  const rows = await dbRows(text, params);
  return Number(rows[0]?.count ?? 0);
}async function createApplication(token: string, productId: string, requestedAmount: number, purpose: string, purposeDescription: string) {
  return call(
    "/applications",
    { method: "POST", token, body: { requestedAmount, purpose, purposeDescription, productId } },
    [201],
    "create application",
  );
}

async function getApplications(token: string) {
  return call("/applications", { token }, [200], "list applications");
}

async function getApplication(token: string, applicationId: string) {
  return call(`/applications/${applicationId}`, { token }, [200], "get application");
}

async function getOpportunities(token: string) {
  return call("/investor/opportunities?limit=50", { token }, [200], "list opportunities");
}

async function fundOpportunity(token: string, applicationId: string, amount: number) {
  return call(
    `/investor/fund/${applicationId}`,
    { method: "POST", token, body: { amount } },
    [200],
    "fund opportunity",
  );
}

async function getPortfolio(token: string) {
  return call("/investor/portfolio", { token }, [200], "get portfolio");
}

async function getLoans(token: string) {
  return call("/loans?limit=50", { token }, [200], "list loans");
}

async function getLoan(token: string, loanId: string) {
  return call(`/loans/${loanId}`, { token }, [200], "get loan");
}

async function getLoanTransactions(token: string, loanId: string) {
  return call(`/loans/${loanId}/transactions`, { token }, [200], "get loan transactions");
}

async function createLoan(token: string, applicationId: string) {
  return call("/loans", { method: "POST", token, body: { applicationId } }, [201], "create loan");
}

async function createDisbursement(token: string, loanId: string, amount: number) {
  return call(
    "/loan-disbursements",
    {
      method: "POST",
      token,
      body: { loanId, amount, disbursementMethod: "bank_transfer", referenceNumber: `DISB-${RUN_TAG}` },
    },
    [201],
    "record disbursement",
  );
}

async function createRepaymentSchedules(token: string, loanId: string) {
  return call("/repayment-schedules", { method: "POST", token, body: { loanId } }, [201], "generate repayment schedules");
}

async function getRepaymentSchedules(token: string, loanId: string) {
  return call(`/repayments/loans/${loanId}/schedules`, { token }, [200], "get repayment schedules");
}

async function recordRepayment(token: string, scheduleId: string, amountPaid: number) {
  return call(
    "/repayments/payments",
    {
      method: "POST",
      token,
      body: { scheduleId, amountPaid, paymentMethod: "bank_transfer", status: "completed" },
    },
    [201],
    "record repayment",
  );
}

async function adminReviewApplication(token: string, applicationId: string, decision: "approved" | "rejected") {
  return call(
    `/admin/applications/${applicationId}/review`,
    { method: "PUT", token, body: { decision } },
    [200],
    `admin ${decision} review`,
  );
}

interface WorkflowContext {
  products: any[];
  admin: { email: string; userId: string; token: string } | null;
  lenders: Record<string, { username: string; userId: string; token: string }>;
  borrowers: Record<string, { username: string; userId: string; token: string }>;
  applications: Record<string, { applicationId: string; borrowerKey: string; purpose: string; amount: number }>;
  loanId: string;
  disbursementId: string;
  repaymentId: string;
  firstSchedule: any;
}

async function runStage(name: string, fn: () => Promise<void>) {
  console.log(`\n ${name}`);
  try {
    await fn();
  } catch (err: any) {
    console.log(`  ❌ Stage failed: ${err.message}`);
    report[name] = { ok: false, detail: err.message };
    failedSteps.push(name);
  }
}async function main() {
  console.log("\n🚀 ShohojRin End-to-End Workflow Automation");
  console.log(`   Run tag: ${RUN_TAG}  |  API: ${api_base}\n`);

  const ctx: WorkflowContext = {
    products: [],
    admin: null,
    lenders: {},
    borrowers: {},
    applications: {},
    loanId: "",
    disbursementId: "",
    repaymentId: "",
    firstSchedule: null,
  };

  try {
    await runStage("Backend health & loan products", async () => {
      await waitForBackend();
      console.log("  ✅ Backend reachable");
      await ensureLoanProducts();
      ctx.products = await getProducts();
      if (ctx.products.length === 0) throw new Error("No loan products available after ensure");
      console.log(`  ✅ Loaded ${ctx.products.length} loan products`);
    });
    await runStage("Login admin", async () => {
      ctx.admin = await loginAdmin();
      console.log(`  ✅ Admin ${ctx.admin.email} (${ctx.admin.userId}) — login completed`);
    });

    const productByCategory = () => new Map(ctx.products.map((p: any) => [p.category, p]));

    await runStage("Register lenders + complete investor profiles", async () => {
      const defs: LenderDef[] = [
        { key: "la1", username: `wf_${RUN_TAG}_la1`, name: "Alpha Investments", categories: ["education", "development"] },
        { key: "la2", username: `wf_${RUN_TAG}_la2`, name: "Omega Capital", categories: ["education", "development"] },
        { key: "lb", username: `wf_${RUN_TAG}_lb`, name: "Beta Microfinance", categories: ["business", "personal"] },
      ];
      for (const def of defs) {
        const reg = await registerUser(def.username, "lender");
        ctx.lenders[def.key] = { username: def.username, userId: reg.userId, token: reg.token };
        await updateInvestorProfile(reg.token, {
          displayName: def.name,
          fundingCapacity: 5000000,
          preferredCategories: def.categories,
          riskPreference: "moderate",
          maxExposure: 3000000,
          companyName: `${def.name} Ltd`,
          companyAddress: "10 Gulshan Avenue, Dhaka",
          companyBranch: "Gulshan",
          companyGoal: "Inclusive microfinance growth",
        });
        console.log(`  ✅ Lender ${def.username} (${reg.userId}) — investor profile completed, prefers ${def.categories.join(", ")}`);
      }
    });

    await runStage("Register borrowers + complete profiles + trust scores", async () => {
      const defs: BorrowerDef[] = [
        { key: "ba", username: `wf_${RUN_TAG}_ba`, name: "Anika Rahman", purpose: "education", amount: 180000 },
        { key: "bb", username: `wf_${RUN_TAG}_bb`, name: "Bakhtiar Hossain", purpose: "business", amount: 200000 },
      ];
      for (const def of defs) {
        const reg = await registerUser(def.username, "borrower");
        ctx.borrowers[def.key] = { username: def.username, userId: reg.userId, token: reg.token };
        await updateProfile(reg.token, {
          fullName: def.name,
          dateOfBirth: "1995-01-01",
          gender: "other",
          city: "Dhaka",
          district: "Dhaka",
          occupation: "Service Holder",
          monthlyFamilyIncome: 80000,
          employmentType: "full_time",
          employerName: "Dev Corp Ltd",
          monthlyIncome: 60000,
          incomeSource: "salary",
          nidNumber: `200${String(hashString(def.username)).slice(-8).padStart(8, "0")}`,
          addressLine: "22 Dhanmondi, Dhaka",
          postalCode: "1205",
        });
        await recalcTrustScore(reg.token);
        const tsRows = await dbRows(
          `SELECT score_id, score, is_current FROM trust_scores WHERE user_id = $1 ORDER BY calculated_at DESC`,
          [reg.userId],
        );
        const ok = tsRows.length > 0 && tsRows.some((r) => r.is_current);
        check(`trust_${def.key}_db`, ok, `trust score persisted & current (${tsRows.length} row(s))`);
        console.log(`  ✅ Borrower ${def.username} (${reg.userId}) — profile completed, trust score recalculated`);
      }
    });

    await runStage("Submit loan applications via POST /applications", async () => {
      const byCat = productByCategory();
      const eduProduct = byCat.get("education");
      const bizProduct = byCat.get("business");
      if (!eduProduct || !bizProduct) throw new Error("Missing loan product for education/business purpose");
      const ba = ctx.borrowers.ba;
      const bb = ctx.borrowers.bb;
      const appA = await createApplication(ba.token, eduProduct.id, 180000, "education", "Higher education tuition support");
      const appB1 = await createApplication(bb.token, bizProduct.id, 200000, "business", "Working capital for retail business");
      ctx.applications.appA = { applicationId: appA.applicationId, borrowerKey: "ba", purpose: "education", amount: 180000 };
      ctx.applications.appB1 = { applicationId: appB1.applicationId, borrowerKey: "bb", purpose: "business", amount: 200000 };
      const dbAppA = await dbRows(`SELECT status FROM loan_applications WHERE application_id = $1`, [appA.applicationId]);
      check("application_in_db_submitted", dbAppA[0]?.status === "submitted", `application persisted in PostgreSQL (status=${dbAppA[0]?.status})`);
      const myApps = await getApplications(ba.token);
      check("borrower_sees_own_application", myApps.applications?.some((a: any) => a.applicationId === appA.applicationId), "borrowerA lists its application via GET /applications");
    });

    await runStage("Lender matching & opportunities visibility", async () => {
      const la1 = ctx.lenders.la1;
      const lb = ctx.lenders.lb;
      const appAId = ctx.applications.appA.applicationId;
      const appB1Id = ctx.applications.appB1.applicationId;
      const oppLa1 = await getOpportunities(la1.token);
      const oppsLa1: any[] = Array.isArray(oppLa1) ? oppLa1 : Object.values(oppLa1 ?? {});
      check("lender_la1_sees_appA", oppsLa1.some((o: any) => o.applicationId === appAId), "appA visible in GET /investor/opportunities");
      check("lender_la1_does_not_see_appB1", !oppsLa1.some((o: any) => o.applicationId === appB1Id), "business app not leaked to education lender");
      const oppLb = await getOpportunities(lb.token);
      const oppsLb: any[] = Array.isArray(oppLb) ? oppLb : Object.values(oppLb ?? {});
      check("lender_lb_sees_appB1", oppsLb.some((o: any) => o.applicationId === appB1Id), "appB1 visible in GET /investor/opportunities");
      check("lender_lb_does_not_see_appA", !oppsLb.some((o: any) => o.applicationId === appAId), "education app not leaked to business lender");
      const matchRows = await dbRows(
        `SELECT COUNT(*)::int AS n FROM lender_application_matches
         WHERE (application_id = $1 AND lender_user_id IN ($2::uuid, $3::uuid))
            OR (application_id = $4 AND lender_user_id = $5::uuid)`,
        [appAId, ctx.lenders.la1.userId, ctx.lenders.la2.userId, appB1Id, lb.userId],
      );
      check("lender_application_matches_rows", Number(matchRows[0]?.n) >= 3, `lender_application_matches rows in PostgreSQL: ${matchRows[0]?.n}`);
    });    await runStage("Funding commitments & negative boundary rules", async () => {
      const appAId = ctx.applications.appA.applicationId;
      const la1 = ctx.lenders.la1;
      const la2 = ctx.lenders.la2;
      const lb = ctx.lenders.lb;
      const ba = ctx.borrowers.ba;

      await fundOpportunity(la1.token, appAId, 30000);
      info("fund_partial", "lenderA1 committed 30000 of 180000 (partial)");

      // Rule A: loan creation must not work before the application is fully funded.
      const prematureLoan = await api("/loans", { method: "POST", token: la1.token, body: { applicationId: appAId } });
      check("rule_a_lender_not_fully_funded", prematureLoan.status === 400, `lender loan creation on partial funding → ${prematureLoan.status} (${prematureLoan.payload?.error?.message ?? ""})`);
      const borrowerPremature = await api("/loans", { method: "POST", token: ba.token, body: { applicationId: appAId } });
      check("rule_a_borrower_not_fully_funded", borrowerPremature.status === 400 || borrowerPremature.status === 403, `borrower loan creation on partial funding → ${borrowerPremature.status}`);

      // Rule D: funding amount cannot exceed the remaining requested amount.
      const overFund = await api(`/investor/fund/${appAId}`, { method: "POST", token: la2.token, body: { amount: 160000 } });
      check("rule_d_overfund_rejected", overFund.status === 400, `over-funding attempt (160000 vs remaining 150000) → ${overFund.status} (${overFund.payload?.error?.message ?? ""})`);

      await fundOpportunity(la2.token, appAId, 150000);
      const mentsRows = await dbRows(
        `SELECT COALESCE(SUM(amount),0)::numeric::float8 AS total, COUNT(*)::int AS n FROM funding_commitments WHERE application_id = $1 AND status='committed'`,
        [appAId],
      );
      check("funding_commitments_in_db", Number(mentsRows[0]?.total) === 180000 && Number(mentsRows[0]?.n) === 2, `funding_commitments in PostgreSQL: n=${mentsRows[0]?.n}, sum=${mentsRows[0]?.total} (fully funded)`);

      // Rule E: duplicate funding rejected.
      const dup1 = await api(`/investor/fund/${appAId}`, { method: "POST", token: la1.token, body: { amount: 1000 } });
      check("rule_e_dup_funding_la1", dup1.status === 409, `duplicate funding by lenderA1 → ${dup1.status}`);
      const dup2 = await api(`/investor/fund/${appAId}`, { method: "POST", token: la2.token, body: { amount: 1000 } });
      check("rule_e_dup_funding_la2", dup2.status === 409, `duplicate funding by lenderA2 → ${dup2.status}`);

      // Second scenario: partial funding on a business application also blocks loan creation.
      await fundOpportunity(lb.token, ctx.applications.appB1.applicationId, 50000);
      const prematureB = await api("/loans", { method: "POST", token: lb.token, body: { applicationId: ctx.applications.appB1.applicationId } });
      check("rule_a_partial_second_app", prematureB.status === 400, `lenderB loan creation on partially funded appB1 → ${prematureB.status}`);

      // Rule F: a rejected (ineligible) application cannot become a loan. appB1 is
      // rejected through the real admin API while lenderB is already a funder of
      // it, so the eligibility guard (not the participation guard) is what blocks.
      if (!ctx.admin) throw new Error("Admin setup did not complete — cannot run rule F");
      await adminReviewApplication(ctx.admin.token, ctx.applications.appB1.applicationId, "rejected");
      const appB1Detail = await getApplication(ctx.borrowers.bb.token, ctx.applications.appB1.applicationId);
      check("app_b1_rejected", appB1Detail.status === "rejected", "appB1 rejected through real admin API");
      const loanFromRejected = await api("/loans", { method: "POST", token: lb.token, body: { applicationId: ctx.applications.appB1.applicationId } });
      check("rule_f_rejected_app_blocked", loanFromRejected.status === 400, `loan creation from rejected app → ${loanFromRejected.status} (${loanFromRejected.payload?.error?.message ?? ""})`);
      const dbB1 = await dbRows(`SELECT status FROM loan_applications WHERE application_id = $1`, [ctx.applications.appB1.applicationId]);
      check("app_b1_status_in_db", dbB1[0]?.status === "rejected", `rejected state persisted in PostgreSQL (${dbB1[0]?.status})`);
    });

    await runStage("Loan creation (positive & cross-tenant guards)", async () => {
      const appAId = ctx.applications.appA.applicationId;
      const la1 = ctx.lenders.la1;
      const la2 = ctx.lenders.la2;
      const lb = ctx.lenders.lb;
      const ba = ctx.borrowers.ba;
      const bb = ctx.borrowers.bb;

      // Rule B: a lender with no commitment on this application cannot create the loan.
      const nonParticipant = await api("/loans", { method: "POST", token: lb.token, body: { applicationId: appAId } });
      check("rule_b_non_participant_loan_creation", nonParticipant.status === 403, `lenderB loan creation on appA → ${nonParticipant.status}`);

      const loan = await createLoan(la1.token, appAId);
      ctx.loanId = loan.loanId;
      console.log(`  ✅ Loan created: ${loan.loanId} (principal ${loan.principalAmount} BDT)`);

      const loanRows = await dbRows(`SELECT loan_id, status, principal_amount FROM loans WHERE loan_id = $1`, [ctx.loanId]);
      check("loan_in_db", loanRows.length > 0 && Number(loanRows[0].principal_amount) === 180000, `loan persisted in PostgreSQL (status=${loanRows[0]?.status})`);

      // Rule G: loan creation must NOT mark the application disbursed; a real
      // disbursement row is required before 'disbursed'.
      const appStatusAfter = await dbRows(`SELECT status FROM loan_applications WHERE application_id = $1`, [appAId]);
      check("rule_g_app_approved_not_disbursed", appStatusAfter[0]?.status === "approved", `application state after loan creation = '${appStatusAfter[0]?.status}' (approved, not disbursed)`);
      const disbCount = await dbCount(`SELECT COUNT(*)::int AS count FROM loan_disbursements WHERE loan_id = $1`, [ctx.loanId]);
      check("rule_g_no_disbursement_row_yet", disbCount === 0, `loan_disbursements rows after loan creation: ${disbCount}`);

      // Rule E: duplicate loan creation rejected.
      const dupLoan = await api("/loans", { method: "POST", token: la2.token, body: { applicationId: appAId } });
      check("rule_e_dup_loan_creation", dupLoan.status === 409, `duplicate loan creation → ${dupLoan.status}`);

      // Borrower sees the loan through GET /loans (workflow step 14).
      const baLoans = await getLoans(ba.token);
      check("borrower_sees_loan", baLoans.loans?.some((l: any) => l.loanId === ctx.loanId), "borrowerA sees loan via GET /loans");

      // Rule C: borrower cannot access another borrower's application or loan.
      const crossApp = await api(`/applications/${appAId}`, { token: bb.token });
      check("rule_c_borrower_app_isolation", crossApp.status === 403, `borrowerB reading appA → ${crossApp.status}`);
      const crossLoan = await api(`/loans/${ctx.loanId}`, { token: bb.token });
      check("rule_c_borrower_loan_isolation", crossLoan.status === 403, `borrowerB reading loanA → ${crossLoan.status}`);

      // Rule B: lender cannot access another lender's private funded loan data.
      const crossLoanLb = await api(`/loans/${ctx.loanId}`, { token: lb.token });
      check("rule_b_lender_loan_isolation", crossLoanLb.status === 403, `lenderB reading loanA → ${crossLoanLb.status}`);
      const crossTx = await api(`/loans/${ctx.loanId}/transactions`, { token: lb.token });
      check("rule_b_lender_transactions_isolation", crossTx.status === 403, `lenderB reading loanA transactions → ${crossTx.status}`);
      const lbLoans = await getLoans(lb.token);
      check("rule_b_lender_list_isolation", !lbLoans.loans?.some((l: any) => l.loanId === ctx.loanId), "loanA absent from lenderB GET /loans");
      const lbPortfolio = await getPortfolio(lb.token);
      check("rule_b_lender_portfolio_isolation", !lbPortfolio.fundedLoans?.some((f: any) => f.applicationId === appAId), "loanA funding absent from lenderB portfolio");

      // Lender sees the resulting loan through the lender API (workflow step 15).
      const la1Loan = await getLoan(la1.token, ctx.loanId);
      check("lender_sees_loan_detail", la1Loan.loanId === ctx.loanId, "lenderA1 sees loan via GET /loans/:id");
      const la1Portfolio = await getPortfolio(la1.token);
      const la1Funded = la1Portfolio.fundedLoans?.find((f: any) => f.applicationId === appAId);
      check("lender_sees_loan_in_portfolio", !!la1Funded, `lenderA1 portfolio contains loanA commitment (${la1Funded?.fundedAmount ?? 0} BDT)`);
      const la1Tx = await getLoanTransactions(la1.token, ctx.loanId);
      check("lender_sees_loan_transactions", Array.isArray(la1Tx), "lenderA1 can read loanA transactions");
    });    await runStage("Loan disbursement (real money transfer)", async () => {
      const disb = await createDisbursement(ctx.lenders.la1.token, ctx.loanId, 180000);
      ctx.disbursementId = disb.disbursementId;
      check("disbursement_recorded", !!ctx.disbursementId, `disbursement recorded (${ctx.disbursementId})`);

      const disbRows = await dbRows(`SELECT disbursement_id, amount FROM loan_disbursements WHERE loan_id = $1`, [ctx.loanId]);
      check("disbursement_in_db", disbRows.length === 1 && Number(disbRows[0].amount) === 180000, `loan_disbursements rowin PostgreSQL: ${disbRows.length} (${disbRows[0]?.amount} BDT)`);

      const appStatus = await dbRows(`SELECT status FROM loan_applications WHERE application_id = $1`, [ctx.applications.appA.applicationId]);
      check("disbursement_moved_app_to_disbursed", appStatus[0]?.status === "disbursed", `application state after disbursement = '${appStatus[0]?.status}'`);
      const viaApi = await getApplication(ctx.borrowers.ba.token, ctx.applications.appA.applicationId);
      check("disbursement_api_state", viaApi.status === "disbursed", "application status 'disbursed' via GET /applications/:id");
    });

    await runStage("Repayment schedule generation", async () => {
      const scheduleData = await createRepaymentSchedules(ctx.lenders.la1.token, ctx.loanId);
      const schedCount = scheduleData.schedules?.length ?? 0;
      check("schedules_generated", schedCount > 0, `${schedCount} repayment schedules generated for loan`);
      const dbSched = await dbCount(`SELECT COUNT(*)::int AS count FROM repayment_schedules WHERE loan_id = $1`, [ctx.loanId]);
      check("schedules_in_db", dbSched === schedCount, `repayment_schedules in PostgreSQL: ${dbSched}`);

      const baSchedules = await getRepaymentSchedules(ctx.borrowers.ba.token, ctx.loanId);
      ctx.firstSchedule = baSchedules.schedules?.find((s: any) => Number(s.outstandingAmount) > 0) ?? null;
      check("borrower_sees_schedules", !!ctx.firstSchedule, ctx.firstSchedule ? `next schedule ${ctx.firstSchedule.scheduleId} (${ctx.firstSchedule.expectedAmount} BDT)` : "no outstanding schedule");
    });

    await runStage("Repayment via real API & state propagation", async () => {
      const s = ctx.firstSchedule;
      if (!s) throw new Error("No outstanding schedule was generated for repayment");
      const repayment = await recordRepayment(ctx.borrowers.ba.token, s.scheduleId, Number(s.expectedAmount));
      ctx.repaymentId = repayment.repayment?.repaymentId ?? "";
      check("repayment_recorded", !!ctx.repaymentId, `repayment recorded (${ctx.repaymentId})`);

      const payRows = await dbRows(
        `SELECT r.repayment_id, r.amount_paid, rs.status AS schedule_status
         FROM repayments r JOIN repayment_schedules rs ON rs.schedule_id = r.schedule_id
         WHERE r.repayment_id = $1`,
        [ctx.repaymentId],
      );
      check("repayment_in_db", payRows.length === 1, "repayment row persisted in PostgreSQL");
      check("schedule_marked_paid", payRows[0]?.schedule_status === "paid", `repayment_schedules.status = '${payRows[0]?.schedule_status}'`);

      const loanDetail = await getLoan(ctx.borrowers.ba.token, ctx.loanId);
      const totalPaid = Number(loanDetail.repaymentSummary?.totalPaid ?? 0);
      check("loan_total_paid_updated", totalPaid > 0, `loan repaymentSummary.totalPaid = ${totalPaid}`);

      const tsRows = await dbRows(
        `SELECT score, trust_band, trigger_event, is_current FROM trust_scores WHERE user_id = $1 ORDER BY calculated_at DESC`,
        [ctx.borrowers.ba.userId],
      );
      check("trust_score_repayment_event", Number(tsRows[0]?.is_current) === 1 && tsRows[0]?.trigger_event === "repayment_received", `latest trust score trigger = ${tsRows[0]?.trigger_event} (band ${tsRows[0]?.trust_band})`);

      const la1Portfolio = await getPortfolio(ctx.lenders.la1.token);
      const entry = la1Portfolio.fundedLoans?.find((f: any) => f.applicationId === ctx.applications.appA.applicationId);
      const lenderTotalPaid = Number(entry?.totalPaid ?? 0);
      check("lender_portfolio_reflects_repayment", lenderTotalPaid > 0, `lender portfolio totalPaid = ${lenderTotalPaid}`);
      const tx = await getLoanTransactions(ctx.lenders.la1.token, ctx.loanId);
      check("lender_transactions_show_repayment", tx.some((t: any) => t.type === "repayment"), "loan transactions include the repayment");
    });

  } finally {
    printReport(ctx);
    await closePool();
    const failed = failedSteps.length > 0 ? failedSteps.length : 0;
    process.exitCode = failed > 0 ? 1 : 0;
  }
}

function printReport(ctx: WorkflowContext) {
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  END-TO-END WORKFLOW REPORT  (" + RUN_TAG + ")");
  console.log("═══════════════════════════════════════════════════════════\n");
  console.log("Entities created this run:");
  console.log(`  - Admin:          ${ctx.admin?.email ?? "n/a"} (${ctx.admin?.userId ?? "n/a"})`);
  for (const k of Object.keys(ctx.lenders)) console.log(`  - Lender ${k}:     ${ctx.lenders[k].username} (${ctx.lenders[k].userId})`);
  for (const k of Object.keys(ctx.borrowers)) console.log(`  - Borrower ${k}:    ${ctx.borrowers[k].username} (${ctx.borrowers[k].userId})`);
  for (const k of Object.keys(ctx.applications)) console.log(`  - Application ${k}: ${ctx.applications[k].applicationId} (${ctx.applications[k].purpose}, ${ctx.applications[k].amount} BDT)`);
  console.log(`  - Loan:           ${ctx.loanId || "n/a"}`);
  console.log(`  - Disbursement:  ${ctx.disbursementId || "n/a"}`);
  console.log(`  - Repayment:     ${ctx.repaymentId || "n/a"}`);

  console.log("\nStep-by-step result:");
  let i = 1;
  for (const label of Object.keys(report)) {
    const r = report[label];
    console.log(`  ${String(i++).padStart(2, "0")}. ${r.ok ? "PASS" : "FAIL"}  ${label} — ${r.detail}`);
  }
  const total = Object.keys(report).length;
  const fails = Object.keys(report).filter((k) => !report[k].ok).length;
  console.log(`\nTotal: ${total} checks, ${fails} failed.`);
  if (fails > 0) {
    console.log("\n❌ WORKFLOW FAILED — inspect the failing steps above.");
  } else {
    console.log("\n✅ WORKFLOW PASSED — every lifecycle transition verified against PostgreSQL and the API.");
  }
  console.log("");
}

void main();