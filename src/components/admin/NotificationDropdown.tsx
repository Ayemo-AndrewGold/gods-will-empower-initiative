// components/admin/NotificationDropdown.tsx
"use client";

import React, { useState } from "react";
import { Bell } from "lucide-react";

const mock = [
  { id: 1, title: "Loan #GWM-102 approved", time: "2m ago" },
  { id: 2, title: "Repayment pending approval", time: "1h ago" },
  { id: 3, title: "3 overdue loans detected", time: "Yesterday" },
];

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded hover:bg-gray-100">
        <Bell size={20} />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md z-50 border">
          <div className="p-3 border-b">
            <p className="font-semibold">Notifications</p>
          </div>
          <ul className="max-h-60 overflow-auto">
            {mock.map((n) => (
              <li key={n.id} className="px-3 py-2 hover:bg-gray-50">
                <p className="text-sm">{n.title}</p>
                <p className="text-xs text-gray-400">{n.time}</p>
              </li>
            ))}
          </ul>
          <div className="p-2 text-center border-t">
            <button className="text-sm text-[#32CD32]">View all</button>
          </div>
        </div>
      )}
    </div>
  );
}
