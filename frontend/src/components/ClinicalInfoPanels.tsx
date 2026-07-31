import { useState } from 'react';
import {
  FileText,
  AlertCircle,
  Microscope,
  FlaskConical,
  ShieldAlert,
  Stethoscope,
  Heart,
  Calendar,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import type { DiseaseInfo } from '../lib/types';

interface ClinicalInfoPanelsProps {
  diseaseInfo: DiseaseInfo;
}

const PANEL_CONFIG = [
  { key: 'description', label: 'Disease Description', icon: FileText },
  { key: 'symptoms', label: 'Common Symptoms', icon: AlertCircle },
  { key: 'causes', label: 'Possible Causes', icon: Microscope },
  { key: 'risk_factors', label: 'Risk Factors', icon: ShieldAlert },
  { key: 'investigations', label: 'Recommended Investigations', icon: FlaskConical },
  { key: 'treatments', label: 'Treatment Options', icon: Stethoscope },
  { key: 'lifestyle', label: 'Lifestyle Recommendations', icon: Heart },
  { key: 'follow_up', label: 'Follow-up Guidelines', icon: Calendar },
  { key: 'summary', label: 'AI Clinical Summary', icon: Sparkles },
] as const;

export default function ClinicalInfoPanels({ diseaseInfo }: ClinicalInfoPanelsProps) {
  const [expanded, setExpanded] = useState<string | null>('description');

  const toggle = (key: string) => {
    setExpanded(expanded === key ? null : key);
  };

  const renderContent = (key: string) => {
    const info = diseaseInfo as unknown as Record<string, unknown>;
    const content = info[key];

    if (key === 'description' || key === 'summary') {
      return <p className="text-sm text-slate-600 leading-relaxed">{content as string}</p>;
    }

    if (Array.isArray(content)) {
      return (
        <ul className="space-y-2">
          {(content as string[]).map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      );
    }

    return null;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-5 h-5 text-pink-500" />
        <h2 className="font-display text-lg font-bold text-slate-800">
          Clinical Information
        </h2>
        <span className="text-xs text-slate-400 ml-2">
          Generated for: {diseaseInfo.name}
        </span>
      </div>

      {PANEL_CONFIG.map((panel) => {
        const Icon = panel.icon;
        const isExpanded = expanded === panel.key;

        return (
          <div
            key={panel.key}
            className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
              isExpanded ? 'shadow-lg' : ''
            }`}
          >
            <button
              onClick={() => toggle(panel.key)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-white/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-pink-50 flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 text-pink-600" />
                </div>
                <span className="font-medium text-slate-700 text-sm">{panel.label}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${
                isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-4 pt-1">{renderContent(panel.key)}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
