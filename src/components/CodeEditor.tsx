import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Clipboard,
  Eraser,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  Code2
} from 'lucide-react';
import { ValidationResult } from '../types/contract';
import { cleanMotioCode } from '../services/compiler';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  validation: ValidationResult;
  onValidate: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  validation,
  onValidate,
}) => {
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        setPasteNotice('Clipboard is empty.');
        setTimeout(() => setPasteNotice(null), 3000);
        return;
      }
      const cleaned = cleanMotioCode(text);
      onChange(cleaned);
      setPasteNotice('Motio code pasted & cleaned successfully!');
      setTimeout(() => setPasteNotice(null), 3000);
    } catch (err: any) {
      setPasteNotice('Could not access clipboard directly. Use Ctrl+V in the editor.');
      setTimeout(() => setPasteNotice(null), 4000);
    }
  };

  const handleCleanFences = () => {
    const cleaned = cleanMotioCode(code);
    onChange(cleaned);
    setPasteNotice('Cleaned markdown code fences!');
    setTimeout(() => setPasteNotice(null), 2500);
  };

  const handleClear = () => {
    if (code.length > 50) {
      if (window.confirm('Are you sure you want to clear the editor? Your current code will be lost.')) {
        onChange('');
      }
    } else {
      onChange('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-studio-surface border-r border-studio-border">
      {/* Editor Header Toolbar */}
      <div className="h-12 border-b border-studio-border px-4 flex items-center justify-between bg-studio-surface select-none">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-studio-surface-soft text-studio-primary">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-studio-text">
            TSX Motion Graphic Code
          </span>
          <span className="text-[11px] text-studio-text-muted">
            ({code.split('\n').length} lines)
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handlePasteClipboard}
            className="flex items-center space-x-1 text-xs font-medium text-studio-text hover:text-studio-primary px-2.5 py-1 rounded border border-studio-border hover:border-studio-pastel-blue bg-white hover:bg-studio-surface-soft transition-all"
            title="Paste code from clipboard and strip markdown fences"
          >
            <Clipboard className="w-3.5 h-3.5 text-studio-primary" />
            <span>Paste Motio</span>
          </button>

          <button
            onClick={handleCleanFences}
            className="flex items-center space-x-1 text-xs font-medium text-studio-text hover:text-studio-primary px-2.5 py-1 rounded border border-studio-border hover:border-studio-pastel-blue bg-white hover:bg-studio-surface-soft transition-all"
            title="Strip markdown ```tsx ``` fences"
          >
            <Sparkles className="w-3.5 h-3.5 text-studio-primary" />
            <span>Clean Fences</span>
          </button>

          <button
            onClick={handleClear}
            className="flex items-center space-x-1 text-xs font-medium text-studio-text hover:text-studio-error px-2.5 py-1 rounded border border-studio-border hover:border-red-200 bg-white hover:bg-red-50 transition-all"
            title="Clear editor"
          >
            <Eraser className="w-3.5 h-3.5 text-studio-text-muted" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Paste Notification Banner */}
      {pasteNotice && (
        <div className="px-4 py-2 bg-studio-surface-soft border-b border-studio-pastel-blue text-xs text-studio-primary font-medium flex items-center justify-between">
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
      <div className="flex-1 relative overflow-hidden">
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
      <div className="border-t border-studio-border bg-studio-surface p-3 text-xs">
        {validation.valid ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-studio-success">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">MotionFrame Contract Verified</span>
            </div>
            {validation.warnings.length > 0 && (
              <span className="text-amber-600 text-[11px] flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                {validation.warnings.length} warning(s)
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-studio-error font-medium">
              <XCircle className="w-4 h-4" />
              <span>Contract / Compilation Errors ({validation.errors.length})</span>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
              {validation.errors.map((err, idx) => (
                <div
                  key={idx}
                  className="bg-red-50 text-red-700 px-2.5 py-1.5 rounded text-[11px] flex items-start space-x-1.5 border border-red-100"
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
