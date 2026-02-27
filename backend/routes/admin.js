const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getSupabase } = require('../services/supabase');
const { sendStatusUpdate } = require('../services/email');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ── POST /api/admin/login ──
router.post('/login', [
  body('username').trim().notEmpty(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ error: 'Invalid input' });

  const { username, password } = req.body;
  const validUser = username === process.env.ADMIN_USERNAME;
  const validPass = password === process.env.ADMIN_PASSWORD;

  if (!validUser || !validPass) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { username, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, expiresIn: '8h' });
});

// ── GET /api/admin/complaints ── (protected)
router.get('/complaints', authMiddleware, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { status, crimeType } = req.query;

    let query = supabase
      .from('complaints')
      .select('*')
      .order('filed_at', { ascending: false })
      .limit(200);

    if (status) query = query.eq('status', status);
    if (crimeType) query = query.eq('crime_type', crimeType);

    const { data: complaints, error } = await query;
    if (error) throw new Error(error.message);

    // Stats from all complaints
    const { data: all } = await supabase.from('complaints').select('status');
    const stats = {
      total: all?.length || 0,
      new: all?.filter(c => c.status === 'New').length || 0,
      investigating: all?.filter(c => c.status === 'Investigating').length || 0,
      resolved: all?.filter(c => c.status === 'Resolved').length || 0,
      closed: all?.filter(c => c.status === 'Closed').length || 0,
    };

    // Normalize keys to camelCase for frontend
    const normalized = (complaints || []).map(mapRow);
    res.json({ complaints: normalized, stats });
  } catch (err) {
    console.error('Admin fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// ── GET /api/admin/complaints/:id ── (protected)
router.get('/complaints/:id', authMiddleware, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('complaint_id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Complaint not found' });
    res.json(mapRow(data));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
});

// ── PATCH /api/admin/complaints/:id/status ── (protected)
router.patch('/complaints/:id/status', authMiddleware, [
  body('status').isIn(['New', 'Investigating', 'Resolved', 'Closed']).withMessage('Invalid status'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { status, notes } = req.body;

  try {
    const supabase = getSupabase();

    // Get current complaint
    const { data: prev } = await supabase
      .from('complaints')
      .select('*')
      .eq('complaint_id', req.params.id)
      .single();

    if (!prev) return res.status(404).json({ error: 'Complaint not found' });

    const { error } = await supabase
      .from('complaints')
      .update({
        status,
        notes: notes !== undefined ? notes : prev.notes,
        updated_at: new Date().toISOString(),
        updated_by: req.admin.username,
      })
      .eq('complaint_id', req.params.id);

    if (error) throw new Error(error.message);

    // Send email notification if status changed
    if (prev.status !== status && ['Investigating', 'Resolved', 'Closed'].includes(status)) {
      sendStatusUpdate({
        to: prev.email,
        name: prev.name,
        complaintId: prev.complaint_id,
        newStatus: status,
      }).catch(err => console.error('Status email error:', err.message));
    }

    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// ── DELETE /api/admin/complaints/:id ── (protected)
router.delete('/complaints/:id', authMiddleware, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('complaints').delete().eq('complaint_id', req.params.id);
    if (error) throw new Error(error.message);
    res.json({ success: true, message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
});

// Map snake_case DB row → camelCase for frontend
function mapRow(c) {
  return {
    complaintId: c.complaint_id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    state: c.state,
    crimeType: c.crime_type,
    incidentDate: c.incident_date,
    subject: c.subject,
    description: c.description,
    evidenceText: c.evidence_text,
    evidenceFiles: c.evidence_files || [],
    status: c.status,
    filedAt: c.filed_at,
    updatedAt: c.updated_at,
    notes: c.notes,
  };
}

module.exports = router;
