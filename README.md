# MotionFrame Studio

> Browser-based studio for compiling, previewing, and rendering Motio AI motion graphics to production MP4 videos.

---

## 🎨 Overview

**MotionFrame Studio** bridges generative motion design code (created by Motio AI) into interactive, frame-accurate previews and high-definition MP4 video exports.

* **Frontend**: React 18, TypeScript, Tailwind CSS, `@remotion/player`, Monaco Editor, Lucide React, Sucrase (browser-side dynamic compiler).
* **Backend**: Node.js, Express, `@remotion/bundler` (Webpack), `@remotion/renderer`, Chrome Headless Shell, FFmpeg 9.0.
* **Palette**: Clean Linear / Apple-inspired pastel-blue theme (`#F5F8FF` background, `#477DCC` primary action, `#A9C9FF` pastel accents).

---

## 🚀 Quick Start

### 1. Development Mode
Run both client and server concurrently:
\`\`\`bash
npm run dev
\`\`\`
* Frontend: `http://localhost:3000` (proxies `/api` and `/renders` to backend)
* Backend: `http://localhost:3001`

### 2. Production Build & Start
\`\`\`bash
npm run build
npm start
\`\`\`
Opens the unified production server at `http://localhost:3001`.

### 3. Run Automated Tests
\`\`\`bash
# Unit & Contract Validation Tests
npm test

# Full End-to-End Render Pipeline Verification
npx tsx tests/e2e-render.ts
\`\`\`

---

## 📜 MotionFrame Composition Contract

Motio AI prompts should specify the following standard contract:

\`\`\`tsx
import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence
} from 'remotion';

export const MotionGraphic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill style={{ backgroundColor: '#F5F8FF', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ fontSize: 64, color: '#172B4D', transform: \`scale(\${titleSpring})\` }}>
        Kinetic Motion
      </h1>
    </AbsoluteFill>
  );
};
\`\`\`

### Contract Rules:
1. **Entry Point**: Must export `MotionGraphic` (or `export default`).
2. **Supported Imports**: `react`, `remotion`, `lucide-react`.
3. **Timing Hooks**: `useCurrentFrame()`, `useVideoConfig()`, `spring()`, `interpolate()`.
4. **Markdown Fences**: Automatically detected and stripped when pasting from AI chatbots (e.g., `\`\`\`tsx ... \`\`\``).
5. **Security**: Node.js OS modules (`fs`, `child_process`), `eval()`, and `process.env` access are blocked.

---

## 🎬 Video Configuration Presets

* **Aspect Ratios**:
  * `16:9` Landscape (1920×1080 / 1280×720 / 3840×2160)
  * `9:16` Vertical / Stories / Reels (1080×1920 / 720×1280)
  * `1:1` Square (1080×1080)
  * `4:5` Portrait (1080×1350)
* **Frame Rates**: 24 FPS, 30 FPS, 60 FPS
* **Resolutions**: 720p, 1080p, 1440p, 4K
* **Codec**: H.264 video with MP4 container, byte-range streaming enabled.
