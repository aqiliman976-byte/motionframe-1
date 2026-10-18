import React from 'react';
import { X, BookOpen, Check, Copy } from 'lucide-react';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContractModal: React.FC<ContractModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const samplePrompt = `Act as Motio, the AI motion graphics director. Generate clean React TSX motion graphic code adhering to the MotionFrame Composition Contract:
- Entry point must be: export const MotionGraphic: React.FC = () => { ... }
- Use Remotion hooks and components: useCurrentFrame(), useVideoConfig(), spring(), interpolate(), AbsoluteFill, Sequence
- Color palette: Pastel blue #A9C9FF, Primary blue #477DCC, Background #F5F8FF, Text #172B4D
- Ensure kinetic typography, smooth spring physics, and modular sequences.`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(samplePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white rounded-studio-lg border border-studio-border shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-studio-border px-6 flex items-center justify-between bg-studio-surface">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-studio-surface-soft flex items-center justify-center text-studio-primary">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-studio-text">MotionFrame Composition Contract</h3>
              <p className="text-[11px] text-studio-text-muted">Motio AI Compatibility & Standards</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-studio-text-muted hover:text-studio-text p-1 rounded-lg hover:bg-studio-surface-soft transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-studio-text leading-relaxed">
          <div>
            <h4 className="font-bold text-sm text-studio-text mb-1">1. Required Entry Point</h4>
            <p className="text-studio-text-muted">
              Every Motio composition must export a named React functional component named{' '}
              <code className="text-studio-primary bg-studio-surface-soft px-1.5 py-0.5 rounded font-mono font-semibold">
                MotionGraphic
              </code>{' '}
              (or have a default export).
            </p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] mt-2 overflow-x-auto">
{`import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const MotionGraphic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  // Animation logic...
  return <AbsoluteFill style={{ backgroundColor: '#F5F8FF' }}>...</AbsoluteFill>;
};`}
            </pre>
          </div>

          <div>
            <h4 className="font-bold text-sm text-studio-text mb-1">2. Supported Remotion APIs</h4>
            <ul className="list-disc pl-5 space-y-1 text-studio-text-muted">
              <li><strong className="text-studio-text">Hooks:</strong> <code>useCurrentFrame()</code>, <code>useVideoConfig()</code></li>
              <li><strong className="text-studio-text">Animation Utilities:</strong> <code>spring()</code>, <code>interpolate()</code>, <code>interpolateColors()</code>, <code>Easing</code></li>
              <li><strong className="text-studio-text">Composition Elements:</strong> <code>AbsoluteFill</code>, <code>Sequence</code>, <code>Series</code>, <code>Loop</code>, <code>Img</code></li>
              <li><strong className="text-studio-text">Icons:</strong> Any standard icon from <code>lucide-react</code></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-studio-text mb-1">3. Motio Prompt Template</h4>
            <p className="text-studio-text-muted mb-2">
              Copy this system prompt into Motio or your AI assistant to generate 100% compatible code:
            </p>
            <div className="relative">
              <pre className="bg-studio-surface-soft text-studio-text p-3 rounded-lg font-mono text-[11px] border border-studio-border whitespace-pre-wrap">
                {samplePrompt}
              </pre>
              <button
                onClick={handleCopyPrompt}
                className="absolute top-2 right-2 flex items-center space-x-1 bg-white hover:bg-studio-surface-soft px-2.5 py-1 rounded border border-studio-border text-xs text-studio-primary font-medium transition-all shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm text-studio-text mb-1">4. Security & Restrictions</h4>
            <ul className="list-disc pl-5 space-y-1 text-studio-text-muted">
              <li>Direct Node.js filesystem (<code>fs</code>, <code>child_process</code>) access is blocked.</li>
              <li><code>eval()</code> and dynamic Function constructors are blocked for security.</li>
              <li>All renders run in isolated server headless environments with resource quotas.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="h-12 border-t border-studio-border px-6 flex items-center justify-end bg-studio-surface">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-studio-primary text-white text-xs font-medium hover:bg-studio-primary-hover transition-all"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
