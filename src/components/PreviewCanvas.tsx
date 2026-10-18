import React, { useRef, useState, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import {
  RotateCcw,
  Maximize2,
  ZoomIn,
  Eye,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { VideoSettings } from '../types/contract';

interface PreviewCanvasProps {
  component: React.ComponentType<any> | null;
  compileError: string | null;
  settings: VideoSettings;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  component,
  compileError,
  settings,
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
        return 'bg-[#F5F8FF]';
    }
  };

  return (
    <div className="flex flex-col h-full bg-studio-bg overflow-hidden relative select-none">
      {/* Top Preview Toolbar */}
      <div className="h-12 border-b border-studio-border px-5 flex items-center justify-between bg-studio-surface/80 backdrop-blur-sm z-10">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-studio-text font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interactive Preview Canvas</span>
          </div>

          <div className="h-4 w-px bg-studio-border" />

          {/* Time & Frame Counter */}
          <div className="font-mono text-xs text-studio-text font-medium bg-studio-surface-soft px-2.5 py-1 rounded border border-studio-border">
            <span>{formatTimestamp(currentFrame, settings.fps)}</span>
            <span className="text-studio-text-muted ml-1.5">
              / {formatTimestamp(settings.durationInFrames, settings.fps)}
            </span>
            <span className="text-studio-primary ml-2 font-semibold">
              (F: {currentFrame}/{settings.durationInFrames})
            </span>
          </div>
        </div>

        {/* Canvas Controls */}
        <div className="flex items-center space-x-2">
          {/* Background Toggle */}
          <div className="flex items-center bg-studio-surface-soft rounded-lg p-0.5 border border-studio-border text-xs">
            <button
              onClick={() => setBgStyle('pastel')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                bgStyle === 'pastel' ? 'bg-white text-studio-primary shadow-xs' : 'text-studio-text-muted hover:text-studio-text'
              }`}
              title="Pastel background"
            >
              Pastel
            </button>
            <button
              onClick={() => setBgStyle('white')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                bgStyle === 'white' ? 'bg-white text-studio-primary shadow-xs' : 'text-studio-text-muted hover:text-studio-text'
              }`}
              title="Pure white"
            >
              White
            </button>
            <button
              onClick={() => setBgStyle('checkerboard')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                bgStyle === 'checkerboard' ? 'bg-white text-studio-primary shadow-xs' : 'text-studio-text-muted hover:text-studio-text'
              }`}
              title="Transparent checkerboard"
            >
              Grid
            </button>
            <button
              onClick={() => setBgStyle('dark')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                bgStyle === 'dark' ? 'bg-white text-studio-primary shadow-xs' : 'text-studio-text-muted hover:text-studio-text'
              }`}
              title="Dark background"
            >
              Dark
            </button>
          </div>

          {/* Zoom Modes */}
          <div className="flex items-center bg-studio-surface-soft rounded-lg p-0.5 border border-studio-border text-xs">
            <button
              onClick={() => setZoomMode('fit')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                zoomMode === 'fit' ? 'bg-white text-studio-primary shadow-xs' : 'text-studio-text-muted hover:text-studio-text'
              }`}
            >
              Fit
            </button>
            <button
              onClick={() => setZoomMode('50')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                zoomMode === '50' ? 'bg-white text-studio-primary shadow-xs' : 'text-studio-text-muted hover:text-studio-text'
              }`}
            >
              50%
            </button>
            <button
              onClick={() => setZoomMode('100')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                zoomMode === '100' ? 'bg-white text-studio-primary shadow-xs' : 'text-studio-text-muted hover:text-studio-text'
              }`}
            >
              100%
            </button>
          </div>

          <button
            onClick={handleRestart}
            className="p-1.5 rounded-lg border border-studio-border hover:border-studio-pastel-blue bg-white hover:bg-studio-surface-soft text-studio-text transition-all"
            title="Restart playback"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        ref={containerRef}
        className={`flex-1 flex items-center justify-center p-6 relative overflow-hidden transition-colors ${getCanvasBgClass()}`}
      >
        {compileError ? (
          <div className="bg-white/95 backdrop-blur rounded-studio-lg border border-red-200 p-8 max-w-lg shadow-lg text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-studio-text">Preview Compilation Error</h3>
              <p className="text-xs text-studio-text-muted mt-1">
                The Remotion player could not evaluate the current code. Check your syntax or exports.
              </p>
            </div>
            <pre className="text-left text-xs bg-red-50 text-red-700 p-3 rounded-lg overflow-x-auto max-h-48 border border-red-100 font-mono whitespace-pre-wrap">
              {compileError}
            </pre>
          </div>
        ) : component ? (
          <div
            className="rounded-xl overflow-hidden shadow-2xl border border-studio-border bg-white transition-transform duration-200"
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
          <div className="text-center p-8 bg-white/70 backdrop-blur rounded-studio border border-studio-border">
            <Layers className="w-10 h-10 text-studio-pastel-blue mx-auto mb-2" />
            <p className="text-sm font-medium text-studio-text">No active composition loaded</p>
            <p className="text-xs text-studio-text-muted mt-1">
              Paste Motio TSX code on the left or load the starter demo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
