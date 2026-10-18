import React, { useRef, useState, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import {
  RotateCcw,
  Maximize2,
  ZoomIn,
  Eye,
  Layers,
  AlertTriangle,
  Play,
  Wand2,
  Tv,
  Smartphone,
  Square,
  RectangleVertical
} from 'lucide-react';
import { VideoSettings } from '../types/contract';

interface PreviewCanvasProps {
  component: React.ComponentType<any> | null;
  compileError: string | null;
  settings: VideoSettings;
  onUpdateAspectRatio: (aspect: VideoSettings['aspectRatio']) => void;
  onTriggerPreview: () => void;
  isPendingPreview: boolean;
  onAutoFix: () => void;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  component,
  compileError,
  settings,
  onUpdateAspectRatio,
  onTriggerPreview,
  isPendingPreview,
  onAutoFix,
}) => {
  const playerRef = useRef<PlayerRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [bgStyle, setBgStyle] = useState<'pastel' | 'white' | 'dark' | 'checkerboard'>('pastel');
  const [zoomMode, setZoomMode] = useState<'fit' | '50' | '75' | '100'>('fit');

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrameUpdate = () => {
      setCurrentFrame(player.getCurrentFrame());
    };

    player.addEventListener('timeupdate', onFrameUpdate);
    return () => {
      player.removeEventListener('timeupdate', onFrameUpdate);
    };
  }, [component]);

  const handleRestart = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(0);
      playerRef.current.play();
    }
  };

  const formatTimestamp = (frame: number, fps: number) => {
    const totalSeconds = frame / fps;
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    const frames = Math.floor(frame % fps);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${frames.toString().padStart(2, '0')}`;
  };

  const getCanvasBgClass = () => {
    switch (bgStyle) {
      case 'white':
        return 'bg-white';
      case 'dark':
        return 'bg-slate-900';
      case 'checkerboard':
        return 'bg-checkerboard';
      case 'pastel':
      default:
        return 'bg-ambient-mesh';
    }
  };

  return (
    <div className="flex flex-col h-full bg-studio-bg overflow-hidden relative select-none">
      {/* Top Preview Toolbar (Glassmorphism) */}
      <div className="h-14 border-b border-studio-border/70 px-5 flex items-center justify-between glass-panel z-10">
        <div className="flex items-center space-x-3">
          {/* Quick Aspect Ratio Selector */}
          <div className="flex items-center bg-studio-surface-soft/80 p-0.5 rounded-lg border border-studio-border/80 text-xs shadow-xs">
            <button
              onClick={() => onUpdateAspectRatio('16:9')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                settings.aspectRatio === '16:9'
                  ? 'bg-white text-studio-primary shadow-xs font-semibold'
                  : 'text-studio-text-muted hover:text-studio-text'
              }`}
              title="16:9 Landscape"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>16:9</span>
            </button>
            <button
              onClick={() => onUpdateAspectRatio('9:16')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                settings.aspectRatio === '9:16'
                  ? 'bg-white text-studio-primary shadow-xs font-semibold'
                  : 'text-studio-text-muted hover:text-studio-text'
              }`}
              title="9:16 Vertical (Reels / TikTok)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16</span>
            </button>
            <button
              onClick={() => onUpdateAspectRatio('1:1')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                settings.aspectRatio === '1:1'
                  ? 'bg-white text-studio-primary shadow-xs font-semibold'
                  : 'text-studio-text-muted hover:text-studio-text'
              }`}
              title="1:1 Square"
            >
              <Square className="w-3.5 h-3.5" />
              <span>1:1</span>
            </button>
            <button
              onClick={() => onUpdateAspectRatio('4:5')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                settings.aspectRatio === '4:5'
                  ? 'bg-white text-studio-primary shadow-xs font-semibold'
                  : 'text-studio-text-muted hover:text-studio-text'
              }`}
              title="4:5 Portrait"
            >
              <RectangleVertical className="w-3.5 h-3.5" />
              <span>4:5</span>
            </button>
          </div>

          <div className="h-4 w-px bg-studio-border/80" />

          {/* Time & Frame Counter */}
          <div className="font-mono text-xs text-studio-text font-medium glass-pill px-3 py-1 rounded-lg">
            <span>{formatTimestamp(currentFrame, settings.fps)}</span>
            <span className="text-studio-text-muted ml-1.5">
              / {formatTimestamp(settings.durationInFrames, settings.fps)}
            </span>
            <span className="text-studio-primary ml-2 font-bold">
              (F: {currentFrame}/{settings.durationInFrames})
            </span>
          </div>
        </div>

        {/* Center / Right Canvas Controls */}
        <div className="flex items-center space-x-2.5">
          {isPendingPreview && (
            <button
              onClick={onTriggerPreview}
              className="flex items-center space-x-1.5 bg-studio-primary hover:bg-studio-primary-hover text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-sm transition-all animate-pulse"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Kemas Kini Preview</span>
            </button>
          )}

          {/* Background Toggle */}
          <div className="flex items-center bg-studio-surface-soft/80 rounded-lg p-0.5 border border-studio-border/80 text-xs shadow-xs">
            <button
              onClick={() => setBgStyle('pastel')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                bgStyle === 'pastel' ? 'bg-white text-studio-primary shadow-xs font-semibold' : 'text-studio-text-muted hover:text-studio-text'
              }`}
              title="Pastel mesh background"
            >
              Pastel
            </button>
            <button
              onClick={() => setBgStyle('white')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                bgStyle === 'white' ? 'bg-white text-studio-primary shadow-xs font-semibold' : 'text-studio-text-muted hover:text-studio-text'
              }`}
              title="Pure white"
            >
              White
            </button>
            <button
              onClick={() => setBgStyle('checkerboard')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                bgStyle === 'checkerboard' ? 'bg-white text-studio-primary shadow-xs font-semibold' : 'text-studio-text-muted hover:text-studio-text'
              }`}
              title="Transparent checkerboard"
            >
              Grid
            </button>
            <button
              onClick={() => setBgStyle('dark')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                bgStyle === 'dark' ? 'bg-white text-studio-primary shadow-xs font-semibold' : 'text-studio-text-muted hover:text-studio-text'
              }`}
              title="Dark background"
            >
              Dark
            </button>
          </div>

          {/* Zoom Modes */}
          <div className="flex items-center bg-studio-surface-soft/80 rounded-lg p-0.5 border border-studio-border/80 text-xs shadow-xs">
            <button
              onClick={() => setZoomMode('fit')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                zoomMode === 'fit' ? 'bg-white text-studio-primary shadow-xs font-semibold' : 'text-studio-text-muted hover:text-studio-text'
              }`}
            >
              Fit
            </button>
            <button
              onClick={() => setZoomMode('50')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                zoomMode === '50' ? 'bg-white text-studio-primary shadow-xs font-semibold' : 'text-studio-text-muted hover:text-studio-text'
              }`}
            >
              50%
            </button>
            <button
              onClick={() => setZoomMode('100')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                zoomMode === '100' ? 'bg-white text-studio-primary shadow-xs font-semibold' : 'text-studio-text-muted hover:text-studio-text'
              }`}
            >
              100%
            </button>
          </div>

          <button
            onClick={handleRestart}
            className="p-1.5 rounded-lg border border-studio-border/80 hover:border-studio-pastel-blue bg-white/90 hover:bg-studio-surface-soft text-studio-text transition-all shadow-xs"
            title="Ulang main semula (Restart)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Viewport Stage */}
      <div
        ref={containerRef}
        className={`flex-1 flex items-center justify-center p-8 relative overflow-hidden transition-colors ${getCanvasBgClass()}`}
      >
        {compileError ? (
          <div className="glass-panel rounded-2xl border border-red-200/80 p-8 max-w-lg shadow-2xl text-center space-y-5 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-studio-text">Ralat Kompilasi Preview</h3>
              <p className="text-xs text-studio-text-muted mt-1 leading-relaxed">
                Terdapat isu struktur atau sintaks pada kod MotionGraphic. Anda boleh membaikinya secara automatik 100%.
              </p>
            </div>
            <pre className="text-left text-xs bg-red-50/90 text-red-700 p-3.5 rounded-xl overflow-x-auto max-h-40 border border-red-200/60 font-mono whitespace-pre-wrap">
              {compileError}
            </pre>
            <button
              onClick={onAutoFix}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-studio-primary to-studio-pastel-blue hover:opacity-95 text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow-md shadow-studio-primary/20 transition-all"
            >
              <Wand2 className="w-4 h-4 animate-bounce" />
              <span>Baiki Kod 100% Secara Automatik</span>
            </button>
          </div>
        ) : component ? (
          <div
            className="rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(71,125,204,0.25)] border border-white/90 bg-white transition-all duration-300"
            style={{
              aspectRatio: `${settings.width} / ${settings.height}`,
              maxWidth: zoomMode === 'fit' ? '100%' : zoomMode === '50' ? '50%' : '100%',
              maxHeight: zoomMode === 'fit' ? '100%' : undefined,
              width: zoomMode === '100' ? `${settings.width}px` : undefined,
              height: zoomMode === '100' ? `${settings.height}px` : undefined,
            }}
          >
            <Player
              ref={playerRef}
              component={component}
              durationInFrames={settings.durationInFrames}
              compositionWidth={settings.width}
              compositionHeight={settings.height}
              fps={settings.fps}
              style={{
                width: '100%',
                height: '100%',
              }}
              controls
              autoPlay
              loop
              inputProps={{
                width: settings.width,
                height: settings.height,
                fps: settings.fps,
                durationInFrames: settings.durationInFrames,
                backgroundColor: settings.backgroundColor,
              }}
            />
          </div>
        ) : (
          <div className="text-center p-10 glass-panel rounded-2xl border border-white/80 max-w-sm shadow-lg">
            <Layers className="w-12 h-12 text-studio-pastel-blue mx-auto mb-3" />
            <p className="text-sm font-bold text-studio-text">Tiada Animasi Dimuatkan</p>
            <p className="text-xs text-studio-text-muted mt-1 leading-relaxed">
              Tampal kod Motio di sebelah kiri atau klik butang Preview untuk memulakan animasi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
