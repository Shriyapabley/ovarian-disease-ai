import { useEffect, useState } from 'react';
import {
  Image as ImageIcon,
  Scan,
  Brain,
  Microscope,
  Gauge,
  Eye,
  FileText,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface AIWorkflowProps {
  onComplete: () => void;
}

const STAGES = [
  { name: 'Image Preprocessing', icon: ImageIcon, description: 'Normalizing and enhancing ultrasound image' },
  { name: 'Feature Extraction', icon: Scan, description: 'Extracting deep features using CNN backbone' },
  { name: 'Model Inference', icon: Brain, description: 'Running classification through neural network' },
  { name: 'Disease Classification', icon: Microscope, description: 'Categorizing ovarian condition' },
  { name: 'Confidence Estimation', icon: Gauge, description: 'Calculating prediction probability scores' },
  { name: 'Explainable AI Generation', icon: Eye, description: 'Generating Grad-CAM heatmap visualization' },
  { name: 'Clinical Report Preparation', icon: FileText, description: 'Compiling diagnostic findings and recommendations' },
];

export default function AIWorkflow({ onComplete }: AIWorkflowProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);

  useEffect(() => {
    if (currentStage >= STAGES.length) {
      const timer = setTimeout(() => onComplete(), 500);
      return () => clearTimeout(timer);
    }

    const stageDuration = 800 + Math.random() * 600;
    const timer = setTimeout(() => {
      setCompletedStages((prev) => [...prev, currentStage]);
      setCurrentStage((prev) => prev + 1);
    }, stageDuration);

    return () => clearTimeout(timer);
  }, [currentStage, onComplete]);

  const progress = (completedStages.length / STAGES.length) * 100;

  return (
    <div className="glass-card rounded-3xl p-8 max-w-2xl mx-auto animate-fade-in-scale">
      <div className="text-center mb-8">
        <div className="relative inline-flex mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
            <Brain className="w-10 h-10 text-white animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-pink-400 animate-pulse-ring" />
          <div className="absolute inset-0 rounded-full border-2 border-pink-400 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-800 mb-1">
          AI Analysis in Progress
        </h2>
        <p className="text-sm text-slate-500">
          Processing ultrasound image through deep learning pipeline
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-600">Overall Progress</span>
          <span className="text-xs font-bold text-pink-600">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-200/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-purple-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-2">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const isCompleted = completedStages.includes(index);
          const isCurrent = currentStage === index;
          const isPending = !isCompleted && !isCurrent;

          return (
            <div
              key={stage.name}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${
                isCurrent
                  ? 'bg-pink-50 border border-pink-200 scale-[1.02]'
                  : isCompleted
                  ? 'bg-emerald-50/50'
                  : 'opacity-40'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-pink-500 text-white'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium transition-colors ${
                    isCompleted
                      ? 'text-emerald-700'
                      : isCurrent
                      ? 'text-pink-700'
                      : 'text-slate-500'
                  }`}
                >
                  {stage.name}
                </p>
                <p className="text-xs text-slate-400 truncate">{stage.description}</p>
              </div>
              {isCompleted && (
                <span className="text-xs font-medium text-emerald-600 flex-shrink-0">Done</span>
              )}
              {isCurrent && (
                <span className="text-xs font-medium text-pink-600 flex-shrink-0 animate-pulse">
                  Processing...
                </span>
              )}
              {isPending && (
                <span className="text-xs text-slate-400 flex-shrink-0">Pending</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
