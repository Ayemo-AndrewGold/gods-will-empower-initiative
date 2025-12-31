"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#32CD32", "#FF4D4D"]; // green = profit, red = loss

// Example: Replace with real backend values
const totalProfit = 2300000; // interest collected
const totalOutstanding = 1800000;
const overdueAmount = 450000;

const data = [
  { name: "Profit", value: totalProfit },
  {
    name: "Loss Exposure",
    value: totalOutstanding + overdueAmount,
  },
];

export default function ProfitLossChart() {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            outerRadius={100}
            label={(entry) =>
              `${entry.name}: ₦${entry.value.toLocaleString()}`
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index]}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              `₦${value.toLocaleString()}`,
              name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
