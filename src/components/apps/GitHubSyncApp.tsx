import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  GitBranch,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Key,
  FolderGit2,
  Clock,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';

export const GitHubSyncApp: React.FC = () => {
  const {
    githubConfig,
    saveGitHubConfig,
    syncWithGitHub,
    isSyncingGitHub,
    gitHubSyncResult,
    storageStats,
    logActivity,
  } = useDatabase();

  const [owner, setOwner] = useState(githubConfig.owner);
  const [repo, setRepo] = useState(githubConfig.repo);
  const [branch, setBranch] = useState(githubConfig.branch || 'main');
  const [token, setToken] = useState(githubConfig.token);
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveConfig = () => {
    saveGitHubConfig({
      owner: owner.trim(),
      repo: repo.trim(),
      branch: branch.trim() || 'main',
      token: token.trim(),
      autoSync: githubConfig.autoSync,
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: owner.trim(),
          repo: repo.trim(),
          branch: branch.trim() || 'main',
          token: token.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: `Connection Verified: Access confirmed for ${data.repoName} (${data.visibility}) on branch '${data.defaultBranch}'`,
        });
        logActivity('GitHub Verified', 'GitHub Hub', `Verified access to ${data.repoName}`, 'success');
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Repository validation failed. Check token permissions and repository name.',
        });
        logActivity('GitHub Check Failed', 'GitHub Hub', data.error || 'Access denied', 'error');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection failure. Please verify internet access.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0f1d] text-slate-100 overflow-y-auto select-text p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">GITHUB REPOSITORY SYNC</h2>
            <p className="text-xs text-slate-400">
              Honest version-controlled backup of Raj Expo Digitals database and schemas
            </p>
          </div>
        </div>

        <button
          onClick={syncWithGitHub}
          disabled={isSyncingGitHub}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors shadow-md shadow-purple-600/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGitHub ? 'animate-spin' : ''}`} />
          {isSyncingGitHub ? 'Pushing Commit...' : 'Push DB Snapshot Now'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        {/* Left Column: Repository & Credential Configuration */}
        <div className="lg:col-span-2 space-y-5">
          <div className="p-5 bg-[#0e1422] border border-white/10 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-purple-400" /> Repository Target Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-medium">GitHub Owner / Organization</label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="e.g. raj-expo-digitals"
                  className="w-full mt-1.5 px-3 py-2 bg-[#121929] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Repository Name</label>
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="e.g. enterprise-server-db"
                  className="w-full mt-1.5 px-3 py-2 bg-[#121929] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-medium">Target Branch</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full mt-1.5 px-3 py-2 bg-[#121929] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-slate-300 font-medium flex items-center justify-between">
                  <span>Personal Access Token (PAT)</span>
                  <span className="text-[10px] text-slate-500">Requires `repo` scope</span>
                </label>
                <div className="relative mt-1.5">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full pl-3 pr-10 py-2 bg-[#121929] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleTestConnection}
                disabled={isTesting || !owner || !repo || !token}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs font-medium text-slate-300 rounded-lg border border-white/10 transition-colors"
              >
                <Key className="w-3.5 h-3.5 text-purple-400" />
                {isTesting ? 'Testing Access...' : 'Test Repository Access'}
              </button>

              <button
                onClick={handleSaveConfig}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> Save Configuration
              </button>
            </div>
          </div>

          {/* Test or Sync Feedback Banner */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs flex items-start gap-3 animate-in fade-in ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{testResult.success ? 'Access Verified' : 'Authentication Failed'}</p>
                <p className="mt-0.5 opacity-90">{testResult.message}</p>
              </div>
            </div>
          )}

          {gitHubSyncResult && (
            <div
              className={`p-4 rounded-xl border text-xs flex items-start gap-3 animate-in fade-in ${
                gitHubSyncResult.success
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {gitHubSyncResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{gitHubSyncResult.success ? 'Sync Successful' : 'Sync Error'}</p>
                  <span className="font-mono text-[10px] text-slate-400">{gitHubSyncResult.timestamp}</span>
                </div>
                <p className="mt-0.5 opacity-90">{gitHubSyncResult.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sync Telemetry & Status */}
        <div className="space-y-4">
          <div className="p-5 bg-[#0e1422] border border-white/10 rounded-xl space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sync Integrity Audit</h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-slate-400">Database Size</span>
                <span className="font-mono text-slate-200">{(storageStats.byteSize / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-slate-400">Target Path</span>
                <span className="font-mono text-purple-300">database/raj-expo-backup.json</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-slate-400">Last Sync Time</span>
                <span className="font-mono text-slate-300">
                  {githubConfig.lastSync ? new Date(githubConfig.lastSync).toLocaleTimeString() : 'Never'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-slate-400">Last Commit SHA</span>
                <span className="font-mono text-slate-300">
                  {githubConfig.lastCommitSha ? githubConfig.lastCommitSha.slice(0, 7) : 'None'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-black/40 rounded-lg border border-white/5 text-[11px] text-slate-400 space-y-1">
              <p className="text-slate-300 font-medium flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-400" /> Honest Sync Guarantee
              </p>
              <p>
                Changes are pushed directly via the GitHub Contents REST API. If the token is invalid or the repo does not exist, an honest error is shown.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
