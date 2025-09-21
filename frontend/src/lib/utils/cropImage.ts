// Utility to crop an image using canvas given pixel crop area from react-easy-crop
// Returns a Blob or File suitable for uploading

export interface CroppedAreaPixels {
  width: number;
  height: number;
  x: number;
  y: number;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    // Handle CORS for object URLs; not needed for local object URLs but safe
    image.crossOrigin = 'anonymous';
    image.src = url;
  });
}

export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: CroppedAreaPixels,
  options?: { fileName?: string; mimeType?: string; quality?: number }
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  // Set canvas size to the crop size
  canvas.width = Math.max(1, Math.floor(pixelCrop.width));
  canvas.height = Math.max(1, Math.floor(pixelCrop.height));

  // Draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const mimeType = options?.mimeType ?? 'image/jpeg';
  const quality = options?.quality ?? 0.92;
  const fileName = options?.fileName ?? 'avatar.jpg';

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Canvas is empty'));
        resolve(new File([blob], fileName, { type: mimeType }));
      },
      mimeType,
      quality
    );
  });
}
