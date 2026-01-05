import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  CheckCircle, XCircle, Loader2, Clock, Activity, 
  AlertTriangle, WifiOff, Package, GitBranch, RefreshCw 
} from 'lucide-react';

// Helper di luar komponen agar tidak dibuat ulang setiap render
const extractVersion = (buildName) => {
  if (!buildName) return null;
  const versionMatch = buildName.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!versionMatch) return null;
  return {
    full: versionMatch[0],
    major: parseInt(versionMatch[1], 10),
    minor: parseInt(versionMatch[2], 10),
    patch: parseInt(versionMatch[3], 10)
  };
};

export default function JenkinsDashboard() {
  const [builds, setBuilds] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading pertama kali
  const [isRefreshing, setIsRefreshing] = useState(false); // Loading saat background refresh
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [apiError, setApiError] = useState(false);
  
  // Ref untuk menghindari race condition pada fetch yang lambat
  const fetchCounter = useRef(0);

  // 1. Optimized Fetch Logic
  const fetchBuilds = useCallback(async (showSilentLoading = false) => {
    const currentFetchId = ++fetchCounter.current;
    if (showSilentLoading) setIsRefreshing(true);
    
    try {
      const res = await fetch('/api/jenkins/pending', {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }
      });

      if (currentFetchId !== fetchCounter.current) return; // Abaikan jika ada fetch yang lebih baru

      if (!res.ok) throw new Error('API_ERROR');

      const result = await res.json();
      const data = Array.isArray(result) ? result : (result.data || []);
      
      setBuilds(data);
      setApiError(false);
    } catch (error) {
      console.error('Fetch Error:', error);
      setApiError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // 2. Polling Effect
  useEffect(() => {
    fetchBuilds();
    const interval = setInterval(() => fetchBuilds(true), 10000);
    return () => clearInterval(interval);
  }, [fetchBuilds]);

  // 3. Heavy Computation Memoization
  // Logic grouping & sorting hanya berjalan jika 'builds' berubah
  const memoizedGroups = useMemo(() => {
    if (!builds.length) return { groups: {}, names: [] };

    // Grouping
    const groups = builds.reduce((acc, build) => {
      const job = build.jobName;
      if (!acc[job]) acc[job] = [];
      acc[job].push(build);
      return acc;
    }, {});

    // Sorting tiap group (Semantic Versioning)
    Object.keys(groups).forEach(jobName => {
      groups[jobName].sort((a, b) => {
        const vA = extractVersion(a.name);
        const vB = extractVersion(b.name);
        
        if (!vA && !vB) return b.timestamp - a.timestamp;
        if (!vA) return 1;
        if (!vB) return -1;
        
        if (vA.major !== vB.major) return vB.major - vA.major;
        if (vA.minor !== vB.minor) return vB.minor - vA.minor;
        return vB.patch - vA.patch;
      });
    });

    const sortedNames = Object.keys(groups).sort();
    return { groups, sortedNames };
  }, [builds]);

  // 4. Action Handler
  const handleAction = async (buildId, jobName, action) => {
    const actionKey = `${buildId}-${action}`;
    setActionLoading(actionKey);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/jenkins/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildId, jobName, action })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ text: data.message || 'Berhasil diproses', type: 'success' });
        // Segera refresh data setelah aksi
        setTimeout(() => fetchBuilds(true), 1000);
      } else {
        throw new Error(data.message || 'Gagal mengeksekusi aksi');
      }
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-indigo-600/20 rounded-xl border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                <Activity size={28} className="text-indigo-400" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Jenkins Gateway</h1>
            </div>
            <p className="text-neutral-400 ml-1 dark:text-neutral-500">
              Otorisasi deployment produksi secara real-time
            </p>
          </div>
          
          <div className="flex items-center gap-3 text-xs font-mono text-neutral-500 bg-neutral-900/50 px-4 py-2 rounded-full border border-neutral-800">
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-indigo-400" : ""} />
            <span>AUTO-REFRESH: 10S</span>
          </div>
        </header>

        {/* Global Feedback Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* State Management Views */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 size={48} className="animate-spin text-indigo-500 mb-4" />
            <p className="text-neutral-400 animate-pulse">Sinkronisasi dengan Jenkins...</p>
          </div>
        ) : apiError ? (
          <div className="bg-neutral-900/50 border border-rose-500/20 rounded-2xl p-12 text-center backdrop-blur-sm">
            <WifiOff size={56} className="mx-auto mb-4 text-rose-500/50" />
            <h3 className="text-xl font-bold mb-2 text-rose-400">Connection Failure</h3>
            <p className="text-neutral-400 max-w-md mx-auto mb-6">Gagal mengambil data dari endpoint Jenkins API. Pastikan VPN atau tunnel aktif.</p>
            <button onClick={() => fetchBuilds()} className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all font-semibold">
              Coba Hubungkan Kembali
            </button>
          </div>
        ) : builds.length === 0 ? (
          <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-16 text-center">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
              <CheckCircle size={40} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-neutral-200">Semua Beres!</h3>
            <p className="text-neutral-500">Tidak ada pipeline yang menunggu persetujuan saat ini.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {memoizedGroups.sortedNames.map((jobName) => (
              <section key={jobName} className="group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px flex-1 bg-neutral-800 group-hover:bg-indigo-500/20 transition-colors" />
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-neutral-900 rounded-lg border border-neutral-800 shadow-sm">
                    <Package size={16} className="text-indigo-400" />
                    <h2 className="text-sm font-bold tracking-widest uppercase text-neutral-300">{jobName}</h2>
                    <span className="ml-2 px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] rounded-full border border-indigo-500/20">
                      {memoizedGroups.groups[jobName].length}
                    </span>
                  </div>
                  <div className="h-px flex-1 bg-neutral-800 group-hover:bg-indigo-500/20 transition-colors" />
                </div>

                <div className="grid gap-4">
                  {memoizedGroups.groups[jobName].map((build) => {
                    const version = extractVersion(build.name);
                    const isProcessing = actionLoading?.startsWith(build.id);
                    
                    return (
                      <div key={build.id} className="relative overflow-hidden bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-5 hover:bg-neutral-900/60 hover:border-neutral-700 transition-all duration-300 group/card">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          {/* Left: Build Info */}
                          <div className="flex items-start gap-4">
                            <div className="mt-1 p-2 bg-neutral-800 rounded-lg group-hover/card:bg-indigo-500/10 transition-colors">
                              <GitBranch size={20} className="text-neutral-500 group-hover/card:text-indigo-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-lg font-bold text-neutral-100 leading-none">
                                  {version ? `v${version.full}` : `Build #${build.id}`}
                                </span>
                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[10px] font-bold border border-amber-500/20 uppercase tracking-tighter">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  Waiting
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-neutral-500">
                                <Clock size={12} />
                                <span>{new Date(build.timestamp).toLocaleString('id-ID')}</span>
                                <span className="text-neutral-700">•</span>
                                <span className="font-mono uppercase tracking-tight">ID: {build.id}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleAction(build.id, build.jobName, 'approve')}
                              disabled={!!actionLoading}
                              className="relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20 overflow-hidden"
                            >
                              {actionLoading === `${build.id}-approve` ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <><CheckCircle size={18} /> Deploy</>
                              )}
                            </button>

                            <button
                              onClick={() => handleAction(build.id, build.jobName, 'abort')}
                              disabled={!!actionLoading}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-neutral-800 hover:bg-rose-900/30 hover:text-rose-400 disabled:opacity-50 text-neutral-400 font-semibold rounded-xl transition-all border border-neutral-700"
                            >
                              {actionLoading === `${build.id}-abort` ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <><XCircle size={16} /> Abort</>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        <footer className="mt-16 pt-8 border-t border-neutral-900 text-center">
          <p className="text-[10px] text-neutral-600 uppercase tracking-[0.2em]">
            Production Environment • Jenkins CI/CD Orchestrator
          </p>
        </footer>
      </div>
    </div>
  );
}