import React from 'react';
import {
  TbX, TbUser, TbBox, TbCreditCard, TbCalendarEvent,
  TbAlertTriangle, TbCircleCheck,
} from 'react-icons/tb';
import RiskBadge from './RiskBadge';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const ProgressBar = ({ value, max = 100, color = 'bg-brand-500' }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="progress-bar-track mt-1">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

const FactorRow = ({ factor }) => {
  const colors = { stock: 'text-orange-600', credit: 'text-rose-600', urgency: 'text-amber-600' };
  const icons = {
    stock: <TbBox className="text-orange-500" />,
    credit: <TbCreditCard className="text-rose-500" />,
    urgency: <TbCalendarEvent className="text-amber-500" />,
  };
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
      <span className="text-base mt-0.5">{icons[factor.type]}</span>
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${colors[factor.type]}`}>{factor.label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{factor.detail}</p>
      </div>
      <span className="ml-auto text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full flex-shrink-0">
        +{factor.points}
      </span>
    </div>
  );
};

export default function OrderDetails({ order, onClose }) {
  if (!order) return null;

  const credit = order.credit;
  const creditPct = order.creditUtilization;
  const utilColor =
    creditPct === null ? 'bg-slate-300' :
    creditPct > 95 ? 'bg-red-500' :
    creditPct > 80 ? 'bg-amber-500' : 'bg-green-500';

  const stockPct = order.isUnknownItem ? 0 :
    order.availableQty === 'N/A' ? 0 :
    Math.min(100, Math.round((Number(order.availableQty) / order.Qty) * 100));

  const stockColor = order.stockShortage ? 'bg-red-500' : 'bg-green-500';

  return (
    <div className="card panel-slide-in h-full overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{order.Order_ID}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{order.Customer} · {order.Item}</p>
        </div>
        <div className="flex items-center gap-2">
          <RiskBadge level={order.riskLevel} size="lg" />
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg ml-1">
            <TbX className="text-base" />
          </button>
        </div>
      </div>

      {/* Score callout */}
      <div className={`rounded-xl p-4 mb-5 flex items-center gap-4 ${
        order.riskLevel === 'High' ? 'bg-red-50 border border-red-200' :
        order.riskLevel === 'Medium' ? 'bg-amber-50 border border-amber-200' :
        'bg-green-50 border border-green-200'
      }`}>
        {order.riskLevel === 'Low'
          ? <TbCircleCheck className="text-3xl text-green-500 flex-shrink-0" />
          : <TbAlertTriangle className={`text-3xl flex-shrink-0 ${order.riskLevel === 'High' ? 'text-red-500' : 'text-amber-500'}`} />
        }
        <div>
          <p className="text-sm text-slate-600">Risk Score</p>
          <p className={`text-3xl font-black ${
            order.riskLevel === 'High' ? 'text-red-600' :
            order.riskLevel === 'Medium' ? 'text-amber-600' : 'text-green-600'
          }`}>{order.riskScore}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-slate-500">Delivery</p>
          <p className="text-sm font-semibold text-slate-700">{order.Delivery_Date}</p>
          <p className="text-xs text-slate-500">
            {order.daysUntilDelivery < 0 ? `${Math.abs(order.daysUntilDelivery)}d overdue` :
             order.daysUntilDelivery === 0 ? 'Due today' :
             `${order.daysUntilDelivery} days left`}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Inventory */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1">
            <TbBox className="text-slate-500 text-sm" />
            <p className="text-xs text-slate-500 font-medium">Inventory</p>
          </div>
          <p className="text-sm font-semibold text-slate-800">
            {order.availableQty === 'N/A' ? 'Item not found' : `${order.availableQty} available`}
          </p>
          <p className="text-xs text-slate-400">Need: {order.Qty}</p>
          <ProgressBar value={stockPct} color={stockColor} />
          {order.stockShortage && (
            <p className="text-xs text-red-500 mt-1 font-medium">
              Short by {Number(order.Qty) - (Number(order.availableQty) || 0)} units
            </p>
          )}
        </div>

        {/* Credit */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1">
            <TbCreditCard className="text-slate-500 text-sm" />
            <p className="text-xs text-slate-500 font-medium">Credit</p>
          </div>
          {credit ? (
            <>
              <p className="text-sm font-semibold text-slate-800">{creditPct?.toFixed(1)}% utilized</p>
              <p className="text-xs text-slate-400">{formatCurrency(Number(credit.Outstanding))} / {formatCurrency(Number(credit.Credit_Limit))}</p>
              <ProgressBar value={creditPct} color={utilColor} />
            </>
          ) : (
            <p className="text-xs text-rose-500 font-medium mt-1">Customer not in credit data</p>
          )}
        </div>
      </div>

      {/* Risk Factors */}
      {order.riskFactors?.length > 0 && (
        <div className="mb-5">
          <p className="section-title">Risk Factors</p>
          <div className="space-y-2">
            {order.riskFactors.map((f, i) => <FactorRow key={i} factor={f} />)}
          </div>
        </div>
      )}

      {/* Order info */}
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <TbUser className="text-slate-400" />
          <span>Customer: <span className="font-medium text-slate-700">{order.Customer}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <TbBox className="text-slate-400" />
          <span>Item: <span className="font-medium text-slate-700">{order.Item} × {order.Qty}</span></span>
        </div>
      </div>
    </div>
  );
}
