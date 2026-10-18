import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { AppWindowId } from '../types/database';
import { NatashaChat } from './apps/NatashaChat';
import { PromptStudio } from './apps/PromptStudio';
import { DatabaseHub } from './apps/DatabaseHub';
import { GitHubSyncApp } from './apps/GitHubSyncApp';
import { CloudinaryApp } from './apps/CloudinaryApp';
import { ActivityLogApp } from './apps/ActivityLogApp';
import { ServerSettingsApp } from './apps/ServerSettingsApp';
import {
  Minus,
  Square,
  X,
  Bot,
  Sliders,
  Database,
  GitBranch,
  Image,
  Activity,
  Settings,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export const WindowManager: React.FC = () => {
  const { windows, closeWindow, minimizeWindow, maximizeWindow, bringToFront } = useDatabase();

  const renderAppContent = (id: AppWindowId) => {
    switch (id) {
      case 'chat':
        return <NatashaChat />;
      case 'prompts':
        return <PromptStudio />;
      case 'database':
        return <DatabaseHub />;
      case 'github':
        return <GitHubSyncApp />;
      case 'cloudinary':
        return <CloudinaryApp />;
      case 'logs':
        return <ActivityLogApp />;
      case 'settings':
        return <ServerSettingsApp />;
      default:
        return null;
    }
  };

  const getAppIcon = (id: AppWindowId) => {
    switch (id) {
      case 'chat':
        return <Bot className="w-3.5 h-3.5 text-sky-400" />;
      case 'prompts':
        return <Sliders className="w-3.5 h-3.5 text-emerald-400" />;
      case 'database':
        return <Database className="w-3.5 h-3.5 text-sky-400" />;
      case 'github':
        return <GitBranch className="w-3.5 h-3.5 text-purple-400" />;
      case 'cloudinary':
        return <Image className="w-3.5 h-3.5 text-violet-400" />;
      case 'logs':
        return <Activity className="w-3.5 h-3.5 text-amber-400" />;
      case 'settings':
        return <Settings className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-3rem)] overflow-hidden">
      {(Object.keys(windows) as AppWindowId[]).map((windowId) => {
        const win = windows[windowId];
        if (!win.isOpen || win.isMinimized) return null;

        // Determine window positioning and geometry
        // If maximized or on mobile screens, occupy full space
        const isMax = win.isMaximized;

        return (
          <div
            key={win.id}
            onClick={() => bringToFront(win.id)}
            style={{ zIndex: win.zIndex }}
            className={`absolute transition-all duration-150 flex flex-col rounded-xl overflow-hidden border border-white/15 bg-[#0a0f1d] shadow-2xl ${
              isMax
                ? 'inset-0 rounded-none border-none'
                : 'inset-2 sm:inset-4 md:inset-6 lg:inset-8 xl:inset-10'
            }`}
          >
            {/* Window Title Bar */}
            <header className="h-9 bg-[#0b101c] border-b border-white/10 px-3 flex items-center justify-between select-none shrink-0">
              {/* Left: Window Icon & Title */}
              <div className="flex items-center gap-2">
                {getAppIcon(win.id)}
                <span className="text-xs font-semibold text-slate-200 tracking-wide">{win.title}</span>
              </div>

              {/* Right: Window Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    minimizeWindow(win.id);
                  }}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Minimize"
                >
                  <Minus className="w-3 h-3" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    maximizeWindow(win.id);
                  }}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title={win.isMaximized ? 'Restore' : 'Maximize'}
                >
                  {win.isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(win.id);
                  }}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500/80 transition-colors"
                  title="Close"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </header>

            {/* Window Body */}
            <main className="flex-1 overflow-hidden relative">
              {renderAppContent(win.id)}
            </main>
          </div>
        );
      })}
    </div>
  );
};
