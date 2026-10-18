export interface VideoSettings {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  durationInSeconds: number;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  resolutionPreset: '720p' | '1080p' | '1440p' | '4K';
  backgroundColor: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    line?: number;
    column?: number;
    message: string;
  }>;
  warnings: string[];
  cleanCode: string;
}

export interface RenderJobStatus {
  jobId: string;
  status: 'queued' | 'preparing' | 'compiling' | 'rendering' | 'encoding' | 'verifying' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0 to 1
  stage: string;
  renderedFrames?: number;
  totalFrames?: number;
  fps?: number;
  elapsedTimeMs?: number;
  outputUrl?: string;
  fileSize?: number;
  error?: string;
}

export interface CompositionProps {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  backgroundColor?: string;
}
