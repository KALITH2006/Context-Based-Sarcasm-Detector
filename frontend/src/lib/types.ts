/* API response types */

export interface PredictResponse {
  prediction: "Sarcastic" | "Not Sarcastic";
  confidence: number;
  highlighted_words: string[];
  explanation: string;
  attention_scores?: Record<string, number>;
}

export interface BatchPredictResponse {
  results: PredictResponse[];
}

export interface ModelStats {
  accuracy: number;
  f1_score: number;
  precision: number;
  recall: number;
  total_samples: number;
  training_epochs: number;
  model_name: string;
  dataset: string;
  confusion_matrix: {
    true_positive: number;
    true_negative: number;
    false_positive: number;
    false_negative: number;
  };
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  device: string;
}

export interface PredictionHistoryItem {
  id: string;
  text: string;
  result: PredictResponse;
  timestamp: number;
}
