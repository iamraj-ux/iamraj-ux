/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import { WindowManager } from './components/WindowManager';
import { Taskbar } from './components/Taskbar';
import { ConfirmationModal } from './components/ConfirmationModal';
import {
  Bot,
  Sliders,
  Database,
  GitBranch,
  Image,
  Activity,
  Settings,
  Shield,
  HardDrive,
  Cpu,
} from 'lucide-react';
import { AppWindowId } from './types/database';

const DesktopView: React.FC = () => {
  const { openWindow, windows } = useDatabase();

  const desktopIcons: { id: AppWindowId; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { id: 'chat', label: 'Natasha v5.6 AI', icon: Bot, color: 'text-sky-400 bg-sky-500/15 border-sky-400/30' },
    { id: 'prompts', label: 'Prompt Studio', icon: Sliders, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-400/30' },
    { id: 'database', label: 'Personal DB Hub', icon: Database, color: 'text-sky-400 bg-sky-500/15 border-sky-400/30' },
    { id: 'github', label: 'GitHub Sync', icon: GitBranch, color: 'text-purple-400 bg-purple-500/15 border-purple-400/30' },
    { id: 'cloudinary', label: 'Cloudinary CDN', icon: Image, color: 'text-violet-400 bg-violet-500/15 border-violet-400/30' },
    { id: 'logs', label: 'Audit Logs', icon: Activity, color: 'text-amber-400 bg-amber-500/15 border-amber-400/30' },
    { id: 'settings', label: 'Server Settings', icon: Settings, color: 'text-slate-300 bg-white/10 border-white/20' },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col justify-between select-none">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Subtle Central Brand Watermark in background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
        <div className="text-center">
          <div className="text-8xl font-black tracking-widest uppercase">RAJ EXPO</div>
          <div className="text-2xl font-semibold tracking-widest mt-2">EXECUTIVE SERVER OS v5.6</div>
        </div>
      </div>

      {/* Desktop Desktop Icons Grid (Left column) */}
      <div className="absolute top-4 left-4 z-0 flex flex-col gap-4">
        {desktopIcons.map((item) => {
          const Icon = item.icon;
          const win = windows[item.id];
          return (
            <button
              key={item.id}
              onClick={() => openWindow(item.id)}
              className="group flex flex-col items-center gap-1.5 w-20 p-2 rounded-xl hover:bg-white/10 transition-all text-center focus:outline-none focus:ring-1 focus:ring-sky-400"
            >
              <div className={`p-2.5 rounded-xl border transition-transform group-hover:scale-110 shadow-lg ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-300 group-hover:text-white leading-tight drop-shadow-sm">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Windows Layer */}
      <div className="relative z-10 flex-1 w-full h-[calc(100vh-3rem)]">
        <WindowManager />
      </div>

      {/* Bottom Taskbar */}
      <Taskbar />

      {/* Destructive Action Confirmation Modal */}
      <ConfirmationModal />
    </div>
  );
};

export default function App() {
  return (
    <DatabaseProvider>
      <DesktopView />
    </DatabaseProvider>
  );
}
