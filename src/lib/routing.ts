/**
 * routing.ts
 * 
 * Motis API integration for multi-modal journey planning.
 * Handles communication with the local Motis routing server.
 * Used by AppContext to fetch routes when a village is selected.
 */

import { decodePolyline } from './polyline';
import type { LatLng, Itinerary, Leg } from '../types';

/**
 * Query Motis for journey options between two points.
 * 
 * @param from - Origin coordinates
 * @param to - Destination coordinates
 * @param departureTime - Desired departure time
 * @returns Array of itinerary options, or empty array if no routes found or error occurs
 */
export async function planJourney(
  from: LatLng,
  to: LatLng,
  departureTime: Date
): Promise<Itinerary[]> {
  const params = new URLSearchParams({
    fromPlace: `${from.lat},${from.lng}`,
    toPlace: `${to.lat},${to.lng}`,
    time: departureTime.toISOString(),
    arriveBy: 'false',
    numItineraries: '5',
    pedestrianProfile: 'FOOT',
    detailed: 'true' 
  });

  const url = `/api/v2/plan?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('[routing] Motis API error:', response.status, errorText);
      if (response.status === 404) {
        return [];
      }
      throw new Error(`Motis API error: ${response.status}`);
    }

    const data = await response.json();

    console.log('RAW MOTIS RESPONSE:', JSON.stringify(data, null, 2));

    if (!data.itineraries) {
      return [];
    }

    return data.itineraries.map(parseItinerary);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    console.error('[routing] Failed to fetch routes:', message);
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      return [];
    }
    return [];
  }
}

/**
 * Transform Motis response into our Itinerary format.
 */
function parseItinerary(raw: unknown): Itinerary {
  const rawItinerary = raw as {
    legs: unknown[];
    duration?: number;
    startTime?: string;
    endTime?: string;
    walkDistance?: number;
    transfers?: number;
  };

  const legs: Leg[] = rawItinerary.legs.map((leg: unknown) => {
    const rawLeg = leg as {
      mode?: string;
      from?: { name?: string; lat?: number; lon?: number; stopId?: string };
      to?: { name?: string; lat?: number; lon?: number; stopId?: string };
      startTime?: string;
      departureTime?: string;
      endTime?: string;
      arrivalTime?: string;
      duration?: number;
      distance?: number;
      routeShortName?: string;
      routeLongName?: string;
      agencyName?: string;
      headsign?: string;
      legGeometry?: { points?: string };
    };

    return {
      mode: rawLeg.mode === 'WALK' ? 'WALK' : 'TRANSIT',
      from: {
        name: rawLeg.from?.name || 'Unknown',
        lat: rawLeg.from?.lat || 0,
        lng: rawLeg.from?.lon || 0,
        stopId: rawLeg.from?.stopId,
      },
      to: {
        name: rawLeg.to?.name || 'Unknown',
        lat: rawLeg.to?.lat || 0,
        lng: rawLeg.to?.lon || 0,
        stopId: rawLeg.to?.stopId,
      },
      departureTime: rawLeg.startTime || rawLeg.departureTime || '',
      arrivalTime: rawLeg.endTime || rawLeg.arrivalTime || '',
      duration: rawLeg.duration || 0,
      distance: rawLeg.distance,
      routeShortName: rawLeg.routeShortName,
      routeLongName: rawLeg.routeLongName,
      agencyName: rawLeg.agencyName,
      headsign: rawLeg.headsign,
      polyline: rawLeg.legGeometry?.points
        ? decodePolyline(rawLeg.legGeometry.points)
        : [],
    };
  });

  return {
    duration: rawItinerary.duration || 0,
    startTime: rawItinerary.startTime || '',
    endTime: rawItinerary.endTime || '',
    walkDistance: rawItinerary.walkDistance || 0,
    transfers: rawItinerary.transfers || Math.max(0, legs.filter((l) => l.mode !== 'WALK').length - 1),
    legs,
  };
}
