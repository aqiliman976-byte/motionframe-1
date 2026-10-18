import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useId,
} from 'react';
import * as Remotion from 'remotion';
import * as LucideIcons from 'lucide-react';
import { transform } from 'sucrase';
import { ValidationResult } from '../types/contract';

/**
 * Strips markdown fences, backticks, and any leading/trailing conversational commentary
 * often produced by AI models like Motio.
 */
export function cleanMotioCode(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.trim();

  // If code contains ```tsx or ```typescript or ```
  const codeBlockRegex = /```(?:tsx|typescript|jsx|javascript)?\s*([\s\S]*?)```/i;
  const match = cleaned.match(codeBlockRegex);
  if (match && match[1]) {
    cleaned = match[1].trim();
  }

  // Remove any remaining stray leading or trailing fences if any
  cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();

  return cleaned;
}

/**
 * Validates Motio code against the MotionFrame Composition Contract
 */
export function validateMotioCode(rawCode: string): ValidationResult {
  const cleanCode = cleanMotioCode(rawCode);
  const errors: Array<{ line?: number; column?: number; message: string }> = [];
  const warnings: string[] = [];

  if (!cleanCode) {
    return {
      valid: false,
      errors: [{ message: 'Code is empty. Please paste your Motio TSX code.' }],
      warnings: [],
      cleanCode: '',
    };
  }

  // Security checks: Disallow forbidden APIs
  const forbiddenPatterns = [
    { pattern: /require\s*\(\s*['"`](?:child_process|fs|path|os|net|http|https)['"`]\s*\)/, msg: 'Node.js built-in modules are not permitted.' },
    { pattern: /\bprocess\.env\b/, msg: 'Direct access to server environment variables (process.env) is restricted.' },
    { pattern: /\beval\s*\(/, msg: 'Use of eval() is strictly forbidden for security reasons.' },
    { pattern: /\bFunction\s*\(/, msg: 'Dynamic Function constructor execution is restricted.' },
    { pattern: /\bwindow\.location\b/, msg: 'Navigation or window redirection is not permitted.' },
    { pattern: /\bdocument\.cookie\b/, msg: 'Direct cookie access is restricted.' },
  ];

  for (const { pattern, msg } of forbiddenPatterns) {
    if (pattern.test(cleanCode)) {
      errors.push({ message: `Security violation: ${msg}` });
    }
  }

  // Check if MotionGraphic is exported or defined
  const hasNamedExport = /export\s+(?:const|function|let|var)\s+MotionGraphic\b/.test(cleanCode);
  const hasDefaultExport = /export\s+default\s+/.test(cleanCode);
  const hasComponentDef = /(?:function|const|let)\s+MotionGraphic\b/.test(cleanCode);

  if (!hasNamedExport && !hasDefaultExport && !hasComponentDef) {
    errors.push({
      message: 'Composition entry point missing: The code must export "MotionGraphic" (e.g. export const MotionGraphic: React.FC = () => { ... }) or provide a default export.',
    });
  }

  if (!cleanCode.includes('remotion')) {
    warnings.push('No remotion imports detected. Ensure you use useCurrentFrame(), AbsoluteFill, and spring() for animated rendering.');
  }

  // Syntax check via Sucrase
  try {
    transform(cleanCode, {
      transforms: ['typescript', 'jsx'],
      jsxRuntime: 'classic',
      production: true,
    });
  } catch (err: any) {
    const lineMatch = err.message?.match(/\((\d+):(\d+)\)/);
    const line = lineMatch ? parseInt(lineMatch[1], 10) : undefined;
    const col = lineMatch ? parseInt(lineMatch[2], 10) : undefined;
    errors.push({
      line,
      column: col,
      message: err.message || 'Syntax or TypeScript compilation error.',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    cleanCode,
  };
}

/**
 * Automatically repairs and adapts any problematic or broken Motio TSX code:
 * - Strips all markdown fences and surrounding commentary
 * - Injects missing React & Remotion imports
 * - Maps component to required 'export const MotionGraphic'
 * - Neutralizes forbidden/unsupported modules
 */
export function autoFixMotioCode(rawCode: string): {
  fixedCode: string;
  changes: string[];
  success: boolean;
} {
  const changes: string[] = [];
  let code = cleanMotioCode(rawCode);

  if (!code) {
    return {
      fixedCode: rawCode,
      changes: ['Code was completely empty; unable to auto-fix.'],
      success: false,
    };
  }

  changes.push('Cleaned markdown fences and formatted source code');

  // 1. Remove dangerous or non-web calls
  if (/require\s*\(\s*['"`](?:child_process|fs|path|os|net|http|https)['"`]\s*\)/.test(code)) {
    code = code.replace(/const\s+\w+\s*=\s*require\s*\(\s*['"`](?:child_process|fs|path|os|net|http|https)['"`]\s*\);?/g, '// [Auto-fixed: Removed Node.js module]');
    changes.push('Neutralized unauthorized Node.js system modules');
  }

  if (/\beval\s*\(/.test(code)) {
    code = code.replace(/\beval\s*\((.*?)\)/g, '/* [Auto-fixed: eval neutralized] */ undefined');
    changes.push('Neutralized dangerous eval() execution');
  }

  // 2. Normalize and inject React import if missing
  if (!code.includes("from 'react'") && !code.includes('from "react"')) {
    code = `import React from 'react';\n` + code;
    changes.push("Injected missing 'import React from react'");
  }

  // 3. Scan for Remotion hooks and utilities used in code
  const remotionKeywords = [
    'AbsoluteFill',
    'useCurrentFrame',
    'useVideoConfig',
    'spring',
    'interpolate',
    'interpolateColors',
    'Sequence',
    'Series',
    'Loop',
    'Easing',
    'Img',
    'Audio',
    'random',
  ];

  const foundKeywords = remotionKeywords.filter((kw) => new RegExp(`\\b${kw}\\b`).test(code));
  if (foundKeywords.length === 0) {
    foundKeywords.push('AbsoluteFill', 'useCurrentFrame', 'useVideoConfig', 'spring', 'interpolate', 'Sequence');
  }

  if (!code.includes("from 'remotion'") && !code.includes('from "remotion"')) {
    const importStatement = `import {\n  ${foundKeywords.join(',\n  ')}\n} from 'remotion';\n`;
    if (code.includes("from 'react';")) {
      code = code.replace("from 'react';", `from 'react';\n${importStatement}`);
    } else {
      code = importStatement + code;
    }
    changes.push(`Injected Remotion imports (${foundKeywords.join(', ')})`);
  } else {
    const remotionImportMatch = code.match(/import\s*\{([^}]+)\}\s*from\s*['"]remotion['"]/);
    if (remotionImportMatch) {
      const existing = remotionImportMatch[1].split(',').map((s) => s.trim());
      const missing = foundKeywords.filter((kw) => !existing.includes(kw));
      if (missing.length > 0) {
        const updated = [...existing, ...missing].join(', ');
        code = code.replace(remotionImportMatch[0], `import { ${updated} } from 'remotion'`);
        changes.push(`Added missing Remotion APIs to import: ${missing.join(', ')}`);
      }
    }
  }

  // 4. Ensure MotionGraphic entry point is properly exported
  const hasNamedMotionGraphic = /export\s+(?:const|function|let|var)\s+MotionGraphic\b/.test(code);
  const hasDefaultExport = /export\s+default\s+([A-Za-z0-9_]+)/.exec(code);
  const hasFunctionMotionGraphic = /(?:function|const|let)\s+MotionGraphic\b/.test(code);

  if (!hasNamedMotionGraphic) {
    if (hasFunctionMotionGraphic) {
      code = code.replace(/(?:function|const|let)\s+MotionGraphic\b/, 'export const MotionGraphic');
      changes.push('Exported MotionGraphic component as required named export');
    } else if (hasDefaultExport && hasDefaultExport[1]) {
      const compName = hasDefaultExport[1];
      code += `\n\n// [Auto-fixed: MotionFrame Composition Contract entry point]\nexport const MotionGraphic = ${compName};\n`;
      changes.push(`Mapped default export "${compName}" to "export const MotionGraphic"`);
    } else {
      const anyCompMatch = code.match(/(?:const|function)\s+([A-Z][A-Za-z0-9_]*)\b/);
      if (anyCompMatch && anyCompMatch[1]) {
        code += `\n\n// [Auto-fixed: MotionFrame Composition Contract entry point]\nexport const MotionGraphic = ${anyCompMatch[1]};\n`;
        changes.push(`Linked detected component "${anyCompMatch[1]}" to "export const MotionGraphic"`);
      } else {
        code = `import React from 'react';\nimport { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';\n\nexport const MotionGraphic: React.FC = () => {\n  const frame = useCurrentFrame();\n  const { fps, width, height } = useVideoConfig();\n  return (\n    <AbsoluteFill style={{ backgroundColor: '#F5F8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>\n      ${code}\n    </AbsoluteFill>\n  );\n};\n`;
        changes.push('Wrapped bare code into standard MotionGraphic component');
      }
    }
  }

  // 5. Test compile to verify the fix
  const validationAfter = validateMotioCode(code);

  return {
    fixedCode: code,
    changes,
    success: validationAfter.valid,
  };
}

/**
 * Dynamically compiles and instantiates the MotionGraphic React component
 * in browser memory for @remotion/player.
 */
export function compileMotioComponent(rawCode: string): {
  component: React.ComponentType<any> | null;
  error: string | null;
} {
  try {
    const cleanCode = cleanMotioCode(rawCode);

    // Transform imports: we isolate execution by simulating a CommonJS module
    // We rewrite imports to look up from our provided scope
    const transformed = transform(cleanCode, {
      transforms: ['typescript', 'jsx', 'imports'],
      jsxRuntime: 'classic',
    });

    const exports: Record<string, any> = {};
    const module = { exports };

    // Custom require function for the sandbox
    const customRequire = (specifier: string) => {
      if (specifier === 'react') {
        return {
          default: React,
          ...React,
          useState,
          useEffect,
          useMemo,
          useCallback,
          useRef,
          useId,
        };
      }
      if (specifier === 'remotion') {
        return Remotion;
      }
      if (specifier === 'lucide-react') {
        return LucideIcons;
      }
      throw new Error(`Unsupported import package "${specifier}". Only 'react', 'remotion', and 'lucide-react' are supported.`);
    };

    // Execute the transformed code in a controlled function scope
    const runner = new Function(
      'React',
      'Remotion',
      'require',
      'module',
      'exports',
      transformed.code
    );

    runner(React, Remotion, customRequire, module, exports);

    // Determine the entry point
    const Component = exports.MotionGraphic || exports.default || module.exports.MotionGraphic || module.exports.default;

    if (!Component) {
      return {
        component: null,
        error: 'Entry point "MotionGraphic" was not found in the exported module.',
      };
    }

    // Wrap in an error boundary component
    const SafeWrapper: React.FC<any> = (props) => {
      try {
        return React.createElement(Component, props);
      } catch (runtimeErr: any) {
        return React.createElement(
          'div',
          {
            style: {
              width: '100%',
              height: '100%',
              backgroundColor: '#FFF5F5',
              color: '#D64545',
              padding: 24,
              fontFamily: 'sans-serif',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            },
          },
          React.createElement('h3', { style: { margin: '0 0 8px 0', fontSize: 18 } }, 'Runtime Render Error'),
          React.createElement('pre', { style: { fontSize: 13, whiteSpace: 'pre-wrap', maxWidth: '80%' } }, runtimeErr.message)
        );
      }
    };

    return {
      component: SafeWrapper,
      error: null,
    };
  } catch (err: any) {
    return {
      component: null,
      error: err.message || 'Failed to compile Motio component.',
    };
  }
}
