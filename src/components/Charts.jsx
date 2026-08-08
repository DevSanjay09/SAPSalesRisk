import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = {
  High:   '#ef4444',
  Medium: '#f59e0b',
  Low:    '#22c55e',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-card px-3 py-2 text-sm">
        <p className="font-semibold text-slate-700">{label || payload[0]?.name}</p>
        <p className="text-brand-600">{payload[0]?.value} orders</p>
      </div>
    );
  }
  return null;
};

const ScoreTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-card px-3 py-2 text-sm">
        <p className="font-semibold text-slate-700">{payload[0]?.payload?.Order_ID}</p>
        <p className="text-slate-600">Score: <span className="font-bold text-brand-600">{payload[0]?.value}</span></p>
        <p className="text-slate-400 text-xs">{payload[0]?.payload?.riskLevel} Risk</p>
      </div>
    );
  }
  return null;
};

export default function Charts({ orders }) {
  if (!orders || orders.length === 0) return null;

  // Bar chart — risk distribution
  const distData = [
    { name: 'High', count: orders.filter((o) => o.riskLevel === 'High').length },
    { name: 'Medium', count: orders.filter((o) => o.riskLevel === 'Medium').length },
    { name: 'Low', count: orders.filter((o) => o.riskLevel === 'Low').length },
  ];

  // Pie chart — score per order
  const scoreData = orders.map((o) => ({ Order_ID: o.Order_ID, value: o.riskScore, riskLevel: o.riskLevel }));

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
        {name}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Bar Chart */}
      <div className="card">
        <p className="section-title">Risk Distribution</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={distData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={56}>
              {distData.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="card">
        <p className="section-title">Risk Score by Order</p>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={scoreData}
              dataKey="value"
              nameKey="Order_ID"
              cx="50%"
              cy="50%"
              outerRadius={90}
              labelLine={false}
              label={renderCustomLabel}
            >
              {scoreData.map((entry, i) => (
                <Cell key={i} fill={COLORS[entry.riskLevel] || '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip content={<ScoreTooltip />} />
            <Legend
              formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
              iconSize={8}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
