import React from 'react';
import { TbChevronRight } from 'react-icons/tb';
import RiskBadge from './RiskBadge';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const scoreColor = (score) =>
  score >= 61 ? 'text-red-600 font-bold' : score >= 21 ? 'text-amber-600 font-semibold' : 'text-green-600 font-semibold';

export default function OrderTable({ orders, selectedId, onSelect }) {
  if (!orders || orders.length === 0) return null;

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <p className="section-title mb-0">All Orders</p>
        <span className="text-xs text-slate-400">{orders.length} orders — click any row for details</span>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr>
              <th className="table-th">Order ID</th>
              <th className="table-th">Customer</th>
              <th className="table-th">Item</th>
              <th className="table-th text-right">Qty</th>
              <th className="table-th text-right">Value</th>
              <th className="table-th text-center">Score</th>
              <th className="table-th text-center">Risk Level</th>
              <th className="table-th">Delivery</th>
              <th className="table-th">Primary Action</th>
              <th className="table-th w-8"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.Order_ID}
                onClick={() => onSelect(order)}
                className={`cursor-pointer transition-colors duration-100
                  ${selectedId === order.Order_ID
                    ? 'bg-brand-50'
                    : 'hover:bg-slate-50'
                  }`}
              >
                <td className="table-td font-semibold text-brand-700">{order.Order_ID}</td>
                <td className="table-td">
                  <span className={order.isUnknownCustomer ? 'text-rose-600 italic' : ''}>
                    {order.isUnknownCustomer ? 'Unknown Customer' : order.Customer}
                  </span>
                </td>
                <td className="table-td">
                  <span className={order.isUnknownItem ? 'text-rose-600 italic' : ''}>
                    {order.isUnknownItem ? 'Unknown Item' : order.Item}
                  </span>
                </td>
                <td className="table-td text-right">{order.Qty}</td>
                <td className="table-td text-right text-slate-600">{formatCurrency(order.Order_Value)}</td>
                <td className={`table-td text-center text-sm ${scoreColor(order.riskScore)}`}>{order.riskScore}</td>
                <td className="table-td text-center">
                  <RiskBadge level={order.riskLevel} />
                </td>
                <td className="table-td text-xs">
                  {order.Delivery_Date}
                  {order.daysUntilDelivery <= 2 && (
                    <span className="ml-1 text-red-500 font-medium">
                      ({order.daysUntilDelivery < 0 ? 'Overdue' : order.daysUntilDelivery === 0 ? 'Today' : `${order.daysUntilDelivery}d`})
                    </span>
                  )}
                </td>
                <td className="table-td text-xs text-slate-500 max-w-[160px] truncate">
                  {order.riskFactors?.length > 0
                    ? order.riskFactors[0].type === 'stock'
                      ? 'Expedite Procurement'
                      : order.riskFactors[0].type === 'credit'
                      ? 'Finance Approval'
                      : 'Prioritize Picking'
                    : '—'}
                </td>
                <td className="table-td">
                  <TbChevronRight className="text-slate-300 text-base" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
