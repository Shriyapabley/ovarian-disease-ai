export interface Prediction {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_age: number | null;
  scan_date: string | null;
  notes: string;
  image_url: string;
  heatmap_url: string;
  predicted_disease: string;
  confidence_score: number;
  prediction_probability: number;
  affected_ovary: string;
  severity_level: string;
  processing_time_ms: number;
  model_used: string;
  quality_assessment: string;
  quality_score: number;
  clinical_interpretation: string;
  report_status: string;
  created_at: string;
}

export interface DashboardStats {
  id: string;
  total_images: number;
  total_predictions: number;
  training_status: string;
  best_model: string;
  best_model_accuracy: number;
  overall_accuracy: number;
  updated_at: string;
}

export interface PatientInfo {
  patientId: string;
  patientName: string;
  patientAge: string;
  scanDate: string;
  notes: string;
}

export interface PredictionResult {
  predicted_disease: string;
  confidence_score: number;
  prediction_probability: number;
  affected_ovary: string;
  severity_level: string;
  processing_time_ms: number;
  model_used: string;
  clinical_interpretation: string;
  heatmap_url: string;
  quality_assessment: string;
  quality_score: number;
  disease_info: DiseaseInfo;
}

export interface DiseaseInfo {
  name: string;
  description: string;
  symptoms: string[];
  causes: string[];
  risk_factors: string[];
  investigations: string[];
  treatments: string[];
  lifestyle: string[];
  follow_up: string[];
  summary: string;
}

export interface ModelInfo {
  name: string;
  shortName: string;
  description: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  color: string;
}

export interface QualityAssessment {
  quality_score: number;
  quality_assessment: string;
  is_sufficient: boolean;
  recommendations: string;
}

export type DiseaseType = 'Normal' | 'PCOS' | 'Ovarian Cyst' | 'Endometriosis';

export type ViewMode = 'original' | 'heatmap' | 'overlay';

export type SortField = 'created_at' | 'patient_name' | 'confidence_score' | 'predicted_disease';
export type SortOrder = 'asc' | 'desc';
