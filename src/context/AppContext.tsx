/**
 * AppContext.tsx
 * 
 * Single source of truth for all application state.
 * Consolidates user location, village selection, routes, and demand counts.
 * 
 * Philosophy: One context, one reducer pattern. No prop drilling beyond 2 levels.
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { planJourney } from '../lib/routing';
import { getAllDemandCounts, addDemand, getDemandCountForVillage, prepopulateDemands } from '../lib/demand';
import { DEBUG_MODE } from '../config';
import villagesData from '../data/villages.json';
import type { Village } from '../types';
import type { LatLng, Itinerary } from '../types';
import type { DemandRecord } from '../lib/demand';

interface AppState {
  // View mode
  currentView: 'map' | 'data';

  // User location
  userLocation: LatLng | null;
  locationLoading: boolean;
  locationError: string | null;
  selectedCity: string | null;

  // Village selection
  selectedVillage: Village | null;
  sidebarOpen: boolean;

  // Routes
  routesToVillage: Itinerary[];
  routesFromVillage: Itinerary[];
  routesLoading: boolean;
  routesError: string | null;
  selectedRoute: { direction: 'to' | 'from'; index: number } | null;

  // Demand
  demandCounts: Record<string, number>;
  demandModalOpen: boolean;
}

interface AppContextType extends AppState {
  // Actions
  setCurrentView: (view: 'map' | 'data') => void;
  setSelectedCity: (city: string | null) => void;
  setSelectedVillage: (village: Village | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedRoute: (route: { direction: 'to' | 'from'; index: number } | null) => void;
  setDemandModalOpen: (open: boolean) => void;
  submitDemand: (record: Omit<DemandRecord, 'id' | 'createdAt'>) => DemandRecord;
  // Aliases for backward compatibility
  loadingRoutes: boolean;
}

const CITY_COORDS: Record<string, LatLng> = {
  Nicosia: { lat: 35.1856, lng: 33.3823 },
  Limassol: { lat: 34.6823, lng: 33.0464 },
  Larnaca: { lat: 34.9229, lng: 33.6233 },
  Paphos: { lat: 34.7754, lng: 32.4245 },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentView: 'map',
    userLocation: null,
    locationLoading: true,
    locationError: null,
    selectedCity: null,
    selectedVillage: null,
    sidebarOpen: false,
    routesToVillage: [],
    routesFromVillage: [],
    routesLoading: false,
    routesError: null,
    selectedRoute: null,
    demandCounts: {},
    demandModalOpen: false,
  });

  // Request geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setState((prev) => ({
            ...prev,
            userLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            locationLoading: false,
            locationError: null,
          }));
        },
        (err) => {
          setState((prev) => ({
            ...prev,
            locationLoading: false,
            locationError: err.message,
          }));
        }
      );
    } else {
      setState((prev) => ({
        ...prev,
        locationLoading: false,
        locationError: 'Geolocation not supported',
      }));
    }
  }, []);

  // Auto-fetch routes when village is selected and origin is available
  useEffect(() => {
    if (!state.selectedVillage || (!state.userLocation && !state.selectedCity)) {
      setState((prev) => ({
        ...prev,
        routesToVillage: [],
        routesFromVillage: [],
      }));
      return;
    }

    const origin = state.userLocation || (state.selectedCity ? CITY_COORDS[state.selectedCity] : null);
    if (!origin) return;

    const fetchRoutes = async () => {
      setState((prev) => ({ ...prev, routesLoading: true, routesError: null }));

      try {
        const now = new Date();
        const [routesTo, routesFrom] = await Promise.all([
          planJourney(origin, { lat: state.selectedVillage!.lat, lng: state.selectedVillage!.lng }, now),
          planJourney(
            { lat: state.selectedVillage!.lat, lng: state.selectedVillage!.lng },
            origin,
            now
          ),
        ]);

        setState((prev) => ({
          ...prev,
          routesToVillage: routesTo,
          routesFromVillage: routesFrom,
          routesLoading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          routesLoading: false,
          routesError: err instanceof Error ? err.message : 'Failed to fetch routes',
          routesToVillage: [],
          routesFromVillage: [],
        }));
      }
    };

    fetchRoutes();
  }, [state.selectedVillage, state.userLocation, state.selectedCity]);

  // Prepopulate demand data and initialize demand counts from localStorage on mount
  useEffect(() => {
    // Prepopulate with random demand data for all villages (only in debug mode)
    // Force prepopulation to overwrite existing data in debug mode
    if (DEBUG_MODE) {
      const villageIds = (villagesData as Village[]).map((v) => v.id);
      prepopulateDemands(villageIds, true); // Force = true to always prepopulate in debug mode
    }
    
    // Load existing demand counts
    const counts = getAllDemandCounts();
    setState((prev) => ({ ...prev, demandCounts: counts }));
  }, []);

  // Update demand count when village changes
  useEffect(() => {
    if (!state.selectedVillage) return;

    const count = getDemandCountForVillage(state.selectedVillage.id);
    setState((prev) => ({
      ...prev,
      demandCounts: { ...prev.demandCounts, [state.selectedVillage!.id]: count },
    }));
  }, [state.selectedVillage]);

  const setSelectedCity = useCallback((city: string | null) => {
    setState((prev) => ({ ...prev, selectedCity: city }));
  }, []);

  const setCurrentView = useCallback((view: 'map' | 'data') => {
    setState((prev) => ({ ...prev, currentView: view }));
  }, []);

  const setSelectedVillage = useCallback((village: Village | null) => {
    setState((prev) => ({
      ...prev,
      selectedVillage: village,
      sidebarOpen: village !== null,
      selectedRoute: null,
    }));
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setState((prev) => ({ ...prev, sidebarOpen: open }));
  }, []);

  const setSelectedRoute = useCallback((route: { direction: 'to' | 'from'; index: number } | null) => {
    setState((prev) => ({
      ...prev,
      selectedRoute: route,
    }));
  }, []);

  const setDemandModalOpen = useCallback((open: boolean) => {
    setState((prev) => ({ ...prev, demandModalOpen: open }));
  }, []);

  const submitDemand = useCallback((
    record: Omit<DemandRecord, 'id' | 'createdAt'>
  ) => {
    const fullRecord = addDemand(record);
    // Optimistically update count
    setState((prev) => ({
      ...prev,
      demandCounts: {
        ...prev.demandCounts,
        [record.villageId]: (prev.demandCounts[record.villageId] || 0) + 1,
      },
    }));
    return fullRecord;
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        loadingRoutes: state.routesLoading, // Alias for backward compatibility
        setCurrentView,
        setSelectedCity,
        setSelectedVillage,
        setSidebarOpen,
        setSelectedRoute,
        setDemandModalOpen,
        submitDemand,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Alias for backward compatibility during migration
// eslint-disable-next-line react-refresh/only-export-components
export const useSelectionContext = useAppContext;
