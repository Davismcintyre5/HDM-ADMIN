import { useState, useRef } from 'react';
import { HiUpload, HiX } from 'react-icons/hi';

export default function FileUpload({ onUpload, accept = '*', maxSizeMB = 10, label = 'Upload file' }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be less than ${maxSizeMB}MB`);
      return;
    }
    setError('');
    setFile(f);
    onUpload?.(f);
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-[var(--border-color)] rounded-lg p-6 text-center cursor-pointer hover:border-green-500 transition-colors"
      >
        {file ? (
          <div className="flex items-center justify-between text-sm text-[var(--text-primary)]">
            <span className="truncate">{file.name}</span>
            <button onClick={(e) => { e.stopPropagation(); setFile(null); setError(''); }} className="text-red-500 hover:text-red-700"><HiX /></button>
          </div>
        ) : (
          <div className="text-[var(--text-muted)]">
            <HiUpload className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">{label}</p>
            <p className="text-xs">Max {maxSizeMB}MB</p>
          </div>
        )}
        <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}