/**
 * UserLocationMarker.tsx
 * 
 * Displays a blue pulsing marker on the map showing the user's current GPS location.
 * Used in MapView to visualize where the user is located.
 */

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { LatLng } from '../types';

interface UserLocationMarkerProps {
  location: LatLng;
}

const userLocationIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #3b82f6;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    animation: pulse 2s infinite;
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export function UserLocationMarker({ location }: UserLocationMarkerProps) {
  return (
    <Marker position={[location.lat, location.lng]} icon={userLocationIcon}>
      <Popup>
        <div className="text-sm">
          <strong>Your Location</strong>
        </div>
      </Popup>
    </Marker>
  );
}

