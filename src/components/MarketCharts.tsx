import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mockData = [
  { date: '06/03', merval: 1200000, dolarBlue: 1200, dolarMep: 1180, dolarCcl: 1210, oro: 85000 },
  { date: '07/03', merval: 1210000, dolarBlue: 1205, dolarMep: 1185, dolarCcl: 1215, oro: 85500 },
  { date: '08/03', merval: 1205000, dolarBlue: 1210, dolarMep: 1190, dolarCcl: 1220, oro: 86000 },
  { date: '09/03', merval: 1220000, dolarBlue: 1215, dolarMep: 1195, dolarCcl: 1225, oro: 86500 },
  { date: '10/03', merval: 1230000, dolarBlue: 1220, dolarMep: 1200, dolarCcl: 1230, oro: 87000 },
  { date: '11/03', merval: 1225000, dolarBlue: 1225, dolarMep: 1205, dolarCcl: 1235, oro: 87500 },
  { date: '12/03', merval: 1240000, dolarBlue: 1230, dolarMep: 1210, dolarCcl: 1240, oro: 88000 },
];

export const MarketCharts: React.FC = () => {
  return (
    <div className="bg-white/5 p-4 rounded-xl border border-white/10 mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">Evolución últimos 7 días</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis yAxisId="left" stroke="#94a3b8" />
            <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }}
              itemStyle={{ fontSize: '12px' }}
            />
            <Legend />
            <Bar yAxisId="right" dataKey="merval" fill="#3b82f6" name="Merval" fillOpacity={0.3} radius={[4, 4, 0, 0]} />
            <Line yAxisId="left" type="monotone" dataKey="dolarBlue" stroke="#ef4444" name="Blue" strokeWidth={2} dot={{ r: 4 }} />
            <Line yAxisId="left" type="monotone" dataKey="dolarMep" stroke="#10b981" name="MEP" strokeWidth={2} dot={{ r: 4 }} />
            <Line yAxisId="left" type="monotone" dataKey="dolarCcl" stroke="#f59e0b" name="CCL" strokeWidth={2} dot={{ r: 4 }} />
            <Line yAxisId="left" type="monotone" dataKey="oro" stroke="#eab308" name="Oro" strokeWidth={2} dot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
