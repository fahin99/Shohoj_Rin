import { Router, type NextFunction, type Response } from "express";
import { pool } from "../lib/db.js";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";

const router = Router();

export function requireAdmin(req: RequestWithAuth, res: Response, next: NextFunction) {
  if (!req.auth || req.auth.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: { message: "Admin access required" },
    });
  }
  return next();
}
export function requireAdminOrPartnerAgent(req: RequestWithAuth, res: Response, next: NextFunction) {
  if (!req.auth || (req.auth.role !== "admin" && req.auth.role !== "partner_agent")) {
    return res.status(403).json({
      success: false,
      error: { message: "Admin or partner agent access required" },
    });
  }
  return next();
}

// GET /api/v1/admin/users — list all users
router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || "50"), 10)));
    const offset = (page - 1) * limit;

    const countResult = await pool.query(`SELECT COUNT(*) AS total FROM users`);
    const total = parseInt(countResult.rows[0].total, 10);

    const result = await pool.query(
      `SELECT
        u.user_id AS "userId",
        u.email,
        u.phone,
        u.role,
        u.account_status AS "accountStatus",
        u.email_verified AS "emailVerified",
        u.created_at AS "createdAt",
        up.full_name AS "fullName",
        up.profile_completion_status AS "profileCompletionStatus"
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.user_id
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    return res.status(200).json({
      success: true,
      data: { users: result.rows, total },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch users" },
    });
  }
});

// GET /api/v1/admin/partners — list funding partners
router.get("/partners", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        fp.partner_id AS "partnerId",
        fp.name,
        fp.type,
        fp.contact_email AS "contactEmail",
        fp.contact_phone AS "contactPhone",
        fp.is_active AS "isActive",
        fp.created_at AS "createdAt",
        COUNT(DISTINCT lp.product_id) AS "productCount",
        COUNT(DISTINCT la.application_id) AS "applicationCount"
       FROM funding_partners fp
       LEFT JOIN loan_products lp ON lp.partner_id = fp.partner_id
       LEFT JOIN loan_applications la ON la.partner_id = fp.partner_id
       GROUP BY fp.partner_id
       ORDER BY fp.name`,
    );

    return res.status(200).json({
      success: true,
      data: result.rows.map((row: any) => ({
        ...row,
        productCount: parseInt(row.productCount, 10),
        applicationCount: parseInt(row.applicationCount, 10),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch partners:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch partners" },
    });
  }
});

// GET /api/v1/admin/stats — platform statistics
router.get("/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    const statsResult = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS "totalUsers",
        (SELECT COUNT(*) FROM users WHERE role = 'borrower') AS "totalBorrowers",
        (SELECT COUNT(*) FROM users WHERE role = 'lender') AS "totalLenders",
        (SELECT COUNT(*) FROM loan_applications WHERE submitted_at >= CURRENT_DATE) AS "applicationsToday",
        (SELECT COUNT(*) FROM loan_applications WHERE status = 'approved') AS "approvedApplications",
        (SELECT COUNT(*) FROM loan_applications) AS "totalApplications",
        (SELECT COALESCE(SUM(principal_amount), 0) FROM loans WHERE status IN ('active', 'completed')) AS "totalDisbursed",
        (SELECT COUNT(*) FROM loans WHERE status = 'overdue') AS "overdueLoans",
        (SELECT COUNT(*) FROM loans WHERE status = 'active') AS "activeLoans",
        (SELECT COUNT(*) FROM verification_requests WHERE status = 'pending') AS "pendingVerifications"
    `);

    const stats = statsResult.rows[0] as any;
    const totalApps = parseInt(stats.totalApplications, 10);
    const approved = parseInt(stats.approvedApplications, 10);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers: parseInt(stats.totalUsers, 10),
        totalBorrowers: parseInt(stats.totalBorrowers, 10),
        totalLenders: parseInt(stats.totalLenders, 10),
        applicationsToday: parseInt(stats.applicationsToday, 10),
        approvalRate: totalApps > 0 ? Math.round((approved / totalApps) * 100) : 0,
        totalDisbursed: parseFloat(stats.totalDisbursed),
        overdueLoans: parseInt(stats.overdueLoans, 10),
        activeLoans: parseInt(stats.activeLoans, 10),
        pendingVerifications: parseInt(stats.pendingVerifications, 10),
      },
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch platform statistics" },
    });
  }
});

// GET /api/v1/admin/database-showcase/overview — live database counts and a trigger invariant.
router.get("/database-showcase/overview", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS "users",
        (SELECT COUNT(*) FROM users WHERE role = 'borrower') AS "borrowers",
        (SELECT COUNT(*) FROM users WHERE role = 'lender') AS "lenders",
        (SELECT COUNT(*) FROM users u
         JOIN investor_profiles ip ON ip.user_id = u.user_id
         WHERE u.role = 'lender') AS "lendersWithInvestorProfile",
        (SELECT COUNT(*) FROM loan_applications) AS "loanApplications",
        (SELECT COUNT(*) FROM loans WHERE status = 'active') AS "activeLoans",
        (SELECT COUNT(*) FROM repayments) AS "repayments"
    `);

    const row = result.rows[0] as Record<string, string | number>;
    return res.status(200).json({
      success: true,
      data: {
        users: Number(row.users),
        borrowers: Number(row.borrowers),
        lenders: Number(row.lenders),
        lendersWithInvestorProfile: Number(row.lendersWithInvestorProfile),
        loanApplications: Number(row.loanApplications),
        activeLoans: Number(row.activeLoans),
        repayments: Number(row.repayments),
      },
    });
  } catch (error) {
    console.error("Failed to load database showcase overview:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to load database showcase overview" },
    });
  }
});

