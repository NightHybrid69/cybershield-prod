import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <section className="max-w-6xl mx-auto px-12 pt-40 pb-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-accent-light text-accent font-mono text-xs px-4 py-1.5 rounded-full mb-6">
              🛡️ India Cyber Crime Portal
            </span>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight mb-5">
              Report <span className="text-accent">Cyber Crime</span> Instantly
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg">
              Fast, secure, and confidential. Submit your complaint directly to law enforcement — any time, from anywhere.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/complaint" className="btn-primary">File a Complaint →</Link>
              <Link href="/track" className="btn-secondary">Track Complaint</Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { icon: '📋', num: 'Live', label: 'Complaints tracked in Firestore', color: 'bg-accent-light' },
              { icon: '⚡', num: '< 24h', label: 'Average response time', color: 'bg-green-50' },
              { icon: '🔒', num: '100%', label: 'Encrypted & confidential', color: 'bg-red-50' },
            ].map((s) => (
              <div key={s.label} className="card flex items-center gap-5 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-2xl font-extrabold tracking-tight">{s.num}</div>
                  <div className="text-xs text-gray-500 font-mono">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-12 pb-20">
          <p className="text-accent font-mono text-xs uppercase tracking-widest mb-4">Process</p>
          <h2 className="text-3xl font-extrabold tracking-tight mb-12">Simple 3-step process</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: '01', title: 'Select Crime Type', desc: 'Choose the category that best matches your experience — fraud, harassment, hacking, and more.' },
              { n: '02', title: 'Fill the Form', desc: 'Provide incident details, upload evidence files, and submit. Your data is encrypted.' },
              { n: '03', title: 'Track Your Case', desc: 'Receive a unique complaint ID and confirmation email. Track status in real time.' },
            ].map((s) => (
              <div key={s.n} className="card hover:border-accent hover:-translate-y-1 hover:shadow-blue-100 hover:shadow-lg transition-all">
                <span className="inline-block bg-accent-light text-accent font-mono text-xs px-3 py-1 rounded-full mb-4">{s.n}</span>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CRIME TYPES */}
        <section className="max-w-6xl mx-auto px-12 pb-24">
          <p className="text-accent font-mono text-xs uppercase tracking-widest mb-4">Categories</p>
          <h2 className="text-3xl font-extrabold tracking-tight mb-10">Types of cyber crimes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { icon: '💳', name: 'Online Fraud' },
              { icon: '🚫', name: 'Cyberbullying' },
              { icon: '💻', name: 'Hacking' },
              { icon: '🪪', name: 'Identity Theft' },
              { icon: '🎣', name: 'Phishing' },
              { icon: '🔓', name: 'Data Breach' },
              { icon: '🔐', name: 'Ransomware' },
              { icon: '📁', name: 'Other' },
            ].map((t) => (
              <Link
                key={t.name}
                href={`/complaint?type=${encodeURIComponent(t.name)}`}
                className="card text-center hover:border-accent hover:bg-accent-light transition-all cursor-pointer"
              >
                <div className="text-3xl mb-2">{t.icon}</div>
                <div className="text-sm font-semibold">{t.name}</div>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link href="/complaint" className="btn-primary inline-block">Start Your Complaint →</Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-10 px-12 flex flex-wrap items-center justify-between gap-4 max-w-6xl mx-auto">
        <div>
          <div className="flex items-center gap-2 font-extrabold mb-1">
            <span className="w-2.5 h-2.5 bg-accent rounded-full" /> CyberShield
          </div>
          <p className="text-sm text-gray-500">Official Cyber Crime Reporting Portal · India</p>
        </div>
        <div className="flex gap-6">
          {['Privacy Policy', 'Help', 'Track Complaint', 'Contact'].map(l => (
            <a key={l} href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{l}</a>
          ))}
        </div>
      </footer>
    </>
  );
}
