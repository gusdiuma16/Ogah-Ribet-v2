import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapLocation } from '../types';

interface DistributionMapProps {
  locations: MapLocation[];
}

const DistributionMap: React.FC<DistributionMapProps> = ({ locations }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapContainer.current && !mapInstance.current) {
      // Default to Jakarta view
      const map = L.map(mapContainer.current).setView([-6.2088, 106.8456], 10);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      mapInstance.current = map;
    }

    // Update markers when locations change
    if (mapInstance.current) {
      // Clear existing layers (except tiles)
      mapInstance.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapInstance.current?.removeLayer(layer);
        }
      });

      // Custom Icon
      const customIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      // Add markers
      const bounds = L.latLngBounds([]);
      let hasMarkers = false;

      locations.forEach(loc => {
        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon })
          .addTo(mapInstance.current!)
          .bindPopup(`
            <div class="p-1">
              <h3 class="text-sm font-bold text-gray-900">${loc.title}</h3>
              <div class="text-xs text-purple-600 font-semibold mb-1">${loc.programBatch}</div>
              <p class="text-xs text-gray-600 leading-snug">${loc.description}</p>
            </div>
          `);
        
        bounds.extend([loc.lat, loc.lng]);
        hasMarkers = true;
      });

      if (hasMarkers) {
        mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
    
    // Cleanup on unmount
    return () => {
        // We generally keep the map instance alive or clean it carefully to avoid context loss issues in SPA
    };
  }, [locations]);

  return <div ref={mapContainer} className="w-full h-full min-h-[400px] z-0" />;
};

export default DistributionMap;