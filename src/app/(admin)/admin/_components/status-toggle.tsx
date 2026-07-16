"use client";

import { useState } from "react";
import { toggleKosActive } from "@/features/admin/actions";

interface StatusToggleProps {
  kosId: number | string;
  initialStatus: boolean;
}

export function StatusToggle({ kosId, initialStatus }: StatusToggleProps) {
  const [isActive, setIsActive] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await toggleKosActive(kosId, isActive);
      setIsActive(!isActive);
    } catch (err) {
      alert("Gagal mengubah status aktifasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
        isActive ? "bg-purple-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          isActive ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}