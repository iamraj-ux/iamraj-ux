import React, { useRef } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { ThemeType } from '../../types/database';
import {
  Settings,
  Palette,
  Shield,
  HardDrive,
  Cpu,
  Power,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const ServerSettingsApp: React.FC = () => {
  const {
    settings,
    setTheme,
    togglePrivacyMode,
    storageStats,
    exportDatabaseJson,
    importDatabaseJson,
    resetEntireDatabase,
  } = useDatabase();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const themes: { id: ThemeType; name: string; description: string; color: string }[] = [
    { id: 'oled', name: 'OLED Obsidian', description: 'True pitch black (#040608) with electric sky accents', color: '#38bdf8' },
    { id: 'slate', name: 'Midnight Slate', description: 'Deep enterprise navy (#0b1120) with indigo highlights', color: '#6366f1' },
    { id: 'emerald', name: 'Cyber Emerald', description: 'High-tech terminal forest (#04130d) with mint accents', color: '#10b981' },
    { id: 'titanium', name: 'Titanium Gray', description: 'Industrial dark metal (#111113) with hazard orange', color: '#f97316' },
    { id: 'espresso', name: 'Warm Espresso', description: 'Dark roasted warmth (#140f0c) with amber gold', color: '#f59e0b' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDatabaseJson(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0f1d] text-slate-100 overflow-y-auto select-text p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">SERVER CONFIGURATION & PREFERENCES</h2>
            <p className="text-xs text-slate-400">Environment controls, responsive themes, and database recovery</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        {/* Theme Engine */}
        <div className="p-5 bg-[#0e1422] border border-white/10 rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Palette className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Responsive UI Themes</h3>
          </div>

          <div className="space-y-2">
            {themes.map((t) => {
              const isCurrent = settings.theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                    isCurrent
                      ? 'bg-sky-500/15 border-sky-400/50 text-white'
                      : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: t.color }} />
                    <div>
                      <p className="text-xs font-bold text-white">{t.name}</p>
                      <p className="text-[11px] text-slate-400">{t.description}</p>
                    </div>
                  </div>
                  {isCurrent && <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Security & Data Privacy */}
        <div className="space-y-6">
          <div className="p-5 bg-[#0e1422] border border-white/10 rounded-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Data Privacy & Protection</h3>
            </div>

            <div className="flex items-center justify-between p-3 bg-black/30 border border-white/5 rounded-lg">
              <div>
                <p className="text-xs font-bold text-white">Confidential Field Masking</p>
                <p className="text-[11px] text-slate-400">
                  Masks phone numbers, client emails, and financial remarks across all UI views.
                </p>
              </div>
              <button
                onClick={togglePrivacyMode}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  settings.privacyMode
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-white/10 hover:bg-white/15 text-slate-300'
                }`}
              >
                {settings.privacyMode ? 'Shield Active' : 'Enable Masking'}
              </button>
            </div>
          </div>

          {/* Backup & Factory Actions */}
          <div className="p-5 bg-[#0e1422] border border-white/10 rounded-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <HardDrive className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Database Maintenance</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={exportDatabaseJson}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-slate-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" /> Export JSON Dump
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-slate-200 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" /> Import JSON Dump
              </button>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </div>

            <div className="pt-2">
              <button
                onClick={resetEntireDatabase}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold transition-colors"
              >
                <Power className="w-3.5 h-3.5" /> Revert Database to Factory Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
