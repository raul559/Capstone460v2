export const riskLabels: Record<string, string> = {
  high_risk: 'High Risk',
  moderate_risk: 'Moderate Risk',
  low_risk: 'Low Risk',
  clinician_review: 'Clinician Review Recommended',
};

export const predictionLabels: Record<string, string> = {
  akiec: 'Actinic keratoses / related lesions',
  bcc: 'Basal cell carcinoma',
  bkl: 'Benign keratosis-like lesion',
  df: 'Dermatofibroma',
  mel: 'Melanoma',
  nv: 'Melanocytic nevi',
  vasc: 'Vascular lesion',
};

export const predictionDescriptions: Record<string, string> = {
  akiec: 'A potentially precancerous or related skin lesion. A healthcare professional should evaluate it.',
  bcc: 'A common type of skin cancer. A healthcare professional should evaluate this finding.',
  bkl: 'A benign keratosis-like skin lesion. This preliminary result does not replace clinical examination.',
  df: 'A usually benign skin growth. A clinician can confirm the finding.',
  mel: 'A potentially serious skin condition. Prompt evaluation by a qualified healthcare professional is important.',
  nv: 'A common type of pigmented mole. This preliminary assessment does not replace a clinical examination.',
  vasc: 'A skin lesion involving blood vessels. A clinician can confirm the finding.',
};

export const DEFAULT_PREDICTION_DESCRIPTION =
  'This preliminary AI assessment does not replace a clinical examination.';

export function formatConfidencePercent(confidence: number): string {
  return (confidence * 100).toFixed(1);
}
