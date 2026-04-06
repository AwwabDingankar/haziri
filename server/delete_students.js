const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    // Delete dependent attendance records
    await pool.query("DELETE FROM attendance WHERE student_id IN (SELECT id FROM users WHERE role = 'student')");
    // enrollments have ON DELETE CASCADE, but we can do it explicitly or skip it
    
    // Delete students
    const res = await pool.query("DELETE FROM users WHERE role = 'student'");
    console.log(`Successfully deleted ${res.rowCount} student(s) from the database.`);
  } catch (err) {
    console.error('Error deleting students:', err);
  } finally {
    await pool.end();
  }
}

run();
