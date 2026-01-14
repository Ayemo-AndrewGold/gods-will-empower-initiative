"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export default function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm border">
      <CardContent className="p-1 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h2 className="text-2xl font-bold mt-1">{value}</h2>
        </div>
        <div
          className={`text-sm rounded-full ${color} bg-opacity-10 flex items-center justify-center`}
        >
          
        </div>
      </CardContent>
    </Card>
  );
}
