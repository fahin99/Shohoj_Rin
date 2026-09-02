import { pool } from "../lib/db.js";
import { matchApplicationToLenders } from "../services/lender-matching.service.js";
const MATCHABLE_STATUSES = ["submitted", "under_review", "approved"];

type MatchableApplication = {
  application_id: string;
  purpose: string;
};

async function findApplicationsNeedingBackfill(): Promise<MatchableApplication[]> {
  const result = await pool.query<MatchableApplication>(
    `SELECT la.application_id, la.purpose
     FROM loan_applications la
     WHERE la.status = ANY($1::varchar[])
       AND NOT EXISTS (
         SELECT 1 FROM lender_application_matches lam
         WHERE lam.application_id = la.application_id
       )
       AND la.requested_amount > COALESCE((
         SELECT SUM(fc.amount) FROM funding_commitments fc
         WHERE fc.application_id = la.application_id AND fc.status = 'committed'
       ), 0)
     ORDER BY la.created_at ASC`,
    [MATCHABLE_STATUSES],
  );
  return result.rows;
}

async function backfillLenderMatches() {
  console.log("🔁 Backfilling lender_application_matches for pre-existing applications...\n");

  const applications = await findApplicationsNeedingBackfill();
  console.log(
    `Found ${applications.length} application(s) with a matchable status and no existing match rows.`,
  );

  let matchedApplications = 0;
  let totalMatchRows = 0;
  let failed = 0;

  for (const application of applications) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const matches = await matchApplicationToLenders(
        client,
        application.application_id,
        application.purpose,
      );
      await client.query("COMMIT");
      matchedApplications += 1;
      totalMatchRows += matches.length;
      console.log(
        `  ✓ ${application.application_id} (${application.purpose}) → ${matches.length} lender(s)`,
      );
    } catch (error) {
      await client.query("ROLLBACK");
      failed += 1;
      console.error(`  ✗ ${application.application_id}: failed to backfill matches`, error);
    } finally {
      client.release();
    }
  }

  console.log(
    `\nOK Backfill complete. ${matchedApplications}/${applications.length} application(s) processed, ` +
      `${totalMatchRows} match row(s) created, ${failed} failure(s).`,
  );
}

backfillLenderMatches()
  .catch((error) => {
    console.error("X Backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });