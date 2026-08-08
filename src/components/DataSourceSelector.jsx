import React from 'react';
import { TbDatabase, TbUpload, TbRefresh } from 'react-icons/tb';

/**
 * DataSourceSelector
 * Shows two radio options: "Demo Dataset" | "Upload CSV"
 * and a "Reset to Demo Dataset" button when not in demo mode.
 */
export default function DataSourceSelector({ dataMode, setDataMode, onReset }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-card px-5 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Label */}
        <div className="flex-shrink-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Data Source</p>
          <p className="text-xs text-slate-400">Choose where the dashboard reads its data from</p>
        </div>

        {/* Radio options */}
        <div className="flex items-center gap-4 sm:ml-auto">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name="dataMode"
              value="demo"
              checked={dataMode === 'demo'}
              onChange={() => setDataMode('demo')}
              className="accent-brand-600 w-4 h-4"
            />
            <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700 group-hover:text-brand-600 transition-colors">
              <TbDatabase className="text-base text-brand-500" />
              Demo Dataset
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name="dataMode"
              value="upload"
              checked={dataMode === 'upload'}
              onChange={() => setDataMode('upload')}
              className="accent-brand-600 w-4 h-4"
            />
            <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700 group-hover:text-brand-600 transition-colors">
              <TbUpload className="text-base text-brand-500" />
              Upload CSV
            </span>
          </label>
        </div>

        {/* Reset button — visible only when not using demo */}
        {dataMode !== 'demo' && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-600 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors border border-slate-200 hover:border-brand-200 sm:ml-0"
          >
            <TbRefresh className="text-sm" />
            Reset to Demo Dataset
          </button>
        )}
      </div>
    </div>
  );
}
