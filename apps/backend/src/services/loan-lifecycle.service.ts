import type { PoolClient } from "pg";
import { calculateReducingBalanceSchedule } from "./interest.service.js";

export class LoanFinalizationConfigError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "LoanFinalizationConfigError";
    this.statusCode = statusCode;
  }
}

export interface FinalizeLoanParams {
  applicationId: string;
  funderUserId: string;
  disbursementAccountId?: string | null;
  disbursementMethod?: string | null;
}

export interface FinalizedLoanResult {
  loanId: string;
  applicationId: string;
  userId: string;
  partnerId: string;
  partnerAgentId: string | null;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  status: "active";
  startDate: string;
  expectedEndDate: string;
  applicationStatus: "disbursed";
  offerId: string;
  disbursementId: string;
}

export async function ensureRepaymentSchedules(
  client: Pick<PoolClient, "query">,
  loanId: string,
  principal: number,
  interestRate: number,
  tenureMonths: number,
  startDate: Date | string,
): Promise<void> {
  const existing = await client.query(
    `SELECT 1 FROM repayment_schedules WHERE loan_id = $1 LIMIT 1`,
    [loanId],
  );
  if (existing.rowCount && existing.rowCount > 0) return;

  const schedule = calculateReducingBalanceSchedule(
    principal,
    interestRate,
    tenureMonths,
    new Date(startDate),
  );

  for (const item of schedule) {
    await client.query(
      `INSERT INTO repayment_schedules (loan_id, installment_number, due_date, expected_amount, status)
       VALUES ($1, $2, $3, $4, 'pending')
       ON CONFLICT (loan_id, installment_number) DO NOTHING`,
      [
        loanId,
        item.installmentNumber,
        item.dueDate.toISOString().split("T")[0],
        Number(item.totalInstallment),
      ],
    );
  }
}

