/**
 * Philippine Standard Geographic Code (PSGC) API Service
 * API Source: https://psgc.cloud/api
 * 
 * This service fetches official Philippine geographic data (regions, provinces, cities/municipalities)
 * with caching and error handling to ensure the form never breaks.
 */

const BASE_URL = 'https://psgc.cloud/api';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

interface PSGCRegion {
    name: string;
    code: string;
}

interface PSGCProvince {
    name: string;
    code: string;
}

interface PSGCCityMunicipality {
    name: string;
    code: string;
    type: 'City' | 'Mun' | 'SubMun';
}

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

// In-memory cache
const cache = new Map<string, CacheEntry<any>>();

// Fallback regions (always available even if API fails)
const FALLBACK_REGIONS: PSGCRegion[] = [
    { name: "National Capital Region (NCR)", code: "1300000000" },
    { name: "Cordillera Administrative Region (CAR)", code: "1400000000" },
    { name: "Region I (Ilocos Region)", code: "0100000000" },
    { name: "Region II (Cagayan Valley)", code: "0200000000" },
    { name: "Region III (Central Luzon)", code: "0300000000" },
    { name: "Region IV-A (CALABARZON)", code: "0400000000" },
    { name: "MIMAROPA Region", code: "1700000000" },
    { name: "Region V (Bicol Region)", code: "0500000000" },
    { name: "Region VI (Western Visayas)", code: "0600000000" },
    { name: "Region VII (Central Visayas)", code: "0700000000" },
    { name: "Region VIII (Eastern Visayas)", code: "0800000000" },
    { name: "Region IX (Zamboanga Peninsula)", code: "0900000000" },
    { name: "Region X (Northern Mindanao)", code: "1000000000" },
    { name: "Region XI (Davao Region)", code: "1100000000" },
    { name: "Region XII (SOCCSKSARGEN)", code: "1200000000" },
    { name: "Region XIII (Caraga)", code: "1600000000" },
    { name: "Bangsamoro Autonomous Region In Muslim Mindanao (BARMM)", code: "1900000000" },
];

function getCacheKey(endpoint: string): string {
    return endpoint;
}

function isCacheValid<T>(entry: CacheEntry<T> | undefined): boolean {
    if (!entry) return false;
    return Date.now() - entry.timestamp < CACHE_DURATION;
}

async function fetchWithTimeout(url: string, timeout = 5000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Fetch all regions
 */
export async function fetchRegions(): Promise<{ data: PSGCRegion[]; error?: string }> {
    const cacheKey = getCacheKey('regions');
    const cached = cache.get(cacheKey);
    
    if (isCacheValid(cached)) {
        return { data: cached.data };
    }
    
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/regions`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data: PSGCRegion[] = await response.json();
        
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Invalid data format');
        }
        
        cache.set(cacheKey, { data, timestamp: Date.now() });
        return { data };
        
    } catch (error) {
        console.warn('[PSGC] Failed to fetch regions, using fallback:', error);
        return { 
            data: FALLBACK_REGIONS,
            error: 'Using offline region list'
        };
    }
}

/**
 * Fetch provinces for given region codes
 */
export async function fetchProvinces(regionCodes: string[]): Promise<{ data: PSGCProvince[]; error?: string }> {
    if (regionCodes.length === 0) {
        return { data: [] };
    }
    
    const allProvinces: PSGCProvince[] = [];
    const errors: string[] = [];
    
    for (const regionCode of regionCodes) {
        const cacheKey = getCacheKey(`provinces-${regionCode}`);
        const cached = cache.get(cacheKey);
        
        if (isCacheValid(cached)) {
            allProvinces.push(...cached.data);
            continue;
        }
        
        try {
            const response = await fetchWithTimeout(`${BASE_URL}/regions/${regionCode}/provinces`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data: PSGCProvince[] = await response.json();
            
            // Empty array is valid for regions like NCR (no provinces)
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format');
            }
            
            cache.set(cacheKey, { data, timestamp: Date.now() });
            allProvinces.push(...data);
            
        } catch (error) {
            console.warn(`[PSGC] Failed to fetch provinces for region ${regionCode}:`, error);
            errors.push(regionCode);
        }
    }
    
    return { 
        data: allProvinces,
        error: errors.length > 0 ? `Failed to load provinces for ${errors.length} region(s)` : undefined
    };
}

/**
 * Fetch cities/municipalities for given region codes (for regions without provinces, like NCR)
 */
export async function fetchCitiesByRegion(regionCodes: string[]): Promise<{ data: PSGCCityMunicipality[]; error?: string }> {
    if (regionCodes.length === 0) {
        return { data: [] };
    }
    
    const allCities: PSGCCityMunicipality[] = [];
    const errors: string[] = [];
    
    for (const regionCode of regionCodes) {
        const cacheKey = getCacheKey(`cities-region-${regionCode}`);
        const cached = cache.get(cacheKey);
        
        if (isCacheValid(cached)) {
            allCities.push(...cached.data);
            continue;
        }
        
        try {
            const response = await fetchWithTimeout(`${BASE_URL}/regions/${regionCode}/cities-municipalities`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data: PSGCCityMunicipality[] = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format');
            }
            
            cache.set(cacheKey, { data, timestamp: Date.now() });
            allCities.push(...data);
            
        } catch (error) {
            console.warn(`[PSGC] Failed to fetch cities for region ${regionCode}:`, error);
            errors.push(regionCode);
        }
    }
    
    return { 
        data: allCities,
        error: errors.length > 0 ? `Failed to load cities for ${errors.length} region(s)` : undefined
    };
}

/**
 * Fetch cities/municipalities for given province codes
 */
export async function fetchCitiesByProvince(provinceCodes: string[]): Promise<{ data: PSGCCityMunicipality[]; error?: string }> {
    if (provinceCodes.length === 0) {
        return { data: [] };
    }
    
    const allCities: PSGCCityMunicipality[] = [];
    const errors: string[] = [];
    
    for (const provinceCode of provinceCodes) {
        const cacheKey = getCacheKey(`cities-province-${provinceCode}`);
        const cached = cache.get(cacheKey);
        
        if (isCacheValid(cached)) {
            allCities.push(...cached.data);
            continue;
        }
        
        try {
            const response = await fetchWithTimeout(`${BASE_URL}/provinces/${provinceCode}/cities-municipalities`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data: PSGCCityMunicipality[] = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format');
            }
            
            cache.set(cacheKey, { data, timestamp: Date.now() });
            allCities.push(...data);
            
        } catch (error) {
            console.warn(`[PSGC] Failed to fetch cities for province ${provinceCode}:`, error);
            errors.push(provinceCode);
        }
    }
    
    return { 
        data: allCities,
        error: errors.length > 0 ? `Failed to load cities for ${errors.length} province(s)` : undefined
    };
}

/**
 * Fetch barangays for given city/municipality codes
 */
export async function fetchBarangays(cityCodes: string[]): Promise<{ data: { name: string; code: string }[]; error?: string }> {
    if (cityCodes.length === 0) {
        return { data: [] };
    }
    
    const allBarangays: { name: string; code: string }[] = [];
    const errors: string[] = [];
    
    for (const cityCode of cityCodes) {
        const cacheKey = getCacheKey(`barangays-${cityCode}`);
        const cached = cache.get(cacheKey);
        
        if (isCacheValid(cached)) {
            allBarangays.push(...cached.data);
            continue;
        }
        
        try {
            const response = await fetchWithTimeout(`${BASE_URL}/cities-municipalities/${cityCode}/barangays`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data: { name: string; code: string }[] = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format');
            }
            
            cache.set(cacheKey, { data, timestamp: Date.now() });
            allBarangays.push(...data);
            
        } catch (error) {
            console.warn(`[PSGC] Failed to fetch barangays for city ${cityCode}:`, error);
            errors.push(cityCode);
        }
    }
    
    return { 
        data: allBarangays,
        error: errors.length > 0 ? `Failed to load barangays for ${errors.length} city(ies)` : undefined
    };
}

/**
 * Clear the cache (useful for testing or manual refresh)
 */
export function clearCache(): void {
    cache.clear();
}
