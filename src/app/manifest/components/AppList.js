"use client";

import {
  Database,
  Loader2,
  CheckCircle,
  Box,
  Plus,
  Trash2,
  Key,
  Globe,
  Layout,
  Server,
  Activity,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap
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
      <div className="flex flex-col gap-6">
        {apps.map((app) => (
            <div key={app.id} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                <div className="p-6">
                    {/* Top Section: Title & Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-[#FFA500]/10 text-[#FFA500] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#FFA500]/20">
                                    ID: {app.id}
                                </span>
                                <span className="flex items-center gap-1 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800/50">
                                    <Zap size={10} /> ACTIVE
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                <Box className="text-[#FFA500]" size={20} />
                                {app.name}
                            </h3>
                            <div className="flex items-center gap-2 text-neutral-400 text-xs mt-1 font-mono">
                                <span className="truncate max-w-[300px]" title={app.image}>{app.image}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-950 p-1.5 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-inner">
                            <button
                                onClick={() => onEditIngress(app.name)}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                title="Network & Domain"
                            >
                                <Globe size={16} /> <span className="hidden sm:inline">Network</span>
                            </button>
                            <button
                                onClick={() => onEdit(app.name)}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all"
                                title="Manage Secrets"
                            >
                                <Key size={16} /> <span className="hidden sm:inline">Secrets</span>
                            </button>
                            <div className="w-px h-6 bg-neutral-200 dark:border-neutral-800 mx-1"></div>
                            <button
                                onClick={() => onDelete(app.id, app.name)}
                                disabled={isDeleting === app.id}
                                className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                title="Delete Application"
                            >
                                {isDeleting === app.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Middle Section: Components Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* 1. App Prod */}
                        <div className="p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 flex flex-col justify-between h-full">
                            <div>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex justify-between">
                                    <span>App Production</span>
                                    <CheckCircle size={12} className="text-green-500" />
                                </p>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Deployment</span>
                                </div>
                            </div>
                            
                            <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-800/50">
                                {app.liveIngressProd ? (
                                    <a href={`http://${app.liveIngressProd}`} target="_blank" rel="noreferrer" className="group/link flex items-center gap-1.5 text-[10px] font-medium text-[#FFA500] hover:underline bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1.5 transition-colors">
                                        <Globe size={10} />
                                        <span className="truncate max-w-[120px]" title={app.liveIngressProd}>{app.liveIngressProd}</span>
                                        <ExternalLink size={8} className="opacity-50 group-hover/link:opacity-100" />
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 bg-neutral-100 dark:bg-neutral-900 rounded px-2 py-1.5">
                                        <Server size={10} />
                                        <span className="italic">ClusterIP Only</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. App Testing */}
                        <div className="p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 flex flex-col justify-between h-full">
                            <div>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex justify-between">
                                    <span>App Testing</span>
                                    <CheckCircle size={12} className="text-green-500" />
                                </p>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Deployment</span>
                                </div>
                            </div>

                            <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-800/50">
                                {app.liveIngressTest ? (
                                    <a href={`http://${app.liveIngressTest}`} target="_blank" rel="noreferrer" className="group/link flex items-center gap-1.5 text-[10px] font-medium text-blue-500 hover:underline bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1.5 transition-colors">
                                        <Globe size={10} />
                                        <span className="truncate max-w-[120px]" title={app.liveIngressTest}>{app.liveIngressTest}</span>
                                        <ExternalLink size={8} className="opacity-50 group-hover/link:opacity-100" />
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 bg-neutral-100 dark:bg-neutral-900 rounded px-2 py-1.5">
                                        <Server size={10} />
                                        <span className="italic">ClusterIP Only</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. DB Prod */}
                        <div className={`p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 flex flex-col justify-between h-full ${app.db !== 'none' ? 'bg-neutral-50/50 dark:bg-neutral-950/30' : 'opacity-50 grayscale bg-neutral-100/50 dark:bg-neutral-900/30'}`}>
                            <div>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex justify-between">
                                    <span>DB Production</span>
                                    {app.db !== 'none' && <CheckCircle size={12} className="text-green-500" />}
                                </p>
                                <div className="flex items-center gap-2 mb-2">
                                    <Database size={14} className={app.db !== 'none' ? 'text-blue-500' : 'text-neutral-400'} />
                                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{app.db !== 'none' ? 'StatefulSet' : 'Disabled'}</span>
                                </div>
                            </div>
                            
                            {app.db !== 'none' && (
                                <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-800/50">
                                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1.5" title="Internal Service DNS">
                                        <Server size={10} />
                                        <span className="truncate">svc-{app.name}-db-{app.id}</span>
                                        <span className="text-neutral-300">|</span>
                                        <span className="text-[#FFA500]">{app.db === 'postgres' ? '5432' : '3306'}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. DB Testing */}
                        <div className={`p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 flex flex-col justify-between h-full ${app.db !== 'none' ? 'bg-neutral-50/50 dark:bg-neutral-950/30' : 'opacity-50 grayscale bg-neutral-100/50 dark:bg-neutral-900/30'}`}>
                            <div>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex justify-between">
                                    <span>DB Testing</span>
                                    {app.db !== 'none' && <CheckCircle size={12} className="text-green-500" />}
                                </p>
                                <div className="flex items-center gap-2 mb-2">
                                    <Database size={14} className={app.db !== 'none' ? 'text-blue-500' : 'text-neutral-400'} />
                                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{app.db !== 'none' ? 'StatefulSet' : 'Disabled'}</span>
                                </div>
                            </div>

                            {app.db !== 'none' && (
                                <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-800/50">
                                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1.5" title="Internal Service DNS">
                                        <Server size={10} />
                                        <span className="truncate">svc-{app.name}-db-{app.id}</span>
                                        <span className="text-neutral-300">|</span>
                                        <span className="text-[#FFA500]">{app.db === 'postgres' ? '5432' : '3306'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Section: GitOps Status Only */}
                    <div className="flex justify-end pt-2 border-t border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center gap-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            <div className="flex items-center gap-1">
                                <ShieldCheck size={12} className="text-green-500" /> GitOps Synced
                            </div>
                            <div className="flex items-center gap-1">
                                <Activity size={12} className="text-[#FFA500]" /> ArgoCD Monitored
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>
  );
}
