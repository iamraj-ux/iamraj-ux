import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { MediaAsset } from '../../types/database';
import {
  Image as ImageIcon,
  Cloud,
  Plus,
  Trash2,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Save,
  Tag,
  Maximize2,
  FolderOpen,
} from 'lucide-react';

export const CloudinaryApp: React.FC = () => {
  const {
    cloudinaryConfig,
    saveCloudinaryConfig,
    mediaAssets,
    addMediaAsset,
    deleteMediaAsset,
    logActivity,
  } = useDatabase();

  const [cloudName, setCloudName] = useState(cloudinaryConfig.cloudName);
  const [uploadPreset, setUploadPreset] = useState(cloudinaryConfig.uploadPreset);
  const [apiKey, setApiKey] = useState(cloudinaryConfig.apiKey);
  const [folder, setFolder] = useState(cloudinaryConfig.folder);

  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(mediaAssets[0] || null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New asset draft
  const [newAssetDraft, setNewAssetDraft] = useState({
    name: '',
    url: '',
    publicId: '',
    format: 'jpg',
    bytes: 450000,
  });

  const handleSaveConfig = () => {
    saveCloudinaryConfig({
      cloudName: cloudName.trim(),
      uploadPreset: uploadPreset.trim(),
      apiKey: apiKey.trim(),
      folder: folder.trim(),
      isConfigured: Boolean(cloudName.trim()),
    });
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrlId(id);
    setTimeout(() => setCopiedUrlId(null), 2000);
  };

  const handleGenerateAiVision = async (asset: MediaAsset) => {
    setIsAiProcessing(true);
    try {
      const response = await fetch('/api/gemini/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'cloudinary',
          template:
            'Media Asset: {{asset_name}}\nPublic ID: {{public_id}}\nURL: {{url}}\nGenerate: 1) Professional WCAG accessibility Alt-Text, 2) 5 Catalog Tags (comma-separated).',
          variables: {
            asset_name: asset.name,
            public_id: asset.publicId,
            url: asset.url,
          },
        }),
      });

      const data = await response.json();
      if (data.result) {
        // Parse alt text and tags
        const lines = data.result.split('\n');
        const altLine = lines.find((l: string) => /alt[- ]?text/i.test(l)) || lines[0] || '';
        const cleanAlt = altLine.replace(/^[^:]+:\s*/, '').trim();

        // Update asset
        asset.altText = cleanAlt || 'High-resolution industrial catalog asset';
        logActivity('Cloudinary AI Audited', 'Cloudinary', `Generated alt text & tags for ${asset.name}`, 'success');
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0f1d] text-slate-100 overflow-hidden select-text">
      {/* Top Bar */}
      <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-[#0e1422] shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">CLOUDINARY STORAGE & MEDIA ASSETS</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                CDN Active: {cloudinaryConfig.cloudName || 'Configured'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {mediaAssets.length} indexed media files · Folder: <code className="text-sky-300">{cloudinaryConfig.folder}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Index Media URL
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Gallery Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {mediaAssets.map((asset) => {
              const isSelected = selectedAsset?.id === asset.id;
              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`group bg-[#0e1422] border rounded-xl overflow-hidden cursor-pointer transition-all ${
                    isSelected
                      ? 'border-sky-400 shadow-md shadow-sky-500/10 ring-1 ring-sky-400'
                      : 'border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="relative aspect-video bg-black/40 overflow-hidden">
                    <img
                      src={asset.url}
                      alt={asset.altText || asset.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/70 text-slate-300">
                        {asset.format}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 space-y-1.5">
                    <h4 className="text-xs font-bold text-white truncate">{asset.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{asset.publicId}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-slate-400">
                      <span>{(asset.bytes / 1024).toFixed(0)} KB</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUrl(asset.url, asset.id);
                        }}
                        className="text-sky-400 hover:underline flex items-center gap-1"
                      >
                        {copiedUrlId === asset.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        CDN URL
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Inspector & Settings Sidebar */}
        <aside className="w-80 border-l border-white/10 bg-[#070b14] p-5 overflow-y-auto space-y-5 shrink-0 select-none">
          {/* Asset Inspector */}
          {selectedAsset ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Asset Details</span>
                <button
                  onClick={() => deleteMediaAsset(selectedAsset.id)}
                  className="text-slate-400 hover:text-red-400 p-1 rounded"
                  title="Remove from index"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px]">Filename:</span>
                  <p className="font-semibold text-white break-all">{selectedAsset.name}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Cloudinary Public ID:</span>
                  <p className="font-mono text-sky-300 text-[11px] break-all">{selectedAsset.publicId}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Accessibility Alt-Text:</span>
                  <p className="text-slate-300 text-[11px] italic bg-black/30 p-2 rounded border border-white/5">
                    {selectedAsset.altText || 'No description generated yet.'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedAsset.tags.map((t, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleGenerateAiVision(selectedAsset)}
                disabled={isAiProcessing}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-semibold transition-colors"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAiProcessing ? 'animate-spin' : ''}`} />
                {isAiProcessing ? 'Auditing with Natasha AI...' : 'Generate AI Alt-Text & Tags'}
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Select an asset to view details.</p>
          )}

          {/* Cloudinary Credentials Box */}
          <div className="p-4 bg-[#0e1422] border border-white/10 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-sky-400" /> Cloudinary Credentials
            </h4>
            <div>
              <label className="text-[10px] text-slate-400">Cloud Name</label>
              <input
                type="text"
                value={cloudName}
                onChange={(e) => setCloudName(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 bg-[#121929] border border-white/10 rounded-lg text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400">Upload Preset / Folder</label>
              <input
                type="text"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 bg-[#121929] border border-white/10 rounded-lg text-xs text-white font-mono"
              />
            </div>
            <button
              onClick={handleSaveConfig}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white font-medium transition-colors"
            >
              <Save className="w-3 h-3 text-sky-400" /> Save Cloudinary Config
            </button>
          </div>
        </aside>
      </div>

      {/* Add Media Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#0e1422] border border-white/10 rounded-xl shadow-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Index New Media Asset</h3>
            <div>
              <label className="text-[11px] text-slate-400">Asset Title / Name</label>
              <input
                type="text"
                value={newAssetDraft.name}
                onChange={(e) => setNewAssetDraft({ ...newAssetDraft, name: e.target.value })}
                placeholder="e.g. airport_banner_display.jpg"
                className="w-full mt-1 px-3 py-1.5 bg-[#121929] border border-white/10 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Image URL (Cloudinary or CDN)</label>
              <input
                type="text"
                value={newAssetDraft.url}
                onChange={(e) => setNewAssetDraft({ ...newAssetDraft, url: e.target.value })}
                placeholder="https://res.cloudinary.com/..."
                className="w-full mt-1 px-3 py-1.5 bg-[#121929] border border-white/10 rounded-lg text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Public ID</label>
              <input
                type="text"
                value={newAssetDraft.publicId}
                onChange={(e) => setNewAssetDraft({ ...newAssetDraft, publicId: e.target.value })}
                placeholder="raj_expo/catalog/banner_01"
                className="w-full mt-1 px-3 py-1.5 bg-[#121929] border border-white/10 rounded-lg text-xs text-white font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newAssetDraft.name || !newAssetDraft.url) return;
                  addMediaAsset({
                    name: newAssetDraft.name,
                    url: newAssetDraft.url,
                    publicId: newAssetDraft.publicId || `raj_expo/${newAssetDraft.name.replace(/\.[^/.]+$/, '')}`,
                    format: newAssetDraft.format,
                    bytes: newAssetDraft.bytes,
                    altText: 'Raj Expo Digitals catalog image',
                    tags: ['catalog', 'media'],
                  });
                  setIsAddModalOpen(false);
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg"
              >
                Index Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
