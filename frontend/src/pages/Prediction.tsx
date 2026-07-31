import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Upload,
  Image as ImageIcon,
  User,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Layers,
  RotateCcw,
  Save,
  Stethoscope,
  Activity,
  Cpu,
  Target,
  AlertCircle,
  Info,
  X,
  Sparkles,
} from 'lucide-react';
import AIWorkflow from '../components/AIWorkflow';
import AnatomyModel3D from '../components/AnatomyModel3D';
import CircularProgress from '../components/CircularProgress';
import ClinicalInfoPanels from '../components/ClinicalInfoPanels';
import ReportGenerator from '../components/ReportGenerator';
import { assessImageQuality, runPrediction, savePrediction, getPredictionById } from '../lib/api';
import { modelInfo, getDiseaseInfo } from '../lib/diseaseData';
import type { PredictionResult, QualityAssessment, ViewMode, PatientInfo } from '../lib/types';

type Phase = 'upload' | 'quality' | 'processing' | 'results';

export default function Prediction() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    patientId: '',
    patientName: '',
    patientAge: '',
    scanDate: '',
    notes: '',
  });
  const [qualityResult, setQualityResult] = useState<QualityAssessment | null>(null);
  const [qualityLoading, setQualityLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('original');
  const [selectedModel, setSelectedModel] = useState('EfficientNetV2-B0 + XGBoost');
  const [showOvaryPopup, setShowOvaryPopup] = useState<'Left' | 'Right' | null>(null);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      loadExistingPrediction(id);
    }
  }, [id]);

  async function loadExistingPrediction(predId: string) {
    setLoadingExisting(true);
    const record = await getPredictionById(predId);
    if (record) {
      setPatientInfo({
        patientId: record.patient_id,
        patientName: record.patient_name,
        patientAge: record.patient_age?.toString() || '',
        scanDate: record.scan_date || '',
        notes: record.notes,
      });
      setImageUrl(record.image_url);
      setPrediction({
        predicted_disease: record.predicted_disease,
        confidence_score: Number(record.confidence_score),
        prediction_probability: Number(record.prediction_probability),
        affected_ovary: record.affected_ovary,
        severity_level: record.severity_level,
        processing_time_ms: record.processing_time_ms,
        model_used: record.model_used,
        clinical_interpretation: record.clinical_interpretation,
        heatmap_url: record.heatmap_url,
        quality_assessment: record.quality_assessment,
        quality_score: Number(record.quality_score),
        disease_info: getDiseaseInfo(record.predicted_disease),
      });
      setSavedRecordId(record.id);
      setPhase('results');
    }
    setLoadingExisting(false);
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setQualityResult(null);
    setPhase('upload');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setQualityResult(null);
  };

  const handleQualityCheck = async () => {
    if (!imageFile) return;
    setQualityLoading(true);
    const result = await assessImageQuality(imageFile);
    setQualityResult(result);
    setQualityLoading(false);
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setPhase('processing');
    const result = await runPrediction(imageFile, patientInfo as unknown as Record<string, unknown>, selectedModel);
    setPrediction(result);
  };

  const handleWorkflowComplete = () => {
    setPhase('results');
  };

  const handleSave = async () => {
    if (!prediction) return;
    const record = await savePrediction({
      patient_id: patientInfo.patientId || 'ANON-' + Date.now(),
      patient_name: patientInfo.patientName || 'Anonymous',
      patient_age: patientInfo.patientAge ? parseInt(patientInfo.patientAge) : null,
      scan_date: patientInfo.scanDate || null,
      notes: patientInfo.notes,
      image_url: imageUrl,
      heatmap_url: prediction.heatmap_url || '',
      predicted_disease: prediction.predicted_disease,
      confidence_score: prediction.confidence_score,
      prediction_probability: prediction.prediction_probability,
      affected_ovary: prediction.affected_ovary,
      severity_level: prediction.severity_level,
      processing_time_ms: prediction.processing_time_ms,
      model_used: prediction.model_used,
      quality_assessment: prediction.quality_assessment,
      quality_score: prediction.quality_score,
      clinical_interpretation: prediction.clinical_interpretation,
      report_status: 'pending',
    });
    if (record) {
      setSavedRecordId(record.id);
    }
  };

  const handleReset = () => {
    setPhase('upload');
    setImageFile(null);
    setImageUrl('');
    setQualityResult(null);
    setPrediction(null);
    setSavedRecordId(null);
    setPatientInfo({
      patientId: '',
      patientName: '',
      patientAge: '',
      scanDate: '',
      notes: '',
    });
    navigate('/prediction');
  };

  const severityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'normal':
        return 'text-emerald-600 bg-emerald-50';
      case 'mild':
        return 'text-amber-600 bg-amber-50';
      case 'moderate':
        return 'text-orange-600 bg-orange-50';
      case 'severe':
        return 'text-rose-600 bg-rose-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  if (loadingExisting) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading prediction...</p>
        </div>
      </div>
    );
  }

  // Processing phase
  if (phase === 'processing') {
    return (
      <div className="py-8">
        <AIWorkflow onComplete={handleWorkflowComplete} />
      </div>
    );
  }

  // Results phase
  if (phase === 'results' && prediction) {
    const diseaseInfo = prediction.disease_info;
    const affectedOvarySide = prediction.affected_ovary.includes('Left')
      ? 'Left'
      : prediction.affected_ovary.includes('Right')
      ? 'Right'
      : prediction.affected_ovary.includes('Both')
      ? 'Both'
      : 'None';

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-800">
              Clinical Diagnosis Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              AI analysis complete — review findings below
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${severityColor(
                prediction.severity_level
              )}`}
            >
              {prediction.severity_level}
            </span>
            <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-pink-50 text-pink-600">
              {prediction.predicted_disease}
            </span>
          </div>
        </div>

        {/* Main 3-panel workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Image with Grad-CAM toggle */}
          <div className="lg:col-span-3 glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="w-4 h-4 text-pink-500" />
              <h3 className="font-semibold text-sm text-slate-700">Ultrasound Image</h3>
            </div>

            {/* View mode toggle */}
            <div className="flex gap-1 mb-3 p-1 bg-slate-100/50 rounded-lg">
              {[
                { mode: 'original' as ViewMode, label: 'Original', icon: Eye },
                { mode: 'heatmap' as ViewMode, label: 'Heatmap', icon: Layers },
                { mode: 'overlay' as ViewMode, label: 'Overlay', icon: Sparkles },
              ].map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                    viewMode === mode
                      ? 'bg-white text-pink-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>

            {/* Image display */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt="Ultrasound"
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                      viewMode === 'heatmap' ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                  {viewMode !== 'original' && (
                    <div
                      className="absolute inset-0 transition-opacity duration-300"
                      style={{
                        background:
                          viewMode === 'heatmap'
                            ? 'radial-gradient(circle at 50% 50%, rgba(239,68,68,0.6) 0%, rgba(245,158,11,0.5) 30%, rgba(59,130,246,0.3) 60%, rgba(20,184,166,0.1) 100%)'
                            : 'radial-gradient(circle at 50% 50%, rgba(239,68,68,0.4) 0%, rgba(245,158,11,0.3) 30%, rgba(59,130,246,0.2) 60%, transparent 100%)',
                        mixBlendMode: viewMode === 'overlay' ? 'screen' : 'normal',
                      }}
                    />
                  )}
                  {/* Scan corner markers */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-pink-400/60 rounded-tl-lg" />
                  <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-pink-400/60 rounded-tr-lg" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-pink-400/60 rounded-bl-lg" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-pink-400/60 rounded-br-lg" />
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon className="w-12 h-12 text-slate-600" />
                </div>
              )}
            </div>

            {/* Patient info summary */}
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient ID:</span>
                <span className="font-medium text-slate-700">{patientInfo.patientId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Name:</span>
                <span className="font-medium text-slate-700">{patientInfo.patientName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Age:</span>
                <span className="font-medium text-slate-700">
                  {patientInfo.patientAge ? `${patientInfo.patientAge}y` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scan Date:</span>
                <span className="font-medium text-slate-700">
                  {patientInfo.scanDate || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Center: 3D Anatomical Model */}
          <div className="lg:col-span-5 glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-pink-500" />
                <h3 className="font-semibold text-sm text-slate-700">
                  3D Anatomical Visualization
                </h3>
              </div>
              <span className="text-xs text-slate-400">Female Reproductive System</span>
            </div>
            <AnatomyModel3D
              disease={prediction.predicted_disease}
              affectedOvary={affectedOvarySide}
              onOvaryClick={(side) => setShowOvaryPopup(side)}
            />
            {showOvaryPopup && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm no-print" onClick={() => setShowOvaryPopup(null)}>
                <div className="glass-card rounded-2xl p-6 max-w-md mx-4 animate-fade-in-scale" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                      <h3 className="font-semibold text-slate-800">
                        {showOvaryPopup} Ovary — Detected Abnormality
                      </h3>
                    </div>
                    <button onClick={() => setShowOvaryPopup(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-rose-50 rounded-xl">
                      <Info className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold">{prediction.predicted_disease}</span> detected
                        on the {showOvaryPopup.toLowerCase()} ovary.
                      </p>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {diseaseInfo.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Target className="w-3.5 h-3.5" />
                      Confidence: {prediction.confidence_score.toFixed(1)}% · Severity: {prediction.severity_level}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: AI Prediction Results */}
          <div className="lg:col-span-4 glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-purple-500" />
              <h3 className="font-semibold text-sm text-slate-700">AI Prediction Results</h3>
            </div>

            {/* Confidence circular progress */}
            <div className="flex flex-col items-center mb-4">
              <CircularProgress
                value={prediction.confidence_score}
                size={130}
                label="Confidence"
                color={prediction.confidence_score > 90 ? '#10b981' : prediction.confidence_score > 75 ? '#ec4899' : '#f59e0b'}
              />
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-3 bg-slate-50/50 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Predicted Disease</p>
                <p className="text-sm font-semibold text-slate-800">{prediction.predicted_disease}</p>
              </div>
              <div className="p-3 bg-slate-50/50 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Affected Ovary</p>
                <p className="text-sm font-semibold text-slate-800">{prediction.affected_ovary}</p>
              </div>
              <div className="p-3 bg-slate-50/50 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Severity</p>
                <p className={`text-sm font-semibold px-2 py-0.5 rounded-md inline-block ${severityColor(prediction.severity_level)}`}>
                  {prediction.severity_level}
                </p>
              </div>
              <div className="p-3 bg-slate-50/50 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Processing Time</p>
                <p className="text-sm font-semibold text-slate-800">{(prediction.processing_time_ms / 1000).toFixed(2)}s</p>
              </div>
            </div>

            {/* Probability bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500">Prediction Probability</span>
                <span className="text-xs font-semibold text-pink-600">
                  {prediction.prediction_probability.toFixed(3)}
                </span>
              </div>
              <div className="h-2.5 bg-slate-200/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-400 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${prediction.prediction_probability * 100}%` }}
                />
              </div>
            </div>

            {/* Model used */}
            <div className="flex items-center gap-2 p-3 bg-purple-50/50 rounded-xl mb-4">
              <Cpu className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500">AI Model Used</p>
                <p className="text-sm font-semibold text-slate-800">{prediction.model_used}</p>
              </div>
            </div>

            {/* Clinical interpretation */}
            <div className="p-3 bg-pink-50/50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-pink-600" />
                <p className="text-xs font-semibold text-pink-700">Clinical Interpretation</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {prediction.clinical_interpretation}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {savedRecordId ? (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Prediction saved to history
            </div>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium text-sm shadow-md shadow-pink-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <Save className="w-4 h-4" />
              Save Prediction
            </button>
          )}
          {savedRecordId && (
            <ReportGenerator
              prediction={{
                id: savedRecordId,
                patient_id: patientInfo.patientId,
                patient_name: patientInfo.patientName,
                patient_age: patientInfo.patientAge ? parseInt(patientInfo.patientAge) : null,
                scan_date: patientInfo.scanDate,
                notes: patientInfo.notes,
                image_url: imageUrl,
                heatmap_url: prediction.heatmap_url || '',
                predicted_disease: prediction.predicted_disease,
                confidence_score: prediction.confidence_score,
                prediction_probability: prediction.prediction_probability,
                affected_ovary: prediction.affected_ovary,
                severity_level: prediction.severity_level,
                processing_time_ms: prediction.processing_time_ms,
                model_used: prediction.model_used,
                quality_assessment: prediction.quality_assessment,
                quality_score: prediction.quality_score,
                clinical_interpretation: prediction.clinical_interpretation,
                report_status: 'pending',
                created_at: new Date().toISOString(),
              }}
              imageUrl={imageUrl}
              heatmapUrl={prediction.heatmap_url}
            />
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 glass text-slate-700 rounded-xl font-medium text-sm hover:bg-white/60 transition-all duration-300"
          >
            <RotateCcw className="w-4 h-4" />
            New Analysis
          </button>
        </div>

        {/* Clinical info panels */}
        <ClinicalInfoPanels diseaseInfo={diseaseInfo} />
      </div>
    );
  }

  // Upload phase
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-800 mb-1">
          AI Prediction Workspace
        </h1>
        <p className="text-sm text-slate-500">
          Upload an ovarian ultrasound image to begin AI-assisted diagnosis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload section */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-pink-500" />
            <h2 className="font-display font-semibold text-slate-800">Ultrasound Image</h2>
          </div>

          {!imageUrl ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-pink-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-pink-50/30 transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-pink-500" />
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">
                Drop ultrasound image here
              </p>
              <p className="text-xs text-slate-400">
                or click to browse · JPG, PNG supported
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-900">
                <img src={imageUrl} alt="Ultrasound preview" className="w-full h-full object-contain" />
                <button
                  onClick={() => {
                    setImageFile(null);
                    setImageUrl('');
                    setQualityResult(null);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 glass rounded-xl text-sm text-slate-600 hover:bg-white/60 transition-colors"
              >
                Change Image
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Quality assessment */}
          {imageUrl && (
            <div className="mt-4">
              <button
                onClick={handleQualityCheck}
                disabled={qualityLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-50 text-purple-600 rounded-xl text-sm font-medium hover:bg-purple-100 transition-colors disabled:opacity-50"
              >
                {qualityLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
                    Assessing Image Quality...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Check Image Quality
                  </>
                )}
              </button>

              {qualityResult && (
                <div
                  className={`mt-3 p-3 rounded-xl flex items-start gap-2 animate-fade-in ${
                    qualityResult.is_sufficient
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {qualityResult.is_sufficient ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      Quality Score: {qualityResult.quality_score}/100 —{' '}
                      {qualityResult.quality_assessment}
                    </p>
                    <p className="text-xs mt-0.5">{qualityResult.recommendations}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Patient info section */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-purple-500" />
            <h2 className="font-display font-semibold text-slate-800">Patient Information</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  Patient ID
                </label>
                <input
                  type="text"
                  value={patientInfo.patientId}
                  onChange={(e) => setPatientInfo({ ...patientInfo, patientId: e.target.value })}
                  placeholder="e.g. PT-2024-001"
                  className="w-full px-3 py-2.5 glass rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={patientInfo.patientName}
                  onChange={(e) => setPatientInfo({ ...patientInfo, patientName: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3 py-2.5 glass rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Age</label>
                <input
                  type="number"
                  value={patientInfo.patientAge}
                  onChange={(e) => setPatientInfo({ ...patientInfo, patientAge: e.target.value })}
                  placeholder="e.g. 32"
                  className="w-full px-3 py-2.5 glass rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  Scan Date
                </label>
                <input
                  type="date"
                  value={patientInfo.scanDate}
                  onChange={(e) => setPatientInfo({ ...patientInfo, scanDate: e.target.value })}
                  className="w-full px-3 py-2.5 glass rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                Clinical Notes
              </label>
              <textarea
                value={patientInfo.notes}
                onChange={(e) => setPatientInfo({ ...patientInfo, notes: e.target.value })}
                placeholder="Enter any relevant clinical notes, symptoms, or prior history..."
                rows={4}
                className="w-full px-3 py-2.5 glass rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50 transition-all resize-none"
              />
            </div>

            {/* Model selection */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                AI Model Selection
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2.5 glass rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-400/50 transition-all"
              >
                {modelInfo.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name} ({model.accuracy}% accuracy)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={!imageFile || (qualityResult !== null && !qualityResult.is_sufficient)}
            className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-pink-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <Sparkles className="w-5 h-5" />
            Analyze Image
          </button>

          {!imageFile && (
            <p className="text-xs text-slate-400 text-center mt-2">
              Upload an image to enable analysis
            </p>
          )}
          {qualityResult && !qualityResult.is_sufficient && (
            <p className="text-xs text-amber-500 text-center mt-2 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Image quality insufficient — please upload a better scan
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
