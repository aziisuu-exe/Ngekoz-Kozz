"use client"; 

import { IconPrinter } from "@tabler/icons-react";

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="flex justify-center items-center gap-2 py-3.5 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
    >
      <IconPrinter size={20} /> Cetak
    </button>
  );
}