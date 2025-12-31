"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const data = [
  {
    month: "Jan",
    disbursed: 3200000,
    repaid: 2800000,
    outstanding: 400000,
    profit: 420000,
    overdue: 3,
  },
  {
    month: "Feb",
    disbursed: 2900000,
    repaid: 2500000,
    outstanding: 600000,
    profit: 380000,
    overdue: 5,
  },
  {
    month: "Mar",
    disbursed: 3600000,
    repaid: 3100000,
    outstanding: 500000,
    profit: 450000,
    overdue: 4,
  },
  {
    month: "Apr",
    disbursed: 3000000,
    repaid: 2600000,
    outstanding: 400000,
    profit: 400000,
    overdue: 2,
  },
  {
    month: "May",
    disbursed: 4100000,
    repaid: 3500000,
    outstanding: 600000,
    profit: 520000,
    overdue: 6,
  },
  {
    month: "Jun",
    disbursed: 3800000,
    repaid: 3000000,
    outstanding: 800000,
    profit: 480000,
    overdue: 7,
  },
];

export default function MonthlyChart() {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          {/* X-axis */}
          <XAxis dataKey="month" />

          {/* Left axis → money values */}
          <YAxis
            yAxisId="left"
            tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}m`}
          />

          {/* Right axis → overdue count */}
          <YAxis yAxisId="right" orientation="right" />

          <Tooltip
            formatter={(value, name) => {
              if (name === "overdue") return [value, "Overdue Loans"];
              if (name === "profit") return [`₦${value.toLocaleString()}`, "Profit"];
              return [`₦${value.toLocaleString()}`, name];
            }}
          />

          <Legend />

          {/* Bars */}
          <Bar
            yAxisId="left"
            dataKey="disbursed"
            name="Amount Disbursed"
            barSize={20}
          />
          <Bar
            yAxisId="left"
            dataKey="repaid"
            name="Amount Repaid"
            barSize={20}
          />
          <Bar
            yAxisId="left"
            dataKey="outstanding"
            name="Outstanding Balance"
            barSize={20}
          />

          {/* Lines */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="overdue"
            name="Overdue Loans"
            strokeWidth={2}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="profit"
            name="Profit"
            strokeWidth={2}
            strokeDasharray="4 2"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
