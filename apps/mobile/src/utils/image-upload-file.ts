export type ImageUploadFile = {
  type: string;
  name: string;
};

const DEFAULT_UPLOAD_FILE: ImageUploadFile = {
  type: 'image/jpeg',
  name: 'skin-image.jpg',
};

// A Map avoids matching inherited object keys such as "constructor".
const UPLOAD_FILES_BY_EXTENSION = new Map<string, ImageUploadFile>([
  ['png', { type: 'image/png', name: 'skin-image.png' }],
  ['webp', { type: 'image/webp', name: 'skin-image.webp' }],
]);

function getFileExtension(uri: string): string | undefined {
  return uri.split('?')[0].split('.').pop()?.toLowerCase();
}

export function getImageUploadFile(imageUri: string): ImageUploadFile {
  const extension = getFileExtension(imageUri) ?? '';

  return UPLOAD_FILES_BY_EXTENSION.get(extension) ?? DEFAULT_UPLOAD_FILE;
}
