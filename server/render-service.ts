import path from 'path';
import fs from 'fs';
import os from 'os';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { EventEmitter } from 'events';

export interface RenderJob {
  id: string;
  code: string;
  settings: {
    width: number;
    height: number;
    fps: number;
    durationInFrames: number;
    backgroundColor?: string;
  };
  status: 'queued' | 'preparing' | 'compiling' | 'rendering' | 'encoding' | 'verifying' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  stage: string;
  renderedFrames?: number;
  totalFrames?: number;
  fps?: number;
  elapsedTimeMs?: number;
  outputUrl?: string;
  outputPath?: string;
  fileSize?: number;
  error?: string;
  createdAt: number;
  cancelRequested?: boolean;
}

export class RenderService extends EventEmitter {
  private jobs = new Map<string, RenderJob>();
  private activeJobId: string | null = null;
  private rendersDir: string;
  private ffmpegPath: string;

  constructor() {
    super();
    this.rendersDir = path.resolve('public', 'renders');
    if (!fs.existsSync(this.rendersDir)) {
      fs.mkdirSync(this.rendersDir, { recursive: true });
    }

    // Path to FFmpeg binaries directory
    const customFfmpeg = 'C:\\Users\\LENOVO\\AppData\\Local\\hermes\\tools\\ffmpeg-9.0.1-win32-x64\\bin';
    this.ffmpegPath = fs.existsSync(customFfmpeg) ? customFfmpeg : '';

    // Periodic cleanup of older renders (> 2 hours)
    setInterval(() => this.cleanupOldRenders(), 30 * 60 * 1000);
  }

  getJob(id: string): RenderJob | undefined {
    return this.jobs.get(id);
  }

  cancelJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;
    if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
      return false;
    }
    job.cancelRequested = true;
    job.status = 'cancelled';
    job.stage = 'Cancelled by user';
    this.emit(`progress:${id}`, job);
    if (this.activeJobId === id) {
      this.activeJobId = null;
    }
    return true;
  }

  createJob(code: string, settings: RenderJob['settings']): RenderJob {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const job: RenderJob = {
      id,
      code,
      settings,
      status: 'queued',
      progress: 0,
      stage: 'Queued',
      totalFrames: settings.durationInFrames,
      fps: settings.fps,
      createdAt: Date.now(),
    };

    this.jobs.set(id, job);
    this.processQueue();
    return job;
  }

  private async processQueue() {
    if (this.activeJobId) {
      return; // Only one active render at a time to prevent CPU/memory saturation
    }

    const nextJob = Array.from(this.jobs.values()).find((j) => j.status === 'queued');
    if (!nextJob) return;

    this.activeJobId = nextJob.id;
    await this.executeJob(nextJob);
    this.activeJobId = null;
    this.processQueue();
  }

  private updateJobProgress(
    job: RenderJob,
    status: RenderJob['status'],
    stage: string,
    progress: number,
    extra: Partial<RenderJob> = {}
  ) {
    if (job.cancelRequested) return;

    job.status = status;
    job.stage = stage;
    job.progress = Math.min(Math.max(progress, 0), 1);
    job.elapsedTimeMs = Date.now() - job.createdAt;
    Object.assign(job, extra);

    this.emit(`progress:${job.id}`, job);
  }

  private async executeJob(job: RenderJob) {
    const tempDir = path.join(os.tmpdir(), `motionframe_${job.id}`);
    const outputFilename = `motion_${job.id}.mp4`;
    const outputPath = path.join(this.rendersDir, outputFilename);
    const outputUrl = `/renders/${outputFilename}`;

    job.outputPath = outputPath;
    job.outputUrl = outputUrl;

    try {
      if (job.cancelRequested) return;

      this.updateJobProgress(job, 'preparing', 'Preparing composition workspace', 0.05);
      fs.mkdirSync(tempDir, { recursive: true });

      // Clean Motio code of any markdown fences
      let cleanedCode = job.code.trim();
      const codeBlockRegex = /```(?:tsx|typescript|jsx|javascript)?\s*([\s\S]*?)```/i;
      const match = cleanedCode.match(codeBlockRegex);
      if (match && match[1]) {
        cleanedCode = match[1].trim();
      }
      cleanedCode = cleanedCode.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();

      // Write composition component
      const compPath = path.join(tempDir, 'Composition.tsx');
      fs.writeFileSync(compPath, cleanedCode, 'utf-8');

      // Write entry point Root.tsx
      const rootPath = path.join(tempDir, 'Root.tsx');
      const rootSource = `
import React from 'react';
import { Composition, registerRoot } from 'remotion';
import * as UserModule from './Composition';

const MotionGraphic = UserModule.MotionGraphic || UserModule.default;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MotionGraphic"
      component={MotionGraphic}
      durationInFrames={${job.settings.durationInFrames}}
      fps={${job.settings.fps}}
      width={${job.settings.width}}
      height={${job.settings.height}}
      defaultProps={{
        width: ${job.settings.width},
        height: ${job.settings.height},
        fps: ${job.settings.fps},
        durationInFrames: ${job.settings.durationInFrames},
        backgroundColor: ${JSON.stringify(job.settings.backgroundColor || '#F5F8FF')}
      }}
    />
  );
};

registerRoot(RemotionRoot);
`;
      fs.writeFileSync(rootPath, rootSource, 'utf-8');

      if (job.cancelRequested) return;

      this.updateJobProgress(job, 'compiling', 'Compiling video bundle with Webpack', 0.15);

      const bundleLocation = await bundle({
        entryPoint: rootPath,
      });

      if (job.cancelRequested) return;

      this.updateJobProgress(job, 'preparing', 'Loading composition metadata', 0.25);

      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: 'MotionGraphic',
      });

      if (job.cancelRequested) return;

      this.updateJobProgress(job, 'rendering', 'Rendering frames', 0.3);

      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation: outputPath,
        binariesDirectory: this.ffmpegPath || undefined,
        onProgress: ({ progress, renderedFrames }) => {
          if (job.cancelRequested) return;
          // Scale progress between 0.30 and 0.85
          const currentProgress = 0.3 + progress * 0.55;
          const stage = progress >= 0.99 ? 'Finalizing frame stitching' : `Rendering frame ${renderedFrames} of ${job.settings.durationInFrames}`;
          this.updateJobProgress(job, 'rendering', stage, currentProgress, {
            renderedFrames,
            totalFrames: job.settings.durationInFrames,
          });
        },
      });

      if (job.cancelRequested) return;

      this.updateJobProgress(job, 'verifying', 'Verifying output MP4 integrity', 0.92);

      // Verify output file exists and is valid
      if (!fs.existsSync(outputPath)) {
        throw new Error('Render output file was not created by the renderer.');
      }

      const fileStats = fs.statSync(outputPath);
      if (fileStats.size === 0) {
        throw new Error('Generated MP4 file is empty (0 bytes).');
      }

      job.fileSize = fileStats.size;

      this.updateJobProgress(job, 'completed', 'Render complete! MP4 ready.', 1.0, {
        fileSize: fileStats.size,
      });
    } catch (err: any) {
      if (job.cancelRequested) return;
      console.error(`Render job ${job.id} failed:`, err);
      job.status = 'failed';
      job.stage = 'Render failed';
      job.error = err.message || 'An unexpected error occurred during rendering.';
      this.emit(`progress:${job.id}`, job);
    } finally {
      // Clean up temporary workspace directory
      try {
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
      } catch (cleanupErr) {
        console.warn('Failed to clean up temp render dir:', cleanupErr);
      }
    }
  }

  private cleanupOldRenders() {
    try {
      const files = fs.readdirSync(this.rendersDir);
      const now = Date.now();
      const maxAgeMs = 2 * 60 * 60 * 1000; // 2 hours

      for (const file of files) {
        const filePath = path.join(this.rendersDir, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (err) {
      console.warn('Error during render files cleanup:', err);
    }
  }
}

export const renderService = new RenderService();
