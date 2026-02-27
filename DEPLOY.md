# 🚀 CyberShield — Vercel + Supabase Deployment Guide

## Prerequisites
- Node.js 18+ installed
- Git + GitHub account
- Supabase account (free tier works)
- Gmail account (for email notifications)

---

## Step 1 — Supabase Setup

1. Go to https://supabase.com → New Project
2. Choose a region close to India (e.g. Singapore `ap-southeast-1`)
3. Note your **Project URL** and **service_role key** (Settings → API)

### Create the database table:
4. Go to **SQL Editor** → New Query
5. Paste the entire contents of `supabase-schema.sql` and click **Run**

### Create Storage bucket:
6. Go to **Storage** → New Bucket
7. Name: `evidence` → ✅ Public bucket → Create

### Storage policy (allow public read):
8. Storage → evidence bucket → Policies → New policy
9. Choose "Allow public read" template → Save

---

## Step 2 — Gmail App Password

1. Google Account → Security → 2-Step Verification (enable)
2. Security → App passwords → Generate for "Mail"
3. Copy the 16-character password → use as `EMAIL_PASS`

---

## Step 3 — Push to GitHub

```bash
# From project root
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cybershield.git
git push -u origin main
```

---

## Step 4 — Deploy Backend to Vercel

```bash
cd backend
npm install -g vercel
vercel login
vercel
# Project name: cybershield-backend
# Root directory: ./
```

### Add Environment Variables in Vercel Dashboard:
Backend project → Settings → Environment Variables:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service_role key) |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | choose strong password |
| `JWT_SECRET` | any long random string |
| `EMAIL_USER` | your@gmail.com |
| `EMAIL_PASS` | 16-char app password |
| `FRONTEND_URL` | `https://cybershield-frontend.vercel.app` |

```bash
vercel --prod
```
Note your backend URL: e.g. `https://cybershield-backend.vercel.app`

---

## Step 5 — Deploy Frontend to Vercel

```bash
cd frontend
vercel
# Project name: cybershield-frontend
```

### Frontend Environment Variables:
| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://cybershield-backend.vercel.app` |

```bash
vercel --prod
```

---

## Step 6 — Update CORS

Go to backend Vercel project → Environment Variables:
- Update `FRONTEND_URL` → actual frontend URL

Redeploy: `cd backend && vercel --prod`

---

## ✅ You're Live!

| Page | URL |
|------|-----|
| Home | `https://cybershield-frontend.vercel.app/` |
| File Complaint | `/complaint` |
| Track Complaint | `/track` |
| Admin Login | `/admin/login` (admin / your-password) |
| Admin Dashboard | `/admin/dashboard` |

---

## 🔄 Auto-deploy on Push

After initial deploy, any `git push` auto-triggers Vercel redeploy.

## 🗄️ View Data in Supabase

Supabase Dashboard → Table Editor → complaints → view all rows in a spreadsheet UI!
