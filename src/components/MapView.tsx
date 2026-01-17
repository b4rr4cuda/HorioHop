/**
 * MapView.tsx
 * 
 * Full-screen Leaflet map displaying village markers.
 * All villages show as amber status. Transport availability is determined by Motis routing results.
 */

import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ItineraryPolylines } from './ItineraryPolylines';
import { UserLocationMarker } from './UserLocationMarker';
import { VillageMarker } from './VillageMarker';
import { useAppContext } from '../context/AppContext';
import { useResponsive } from '../hooks/useResponsive';
import { useVillages } from '../hooks/useVillages';
import type { Village } from '../types';

function MapAdjuster() {
  const { selectedVillage } = useAppContext();
  const { isDesktop } = useResponsive();
  const map = useMap();

  useEffect(() => {
    if (isDesktop) {
      const mapContainer = map.getContainer().parentElement;
      if (mapContainer) {
        if (selectedVillage) {
          mapContainer.style.width = 'calc(100% - 420px)';
          mapContainer.style.transition = 'width 300ms ease-out';
        } else {
          mapContainer.style.width = '100%';
        }
      }
      // Trigger resize to update map bounds
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }
  }, [selectedVillage, isDesktop, map]);

  return null;
}

export function MapView() {
  const { villages, loading } = useVillages();
  const { setSelectedVillage, userLocation } = useAppContext();

  const handleVillageClick = (village: Village) => {
    setSelectedVillage(village);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-slate-600">Loading villages...</div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen pt-16">
      <MapContainer
        center={[34.94, 32.87]}
        zoom={11}
        style={{ 
          height: 'calc(100vh - 4rem)', 
          width: '100%',
          zIndex: 0
        }}
        zoomControl={true}
      >
        <MapAdjuster />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {villages.map((village) => {
          // All villages show amber status (unknown) - transport availability determined by Motis
          return (
            <VillageMarker
              key={village.id}
              village={village}
              status="amber"
              onClick={() => handleVillageClick(village)}
            />
          );
        })}
        {userLocation && <UserLocationMarker location={userLocation} />}
        <ItineraryPolylines />
      </MapContainer>

      {/* Development Notice - Permanent Popup */}
      <div className="absolute bottom-4 left-4 z-30 max-w-sm">
        <div className="bg-green-50 border-2 border-green-400 rounded-lg shadow-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1 text-sm">
              <p className="font-semibold text-green-900 mb-2">Development Notice</p>
              <ul className="space-y-1 text-green-800 text-xs list-disc list-inside">
                <li>
                  Details such as telephone numbers, taxi company names, and shuttle names are
                  fictional and for demonstration purposes only.
                </li>
                <li>
                  Information about villages and population may be inaccurate.
                </li>
                <li>
                  Bus data is pulled from GTFS datasets available on{' '}
                  <a
                    href="https://data.gov.cy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-green-900"
                  >
                    data.gov.cy
                  </a>
                  .
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
