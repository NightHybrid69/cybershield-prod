'use client';
import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import Navbar from '@/components/ui/Navbar';
import { api, CRIME_TYPES, STATES } from '@/lib/api';
import { Upload, X, FileText, Image, CheckCircle } from 'lucide-react';

interface FileWithPreview extends File {
  preview?: string;
}

export default function ComplaintPage() {
  const searchParams = useSearchParams();
  const preselectedType = searchParams.get('type') || '';

  const [form, setForm] = useState({
    name: '', email: '', phone: '', state: '',
    crimeType: preselectedType, incidentDate: '',
    subject: '', description: '', evidenceText: '',
  });
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = accepted.map(f => Object.assign(f, {
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
    }));
    setFiles(prev => [...prev, ...newFiles].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [], 'application/pdf': [],
      'video/mp4': [], 'text/plain': [],
    },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 5,
  });

  const removeFile = (index: number) => setFiles(f => f.filter((_, i) => i !== index));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = ['name','email','phone','state','crimeType','incidentDate','subject','description'] as const;
    const missing = required.filter(k => !form[k]);
    if (missing.length) { toast.error('Please fill in all required fields.'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      files.forEach(f => formData.append('evidence', f));

      const res = await api.post('/complaints/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSubmitted(res.data.complaintId);
      toast.success('Complaint submitted successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Submission failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600 w-10 h-10" />
            </div>
            <h1 className="text-2xl font-extrabold mb-3">Complaint Filed!</h1>
            <p className="text-gray-500 mb-6">A confirmation email has been sent with your complaint details.</p>
            <div className="bg-accent-light rounded-xl p-6 mb-6">
              <p className="text-xs text-accent font-mono uppercase tracking-widest mb-2">Your Complaint ID</p>
              <p className="text-2xl font-extrabold font-mono text-accent">{submitted}</p>
              <p className="text-xs text-gray-500 mt-2">Save this to track your complaint</p>
            </div>
            <div className="flex gap-3 justify-center">
              <a href={`/track?id=${submitted}`} className="btn-primary">Track Status →</a>
              <a href="/complaint" className="btn-secondary">New Complaint</a>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-36 pb-24">
        <p className="text-accent font-mono text-xs uppercase tracking-widest mb-3">File a Complaint</p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Submit your report</h1>
        <p className="text-gray-500 text-sm mb-10">All fields marked <span className="text-danger">*</span> are required. Your data is encrypted and confidential.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="card">
            <h2 className="font-bold text-base mb-5 flex items-center gap-2">👤 Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Full Name <span className="text-danger">*</span></label>
                <input className="input-field" name="name" value={form.name} onChange={handleChange} placeholder="Rahul Sharma" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Phone Number <span className="text-danger">*</span></label>
                <input className="input-field" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Email Address <span className="text-danger">*</span></label>
                <input className="input-field" type="email" name="email" value={form.email} onChange={handleChange} placeholder="rahul@example.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">State / UT <span className="text-danger">*</span></label>
                <select className="input-field" name="state" value={form.state} onChange={handleChange}>
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Incident Details */}
          <div className="card">
            <h2 className="font-bold text-base mb-5">🔍 Incident Details</h2>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Crime Category <span className="text-danger">*</span></label>
                  <select className="input-field" name="crimeType" value={form.crimeType} onChange={handleChange}>
                    <option value="">Select category</option>
                    {CRIME_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Incident Date <span className="text-danger">*</span></label>
                  <input className="input-field" type="date" name="incidentDate" value={form.incidentDate} onChange={handleChange} max={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Subject / Title <span className="text-danger">*</span></label>
                <input className="input-field" name="subject" value={form.subject} onChange={handleChange} placeholder="Brief description of the incident" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Incident Description <span className="text-danger">*</span></label>
                <textarea className="input-field min-h-32" name="description" value={form.description} onChange={handleChange} placeholder="Describe what happened in detail. Include URLs, names, phone numbers, dates, or any relevant information..." />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Evidence URLs or Links (optional)</label>
                <input className="input-field" name="evidenceText" value={form.evidenceText} onChange={handleChange} placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="card">
            <h2 className="font-bold text-base mb-2">📎 Upload Evidence</h2>
            <p className="text-xs text-gray-500 mb-4">Images, PDFs, videos, or text files. Max 10MB each, up to 5 files.</p>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-accent bg-accent-light' : 'border-gray-200 hover:border-accent hover:bg-accent-light/50'}`}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              {isDragActive
                ? <p className="text-accent font-semibold">Drop files here...</p>
                : <><p className="font-semibold text-sm">Drag & drop files here</p><p className="text-xs text-gray-400 mt-1">or click to browse</p></>
              }
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    {f.type.startsWith('image/') ? <Image className="w-4 h-4 text-blue-500 flex-shrink-0" /> : <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    <span className="text-xs text-gray-700 flex-1 truncate">{f.name}</span>
                    <span className="text-xs text-gray-400">{(f.size / 1024).toFixed(0)}KB</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-danger transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Consent + Submit */}
          <div className="flex items-start gap-3">
            <input type="checkbox" id="consent" required className="mt-0.5 accent-accent" />
            <label htmlFor="consent" className="text-xs text-gray-500 leading-relaxed">
              I confirm that the above information is accurate and I consent to share it with law enforcement authorities for investigation purposes.
            </label>
          </div>

          <button type="submit" className="btn-primary w-full py-4 text-base" disabled={loading}>
            {loading ? '⏳ Submitting...' : '🔒 Submit Complaint Securely'}
          </button>
        </form>
      </main>
    </>
  );
}
