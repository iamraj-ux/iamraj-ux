import React, { useState, useEffect } from 'react';
import {
  auth,
  signInWithGoogle,
  logOut,
  onAuthStateChanged,
  isFirebaseConfigured,
} from '../firebaseConfig.js';
import { LogIn, LogOut, User, AlertCircle, X, CheckCircle2 } from 'lucide-react';

export const GoogleSignInButton: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
      });
      return () => unsubscribe();
    } catch {
      // In case placeholder values throw on listener attachment
    }
  }, []);

  const handleSignInClick = async () => {
    setAuthError(null);
    if (!isFirebaseConfigured()) {
      setShowConfigModal(true);
      return;
    }

    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.warn('Auth notice:', err.message);
      setAuthError(err.message || 'Google Sign-In failed.');
      setShowConfigModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOutClick = async () => {
    try {
      await logOut();
      setCurrentUser(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <>
      {currentUser ? (
        <div className="flex items-center gap-2 px-2.5 py-1 bg-white/10 rounded-lg border border-white/10 text-xs">
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName || 'User'}
              className="w-4 h-4 rounded-full"
            />
          ) : (
            <User className="w-3.5 h-3.5 text-sky-400" />
          )}
          <span className="font-medium text-slate-200 hidden sm:inline truncate max-w-[100px]">
            {currentUser.displayName || currentUser.email}
          </span>
          <button
            onClick={handleSignOutClick}
            title="Sign Out"
            className="text-slate-400 hover:text-red-400 transition-colors p-0.5"
          >
            <LogOut className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleSignInClick}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 transition-colors shrink-0"
          title="Sign In with Google (Firebase Auth)"
        >
          {/* Google SVG Logo */}
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="hidden sm:inline">Sign in with Google</span>
        </button>
      )}

      {/* Firebase Setup Modal for Placeholder Credential Guidance */}
      {showConfigModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#0e1422] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#121929]">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#FFCA28"
                    d="M3.89 15.672L6.255.461A.544.544 0 017.27.21l3.543 6.643-6.923 8.82z"
                  />
                  <path
                    fill="#FFA000"
                    d="M14.088 8.416l-3.275-6.14a.544.544 0 00-.974-.012L.15 17.587l.07.054 7.234 4.072a1.64 1.64 0 001.597 0l11.13-6.262-6.093-7.035z"
                  />
                  <path
                    fill="#F57C00"
                    d="M23.905 17.652L17.727 6.456a.544.544 0 00-.964.032l-2.675 5.097 9.817 6.067z"
                  />
                </svg>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Firebase Authentication Skeleton Ready
                </h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs text-slate-300">
              <p className="leading-relaxed">
                The Firebase configuration structure has been created in <code className="text-sky-300 font-mono">firebaseConfig.js</code> with clean placeholders for:
              </p>

              <ul className="list-disc pl-5 space-y-1 font-mono text-[11px] text-slate-300">
                <li>Firebase Auth (<code className="text-amber-300">auth</code>)</li>
                <li>Google Sign-In (<code className="text-amber-300">googleProvider</code>)</li>
                <li>Cloud Firestore (<code className="text-amber-300">db</code>)</li>
              </ul>

              <div className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-1.5 text-[11px]">
                <p className="font-semibold text-white">How to connect your credentials:</p>
                <p className="text-slate-400">
                  Open <code className="text-sky-300">firebaseConfig.js</code> and replace the placeholder keys with your Firebase project configuration from the Firebase Console.
                </p>
              </div>

              {authError && (
                <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-[11px]">
                  {authError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end px-5 py-3 border-t border-white/10 bg-black/30">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
