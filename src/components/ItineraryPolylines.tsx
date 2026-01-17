/**
 * ItineraryPolylines.tsx
 * 
 * Renders route polylines and markers on the map for a selected itinerary.
 * Shows origin, destination, transfer points, and route segments.
 * Used in MapView to visualize the selected route path.
 */

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import { Marker, Polyline, Popup, useMap } from 'react-leaflet';
import { useAppContext } from '../context/AppContext';
import { CITY_COORDS } from '../data/cities';

const originPulseIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #22c55e;
    border: 4px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    animation: pulse 2s infinite;
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const destinationPulseIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #ef4444;
    border: 4px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    animation: pulse 2s infinite;
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const transferIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #64748b;
    border: 3px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export function ItineraryPolylines() {
  const map = useMap();
  const {
    selectedRoute,
    routesToVillage,
    routesFromVillage,
    selectedVillage,
    userLocation,
    selectedCity,
  } = useAppContext();

  // Track the last route we fitted bounds for to avoid refitting on re-renders
  const lastFittedRouteRef = useRef<string | null>(null);

  // Derived values
  const origin = userLocation || (selectedCity ? CITY_COORDS[selectedCity] : null);

  // Fit map bounds to show entire itinerary (only when route first selected)
  useEffect(() => {
    if (!selectedRoute || !selectedVillage || !origin) {
      lastFittedRouteRef.current = null;
      return;
    }

    const routeKey = `${selectedRoute.direction}-${selectedRoute.index}`;
    
    // Only fit bounds if this is a new route selection
    if (lastFittedRouteRef.current === routeKey) {
      return;
    }

    const itineraries =
      selectedRoute.direction === 'to' ? routesToVillage : routesFromVillage;
    const itinerary = itineraries[selectedRoute.index];

    if (!itinerary) {
      return;
    }

    // Helper to validate coordinates
    const isValidCoord = (lat: number, lng: number): boolean => {
      return (
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180 &&
        lat !== 0 &&
        lng !== 0 // Exclude 0,0 which is often invalid
      );
    };

    // Build bounds using only origin and destination (most reliable)
    const bounds = L.latLngBounds([]);
    
    if (isValidCoord(origin.lat, origin.lng)) {
      bounds.extend([origin.lat, origin.lng]);
    }
    if (isValidCoord(selectedVillage.lat, selectedVillage.lng)) {
      bounds.extend([selectedVillage.lat, selectedVillage.lng]);
    }

    // Only add a few key points from legs (not all polyline points to avoid invalid coords)
    itinerary.legs.forEach((leg) => {
      if (isValidCoord(leg.from.lat, leg.from.lng)) {
        bounds.extend([leg.from.lat, leg.from.lng]);
      }
      if (isValidCoord(leg.to.lat, leg.to.lng)) {
        bounds.extend([leg.to.lat, leg.to.lng]);
      }
    });

    // Only fit if we have valid bounds
    if (bounds.isValid()) {
      const currentBounds = map.getBounds();
      const currentZoom = map.getZoom();
      
      // Check if route is already visible
      const originVisible = currentBounds.contains([origin.lat, origin.lng]);
      const destVisible = currentBounds.contains([selectedVillage.lat, selectedVillage.lng]);
      const routeVisible = originVisible && destVisible;
      
      // Only fit if route is not visible AND user hasn't zoomed in much
      // If user has zoomed in (zoom > 11), just pan to center without changing zoom
      if (!routeVisible) {
        setTimeout(() => {
          if (currentZoom > 11) {
            // User has zoomed in, just pan to center without changing zoom
            const centerLat = (origin.lat + selectedVillage.lat) / 2;
            const centerLng = (origin.lng + selectedVillage.lng) / 2;
            if (isValidCoord(centerLat, centerLng)) {
              map.panTo([centerLat, centerLng]);
            }
          } else {
            // User hasn't zoomed in much, fit bounds but with constraints
            map.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 12, // Prevent zooming out too much
            });
            // Ensure minimum zoom level
            if (map.getZoom() < 10) {
              map.setZoom(10);
            }
          }
          lastFittedRouteRef.current = routeKey;
        }, 100);
      } else {
        // Route is already visible, don't change anything
        lastFittedRouteRef.current = routeKey;
      }
    }
  }, [selectedRoute, selectedVillage, origin, routesToVillage, routesFromVillage, map]);

  // Early return
  if (!selectedRoute || !selectedVillage || !origin) {
    return null;
  }

  const itineraries =
    selectedRoute.direction === 'to' ? routesToVillage : routesFromVillage;
  const itinerary = itineraries[selectedRoute.index];

  if (!itinerary) {
    return null;
  }

  // Debug: Log itinerary info
  if (process.env.NODE_ENV === 'development') {
    console.log('[ItineraryPolylines] Rendering itinerary:', {
      legs: itinerary.legs.length,
      legsWithPolylines: itinerary.legs.filter((leg) => leg.polyline && leg.polyline.length > 0).length,
    });
  }

  return (
    <>
      <Marker position={[origin.lat, origin.lng]} icon={originPulseIcon}>
        <Popup>
          <div className="text-sm">
            <strong>Origin</strong>
          </div>
        </Popup>
      </Marker>
      <Marker position={[selectedVillage.lat, selectedVillage.lng]} icon={destinationPulseIcon}>
        <Popup>
          <div className="text-sm">
            <strong>{selectedVillage.nameEn}</strong>
          </div>
        </Popup>
      </Marker>
      {itinerary.legs.map((leg, legIndex) => {
        const isWalking = leg.mode === 'WALK';
        const isTransit = leg.mode === 'TRANSIT';

        // Enhanced styling for road-following polylines - bright, visible colors
        const transitColor = '#2563eb'; // Bright blue for transit
        const walkColor = '#475569'; // Dark gray for walking
        const transitShadowColor = '#1e3a8a'; // Darker blue for shadow

        // Helper to validate coordinates (less strict - Cyprus won't have 0,0)
        const isValidCoord = (lat: number, lng: number): boolean => {
          return (
            typeof lat === 'number' &&
            typeof lng === 'number' &&
            !isNaN(lat) &&
            !isNaN(lng) &&
            lat >= 34 && // Cyprus latitude range
            lat <= 36 &&
            lng >= 32 && // Cyprus longitude range
            lng <= 35
          );
        };

        // Check if we have valid from/to coordinates
        const hasValidEndpoints = 
          isValidCoord(leg.from.lat, leg.from.lng) && 
          isValidCoord(leg.to.lat, leg.to.lng);

        if (!hasValidEndpoints) {
          console.warn('[ItineraryPolylines] Invalid endpoints for leg', legIndex, leg);
          return null;
        }

        // Use polyline if available, otherwise fallback to straight line
        let polylinePositions: LatLngTuple[] = [];

        if (leg.polyline && leg.polyline.length > 0) {
          // Use ALL polyline points from Motis - these follow actual roads
          // Filter only obviously invalid coordinates (keep all valid road-following points)
          polylinePositions = leg.polyline
            .filter((point) => {
              const [lat, lng] = point;
              return isValidCoord(lat, lng);
            })
            .map((point) => [point[0], point[1]] as LatLngTuple);

          // Log polyline info in development
          if (process.env.NODE_ENV === 'development' && legIndex === 0) {
            console.log(`[ItineraryPolylines] Leg ${legIndex} (${leg.mode}): ${polylinePositions.length} road-following points`);
          }
        }

        // If no valid polyline points, use fallback straight line
        if (polylinePositions.length === 0) {
          polylinePositions = [
            [leg.from.lat, leg.from.lng],
            [leg.to.lat, leg.to.lng],
          ];
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[ItineraryPolylines] Leg ${legIndex} has no polyline, using straight line fallback`);
          }
        }

        // Ensure we have at least 2 points
        if (polylinePositions.length < 2) {
          console.warn('[ItineraryPolylines] Not enough points for leg', legIndex);
          return null;
        }

        return (
          <div key={legIndex}>
            {isTransit && (
              // Shadow/outline layer for transit routes to make them stand out
              <Polyline
                positions={polylinePositions}
                color={transitShadowColor}
                weight={10}
                opacity={0.4}
                smoothFactor={0} // No smoothing - preserve all road-following points
                lineCap="round"
                lineJoin="round"
                pathOptions={{
                  interactive: false,
                }}
              />
            )}
            <Polyline
              positions={polylinePositions}
              color={isWalking ? walkColor : transitColor}
              weight={isWalking ? 6 : 8}
              dashArray={isWalking ? '10, 5' : undefined}
              opacity={isWalking ? 0.9 : 1.0}
              smoothFactor={0} // No smoothing - use all points to follow roads exactly
              lineCap="round"
              lineJoin="round"
              pathOptions={{
                interactive: true,
              }}
            />
            {legIndex > 0 && legIndex < itinerary.legs.length && (
              <Marker position={[leg.from.lat, leg.from.lng]} icon={transferIcon}>
                <Popup>
                  <div className="text-sm">
                    <strong>Transfer</strong>
                    <br />
                    {leg.from.name}
                  </div>
                </Popup>
              </Marker>
            )}
          </div>
        );
      })}
    </>
  );
}
