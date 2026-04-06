import { Router, Response } from 'express';
import pool from '../db/pool';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// ─── Teacher: Own Courses ───────────────────────────────────────────
// GET /api/courses — teacher's own courses
router.get('/', requireRole('teacher'), async (req: AuthRequest, res: Response) => {
  const { rows } = await pool.query(
    `SELECT c.*, COUNT(DISTINCT e.id)::int AS enrollment_count,
       EXISTS (
         SELECT 1 FROM sessions s
         WHERE s.course_id = c.id AND s.ended_at IS NULL
       ) AS has_live_session,
       (SELECT s.id FROM sessions s WHERE s.course_id = c.id AND s.ended_at IS NULL LIMIT 1) AS live_session_id
     FROM courses c
     LEFT JOIN enrollments e ON e.course_id = c.id
     WHERE c.teacher_id = $1
     GROUP BY c.id
     ORDER BY c.created_at DESC`,
    [req.user!.id]
  );
  res.json(rows);
});

// GET /api/courses/teacher/students — list all students for the logged-in teacher
router.get('/teacher/students', requireRole('teacher'), async (req: AuthRequest, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.phone_number, u.gender,
         COUNT(e.course_id)::int as enrolled_courses
       FROM users u
       JOIN enrollments e ON e.student_id = u.id
       JOIN courses c ON c.id = e.course_id
       WHERE c.teacher_id = $1 AND u.role = 'student'
       GROUP BY u.id, u.name, u.email, u.phone_number, u.gender
       ORDER BY u.name ASC`,
      [req.user!.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/courses/teacher/students/:studentId/details — get detailed attendance stats for a student
router.get('/teacher/students/:studentId/details', requireRole('teacher'), async (req: AuthRequest, res: Response) => {
  try {
    const { rows: studentRows } = await pool.query(
      `SELECT id, name, email, phone_number, gender FROM users WHERE id = $1 AND role = 'student'`,
      [req.params.studentId]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const { rows: courseStats } = await pool.query(
      `SELECT 
         c.id, c.title, c.code,
         COUNT(DISTINCT s.id)::int AS total_sessions,
         COUNT(DISTINCT a.session_id)::int AS present_count
       FROM courses c
       JOIN enrollments e ON e.course_id = c.id AND e.student_id = $2
       LEFT JOIN sessions s ON s.course_id = c.id AND s.ended_at IS NOT NULL
       LEFT JOIN attendance a ON a.session_id = s.id AND a.student_id = $2 AND a.status = 'present'
       WHERE c.teacher_id = $1
       GROUP BY c.id, c.title, c.code
       ORDER BY c.title ASC`,
      [req.user!.id, req.params.studentId]
    );

    let totalClasses = 0;
    let totalPresent = 0;

    const courses = courseStats.map(c => {
      totalClasses += c.total_sessions;
      totalPresent += c.present_count;
      const percent = c.total_sessions > 0 ? Math.round((c.present_count / c.total_sessions) * 100) : 0;
      return {
        ...c,
        percent,
      };
    });

    const totalAbsent = totalClasses - totalPresent;
    const overallPercent = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

    res.json({
      student: studentRows[0],
      overview: {
        totalClasses,
        totalPresent,
        totalAbsent,
        overallPercent
      },
      courses
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/courses — create course (teacher)
router.post('/', requireRole('teacher'), async (req: AuthRequest, res: Response) => {
  const { title, code, description, cover_image_url } = req.body;
  if (!title || !code) return res.status(400).json({ error: 'title and code are required' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO courses (teacher_id, code, title, description, cover_image_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user!.id, code, title, description ?? null, cover_image_url ?? null]
    );
    res.status(201).json(rows[0]);
  } catch (err: any) {
    if (err.code === '23505') return res.status(409).json({ error: 'Course code already exists' });
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/courses/:id — update course (teacher, own only)
router.put('/:id', requireRole('teacher'), async (req: AuthRequest, res: Response) => {
  const { title, code, description, cover_image_url, status } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE courses
       SET title = COALESCE($1, title),
           code = COALESCE($2, code),
           description = COALESCE($3, description),
           cover_image_url = COALESCE($4, cover_image_url),
           status = COALESCE($5, status)
       WHERE id = $6 AND teacher_id = $7
       RETURNING *`,
      [title, code, description, cover_image_url, status, req.params.id, req.user!.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Course not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/courses/:id — delete course (teacher, own only)
router.delete('/:id', requireRole('teacher'), async (req: AuthRequest, res: Response) => {
  const { rowCount } = await pool.query(
    'DELETE FROM courses WHERE id = $1 AND teacher_id = $2',
    [req.params.id, req.user!.id]
  );
  if (!rowCount) return res.status(404).json({ error: 'Course not found' });
  res.status(204).send();
});

// GET /api/courses/:id/students — list enrolled students (teacher)
router.get('/:id/students', requireRole('teacher'), async (req: AuthRequest, res: Response) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, NULL as reg_no, NULL as major, NULL as semester, e.enrolled_at
     FROM enrollments e
     JOIN users u ON u.id = e.student_id
     WHERE e.course_id = $1`,
    [req.params.id]
  );
  res.json(rows);
});


// ─── Student: Available + Enrolled ─────────────────────────────────
// GET /api/courses/available — all active courses (student)
router.get('/available', requireRole('student'), async (req: AuthRequest, res: Response) => {
  const { rows } = await pool.query(
    `SELECT c.*, u.name AS teacher_name,
       COUNT(e.id)::int AS enrollment_count,
       EXISTS (
         SELECT 1 FROM enrollments e2
         WHERE e2.course_id = c.id AND e2.student_id = $1
       ) AS is_enrolled
     FROM courses c
     JOIN users u ON u.id = c.teacher_id
     LEFT JOIN enrollments e ON e.course_id = c.id
     WHERE c.status = 'active'
     GROUP BY c.id, u.name
     ORDER BY c.created_at DESC`,
    [req.user!.id]
  );
  res.json(rows);
});

// GET /api/courses/my — student's enrolled courses
router.get('/my', requireRole('student'), async (req: AuthRequest, res: Response) => {
  const { rows } = await pool.query(
    `SELECT c.*, u.name AS teacher_name, e.enrolled_at,
       EXISTS (
         SELECT 1 FROM sessions s
         WHERE s.course_id = c.id AND s.ended_at IS NULL
       ) AS has_live_session,
       (SELECT s.id FROM sessions s WHERE s.course_id = c.id AND s.ended_at IS NULL LIMIT 1) AS live_session_id
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     JOIN users u ON u.id = c.teacher_id
     WHERE e.student_id = $1
     ORDER BY e.enrolled_at DESC`,
    [req.user!.id]
  );
  res.json(rows);
});

// POST /api/courses/:id/enroll — enroll in course (student)
router.post('/:id/enroll', requireRole('student'), async (req: AuthRequest, res: Response) => {
  try {
    const { rows: courseRows } = await pool.query(
      'SELECT id FROM courses WHERE id = $1 AND status = $2',
      [req.params.id, 'active']
    );
    if (!courseRows[0]) return res.status(404).json({ error: 'Course not found or not active' });

    await pool.query(
      'INSERT INTO enrollments (course_id, student_id) VALUES ($1, $2)',
      [req.params.id, req.user!.id]
    );
    res.status(201).json({ message: 'Enrolled successfully' });
  } catch (err: any) {
    if (err.code === '23505') return res.status(409).json({ error: 'Already enrolled in this course' });
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
