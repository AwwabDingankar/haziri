const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ connectionString: 'postgresql://postgres:awwab123@localhost:5432/haziri' });
async function run() {
  const { rows } = await pool.query(`SELECT
         u.id, u.name, u.email,
         COUNT(e.course_id)::int as enrolled_courses
       FROM users u
       JOIN enrollments e ON e.student_id = u.id
       JOIN courses c ON c.id = e.course_id
       WHERE c.teacher_id = '1f4f64c5-2235-437c-bf28-19cf7465af65' AND u.role = 'student'
       GROUP BY u.id, u.name, u.email
       ORDER BY u.name ASC`);
  fs.writeFileSync('db-output.json', JSON.stringify({ QUERY_RESULT: rows }, null, 2));
  pool.end();
}
run();
