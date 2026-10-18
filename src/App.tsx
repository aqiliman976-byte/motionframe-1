import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TopNav, WorkspaceMode } from './components/TopNav';
import { CodeEditor } from './components/CodeEditor';
import { PreviewCanvas } from './components/PreviewCanvas';
import { SettingsPanel } from './components/SettingsPanel';
import { RenderModal } from './components/RenderModal';
import { ContractModal } from './components/ContractModal';
import { STARTER_COMPOSITION } from './templates/starter';
import { validateMotioCode, compileMotioComponent, autoFixMotioCode } from './services/compiler';
import { VideoSettings, RenderJobStatus } from './types/contract';

const LOCAL_STORAGE_KEY = 'motionframe_studio_project_v1';

export function App() {
  const [projectName, setProjectName] = useState('Motio Kinetic Showcase');
  const [code, setCode] = useState(STARTER_COMPOSITION);
  const [previewedCode, setPreviewedCode] = useState(STARTER_COMPOSITION);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);

  // Layout & UI State
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('split');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Video Settings
  const [settings, setSettings] = useState<VideoSettings>({
    width: 1920,
    height: 1080,
    fps: 30,
    durationInSeconds: 6,
    durationInFrames: 180,
    aspectRatio: '16:9',
    resolutionPreset: '1080p',
    backgroundColor: '#F5F8FF',
  });

  // Render State
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState<RenderJobStatus | null>(null);

  // Check if there are code changes pending preview
  const isPendingPreview = code.trim() !== previewedCode.trim();

  // Restore saved draft from localStorage on initial load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.code) setCode(parsed.code);
        if (parsed.projectName) setProjectName(parsed.projectName);
        if (parsed.settings) setSettings(parsed.settings);
      }
    } catch (err) {
      console.warn('Failed to restore draft from localStorage:', err);
    }
  }, []);

  // Save draft to localStorage when code/settings change
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          projectName,
          code,
          settings,
        })
      );
      setHasUnsavedChanges(true);
    } catch (err) {
      console.warn('Failed to save draft to localStorage:', err);
    }
  }, [projectName, code, settings]);

  // Motio Code Validation (on the code in editor)
  const validation = useMemo(() => {
    return validateMotioCode(code);
  }, [code]);

  // Validation of the previewed code
  const previewValidation = useMemo(() => {
    return validateMotioCode(previewedCode);
  }, [previewedCode]);

  // Dynamic Browser-side Compilation for Live Preview
  const { component: compiledComponent, error: compileError } = useMemo(() => {
    if (!previewValidation.valid) {
      return { component: null, error: previewValidation.errors[0]?.message || 'Validation failed' };
    }
    return compileMotioComponent(previewValidation.cleanCode);
  }, [previewValidation]);

  // Explicit Trigger to update preview
  const handleTriggerPreview = useCallback(() => {
    setPreviewedCode(code);
  }, [code]);

  // Auto-Fix Code 100%
  const handleAutoFix = useCallback(() => {
    const { fixedCode } = autoFixMotioCode(code);
    setCode(fixedCode);
    setPreviewedCode(fixedCode);
    setHasUnsavedChanges(true);
  }, [code]);

  // Quick Aspect Ratio update
  const handleQuickAspectRatio = (aspect: VideoSettings['aspectRatio']) => {
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

    setSettings({
      ...settings,
      aspectRatio: aspect,
      width,
      height,
    });
  };

  // Keyboard shortcut: Ctrl+Enter to update preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleTriggerPreview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTriggerPreview]);

  // Load starter template
  const handleLoadStarter = () => {
    if (
      code !== STARTER_COMPOSITION &&
      !window.confirm('Muat semula demo asas? Perubahan kod semasa anda akan digantikan.')
    ) {
      return;
    }
    setCode(STARTER_COMPOSITION);
    setPreviewedCode(STARTER_COMPOSITION);
    setProjectName('Motio Kinetic Showcase');
    setSettings({
      width: 1920,
      height: 1080,
      fps: 30,
      durationInSeconds: 6,
      durationInFrames: 180,
      aspectRatio: '16:9',
      resolutionPreset: '1080p',
      backgroundColor: '#F5F8FF',
    });
  };

  // Start real server-side render
  const handleStartRender = async () => {
    if (!validation.valid) return;

    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: validation.cleanCode,
          settings: {
            width: settings.width,
            height: settings.height,
            fps: settings.fps,
            durationInFrames: settings.durationInFrames,
            backgroundColor: settings.backgroundColor,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize render job.');
      }

      const data = await response.json();

      const initialJob: RenderJobStatus = {
        jobId: data.jobId,
        status: data.status,
        progress: data.progress || 0,
        stage: data.stage || 'Queued',
        totalFrames: settings.durationInFrames,
        fps: settings.fps,
      };

      setCurrentJob(initialJob);
      setIsRenderModalOpen(true);

      // Connect to SSE stream for live progress updates
      const eventSource = new EventSource(`/api/render/${data.jobId}/progress`);

      eventSource.onmessage = (event) => {
        try {
          const updatedJob: RenderJobStatus = JSON.parse(event.data);
          setCurrentJob(updatedJob);

          if (
            updatedJob.status === 'completed' ||
            updatedJob.status === 'failed' ||
            updatedJob.status === 'cancelled'
          ) {
            eventSource.close();
          }
        } catch (parseErr) {
          console.error('Error parsing SSE progress data:', parseErr);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
      };
    } catch (err: any) {
      alert(`Render error: ${err.message}`);
    }
  };

  // Cancel render
  const handleCancelRender = async () => {
    if (!currentJob) return;
    try {
      await fetch(`/api/render/${currentJob.jobId}/cancel`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to cancel render:', err);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-ambient-mesh font-sans selection:bg-studio-pastel-blue/60 selection:text-studio-text">
      {/* Top Header Navigation */}
      <TopNav
        projectName={projectName}
        setProjectName={setProjectName}
        hasUnsavedChanges={hasUnsavedChanges}
        onOpenContract={() => setIsContractOpen(true)}
        onLoadStarter={handleLoadStarter}
        onStartRender={handleStartRender}
        isRendering={
          currentJob?.status === 'queued' ||
          currentJob?.status === 'preparing' ||
          currentJob?.status === 'compiling' ||
          currentJob?.status === 'rendering' ||
          currentJob?.status === 'encoding' ||
          currentJob?.status === 'verifying'
        }
        isValid={validation.valid}
        mode={workspaceMode}
        setMode={setWorkspaceMode}
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
        isSettingsOpen={isSettingsOpen}
        onTriggerPreview={handleTriggerPreview}
        isPendingPreview={isPendingPreview}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left: Code Editor (Shown in 'split' and 'editor' modes) */}
        {workspaceMode !== 'theater' && (
          <section
            className={`h-full flex flex-col transition-all duration-300 ${
              workspaceMode === 'editor' ? 'w-full' : 'w-[45%]'
            }`}
          >
            <CodeEditor
              code={code}
              onChange={(val) => {
                setCode(val);
                setHasUnsavedChanges(true);
              }}
              validation={validation}
              onValidate={() => {}}
              onTriggerPreview={handleTriggerPreview}
              isPendingPreview={isPendingPreview}
            />
          </section>
        )}

        {/* Center: Live Preview Canvas (Shown in 'split' and 'theater' modes) */}
        {workspaceMode !== 'editor' && (
          <section className="flex-1 h-full flex flex-col min-w-0 transition-all duration-300">
            <PreviewCanvas
              component={compiledComponent}
              compileError={compileError}
              settings={settings}
              onUpdateAspectRatio={handleQuickAspectRatio}
              onTriggerPreview={handleTriggerPreview}
              isPendingPreview={isPendingPreview}
              onAutoFix={handleAutoFix}
            />
          </section>
        )}

        {/* Right: Slide-out / Floating Glass Settings Inspector */}
        {isSettingsOpen && (
          <div className="absolute right-0 top-0 bottom-0 z-30 animate-fade-in flex">
            <div
              className="fixed inset-0 bg-slate-900/10 backdrop-blur-xs z-10"
              onClick={() => setIsSettingsOpen(false)}
            />
            <div className="relative z-20 h-full">
              <SettingsPanel
                settings={settings}
                onChange={(newSettings) => {
                  setSettings(newSettings);
                  setHasUnsavedChanges(true);
                }}
                onClose={() => setIsSettingsOpen(false)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Render Studio Modal */}
      <RenderModal
        isOpen={isRenderModalOpen}
        onClose={() => setIsRenderModalOpen(false)}
        job={currentJob}
        onCancel={handleCancelRender}
        onRenderAgain={handleStartRender}
      />

      {/* Motio Composition Contract Documentation Modal */}
      <ContractModal
        isOpen={isContractOpen}
        onClose={() => setIsContractOpen(false)}
      />
    </div>
  );
}

export default App;
