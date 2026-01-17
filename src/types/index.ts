export interface Village {
  id: string;
  nameEn: string;
  nameEl: string;
  lat: number;
  lng: number;
  district: string;
  population: number;
  description: string;
  attractions: string[];
  nearestHub: string | null;
  hubDistanceKm: number | null;
  taxiContacts: TaxiContact[];
  tourOperators: TourOperator[];
}

export interface TaxiContact {
  name: string;
  phone: string;
  notes?: string;
}

export interface TourOperator {
  name: string;
  price: string;
  description: string;
}

export type TransportStatus = 'green' | 'amber' | 'red';

// Routing types
export interface LatLng {
  lat: number;
  lng: number;
}

export interface Place {
  name: string;
  lat: number;
  lng: number;
  stopId?: string;
}

export interface Leg {
  mode: 'WALK' | 'TRANSIT';
  from: Place;
  to: Place;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  distance?: number;
  routeShortName?: string;
  routeLongName?: string;
  agencyName?: string;
  headsign?: string;
  polyline: [number, number][];
}

export interface Itinerary {
  duration: number;
  startTime: string;
  endTime: string;
  walkDistance: number;
  transfers: number;
  legs: Leg[];
}

export interface PlanResponse {
  itineraries: Itinerary[];
  error?: string;
}

export type JourneyMode = 'idle' | 'selecting-origin' | 'selecting-destination' | 'loading' | 'results' | 'error';

export interface JourneyState {
  mode: JourneyMode;
  origin: LatLng | null;
  destination: LatLng | null;
  destinationName?: string;
  departureTime: Date;
  itineraries: Itinerary[];
  selectedIndex: number | null;
  error?: string;
}

