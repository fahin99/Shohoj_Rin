import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { pool } from '../../lib/db.js';

describe('Institution Search & Management Engine', () => {
  beforeAll(async () => {
    // Ensure test institutions exist
    await pool.query(`
      INSERT INTO institutions (name, type, is_verified)
      VALUES 
        ('University of Dhaka', 'university', true),
        ('Dhaka College', 'college', true),
        ('Dhaka City College', 'college', true),
        ('North South University (NSU)', 'university', true)
      ON CONFLICT (name) DO NOTHING
    `);
  });

  afterAll(async () => {
    // Clean up any test-created custom institution
    await pool.query(`DELETE FROM institutions WHERE name = 'Custom Test University'`);
  });

  it('searches institutions with case-insensitive partial match', async () => {
    const res = await pool.query(
      `SELECT institution_id, name, type, is_verified 
       FROM institutions 
       WHERE name ILIKE $1 
       ORDER BY name ASC`,
      ['%dhaka%']
    );
    expect(res.rows.length).toBeGreaterThan(0);
    expect(res.rows.some((r) => r.name.toLowerCase().includes('dhaka'))).toBe(true);
  });

  it('prioritizes prefix matches before general alphabetical matches', async () => {
    const q = 'Dhaka';
    const res = await pool.query(
      `SELECT institution_id, name, type, is_verified
       FROM institutions
       WHERE name ILIKE $1
       ORDER BY 
         CASE WHEN name ILIKE $2 THEN 0 ELSE 1 END,
         name ASC
       LIMIT 10`,
      [`%${q}%`, `${q}%`]
    );
    expect(res.rows.length).toBeGreaterThan(0);
    // Prefix matches starting with "Dhaka" should appear first
    expect(res.rows[0].name.startsWith('Dhaka')).toBe(true);
  });

  it('filters institutions by type (university / college)', async () => {
    const resColleges = await pool.query(
      `SELECT institution_id, name, type FROM institutions WHERE name ILIKE $1 AND type = $2`,
      ['%dhaka%', 'college']
    );
    expect(resColleges.rows.every((r) => r.type === 'college')).toBe(true);

    const resUnis = await pool.query(
      `SELECT institution_id, name, type FROM institutions WHERE name ILIKE $1 AND type = $2`,
      ['%dhaka%', 'university']
    );
    expect(resUnis.rows.every((r) => r.type === 'university')).toBe(true);
  });

  it('respects limit constraints', async () => {
    const res = await pool.query(`SELECT institution_id, name FROM institutions LIMIT 2`);
    expect(res.rows.length).toBeLessThanOrEqual(2);
  });

  it('creates and reuses local records without duplicating existing names', async () => {
    const customName = 'Custom Test University';

    // 1. First insert
    const insertRes = await pool.query(
      `INSERT INTO institutions (name, type, is_verified)
       VALUES ($1, 'other', false)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING institution_id, name, is_verified`,
      [customName]
    );
    const createdId = insertRes.rows[0].institution_id;
    expect(insertRes.rows[0].is_verified).toBe(false);

    // 2. Second lookup with same name (case-insensitive check)
    const checkRes = await pool.query(
      `SELECT institution_id, name FROM institutions WHERE LOWER(TRIM(name)) = LOWER($1)`,
      [customName.toLowerCase()]
    );
    expect(checkRes.rows.length).toBe(1);
    expect(checkRes.rows[0].institution_id).toBe(createdId);
  });
});