// GET /api/v1/admin/database-showcase/loan-balances — portfolio aggregation with DB-side balance calculation.
router.get("/database-showcase/loan-balances", requireAuth, requireAdmin, async (req, res) => {
  const page = Math.max(1, Number.parseInt(String(req.query.page ?? "1"), 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(String(req.query.limit ?? "25"), 10) || 25),
  );
  const offset = (page - 1) * limit;

  try {
    const [countResult, loansResult] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM loans`),
      pool.query(
        `WITH schedule_summary AS (
           SELECT
             schedule.loan_id,
             COUNT(*) AS installment_count,
             COUNT(*) FILTER (WHERE schedule.status = 'paid') AS paid_installment_count,
             MIN(schedule.due_date) FILTER (WHERE schedule.status <> 'paid') AS next_due_date
           FROM repayment_schedules schedule
           GROUP BY schedule.loan_id
         )
         SELECT
           loan.loan_id AS "loanId",
           loan.status AS "loanStatus",
           loan.principal_amount AS "principalAmount",
           application.reference_code AS "applicationReference",
           application.status AS "applicationStatus",
           partner.name AS "partnerName",
           COALESCE(summary.installment_count, 0) AS "installmentCount",
           COALESCE(summary.paid_installment_count, 0) AS "paidInstallmentCount",
           summary.next_due_date AS "nextDueDate",
           calculate_loan_remaining_balance(loan.loan_id) AS "remainingBalance"
         FROM loans loan
         JOIN loan_applications application ON application.application_id = loan.application_id
         LEFT JOIN funding_partners partner ON partner.partner_id = loan.partner_id
         LEFT JOIN schedule_summary summary ON summary.loan_id = loan.loan_id
         ORDER BY loan.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
    ]);

    const total = Number(countResult.rows[0]?.total ?? 0);
    return res.status(200).json({
      success: true,
      data: {
        loans: loansResult.rows.map((row) => ({
          ...row,
          principalAmount: Number(row.principalAmount),
          installmentCount: Number(row.installmentCount),
          paidInstallmentCount: Number(row.paidInstallmentCount),
          remainingBalance: Number(row.remainingBalance),
        })),
        total,
      },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Failed to load database showcase loan balances:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to load database showcase loan balances" },
    });
  }
});

