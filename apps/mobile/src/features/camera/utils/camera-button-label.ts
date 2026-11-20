export function getCameraButtonLabel(
  isOpeningCamera: boolean,
  hasPhoto: boolean
): string {
  if (isOpeningCamera) {
    return 'Opening Camera...';
  }

  return hasPhoto ? 'Retake Photo' : 'Open Camera';
}
