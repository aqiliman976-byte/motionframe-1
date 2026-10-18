import React from 'react';
import {
  Film,
  Download,
  BookOpen,
  Sparkles,
  RefreshCw,
  Sliders,
  Play,
  Columns,
  MonitorPlay,
  Code2
} from 'lucide-react';

export type WorkspaceMode = 'split' | 'theater' | 'editor';

interface TopNavProps {
  projectName: string;
  setProjectName: (name: string) => void;
  hasUnsavedChanges: boolean;
  onOpenContract: () => void;
  onLoadStarter: () => void;
  onStartRender: () => void;
  isRendering: boolean;
  isValid: boolean;
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
  onToggleSettings: () => void;
  isSettingsOpen: boolean;
  onTriggerPreview: () => void;
  isPendingPreview: boolean;
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
  mode,
  setMode,
  onToggleSettings,
  isSettingsOpen,
  onTriggerPreview,
  isPendingPreview,
}) => {
  return (
    <header className="h-16 border-b border-studio-border/70 glass-panel px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Brand & Project Name */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-studio bg-gradient-to-tr from-studio-primary to-studio-pastel-blue flex items-center justify-center shadow-md shadow-studio-primary/20">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base text-studio-text tracking-tight">
                MotionFrame
              </span>
              <span className="bg-studio-surface-soft/80 text-studio-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-studio-pastel-blue/60 shadow-xs">
                STUDIO
              </span>
            </div>
            <p className="text-[11px] text-studio-text-muted">Motio to MP4 Engine</p>
          </div>
        </div>

        <div className="h-5 w-px bg-studio-border/80" />

        {/* Project Name Input */}
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="text-xs font-semibold text-studio-text bg-white/60 hover:bg-white focus:bg-white px-2.5 py-1.5 rounded-lg border border-studio-border/80 focus:border-studio-primary outline-none transition-all w-44 truncate shadow-xs"
          placeholder="Nama Projek"
        />
      </div>

      {/* Center: Workspace View Switcher (Split, Theater, Code) */}
      <div className="flex items-center bg-studio-surface-soft/80 p-1 rounded-xl border border-studio-border/80 shadow-xs">
        <button
          onClick={() => setMode('split')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'split'
              ? 'bg-white text-studio-primary shadow-xs font-semibold'
              : 'text-studio-text-muted hover:text-studio-text'
          }`}
          title="Paparan Studio Split"
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Studio Split</span>
        </button>

        <button
          onClick={() => setMode('theater')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'theater'
              ? 'bg-white text-studio-primary shadow-xs font-semibold'
              : 'text-studio-text-muted hover:text-studio-text'
          }`}
          title="Fokus Paparan Video Preview Lebih Luas"
        >
          <MonitorPlay className="w-3.5 h-3.5" />
          <span>Theater Preview</span>
        </button>

        <button
          onClick={() => setMode('editor')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'editor'
              ? 'bg-white text-studio-primary shadow-xs font-semibold'
              : 'text-studio-text-muted hover:text-studio-text'
          }`}
          title="Fokus Kod Editor Penuh"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Editor Kod</span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2.5">
        {/* Preview Button */}
        <button
          onClick={onTriggerPreview}
          className={`flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg border transition-all ${
            isPendingPreview
              ? 'bg-studio-primary text-white border-studio-primary shadow-md shadow-studio-primary/20 animate-pulse'
              : 'bg-white hover:bg-studio-surface-soft text-studio-primary border-studio-pastel-blue shadow-xs'
          }`}
          title="Klik untuk kemas kini paparan video daripada kod"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isPendingPreview ? 'Kemas Kini Preview *' : 'Preview'}</span>
        </button>

        {/* Settings Panel Toggle */}
        <button
          onClick={onToggleSettings}
          className={`flex items-center space-x-1 text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
            isSettingsOpen
              ? 'bg-studio-surface-soft text-studio-primary border-studio-pastel-blue'
              : 'bg-white/80 hover:bg-white text-studio-text border-studio-border hover:border-studio-pastel-blue'
          }`}
          title="Buka / Tutup Tetapan Video"
        >
          <Sliders className="w-3.5 h-3.5 text-studio-primary" />
          <span>Tetapan</span>
        </button>

        {/* Motio Contract Guide */}
        <button
          onClick={onOpenContract}
          className="flex items-center space-x-1.5 text-xs font-medium text-studio-text hover:text-studio-primary px-3 py-2 rounded-lg border border-studio-border/80 hover:border-studio-pastel-blue bg-white/80 hover:bg-white transition-all shadow-xs"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Kontrak Motio</span>
        </button>

        {/* Starter Template */}
        <button
          onClick={onLoadStarter}
          className="flex items-center space-x-1.5 text-xs font-medium text-studio-text hover:text-studio-primary px-3 py-2 rounded-lg border border-studio-border/80 hover:border-studio-pastel-blue bg-white/80 hover:bg-white transition-all shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-studio-primary" />
          <span>Demo</span>
        </button>

        <div className="h-5 w-px bg-studio-border/80" />

        {/* Primary Render Button */}
        <button
          onClick={onStartRender}
          disabled={isRendering || !isValid}
          className={`flex items-center space-x-2 px-5 py-2 rounded-studio font-medium text-xs transition-all shadow-md ${
            isRendering
              ? 'bg-studio-surface-soft text-studio-text-muted cursor-not-allowed border border-studio-border'
              : !isValid
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              : 'bg-studio-primary hover:bg-studio-primary-hover text-white shadow-studio-primary/20 active:scale-[0.98]'
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
