/**
 * useDemand.ts
 * 
 * Hook for managing shuttle demand data for a specific village.
 * Uses localStorage via demand.ts module to persist and retrieve demand counts.
 * Used in VillageSheet to display and submit shuttle requests.
 */

import { useState, useEffect } from 'react';
import { getDemandCountForVillage, addDemand, getAllDemandCounts } from '../lib/demand';
import type { DemandRecord } from '../lib/demand';

export function useDemand(villageId: string | null) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!villageId) {
      setCount(0);
      setLoading(false);
      return;
    }

    try {
      const demandCount = getDemandCountForVillage(villageId);
      setCount(demandCount);
    } catch (error) {
      console.error('[useDemand] Failed to fetch demand count:', error);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [villageId]);

  const submitDemand = (record: Omit<DemandRecord, 'id' | 'createdAt'>) => {
    try {
      const fullRecord = addDemand(record);
      setCount((prev) => prev + 1);
      return fullRecord;
    } catch (error) {
      console.error('[useDemand] Failed to submit demand:', error);
      throw error;
    }
  };

  return { count, loading, submitDemand };
}

export function useAllDemand() {
  const [demandByVillage, setDemandByVillage] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const demands = getAllDemandCounts();
      setDemandByVillage(demands);
    } catch (error) {
      console.error('[useAllDemand] Failed to fetch demand data:', error);
      setDemandByVillage({});
    } finally {
      setLoading(false);
    }
  }, []);

  return { demandByVillage, loading };
}
