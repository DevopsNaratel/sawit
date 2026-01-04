import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Clock, Activity, AlertTriangle, WifiOff, Package, GitBranch } from 'lucide-react';

export default function JenkinsDashboard() {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [apiError, setApiError] = useState(false);

  // Fetch pending builds
  const fetchBuilds = async () => {
    try {
      const res = await fetch('/api/jenkins/pending', {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!res.ok) {
        console.error(`API Error: ${res.status} ${res.statusText}`);
        setApiError(true);
        setBuilds([]);
        return;
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response bukan JSON:', await res.text());
        setApiError(true);
        setBuilds([]);
        return;
      }

      const result = await res.json();
      // Handle both old format (array) and new format (object with data property)
      const data = Array.isArray(result) ? result : (result.data || []);
      setBuilds(data);
      setApiError(false);
    } catch (error) {
      console.error('Error fetching builds:', error);
      setApiError(true);
      setBuilds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilds();
    const interval = setInterval(fetchBuilds, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle Approve/Abort
  const handleAction = async (buildId, jobName, action) => {
    setActionLoading(`${buildId}-${action}`);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/jenkins/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildId, jobName, action })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        setMessage({ 
          text: data.message, 
          type: 'success' 
        });
        setTimeout(fetchBuilds, 1500);
      } else {
        setMessage({ 
          text: data.message || 'Terjadi kesalahan', 
          type: 'error' 
        });
      }
    } catch (error) {
      setMessage({ 
        text: `Gagal: ${error.message}`, 
        type: 'error' 
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Extract version from build name (e.g., "1.0.0", "v1.0.1", "release-1.2.3")
  const extractVersion = (buildName) => {
    if (!buildName) return null;
    
    // Match patterns like: 1.0.0, v1.0.1, release-1.2.3, etc
    const versionMatch = buildName.match(/(\d+)\.(\d+)\.(\d+)/);
    if (!versionMatch) return null;
    
    return {
      full: versionMatch[0],
      major: parseInt(versionMatch[1]),
      minor: parseInt(versionMatch[2]),
      patch: parseInt(versionMatch[3])
    };
  };

  // Group builds by jobName and sort by version
  const groupedBuilds = builds.reduce((acc, build) => {
    const jobName = build.jobName;
    if (!acc[jobName]) {
      acc[jobName] = [];
    }
    acc[jobName].push(build);
    return acc;
  }, {});

  // Sort builds within each group by version (newest first)
  Object.keys(groupedBuilds).forEach(jobName => {
    groupedBuilds[jobName].sort((a, b) => {
      const versionA = extractVersion(a.name);
      const versionB = extractVersion(b.name);
      
      // If no version found, sort by timestamp
      if (!versionA && !versionB) return b.timestamp - a.timestamp;
      if (!versionA) return 1;
      if (!versionB) return -1;
      
      // Sort by semantic version (major.minor.patch) - descending
      if (versionA.major !== versionB.major) return versionB.major - versionA.major;
      if (versionA.minor !== versionB.minor) return versionB.minor - versionA.minor;
      return versionB.patch - versionA.patch;
    });
  });

  // Sort pipeline groups alphabetically
  const sortedPipelineNames = Object.keys(groupedBuilds).sort();

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600/20 rounded-lg border border-indigo-500/30">
              <Activity size={24} className="text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold">Jenkins Approval Gateway</h1>
          </div>
          <p className="text-neutral-400 ml-12">Monitor dan kontrol pipeline deployment</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* API Error */}
        {apiError && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center mb-6">
            <WifiOff size={48} className="mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-semibold mb-2 text-red-400">API Endpoint Error</h3>
            <p className="text-neutral-300 mb-4">Tidak dapat terhubung ke <code className="bg-neutral-900 px-2 py-1 rounded">/api/jenkins/pending</code></p>
            <button
              onClick={fetchBuilds}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
            <Loader2 size={40} className="animate-spin mb-4" />
            <p>Memuat data pipeline...</p>
          </div>
        ) : !apiError && builds.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
            <h3 className="text-xl font-semibold mb-2">Tidak Ada Pipeline Menunggu</h3>
            <p className="text-neutral-400">Semua deployment sudah diproses</p>
          </div>
        ) : !apiError && (
          <div className="space-y-6">
            {sortedPipelineNames.map((jobName) => (
              <div key={jobName} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-all">
                {/* Pipeline Header */}
                <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600/20 rounded-lg border border-indigo-500/30">
                      <Package size={20} className="text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{jobName}</h2>
                      <p className="text-sm text-neutral-500">{groupedBuilds[jobName].length} version menunggu approval</p>
                    </div>
                  </div>
                </div>

                {/* Builds List - Vertical Stack */}
                <div className="space-y-4">
                  {groupedBuilds[jobName].map((build) => {
                    const version = extractVersion(build.name);
                    
                    return (
                      <div 
                        key={`${build.jobName}-${build.id}`}
                        className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 hover:border-indigo-500/30 transition-all"
                      >
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          {/* Build Info */}
                          <div className="flex-1 min-w-[250px]">
                            <div className="flex items-center gap-3 mb-2">
                              <GitBranch size={18} className="text-indigo-400" />
                              <span className="text-base font-semibold text-white">
                                {version ? `Version ${version.full}` : `Build #${build.id}`}
                              </span>
                              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-semibold border border-yellow-500/30">
                                PENDING
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-neutral-400 ml-7">
                              <Clock size={14} />
                              <span>{formatTime(build.timestamp)}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAction(build.id, build.jobName, 'approve')}
                              disabled={actionLoading !== null}
                              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-lg shadow-lg shadow-green-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === `${build.id}-approve` ? (
                                <>
                                  <Loader2 size={18} className="animate-spin" />
                                  <span>Processing...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={18} />
                                  <span>Deploy</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleAction(build.id, build.jobName, 'abort')}
                              disabled={actionLoading !== null}
                              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold rounded-lg shadow-lg shadow-red-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === `${build.id}-abort` ? (
                                <>
                                  <Loader2 size={18} className="animate-spin" />
                                  <span>Processing...</span>
                                </>
                              ) : (
                                <>
                                  <XCircle size={18} />
                                  <span>Abort</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-neutral-600">
          <p>Auto-refresh setiap 10 detik • Production Gateway System</p>
        </div>
      </div>
    </div>
  );
}