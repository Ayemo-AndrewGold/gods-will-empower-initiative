"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Modern green color palette for finance dashboards
const COLORS = ["#16a34a", "#4ade80", "#86efac"];

// Updated official loan product dataset
const data = [
  { 
    name: "Monthly Loan (Individual)", 
    value: 25,
    tenure: "Up to 6 months",
    interest: "25%"
  },
  { 
    name: "Weekly Loan (Group Loan)", 
    value: 27,
    tenure: "Up to 24 weeks",
    interest: "27%"
  },
  { 
    name: "Daily Loan (Indv/Group)", 
    value: 18,
    tenure: "Up to 20 days",
    interest: "18%"
  },
];

export default function ProductPieChart() {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey="value"
            data={data}
            outerRadius={90}
            label={({ name }) => name}
          >
            {data.map((entry, index) => (
              <Cell 
                key={index} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>

          <Tooltip 
            formatter={(value, name, props: any) => [
              `${value}% interest`,
              props.payload.name,
            ]}
            contentStyle={{
              borderRadius: "8px",
              padding: "10px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
