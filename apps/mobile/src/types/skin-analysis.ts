export type SkinPrediction = {
  label: string;
  confidence: number;
};

export type SkinAnalysisResult = {
  top_predictions: SkinPrediction[];
  risk_score: string;
  certainty_factor?: number;
  assistant_seed?: string;
  follow_up_questions?: string[];
};
