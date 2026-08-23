import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  const client = await pool.connect();
  try{
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    const migrationsDir = path.resolve(__dirname, '../../migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();
    const { rows } = await client.query('SELECT name FROM migrations');
    const executedMigrations = new Set(rows.map(r => r.name));
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      );
    `);

    if (tableCheck.rows[0].exists && !executedMigrations.has('schema.sql')) {
      console.log('Existing database detected. Baselining schema.sql...');
      await client.query("INSERT INTO migrations (name) VALUES ('schema.sql') ON CONFLICT DO NOTHING");
      executedMigrations.add('schema.sql');
    }
    for (const file of sqlFiles) {
      if (executedMigrations.has(file)) {
        continue;
      }

      console.log(`Executing migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf-8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Migration ${file} completed successfully.`);
      } 
      catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error executing migration ${file}:`, error);
        throw error;
      }
    }
    
    console.log('All migrations executed successfully.');
  } 
  finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});