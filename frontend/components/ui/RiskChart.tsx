'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function RiskChart({ data }: { data: Array<{ label: string; value: number }> }) {
  if (!data.length) return null;
  return (
    <div className="chart-wrap" role="img" aria-label="Backend-reported risk distribution">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 2 }}>
          <CartesianGrid stroke="#e7ddce" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#867461', fontSize: 9 }} axisLine={{ stroke: '#d9cbb8' }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: '#968573', fontSize: 8 }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: 'rgba(217,203,184,.2)' }} contentStyle={{ border: '1px solid #cfc0ab', borderRadius: 7, background: '#fffaf1', color: '#49382b', fontSize: 10 }} />
          <Bar dataKey="value" fill="#66856a" radius={[4, 4, 0, 0]} maxBarSize={34} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
