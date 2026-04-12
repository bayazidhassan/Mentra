'use client';

import axios from 'axios';
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { TRoadmap } from '../../../services/dashboard';
import {
  roadmapService,
  TCreateRoadmapPayload,
} from '../../../services/roadmap';

type TMode = 'ai' | 'manual';
type TView = 'empty' | 'create' | 'roadmap';

const RoadmapPage = () => {
  const [view, setView] = useState<TView>('empty');
  const [mode, setMode] = useState<TMode>('ai');
  const [roadmap, setRoadmap] = useState<TRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [goal, setGoal] = useState('');
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  //manual form state
  const [manualTitle, setManualTitle] = useState('');
  const [manualGoal, setManualGoal] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualSteps, setManualSteps] = useState([
    { title: '', description: '', resources: '', order: 1 },
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
        description: manualDescription,
        goal: manualGoal,
        steps: manualSteps.map((s, i) => ({
          title: s.title,
          description: s.description,
          resources: s.resources
            ? s.resources.split(',').map((r) => r.trim())
            : [],
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

  const handleStepStatus = async (
    stepId: string,
    status: 'not_started' | 'in_progress' | 'completed',
  ) => {
    if (!roadmap) return;
    try {
      const updated = await roadmapService.updateStepStatus(
        roadmap._id,
        stepId,
        status,
      );
      setRoadmap(updated);
      toast.success('Step updated.');
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

  const addStep = () => {
    setManualSteps((prev) => [
      ...prev,
      { title: '', description: '', resources: '', order: prev.length + 1 },
    ]);
  };

  const removeStep = (index: number) => {
    setManualSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const progressPercent = roadmap
    ? Math.round((roadmap.completedSteps / roadmap.totalSteps) * 100) || 0
    : 0;

  const statusConfig = {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  //EMPTY STATE
  if (view === 'empty') {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BookOpen size={28} className="text-indigo-500" />
        </div>
        <h1
          className="text-2xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          No roadmap yet
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Create a personalized learning roadmap to track your progress.
        </p>
        <div className="flex items-center justify-center gap-3">
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
            Create manually
          </button>
        </div>
      </div>
    );
  }

  //CREATE STATE
  if (view === 'create') {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            {mode === 'ai' ? 'Generate with AI' : 'Create manually'}
          </h1>
          <button
            onClick={() => setView('empty')}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode toggle */}
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
            <Plus size={15} /> Create manually
          </button>
        </div>

        {/* AI mode */}
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
                  <Sparkles size={16} /> Generate roadmap
                </>
              )}
            </button>
          </div>
        )}

        {/* Manual mode */}
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

            {/* Steps */}
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
                {manualSteps.map((step, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-indigo-600">
                        Step {index + 1}
                      </span>
                      {manualSteps.length > 1 && (
                        <button
                          onClick={() => removeStep(index)}
                          className="text-gray-300 hover:text-red-400 cursor-pointer transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <input
                      value={step.title}
                      onChange={(e) => {
                        const updated = [...manualSteps];
                        updated[index].title = e.target.value;
                        setManualSteps(updated);
                      }}
                      placeholder="Step title"
                      className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-indigo-500 transition-all"
                    />
                    <input
                      value={step.description}
                      onChange={(e) => {
                        const updated = [...manualSteps];
                        updated[index].description = e.target.value;
                        setManualSteps(updated);
                      }}
                      placeholder="Description (optional)"
                      className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-indigo-500 transition-all"
                    />
                    <input
                      value={step.resources}
                      onChange={(e) => {
                        const updated = [...manualSteps];
                        updated[index].resources = e.target.value;
                        setManualSteps(updated);
                      }}
                      placeholder="Resources (comma separated)"
                      className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-indigo-500 transition-all"
                    />
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
                'Create roadmap'
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  //ROADMAP VIEW
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              {roadmap?.title}
            </h1>
            {roadmap?.isAIGenerated && (
              <span className="flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
                <Sparkles size={11} /> AI generated
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{roadmap?.goal}</p>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-all cursor-pointer"
        >
          <Trash2 size={14} /> Delete
        </button>
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
          {progressPercent === 100 && (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              🎉 Completed!
            </span>
          )}
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
            {/* Vertical line */}
            <div className="absolute left-3.5 top-4 bottom-4 w-px bg-gray-200" />
            <div className="space-y-4">
              {roadmap?.steps.map((step, index) => (
                <div
                  key={step._id.toString()}
                  className="flex items-start gap-3 relative"
                >
                  {/* Dot */}
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
              key={step._id.toString()}
              className={`bg-white border rounded-2xl overflow-hidden transition-all ${statusConfig[step.status].border}`}
            >
              {/* Step header */}
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

                {/* Status selector */}
                <select
                  value={step.status}
                  onChange={(e) =>
                    handleStepStatus(
                      step._id.toString(),
                      e.target.value as
                        | 'not_started'
                        | 'in_progress'
                        | 'completed',
                    )
                  }
                  className={`text-xs font-medium px-2 py-1 rounded-lg border outline-none cursor-pointer ${statusConfig[step.status].bg} ${statusConfig[step.status].color} ${statusConfig[step.status].border}`}
                >
                  <option value="not_started">Not started</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>

                {/* Expand toggle */}
                <button
                  onClick={() =>
                    setExpandedStep(
                      expandedStep === step._id.toString()
                        ? null
                        : step._id.toString(),
                    )
                  }
                  className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                >
                  {expandedStep === step._id.toString() ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              </div>

              {/* Expanded content */}
              {expandedStep === step._id.toString() && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                  {step.description && (
                    <p className="text-sm text-gray-500 leading-relaxed">
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
                          <span
                            key={i}
                            className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full"
                          >
                            {resource}
                          </span>
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