// GET /api/v1/admin/database-showcase/queries — read-only aggregate queries for the database demo.
router.get("/database-showcase/queries", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const [portfolioResult, fundingResult, applicationResult] = await Promise.all([
      pool.query(`
        WITH schedule_totals AS (
          SELECT
            schedule.loan_id,
            SUM(schedule.expected_amount) AS scheduled_amount,
            COALESCE(SUM(payment.amount_paid) FILTER (WHERE payment.status = 'completed'), 0) AS paid_amount
          FROM repayment_schedules schedule
          LEFT JOIN repayments payment ON payment.schedule_id = schedule.schedule_id
          GROUP BY schedule.loan_id
        )
        SELECT
          loan.status AS "loanStatus",
          COUNT(*) AS "loanCount",
          COALESCE(SUM(loan.principal_amount), 0) AS "principalAmount",
          COALESCE(SUM(COALESCE(schedule_totals.scheduled_amount, loan.principal_amount)), 0) AS "scheduledAmount",
          COALESCE(SUM(COALESCE(schedule_totals.paid_amount, 0)), 0) AS "paidAmount"
        FROM loans loan
        LEFT JOIN schedule_totals ON schedule_totals.loan_id = loan.loan_id
        GROUP BY loan.status
        ORDER BY loan.status
      `),
      pool.query(`
        WITH lender_commitments AS (
          SELECT
            lender_user_id,
            COUNT(*) AS commitment_count,
            COALESCE(SUM(amount) FILTER (WHERE status = 'committed'), 0) AS committed_amount
          FROM funding_commitments
          GROUP BY lender_user_id
        )
        SELECT
          COALESCE(profile.risk_preference, 'not_set') AS "riskPreference",
          COUNT(*) AS "lenderCount",
          COALESCE(SUM(COALESCE(commitment.commitment_count, 0)), 0) AS "commitmentCount",
          COALESCE(SUM(COALESCE(commitment.committed_amount, 0)), 0) AS "committedAmount"
        FROM users lender
        LEFT JOIN investor_profiles profile ON profile.user_id = lender.user_id
        LEFT JOIN lender_commitments commitment ON commitment.lender_user_id = lender.user_id
        WHERE lender.role = 'lender'
        GROUP BY COALESCE(profile.risk_preference, 'not_set')
        ORDER BY "lenderCount" DESC, "riskPreference"
      `),
      pool.query(`
        WITH funding_totals AS (
          SELECT
            application_id,
            COALESCE(SUM(amount) FILTER (WHERE status = 'committed'), 0) AS committed_amount
          FROM funding_commitments
          GROUP BY application_id
        )
        SELECT
          application.status AS "applicationStatus",
          COUNT(*) AS "applicationCount",
          COALESCE(SUM(application.requested_amount), 0) AS "requestedAmount",
          ROUND(AVG(score.score), 2) AS "averageTrustScore",
          COALESCE(SUM(COALESCE(funding_totals.committed_amount, 0)), 0) AS "committedAmount"
        FROM loan_applications application
        LEFT JOIN trust_scores score ON score.score_id = application.trust_score_id
        LEFT JOIN funding_totals ON funding_totals.application_id = application.application_id
        GROUP BY application.status
        ORDER BY application.status
      `),
    ]);

    const toNumber = (value: unknown) => Number(value ?? 0);
    return res.status(200).json({
      success: true,
      data: {
        loanPortfolio: portfolioResult.rows.map((row: any) => ({
          ...row,
          loanCount: toNumber(row.loanCount),
          principalAmount: toNumber(row.principalAmount),
          scheduledAmount: toNumber(row.scheduledAmount),
          paidAmount: toNumber(row.paidAmount),
        })),
        lenderFunding: fundingResult.rows.map((row: any) => ({
          ...row,
          lenderCount: toNumber(row.lenderCount),
          commitmentCount: toNumber(row.commitmentCount),
          committedAmount: toNumber(row.committedAmount),
        })),
        applicationTrust: applicationResult.rows.map((row: any) => ({
          ...row,
          applicationCount: toNumber(row.applicationCount),
          requestedAmount: toNumber(row.requestedAmount),
          averageTrustScore: row.averageTrustScore == null ? null : toNumber(row.averageTrustScore),
          committedAmount: toNumber(row.committedAmount),
        })),
      },
    });
  } catch (error) {
    console.error("Failed to load database showcase queries:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to load database showcase queries" },
    });
  }
});

