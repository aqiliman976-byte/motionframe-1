import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Clipboard,
  Eraser,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  Wand2,
  Code2,
  Play
} from 'lucide-react';
import { ValidationResult } from '../types/contract';
import { cleanMotioCode, autoFixMotioCode } from '../services/compiler';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  validation: ValidationResult;
  onValidate: () => void;
  onTriggerPreview: () => void;
  isPendingPreview: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  validation,
  onValidate,
  onTriggerPreview,
  isPendingPreview,
}) => {
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);
  const [fixSummary, setFixSummary] = useState<string[] | null>(null);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        setPasteNotice('Papan keratan kosong.');
        setTimeout(() => setPasteNotice(null), 3000);
        return;
      }
      const cleaned = cleanMotioCode(text);
      onChange(cleaned);
      setPasteNotice('Kod Motio berjaya ditampal & dibersihkan!');
      setTimeout(() => setPasteNotice(null), 3000);
    } catch (err: any) {
      setPasteNotice('Gunakan Ctrl+V di dalam editor untuk menampal.');
      setTimeout(() => setPasteNotice(null), 4000);
    }
  };

  const handleAutoFix = () => {
    const { fixedCode, changes, success } = autoFixMotioCode(code);
    onChange(fixedCode);
    setFixSummary(changes);
    onTriggerPreview();
  };

  const handleCleanFences = () => {
    const cleaned = cleanMotioCode(code);
    onChange(cleaned);
    setPasteNotice('Markdown fences dibersihkan!');
    setTimeout(() => setPasteNotice(null), 2500);
  };

  const handleClear = () => {
    if (code.length > 50) {
      if (window.confirm('Padam semua kod dalam editor? Kod semasa anda akan hilang.')) {
        onChange('');
      }
    } else {
      onChange('');
    }
  };

  return (
    <div className="flex flex-col h-full glass-panel border-r border-studio-border/70 overflow-hidden">
      {/* Editor Header Toolbar */}
      <div className="h-12 border-b border-studio-border/70 px-4 flex items-center justify-between glass-panel-subtle select-none">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-studio-surface-soft text-studio-primary">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-studio-text">
            TSX Editor
          </span>
          <span className="text-[11px] text-studio-text-muted font-mono">
            ({code.split('\n').length} baris)
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Auto-Fix 100% Button */}
          <button
            onClick={handleAutoFix}
            className="flex items-center space-x-1 text-xs font-semibold text-white bg-gradient-to-r from-studio-primary to-studio-pastel-blue hover:opacity-90 px-3 py-1.5 rounded-lg shadow-sm transition-all"
            title="Baiki struktur kod, import Remotion, dan entry point secara automatik 100%"
          >
            <Wand2 className="w-3.5 h-3.5 animate-bounce" />
            <span>Baiki Kod 100%</span>
          </button>

          {/* Run Preview Button */}
          <button
            onClick={onTriggerPreview}
            className={`flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              isPendingPreview
                ? 'bg-studio-primary text-white border-studio-primary shadow-xs animate-pulse'
                : 'bg-white hover:bg-studio-surface-soft text-studio-primary border-studio-pastel-blue'
            }`}
            title="Kemas kini visual preview mengikut kod terkini"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPendingPreview ? 'Preview *' : 'Preview'}</span>
          </button>

          <button
            onClick={handlePasteClipboard}
            className="flex items-center space-x-1 text-xs font-medium text-studio-text hover:text-studio-primary px-2 py-1.5 rounded-lg border border-studio-border/80 hover:border-studio-pastel-blue bg-white/90 hover:bg-studio-surface-soft transition-all"
            title="Tampal kod Motio dan bersihkan fences"
          >
            <Clipboard className="w-3 h-3 text-studio-primary" />
            <span>Tampal</span>
          </button>

          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg border border-studio-border/80 hover:border-red-200 text-studio-text-muted hover:text-studio-error bg-white/90 hover:bg-red-50 transition-all"
            title="Padam editor"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Auto-Fix Details Toast / Banner */}
      {fixSummary && (
        <div className="px-4 py-2.5 bg-emerald-50/90 backdrop-blur-sm border-b border-emerald-200 text-xs text-emerald-800 flex items-start justify-between shadow-xs animate-fade-in">
          <div>
            <div className="font-semibold flex items-center space-x-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kod Berjaya Dibaiki 100%!</span>
            </div>
            <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[11px] text-emerald-700">
              {fixSummary.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => setFixSummary(null)}
            className="text-emerald-600 hover:text-emerald-900 text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Paste Notification Banner */}
      {pasteNotice && (
        <div className="px-4 py-2 bg-studio-surface-soft/90 backdrop-blur-sm border-b border-studio-pastel-blue text-xs text-studio-primary font-medium flex items-center justify-between">
          <span>{pasteNotice}</span>
          <button
            onClick={() => setPasteNotice(null)}
            className="text-studio-text-muted hover:text-studio-primary text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Monaco Code Editor */}
      <div className="flex-1 relative overflow-hidden bg-white/60">
        <Editor
          height="100%"
          language="typescript"
          value={code}
          onChange={(val) => onChange(val || '')}
          theme="vs-light"
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            tabSize: 2,
            padding: { top: 12, bottom: 12 },
            folding: true,
            suggestOnTriggerCharacters: true,
          }}
        />
      </div>

      {/* Validation & Error Tray */}
      <div className="border-t border-studio-border/70 glass-panel-subtle p-3 text-xs">
        {validation.valid ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-studio-success">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Kontrak MotionFrame Sah (100% Sedia Dirender)</span>
            </div>
            {validation.warnings.length > 0 && (
              <span className="text-amber-600 text-[11px] flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                {validation.warnings.length} amaran
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-studio-error font-medium">
                <XCircle className="w-4 h-4" />
                <span>Ralat Sintaks / Kontrak ({validation.errors.length})</span>
              </div>
              <button
                onClick={handleAutoFix}
                className="flex items-center space-x-1 bg-studio-primary hover:bg-studio-primary-hover text-white px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all shadow-xs"
              >
                <Wand2 className="w-3 h-3" />
                <span>Baiki Sekarang</span>
              </button>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
              {validation.errors.map((err, idx) => (
                <div
                  key={idx}
                  className="bg-red-50/90 text-red-700 px-2.5 py-1.5 rounded text-[11px] flex items-start space-x-1.5 border border-red-100"
                >
                  <span className="font-mono text-red-500 font-semibold">
                    {err.line ? `[L${err.line}]` : '•'}
                  </span>
                  <span className="flex-1">{err.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
