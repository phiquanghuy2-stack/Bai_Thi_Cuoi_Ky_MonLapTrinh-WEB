import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Trash2 } from 'lucide-react';

/**
 * Component chọn và xem trước nhiều ảnh (Dùng useRef để kích hoạt input file & useEffect cleanup URL.revokeObjectURL)
 */
const ImageUploader = ({ files = [], onChange, maxFiles = 5, error = '' }) => {
  const fileInputRef = useRef(null);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const objectUrls = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setPreviews(objectUrls);

    // Cleanup giải phóng bộ nhớ ObjectURL khi unmount hoặc đổi danh sách file
    return () => {
      objectUrls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [files]);

  const handleSelectFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    const combined = [...files, ...selected].slice(0, maxFiles);
    onChange(combined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    const nextFiles = files.filter((_, idx) => idx !== indexToRemove);
    onChange(nextFiles);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple
        onChange={handleSelectFiles}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full py-5 px-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <UploadCloud className="w-7 h-7 text-blue-600" />
        <span className="text-sm font-medium">
          Nhấn để chọn ảnh đính kèm (Tối đa {maxFiles} ảnh)
        </span>
        <span className="text-xs text-slate-400">Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB/ảnh)</span>
      </button>

      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}

      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-3">
          {previews.map((item, idx) => (
            <div
              key={`${item.name}-${idx}`}
              className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square bg-slate-100"
            >
              <img
                src={item.url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveFile(idx)}
                className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