export async function finalizeFullyFundedLoan(
  client: PoolClient,
  params: FinalizeLoanParams,
): Promise<FinalizedLoanResult> {
  const { applicationId, funderUserId } = params;

  // 1. Check for existing loan (idempotent / concurrency-safe)
  const existingLoanResult = await client.query(
    `SELECT
       l.loan_id AS "loanId",
       l.application_id AS "applicationId",
       l.offer_id AS "offerId",
       l.user_id AS "userId",
       l.partner_id AS "partnerId",
       l.partner_agent_id AS "partnerAgentId",
       l.principal_amount AS "principalAmount",
       l.interest_rate AS "interestRate",
       l.tenure_months AS "tenureMonths",
       l.status,
       l.start_date AS "startDate",
       l.expected_end_date AS "expectedEndDate"
     FROM loans l
     WHERE l.application_id = $1
     FOR UPDATE`,
    [applicationId],
  );

  if (existingLoanResult.rowCount && existingLoanResult.rowCount > 0) {
    const loan = existingLoanResult.rows[0];
    const principal = Number(loan.principalAmount);
    const interestRate = Number(loan.interestRate);
    const tenureMonths = Number(loan.tenureMonths);

    // If pending_disbursement, disburse and activate
    if (loan.status === "pending_disbursement") {
      const disbursedResult = await client.query(
        `SELECT COALESCE(SUM(amount), 0) AS total_disbursed FROM loan_disbursements WHERE loan_id = $1`,
        [loan.loanId],
      );
      const remainingDisbursement = Math.max(
        0,
        principal - Number(disbursedResult.rows[0].total_disbursed),
      );

      let disbId = "";
      if (remainingDisbursement > 0) {
        const disbInsert = await client.query(
          `INSERT INTO loan_disbursements
             (loan_id, amount, disbursement_method, reference_number, disbursed_at, payment_account_id)
           VALUES ($1, $2, $3, $4, NOW(), $5)
           RETURNING disbursement_id`,
          [
            loan.loanId,
            remainingDisbursement,
            params.disbursementMethod || "platform_transfer",
            `AUTO-${applicationId}`,
            params.disbursementAccountId ?? null,
          ],
        );
        disbId = disbInsert.rows[0].disbursement_id;
      }

      await client.query(`UPDATE loans SET status = 'active', updated_at = NOW() WHERE loan_id = $1`, [
        loan.loanId,
      ]);

      await client.query(
        `UPDATE loan_applications SET status = 'disbursed', updated_at = NOW() WHERE application_id = $1`,
        [applicationId],
      );

      await ensureRepaymentSchedules(
        client,
        loan.loanId,
        principal,
        interestRate,
        tenureMonths,
        loan.startDate,
      );

      return {
        loanId: loan.loanId,
        applicationId: loan.applicationId,
        userId: loan.userId,
        partnerId: loan.partnerId,
        partnerAgentId: loan.partnerAgentId,
        principalAmount: principal,
        interestRate,
        tenureMonths,
        status: "active",
        startDate: typeof loan.startDate === "string" ? loan.startDate : loan.startDate.toISOString().split("T")[0],
        expectedEndDate: typeof loan.expectedEndDate === "string" ? loan.expectedEndDate : loan.expectedEndDate.toISOString().split("T")[0],
        applicationStatus: "disbursed",
        offerId: loan.offerId,
        disbursementId: disbId,
      };
    }

    return {
      loanId: loan.loanId,
      applicationId: loan.applicationId,
      userId: loan.userId,
      partnerId: loan.partnerId,
      partnerAgentId: loan.partnerAgentId,
      principalAmount: principal,
      interestRate,
      tenureMonths,
      status: "active",
      startDate: typeof loan.startDate === "string" ? loan.startDate : loan.startDate.toISOString().split("T")[0],
      expectedEndDate: typeof loan.expectedEndDate === "string" ? loan.expectedEndDate : loan.expectedEndDate.toISOString().split("T")[0],
      applicationStatus: "disbursed",
      offerId: loan.offerId,
      disbursementId: "",
    };
  }

  // 2. Fetch application row with defensive partner resolution
  const appResult = await client.query(
    `SELECT
       la.application_id,
       la.user_id,
       la.requested_amount,
       la.duration_months AS application_duration_months,
       la.status AS application_status,
       la.partner_id AS app_partner_id,
       la.product_id,
       la.disbursement_account_id,
       lp.partner_id AS product_partner_id,
       lp.interest_rate,
       lp.duration_months AS product_duration_months,
       upa.provider AS upa_provider,
       u.partner_id AS funder_partner_id
     FROM loan_applications la
     LEFT JOIN loan_products lp ON lp.product_id = la.product_id
     LEFT JOIN user_payment_accounts upa ON upa.account_id = la.disbursement_account_id AND upa.is_active = TRUE
     LEFT JOIN users u ON u.user_id = $2
     WHERE la.application_id = $1
     FOR UPDATE OF la`,
    [applicationId, funderUserId],
  );

  if (appResult.rowCount === 0) {
    throw new LoanFinalizationConfigError("Application not found", 404);
  }

  const app = appResult.rows[0];

  // Defensive institutional partner resolution:
  // loan_applications.partner_id -> loan_products.partner_id -> funding lender's users.partner_id
  const resolvedPartnerId =
    app.app_partner_id ||
    app.product_partner_id ||
    app.funder_partner_id;

  if (!resolvedPartnerId) {
    throw new LoanFinalizationConfigError(
      "Unable to determine a funding partner for this application",
      400,
    );
  }

  // Verify the funding partner exists and is active
  const partnerCheck = await client.query(
    `SELECT partner_id FROM funding_partners WHERE partner_id = $1 AND is_active = TRUE`,
    [resolvedPartnerId],
  );
  if (partnerCheck.rowCount === 0) {
    throw new LoanFinalizationConfigError("Funding partner is invalid or inactive", 400);
  }

  // 3. Preserve an explicitly assigned partner agent when one exists.
  const agentResult = await client.query(
    `SELECT
       ip.partner_agent_id,
       pa.user_id AS agent_id,
       pa.role AS agent_role,
       pa.account_status AS agent_status,
       pa.partner_id AS agent_partner_id
     FROM investor_profiles ip
     LEFT JOIN users pa ON pa.user_id = ip.partner_agent_id
     WHERE ip.user_id = $1`,
    [funderUserId],
  );

  const funderProfile = agentResult.rows[0];
  let partnerAgentId: string | null = null;
  if (funderProfile?.partner_agent_id) {
    if (
      !funderProfile.agent_id ||
      funderProfile.agent_role !== "partner_agent" ||
      funderProfile.agent_status !== "active"
    ) {
      throw new LoanFinalizationConfigError("The assigned partner agent is invalid or inactive", 400);
    }

    if (funderProfile.agent_partner_id !== resolvedPartnerId) {
      throw new LoanFinalizationConfigError(
        "The assigned partner agent belongs to a different institution",
        400,
      );
    }
    partnerAgentId = funderProfile.agent_id;
  }
  const principal = Number(app.requested_amount);
  const interestRate = Number(app.interest_rate ?? 12.0);
  const tenureMonths = Number(
    app.application_duration_months ?? app.product_duration_months ?? 12,
  );
  const startDate = new Date();
  const expectedEndDate = new Date(startDate);
  expectedEndDate.setMonth(expectedEndDate.getMonth() + tenureMonths);

  // 4. Atomically create exactly one loan_offer
  const offerResult = await client.query(
    `INSERT INTO loan_offers
       (application_id, partner_id, offered_amount, interest_rate, tenure_months, conditions, status, offered_at)
     VALUES ($1, $2, $3, $4, $5, $6, 'accepted', NOW())
     RETURNING offer_id`,
    [applicationId, resolvedPartnerId, principal, interestRate, tenureMonths, "Standard terms"],
  );
  const offerId = offerResult.rows[0].offer_id;

  // 5. Atomically create exactly one loan (status: 'active', recording partner_agent_id)
  const loanResult = await client.query(
    `INSERT INTO loans
       (application_id, offer_id, user_id, partner_id, partner_agent_id, principal_amount, interest_rate, tenure_months, status, start_date, expected_end_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', $9, $10)
     RETURNING
       loan_id AS "loanId",
       application_id AS "applicationId",
       offer_id AS "offerId",
       user_id AS "userId",
       partner_id AS "partnerId",
       partner_agent_id AS "partnerAgentId",
       principal_amount AS "principalAmount",
       interest_rate AS "interestRate",
       tenure_months AS "tenureMonths",
       status,
       start_date AS "startDate",
       expected_end_date AS "expectedEndDate",
       created_at AS "createdAt"`,
    [
      applicationId,
      offerId,
      app.user_id,
      resolvedPartnerId,
      partnerAgentId,
      principal,
      interestRate,
      tenureMonths,
      startDate.toISOString().split("T")[0],
      expectedEndDate.toISOString().split("T")[0],
    ],
  );
  const createdLoan = loanResult.rows[0];
  const loanId = createdLoan.loanId;

  // 6. Resolve disbursement account and record full disbursement
  let disbursementAccountId =
    params.disbursementAccountId || app.disbursement_account_id || null;
  let disbursementProvider = app.upa_provider || null;

  if (!disbursementAccountId) {
    const defaultAcc = await client.query(
      `SELECT account_id, provider FROM user_payment_accounts
       WHERE user_id = $1 AND is_default = TRUE AND is_active = TRUE LIMIT 1`,
      [app.user_id],
    );
    if (defaultAcc.rowCount && defaultAcc.rowCount > 0) {
      disbursementAccountId = defaultAcc.rows[0].account_id;
      disbursementProvider = defaultAcc.rows[0].provider;
    }
  }

  const disbursementMethod =
    params.disbursementMethod || disbursementProvider || "platform_transfer";

  const disbResult = await client.query(
    `INSERT INTO loan_disbursements
       (loan_id, amount, disbursement_method, reference_number, disbursed_at, payment_account_id)
     VALUES ($1, $2, $3, $4, NOW(), $5)
     RETURNING disbursement_id`,
    [
      loanId,
      principal,
      disbursementMethod,
      `AUTO-${applicationId}`,
      disbursementAccountId,
    ],
  );
  const disbursementId = disbResult.rows[0].disbursement_id;

  // 7. Update loan_applications status to 'disbursed' and persist resolved partner
  await client.query(
    `UPDATE loan_applications
     SET status = 'disbursed',
         partner_id = COALESCE(partner_id, $2),
         updated_at = NOW()
     WHERE application_id = $1`,
    [applicationId, resolvedPartnerId],
  );

  // 8. Generate repayment schedules exactly once
  await ensureRepaymentSchedules(
    client,
    loanId,
    principal,
    interestRate,
    tenureMonths,
    startDate,
  );

  // 9. Write audit records
  await client.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, after_state)
     VALUES ($1, 'loan_created', 'loan', $2,
       jsonb_build_object(
         'applicationId', $3::uuid,
         'principalAmount', $4::numeric,
         'tenureMonths', $5::integer,
         'status', 'active',
         'partnerId', $6::uuid,
         'partnerAgentId', $7::uuid
       )
     )`,
    [
      funderUserId,
      loanId,
      applicationId,
      principal,
      tenureMonths,
      resolvedPartnerId,
      partnerAgentId,
    ],
  );

  await client.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, after_state)
     VALUES ($1, 'disbursement_created', 'loan_disbursement', $2,
       jsonb_build_object('loanId', $3::uuid, 'amount', $4::numeric)
     )`,
    [funderUserId, disbursementId, loanId, principal],
  );

  // 10. Write notification to borrower
  await client.query(
    `INSERT INTO notifications (user_id, channel, type, title, body)
     VALUES ($1, 'in_app', 'loan_disbursed', 'Your loan has been funded and disbursed',
             'Your loan application has been fully funded and disbursed. Repayment schedules have been generated.')`,
    [app.user_id],
  );

  return {
    loanId,
    applicationId,
    userId: app.user_id,
    partnerId: resolvedPartnerId,
    partnerAgentId,
    principalAmount: principal,
    interestRate,
    tenureMonths,
    status: "active",
    startDate: startDate.toISOString().split("T")[0],
    expectedEndDate: expectedEndDate.toISOString().split("T")[0],
    applicationStatus: "disbursed",
    offerId,
    disbursementId,
  };
}
