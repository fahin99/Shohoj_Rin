import type { PoolClient } from "pg";

export interface LenderMatchResult {
  lenderUserId: string;
  priority: number;
}

/**
 * Matches a newly-submitted loan application to every active lender whose
 * `investor_profiles.preferred_categories` includes the application's purpose,
 * or who has no preferences set (matches everything). Priority mirrors each
 * lender's own preference ordering. Persists rows in `lender_application_matches`
 * and notifies matched lenders.
 */
export async function matchApplicationToLenders(
  client: Pick<PoolClient, "query">,
  applicationId: string,
  purpose: string,
): Promise<LenderMatchResult[]> {
  const lendersResult = await client.query<{
    user_id: string;
    preferred_categories: string[] | null;
  }>(
    `SELECT u.user_id, ip.preferred_categories
     FROM users u
     JOIN investor_profiles ip ON ip.user_id = u.user_id
     LEFT JOIN funding_partners fp ON fp.partner_id = u.partner_id
     WHERE u.role = 'lender'
       AND u.account_status = 'active'
       AND (u.partner_id IS NULL OR fp.is_active = TRUE)`,
  );

  const matches: LenderMatchResult[] = [];
  for (const row of lendersResult.rows) {
    const categories = Array.isArray(row.preferred_categories) ? row.preferred_categories : [];
    let priority: number;
    if (categories.length === 0) {
      priority = 999999;
    } else {
      const idx = categories.indexOf(purpose);
      if (idx === -1) continue;
      priority = idx + 1;
    }
    matches.push({ lenderUserId: row.user_id, priority });
  }

  for (const match of matches) {
    await client.query(
      `INSERT INTO lender_application_matches (application_id, lender_user_id, priority, status)
       VALUES ($1, $2, $3, 'pending')
       ON CONFLICT (application_id, lender_user_id) DO NOTHING`,
      [applicationId, match.lenderUserId, match.priority],
    );
    await client.query(
      `INSERT INTO notifications (user_id, channel, type, title, body)
       VALUES ($1, 'in_app', 'loan_decision', 'New funding opportunity',
               'A new loan application matching your lending preferences is available to review.')`,
      [match.lenderUserId],
    );
  }

  return matches;
}
