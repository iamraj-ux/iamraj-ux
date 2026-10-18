import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

export const ConfirmationModal: React.FC = () => {
  const { confirmation, closeConfirmation } = useDatabase();
  const [typedVerification, setTypedVerification] = useState('');

  if (!confirmation) return null;

  const isCritical = confirmation.dangerLevel === 'critical';
  const requiresTyping = isCritical;
  const isMatch = !requiresTyping || typedVerification.trim().toUpperCase() === 'RESET';

  const handleConfirm = () => {
    if (!isMatch) return;
    confirmation.onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0e1422] border border-amber-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-amber-950/40 to-transparent">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {isCritical ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">{confirmation.title}</h3>
              <p className="text-xs text-slate-400">Database Integrity Guard</p>
            </div>
          </div>
          <button
            onClick={closeConfirmation}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-200 leading-relaxed">{confirmation.message}</p>

          {confirmation.entityName && (
            <div className="p-3 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-amber-300">
              Target Entity: <span className="font-semibold text-white">{confirmation.entityName}</span>
            </div>
          )}

          {requiresTyping && (
            <div className="space-y-2 pt-2">
              <label className="text-xs text-slate-300">
                To confirm this critical action, please type <span className="font-mono text-red-400 font-bold">RESET</span> below:
              </label>
              <input
                type="text"
                value={typedVerification}
                onChange={(e) => setTypedVerification(e.target.value)}
                placeholder="Type RESET"
                className="w-full px-3 py-2 bg-black/50 border border-red-500/40 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-red-400"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-black/30 border-t border-white/10">
          <button
            onClick={closeConfirmation}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isMatch}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              isCritical
                ? 'bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 disabled:cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            {confirmation.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
