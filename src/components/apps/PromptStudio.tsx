import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { PromptTemplate } from '../../types/database';
import {
  Sliders,
  Play,
  Save,
  RotateCcw,
  Sparkles,
  Check,
  Copy,
  Code,
  FileText,
  Mail,
  MessageCircle,
  Tag,
  AlignLeft,
  Database,
  Cloud,
  ChevronRight,
  Info,
} from 'lucide-react';

export const PromptStudio: React.FC = () => {
  const { promptTemplates, savePromptTemplate, resetPromptTemplate, logActivity } = useDatabase();

  const [selectedPromptId, setSelectedPromptId] = useState<string>(promptTemplates[0]?.id || 'natasha-system');
  const selectedTemplate = promptTemplates.find((t) => t.id === selectedPromptId) || promptTemplates[0];

  // Local draft state for editing
  const [draftSystemInstruction, setDraftSystemInstruction] = useState<string>(selectedTemplate.systemInstruction);
  const [draftTemplate, setDraftTemplate] = useState<string>(selectedTemplate.template);
  const [draftTemperature, setDraftTemperature] = useState<number>(selectedTemplate.temperature);

  // Variable values for live preview and testing
  const [variableValues, setVariableValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    selectedTemplate.variables.forEach((v) => {
      initial[v.key] = v.defaultValue;
    });
    return initial;
  });

  // Test run state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    text: string;
    tokensUsed: number;
    timestamp: string;
  } | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [savedSuccessNotice, setSavedSuccessNotice] = useState(false);

  // Sync draft whenever selected prompt changes
  const handleSelectPrompt = (tpl: PromptTemplate) => {
    setSelectedPromptId(tpl.id);
    setDraftSystemInstruction(tpl.systemInstruction);
    setDraftTemplate(tpl.template);
    setDraftTemperature(tpl.temperature);

    const newVars: Record<string, string> = {};
    tpl.variables.forEach((v) => {
      newVars[v.key] = v.defaultValue;
    });
    setVariableValues(newVars);
    setExecutionResult(null);
    setExecutionError(null);
    setSavedSuccessNotice(false);
  };

  // Render prompt with current variable inputs
  const getRenderedPreview = () => {
    let result = draftTemplate;
    for (const [key, val] of Object.entries(variableValues)) {
      const reg = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      result = result.replace(reg, val || `[${key}]`);
    }
    return result;
  };

  // Handle Save
  const handleSave = () => {
    savePromptTemplate(selectedTemplate.id, {
      systemInstruction: draftSystemInstruction,
      template: draftTemplate,
      temperature: draftTemperature,
    });
    setSavedSuccessNotice(true);
    setTimeout(() => setSavedSuccessNotice(false), 2500);
  };

  // Handle Reset to Default
  const handleReset = () => {
    resetPromptTemplate(selectedTemplate.id);
    const defaultTpl = promptTemplates.find((t) => t.id === selectedTemplate.id);
    if (defaultTpl) {
      setDraftSystemInstruction(defaultTpl.systemInstruction);
      setDraftTemplate(defaultTpl.template);
      setDraftTemperature(defaultTpl.temperature);
    }
  };

  // Test Run live with Gemini API
  const handleTestRun = async () => {
    setIsExecuting(true);
    setExecutionError(null);
    setExecutionResult(null);

    try {
      const response = await fetch('/api/gemini/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: selectedTemplate.category,
          template: draftTemplate,
          systemInstruction: draftSystemInstruction,
          variables: variableValues,
          temperature: draftTemperature,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setExecutionResult({
        text: data.result,
        tokensUsed: data.tokensUsed,
        timestamp: new Date().toLocaleTimeString(),
      });
      logActivity('Prompt Tested', 'Prompt Studio', `Test run succeeded for "${selectedTemplate.title}"`, 'success');
    } catch (err: any) {
      console.error('Test run failed:', err);
      setExecutionError(err.message || 'Execution failed. Check backend server and API key.');
      logActivity('Prompt Test Failed', 'Prompt Studio', err.message || 'Error executing action', 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'natasha':
        return <Sparkles className="w-4 h-4 text-sky-400" />;
      case 'ask_ai':
        return <Play className="w-4 h-4 text-emerald-400" />;
      case 'write':
        return <FileText className="w-4 h-4 text-indigo-400" />;
      case 'labels':
        return <Tag className="w-4 h-4 text-amber-400" />;
      case 'descriptions':
        return <AlignLeft className="w-4 h-4 text-cyan-400" />;
      case 'gmail':
        return <Mail className="w-4 h-4 text-rose-400" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-emerald-400" />;
      case 'cloudinary':
        return <Cloud className="w-4 h-4 text-violet-400" />;
      case 'database':
        return <Database className="w-4 h-4 text-orange-400" />;
      default:
        return <Code className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex h-full w-full bg-[#0a0f1d] text-slate-100 overflow-hidden select-text">
      {/* Left Sidebar: Tool Selector */}
      <aside className="w-72 border-r border-white/10 bg-[#070b14] flex flex-col shrink-0 select-none">
        <div className="p-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-white tracking-wider">ACTION PROMPT TOOLS</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
            {promptTemplates.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {promptTemplates.map((tpl) => {
            const isSelected = tpl.id === selectedTemplate.id;
            return (
              <button
                key={tpl.id}
                onClick={() => handleSelectPrompt(tpl)}
                className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs transition-colors ${
                  isSelected
                    ? 'bg-sky-500/15 border border-sky-500/30 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <div className="mt-0.5 shrink-0">{getCategoryIcon(tpl.category)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold truncate text-slate-200">{tpl.title}</span>
                    {tpl.isCustomized && (
                      <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono">v{tpl.version}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{tpl.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-white/10 bg-black/30 text-[10px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Info className="w-3 h-3 text-sky-400" /> Boss Customization Rule
          </p>
          <p>
            Templates use <code className="text-sky-300">{'{{variable}}'}</code> tokens. The system automatically interpolates live data when triggered.
          </p>
        </div>
      </aside>

      {/* Main Studio Area */}
      <div className="flex-1 flex flex-col h-full bg-[#0a0f1d] overflow-y-auto">
        {/* Header Toolbar */}
        <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-[#0e1422] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">{selectedTemplate.title}</h2>
              {selectedTemplate.isCustomized ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Customized (v{selectedTemplate.version})
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-400">Default Baseline</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{selectedTemplate.description}</p>
          </div>

          <div className="flex items-center gap-2">
            {savedSuccessNotice && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> Saved to DB
              </span>
            )}
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              title="Reset prompt to factory baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Default
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 border border-sky-500/40 transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Template & System Instruction Editors */}
          <div className="space-y-5">
            {/* System Instruction */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  System Instruction / Role Persona
                </label>
                <span className="text-[10px] text-slate-500">Fixed operational stance</span>
              </div>
              <textarea
                value={draftSystemInstruction}
                onChange={(e) => setDraftSystemInstruction(e.target.value)}
                rows={3}
                className="w-full bg-[#121929] border border-white/10 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-sky-400 font-sans resize-none"
              />
            </div>

            {/* Prompt Template */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Action Template (with variables)
                </label>
                <span className="text-[10px] text-slate-500">Insert variables like {'{{name}}'}</span>
              </div>
              <textarea
                value={draftTemplate}
                onChange={(e) => setDraftTemplate(e.target.value)}
                rows={7}
                className="w-full bg-[#121929] border border-white/10 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-sky-400 font-mono leading-relaxed resize-y"
              />
            </div>

            {/* Temperature Slider */}
            <div className="p-4 bg-black/30 border border-white/5 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Model Temperature:</span>
                <span className="font-mono text-sky-400 font-semibold">{draftTemperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.2"
                step="0.1"
                value={draftTemperature}
                onChange={(e) => setDraftTemperature(parseFloat(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.0 (Strict / Deterministic)</span>
                <span>0.7 (Standard Executive)</span>
                <span>1.2 (Creative Pitch)</span>
              </div>
            </div>

            {/* Live Variable Editor */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Test Parameters & Variables
              </h4>
              <div className="space-y-2.5">
                {selectedTemplate.variables.map((v) => (
                  <div key={v.key} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-sky-300">{`{{${v.key}}}`}</span>
                      <span className="text-slate-400">{v.description}</span>
                    </div>
                    <input
                      type="text"
                      value={variableValues[v.key] ?? ''}
                      onChange={(e) =>
                        setVariableValues((prev) => ({
                          ...prev,
                          [v.key]: e.target.value,
                        }))
                      }
                      className="w-full bg-[#121929] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Rendered Preview & Test Execution */}
          <div className="space-y-5">
            {/* Live Interpolated Prompt Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Live Interpolated Prompt
                </label>
                <button
                  onClick={() => navigator.clipboard.writeText(getRenderedPreview())}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <div className="p-3 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {getRenderedPreview()}
              </div>
            </div>

            {/* Test Run Button */}
            <div className="flex items-center justify-between p-4 bg-[#121929] border border-white/10 rounded-xl">
              <div>
                <h5 className="text-xs font-bold text-white">Execute Test Run</h5>
                <p className="text-[11px] text-slate-400">Invokes Gemini 3.8 Flash via backend API</p>
              </div>
              <button
                onClick={handleTestRun}
                disabled={isExecuting}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-xs transition-colors shadow-md shadow-emerald-600/20"
              >
                <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
                {isExecuting ? 'Generating Output...' : 'Run with Gemini'}
              </button>
            </div>

            {/* Live Result Area */}
            {executionError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300">
                <p className="font-bold">Execution Error</p>
                <p className="mt-1">{executionError}</p>
              </div>
            )}

            {executionResult && (
              <div className="p-4 bg-black/50 border border-emerald-500/30 rounded-xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <Check className="w-4 h-4" /> Live AI Dispatch Result
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span>~{executionResult.tokensUsed} tokens</span>
                    <span>·</span>
                    <span>{executionResult.timestamp}</span>
                  </div>
                </div>

                <div className="whitespace-pre-wrap text-xs text-slate-200 leading-relaxed font-sans max-h-64 overflow-y-auto">
                  {executionResult.text}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
