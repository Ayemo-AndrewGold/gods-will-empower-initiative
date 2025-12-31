// components/ui/StatCard.tsx
import React from "react";

export default function StatCard({ title, value, icon }: { title: string; value: string | number; icon?: React.ReactNode; }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
      <div className="p-3 rounded-lg bg-[#32CD32]/10 text-[#32CD32]">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
