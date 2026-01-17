// src/app/page.js

'use client';

import DashboardLayout from './components/DashboardLayout';
import JenkinsDashboard from './components/JenkinsDashboard';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <JenkinsDashboard />
    </DashboardLayout>
  );
}