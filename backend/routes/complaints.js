const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { getSupabase } = require('../services/supabase');
const { uploadEvidence } = require('../services/storage');
const { sendComplaintConfirmation } = require('../services/email');

const router = express.Router();

// Multer — store files in memory for Supabase upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
});

// ── Validation rules ──
const complaintValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone is required').matches(/^[+\d\s\-()]{7,20}$/),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('crimeType').trim().notEmpty().withMessage('Crime type is required'),
  body('incidentDate').isISO8601().withMessage('Valid incident date is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 20, max: 5000 }),
];

// ── POST /api/complaints/submit ──
router.post('/submit', upload.array('evidence', 5), complaintValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { name, email, phone, state, crimeType, incidentDate, subject, description, evidenceText } = req.body;
  const complaintId = 'CS' + uuidv4().replace(/-/g, '').slice(0, 10).toUpperCase();

  try {
    const supabase = getSupabase();

    // Upload evidence files to Supabase Storage
    const evidenceFiles = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadEvidence(file.buffer, file.originalname, file.mimetype, complaintId);
        evidenceFiles.push({ name: file.originalname, url, type: file.mimetype });
      }
    }

    // Insert complaint into Supabase (PostgreSQL)
    const { error } = await supabase.from('complaints').insert({
      complaint_id: complaintId,
      name,
      email,
      phone,
      state,
      crime_type: crimeType,
      incident_date: incidentDate,
      subject,
      description,
      evidence_text: evidenceText || '',
      evidence_files: evidenceFiles,
      status: 'New',
      notes: '',
    });

    if (error) throw new Error(error.message);

    // Send confirmation email (non-blocking)
    sendComplaintConfirmation({ to: email, name, complaintId, crimeType, subject }).catch(err =>
      console.error('Email error:', err.message)
    );

    res.status(201).json({
      success: true,
      complaintId,
      message: 'Complaint submitted successfully. A confirmation email has been sent.',
    });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Failed to submit complaint. Please try again.' });
  }
});

// ── GET /api/complaints/track/:id ──
router.get('/track/:id', async (req, res) => {
  const { id } = req.params;
  if (!id || !id.startsWith('CS')) {
    return res.status(400).json({ error: 'Invalid complaint ID format' });
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('complaints')
      .select('complaint_id, crime_type, subject, state, status, filed_at, updated_at, incident_date')
      .eq('complaint_id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Complaint not found. Check your ID and try again.' });
    }

    res.json({
      complaintId: data.complaint_id,
      crimeType: data.crime_type,
      subject: data.subject,
      state: data.state,
      status: data.status,
      filedAt: data.filed_at,
      updatedAt: data.updated_at,
      incidentDate: data.incident_date,
    });
  } catch (err) {
    console.error('Track error:', err);
    res.status(500).json({ error: 'Failed to fetch complaint.' });
  }
});

// ── GET /api/complaints/count ──
router.get('/count', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { count } = await supabase.from('complaints').select('*', { count: 'exact', head: true });
    res.json({ count: count || 0 });
  } catch {
    res.json({ count: 0 });
  }
});

module.exports = router;
