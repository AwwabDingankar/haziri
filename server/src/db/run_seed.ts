import fs from 'fs';
import path from 'path';
import pool from './pool';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    const hash = await bcrypt.hash('teacher123', 10);
    const sqlPath = path.join(__dirname, 'seed.sql');
    let sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Replace the problematic hash with the valid one
    sql = sql.replace(/\$2a\$12\$tU4K9O4Zz6X\.T0jV1N\.Z9e2S2M4A1Y\.qJ4mX9L2W1mP4E\.N8Q1Z\.q/g, hash);
    
    console.log('Running seed script...');
    await pool.query(sql);
    console.log('Seed executed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error executing seed script:', error);
    process.exit(1);
  }
}

seed();
