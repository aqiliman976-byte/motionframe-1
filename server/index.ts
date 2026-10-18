import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { renderService } from './render-service.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Serve completed MP4 videos from public/renders with video streaming / Range support
const rendersDir = path.resolve('public', 'renders');
if (!fs.existsSync(rendersDir)) {
  fs.mkdirSync(rendersDir, { recursive: true });
}

app.use('/renders', express.static(rendersDir, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
}));

// Validation schema for render requests
const RenderRequestSchema = z.object({
  code: z.string().min(10, 'Code cannot be empty'),
  settings: z.object({
    width: z.number().int().min(240).max(3840),
    height: z.number().int().min(240).max(3840),
    fps: z.number().int().min(12).max(60),
    durationInFrames: z.number().int().min(10).max(3600), // Up to 2 mins at 30fps
    backgroundColor: z.string().optional(),
  }),
});

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'MotionFrame Studio Renderer' });
});

// Code Validation endpoint
app.post('/api/validate', (req, res) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ valid: false, errors: [{ message: 'Code string is required' }] });
    }

    const errors: Array<{ message: string }> = [];
    const forbidden = [
      /require\s*\(\s*['"`](?:child_process|fs|path|os|net|http|https)['"`]\s*\)/,
      /\bprocess\.env\b/,
      /\beval\s*\(/,
      /\bFunction\s*\(/,
    ];

    for (const p of forbidden) {
      if (p.test(code)) {
        errors.push({ message: 'Forbidden API or execution detected.' });
        break;
      }
    }

    const hasExport = /export\s+(?:const|function|let|var)\s+MotionGraphic\b/.test(code) ||
      /export\s+default\s+/.test(code) ||
      /(?:function|const|let)\s+MotionGraphic\b/.test(code);

    if (!hasExport) {
      errors.push({
        message: 'Missing entry point: Must export "MotionGraphic" or a default export component.',
      });
    }

    return res.json({
      valid: errors.length === 0,
      errors,
    });
  } catch (err: any) {
    return res.status(500).json({ valid: false, errors: [{ message: err.message }] });
  }
});

// Initiate Render Job
app.post('/api/render', async (req, res) => {
  try {
    const parsed = RenderRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid render configuration',
        details: parsed.error.issues,
      });
    }

    const { code, settings } = parsed.data;

    // Security pixel limit safeguard (e.g. 4K max = 3840 * 2160 = 8.3M pixels)
    if (settings.width * settings.height > 3840 * 2160) {
      return res.status(400).json({
        error: 'Resolution exceeds maximum allowed pixel count (4K).',
      });
    }

    const job = renderService.createJob(code, settings);

    res.json({
      success: true,
      jobId: job.id,
      status: job.status,
      stage: job.stage,
      progress: job.progress,
    });
  } catch (err: any) {
    console.error('Error initiating render:', err);
    res.status(500).json({ error: err.message || 'Failed to start render' });
  }
});

// Cancel Render Job
app.post('/api/render/:jobId/cancel', (req, res) => {
  const { jobId } = req.params;
  const cancelled = renderService.cancelJob(jobId);
  res.json({ success: cancelled });
});

// Status Polling Fallback
app.get('/api/render/:jobId/status', (req, res) => {
  const { jobId } = req.params;
  const job = renderService.getJob(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Render job not found' });
  }
  res.json(job);
});

// SSE Progress Stream
app.get('/api/render/:jobId/progress', (req, res) => {
  const { jobId } = req.params;
  const job = renderService.getJob(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Render job not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial state immediately
  res.write(`data: ${JSON.stringify(job)}\n\n`);

  const onProgress = (updatedJob: any) => {
    res.write(`data: ${JSON.stringify(updatedJob)}\n\n`);
    if (
      updatedJob.status === 'completed' ||
      updatedJob.status === 'failed' ||
      updatedJob.status === 'cancelled'
    ) {
      renderService.off(`progress:${jobId}`, onProgress);
      res.end();
    }
  };

  renderService.on(`progress:${jobId}`, onProgress);

  req.on('close', () => {
    renderService.off(`progress:${jobId}`, onProgress);
  });
});

// In production, serve built frontend if available
const clientDist = path.resolve('dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/renders')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[MotionFrame Studio Server] running at http://localhost:${PORT}`);
});
