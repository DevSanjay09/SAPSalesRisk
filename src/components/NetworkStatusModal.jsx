import React from 'react';
import { TbWifiOff, TbRefresh, TbX } from 'react-icons/tb';

/**
 * NetworkStatusModal
 * Friendly modal popup displayed when network connectivity issues occur during demo CSV fetch.
 */
export default function NetworkStatusModal({ isOpen, onClose, onRetry }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center panel-slide-in relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
        >
          <TbX className="text-lg" />
        </button>

        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <TbWifiOff className="text-amber-600 text-3xl animate-bounce" />
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-2">Network Unavailable</h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Unable to fetch demo data files from the server. Please check your network connection or try uploading custom CSV files directly.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={onRetry}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <TbRefresh className="text-base" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
