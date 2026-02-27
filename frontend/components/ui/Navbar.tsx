'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 py-5 bg-[#f5f4f0]/90 backdrop-blur-md border-b border-gray-200">
      <Link href="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
        <span className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
        CyberShield
      </Link>

      {!isAdmin && (
        <div className="hidden md:flex gap-8">
          <Link href="/#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">How it works</Link>
          <Link href="/complaint" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Report</Link>
          <Link href="/track" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Track Complaint</Link>
        </div>
      )}

      <div className="flex items-center gap-3">
        {!isAdmin ? (
          <>
            <Link href="/admin/login" className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:border-accent hover:text-accent transition-all">
              ⚙️ Admin
            </Link>
            <Link href="/complaint" className="btn-primary text-sm">
              File a Report
            </Link>
          </>
        ) : (
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Back to site</Link>
        )}
      </div>
    </nav>
  );
}
