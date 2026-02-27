import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'CyberShield — Cyber Crime Complaint Portal',
  description: 'Report cyber crimes quickly, securely, and confidentially.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'Syne, sans-serif', fontSize: '0.9rem' },
            success: { iconTheme: { primary: '#0040ff', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
