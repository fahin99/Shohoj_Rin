import { Router } from "express";
import { z } from "zod";
import { pool } from "../lib/db.js";
import { requireAuth } from "../middleware/authenticate.js";

const router = Router();

const searchSchema = z.object({
  q: z.string().trim().min(1).max(100),
  type: z.enum(['college', 'university', 'vocational', 'other']).optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

router.get("/search", async (req, res) => {
  const parsed = searchSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid search parameters", details: parsed.error.flatten() },
    });
  }

  const { q, type, limit } = parsed.data;
  const client = await pool.connect();
  
  try {
    let query = `
      SELECT institution_id, name, type, is_verified
      FROM institutions
      WHERE name ILIKE $1
    `;
    const params: any[] = [`%${q}%`];
    let paramCount = 1;

    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

    // Order by exact prefix match first, then alphabetical
    query += `
      ORDER BY 
        CASE WHEN name ILIKE $${paramCount + 1} THEN 0 ELSE 1 END,
        name ASC
      LIMIT $${paramCount + 2}
    `;
    params.push(`${q}%`, limit);

    const result = await client.query(query, params);
    
    return res.status(200).json({
      success: true,
      data: { institutions: result.rows },
    });
  } catch (error) {
    console.error("Failed to search institutions:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to search institutions" },
    });
  } finally {
    client.release();
  }
});

const createSchema = z.object({
  name: z.string().trim().min(2).max(255).transform(s => s.replace(/\s+/g, ' ')),
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid institution data", details: parsed.error.flatten() },
    });
  }

  const { name } = parsed.data;
  const client = await pool.connect();

  try {
    const checkResult = await client.query(
      `SELECT institution_id, name, type, is_verified FROM institutions WHERE LOWER(TRIM(name)) = LOWER($1)`,
      [name]
    );

    if (checkResult.rows.length > 0) {
      return res.status(200).json({
        success: true,
        data: checkResult.rows[0],
      });
    }

    const insertResult = await client.query(
      `INSERT INTO institutions (name, type, is_verified)
       VALUES ($1, 'other', false)
       RETURNING institution_id, name, type, is_verified`,
      [name]
    );

    return res.status(201).json({
      success: true,
      data: insertResult.rows[0],
    });
  } catch (error) {
    console.error("Failed to create institution:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to create institution" },
    });
  } finally {
    client.release();
  }
});

export default router;
