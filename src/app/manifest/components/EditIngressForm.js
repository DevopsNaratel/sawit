"use client";

import { useState, useEffect } from "react";
import {
  Network,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  Globe
} from "lucide-react";

export default function EditIngressForm({ appName, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [enabled, setEnabled] = useState(false);
  const [host, setHost] = useState("");
  const [tls, setTls] = useState(false);

  // --- Fetch Initial Data ---
  useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await fetch(`/api/manifest/ingress?appName=${appName}`);
            if (!res.ok) throw new Error("Failed to fetch ingress config");
            const data = await res.json();
            
            setEnabled(data.enabled);
            setHost(data.host || "");
            setTls(data.tls);
        } catch (e) {
            setMessage({ text: e.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [appName]);

  // --- Submit ---
  const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      setMessage({ text: '', type: '' });

      try {
          const res = await fetch('/api/manifest/ingress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  appName,
                  enabled,
                  host,
                  tls
              })
          });
          
          const result = await res.json();
          if (res.ok) {
              onSuccess(result.message);
          } else {
              throw new Error(result.error || "Failed to update ingress");
          }
      } catch (e) {
          setMessage({ text: e.message, type: 'error' });
          setSaving(false);
      }
  };

  if (loading) {
      return (
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-2xl flex flex-col items-center justify-center min-w-[300px]">
              <Loader2 size={32} className="animate-spin text-[#FFA500] mb-4" />
              <p className="text-sm font-semibold text-neutral-500">Loading Ingress Config...</p>
          </div>
      );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-xl shadow-2xl relative flex flex-col">
       {/* Header */}
       <div className="sticky top-0 z-10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Network className="text-[#FFA500]" /> Network Access
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
             <X size={20} />
          </button>
       </div>

       <div className="p-6">
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 text-sm ${ 
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-950/50 space-y-4">
               
               {/* Toggle Enable */}
               <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={enabled} 
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="w-5 h-5 rounded border-neutral-300 text-[#FFA500] focus:ring-[#FFA500]"
                  />
                  <span className="font-bold text-sm text-neutral-700 dark:text-neutral-300">Enable Ingress (Public Access)</span>
               </label>

               {/* Hostname Input */}
               <div className={`transition-all duration-300 ${enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Hostname</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 text-neutral-400" size={16} />
                    <input 
                        required={enabled}
                        disabled={!enabled}
                        className="w-full pl-9 p-2 text-sm border rounded dark:bg-neutral-950 dark:border-neutral-800 focus:ring-1 focus:ring-[#FFA500] outline-none"
                        placeholder="e.g. app.naratel.id"
                        value={host}
                        onChange={e => setHost(e.target.value)}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                      Testing env will automatically use <code>test-{host || '...'}</code>
                  </p>
               </div>

               {/* TLS Toggle */}
               <div className={`transition-all duration-300 ${enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                   <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={tls}
                        disabled={!enabled}
                        onChange={(e) => setTls(e.target.checked)}
                        className="rounded border-neutral-300 text-[#FFA500] focus:ring-[#FFA500]"
                      />
                      <span className="text-sm">Enable HTTPS / TLS</span>
                   </label>
               </div>

            </div>

            <div className="flex justify-end pt-2">
              <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#FFA500] hover:bg-[#FFA500]/90 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save Configuration
                    </>
                  )}
                </button>
            </div>
        </form>
       </div>
    </div>
  );
}
