import React from 'react';
import { TbWifiOff, TbRefresh } from 'react-icons/tb';

/**
 * NetworkStatusModal
 * Mandatory blocking popup displayed whenever network is offline or fetch fails.
 * Cannot be dismissed until network connectivity is re-established.
 */
export default function NetworkStatusModal({ isOpen, onRetry }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center panel-slide-in relative border border-slate-200">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-200 shadow-inner">
          <TbWifiOff className="text-red-600 text-4xl animate-bounce" />
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mb-2">Network Offline</h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          The Sales Risk Dashboard requires an active network connection to process data and analytics. The application is paused while offline.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-xs text-amber-800 font-medium">
          ⚠️ Please reconnect to the internet to resume dashboard operations.
        </div>

        <div className="flex justify-center">
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg w-full"
          >
            <TbRefresh className="text-lg" />
            Check Connection & Retry
          </button>
        </div>
      </div>
    </div>
  );
}
