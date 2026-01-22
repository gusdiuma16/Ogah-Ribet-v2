import React, { useEffect, useState } from 'react';
import { getMapLocations } from '../services/mockDataService';
import { MapLocation } from '../types';
import DistributionMap from '../components/DistributionMap';
import { MapPin } from 'lucide-react';

const MapPage: React.FC = () => {
  const [locations, setLocations] = useState<MapLocation[]>([]);

  useEffect(() => {
    getMapLocations().then(setLocations);
  }, []);

  return (
    <div className="pt-20 min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-xs font-bold mb-3 uppercase tracking-wider">
            <MapPin size={14} /> Jejak Kebaikan
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Peta Sebaran Bantuan</h1>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            Melihat lebih dekat di mana amanah Anda kami salurkan. Transparansi lokasi untuk dampak yang nyata.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 h-[600px] relative">
           <DistributionMap locations={locations} />
           
           {/* Floating Info Panel */}
           <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100 max-w-xs hidden md:block">
              <h4 className="font-bold text-gray-900 mb-2">Aktivitas Terkini</h4>
              <ul className="space-y-3">
                 {locations.slice(0, 3).map(loc => (
                    <li key={loc.id} className="text-sm">
                       <div className="font-semibold text-purple-600 text-xs">{loc.programBatch}</div>
                       <div className="text-gray-800">{loc.title}</div>
                    </li>
                 ))}
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;