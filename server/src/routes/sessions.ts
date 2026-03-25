import { Router, Response } from 'express';
import pool from '../db/pool';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// POST /api/sessions/start — teacher starts a session
router.post('/start', requireRole('teacher'), async (req: AuthRequest, res: Response) => {
  const { courseId, latitude, longitude, radius_meters } = req.body;
  if (!courseId || latitude == null || longitude == null) {
    return res.status(400).json({ error: 'courseId, latitude, and longitude are required' });
  }

  try {
    // Verify course belongs to this teacher
    const { rows: courseRows } = await pool.query(
      'SELECT id FROM courses WHERE id = $1 AND teacher_id = $2',
      [courseId, req.user!.id]
    );
    if (!courseRows[0]) return res.status(404).json({ error: 'Course not found' });

    // Check no active session already running for this course
    const { rows: activeSessions } = await pool.query(
      'SELECT id FROM sessions WHERE course_id = $1 AND ended_at IS NULL',
      [courseId]
    );
    if (activeSessions.length > 0) {
      return res.status(409).json({ error: 'A session is already active for this course', sessionId: activeSessions[0].id });
    }

    const { rows } = await pool.query(
      `INSERT INTO sessions (course_id, teacher_id, latitude, longitude, radius_meters)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [courseId, req.user!.id, latitude, longitude, radius_meters ?? 50]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/sessions/:id/end — teacher ends session
router.put('/:id/end', requireRole('teacher'), async (req: AuthRequest, res: Response) => {
  try {
    const { rows } = await pool.query(
      `UPDATE sessions SET ended_at = NOW()
       WHERE id = $1 AND teacher_id = $2 AND ended_at IS NULL
       RETURNING *`,
      [req.params.id, req.user!.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Active session not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sessions/course/:courseId — past sessions for a course
router.get('/course/:courseId', requireRole('teacher'), async (req: AuthRequest, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.*,
         COUNT(a.id)::int AS present_count
       FROM sessions s
       LEFT JOIN attendance a ON a.session_id = s.id AND a.status = 'present'
       WHERE s.course_id = $1 AND s.teacher_id = $2
       GROUP BY s.id
       ORDER BY s.started_at DESC`,
      [req.params.courseId, req.user!.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sessions/:id — get session details (active status + attendance list)
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.*,
         c.title AS course_title,
         c.code AS course_code,
         u.name AS teacher_name,
         COUNT(a.id)::int AS present_count
       FROM sessions s
       JOIN courses c ON c.id = s.course_id
       JOIN users u ON u.id = s.teacher_id
       LEFT JOIN attendance a ON a.session_id = s.id AND a.status = 'present'
       WHERE s.id = $1
       GROUP BY s.id, c.title, c.code, u.name`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Session not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
