import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { AppWindowId, ThemeType } from '../types/database';
import {
  Bot,
  Sliders,
  Database,
  GitBranch,
  Image,
  Activity,
  Settings,
  Shield,
  ShieldAlert,
  HardDrive,
  Pin,
  PinOff,
  Power,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Palette,
} from 'lucide-react';

interface AppMeta {
  id: AppWindowId;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const APPS: AppMeta[] = [
  { id: 'chat', label: 'Natasha v5.6 AI', shortLabel: 'Natasha AI', icon: Bot },
  { id: 'prompts', label: 'Prompt Studio', shortLabel: 'Prompts', icon: Sliders },
  { id: 'database', label: 'Personal Database', shortLabel: 'Database', icon: Database },
  { id: 'github', label: 'GitHub Sync', shortLabel: 'GitHub', icon: GitBranch },
  { id: 'cloudinary', label: 'Cloudinary Storage', shortLabel: 'Cloudinary', icon: Image },
  { id: 'logs', label: 'Activity Logs', shortLabel: 'Activity', icon: Activity },
  { id: 'settings', label: 'Server Settings', shortLabel: 'Settings', icon: Settings },
];

import { GoogleSignInButton } from './GoogleSignInButton';

export const Taskbar: React.FC = () => {
  const {
    windows,
    openWindow,
    minimizeWindow,
    bringToFront,
    togglePinApp,
    settings,
    togglePrivacyMode,
    storageStats,
    githubConfig,
    isSyncingGitHub,
    gitHubSyncResult,
    syncWithGitHub,
    exportDatabaseJson,
    setTheme,
    resetEntireDatabase,
  } = useDatabase();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAppClick = (id: AppWindowId) => {
    const win = windows[id];
    if (!win.isOpen) {
      openWindow(id);
    } else if (win.isMinimized) {
      minimizeWindow(id);
      bringToFront(id);
    } else {
      // If currently active and top, minimize. Otherwise bring to front.
      bringToFront(id);
    }
  };

  const themes: { id: ThemeType; label: string; color: string }[] = [
    { id: 'oled', label: 'OLED Obsidian', color: '#38bdf8' },
    { id: 'slate', label: 'Midnight Slate', color: '#6366f1' },
    { id: 'emerald', label: 'Cyber Emerald', color: '#10b981' },
    { id: 'titanium', label: 'Titanium Gray', color: '#f97316' },
    { id: 'espresso', label: 'Warm Espresso', color: '#f59e0b' },
  ];

  return (
    <>
      {/* Start Menu Drawer / Modal */}
      {startMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
          onClick={() => setStartMenuOpen(false)}
        >
          <div
            className="absolute bottom-14 left-3 w-80 md:w-96 bg-[#0e1422] border border-white/10 rounded-xl shadow-2xl p-5 flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 font-bold text-sm tracking-wider">
                  RED
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide">RAJ EXPO DIGITALS</h4>
                  <p className="text-[11px] text-slate-400">Boss Executive Server v5.6</p>
                </div>
              </div>
              <button
                onClick={() => setStartMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick App Launches */}
            <div className="grid grid-cols-2 gap-2">
              {APPS.map((app) => {
                const Icon = app.icon;
                const win = windows[app.id];
                return (
                  <button
                    key={app.id}
                    onClick={() => {
                      handleAppClick(app.id);
                      setStartMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                      win.isOpen ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30' : 'bg-white/5 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-sky-400" />
                    <span className="truncate">{app.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* System Status Brief */}
            <div className="p-3 bg-black/40 rounded-lg border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Database Records</span>
                <span className="font-mono text-slate-200">{storageStats.totalRecords} items</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Local Footprint</span>
                <span className="font-mono text-slate-200">{(storageStats.byteSize / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>GitHub Sync</span>
                <span className={`font-mono ${githubConfig.token ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {githubConfig.token ? 'Configured' : 'Needs Token'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Privacy Mode</span>
                <span className={settings.privacyMode ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {settings.privacyMode ? 'Active (Masked)' : 'Off (Unmasked)'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-1 border-t border-white/10">
              <button
                onClick={() => {
                  exportDatabaseJson();
                  setStartMenuOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-sky-400" /> Export Full JSON Backup
                </span>
                <span className="text-[10px] text-slate-500">Download</span>
              </button>

              <button
                onClick={() => {
                  syncWithGitHub();
                  setStartMenuOpen(false);
                }}
                disabled={isSyncingGitHub}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-colors disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingGitHub ? 'animate-spin' : ''}`} />
                  Sync to GitHub Repo
                </span>
                <span className="text-[10px] text-slate-500">{isSyncingGitHub ? 'Pushing...' : 'Push Snapshot'}</span>
              </button>

              <button
                onClick={() => {
                  resetEntireDatabase();
                  setStartMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Power className="w-3.5 h-3.5" /> Revert Database to Factory Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Taskbar */}
      <footer className="fixed bottom-0 left-0 right-0 h-12 bg-[#0a0f1d]/90 backdrop-blur-md border-t border-white/10 z-40 px-3 flex items-center justify-between select-none">
        {/* Left: Start / Brand & Running Apps */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {/* Start Menu Button */}
          <button
            onClick={() => setStartMenuOpen((prev) => !prev)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              startMenuOpen
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
            }`}
          >
            <div className="w-4 h-4 rounded bg-sky-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
              R
            </div>
            <span className="hidden sm:inline tracking-wider">BOSS OS</span>
          </button>

          <div className="h-5 w-[1px] bg-white/10 mx-1 shrink-0" />

          {/* App Icons (Pinned + Open) */}
          {APPS.map((app) => {
            const win = windows[app.id];
            const isVisible = win.isOpen || win.pinnedToTaskbar;
            if (!isVisible) return null;

            const Icon = app.icon;
            const isActive = win.isOpen && !win.isMinimized;

            return (
              <div key={app.id} className="relative group shrink-0">
                <button
                  onClick={() => handleAppClick(app.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    togglePinApp(app.id);
                  }}
                  title={`${app.label} (Right-click to ${win.pinnedToTaskbar ? 'unpin' : 'pin'})`}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40 shadow-xs'
                      : win.isOpen
                      ? 'bg-white/10 text-slate-300 hover:bg-white/15'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span className="hidden md:inline whitespace-nowrap">{app.shortLabel}</span>

                  {/* Pin status badge on hover */}
                  {win.pinnedToTaskbar && (
                    <span className="hidden group-hover:inline text-[9px] text-slate-500">
                      <Pin className="w-2.5 h-2.5 inline" />
                    </span>
                  )}
                </button>

                {/* Open Indicator Bar */}
                {win.isOpen && (
                  <div
                    className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full ${
                      isActive ? 'bg-sky-400' : 'bg-slate-500'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Right: System Tray & Status Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Google Sign In Button (Firebase Auth) */}
          <GoogleSignInButton />

          {/* Privacy Shield Toggle */}
          <button
            onClick={togglePrivacyMode}
            title={
              settings.privacyMode
                ? 'Privacy Shield Active: Private emails and phones are masked. Click to unmask.'
                : 'Privacy Shield Disabled: Confidential client records are visible. Click to mask.'
            }
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
              settings.privacyMode
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {settings.privacyMode ? (
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="hidden lg:inline text-[11px] font-medium">
              {settings.privacyMode ? 'Protected' : 'Masking Off'}
            </span>
          </button>

          {/* Theme Quick Switcher */}
          <div className="relative">
            <button
              onClick={() => setThemePickerOpen((p) => !p)}
              title="Switch UI Theme"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {themePickerOpen && (
              <div
                className="absolute bottom-12 right-0 w-44 bg-[#0e1422] border border-white/10 rounded-xl shadow-xl p-2 flex flex-col gap-1 z-50 animate-in fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  UI Theme
                </span>
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setThemePickerOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      settings.theme === t.id
                        ? 'bg-sky-500/20 text-sky-300 font-medium'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.label}
                    </span>
                    {settings.theme === t.id && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Storage & Sync Status Indicator */}
          <div
            title={`Local DB: ${(storageStats.byteSize / 1024).toFixed(1)} KB · Last saved: ${storageStats.lastSaved}`}
            className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg text-[11px] text-slate-400"
          >
            <HardDrive className="w-3 h-3 text-sky-400" />
            <span className="font-mono text-slate-300">{(storageStats.byteSize / 1024).toFixed(1)}k</span>
          </div>

          {/* Clock */}
          <div className="flex flex-col items-end px-2 text-right">
            <span className="text-xs font-mono font-medium text-slate-200 tabular-nums">{currentTime}</span>
            <span className="text-[10px] text-slate-500">{currentDate}</span>
          </div>
        </div>
      </footer>
    </>
  );
};
