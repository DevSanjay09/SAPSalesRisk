import React from 'react';
import { TbChartBar, TbRefresh } from 'react-icons/tb';
import { MdOutlineWarningAmber } from 'react-icons/md';

export default function Header({ lastRefresh, onRefresh }) {
  const formatted = lastRefresh
    ? new Date(lastRefresh).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left — brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <TbChartBar className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              Sales Risk Dashboard
            </h1>
            <p className="text-xs text-slate-500 leading-tight">
              Order-to-Cash Fulfillment Intelligence
            </p>
          </div>
        </div>

        {/* Center — banner */}
        <div className="hidden md:flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-1.5">
          <MdOutlineWarningAmber className="text-amber-500 text-sm flex-shrink-0" />
          <span className="text-xs font-medium text-amber-700">
            Live risk monitoring — all data from CSV
          </span>
        </div>

        {/* Right — refresh */}
        <div className="flex items-center gap-4">
          {formatted && (
            <span className="text-xs text-slate-400 hidden sm:block">
              Last refreshed: <span className="font-medium text-slate-600">{formatted}</span>
            </span>
          )}
          <button
            onClick={onRefresh}
            className="btn-ghost flex items-center gap-1.5"
            title="Reload CSV data"
          >
            <TbRefresh className="text-base" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </header>
  );
}
