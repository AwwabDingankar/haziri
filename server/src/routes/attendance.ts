import { Router, Response } from 'express';
import pool from '../db/pool';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// Haversine formula — distance in metres between two GPS coords
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// POST /api/attendance/mark — student marks attendance
router.post('/mark', requireRole('student'), async (req: AuthRequest, res: Response) => {
  const { sessionId, latitude, longitude, deviceFingerprint } = req.body;

  if (!sessionId || latitude == null || longitude == null || !deviceFingerprint) {
    return res.status(400).json({ error: 'sessionId, latitude, longitude, and deviceFingerprint are required' });
  }

  try {
    // 1. Get the active session
    const { rows: sessionRows } = await pool.query(
      'SELECT * FROM sessions WHERE id = $1 AND ended_at IS NULL',
      [sessionId]
    );
    if (!sessionRows[0]) return res.status(404).json({ error: 'Session not found or already ended' });
    const session = sessionRows[0];

    // 2. Check student is enrolled in the session's course
    const { rows: enrollRows } = await pool.query(
      'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2',
      [session.course_id, req.user!.id]
    );
    if (!enrollRows[0]) return res.status(403).json({ error: 'You are not enrolled in this course' });

    // 3. Check device fingerprint not already used for this session
    const { rows: deviceRows } = await pool.query(
      'SELECT id FROM attendance WHERE session_id = $1 AND device_fingerprint = $2',
      [sessionId, deviceFingerprint]
    );
    if (deviceRows.length > 0) {
      return res.status(409).json({ error: 'Attendance already marked from this device' });
    }

    // 4. Check student hasn't already marked for this session
    const { rows: studentRows } = await pool.query(
      'SELECT id FROM attendance WHERE session_id = $1 AND student_id = $2',
      [sessionId, req.user!.id]
    );
    if (studentRows.length > 0) {
      return res.status(409).json({ error: 'You have already marked attendance for this session' });
    }

    // 5. Haversine distance check
    const distance = haversineDistance(
      parseFloat(session.latitude),
      parseFloat(session.longitude),
      latitude,
      longitude
    );

    const withinRange = distance <= session.radius_meters;
    const status = withinRange ? 'present' : 'rejected';

    // 6. Insert attendance record
    const { rows: attendanceRows } = await pool.query(
      `INSERT INTO attendance (session_id, student_id, device_fingerprint, latitude, longitude, distance_meters, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [sessionId, req.user!.id, deviceFingerprint, latitude, longitude, distance.toFixed(2), status]
    );

    if (!withinRange) {
      return res.status(400).json({
        error: 'Out of range',
        status: 'rejected',
        distance_meters: distance.toFixed(2),
        allowed_meters: session.radius_meters,
      });
    }

    res.status(201).json({ message: 'Attendance marked successfully', attendance: attendanceRows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/attendance/session/:sessionId — attendance list for a session (teacher)
router.get('/session/:sessionId', requireRole('teacher'), async (req: AuthRequest, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, u.name AS student_name, u.email AS student_email, NULL as reg_no
       FROM attendance a
       JOIN users u ON u.id = a.student_id
       WHERE a.session_id = $1
       ORDER BY a.marked_at ASC`,
      [req.params.sessionId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/attendance/my — student's own attendance history
router.get('/my', requireRole('student'), async (req: AuthRequest, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, s.started_at AS session_started, s.ended_at AS session_ended,
         c.title AS course_title, c.code AS course_code
       FROM attendance a
       JOIN sessions s ON s.id = a.session_id
       JOIN courses c ON c.id = s.course_id
       WHERE a.student_id = $1
       ORDER BY a.marked_at DESC`,
      [req.user!.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
