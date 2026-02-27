-- ============================================================
-- CyberShield — Supabase SQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id               BIGSERIAL PRIMARY KEY,
  complaint_id     TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT NOT NULL,
  state            TEXT NOT NULL,
  crime_type       TEXT NOT NULL,
  incident_date    DATE NOT NULL,
  subject          TEXT NOT NULL,
  description      TEXT NOT NULL,
  evidence_text    TEXT DEFAULT '',
  evidence_files   JSONB DEFAULT '[]',
  status           TEXT NOT NULL DEFAULT 'New'
                     CHECK (status IN ('New', 'Investigating', 'Resolved', 'Closed')),
  notes            TEXT DEFAULT '',
  updated_by       TEXT DEFAULT '',
  filed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_complaints_complaint_id ON complaints (complaint_id);
CREATE INDEX idx_complaints_status ON complaints (status);
CREATE INDEX idx_complaints_filed_at ON complaints (filed_at DESC);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- The backend uses service_role key which bypasses RLS.
-- This blocks direct public access to the table.
-- ============================================================
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- No public access — all reads/writes go through the backend API
CREATE POLICY "No public access" ON complaints
  FOR ALL USING (false);

-- ============================================================
-- Storage bucket (run separately or create in dashboard)
-- Dashboard → Storage → New Bucket → Name: "evidence" → Public
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('evidence', 'evidence', true)
-- ON CONFLICT DO NOTHING;
