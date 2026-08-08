import React from 'react';
import { TbBrain, TbBulb } from 'react-icons/tb';

const causeColors = {
  stock:   { bar: 'bg-orange-400', text: 'text-orange-600', bg: 'bg-orange-50' },
  credit:  { bar: 'bg-rose-400',   text: 'text-rose-600',   bg: 'bg-rose-50'   },
  urgency: { bar: 'bg-amber-400',  text: 'text-amber-600',  bg: 'bg-amber-50'  },
};

const impactColors = {
  high:   'text-green-700 bg-green-100 border-green-200',
  medium: 'text-amber-700 bg-amber-100 border-amber-200',
  low:    'text-slate-600 bg-slate-100 border-slate-200',
  none:   'text-slate-500 bg-slate-50 border-slate-200',
};

export default function RecommendationPanel({ aiAnalysis, recommendations }) {
  if (!aiAnalysis) return null;

  const { causesRanked, bestAction, estimatedScore, estimatedDelayReduction } = aiAnalysis;

  return (
    <div className="space-y-4">
      {/* AI Risk Attribution */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TbBrain className="text-brand-600 text-lg" />
          <p className="section-title mb-0">AI Risk Cause Analysis</p>
        </div>

        {causesRanked.length === 0 ? (
          <p className="text-sm text-green-600 font-medium">No significant risk factors detected.</p>
        ) : (
          <div className="space-y-3">
            {causesRanked.map((cause, i) => {
              const c = causeColors[cause.type] || { bar: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50' };
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-semibold ${c.text}`}>{cause.cause}</span>
                    <span className="text-sm font-bold text-slate-700">{cause.percentage}%</span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${c.bar}`}
                      style={{ width: `${cause.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{cause.detail}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.all?.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TbBulb className="text-brand-600 text-lg" />
            <p className="section-title mb-0">Recommended Actions</p>
          </div>

          {/* Summary */}
          <p className="text-sm text-slate-600 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100 leading-relaxed">
            {recommendations.summary}
          </p>

          <div className="space-y-2">
            {recommendations.all.map((rec, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                  i === 0 ? 'border-brand-200 bg-brand-50' : 'border-slate-100 bg-white'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-semibold ${i === 0 ? 'text-brand-700' : 'text-slate-700'}`}>
                      {rec.action}
                    </p>
                    {i === 0 && (
                      <span className="text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full font-medium">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{rec.description}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${impactColors[rec.impact]}`}>
                  {rec.impact === 'high' ? 'High Impact' : rec.impact === 'medium' ? 'Medium' : rec.impact === 'none' ? '—' : 'Low'}
                </span>
              </div>
            ))}
          </div>

          {/* Estimated outcome */}
          {bestAction !== 'No Action Required' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700 font-semibold">If "{bestAction}" is applied:</p>
              <div className="flex gap-4 mt-1">
                <div>
                  <p className="text-xs text-slate-500">Est. Risk Score</p>
                  <p className="text-lg font-bold text-green-700">{estimatedScore}</p>
                </div>
                {estimatedDelayReduction > 0 && (
                  <div>
                    <p className="text-xs text-slate-500">Delay Reduction</p>
                    <p className="text-lg font-bold text-green-700">{estimatedDelayReduction}d</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
