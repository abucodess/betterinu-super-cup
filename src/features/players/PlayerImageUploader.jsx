import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { cloudinaryService } from '../../services/cloudinary/cloudinary.service';

export function PlayerImageUploader({ value, photoUrl = '', onChange }) {
  const currentUrl = value !== undefined ? value : photoUrl;
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploadStatus('');
    setIsUploading(true);
    setProgress(15);

    try {
      const result = await cloudinaryService.uploadPlayerImage(file, {
        onProgress: (p) => setProgress(p),
      });

      setUploadStatus('Card image uploaded');
      onChange(result.url);
    } catch (err) {
      setError(err.message || 'Card upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-xs font-medium text-[#9AA69B]">
          eFootball Player Card Image (PNG, JPG, WebP)
        </label>
        {uploadStatus && !error && (
          <span className="text-[11px] font-medium flex items-center gap-1 text-[#22C55E]">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>{uploadStatus}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#202020] border border-[#303030]">
        {/* 3:4 Card Thumbnail Preview */}
        <div className="w-14 h-[74px] rounded-lg bg-[#141414] border border-[#303030] flex items-center justify-center overflow-hidden shrink-0">
          {currentUrl ? (
            <img
              key={currentUrl}
              src={cloudinaryService.getOptimizedPortraitUrl(currentUrl)}
              alt="Player card preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-[#9AA69B]/50" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,.png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
              aria-label="Upload player card image"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B8F34A] text-[#090909] text-xs font-semibold hover:bg-[#c8ff63] transition-colors disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {isUploading
                ? `Uploading ${progress}%`
                : currentUrl
                ? 'Change Card'
                : 'Upload Card'}
            </button>

            {currentUrl && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setUploadStatus('');
                  setError('');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#141414] text-[#EF4444] border border-[#303030] text-xs font-medium hover:bg-[#EF4444]/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder="Or paste card image URL..."
            value={currentUrl && currentUrl.startsWith('data:') ? '' : currentUrl || ''}
            onChange={(e) => {
              setError('');
              onChange(e.target.value);
            }}
            className="w-full bg-[#141414] border border-[#303030] rounded-lg px-2.5 py-1 text-xs text-[#F4F7F2] placeholder-[#9AA69B]/50 focus:outline-none focus:border-[#B8F34A]"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-[#EF4444]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default PlayerImageUploader;
