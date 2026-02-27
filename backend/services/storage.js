const { getSupabase } = require('./supabase');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const BUCKET = 'evidence';
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'video/mp4', 'video/quicktime',
  'text/plain',
];
const MAX_SIZE_MB = 10;

/**
 * Upload evidence file to Supabase Storage
 * @returns {Promise<string>} Public URL
 */
async function uploadEvidence(fileBuffer, originalName, mimeType, complaintId) {
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new Error(`File type ${mimeType} is not allowed`);
  }
  if (fileBuffer.length > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`File exceeds ${MAX_SIZE_MB}MB limit`);
  }

  const ext = path.extname(originalName) || '';
  const filePath = `${complaintId}/${uuidv4()}${ext}`;
  const supabase = getSupabase();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, fileBuffer, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Delete all evidence files for a complaint
 */
async function deleteEvidenceForComplaint(complaintId) {
  const supabase = getSupabase();
  const { data: files } = await supabase.storage.from(BUCKET).list(complaintId);
  if (!files || files.length === 0) return;
  const paths = files.map(f => `${complaintId}/${f.name}`);
  await supabase.storage.from(BUCKET).remove(paths);
}

module.exports = { uploadEvidence, deleteEvidenceForComplaint };
