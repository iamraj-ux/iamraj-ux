import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Activity,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Download,
  Trash2,
  Clock,
  Shield,
} from 'lucide-react';

export const ActivityLogApp: React.FC = () => {
  const { activityLogs, logActivity } = useDatabase();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(activityLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raj-expo-activity-log-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'error':
        return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <Info className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0f1d] text-slate-100 overflow-hidden select-text">
      {/* Top Header */}
      <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-[#0e1422] shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">SYSTEM ACTIVITY & AUDIT TRAIL</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                {activityLogs.length} events logged
              </span>
            </div>
            <p className="text-xs text-slate-400">Chronological verification of actual database and AI actions</p>
          </div>
        </div>

        <button
          onClick={exportLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-sky-400" /> Export Audit Log
        </button>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-3 border-b border-white/10 bg-[#070b14] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1">
          {['all', 'info', 'success', 'warning', 'error'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full bg-[#121929] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
          />
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-3 p-3 bg-[#0e1422] border border-white/5 rounded-xl text-xs hover:border-white/15 transition-colors"
          >
            <div className="mt-0.5 shrink-0">{getStatusIcon(log.status)}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{log.action}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-sky-300 font-mono">
                    {log.entity}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                  <span>{log.user}</span>
                  <span>·</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
              <p className="text-slate-300 mt-1 leading-relaxed text-[11px]">{log.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
