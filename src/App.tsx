import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TopNav } from './components/TopNav';
import { CodeEditor } from './components/CodeEditor';
import { PreviewCanvas } from './components/PreviewCanvas';
import { SettingsPanel } from './components/SettingsPanel';
import { RenderModal } from './components/RenderModal';
import { ContractModal } from './components/ContractModal';
import { STARTER_COMPOSITION } from './templates/starter';
import { validateMotioCode, compileMotioComponent } from './services/compiler';
import { VideoSettings, RenderJobStatus } from './types/contract';

const LOCAL_STORAGE_KEY = 'motionframe_studio_project_v1';

export function App() {
  const [projectName, setProjectName] = useState('Motio Kinetic Showcase');
  const [code, setCode] = useState(STARTER_COMPOSITION);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);

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

  // Motio Code Validation
  const validation = useMemo(() => {
    return validateMotioCode(code);
  }, [code]);

  // Dynamic Browser-side Compilation for Live Preview
  const { component: compiledComponent, error: compileError } = useMemo(() => {
    if (!validation.valid) {
      return { component: null, error: validation.errors[0]?.message || 'Validation failed' };
    }
    return compileMotioComponent(validation.cleanCode);
  }, [validation]);

  // Load starter template
  const handleLoadStarter = () => {
    if (
      code !== STARTER_COMPOSITION &&
      !window.confirm('Load starter demo? Your current edits will be replaced.')
    ) {
      return;
    }
    setCode(STARTER_COMPOSITION);
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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-studio-bg font-sans">
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
      />

      {/* Main Workspace: 3-column split */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Code Editor (40% width) */}
        <section className="w-[42%] h-full flex flex-col">
          <CodeEditor
            code={code}
            onChange={(val) => {
              setCode(val);
              setHasUnsavedChanges(true);
            }}
            validation={validation}
            onValidate={() => {}}
          />
        </section>

        {/* Center: Live Preview Canvas (flexible) */}
        <section className="flex-1 h-full flex flex-col">
          <PreviewCanvas
            component={compiledComponent}
            compileError={compileError}
            settings={settings}
          />
        </section>

        {/* Right: Settings Inspector (Fixed 320px) */}
        <aside className="h-full">
          <SettingsPanel
            settings={settings}
            onChange={(newSettings) => {
              setSettings(newSettings);
              setHasUnsavedChanges(true);
            }}
          />
        </aside>
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
