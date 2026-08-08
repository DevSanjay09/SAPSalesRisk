import React from 'react';
import { TbListNumbers, TbChevronRight } from 'react-icons/tb';
import RiskBadge from './RiskBadge';

const levelBg = { High: 'bg-red-50', Medium: 'bg-amber-50', Low: 'bg-green-50' };
const rankColor = (i) => (i === 0 ? 'text-red-600 font-bold' : i === 1 ? 'text-amber-600 font-semibold' : 'text-slate-500');

export default function PriorityQueue({ orders, selectedId, onSelect }) {
  if (!orders || orders.length === 0) return null;

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <TbListNumbers className="text-brand-600 text-lg" />
        <p className="section-title mb-0">Priority Queue</p>
        <span className="ml-auto text-xs text-slate-400">Auto-ranked by risk score</span>
      </div>

      <ol className="space-y-2">
        {orders.map((order, i) => (
          <li key={order.Order_ID}>
            <button
              onClick={() => onSelect(order)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-150
                ${selectedId === order.Order_ID
                  ? 'border-brand-300 bg-brand-50 shadow-sm'
                  : `border-transparent ${levelBg[order.riskLevel]} hover:border-slate-200 hover:shadow-sm`
                }`}
            >
              {/* Rank */}
              <span className={`text-sm w-5 text-center flex-shrink-0 ${rankColor(i)}`}>{i + 1}</span>

              {/* Order ID */}
              <span className="text-sm font-semibold text-slate-800 w-14 flex-shrink-0">{order.Order_ID}</span>

              {/* Customer */}
              <span className="text-xs text-slate-500 flex-1 truncate">{order.Customer}</span>

              {/* Badge */}
              <RiskBadge level={order.riskLevel} />

              {/* Score */}
              <span className="text-sm font-bold text-slate-700 w-8 text-right flex-shrink-0">{order.riskScore}</span>

              <TbChevronRight className="text-slate-300 flex-shrink-0" />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
