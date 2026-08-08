import React from 'react';
import { TbArrowRight, TbTrendingDown } from 'react-icons/tb';

const ProgressBar = ({ value, max = 100, color }) => {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  return (
    <div className="progress-bar-track">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

const ScoreLabel = ({ score }) => {
  const c = score >= 61 ? 'text-red-600' : score >= 21 ? 'text-amber-600' : 'text-green-600';
  return <span className={`text-3xl font-black ${c}`}>{score}</span>;
};

export default function BeforeAfterPanel({ order, aiAnalysis }) {
  if (!order || !aiAnalysis) return null;

  const {
    estimatedScore,
    delayProbabilityBefore,
    delayProbabilityAfter,
    bestAction,
    actionEffectiveness,
  } = aiAnalysis;

  const scoreDelta = order.riskScore - estimatedScore;
  const delayDelta = delayProbabilityBefore - delayProbabilityAfter;

  const beforeBarScore = `bg-red-500`;
  const afterBarScore =
    estimatedScore >= 61 ? 'bg-red-400' :
    estimatedScore >= 21 ? 'bg-amber-400' : 'bg-green-500';

  const beforeBarDelay = 'bg-red-400';
  const afterBarDelay =
    delayProbabilityAfter >= 60 ? 'bg-orange-400' :
    delayProbabilityAfter >= 30 ? 'bg-amber-400' : 'bg-green-500';

  const statusText =
    actionEffectiveness === 'high' ? 'Much Safer' :
    actionEffectiveness === 'medium' ? 'Improved' :
    actionEffectiveness === 'none' ? 'Already Safe' : 'Slightly Better';

  const statusColor =
    actionEffectiveness === 'high' ? 'text-green-700 bg-green-100 border-green-300' :
    actionEffectiveness === 'medium' ? 'text-amber-700 bg-amber-100 border-amber-300' :
    'text-slate-600 bg-slate-100 border-slate-300';

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <TbTrendingDown className="text-brand-600 text-lg" />
        <p className="section-title mb-0">Before vs After</p>
        <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor}`}>
          {statusText}
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Applying: <span className="font-semibold text-brand-700">{bestAction}</span>
      </p>

      <div className="grid grid-cols-2 gap-4 items-start">
        {/* Before */}
        <div className="space-y-4">
          <div className="text-center p-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-xs text-red-600 font-semibold uppercase tracking-wider mb-1">Before</p>
            <p className="text-xs text-slate-500 mb-0.5">Risk Score</p>
            <ScoreLabel score={order.riskScore} />
            <div className="mt-2">
              <ProgressBar value={order.riskScore} color={beforeBarScore} />
            </div>
          </div>
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Delay Probability</p>
            <p className="text-2xl font-bold text-red-600">{delayProbabilityBefore}%</p>
            <div className="mt-1.5">
              <ProgressBar value={delayProbabilityBefore} color={beforeBarDelay} />
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center h-full py-8 col-span-2 sm:col-span-2 lg:col-span-1 order-3 lg:order-2">
          {/* Rendered as grid-cols-2, so arrow is handled by positioning */}
        </div>

        {/* After */}
        <div className="space-y-4">
          <div className="text-center p-3 bg-green-50 border border-green-100 rounded-xl">
            <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">After</p>
            <p className="text-xs text-slate-500 mb-0.5">Est. Risk Score</p>
            <ScoreLabel score={estimatedScore} />
            <div className="mt-2">
              <ProgressBar value={estimatedScore} color={afterBarScore} />
            </div>
          </div>
          <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Est. Delay Prob.</p>
            <p className="text-2xl font-bold text-green-600">{delayProbabilityAfter}%</p>
            <div className="mt-1.5">
              <ProgressBar value={delayProbabilityAfter} color={afterBarDelay} />
            </div>
          </div>
        </div>
      </div>

      {/* Delta summary */}
      {(scoreDelta > 0 || delayDelta > 0) && (
        <div className="mt-4 flex items-center gap-3 justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <TbArrowRight className="text-green-600 text-lg flex-shrink-0" />
          <div className="flex gap-6 text-sm">
            {scoreDelta > 0 && (
              <span className="text-slate-600">
                Score ↓ <span className="font-bold text-green-600">−{scoreDelta} pts</span>
              </span>
            )}
            {delayDelta > 0 && (
              <span className="text-slate-600">
                Delay risk ↓ <span className="font-bold text-green-600">−{delayDelta}%</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
