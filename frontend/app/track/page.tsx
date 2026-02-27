'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import { api, getStatusBadgeClass } from '@/lib/api';
import { Search } from 'lucide-react';

const STATUS_STEPS = ['New', 'Investigating', 'Resolved'];

export default function TrackPage() {
  const searchParams = useSearchParams();
  const [id, setId] = useState(searchParams.get('id') || '');
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initId = searchParams.get('id');
    if (initId) { setId(initId); fetchComplaint(initId); }
  }, []);

  const fetchComplaint = async (searchId?: string) => {
    const lookupId = (searchId || id).trim().toUpperCase();
    if (!lookupId) { setError('Please enter a complaint ID.'); return; }
    setLoading(true); setError(''); setComplaint(null);
    try {
      const res = await api.get(`/complaints/track/${lookupId}`);
      setComplaint(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Complaint not found.');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = STATUS_STEPS.indexOf(complaint?.status);

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 pt-36 pb-24">
        <p className="text-accent font-mono text-xs uppercase tracking-widest mb-3">Track Complaint</p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Check your status</h1>
        <p className="text-gray-500 text-sm mb-10">Enter your complaint ID to see the current status of your report.</p>

        {/* Search */}
        <div className="flex gap-3 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input-field pl-10 font-mono uppercase"
              placeholder="CS1A2B3C4D5E"
              value={id}
              onChange={e => setId(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && fetchComplaint()}
            />
          </div>
          <button className="btn-primary px-8" onClick={() => fetchComplaint()} disabled={loading}>
            {loading ? '...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-6">❌ {error}</div>
        )}

        {complaint && (
          <div className="space-y-5">
            {/* Status header */}
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-mono text-xs text-gray-500 mb-1">Complaint ID</p>
                  <p className="text-xl font-extrabold font-mono">{complaint.complaintId}</p>
                </div>
                <span className={getStatusBadgeClass(complaint.status)}>{complaint.status}</span>
              </div>

              {/* Progress bar */}
              {complaint.status !== 'Closed' && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 font-mono mb-2">
                    {STATUS_STEPS.map(s => <span key={s}>{s}</span>)}
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-700"
                      style={{ width: `${((currentStep + 1) / STATUS_STEPS.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="card">
              <h2 className="font-bold text-sm mb-4">Complaint Details</h2>
              <div className="space-y-3">
                {[
                  ['Crime Type', complaint.crimeType],
                  ['Subject', complaint.subject],
                  ['State', complaint.state],
                  ['Incident Date', complaint.incidentDate],
                  ['Filed On', new Date(complaint.filedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
                  ['Last Updated', new Date(complaint.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[140px_1fr] gap-2 py-2 border-b border-gray-100 last:border-0">
                    <span className="text-xs text-gray-400 font-mono">{k}</span>
                    <span className="text-sm">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status guide */}
            <div className="bg-accent-light rounded-xl p-5">
              <p className="text-xs font-semibold text-accent mb-3 uppercase tracking-widest font-mono">What happens next?</p>
              <div className="space-y-2 text-xs text-gray-600">
                <p>🔵 <strong>New</strong> — Your complaint has been received and queued for review.</p>
                <p>🟡 <strong>Investigating</strong> — Our team is actively looking into your complaint.</p>
                <p>🟢 <strong>Resolved</strong> — Action has been taken. Check your email for details.</p>
                <p>⚫ <strong>Closed</strong> — This complaint has been closed.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
