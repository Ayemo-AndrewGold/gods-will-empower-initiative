"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({ title, value, icon: Icon, color }) {
  return (
    <Card className="rounded-2xl shadow-sm border">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h2 className="text-2xl font-bold mt-1">{value}</h2>
        </div>

        <div
          className={`p-3 rounded-full ${color} bg-opacity-10 flex items-center justify-center`}
        >
          <Icon className="w-2 h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
