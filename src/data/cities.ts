/**
 * cities.ts
 * 
 * Coordinates for major Cypriot cities used as fallback origins
 * when geolocation is unavailable.
 */

import type { LatLng } from '../types';

export const CITY_COORDS: Record<string, LatLng> = {
  Nicosia: { lat: 35.1856, lng: 33.3823 },
  Limassol: { lat: 34.6823, lng: 33.0464 },
  Larnaca: { lat: 34.9229, lng: 33.6233 },
  Paphos: { lat: 34.7754, lng: 32.4245 },
};

export const CITIES = Object.keys(CITY_COORDS) as Array<keyof typeof CITY_COORDS>;

