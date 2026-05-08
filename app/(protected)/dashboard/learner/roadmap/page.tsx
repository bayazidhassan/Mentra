'use client';

import axios from 'axios';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  ExternalLink,
  History,
  Loader2,
  Map,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  roadmapService,
  TCreateRoadmapPayload,
  TRoadmap,
  TStepStatus,
} from '../../../../../services/roadmap';

type TMode = 'ai' | 'manual';
type TView =
  | 'empty'
  | 'create'
  | 'roadmap'
  | 'completed-list'
  | 'completed-detail';

type TResourceInput = { title: string; url: string };
type TManualStep = {
  title: string;
  description: string;
  resources: TResourceInput[];
  order: number;
};

const RoadmapPage = () => {
  const [view, setView] = useState<TView>('empty');
  const [mode, setMode] = useState<TMode>('ai');
  const [roadmap, setRoadmap] = useState<TRoadmap | null>(null);
  const [completedRoadmaps, setCompletedRoadmaps] = useState<TRoadmap[]>([]);
  const [selectedCompleted, setSelectedCompleted] = useState<TRoadmap | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [completedLoading, setCompletedLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [goal, setGoal] = useState('');
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  // manual form state
  const [manualTitle, setManualTitle] = useState('');
  const [manualGoal, setManualGoal] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualSteps, setManualSteps] = useState<TManualStep[]>([
    {
      title: '',
      description: '',
      resources: [{ title: '', url: '' }],
      order: 1,
    },
  ]);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const data = await roadmapService.getMyRoadmap();
        if (data) {
          setRoadmap(data);
          setView('roadmap');
        } else {
          setView('empty');
        }
      } catch {
        setView('empty');
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, []);

  // Fetch completed roadmaps when navigating to that view
  const handleViewCompleted = async () => {
    setView('completed-list');
    setCompletedLoading(true);
    try {
      const data = await roadmapService.getCompletedRoadmaps();
      setCompletedRoadmaps(data);
    } catch {
      setCompletedRoadmaps([]);
    } finally {
      setCompletedLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!goal.trim()) {
      toast.error('Please enter your learning goal.');
      return;
    }
    setGenerating(true);
    try {
      const data = await roadmapService.generateRoadmap(goal);
      setRoadmap(data);
      setView('roadmap');
      toast.success('Roadmap generated successfully!');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.message || 'Failed to generate roadmap.',
        );
      } else {
        toast.error('Failed to generate roadmap.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleCreate = async () => {
    if (!manualTitle || !manualGoal || manualSteps.some((s) => !s.title)) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setGenerating(true);
    try {
      const payload: TCreateRoadmapPayload = {
        title: manualTitle,
        description: manualDescription || undefined,
        goal: manualGoal,
        steps: manualSteps.map((s, i) => ({
          title: s.title,
          description: s.description || undefined,
          resources: s.resources.filter((r) => r.title.trim() && r.url.trim()),
          order: i + 1,
        })),
      };
      const data = await roadmapService.createRoadmap(payload);
      setRoadmap(data);
      setView('roadmap');
      toast.success('Roadmap created successfully!');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to create roadmap.');
      } else {
        toast.error('Failed to create roadmap.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleStepStatus = async (stepId: string, status: TStepStatus) => {
    if (!roadmap) return;
    try {
      const data = await roadmapService.updateStepStatus(
        roadmap._id,
        stepId,
        status,
      );
      setRoadmap(data);
      // If roadmap just completed, show a prompt and transition to empty
      if (data.status === 'completed') {
        toast.success('🎉 Roadmap completed! You can now start a new one.');
        setRoadmap(null);
        setView('empty');
      } else {
        toast.success('Step updated.');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to update step.');
      } else {
        toast.error('Failed to update step.');
      }
    }
  };

  const handleDelete = async () => {
    if (!roadmap) return;
    if (!confirm('Are you sure you want to delete your roadmap?')) return;
    try {
      await roadmapService.deleteRoadmap(roadmap._id);
      setRoadmap(null);
      setView('empty');
      toast.success('Roadmap deleted.');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to delete roadmap.');
      } else {
        toast.error('Failed to delete roadmap.');
      }
    }
  };

  // ── Manual step helpers ────────────────────────────────────────────────────

  const addStep = () => {
    setManualSteps((prev) => [
      ...prev,
      {
        title: '',
        description: '',
        resources: [{ title: '', url: '' }],
        order: prev.length + 1,
      },
    ]);
  };

  const removeStep = (index: number) => {
    setManualSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStep = (
    stepIndex: number,
    field: keyof Omit<TManualStep, 'resources' | 'order'>,
    value: string,
  ) => {
    setManualSteps((prev) => {
      const updated = [...prev];
      updated[stepIndex] = { ...updated[stepIndex], [field]: value };
      return updated;
    });
  };

  const addResource = (stepIndex: number) => {
    setManualSteps((prev) => {
      const updated = [...prev];
      updated[stepIndex] = {
        ...updated[stepIndex],
        resources: [...updated[stepIndex].resources, { title: '', url: '' }],
      };
      return updated;
    });
  };

  const updateResource = (
    stepIndex: number,
    resourceIndex: number,
    field: keyof TResourceInput,
    value: string,
  ) => {
    setManualSteps((prev) => {
      const updated = [...prev];
      const resources = [...updated[stepIndex].resources];
      resources[resourceIndex] = {
        ...resources[resourceIndex],
        [field]: value,
      };
      updated[stepIndex] = { ...updated[stepIndex], resources };
      return updated;
    });
  };

  const removeResource = (stepIndex: number, resourceIndex: number) => {
    setManualSteps((prev) => {
      const updated = [...prev];
      updated[stepIndex] = {
        ...updated[stepIndex],
        resources: updated[stepIndex].resources.filter(
          (_, i) => i !== resourceIndex,
        ),
      };
      return updated;
    });
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getProgressPercent = (r: TRoadmap) =>
    r.totalSteps > 0 ? Math.round((r.completedSteps / r.totalSteps) * 100) : 0;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const statusConfig: Record<
    TStepStatus,
    {
      label: string;
      color: string;
      bg: string;
      border: string;
      icon: React.ReactNode;
    }
  > = {
    not_started: {
      label: 'Not started',
      color: 'text-gray-400',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: <Circle size={18} className="text-gray-300" />,
    },
    in_progress: {
      label: 'In progress',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      icon: (
        <div className="w-4 h-4 rounded-full border-2 border-indigo-500 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </div>
      ),
    },
    completed: {
      label: 'Completed',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: (
        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
          <Check size={10} className="text-white" />
        </div>
      ),
    },
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (view === 'empty') {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Map size={28} className="text-indigo-500" />
        </div>
        <h1
          className="text-2xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          No active roadmap
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Create a personalized learning roadmap to track your progress.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => {
              setMode('ai');
              setView('create');
            }}
            className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-white rounded-xl transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            <Sparkles size={16} />
            Generate with AI
          </button>
          <button
            onClick={() => {
              setMode('manual');
              setView('create');
            }}
            className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-all"
          >
            <Plus size={16} />
            Create Manually
          </button>
          <button
            onClick={handleViewCompleted}
            className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-green-300 transition-all"
          >
            <History size={16} />
            Completed Roadmaps
          </button>
        </div>
      </div>
    );
  }

  // ── Create state ───────────────────────────────────────────────────────────
  if (view === 'create') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            {mode === 'ai' ? 'Generate with AI' : 'Create Manually'}
          </h1>
          <button
            onClick={() => setView('empty')}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setMode('ai')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              mode === 'ai'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <Sparkles size={15} /> Generate with AI
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              mode === 'manual'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <Plus size={15} /> Create Manually
          </button>
        </div>

        {mode === 'ai' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What do you want to learn?
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. I want to become a full-stack developer using React and Node.js"
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] resize-none transition-all"
            />
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="mt-4 w-full h-11 flex items-center justify-center gap-2 text-sm font-medium text-white rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              }}
            >
              {generating ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate Roadmap
                </>
              )}
            </button>
          </div>
        )}

        {mode === 'manual' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Title
              </label>
              <input
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="e.g. Full-stack development roadmap"
                className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Goal
              </label>
              <input
                value={manualGoal}
                onChange={(e) => setManualGoal(e.target.value)}
                placeholder="e.g. Become a full-stack developer"
                className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Description <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                placeholder="Brief description of your roadmap"
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-all resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-700">
                  Steps
                </label>
                <button
                  onClick={addStep}
                  className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Plus size={12} /> Add step
                </button>
              </div>
              <div className="space-y-3">
                {manualSteps.map((step, stepIndex) => (
                  <div
                    key={stepIndex}
                    className="border border-gray-200 rounded-xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-indigo-600">
                        Step {stepIndex + 1}
                      </span>
                      {manualSteps.length > 1 && (
                        <button
                          onClick={() => removeStep(stepIndex)}
                          className="text-gray-300 hover:text-red-400 cursor-pointer transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <input
                      value={step.title}
                      onChange={(e) =>
                        updateStep(stepIndex, 'title', e.target.value)
                      }
                      placeholder="Step title"
                      className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-indigo-500 transition-all"
                    />
                    <input
                      value={step.description}
                      onChange={(e) =>
                        updateStep(stepIndex, 'description', e.target.value)
                      }
                      placeholder="Description (optional)"
                      className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-indigo-500 transition-all"
                    />
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Resources{' '}
                          <span className="text-gray-400">(optional)</span>
                        </span>
                        <button
                          onClick={() => addResource(stepIndex)}
                          className="text-xs text-indigo-500 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <Plus size={11} /> Add resource
                        </button>
                      </div>
                      {step.resources.map((resource, resourceIndex) => (
                        <div
                          key={resourceIndex}
                          className="flex flex-col md:flex-row gap-2 md:items-center"
                        >
                          <input
                            value={resource.title}
                            onChange={(e) =>
                              updateResource(
                                stepIndex,
                                resourceIndex,
                                'title',
                                e.target.value,
                              )
                            }
                            placeholder="Title (e.g. MDN Docs)"
                            className="md:flex-1 h-8 border border-gray-200 rounded-lg px-3 text-xs outline-none focus:border-indigo-500 transition-all"
                          />
                          <input
                            value={resource.url}
                            onChange={(e) =>
                              updateResource(
                                stepIndex,
                                resourceIndex,
                                'url',
                                e.target.value,
                              )
                            }
                            placeholder="URL (https://...)"
                            className="md:flex-1 h-8 border border-gray-200 rounded-lg px-3 text-xs outline-none focus:border-indigo-500 transition-all"
                          />
                          {step.resources.length > 1 && (
                            <button
                              onClick={() =>
                                removeResource(stepIndex, resourceIndex)
                              }
                              className="text-gray-300 hover:text-red-400 cursor-pointer transition-colors shrink-0"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={generating}
              className="w-full h-11 flex items-center justify-center gap-2 text-sm font-medium text-white rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              }}
            >
              {generating ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating...
                </>
              ) : (
                'Create Roadmap'
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Completed roadmaps list ────────────────────────────────────────────────
  if (view === 'completed-list') {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView(roadmap ? 'roadmap' : 'empty')}
              className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
            >
              <ArrowLeft size={20} />
            </button>

            <h1
              className="text-lg md:text-2xl font-bold text-gray-900"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Completed Roadmaps
            </h1>
          </div>

          {!completedLoading && (
            <p className="text-xs text-gray-400 mt-0.5 ml-8">
              {completedRoadmaps.length} roadmap
              {completedRoadmaps.length !== 1 ? 's' : ''} completed
            </p>
          )}
        </div>

        {/* Loading */}
        {completedLoading && (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!completedLoading && completedRoadmaps.length === 0 && (
          <div className="text-center py-20">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <History size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              No completed roadmaps yet
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Complete all steps in a roadmap to see it here.
            </p>
          </div>
        )}

        {/* List */}
        {!completedLoading && completedRoadmaps.length > 0 && (
          <div className="space-y-3">
            {completedRoadmaps.map((r) => (
              <button
                key={r._id}
                onClick={() => {
                  setSelectedCompleted(r);
                  setExpandedStep(null);
                  setView('completed-detail');
                }}
                className="w-full text-left bg-white border border-gray-200 rounded-2xl p-5 hover:border-green-200 hover:cursor-pointer hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3
                        className="text-sm font-semibold text-gray-900 truncate"
                        style={{
                          fontFamily: 'Bricolage Grotesque, sans-serif',
                        }}
                      >
                        {r.title}
                      </h3>
                      {r.isAIGenerated && (
                        <span className="flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full shrink-0">
                          <Sparkles size={10} /> AI Generated
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{r.goal}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="flex items-center gap-1 text-xs font-medium bg-green-50 text-green-600 px-2 py-1 rounded-full">
                      <Check size={10} /> Completed
                    </span>
                    {r.completedAt && (
                      <p className="text-xs text-gray-400 mt-1.5">
                        {formatDate(r.completedAt)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mini progress bar — always 100% for completed */}
                <div className="mt-4">
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: '100%',
                        background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {r.totalSteps} of {r.totalSteps} steps completed
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Completed roadmap detail (read-only) ───────────────────────────────────
  if (view === 'completed-detail' && selectedCompleted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <button
              onClick={() => setView('completed-list')}
              className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors mt-1"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h1
                  className="text-lg md:text-2xl font-bold text-gray-900"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  {selectedCompleted.title}
                </h1>
                {selectedCompleted.isAIGenerated && (
                  <span className="flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
                    <Sparkles size={11} /> AI Generated
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs font-medium bg-green-50 text-green-600 px-2 py-1 rounded-full">
                  <Check size={11} /> Completed
                </span>
              </div>
              <p className="text-sm text-gray-600">{selectedCompleted.goal}</p>
              {selectedCompleted.description && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedCompleted.description}
                </p>
              )}
              {selectedCompleted.completedAt && (
                <p className="text-xs text-gray-400 mt-1">
                  Completed on {formatDate(selectedCompleted.completedAt)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar — always 100% */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">
              Overall progress
            </p>
            <span
              className="text-lg font-bold text-green-600"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              100%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full w-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #22c55e, #16a34a)' }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-400">
              {selectedCompleted.totalSteps} of {selectedCompleted.totalSteps}{' '}
              steps completed
            </p>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              🎉 Completed!
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual timeline */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2
              className="text-sm font-semibold text-gray-900 mb-4"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Timeline
            </h2>
            <div className="relative">
              <div className="absolute left-3.5 top-4 bottom-4 w-px bg-green-200" />
              <div className="space-y-4">
                {selectedCompleted.steps.map((step) => (
                  <div
                    key={step._id}
                    className="flex items-start gap-3 relative"
                  >
                    <div className="w-7 h-7 rounded-full bg-green-500 border-2 border-green-500 flex items-center justify-center shrink-0 z-10">
                      <Check size={12} className="text-white" />
                    </div>
                    <div className="min-w-0 pb-1">
                      <p className="text-xs font-medium text-gray-400 line-through truncate">
                        {step.title}
                      </p>
                      <p className="text-xs mt-0.5 text-green-600">Completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Steps list — read-only, no status selectors */}
          <div className="lg:col-span-2 space-y-3">
            <h2
              className="text-sm font-semibold text-gray-900"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Steps
            </h2>
            {selectedCompleted.steps.map((step) => (
              <div
                key={step._id}
                className="bg-white border border-green-200 rounded-2xl overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <Check size={10} className="text-white" />
                  </div>
                  <p className="text-sm font-medium flex-1 text-gray-400 line-through">
                    {step.title}
                  </p>
                  {step.completedAt && (
                    <span className="text-xs text-gray-400 shrink-0">
                      {formatDate(step.completedAt)}
                    </span>
                  )}
                  {(step.description ||
                    (step.resources && step.resources.length > 0)) && (
                    <button
                      onClick={() =>
                        setExpandedStep(
                          expandedStep === step._id ? null : step._id,
                        )
                      }
                      className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                    >
                      {expandedStep === step._id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  )}
                </div>
                {expandedStep === step._id && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                    {step.description && (
                      <p className="text-sm text-justify text-gray-500 leading-relaxed">
                        {step.description}
                      </p>
                    )}
                    {step.resources && step.resources.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Resources
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {step.resources.map((resource, i) => (
                            <a
                              key={i}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full hover:bg-indigo-100 transition-colors"
                            >
                              {resource.title}
                              <ExternalLink size={10} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Active roadmap view ────────────────────────────────────────────────────
  const progressPercent = getProgressPercent(roadmap!);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-5 items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h1
              className="text-lg md:text-2xl font-bold text-gray-900"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              {roadmap?.title}
            </h1>
            {roadmap?.isAIGenerated && (
              <span className="flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
                <Sparkles size={11} /> AI Generated
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{roadmap?.goal}</p>
          {roadmap?.description && (
            <p className="text-xs text-gray-400 mt-0.5">
              {roadmap.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleViewCompleted}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-xl hover:border-green-300 hover:text-green-600 transition-all cursor-pointer"
          >
            <History size={14} /> Completed Roadmaps
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-all cursor-pointer"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">Overall progress</p>
          <span
            className="text-lg font-bold text-indigo-600"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            {progressPercent}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400">
            {roadmap?.completedSteps} of {roadmap?.totalSteps} steps completed
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual timeline */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2
            className="text-sm font-semibold text-gray-900 mb-4"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Timeline
          </h2>
          <div className="relative">
            <div className="absolute left-3.5 top-4 bottom-4 w-px bg-gray-200" />
            <div className="space-y-4">
              {roadmap?.steps.map((step, index) => (
                <div key={step._id} className="flex items-start gap-3 relative">
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${
                      step.status === 'completed'
                        ? 'bg-green-500 border-green-500'
                        : step.status === 'in_progress'
                          ? 'bg-white border-indigo-500'
                          : 'bg-white border-gray-300'
                    }`}
                  >
                    {step.status === 'completed' ? (
                      <Check size={12} className="text-white" />
                    ) : step.status === 'in_progress' ? (
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    ) : (
                      <span className="text-xs text-gray-400">{index + 1}</span>
                    )}
                  </div>
                  <div className="min-w-0 pb-1">
                    <p
                      className={`text-xs font-medium truncate ${
                        step.status === 'completed'
                          ? 'text-gray-400 line-through'
                          : 'text-gray-700'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${statusConfig[step.status].color}`}
                    >
                      {statusConfig[step.status].label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Steps list */}
        <div className="lg:col-span-2 space-y-3">
          <h2
            className="text-sm font-semibold text-gray-900"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Steps
          </h2>
          {roadmap?.steps.map((step) => (
            <div
              key={step._id}
              className={`bg-white border rounded-2xl overflow-hidden transition-all ${statusConfig[step.status].border}`}
            >
              <div className="flex items-center gap-3 p-4">
                {statusConfig[step.status].icon}
                <p
                  className={`text-sm font-medium flex-1 ${
                    step.status === 'completed'
                      ? 'text-gray-400 line-through'
                      : 'text-gray-800'
                  }`}
                >
                  {step.title}
                </p>
                <select
                  value={step.status}
                  onChange={(e) =>
                    handleStepStatus(step._id, e.target.value as TStepStatus)
                  }
                  className={`text-xs font-medium px-2 py-1 rounded-lg border outline-none cursor-pointer ${statusConfig[step.status].bg} ${statusConfig[step.status].color} ${statusConfig[step.status].border}`}
                >
                  <option value="not_started">Not started</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
                {(step.description ||
                  (step.resources && step.resources.length > 0)) && (
                  <button
                    onClick={() =>
                      setExpandedStep(
                        expandedStep === step._id ? null : step._id,
                      )
                    }
                    className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                  >
                    {expandedStep === step._id ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                )}
              </div>
              {expandedStep === step._id && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                  {step.description && (
                    <p className="text-sm text-justify text-gray-500 leading-relaxed">
                      {step.description}
                    </p>
                  )}
                  {step.resources && step.resources.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Resources
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {step.resources.map((resource, i) => (
                          <a
                            key={i}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full hover:bg-indigo-100 transition-colors"
                          >
                            {resource.title}
                            <ExternalLink size={10} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
