import React from 'react';
import {
  Film,
  Download,
  BookOpen,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface TopNavProps {
  projectName: string;
  setProjectName: (name: string) => void;
  hasUnsavedChanges: boolean;
  onOpenContract: () => void;
  onLoadStarter: () => void;
  onStartRender: () => void;
  isRendering: boolean;
  isValid: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  projectName,
  setProjectName,
  hasUnsavedChanges,
  onOpenContract,
  onLoadStarter,
  onStartRender,
  isRendering,
  isValid,
}) => {
  return (
    <header className="h-16 border-b border-studio-border bg-studio-surface px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Brand & Project Name */}
      <div className="flex items-center space-x-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-studio bg-gradient-to-tr from-studio-primary to-studio-pastel-blue flex items-center justify-center shadow-sm">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base text-studio-text tracking-tight">
                MotionFrame
              </span>
              <span className="bg-studio-surface-soft text-studio-primary text-[10px] font-semibold px-2 py-0.5 rounded-full border border-studio-pastel-blue/50">
                STUDIO
              </span>
            </div>
            <p className="text-xs text-studio-text-muted">Motio to MP4 Engine</p>
          </div>
        </div>

        <div className="h-5 w-px bg-studio-border" />

        {/* Project Name Input */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="text-sm font-medium text-studio-text bg-transparent hover:bg-studio-surface-soft/60 focus:bg-studio-surface-soft px-2.5 py-1 rounded-md border border-transparent focus:border-studio-pastel-blue outline-none transition-all w-48 truncate"
            placeholder="Project Name"
          />
          <div className="flex items-center space-x-1.5 text-xs">
            {hasUnsavedChanges ? (
              <span className="flex items-center text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
                Draft edited
              </span>
            ) : (
              <span className="flex items-center text-studio-success bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium">
                <CheckCircle2 className="w-3 h-3 mr-1 text-studio-success" />
                Synced
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenContract}
          className="flex items-center space-x-1.5 text-xs font-medium text-studio-text hover:text-studio-primary px-3 py-1.5 rounded-lg border border-studio-border hover:border-studio-pastel-blue bg-studio-surface hover:bg-studio-surface-soft transition-all"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Motio Contract</span>
        </button>

        <button
          onClick={onLoadStarter}
          className="flex items-center space-x-1.5 text-xs font-medium text-studio-text hover:text-studio-primary px-3 py-1.5 rounded-lg border border-studio-border hover:border-studio-pastel-blue bg-studio-surface hover:bg-studio-surface-soft transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-studio-primary" />
          <span>Starter Demo</span>
        </button>

        <div className="h-5 w-px bg-studio-border" />

        {/* Primary Render Button */}
        <button
          onClick={onStartRender}
          disabled={isRendering || !isValid}
          className={`flex items-center space-x-2 px-5 py-2 rounded-studio font-medium text-sm transition-all shadow-sm ${
            isRendering
              ? 'bg-studio-surface-soft text-studio-text-muted cursor-not-allowed border border-studio-border'
              : !isValid
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              : 'bg-studio-primary hover:bg-studio-primary-hover text-white active:scale-[0.98]'
          }`}
        >
          {isRendering ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-studio-primary" />
              <span>Rendering...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-white" />
              <span>Render MP4</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