// GET /api/v1/admin/database-showcase/triggers — safe PostgreSQL catalog metadata only.
router.get("/database-showcase/triggers", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        trigger.tgname AS "triggerName",
        table_class.relname AS "tableName",
        COALESCE(
          NULLIF(
            concat_ws(', ',
              CASE WHEN (trigger.tgtype & 4) <> 0 THEN 'INSERT' END,
              CASE WHEN (trigger.tgtype & 8) <> 0 THEN 'DELETE' END,
              CASE WHEN (trigger.tgtype & 16) <> 0 THEN 'UPDATE' END
            ),
            ''
          ),
          'OTHER'
        ) AS "event",
        trigger.tgenabled = 'O' AS "enabled"
      FROM pg_trigger trigger
      JOIN pg_class table_class ON table_class.oid = trigger.tgrelid
      JOIN pg_namespace table_schema ON table_schema.oid = table_class.relnamespace
      WHERE NOT trigger.tgisinternal
        AND table_schema.nspname = current_schema()
        AND trigger.tgname = ANY($1::text[])
      ORDER BY trigger.tgname
      `,
      [
        [
          "trg_users_updated_at",
          "trg_audit_logs_append_only",
          "trg_trust_scores_restrict_update",
          "trg_repayments_append_only",
          "trg_users_ensure_lender_investor_profile",
        ],
      ],
    );

    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Failed to load database showcase triggers:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to load database showcase triggers" },
    });
  }
});

// PUT /api/v1/admin/applications/:id/review — approve/reject application
router.put("/applications/:id/review", requireAuth, requireAdminOrPartnerAgent, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const reviewerId = authReq.auth!.userId;
  const reviewerRole = authReq.auth!.role;

  const { decision, reason } = req.body as { decision: string; reason?: string };
  if (!decision || !["approved", "rejected"].includes(decision)) {
    return res.status(400).json({
      success: false,
      error: { message: "Decision must be 'approved' or 'rejected'" },
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const appResult = await client.query(
      `SELECT application_id, user_id, partner_id, status
       FROM loan_applications
       WHERE application_id = $1
       FOR UPDATE`,
      [req.params.id],
    );

    if (appResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        error: { message: "Application not found" },
      });
    }

    const app = appResult.rows[0] as any;
    const oldStatus = app.status;

    // NEW: partner_agent may only review applications belonging to their own partner
    if (reviewerRole === "partner_agent") {
      const employeeResult = await client.query(
        `SELECT partner_id FROM users WHERE user_id = $1`,
        [reviewerId],
      );
      const employeePartnerId = employeeResult.rows[0]?.partner_id ?? null;
      if (!employeePartnerId || employeePartnerId !== app.partner_id) {
        await client.query("ROLLBACK");
        return res.status(403).json({
          success: false,
          error: { message: "You can only review applications for your own partner organization" },
        });
      }
    }

    // NEW: reuse the existing verification/KYC state before allowing approval
    if (decision === "approved") {
      const verificationResult = await client.query(
        `SELECT profile_completion_status FROM user_profiles WHERE user_id = $1`,
        [app.user_id],
      );
      if (verificationResult.rows[0]?.profile_completion_status !== "verified") {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          error: { message: "Applicant's profile verification is not complete" },
        });
      }
    }

    // Update application status
    await client.query(`UPDATE loan_applications SET status = $1 WHERE application_id = $2`, [
      decision,
      req.params.id,
    ]);

    // Record partner decision if partner is associated
    // (decided_by already carries whichever authenticated user — admin or partner_agent — took the action)
    if (app.partner_id) {
      await client.query(
        `INSERT INTO partner_decisions (application_id, partner_id, decision, reason, decided_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.params.id, app.partner_id, decision, reason ?? null, reviewerId],
      );
    }

    // Audit log
    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, before_state, after_state)
       VALUES ($1, 'application_review', 'loan_application', $2, $3, $4)`,
      [
        reviewerId,
        req.params.id,
        JSON.stringify({ status: oldStatus }),
        JSON.stringify({ status: decision, reason }),
      ],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      data: { applicationId: req.params.id, status: decision },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to review application:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to review application" },
    });
  } finally {
    client.release();
  }
});

// PUT /api/v1/admin/verification/:id/review — approve/reject verification
router.put("/verification/:id/review", requireAuth, requireAdmin, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const reviewerId = authReq.auth!.userId;

  const { status, notes } = req.body as { status: string; notes?: string };
  if (!status || !["approved", "rejected", "needs_review"].includes(status)) {
    return res.status(400).json({
      success: false,
      error: { message: "Status must be 'approved', 'rejected', or 'needs_review'" },
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE verification_requests
       SET status = $1, reviewer_id = $2, reviewer_notes = $3, reviewed_at = NOW()
       WHERE request_id = $4
       RETURNING request_id AS "requestId", user_id AS "userId", verification_type AS "verificationType", status`,
      [status, reviewerId, notes ?? null, req.params.id],
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        error: { message: "Verification request not found" },
      });
    }

    // Update document statuses if approving/rejecting
    if (status === "approved") {
      await client.query(
        `UPDATE verification_documents SET document_status = 'verified'
         WHERE request_id = $1 AND document_status IN ('uploaded', 'under_review')`,
        [req.params.id],
      );
    } else if (status === "rejected") {
      await client.query(
        `UPDATE verification_documents SET document_status = 'rejected'
         WHERE request_id = $1 AND document_status IN ('uploaded', 'under_review')`,
        [req.params.id],
      );
    }

    await client.query("COMMIT");
    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to review verification:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to review verification request" },
    });
  } finally {
    client.release();
  }
});

export default router;
