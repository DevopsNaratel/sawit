// src/app/page.js

'use client';

import { useRouter } from 'next/navigation';
import Navigation from './components/Navigation';
import JenkinsDashboard from './components/JenkinsDashboard';

export default function DashboardPage() {
  const router = useRouter();

  const handlePageChange = (page) => {
    if (page === 'jenkins') {
      router.push('/');
    } else if (page === 'k8s-secret') {
      router.push('/secrets');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navigation activePage="jenkins" onPageChange={handlePageChange} />
      
      {/* Main content dengan margin kiri untuk desktop */}
      <main className="md:ml-64">
        <JenkinsDashboard />
      </main>
    </div>
  );
}