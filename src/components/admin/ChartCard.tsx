// components/ui/ChartCard.tsx
import React from "react";

export default function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="w-full h-[250px]">{children}</div>
    </div>
  );
}
