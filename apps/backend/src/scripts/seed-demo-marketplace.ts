import { pool } from "../lib/db.js";
import { seedLoanProducts } from "./seed-loan-products.js";

async function ensureVerificationDemo(client: any, userId: string) {
  const identityCheck = await client.query(
    `SELECT 1 FROM verification_requests WHERE user_id = $1 AND verification_type = 'identity' AND status = 'approved' LIMIT 1`,
    [userId],
  );

  if (identityCheck.rowCount === 0) {
    await client.query(
      `INSERT INTO verification_requests (user_id, verification_type, status, verification_source)
       VALUES ($1, 'identity', 'approved', 'demo_verification')`,
      [userId],
    );
  }

  const incomeCheck = await client.query(
    `SELECT 1 FROM verification_requests WHERE user_id = $1 AND verification_type = 'income' AND status = 'approved' LIMIT 1`,
    [userId],
  );

  if (incomeCheck.rowCount === 0) {
    await client.query(
      `INSERT INTO verification_requests (user_id, verification_type, status, verification_source)
       VALUES ($1, 'income', 'approved', 'demo_verification')`,
      [userId],
    );
  }

  const studentCheck = await client.query(
    `SELECT 1 FROM verification_requests WHERE user_id = $1 AND verification_type = 'student' AND status = 'approved' LIMIT 1`,
    [userId],
  );

  if (studentCheck.rowCount === 0) {
    await client.query(
      `INSERT INTO verification_requests (user_id, verification_type, status, verification_source)
       VALUES ($1, 'student', 'approved', 'demo_verification')`,
      [userId],
    );
  }

  await client.query(
    `UPDATE user_profiles
     SET profile_completion_status = 'verified',
         monthly_income = COALESCE(monthly_income, 55000),
         occupation = COALESCE(occupation, 'Business Owner')
     WHERE user_id = $1`,
    [userId],
  );
}

async function ensureCurrentTrustScore(client: any, userId: string, score: number, band: string) {
  const trustResult = await client.query(
    `SELECT score_id FROM trust_scores WHERE user_id = $1 AND is_current = TRUE LIMIT 1`,
    [userId],
  );

  if (trustResult.rowCount > 0) {
    return trustResult.rows[0].score_id;
  }

  const insertResult = await client.query(
    `INSERT INTO trust_scores (user_id, score, trust_band, confidence_score, trigger_event, is_current)
     VALUES ($1, $2, $3, 0.92, 'demo_seed', TRUE)
     RETURNING score_id`,
    [userId, score, band],
  );

  return insertResult.rows[0].score_id;
}

async function seedDemoMarketplace() {
  console.log("🌱 Seeding demo marketplace data...\n");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await seedLoanProducts(client);

    const borrowers = await client.query(
      `SELECT u.user_id, up.full_name, ts.score_id, ts.score, ts.trust_band
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.user_id
       LEFT JOIN trust_scores ts ON ts.user_id = u.user_id AND ts.is_current = TRUE
       WHERE u.role = 'borrower'
       ORDER BY u.created_at
       LIMIT 6`,
    );

    if (borrowers.rowCount === 0) {
      throw new Error(
        "No borrower users found. Please seed user accounts before running demo marketplace seeding.",
      );
    }

    // NOTE: lp.category is selected here (not just name/partner) because it is the
    // canonical value that must be written to loan_applications.purpose — lender
    // matching (matchApplicationToLenders) compares purpose against each lender's
    // investor_profiles.preferred_categories, which only ever contains canonical
    // categories ("education" | "emergency" | "business" | "personal" | "development").
    const products = await client.query(
      `SELECT lp.product_id, lp.name, lp.category, fp.partner_id, fp.name AS partner_name
       FROM loan_products lp
       JOIN funding_partners fp ON fp.partner_id = lp.partner_id
       WHERE lp.is_active = TRUE
       ORDER BY lp.created_at`,
    );

    if (products.rowCount === 0) {
      throw new Error(
        "No active loan products exist. Seed loan products before generating demo applications.",
      );
    }

    // `purposeDescription` is free text for humans; `purpose` (set below from the
    // matched product's canonical category) is what lender matching actually reads.
    const applicationTemplates = [
      {
        userIndex: 0,
        productName: "Student Tuition Support Loan",
        requestedAmount: 180000,
        purposeDescription: "Tuition fees",
        status: "submitted",
        daysAgo: 5,
      },
      {
        userIndex: 1,
        productName: "Small Business Working Capital Facility",
        requestedAmount: 450000,
        purposeDescription: "Inventory purchase",
        status: "under_review",
        daysAgo: 9,
      },
      {
        userIndex: 2,
        productName: "Emergency Medical Assistance",
        requestedAmount: 120000,
        purposeDescription: "Medical treatment",
        status: "approved",
        daysAgo: 12,
      },
      {
        userIndex: 3,
        productName: "Personal Flexible Loan",
        requestedAmount: 210000,
        purposeDescription: "Home repair",
        status: "submitted",
        daysAgo: 3,
      },
      {
        userIndex: 4,
        productName: "Skills & Professional Development Loan",
        requestedAmount: 65000,
        purposeDescription: "Certification course",
        status: "approved",
        daysAgo: 15,
      },
    ];

    for (const template of applicationTemplates) {
      const borrower = borrowers.rows[template.userIndex];
      if (!borrower) continue;

      const product = products.rows.find((row: any) => row.name === template.productName);
      if (!product) continue;

      await ensureVerificationDemo(client, borrower.user_id);
      const trustScoreId = await ensureCurrentTrustScore(
        client,
        borrower.user_id,
        borrower.score ?? 75,
        borrower.trust_band ?? "low_risk",
      );

      const existingApp = await client.query(
        `SELECT application_id
         FROM loan_applications
         WHERE user_id = $1 AND product_id = $2 AND purpose = $3 AND requested_amount = $4
         LIMIT 1`,
        [borrower.user_id, product.product_id, product.category, template.requestedAmount],
      );

      if (existingApp.rowCount === 0) {
        await client.query(
          `INSERT INTO loan_applications (
            user_id,
            partner_id,
            product_id,
            requested_amount,
            purpose,
            purpose_description,
            status,
            trust_score_id,
            submitted_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - ($9 || ' days')::interval)`,
          [
            borrower.user_id,
            product.partner_id,
            product.product_id,
            template.requestedAmount,
            product.category,
            `Demo ${template.purposeDescription.toLowerCase()} financing for ${borrower.full_name ?? "borrower"}.`,
            template.status,
            trustScoreId,
            template.daysAgo,
          ],
        );
      }
    }

    await client.query("COMMIT");
    console.log("OK Demo marketplace seeded successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("X Demo marketplace seed failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

void seedDemoMarketplace().catch((error) => {
  console.error(error);
  process.exit(1);
});