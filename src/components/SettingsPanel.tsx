import React from 'react';
import {
  Settings,
  Sliders,
  Clock,
  Sparkles,
  Tv,
  Smartphone,
  Square,
  RectangleVertical,
  AlertTriangle
} from 'lucide-react';
import { VideoSettings } from '../types/contract';

interface SettingsPanelProps {
  settings: VideoSettings;
  onChange: (newSettings: VideoSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onChange,
}) => {
  // Update aspect ratio and recalculate width & height based on preset
  const handleAspectRatioChange = (aspect: VideoSettings['aspectRatio']) => {
    let width = 1920;
    let height = 1080;

    if (settings.resolutionPreset === '720p') {
      if (aspect === '16:9') { width = 1280; height = 720; }
      else if (aspect === '9:16') { width = 720; height = 1280; }
      else if (aspect === '1:1') { width = 720; height = 720; }
      else if (aspect === '4:5') { width = 720; height = 900; }
    } else if (settings.resolutionPreset === '1080p') {
      if (aspect === '16:9') { width = 1920; height = 1080; }
      else if (aspect === '9:16') { width = 1080; height = 1920; }
      else if (aspect === '1:1') { width = 1080; height = 1080; }
      else if (aspect === '4:5') { width = 1080; height = 1350; }
    } else if (settings.resolutionPreset === '1440p') {
      if (aspect === '16:9') { width = 2560; height = 1440; }
      else if (aspect === '9:16') { width = 1440; height = 2560; }
      else if (aspect === '1:1') { width = 1440; height = 1440; }
      else if (aspect === '4:5') { width = 1440; height = 1800; }
    } else if (settings.resolutionPreset === '4K') {
      if (aspect === '16:9') { width = 3840; height = 2160; }
      else if (aspect === '9:16') { width = 2160; height = 3840; }
      else if (aspect === '1:1') { width = 2160; height = 2160; }
      else if (aspect === '4:5') { width = 2160; height = 2700; }
    }

    onChange({
      ...settings,
      aspectRatio: aspect,
      width,
      height,
    });
  };

  const handleResolutionChange = (preset: VideoSettings['resolutionPreset']) => {
    let width = 1920;
    let height = 1080;

    if (preset === '720p') {
      if (settings.aspectRatio === '16:9') { width = 1280; height = 720; }
      else if (settings.aspectRatio === '9:16') { width = 720; height = 1280; }
      else if (settings.aspectRatio === '1:1') { width = 720; height = 720; }
      else if (settings.aspectRatio === '4:5') { width = 720; height = 900; }
    } else if (preset === '1080p') {
      if (settings.aspectRatio === '16:9') { width = 1920; height = 1080; }
      else if (settings.aspectRatio === '9:16') { width = 1080; height = 1920; }
      else if (settings.aspectRatio === '1:1') { width = 1080; height = 1080; }
      else if (settings.aspectRatio === '4:5') { width = 1080; height = 1350; }
    } else if (preset === '1440p') {
      if (settings.aspectRatio === '16:9') { width = 2560; height = 1440; }
      else if (settings.aspectRatio === '9:16') { width = 1440; height = 2560; }
      else if (settings.aspectRatio === '1:1') { width = 1440; height = 1440; }
      else if (settings.aspectRatio === '4:5') { width = 1440; height = 1800; }
    } else if (preset === '4K') {
      if (settings.aspectRatio === '16:9') { width = 3840; height = 2160; }
      else if (settings.aspectRatio === '9:16') { width = 2160; height = 3840; }
      else if (settings.aspectRatio === '1:1') { width = 2160; height = 2160; }
      else if (settings.aspectRatio === '4:5') { width = 2160; height = 2700; }
    }

    onChange({
      ...settings,
      resolutionPreset: preset,
      width,
      height,
    });
  };

  const handleFpsChange = (fps: number) => {
    const durationInFrames = Math.round(settings.durationInSeconds * fps);
    onChange({
      ...settings,
      fps,
      durationInFrames,
    });
  };

  const handleDurationSecondsChange = (seconds: number) => {
    const validSeconds = Math.max(1, Math.min(60, seconds));
    const durationInFrames = Math.round(validSeconds * settings.fps);
    onChange({
      ...settings,
      durationInSeconds: validSeconds,
      durationInFrames,
    });
  };

  return (
    <div className="w-80 h-full bg-studio-surface border-l border-studio-border flex flex-col overflow-y-auto select-none">
      {/* Header */}
      <div className="h-12 border-b border-studio-border px-5 flex items-center space-x-2 bg-studio-surface">
        <Sliders className="w-4 h-4 text-studio-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-studio-text">
          Video & Render Settings
        </span>
      </div>

      <div className="p-5 space-y-6 flex-1 text-xs">
        {/* Aspect Ratio */}
        <div className="space-y-2">
          <label className="font-semibold text-studio-text flex items-center justify-between">
            <span>Aspect Ratio</span>
            <span className="text-studio-text-muted font-normal text-[11px]">
              {settings.width} × {settings.height}
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAspectRatioChange('16:9')}
              className={`p-2.5 rounded-lg border text-left flex items-center space-x-2 transition-all ${
                settings.aspectRatio === '16:9'
                  ? 'border-studio-primary bg-studio-surface-soft text-studio-primary font-medium'
                  : 'border-studio-border hover:border-studio-pastel-blue text-studio-text'
              }`}
            >
              <Tv className="w-4 h-4" />
              <div>
                <div className="text-xs">16:9 Landscape</div>
                <div className="text-[10px] text-studio-text-muted">YouTube / Web</div>
              </div>
            </button>

            <button
              onClick={() => handleAspectRatioChange('9:16')}
              className={`p-2.5 rounded-lg border text-left flex items-center space-x-2 transition-all ${
                settings.aspectRatio === '9:16'
                  ? 'border-studio-primary bg-studio-surface-soft text-studio-primary font-medium'
                  : 'border-studio-border hover:border-studio-pastel-blue text-studio-text'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <div>
                <div className="text-xs">9:16 Vertical</div>
                <div className="text-[10px] text-studio-text-muted">TikTok / Reels</div>
              </div>
            </button>

            <button
              onClick={() => handleAspectRatioChange('1:1')}
              className={`p-2.5 rounded-lg border text-left flex items-center space-x-2 transition-all ${
                settings.aspectRatio === '1:1'
                  ? 'border-studio-primary bg-studio-surface-soft text-studio-primary font-medium'
                  : 'border-studio-border hover:border-studio-pastel-blue text-studio-text'
              }`}
            >
              <Square className="w-4 h-4" />
              <div>
                <div className="text-xs">1:1 Square</div>
                <div className="text-[10px] text-studio-text-muted">Instagram Feed</div>
              </div>
            </button>

            <button
              onClick={() => handleAspectRatioChange('4:5')}
              className={`p-2.5 rounded-lg border text-left flex items-center space-x-2 transition-all ${
                settings.aspectRatio === '4:5'
                  ? 'border-studio-primary bg-studio-surface-soft text-studio-primary font-medium'
                  : 'border-studio-border hover:border-studio-pastel-blue text-studio-text'
              }`}
            >
              <RectangleVertical className="w-4 h-4" />
              <div>
                <div className="text-xs">4:5 Portrait</div>
                <div className="text-[10px] text-studio-text-muted">Social Promo</div>
              </div>
            </button>
          </div>
        </div>

        {/* Resolution Preset */}
        <div className="space-y-2">
          <label className="font-semibold text-studio-text">Resolution Preset</label>
          <div className="grid grid-cols-4 gap-1.5 bg-studio-surface-soft p-1 rounded-lg border border-studio-border">
            {(['720p', '1080p', '1440p', '4K'] as const).map((res) => (
              <button
                key={res}
                onClick={() => handleResolutionChange(res)}
                className={`py-1.5 rounded text-center text-xs font-medium transition-all ${
                  settings.resolutionPreset === res
                    ? 'bg-white text-studio-primary shadow-xs'
                    : 'text-studio-text-muted hover:text-studio-text'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
          {settings.resolutionPreset === '4K' && (
            <div className="flex items-center space-x-1.5 text-amber-600 bg-amber-50 p-2 rounded text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>4K export requires higher system RAM and longer render time.</span>
            </div>
          )}
        </div>

        {/* Frame Rate */}
        <div className="space-y-2">
          <label className="font-semibold text-studio-text flex items-center justify-between">
            <span>Frame Rate (FPS)</span>
            <span className="text-studio-primary font-mono font-semibold">{settings.fps} FPS</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[24, 30, 60].map((fps) => (
              <button
                key={fps}
                onClick={() => handleFpsChange(fps)}
                className={`py-2 rounded-lg border text-center font-medium transition-all ${
                  settings.fps === fps
                    ? 'border-studio-primary bg-studio-surface-soft text-studio-primary'
                    : 'border-studio-border hover:border-studio-pastel-blue text-studio-text'
                }`}
              >
                {fps} FPS
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-studio-text flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-studio-text-muted" />
              <span>Duration</span>
            </label>
            <span className="text-studio-primary font-mono font-semibold">
              {settings.durationInSeconds}s ({settings.durationInFrames} frames)
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={0.5}
            value={settings.durationInSeconds}
            onChange={(e) => handleDurationSecondsChange(parseFloat(e.target.value))}
            className="w-full accent-studio-primary cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-studio-text-muted">
            <span>1s</span>
            <span>6s</span>
            <span>15s</span>
            <span>30s</span>
          </div>
        </div>

        {/* Output Format info */}
        <div className="pt-2 border-t border-studio-border space-y-2">
          <label className="font-semibold text-studio-text">Export Format</label>
          <div className="bg-studio-surface-soft p-3 rounded-lg border border-studio-border flex items-center justify-between">
            <div>
              <div className="font-semibold text-studio-text">MP4 (H.264 / AAC)</div>
              <div className="text-[10px] text-studio-text-muted">High-compatibility video</div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-medium">
              Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
