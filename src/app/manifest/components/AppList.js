"use client";

import {
  Database,
  Loader2,
  CheckCircle,
  Box,
  Plus,
  Trash2,
  Key,
  Globe
} from "lucide-react";

export default function AppList({ apps, onDelete, isDeleting, onCreate, onEdit, onEditIngress }) {
  if (apps.length === 0) {
    return (
        <div className="col-span-full py-20 text-center flex flex-col items-center justify-center text-neutral-500 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white/50 dark:bg-neutral-900/50">
            <Box size={48} className="text-neutral-300 mb-4" />
            <p className="font-semibold text-lg">No applications found</p>
            <p className="text-sm max-w-sm mt-2">Get started by creating your first application manifest.</p>
            <button 
                onClick={onCreate}
                className="mt-6 flex items-center gap-2 bg-[#FFA500] hover:bg-[#FFA500]/90 text-white font-bold py-2 px-6 rounded-lg transition-all"
            >
                <Plus size={18} /> Create App
            </button>
        </div>
    );
  }

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {apps.map((app) => (
            <div key={app.id} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <span className="bg-[#FFA500]/10 text-[#FFA500] text-xs font-mono font-bold px-2 py-1 rounded">
                                ID: {app.id}
                            </span>
                            {app.db !== 'none' && (
                                <span className="text-[10px] flex items-center gap-1 text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded font-semibold">
                                    <Database size={12} /> {app.db}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => onEditIngress(app.name)}
                                className="text-neutral-400 hover:text-blue-500 transition-colors p-1"
                                title="Edit Ingress / Network"
                            >
                                <Globe size={18} />
                            </button>
                            <button
                                onClick={() => onEdit(app.name)}
                                className="text-neutral-400 hover:text-[#FFA500] transition-colors p-1"
                                title="Edit Secrets"
                            >
                                <Key size={18} />
                            </button>
                            <button
                                onClick={() => onDelete(app.id, app.name)}
                                disabled={isDeleting === app.id}
                                className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                                title="Delete App"
                            >
                                {isDeleting === app.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                            </button>
                        </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 truncate" title={app.name}>
                        {app.name}
                    </h3>
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-xs font-mono mb-4 truncate">
                        <Box size={14} />
                        <span className="truncate">{app.image}</span>
                    </div>

                    <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-xs text-neutral-500">
                        <span>Manifest Generated</span>
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                            <CheckCircle size={12} /> Ready
                        </span>
                    </div>
                </div>
            </div>
        ))}
      </div>
  );
}
