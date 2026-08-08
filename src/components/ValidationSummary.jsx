import React from 'react';
import {
  TbCircleCheck, TbAlertTriangle, TbEye, TbPlayerPlay, TbInfoCircle,
} from 'react-icons/tb';

/**
 * ValidationSummary
 * Compact summary card shown after validation runs.
 * Displays valid/invalid counts per file and action buttons.
 */

const FileRow = ({ label, valid, invalid }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1 text-sm text-green-600 font-semibold">
        <TbCircleCheck className="text-base" />
        {valid} valid
      </span>
      {invalid > 0 && (
        <span className="flex items-center gap-1 text-sm text-amber-600 font-semibold">
          <TbAlertTriangle className="text-base" />
          {invalid} invalid
        </span>
      )}
    </div>
  </div>
);

export default function ValidationSummary({ result, onViewIssues, onProcess }) {
  if (!result) return null;

  const { summary, issues, validOrders } = result;
  const totalIssues = issues.length;
  const errorCount  = issues.filter((i) => i.severity === 'error').length;
  const warnCount   = issues.filter((i) => i.severity === 'warning').length;
  const canProcess  = validOrders.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-card p-5 panel-slide-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-slate-700">Dataset Validation</p>
          <p className="text-xs text-slate-400 mt-0.5">Validation completed</p>
        </div>
        {totalIssues === 0 ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-full">
            <TbCircleCheck className="text-sm" />
            All Clean
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full">
            <TbAlertTriangle className="text-sm" />
            {totalIssues} Issue{totalIssues !== 1 ? 's' : ''} Found
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 mb-2" />

      {/* Per-file rows */}
      <FileRow label="Orders"          valid={summary.orders.valid}    invalid={summary.orders.invalid} />
      <FileRow label="Inventory"       valid={summary.inventory.valid} invalid={summary.inventory.invalid} />
      <FileRow label="Customer Credit" valid={summary.credit.valid}    invalid={summary.credit.invalid} />

      {/* Divider */}
      <div className="border-t border-slate-100 mt-2 mb-4" />

      {/* Issue counts */}
      {totalIssues > 0 && (
        <div className="flex gap-3 mb-4">
          {errorCount > 0 && (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
              <span className="text-sm font-bold text-red-600">❌</span>
              <span className="text-xs font-semibold text-red-700">{errorCount} Error{errorCount !== 1 ? 's' : ''}</span>
            </div>
          )}
          {warnCount > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
              <span className="text-sm font-bold text-amber-500">⚠️</span>
              <span className="text-xs font-semibold text-amber-700">{warnCount} Warning{warnCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {totalIssues > 0 && (
          <button
            onClick={onViewIssues}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 px-4 py-2 rounded-lg transition-colors duration-150"
          >
            <TbEye className="text-base" />
            View Issues
          </button>
        )}
        {canProcess ? (
          <button
            onClick={onProcess}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-150 shadow-sm"
          >
            <TbPlayerPlay className="text-base" />
            Process {validOrders.length} Valid Order{validOrders.length !== 1 ? 's' : ''}
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <TbInfoCircle className="text-sm text-slate-400" />
            No valid orders to process. Fix the errors and validate again.
          </div>
        )}
      </div>
    </div>
  );
}
