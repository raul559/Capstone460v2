
import { File } from 'expo-file-system';

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

const API_BASE_URL = 'http://10.0.2.2:3720';

export async function analyzeSkinImage(
  imageUri: string
): Promise<SkinAnalysisResult> {
  const formData = new FormData();

  const extension = imageUri
    .split('?')[0]
    .split('.')
    .pop()
    ?.toLowerCase();

  const imageType =
    extension === 'png'
      ? 'image/png'
      : extension === 'webp'
        ? 'image/webp'
        : 'image/jpeg';

  const imageName =
    imageType === 'image/png'
      ? 'skin-image.png'
      : imageType === 'image/webp'
        ? 'skin-image.webp'
        : 'skin-image.jpg';

  const imageFile = new File(imageUri);

  formData.append('image', imageFile, imageName);

  const response = await fetch(`${API_BASE_URL}/analyze_skin`, {
    method: 'POST',
    body: formData,
  });

  let data: SkinAnalysisResult & { error?: string };

  try {
    data = await response.json();
  } catch {
    throw new Error('The server returned an unreadable response.');
  }

  if (!response.ok) {
    throw new Error(
      data.error ?? `Analysis failed (HTTP ${response.status}).`
    );
  }

  if (
    !Array.isArray(data.top_predictions) ||
    typeof data.risk_score !== 'string'
  ) {
    throw new Error(
      'The server response did not contain the expected analysis results.'
    );
  }

  return data;
}
