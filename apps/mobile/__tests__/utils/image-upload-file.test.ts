import { getImageUploadFile } from '@/utils/image-upload-file';

const JPEG = { type: 'image/jpeg', name: 'skin-image.jpg' };
const PNG = { type: 'image/png', name: 'skin-image.png' };
const WEBP = { type: 'image/webp', name: 'skin-image.webp' };

describe('getImageUploadFile', () => {
  it.each([
    ['file:///photos/lesion.png', PNG],
    ['file:///photos/lesion.webp', WEBP],
    ['file:///photos/lesion.jpg', JPEG],
    ['file:///photos/lesion.jpeg', JPEG],
  ])('maps %s to its upload file', (uri, expected) => {
    expect(getImageUploadFile(uri)).toEqual(expected);
  });

  it('ignores the case of the extension', () => {
    expect(getImageUploadFile('file:///photos/LESION.PNG')).toEqual(PNG);
  });

  it('ignores a query string after the extension', () => {
    expect(getImageUploadFile('https://example.com/lesion.webp?size=large')).toEqual(WEBP);
  });

  it.each([
    ['an unsupported format', 'file:///photos/lesion.heic'],
    ['no extension', 'file:///photos/lesion'],
    ['an extension that matches an object key', 'file:///photos/lesion.constructor'],
  ])('falls back to JPEG for %s', (_case, uri) => {
    expect(getImageUploadFile(uri)).toEqual(JPEG);
  });
});
