import React from 'react';
import {
  X,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Film,
  Clock,
  HardDrive,
  FileCheck
} from 'lucide-react';
import { RenderJobStatus } from '../types/contract';

interface RenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: RenderJobStatus | null;
  onCancel: () => void;
  onRenderAgain: () => void;
}

export const RenderModal: React.FC<RenderModalProps> = ({
  isOpen,
  onClose,
  job,
  onCancel,
  onRenderAgain,
}) => {
  if (!isOpen || !job) return null;

  const isRendering =
    job.status === 'queued' ||
    job.status === 'preparing' ||
    job.status === 'compiling' ||
    job.status === 'rendering' ||
    job.status === 'encoding' ||
    job.status === 'verifying';

  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';
  const isCancelled = job.status === 'cancelled';

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatElapsed = (ms?: number) => {
    if (!ms) return '0s';
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white rounded-studio-lg border border-studio-border shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-studio-border px-6 flex items-center justify-between bg-studio-surface">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-studio-surface-soft flex items-center justify-center text-studio-primary">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-studio-text">Render Studio</h3>
              <p className="text-[11px] text-studio-text-muted">
                {isCompleted ? 'MP4 Video Ready for Download' : isRendering ? 'Processing Video Render' : 'Render Status'}
              </p>
            </div>
          </div>

          {!isRendering && (
            <button
              onClick={onClose}
              className="text-studio-text-muted hover:text-studio-text p-1 rounded-lg hover:bg-studio-surface-soft transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Rendering Progress View */}
          {isRendering && (
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-studio-surface-soft border border-studio-pastel-blue text-studio-primary flex items-center justify-center mx-auto shadow-sm">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>

              <div>
                <h4 className="font-bold text-base text-studio-text">{job.stage}</h4>
                <p className="text-xs text-studio-text-muted mt-1 font-mono">
                  {job.renderedFrames !== undefined && job.totalFrames
                    ? `Rendered ${job.renderedFrames} / ${job.totalFrames} frames`
                    : 'Orchestrating render pipeline...'}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 max-w-md mx-auto">
                <div className="w-full bg-studio-surface-soft h-3 rounded-full overflow-hidden border border-studio-border p-0.5">
                  <div
                    className="bg-studio-primary h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${Math.round(job.progress * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-studio-text-muted font-mono px-1">
                  <span>{Math.round(job.progress * 100)}%</span>
                  <span>Elapsed: {formatElapsed(job.elapsedTimeMs)}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onCancel}
                  className="px-4 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-all"
                >
                  Cancel Render
                </button>
              </div>
            </div>
          )}

          {/* Render Completed View */}
          {isCompleted && (
            <div className="space-y-5">
              <div className="flex items-center space-x-2 text-studio-success bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold">Render completed and verified successfully!</span>
                  <div className="text-emerald-700 mt-0.5">
                    H.264 MP4 generated with no dropped frames.
                  </div>
                </div>
              </div>

              {/* Video Player Preview */}
              {job.outputUrl && (
                <div className="rounded-xl overflow-hidden border border-studio-border bg-black shadow-inner aspect-video flex items-center justify-center">
                  <video
                    src={job.outputUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Meta Stats */}
              <div className="grid grid-cols-3 gap-3 text-xs bg-studio-surface-soft p-3 rounded-lg border border-studio-border">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-studio-primary" />
                  <div>
                    <div className="text-[10px] text-studio-text-muted">File Size</div>
                    <div className="font-semibold text-studio-text">{formatFileSize(job.fileSize)}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-studio-primary" />
                  <div>
                    <div className="text-[10px] text-studio-text-muted">Render Time</div>
                    <div className="font-semibold text-studio-text">{formatElapsed(job.elapsedTimeMs)}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-studio-primary" />
                  <div>
                    <div className="text-[10px] text-studio-text-muted">Codec</div>
                    <div className="font-semibold text-studio-text">H.264 MP4</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <a
                  href={job.outputUrl}
                  download={`motionframe_${job.id}.mp4`}
                  className="flex-1 flex items-center justify-center space-x-2 bg-studio-primary hover:bg-studio-primary-hover text-white py-2.5 px-4 rounded-studio font-medium text-sm shadow-sm transition-all text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Download MP4 ({formatFileSize(job.fileSize)})</span>
                </a>

                <button
                  onClick={onRenderAgain}
                  className="px-4 py-2.5 rounded-studio border border-studio-border hover:border-studio-pastel-blue text-studio-text hover:bg-studio-surface-soft text-sm font-medium transition-all"
                >
                  Render Again
                </button>
              </div>
            </div>
          )}

          {/* Failed / Cancelled View */}
          {(isFailed || isCancelled) && (
            <div className="space-y-4 py-2">
              <div className="flex items-start space-x-3 bg-red-50 p-4 rounded-lg border border-red-200 text-xs text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-red-800">
                    {isCancelled ? 'Render Cancelled' : 'Rendering Failed'}
                  </h4>
                  <p className="mt-1">{job.error || 'The job was stopped before completion.'}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-studio-border text-xs font-medium hover:bg-studio-surface-soft transition-all"
                >
                  Close
                </button>
                <button
                  onClick={onRenderAgain}
                  className="px-4 py-2 rounded-lg bg-studio-primary text-white text-xs font-medium hover:bg-studio-primary-hover transition-all"
                >
                  Retry Render
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
