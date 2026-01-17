/**
 * demand.ts
 * 
 * Handles shuttle demand logging using localStorage.
 * Stores requests locally with no external database dependency.
 * Used by useDemand hook and AppContext to manage demand data.
 */

const STORAGE_KEY = 'horiohop_demands';

export interface DemandRecord {
  id: string;
  villageId: string;
  originCity: string;
  desiredDate: string;
  partySize: number;
  email?: string;
  createdAt: string;
}

/**
 * Retrieve all demand records from localStorage.
 */
export function getDemands(): DemandRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[demand] Failed to parse stored demands:', error);
    return [];
  }
}

/**
 * Add a new demand record to localStorage.
 */
export function addDemand(demand: Omit<DemandRecord, 'id' | 'createdAt'>): DemandRecord {
  const demands = getDemands();
  const newDemand: DemandRecord = {
    ...demand,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  demands.push(newDemand);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demands));
  } catch (error) {
    console.error('[demand] Failed to save demand:', error);
    throw new Error('Failed to save demand request');
  }
  return newDemand;
}

/**
 * Get demand count for a specific village (last 30 days).
 */
export function getDemandCountForVillage(villageId: string): number {
  const demands = getDemands();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return demands.filter(
    (d) => d.villageId === villageId && new Date(d.createdAt) > thirtyDaysAgo
  ).length;
}

/**
 * Get demand counts for all villages (last 30 days).
 */
export function getAllDemandCounts(): Record<string, number> {
  const demands = getDemands();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return demands
    .filter((d) => new Date(d.createdAt) > thirtyDaysAgo)
    .reduce((acc, d) => {
      acc[d.villageId] = (acc[d.villageId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
}

/**
 * Clear all demand records (for testing/debugging).
 */
export function clearDemands(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[demand] Failed to clear demands:', error);
  }
}

/**
 * Prepopulate demand data with random values (2-20 requests per village).
 * Only runs if localStorage is empty or if force is true.
 */
export function prepopulateDemands(villageIds: string[], force = false): void {
  try {
    const existing = getDemands();
    
    // Only prepopulate if storage is empty or force is true
    if (existing.length > 0 && !force) {
      console.log('[demand] Skipping prepopulation - localStorage already has data. Use force=true to overwrite.');
      return;
    }

    // If forcing, clear existing data first
    if (force && existing.length > 0) {
      console.log('[demand] Clearing existing demand data before prepopulation...');
      localStorage.removeItem(STORAGE_KEY);
    }

    const cities = ['Nicosia', 'Limassol', 'Larnaca', 'Paphos'];
    const demands: DemandRecord[] = [];
    const now = new Date();

    // Focus on January 24th and 25th, 2026
    const targetDates = ['2026-01-24', '2026-01-25'];
    
    villageIds.forEach((villageId) => {
      // Random number of requests between 2 and 20
      const numRequests = Math.floor(Math.random() * 19) + 2;

      for (let i = 0; i < numRequests; i++) {
        // Random date within last 30 days for createdAt
        const daysAgo = Math.floor(Math.random() * 30);
        const createdAt = new Date(now);
        createdAt.setDate(createdAt.getDate() - daysAgo);
        
        // Use one of the target dates (January 24th or 25th, 2026)
        const desiredDate = targetDates[Math.floor(Math.random() * targetDates.length)];

        demands.push({
          id: crypto.randomUUID(),
          villageId,
          originCity: cities[Math.floor(Math.random() * cities.length)],
          desiredDate,
          partySize: Math.floor(Math.random() * 7) + 1, // 1-8 people
          email: `user${Math.floor(Math.random() * 10000)}@example.com`,
          createdAt: createdAt.toISOString(),
        });
      }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(demands));
    console.log(`[demand] Prepopulated ${demands.length} demand records for ${villageIds.length} villages`);
  } catch (error) {
    console.error('[demand] Failed to prepopulate demands:', error);
  }
}

