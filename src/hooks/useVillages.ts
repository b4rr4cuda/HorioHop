/**
 * useVillages.ts
 * 
 * Hook for loading and managing village data.
 * Currently loads from static JSON file, but structured for future API integration.
 * Used throughout the app to access village information.
 */

import { useState, useEffect } from 'react';
import villagesData from '../data/villages.json';
import type { Village } from '../types';

export function useVillages() {
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setVillages(villagesData as Village[]);
    } catch (error) {
      console.error('[useVillages] Failed to load villages:', error);
      setVillages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { villages, loading };
}
