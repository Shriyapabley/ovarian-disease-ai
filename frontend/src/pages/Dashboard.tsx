import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';import {
  Image as ImageIcon,
  Brain,
  TrendingUp,
  Cpu,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Stethoscope,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getDashboardStats,
  getDiseaseDistribution,
  getPredictionTrends,
  getRecentActivity,
} from '../lib/api';
import { modelInfo } from '../lib/diseaseData';
import type { DashboardStats, Prediction } from '../lib/types';

const PIE_COLORS = ['#ec4899', '#a855f7', '#f59e0b', '#f43f5e'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [diseaseDist, setDiseaseDist] = useState<{ name: string; count: number }[]>([]);
  const [trends, setTrends] = useState<{ date: string; predictions: number }[]>([]);
  const [recent, setRecent] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      const [s, d, t, r] = await Promise.all([
        getDashboardStats(),
        getDiseaseDistribution(),
        getPredictionTrends(),
        getRecentActivity(),
      ]);
      setStats(s);
      setDiseaseDist(d);
      setTrends(t);
      setRecent(r);
      setLoading(false);
    }
    loadAll();
    const interval = setInterval(loadAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      label: 'Dataset Images',
      value: stats?.total_images ?? 0,
      icon: ImageIcon,
      gradient: 'from-pink-500 to-pink-600',
      bg: 'bg-pink-50',
      suffix: 'scans',
    },
    {
      label: 'Total Predictions',
      value: stats?.total_predictions ?? 0,
      icon: Brain,
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      suffix: 'analyses',
    },
    {
      label: 'Overall Accuracy',
      value: stats?.overall_accuracy ?? 0,
      icon: TrendingUp,
      gradient: 'from-fuchsia-500 to-fuchsia-600',
      bg: 'bg-fuchsia-50',
      suffix: '%',
      isFloat: true,
    },
    {
      label: 'Best Model',
      value: stats?.best_model ?? 'EfficientNetV2-B0 + XGBoost',
      icon: Cpu,
      gradient: 'from-violet-500 to-violet-600',
      bg: 'bg-violet-50',
      isText: true,
    },
  ];

  const modelPerformanceData = modelInfo.map((m) => ({
    name: m.shortName,
    Accuracy: m.accuracy,
    Precision: m.precision,
    Recall: m.recall,
    'F1 Score': m.f1Score,
  }));

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <div className="glass-card rounded-3xl p-8 animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-200/40 to-purple-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-fuchsia-200/30 to-transparent rounded-full blur-3xl translate-y-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">
              AI-Powered Diagnostic Platform
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-800 mb-3 max-w-3xl">
            Intelligent Clinical Decision Support for{' '}
            <span className="gradient-text">Ovarian Disease Diagnosis</span>
          </h1>
          <p className="text-slate-600 max-w-2xl leading-relaxed">
            An advanced deep learning system that analyzes ovarian ultrasound images to assist
            radiologists and gynecologists in diagnosing ovarian diseases. The platform combines
            state-of-the-art AI models with explainable AI visualization and interactive 3D
            anatomical modeling for comprehensive clinical decision support.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              to="/prediction"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Stethoscope className="w-5 h-5" />
              Start New Analysis
            </Link>
            <Link
              to="/history"
              className="flex items-center gap-2 px-6 py-3 glass text-slate-700 rounded-xl font-medium hover:bg-white/60 transition-all duration-300"
            >
              View History
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`glass-card rounded-2xl p-5 animate-fade-in stagger-${i + 1}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 bg-gradient-to-br ${card.gradient} bg-clip-text`} style={{ color: card.gradient.includes('pink') ? '#db2777' : card.gradient.includes('purple') ? '#9333ea' : card.gradient.includes('fuchsia') ? '#c026d3' : '#7c3aed' }} />
                </div>
                <div className={`px-2.5 py-1 rounded-lg ${card.bg} text-xs font-semibold`} style={{ color: card.gradient.includes('pink') ? '#db2777' : card.gradient.includes('purple') ? '#9333ea' : card.gradient.includes('fuchsia') ? '#c026d3' : '#7c3aed' }}>
                  {card.label.includes('Accuracy') ? 'Live' : 'Active'}
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-1">{card.label}</p>
              {loading ? (
                <div className="h-8 w-24 bg-slate-200/50 rounded-lg shimmer" />
              ) : card.isText ? (
                <p className="text-lg font-bold text-slate-800 leading-tight">{card.value}</p>
              ) : (
                <p className="text-2xl font-bold text-slate-800">
                  {card.isFloat ? (card.value as number).toFixed(1) : card.value.toLocaleString()}
                  <span className="text-sm font-medium text-slate-400 ml-1">{card.suffix}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Disease distribution */}
        <div className="glass-card rounded-2xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-slate-800">Disease Distribution</h3>
              <p className="text-xs text-slate-500">Across all predictions</p>
            </div>
            <Activity className="w-5 h-5 text-pink-500" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={diseaseDist}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {diseaseDist.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Prediction trends */}
        <div className="glass-card rounded-2xl p-6 animate-fade-in lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-slate-800">Prediction Trends</h3>
              <p className="text-xs text-slate-500">Monthly prediction volume</p>
            </div>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trends} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,85,247,0.08)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                }}
              />
              <Line
                type="monotone"
                dataKey="predictions"
                stroke="#ec4899"
                strokeWidth={3}
                dot={{ fill: '#ec4899', r: 4 }}
                activeDot={{ r: 6 }}
                fill="url(#trendGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model performance */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-slate-800">Model Performance Comparison</h3>
            <p className="text-xs text-slate-500">Accuracy, Precision, Recall, and F1 Score across all models</p>
          </div>
          <Cpu className="w-5 h-5 text-purple-500" />
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={modelPerformanceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,85,247,0.08)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis domain={[80, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
              }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="Accuracy" fill="#ec4899" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Precision" fill="#a855f7" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Recall" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            <Bar dataKey="F1 Score" fill="#f43f5e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Models section */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-pink-500" />
          <h2 className="font-display text-xl font-bold text-slate-800">Implemented AI Models</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modelInfo.map((model, i) => (
            <div
              key={model.name}
              className="glass-card rounded-2xl p-5 animate-fade-in group cursor-default"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${model.color}15` }}
                  >
                    <Cpu className="w-5 h-5" style={{ color: model.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{model.name}</h3>
                    <p className="text-xs text-slate-500">{model.accuracy}% accuracy</p>
                  </div>
                </div>
                {model.accuracy >= 94 && (
                  <div className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-md">
                    Best
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{model.description}</p>
              <div className="space-y-2">
                {[
                  { label: 'Accuracy', value: model.accuracy },
                  { label: 'Precision', value: model.precision },
                  { label: 'Recall', value: model.recall },
                  { label: 'F1 Score', value: model.f1Score },
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-16">{metric.label}</span>
                    <div className="flex-1 h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${metric.value}%`,
                          backgroundColor: model.color,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-10 text-right">
                      {metric.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            <h3 className="font-display font-semibold text-slate-800">Recent Activity</h3>
          </div>
          <Link
            to="/history"
            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No recent predictions yet</p>
            <Link
              to="/prediction"
              className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium mt-2"
            >
              Create your first analysis <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {item.patient_name} — {item.predicted_disease}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleString()} · {item.model_used}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-pink-600">
                    {Number(item.confidence_score).toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-400">confidence</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
