// src/app/page.js

'use client';

import { useRouter } from 'next/navigation';
// Loader2 dan useSession dihapus karena tidak lagi digunakan untuk proteksi
import Navigation from './components/Navigation';
import JenkinsDashboard from './components/JenkinsDashboard';

export default function DashboardPage() {
  const router = useRouter();

  // Logika redirect dan loading dihapus agar halaman langsung terbuka

  // Handler untuk navigation tetap dipertahankan agar menu berfungsi
  const handlePageChange = (page) => {
    if (page === 'jenkins') {
      router.push('/');
    } else if (page === 'k8s-secret') {
      router.push('/secrets');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Langsung menampilkan konten tanpa pengecekan session */}
      <Navigation activePage="jenkins" onPageChange={handlePageChange} />
      <main>
        <JenkinsDashboard />
      </main>
    </div>
  );
}