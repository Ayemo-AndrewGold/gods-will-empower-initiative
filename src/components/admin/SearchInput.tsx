// components/admin/SearchInput.tsx
"use client";

import React from "react";
import { Search } from "lucide-react";

export default function SearchInput() {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Search size={16} />
      </span>
      <input
        type="search"
        placeholder="Search customers, loans or IDs..."
        className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent bg-white"
      />
    </div>
  );
}
