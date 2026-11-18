import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import { Check, Loader2, Upload } from 'lucide-react';
import { DEFAULT_IMAGE_URL } from '@/src/components/ui/SmartImage';
import {
  deleteUnreferencedStorageAssets,
  uploadCmsAsset,
} from '@/src/lib/cmsService';

interface ImageAssetPickerProps {
  label: string;
  value: string;
  onChange: (nextUrl: string) => void;
  helperText?: string;
}

const ACCEPTED_FORMATS =
  '.jpeg,.jpg,.png,.svg,.webp,image/jpeg,image/png,image/svg+xml,image/webp';

export function ImageAssetPicker({
  label,
  value,
  onChange,
  helperText,
}: ImageAssetPickerProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastUploadedUrlRef = useRef<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadedOk, setUploadedOk] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    setPreviewError(false);
  }, [value]);

  const handleFile = async (file: File) => {
    setUploadError(null);
    setUploadedOk(false);
    setUploading(true);
    try {
      const publicUrl = await uploadCmsAsset(file, 'cms');
      const prevTempUrl = lastUploadedUrlRef.current;
      lastUploadedUrlRef.current = publicUrl;
      onChange(publicUrl);
      if (prevTempUrl && prevTempUrl !== publicUrl) {
        void deleteUnreferencedStorageAssets([prevTempUrl]);
      }
      setUploadedOk(true);
      window.setTimeout(() => setUploadedOk(false), 3000);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Gagal mengunggah gambar.'
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const trimmedValue = value.trim();
  const usingDefaultPreview = !trimmedValue || previewError;
  const previewSrc = usingDefaultPreview ? DEFAULT_IMAGE_URL : trimmedValue;
  const isSvgOrTransparent =
    !usingDefaultPreview &&
    (trimmedValue.toLowerCase().endsWith('.svg') ||
      trimmedValue.toLowerCase().endsWith('.png'));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label
          htmlFor={inputId}
          className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]"
        >
          {label}
        </label>

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#CC0000]/10 hover:bg-[#CC0000] text-[#CC0000] hover:text-white text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
          ) : uploadedOk ? (
            <Check className="w-3 h-3" aria-hidden="true" />
          ) : (
            <Upload className="w-3 h-3" aria-hidden="true" />
          )}
          <span>
            {uploading
              ? 'Uploading...'
              : uploadedOk
                ? 'Uploaded!'
                : 'Upload File'}
          </span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FORMATS}
        onChange={handleFileChange}
        className="hidden"
        aria-label={`Upload image file for ${label}`}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex items-center gap-3 p-1.5 rounded-xl border transition-colors ${
          isDragging
            ? 'border-[#CC0000] bg-[#CC0000]/5'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="w-12 h-12 rounded-lg border border-black/10 bg-[#F5F5F5] overflow-hidden shrink-0 flex items-center justify-center">
          <img
            src={previewSrc}
            alt={label}
            onError={() => {
              if (!usingDefaultPreview) setPreviewError(true);
            }}
            className={`w-full h-full ${
              isSvgOrTransparent ? 'object-contain p-1' : 'object-cover'
            }`}
          />
        </div>
        <input
          id={inputId}
          type="text"
          value={value}
          maxLength={1000}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Upload foto atau tempel URL (kosong = gambar default)..."
          className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-black/12 bg-white text-xs text-[#1A1A1A] focus:outline-2 focus:outline-[#CC0000]"
        />
      </div>

      {uploadError && (
        <p className="text-[11px] font-medium text-[#CC0000]">{uploadError}</p>
      )}

      <p className="text-[11px] text-[#777777]">
        {helperText ||
          'Format didukung: JPEG, JPG, PNG, SVG, WebP (maks. 5 MB). Kosongkan jika ingin menggunakan gambar default.'}
      </p>
    </div>
  );
}
