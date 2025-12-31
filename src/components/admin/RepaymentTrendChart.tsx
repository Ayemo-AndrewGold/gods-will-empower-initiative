"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Mock dataset (replace with backend values)
const data = [
  { month: "Jan", repaid: 250000 },
  { month: "Feb", repaid: 310000 },
  { month: "Mar", repaid: 280000 },
  { month: "Apr", repaid: 350000 },
  { month: "May", repaid: 420000 },
  { month: "Jun", repaid: 390000 },
  { month: "Jul", repaid: 450000 },
];

export default function RepaymentTrendChart() {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />

          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={(value) => `₦${value.toLocaleString()}`}
            tick={{ fontSize: 12 }}
          />

          <Tooltip
            formatter={(value) => `₦${value.toLocaleString()}`}
          />

          <Line
            type="monotone"
            dataKey="repaid"
            stroke="#008000"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
