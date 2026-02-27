'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api, Complaint, AdminStats, getStatusBadgeClass } from '@/lib/api';
import { LogOut, RefreshCw, X, ExternalLink } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<AdminStats>({ total: 0, new: 0, investigating: 0, resolved: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('cs_admin_token');
    if (!token) { router.push('/admin/login'); return; }
    loadComplaints();
  }, [filterStatus, filterType]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.crimeType = filterType;
      const res = await api.get('/admin/complaints', { params });
      setComplaints(res.data.complaints);
      setStats(res.data.stats);
    } catch (err: any) {
      if (err.response?.status === 401) { router.push('/admin/login'); return; }
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (complaintId: string, status: string, notes?: string) => {
    setUpdatingId(complaintId);
    try {
      await api.patch(`/admin/complaints/${complaintId}/status`, { status, notes });
      setComplaints(prev => prev.map(c => c.complaintId === complaintId ? { ...c, status: status as any } : c));
      if (selected?.complaintId === complaintId) setSelected(prev => prev ? { ...prev, status: status as any } : null);
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('cs_admin_token');
    router.push('/admin/login');
  };

  const STATUSES = ['New', 'Investigating', 'Resolved', 'Closed'];
  const CRIME_TYPES = ['Online Fraud','Cyberbullying / Harassment','Hacking / Unauthorized Access','Identity Theft','Phishing / Scam','Data Breach','Ransomware','Other'];

  return (
    <div className="min-h-screen bg-[#f5f4f0]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">📋 Complaints Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">{stats.total} total complaints</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-[#f5f4f0] outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-[#f5f4f0] outline-none" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {CRIME_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <button onClick={loadComplaints} className="flex items-center gap-2 bg-accent-light text-accent px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent hover:text-white transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={logout} className="flex items-center gap-2 text-gray-500 border border-gray-200 px-4 py-2 rounded-lg text-sm hover:border-danger hover:text-danger transition-all">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-8">
        {[
          { label: 'Total', val: stats.total, color: 'text-gray-900' },
          { label: 'New', val: stats.new, color: 'text-accent' },
          { label: 'Investigating', val: stats.investigating, color: 'text-amber-600' },
          { label: 'Resolved', val: stats.resolved, color: 'text-green-600' },
          { label: 'Closed', val: stats.closed, color: 'text-gray-400' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className={`text-3xl font-extrabold tracking-tight ${s.color}`}>{s.val}</div>
            <div className="text-xs text-gray-400 font-mono mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="px-8 pb-12">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading complaints...</div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-400">No complaints found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f5f4f0] border-b border-gray-200">
                    {['ID', 'Name', 'Category', 'State', 'Filed', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 font-mono uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c.complaintId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-gray-600">{c.complaintId}</td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-sm">{c.name}</div>
                        <div className="text-xs text-gray-400">{c.email}</div>
                      </td>
                      <td className="px-5 py-4 text-sm">{c.crimeType}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{c.state}</td>
                      <td className="px-5 py-4 text-xs font-mono text-gray-500">
                        {new Date(c.filedAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={c.status}
                          disabled={updatingId === c.complaintId}
                          onChange={e => updateStatus(c.complaintId, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 font-mono bg-[#f5f4f0] cursor-pointer outline-none"
                        >
                          {STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelected(c)}
                          className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-accent hover:text-white hover:border-accent transition-all"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl mt-6 mb-6 shadow-2xl">
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-extrabold font-mono">{selected.complaintId}</h2>
                <span className={getStatusBadgeClass(selected.status)}>{selected.status}</span>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-0">
              {[
                ['Name', selected.name],
                ['Email', selected.email],
                ['Phone', selected.phone],
                ['State', selected.state],
                ['Crime Type', selected.crimeType],
                ['Incident Date', selected.incidentDate],
                ['Filed At', new Date(selected.filedAt).toLocaleString('en-IN')],
                ['Subject', selected.subject],
                ['Description', selected.description],
                ['Evidence Text', selected.evidenceText || '—'],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[130px_1fr] gap-3 py-3 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-400 font-mono pt-0.5">{k}</span>
                  <span className="text-sm leading-relaxed">{v}</span>
                </div>
              ))}
              {selected.evidenceFiles && selected.evidenceFiles.length > 0 && (
                <div className="py-3">
                  <span className="text-xs text-gray-400 font-mono block mb-2">Evidence Files</span>
                  <div className="space-y-2">
                    {selected.evidenceFiles.map((f, i) => (
                      <a key={i} href={f.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-accent text-xs hover:underline">
                        <ExternalLink className="w-3 h-3" />{f.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 pt-0 flex gap-3 flex-wrap">
              {['Investigating', 'Resolved', 'Closed'].map(s => (
                <button key={s} onClick={() => updateStatus(selected.complaintId, s)}
                  disabled={selected.status === s || !!updatingId}
                  className="btn-primary text-sm px-4 py-2 disabled:bg-gray-200 disabled:text-gray-400">
                  Mark {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
