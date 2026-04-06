import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/haziri'
});

async function run() {
  try {
    const res = await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS gender VARCHAR(50);
    `);
    console.log('Successfully added gender column to users table.', res.command);
  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    await pool.end();
  }
}

run();
