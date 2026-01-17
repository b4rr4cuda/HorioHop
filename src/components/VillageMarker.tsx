/**
 * VillageMarker.tsx
 * 
 * Displays a colored marker on the map for each village.
 * Shows village name, population, and transport status in tooltip/popup.
 * Used in MapView to render all village locations.
 */

import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { Village, TransportStatus } from '../types';

interface VillageMarkerProps {
  village: Village;
  status: TransportStatus;
  onClick: () => void;
}

// Create custom icons for different transport statuses
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: ${color};
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      cursor: pointer;
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const greenIcon = createIcon('#22c55e'); // green-500
const amberIcon = createIcon('#f59e0b'); // amber-500
const redIcon = createIcon('#ef4444'); // red-500

export function VillageMarker({ village, status, onClick }: VillageMarkerProps) {
  const getIcon = () => {
    switch (status) {
      case 'green':
        return greenIcon;
      case 'amber':
        return amberIcon;
      case 'red':
        return redIcon;
      default:
        return amberIcon;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'green':
        return 'Has bus service';
      case 'amber':
        return '';
      case 'red':
        return 'No public transport';
      default:
        return 'Unknown status';
    }
  };

  return (
    <Marker
      position={[village.lat, village.lng]}
      icon={getIcon()}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Tooltip permanent={false} direction="top" offset={[0, -10]}>
        <div className="text-sm font-medium">
          <div className="font-semibold">{village.nameEl}</div>
          <div className="text-xs text-gray-600">{village.nameEn}</div>
          <div className="text-xs text-gray-500">Pop: {village.population}</div>
          {getStatusText() && <div className="text-xs text-gray-500">{getStatusText()}</div>}
        </div>
      </Tooltip>
      <Popup>
        <div className="text-sm">
          <div className="font-semibold">{village.nameEl}</div>
          <div className="text-gray-600">{village.nameEn}</div>
          <div className="mt-2 text-xs text-gray-500">{village.description}</div>
        </div>
      </Popup>
    </Marker>
  );
}
