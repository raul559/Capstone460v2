
import type { SkinAnalysisResult } from '@/library/skin-analysis';

interface StoredAnalysis {
  id: string;
  imageUri: string;
  result: SkinAnalysisResult;
  createdAt: number;
}

let storedAnalysis: StoredAnalysis | null = null;

const EXPIRATION_TIME = 10 * 60 * 1000;

export function saveAnalysisResult(
  imageUri: string,
  result: SkinAnalysisResult
): string {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  storedAnalysis = {
    id,
    imageUri,
    result,
    createdAt: Date.now(),
  };

  return id;
}

export function getAnalysisResult(id: string) {
  if (!storedAnalysis || storedAnalysis.id !== id) {
    return null;
  }

  if (Date.now() - storedAnalysis.createdAt > EXPIRATION_TIME) {
    storedAnalysis = null;
    return null;
  }

  return {
    imageUri: storedAnalysis.imageUri,
    result: storedAnalysis.result,
  };
}

export function clearAnalysisResult(id: string) {
  if (storedAnalysis?.id === id) {
    storedAnalysis = null;
  }
}
