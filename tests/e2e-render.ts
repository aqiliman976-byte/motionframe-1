import fs from 'fs';
import path from 'path';
import { STARTER_COMPOSITION } from '../src/templates/starter';

async function runE2ETest() {
  console.log('--- MotionFrame Studio End-to-End Render Test ---');

  // 1. Submit render job for starter composition (fast 2s render: 60 frames at 30 fps)
  const renderPayload = {
    code: STARTER_COMPOSITION,
    settings: {
      width: 1280,
      height: 720,
      fps: 30,
      durationInFrames: 60,
      backgroundColor: '#F5F8FF',
    },
  };

  console.log('Submitting render job...');
  const res = await fetch('http://127.0.0.1:3001/api/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(renderPayload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Render submission failed (${res.status}): ${errorText}`);
  }

  const { jobId, status } = await res.json();
  console.log(`Render job started successfully: Job ID = ${jobId}, Initial status = ${status}`);

  // 2. Poll job status until completed
  let jobData: any = null;
  const startTime = Date.now();
  const maxWaitMs = 120000; // 2 minutes max

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const statusRes = await fetch(`http://127.0.0.1:3001/api/render/${jobId}/status`);
      if (statusRes.ok) {
        jobData = await statusRes.json();
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[+${elapsed}s] Stage: "${jobData.stage}" | Progress: ${(jobData.progress * 100).toFixed(1)}% | Status: ${jobData.status}`);

        if (jobData.status === 'completed' || jobData.status === 'failed' || jobData.status === 'cancelled') {
          break;
        }
      }
    } catch (err: any) {
      console.log(`(waiting for webpack build to yield CPU...)`);
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  if (!jobData || jobData.status !== 'completed') {
    throw new Error(`Job failed or timed out. Final state: ${JSON.stringify(jobData)}`);
  }

  console.log('\nRender completed successfully!');
  console.log(`Output URL: http://localhost:3001${jobData.outputUrl}`);
  console.log(`Local Output Path: ${jobData.outputPath}`);
  console.log(`File Size: ${jobData.fileSize} bytes`);

  // 3. Verify file on disk
  if (!fs.existsSync(jobData.outputPath)) {
    throw new Error(`Rendered file does not exist at ${jobData.outputPath}`);
  }

  const fileStats = fs.statSync(jobData.outputPath);
  if (fileStats.size === 0) {
    throw new Error('Rendered MP4 file is empty (0 bytes)!');
  }

  // 4. Verify HTTP download endpoint
  console.log('Verifying HTTP download endpoint...');
  const dlRes = await fetch(`http://127.0.0.1:3001${jobData.outputUrl}`);
  if (!dlRes.ok) {
    throw new Error(`Failed to download MP4 from ${jobData.outputUrl}: status ${dlRes.status}`);
  }

  const contentType = dlRes.headers.get('content-type');
  const acceptRanges = dlRes.headers.get('accept-ranges');
  console.log(`HTTP Content-Type: ${contentType}`);
  console.log(`HTTP Accept-Ranges: ${acceptRanges}`);

  if (contentType !== 'video/mp4') {
    throw new Error(`Expected Content-Type video/mp4, got ${contentType}`);
  }

  console.log('\n--- ALL E2E VERIFICATIONS PASSED SUCCESSFULLY ---');
}

runE2ETest().catch((err) => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
