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
    icon: string;
  }
  
  interface KosFacilitiesProps {
    fasilitas: Fasilitas[];
  }
  
  export function KosFacilities({ fasilitas }: KosFacilitiesProps) {
    if (!fasilitas || fasilitas.length === 0) return null;
  
    const renderIcon = (iconName: string) => {
      const name = iconName.toLowerCase();
      if (name.includes("wifi") || name.includes("internet")) return <IconWifi size={28} className="text-purple-600" />;
      if (name.includes("ac") || name.includes("air")) return <IconAirConditioning size={28} className="text-purple-600" />;
      if (name.includes("kasur") || name.includes("bed") || name.includes("ranjang")) return <IconBed size={28} className="text-purple-600" />;
      if (name.includes("mandi") || name.includes("bath") || name.includes("wc")) return <IconBath size={28} className="text-purple-600" />;
      if (name.includes("parkir") || name.includes("parking")) return <IconParking size={28} className="text-purple-600" />;
      if (name.includes("tv") || name.includes("televisi")) return <IconDeviceTv size={28} className="text-purple-600" />;
      if (name.includes("cuci") || name.includes("laundry") || name.includes("mesin")) return <IconWashMachine size={28} className="text-purple-600" />;
      if (name.includes("dapur") || name.includes("kitchen")) return <IconToolsKitchen2 size={28} className="text-purple-600" />;
      if (name.includes("ruang") || name.includes("sofa")) return <IconSofa size={28} className="text-purple-600" />;
      
      return <IconCheck size={28} className="text-purple-600" />;
    };
  
    return (
      <section className="py-8 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Fasilitas Kos</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
          {fasilitas.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                {renderIcon(item.icon)}
              </div>
              <span className="font-medium text-gray-700">{item.nama_fasilitas}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }