import React from 'react';
import { TbX, TbAlertOctagon, TbAlertTriangle, TbBulb } from 'react-icons/tb';

/**
 * IssuesPanel
 * Full-screen modal table showing every validation issue.
 * Errors are red, warnings amber.
 */

const SeverityBadge = ({ severity }) =>
  severity === 'error' ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full whitespace-nowrap">
      <TbAlertOctagon className="text-sm" /> Error
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">
      <TbAlertTriangle className="text-sm" /> Warning
    </span>
  );

export default function IssuesPanel({ issues, onClose }) {
  if (!issues) return null;

  const errors   = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const sorted   = [...errors, ...warnings];

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      {/* Panel */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[70vh] flex flex-col panel-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <p className="text-base font-semibold text-slate-800">Data Quality Issues</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {errors.length} error{errors.length !== 1 ? 's' : ''} · {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
          >
            <TbX className="text-lg" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1 scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="sticky top-0">
              <tr>
                {['Severity', 'File', 'Row', 'Field', 'Value', 'Problem', 'Suggested Fix'].map((h) => (
                  <th key={h} className="table-th whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-slate-400 py-8 text-sm">
                    No issues found.
                  </td>
                </tr>
              ) : (
                sorted.map((issue) => (
                  <tr
                    key={issue.id}
                    className={`border-b last:border-0 transition-colors ${
                      issue.severity === 'error'
                        ? 'bg-red-50/60 hover:bg-red-50'
                        : 'bg-amber-50/60 hover:bg-amber-50'
                    }`}
                  >
                    <td className="table-td"><SeverityBadge severity={issue.severity} /></td>
                    <td className="table-td font-mono text-xs text-slate-600 whitespace-nowrap">{issue.file}</td>
                    <td className="table-td text-center text-slate-500">{issue.row}</td>
                    <td className="table-td font-mono text-xs text-slate-600">{issue.field}</td>
                    <td className="table-td">
                      <span className="font-mono text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {issue.value}
                      </span>
                    </td>
                    <td className="table-td text-slate-700 max-w-xs">{issue.message}</td>
                    <td className="table-td">
                      <span className="flex items-start gap-1 text-xs text-slate-500">
                        <TbBulb className="text-amber-400 flex-shrink-0 mt-0.5" />
                        {issue.suggestion}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
