"use client";
import React, { useCallback, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { getCroppedImage } from '@/lib/utils/cropImage';

interface Props {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

// Minimal modal with preview; cropping can be added later via a library like react-easy-crop
const AvatarUploadModal: React.FC<Props> = ({ open, onClose, onUpload }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleFileSelected = (f: File | null) => {
    setFile(f);
    setError(null);
    if (f) {
      if (!f.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      const maxBytes = 5 * 1024 * 1024; // 5MB
      if (f.size > maxBytes) {
        setError('File is too large (max 5MB)');
        return;
      }
      const url = URL.createObjectURL(f);
      setPreview(url);

      const img = new Image();
      img.src = url;
      img.onload = () => {
        const cropWidth = 300;
        const cropHeight = 300;
        const minZoom = Math.min(cropWidth / (img.width || 1), cropHeight / (img.height || 1));
        setZoom(minZoom || 1);
      };

      setCrop({ x: 0, y: 0 });
    } else {
      setPreview(null);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    handleFileSelected(f);
  };

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  if (!open) return null;

  const doUpload = async () => {
    if (!file || !preview) { setError('Please select an image'); return; }
    try {
      setUploading(true);
      let toUpload: File = file;
      if (croppedAreaPixels) {
        // generate cropped file from preview (object URL)
        const { x, y, width, height } = croppedAreaPixels;
        toUpload = await getCroppedImage(preview, { x, y, width, height }, { fileName: 'avatar.jpg', mimeType: 'image/jpeg' });
      }
      await onUpload(toUpload);
      onClose();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to upload';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-surface rounded-lg border border-default w-full max-w-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Update Avatar</h2>
        <div className="space-y-3">
          <input id="avatar-file" ref={inputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
            onDragOver={(e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e: React.DragEvent<HTMLDivElement>) => {
              e.preventDefault();
              e.stopPropagation();
              const f = e.dataTransfer.files?.[0] ?? null;
              if (f) handleFileSelected(f);
            }}
            className="flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-default/60 bg-background hover:border-primary/60 hover:bg-primary/5 cursor-pointer p-6 text-center"
            aria-label="Choose image file"
          >
            <div className="text-sm">Click to choose or drag & drop</div>
            <div className="text-xs text-muted-foreground">PNG, JPG up to 5MB</div>
            {file && <div className="text-xs mt-1">Selected: {file.name}</div>}
          </div>
          {preview && (
            <div className="relative w-full h-72 bg-black/20 rounded">
              <Cropper
                image={preview}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                objectFit="contain"
              />
            </div>
          )}
          {preview && (
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          )}
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={onClose} disabled={uploading}>Cancel</button>
            <button className="btn-primary" onClick={doUpload} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarUploadModal;
