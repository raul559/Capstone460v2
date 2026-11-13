import { File } from 'expo-file-system';

import { API_BASE_URL } from '@/api/config';
import type { SkinAnalysisResult } from '@/types/skin-analysis';
import { getImageUploadFile } from '@/utils/image-upload-file';

export async function analyzeSkinImage(
  imageUri: string
): Promise<SkinAnalysisResult> {
  const formData = new FormData();
  const { name: imageName } = getImageUploadFile(imageUri);
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
