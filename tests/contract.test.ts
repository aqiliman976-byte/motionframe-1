import { describe, it, expect } from 'vitest';
import { cleanMotioCode, validateMotioCode, compileMotioComponent } from '../src/services/compiler';
import { STARTER_COMPOSITION } from '../src/templates/starter';

describe('MotionFrame Composition Contract & Motio Compatibility', () => {
  it('safely strips markdown fences from Motio code', () => {
    const raw = `\`\`\`tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';

export const MotionGraphic = () => <AbsoluteFill>Hello</AbsoluteFill>;
\`\`\``;

    const cleaned = cleanMotioCode(raw);
    expect(cleaned).not.toContain('```');
    expect(cleaned).toContain('export const MotionGraphic');
  });

  it('validates and accepts standard Motio composition', () => {
    const code = `
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

export const MotionGraphic = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill>Frame {frame}</AbsoluteFill>;
};
`;
    const result = validateMotioCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects code missing MotionGraphic export', () => {
    const code = `
import React from 'react';
const SomeRandomComponent = () => <div>Hello</div>;
`;
    const result = validateMotioCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message.includes('MotionGraphic'))).toBe(true);
  });

  it('rejects unsafe Node.js module access (child_process, fs)', () => {
    const code = `
import React from 'react';
const cp = require('child_process');
export const MotionGraphic = () => <div>Hacked</div>;
`;
    const result = validateMotioCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message.includes('Node.js built-in'))).toBe(true);
  });

  it('rejects eval() execution', () => {
    const code = `
import React from 'react';
eval('console.log("bad")');
export const MotionGraphic = () => <div>Bad</div>;
`;
    const result = validateMotioCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message.includes('eval'))).toBe(true);
  });

  it('compiles starter composition into a runnable React component', () => {
    const { component, error } = compileMotioComponent(STARTER_COMPOSITION);
    expect(error).toBeNull();
    expect(component).not.toBeNull();
    expect(typeof component).toBe('function');
  });
});
