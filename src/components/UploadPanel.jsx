import React, { useRef, useState } from 'react';
import { TbUpload, TbFile, TbX, TbShieldCheck, TbLoader2 } from 'react-icons/tb';

/**
 * UploadPanel
 * Three CSV file inputs + a Validate button with loading overlay.
 */

const FileSlot = ({ label, file, onChange, onClear, accept }) => {
  const inputRef = useRef(null);

  return (
    <div className="group">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</p>
      {file ? (
        /* File selected state */
        <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-lg px-3 py-2.5 text-sm">
          <TbFile className="text-brand-500 flex-shrink-0 text-base" />
          <span className="flex-1 truncate text-brand-700 font-medium">{file.name}</span>
          <span className="text-slate-400 text-xs flex-shrink-0">
            {(file.size / 1024).toFixed(1)} KB
          </span>
          <button
            onClick={onClear}
            className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
            title="Remove file"
          >
            <TbX className="text-base" />
          </button>
        </div>
      ) : (
        /* Empty / drop zone */
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center gap-2.5 border-2 border-dashed border-slate-200 hover:border-brand-400 hover:bg-brand-50 rounded-lg px-4 py-3 text-sm text-slate-500 hover:text-brand-600 transition-all duration-200"
        >
          <TbUpload className="text-base flex-shrink-0" />
          <span>Choose {label} file…</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept ?? '.csv'}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f);
          e.target.value = '';          // reset so same file can be re-selected
        }}
      />
    </div>
  );
};

export default function UploadPanel({ onValidate }) {
  const [files, setFiles] = useState({ orders: null, inventory: null, credit: null });
  const [loading, setLoading] = useState(false);

  const setFile = (key) => (f) => setFiles((prev) => ({ ...prev, [key]: f }));
  const clearFile = (key) => () => setFiles((prev) => ({ ...prev, [key]: null }));

  const hasAny = files.orders || files.inventory || files.credit;

  const handleValidate = async () => {
    setLoading(true);
    try {
      await onValidate(files);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-white border border-slate-200 rounded-xl shadow-card p-5">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10 gap-3">
          <TbLoader2 className="text-brand-600 text-3xl animate-spin" />
          <p className="text-sm font-semibold text-brand-700">Validating dataset…</p>
          <p className="text-xs text-slate-400">Checking structure, values, and relationships</p>
          <div className="flex gap-1 mt-1">
            {['Parsing CSV', 'Structure', 'Values', 'Relationships'].map((s, i) => (
              <span key={s} className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full" style={{ animationDelay: `${i * 150}ms` }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-700">Test Your Own Dataset</p>
        <p className="text-xs text-slate-400 mt-0.5">Upload up to three CSV files. You don't need to upload all at once — missing files will fall back to demo data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <FileSlot label="Orders CSV"          file={files.orders}    onChange={setFile('orders')}    onClear={clearFile('orders')} />
        <FileSlot label="Inventory CSV"       file={files.inventory} onChange={setFile('inventory')} onClear={clearFile('inventory')} />
        <FileSlot label="Customer Credit CSV" file={files.credit}    onChange={setFile('credit')}    onClear={clearFile('credit')} />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleValidate}
          disabled={!hasAny || loading}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors duration-150 shadow-sm"
        >
          <TbShieldCheck className="text-base" />
          Validate Dataset
        </button>
        {!hasAny && (
          <p className="text-xs text-slate-400">Select at least one CSV file to validate.</p>
        )}
      </div>
    </div>
  );
}
