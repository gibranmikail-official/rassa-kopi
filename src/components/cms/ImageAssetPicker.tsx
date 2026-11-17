import { useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Loader2,
  Upload,
} from 'lucide-react';
import { PRESET_ASSETS } from '@/src/data/cmsDefaults';
import { uploadCmsAsset } from '@/src/lib/cmsService';

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

  const [showPresets, setShowPresets] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedOk, setUploadedOk] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    setUploadError(null);
    setUploadedOk(false);
    setUploading(true);
    try {
      const publicUrl = await uploadCmsAsset(file, 'cms');
      onChange(publicUrl);
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

  const isSvgOrTransparent =
    value.toLowerCase().endsWith('.svg') || value.toLowerCase().endsWith('.png');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label
          htmlFor={inputId}
          className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]"
        >
          {label}
        </label>

        <div className="flex items-center gap-3">
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

          <button
            type="button"
            onClick={() => setShowPresets((prev) => !prev)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#666666] hover:text-[#CC0000] cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{showPresets ? 'Hide Presets' : 'Pick Preset'}</span>
            {showPresets ? (
              <ChevronUp className="w-3 h-3" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3 h-3" aria-hidden="true" />
            )}
          </button>
        </div>
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
          {value ? (
            <img
              src={value}
              alt={label}
              className={`w-full h-full ${
                isSvgOrTransparent ? 'object-contain p-1' : 'object-cover'
              }`}
            />
          ) : (
            <ImageIcon className="w-4 h-4 text-[#777777]" aria-hidden="true" />
          )}
        </div>
        <input
          id={inputId}
          type="text"
          value={value}
          maxLength={1000}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Upload JPEG/JPG/PNG/SVG/WebP atau tempel URL gambar..."
          className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-black/12 bg-white text-xs text-[#1A1A1A] focus:outline-2 focus:outline-[#CC0000]"
        />
      </div>

      {uploadError && (
        <p className="text-[11px] font-medium text-[#CC0000]">{uploadError}</p>
      )}

      <p className="text-[11px] text-[#777777]">
        {helperText ||
          'Format didukung: JPEG, JPG, PNG, SVG, WebP (maks. 5 MB). Bisa drag & drop atau klik Upload File.'}
      </p>

      {showPresets && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2.5 rounded-xl bg-[#F5F5F5] border border-black/8 max-h-56 overflow-y-auto">
          {PRESET_ASSETS.map((asset) => {
            const isSelected = value === asset.url;
            return (
              <button
                key={asset.url}
                type="button"
                onClick={() => {
                  onChange(asset.url);
                  setShowPresets(false);
                }}
                className={`group text-left rounded-lg overflow-hidden border transition-all cursor-pointer bg-white ${
                  isSelected
                    ? 'border-[#CC0000] ring-2 ring-[#CC0000]/30'
                    : 'border-black/8 hover:border-[#CC0000]/50'
                }`}
              >
                <div className="aspect-[4/3] bg-[#F5F5F5] overflow-hidden">
                  <img
                    src={asset.url}
                    alt={asset.label}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <span className="block px-1.5 py-1 text-[10px] font-medium text-[#1A1A1A] truncate">
                  {asset.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
