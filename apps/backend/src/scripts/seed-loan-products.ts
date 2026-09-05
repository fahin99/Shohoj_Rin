import { pool, closePool } from "../lib/db.js";
import { fileURLToPath } from "node:url";
import type { PoolClient } from "pg";

export async function seedLoanProducts(existingClient?: PoolClient) {
  console.log("🌱 Seeding loan products...\n");

  const partners = [
    { name: "Bengal Microfinance Bank", type: "bank" },
    { name: "Shohoj Care Finance", type: "mfi" },
    { name: "Dhaka Trade Credit", type: "bank" },
    { name: "Shohoj Learn Finance", type: "mfi" },
    { name: "Padma Rural Finance", type: "mfi" },
  ];

  const products = [
    {
      partnerName: "Bengal Microfinance Bank",
      name: "Student Tuition Support Loan",
      category: "education",
      minAmount: 20000,
      maxAmount: 500000,
      interestRate: 8.0,
      durationMonths: 48,
      description:
        "Affordable education financing for students pursuing higher education, covering tuition fees, books, and living expenses. Flexible repayment starts after graduation.",
      eligibility: [
        "Enrolled in recognized institution",
        "Valid student ID",
        "Guarantor required for amounts above ৳2,00,000",
        "Bangladesh national",
      ],
      tags: ["education", "tuition", "student", "low-interest"],
    },
    {
      partnerName: "Shohoj Care Finance",
      name: "Emergency Medical Assistance",
      category: "emergency",
      minAmount: 10000,
      maxAmount: 200000,
      interestRate: 10.5,
      durationMonths: 24,
      description:
        "Quick-disbursement medical emergency loans for unexpected health expenses. Fast approval process with minimal documentation for urgent medical needs.",
      eligibility: ["Valid NID", "Medical documentation", "Active bank account", "Age 18-60"],
      tags: ["emergency", "medical", "quick-disbursement", "health"],
    },
    {
      partnerName: "Dhaka Trade Credit",
      name: "Small Business Working Capital Facility",
      category: "business",
      minAmount: 50000,
      maxAmount: 1500000,
      interestRate: 12.0,
      durationMonths: 36,
      description:
        "Working capital financing for small and micro businesses. Supports inventory purchase, equipment maintenance, and operational expenses with flexible terms.",
      eligibility: [
        "Business registration or trade license",
        "6 months business operation",
        "Income proof",
        "Valid NID",
      ],
      tags: ["business", "working-capital", "sme", "growth"],
    },
    {
      partnerName: "Shohoj Learn Finance",
      name: "Skills & Professional Development Loan",
      category: "development",
      minAmount: 10000,
      maxAmount: 100000,
      interestRate: 9.0,
      durationMonths: 18,
      description:
        "Invest in your professional growth with loans for skill development courses, certifications, and vocational training programs.",
      eligibility: ["Valid NID", "Course enrollment proof", "Age 18-45", "Bangladesh resident"],
      tags: ["skills", "training", "professional", "development"],
    },
    {
      partnerName: "Bengal Microfinance Bank",
      name: "Personal Flexible Loan",
      category: "personal",
      minAmount: 15000,
      maxAmount: 300000,
      interestRate: 11.25,
      durationMonths: 30,
      description:
        "Versatile personal loan for various needs including home repairs, family events, relocation expenses, and other personal requirements.",
      eligibility: [
        "Valid NID",
        "Proof of income",
        "Active bank account",
        "Age 21-55",
        "Minimum 6 months employment",
      ],
      tags: ["personal", "flexible", "multi-purpose"],
    },
    {
      partnerName: "Padma Rural Finance",
      name: "Rural Entrepreneur Growth Loan",
      category: "business",
      minAmount: 25000,
      maxAmount: 400000,
      interestRate: 10.0,
      durationMonths: 24,
      description:
        "Tailored financing for rural entrepreneurs and agricultural businesses. Supports crop production, livestock, and rural enterprise expansion.",
      eligibility: [
        "Rural residence proof",
        "Business or farming activity proof",
        "Valid NID",
        "Community reference",
      ],
      tags: ["rural", "agriculture", "entrepreneur", "growth"],
    },
  ];

  const client = existingClient ?? (await pool.connect());
  const shouldManageTransaction = !existingClient;
  try {
    if (shouldManageTransaction) {
      await client.query("BEGIN");
    }

    // Upsert partners
    const partnerIds: Record<string, string> = {};
    for (const partner of partners) {
      const result = await client.query(
        `INSERT INTO funding_partners (name, type)
         VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type
         RETURNING partner_id`,
        [partner.name, partner.type],
      );
      partnerIds[partner.name] = result.rows[0].partner_id;
      console.log(`  ✓ Partner: ${partner.name} (${result.rows[0].partner_id})`);
    }

    // Upsert products
    for (const product of products) {
      const partnerId = partnerIds[product.partnerName];
      await client.query(
        `INSERT INTO loan_products (partner_id, name, category, min_amount, max_amount, interest_rate, duration_months, description, eligibility, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT DO NOTHING`,
        [
          partnerId,
          product.name,
          product.category,
          product.minAmount,
          product.maxAmount,
          product.interestRate,
          product.durationMonths,
          product.description,
          JSON.stringify(product.eligibility),
          product.tags,
        ],
      );
      console.log(`  ✓ Product: ${product.name} (${product.category})`);
    }

    if (shouldManageTransaction) {
      await client.query("COMMIT");
    }
    console.log("\n✅ Loan products seeded successfully!");
  } catch (error) {
    if (shouldManageTransaction) {
      await client.query("ROLLBACK");
    }
    console.error("\n❌ Seed failed:", error);
    throw error;
  } finally {
    if (shouldManageTransaction) {
      client.release();
      await closePool();
    }
  }
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  void seedLoanProducts();
}
