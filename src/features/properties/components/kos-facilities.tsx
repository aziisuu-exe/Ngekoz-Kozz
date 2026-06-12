import { 
    IconWifi, 
    IconAirConditioning, 
    IconBed, 
    IconBath, 
    IconParking, 
    IconDeviceTv, 
    IconWashMachine, 
    IconCheck,
    IconSofa,
    IconToolsKitchen2
  } from "@tabler/icons-react";
  
  interface Fasilitas {
    id: number;
    nama_fasilitas: string;
    icon: string | null;
  }
  
  interface KosFacilitiesProps {
    fasilitas: Fasilitas[];
  }
  
  const ICON_RULES = [
    { keywords: ["wifi", "internet"], icon: IconWifi },
    { keywords: ["ac", "air condition"], icon: IconAirConditioning }, 
    { keywords: ["kasur", "bed", "ranjang"], icon: IconBed },
    { keywords: ["mandi", "bath", "wc", "air panas"], icon: IconBath }, 
    { keywords: ["parkir", "parking"], icon: IconParking },
    { keywords: ["tv", "televisi"], icon: IconDeviceTv },
    { keywords: ["cuci", "laundry", "mesin"], icon: IconWashMachine },
    { keywords: ["dapur", "kitchen"], icon: IconToolsKitchen2 },
    { keywords: ["ruang", "sofa", "tamu"], icon: IconSofa },
  ];
  
  export function KosFacilities({ fasilitas }: KosFacilitiesProps) {
    if (!fasilitas || fasilitas.length === 0) return null;
  
    const renderIcon = (iconName: string | null, namaFasilitas: string) => {
      const searchString = `${iconName || ""} ${namaFasilitas}`.toLowerCase();
      const rule = ICON_RULES.find((r) => 
        r.keywords.some((keyword) => searchString.includes(keyword))
      );

      const IconComponent = rule ? rule.icon : IconCheck;
  
      return <IconComponent size={28} className="text-purple-600" />;
    };
  
    return (
      <section className="py-8 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Fasilitas Kos</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
          {fasilitas.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                {renderIcon(item.icon, item.nama_fasilitas)}
              </div>
              <span className="font-medium text-gray-700">{item.nama_fasilitas}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }