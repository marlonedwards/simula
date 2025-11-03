// Clash of Clans style resource calculator
// Calculates resources based on time elapsed since last sync

export interface PlayerResources {
  money: number;
  energy: number;
  water: number;
  iron: number;
  population: number;
  populationCap: number;
  lastSync: number; // timestamp in seconds
}

export interface Building {
  id: number;
  type: number;
  x: number;
  y: number;
  builtAt: number;
}

// Production rates per hour (matches contract)
export const PRODUCTION_RATES = {
  GOLD_MINE: 100,      // $100/hour
  ENERGY_PLANT: 50,    // 50 energy/hour
  WATER_EXTRACTOR: 50, // 50 water/hour
  IRON_MINE: 20,       // 20 iron/hour
};

export const BUILDING_TYPES = {
  GOLD_MINE: 0,
  ENERGY_PLANT: 1,
  WATER_EXTRACTOR: 2,
  HABITAT: 3,
  IRON_MINE: 4,
};

/**
 * Calculate resources accumulated since last sync
 * This runs client-side for real-time display
 */
export function calculateOfflineResources(
  lastSyncResources: PlayerResources,
  buildings: Building[],
  currentTime: number = Date.now() / 1000 // convert to seconds
): PlayerResources {
  const timeElapsedSeconds = currentTime - lastSyncResources.lastSync;
  const hoursElapsed = timeElapsedSeconds / 3600;

  if (hoursElapsed <= 0) {
    return lastSyncResources;
  }

  // Count buildings by type
  const buildingCounts = buildings.reduce((acc, building) => {
    acc[building.type] = (acc[building.type] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // Calculate production
  const moneyGained = (buildingCounts[BUILDING_TYPES.GOLD_MINE] || 0) *
    PRODUCTION_RATES.GOLD_MINE * hoursElapsed;

  const energyGained = (buildingCounts[BUILDING_TYPES.ENERGY_PLANT] || 0) *
    PRODUCTION_RATES.ENERGY_PLANT * hoursElapsed;

  const waterGained = (buildingCounts[BUILDING_TYPES.WATER_EXTRACTOR] || 0) *
    PRODUCTION_RATES.WATER_EXTRACTOR * hoursElapsed;

  const ironGained = (buildingCounts[BUILDING_TYPES.IRON_MINE] || 0) *
    PRODUCTION_RATES.IRON_MINE * hoursElapsed;

  return {
    money: Math.floor(lastSyncResources.money + moneyGained),
    energy: Math.floor(lastSyncResources.energy + energyGained),
    water: Math.floor(lastSyncResources.water + waterGained),
    iron: Math.floor(lastSyncResources.iron + ironGained),
    population: lastSyncResources.population,
    populationCap: lastSyncResources.populationCap,
    lastSync: lastSyncResources.lastSync,
  };
}

/**
 * Get production per second for real-time tickers
 */
export function getProductionPerSecond(buildings: Building[]) {
  const buildingCounts = buildings.reduce((acc, building) => {
    acc[building.type] = (acc[building.type] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return {
    money: ((buildingCounts[BUILDING_TYPES.GOLD_MINE] || 0) * PRODUCTION_RATES.GOLD_MINE) / 3600,
    energy: ((buildingCounts[BUILDING_TYPES.ENERGY_PLANT] || 0) * PRODUCTION_RATES.ENERGY_PLANT) / 3600,
    water: ((buildingCounts[BUILDING_TYPES.WATER_EXTRACTOR] || 0) * PRODUCTION_RATES.WATER_EXTRACTOR) / 3600,
    iron: ((buildingCounts[BUILDING_TYPES.IRON_MINE] || 0) * PRODUCTION_RATES.IRON_MINE) / 3600,
  };
}

/**
 * Format time remaining until next full hour
 */
export function getTimeUntilNextHour(lastSync: number): string {
  const now = Date.now() / 1000;
  const elapsed = now - lastSync;
  const secondsInHour = 3600;
  const secondsUntilNextHour = secondsInHour - (elapsed % secondsInHour);

  const minutes = Math.floor(secondsUntilNextHour / 60);
  const seconds = Math.floor(secondsUntilNextHour % 60);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// LocalStorage keys
const STORAGE_KEYS = {
  RESOURCES: 'simula_resources',
  BUILDINGS: 'simula_buildings',
  LAST_BLOCKCHAIN_SYNC: 'simula_last_blockchain_sync',
};

/**
 * Save resources to localStorage
 */
export function saveResourcesToStorage(resources: PlayerResources) {
  localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
}

/**
 * Load resources from localStorage
 */
export function loadResourcesFromStorage(): PlayerResources | null {
  const stored = localStorage.getItem(STORAGE_KEYS.RESOURCES);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Save buildings to localStorage
 */
export function saveBuildingsToStorage(buildings: Building[]) {
  localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(buildings));
}

/**
 * Load buildings from localStorage
 */
export function loadBuildingsFromStorage(): Building[] {
  const stored = localStorage.getItem(STORAGE_KEYS.BUILDINGS);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Save last blockchain sync timestamp
 */
export function saveLastBlockchainSync(timestamp: number) {
  localStorage.setItem(STORAGE_KEYS.LAST_BLOCKCHAIN_SYNC, timestamp.toString());
}

/**
 * Get last blockchain sync timestamp
 */
export function getLastBlockchainSync(): number | null {
  const stored = localStorage.getItem(STORAGE_KEYS.LAST_BLOCKCHAIN_SYNC);
  return stored ? parseInt(stored) : null;
}

/**
 * Clear all stored data (for logout or reset)
 */
export function clearStorage() {
  localStorage.removeItem(STORAGE_KEYS.RESOURCES);
  localStorage.removeItem(STORAGE_KEYS.BUILDINGS);
  localStorage.removeItem(STORAGE_KEYS.LAST_BLOCKCHAIN_SYNC);
}
