import { pool } from "../lib/db.js";
import { TrustInputs } from "./trust.service.js";
export async function buildTrustInputs(userId: string): Promise<TrustInputs> {
  const now = new Date();
  const repaymentRes = await pool.query(`
    SELECT 
      rs.status as schedule_status,
      r.status as repayment_status,
      rs.due_date,
      r.paid_at
    FROM loans l
    JOIN repayment_schedules rs ON l.loan_id = rs.loan_id
    LEFT JOIN repayments r ON rs.schedule_id = r.schedule_id
    WHERE l.user_id = $1
  `, [userId]);
  let totalDuePayments = 0;
  let onTimePayments = 0;
  let latePayments = 0;
  let missedPayments = 0;
  let defaults = 0;
  let totalRepaymentCount = 0;
  for (const row of repaymentRes.rows) {
    const dueDate = new Date(row.due_date);
    if (row.schedule_status === 'paid') {
      const paidAt = row.paid_at ? new Date(row.paid_at) : null;
      if (paidAt && paidAt <= dueDate) {
        onTimePayments++;
      } else {
        latePayments++;
      }
      totalRepaymentCount++;
      if (dueDate <= now) totalDuePayments++;
    } else if (row.schedule_status === 'defaulted') {
      defaults++;
      if (dueDate <= now) totalDuePayments++;
    } else if (['pending', 'overdue'].includes(row.schedule_status)) {
      if (dueDate < now) {
        missedPayments++;
        totalDuePayments++;
      } else if (dueDate <= now) {
        totalDuePayments++;
      }
    }
  }
  const financialRes = await pool.query(`
    SELECT monthly_family_income 
    FROM user_profiles 
    WHERE user_id = $1
  `, [userId]);
  const monthlyIncome = financialRes.rows.length > 0 && financialRes.rows[0].monthly_family_income != null
    ? Number(financialRes.rows[0].monthly_family_income)
    : null;
  const obligationsRes = await pool.query(`
    SELECT 
      COUNT(DISTINCT l.loan_id) as active_loans,
      COALESCE(SUM(rs.expected_amount), 0) as monthly_obligations
    FROM loans l
    JOIN repayment_schedules rs ON l.loan_id = rs.loan_id
    WHERE l.user_id = $1 
      AND l.status = 'active' 
      AND rs.status IN ('pending', 'overdue')
      AND rs.due_date >= DATE_TRUNC('month', CURRENT_DATE) 
      AND rs.due_date < (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month')
  `, [userId]);
  const activeLoanCount = Number(obligationsRes.rows[0]?.active_loans || 0);
  const monthlyDebtObligations = Number(obligationsRes.rows[0]?.monthly_obligations || 0);
  const hasTransactionData = false;
  const userRes = await pool.query(`
    SELECT email_verified, phone, created_at 
    FROM users 
    WHERE user_id = $1
  `, [userId]);
  const emailVerified = userRes.rows[0]?.email_verified || false;
  const phoneVerified = userRes.rows[0]?.phone != null;
  const accountCreatedAt = userRes.rows[0]?.created_at ? new Date(userRes.rows[0].created_at) : now;
  const accountAgeDays = Math.max(0, Math.floor((now.getTime() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24)));
  const verificationsRes = await pool.query(`
    SELECT verification_type 
    FROM verification_requests 
    WHERE user_id = $1 AND status = 'approved'
  `, [userId]);
  const verifications = new Set(verificationsRes.rows.map(r => r.verification_type));
  const verificationCount = verificationsRes.rows.length;
  const applicationsRes = await pool.query(`
    SELECT COUNT(*) as recent_apps
    FROM loan_applications
    WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '90 days'
  `, [userId]);
  const recentApplications = Number(applicationsRes.rows[0]?.recent_apps || 0);
  return {
    repayment: {
      totalDuePayments,
      onTimePayments,
      latePayments,
      missedPayments,
      defaults
    },
    financial: {
      monthlyIncome,
      monthlyDebtObligations,
      activeLoanCount
    },
    behavior: {
      hasTransactionData
    },
    verification: {
      identityVerified: verifications.has('identity'),
      phoneVerified,
      emailVerified,
      addressVerified: verifications.has('address'),
      incomeVerified: verifications.has('income'),
      studentVerified: verifications.has('student')
    },
    credit: {
      activeLoanCount,
      recentApplications
    },
    tenure: {
      accountAgeDays,
      totalRepaymentCount,
      verificationCount
    }
  };
}
