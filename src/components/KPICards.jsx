import React from 'react';
import {
  TbPackage, TbAlertTriangle, TbAlertCircle, TbCircleCheck,
  TbTargetArrow, TbTruck, TbBoxOff, TbCreditCardOff,
} from 'react-icons/tb';

const KPICard = ({ icon: Icon, label, value, sub, color, bgColor, borderColor }) => (
  <div className={`card flex items-start gap-4 border-l-4 ${borderColor}`}>
    <div className={`w-11 h-11 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`text-xl ${color}`} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-0.5 leading-tight">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default function KPICards({ orders }) {
  if (!orders || orders.length === 0) return null;

  const total = orders.length;
  const high = orders.filter((o) => o.riskLevel === 'High').length;
  const medium = orders.filter((o) => o.riskLevel === 'Medium').length;
  const low = orders.filter((o) => o.riskLevel === 'Low').length;
  const avgScore = Math.round(orders.reduce((s, o) => s + o.riskScore, 0) / total);
  const onTime = orders.filter((o) => o.daysUntilDelivery > 2).length;
  const onTimePct = Math.round((onTime / total) * 100);
  const inventoryShortage = orders.filter((o) => o.stockShortage).length;
  const creditRisk = orders.filter((o) => o.riskFactors?.some((f) => f.type === 'credit')).length;

  const kpis = [
    {
      icon: TbPackage,
      label: 'Total Orders',
      value: total,
      sub: 'Loaded from CSV',
      color: 'text-brand-600',
      bgColor: 'bg-brand-50',
      borderColor: 'border-brand-500',
    },
    {
      icon: TbAlertTriangle,
      label: 'High Risk',
      value: high,
      sub: `${Math.round((high / total) * 100)}% of orders`,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
    },
    {
      icon: TbAlertCircle,
      label: 'Medium Risk',
      value: medium,
      sub: `${Math.round((medium / total) * 100)}% of orders`,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-500',
    },
    {
      icon: TbCircleCheck,
      label: 'Low Risk',
      value: low,
      sub: `${Math.round((low / total) * 100)}% of orders`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
    },
    {
      icon: TbTargetArrow,
      label: 'Avg Risk Score',
      value: avgScore,
      sub: 'Across all orders',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-500',
    },
    {
      icon: TbTruck,
      label: 'On-Time Orders',
      value: `${onTimePct}%`,
      sub: `${onTime} of ${total} not urgent`,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-500',
    },
    {
      icon: TbBoxOff,
      label: 'Inventory Shortage',
      value: inventoryShortage,
      sub: 'Orders with stock gap',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-500',
    },
    {
      icon: TbCreditCardOff,
      label: 'Credit Risk',
      value: creditRisk,
      sub: 'Over 95% utilization',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <KPICard key={kpi.label} {...kpi} />
      ))}
    </div>
  );
}
