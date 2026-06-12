import { IconAlertCircle } from "@tabler/icons-react";

interface Aturan {
  id: number;
  nama_aturan: string;
}

interface KosRulesProps {
  aturan: Aturan[];
}

export function KosRules({ aturan }: KosRulesProps) {
  if (!aturan || aturan.length === 0) return null;

  return (
    <section className="py-8 border-b border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Aturan Kos</h2>
      
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
        {aturan.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <IconAlertCircle 
              size={22} 
              className="text-orange-500 flex-shrink-0 mt-0.5" 
            />
            <span className="text-gray-700 leading-relaxed">
              {item.nama_aturan}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}