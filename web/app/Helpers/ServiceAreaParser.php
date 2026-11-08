<?php

namespace App\Helpers;

class ServiceAreaParser
{
    /**
     * Known region patterns
     */
    private static $regionPatterns = [
        'National Capital Region',
        'NCR',
        'Region I',
        'Region II',
        'Region III',
        'Region IV-A',
        'Region IV-B',
        'Region V',
        'Region VI',
        'Region VII',
        'Region VIII',
        'Region IX',
        'Region X',
        'Region XI',
        'Region XII',
        'Region XIII',
        'CAR',
        'BARMM',
        'CALABARZON',
        'MIMAROPA',
    ];

    /**
     * Known province names
     */
    private static $provincePatterns = [
        'Abra', 'Agusan del Norte', 'Agusan del Sur', 'Aklan', 'Albay', 'Antique', 'Apayao', 'Aurora',
        'Basilan', 'Bataan', 'Batanes', 'Batangas', 'Benguet', 'Biliran', 'Bohol', 'Bukidnon',
        'Bulacan', 'Cagayan', 'Camarines Norte', 'Camarines Sur', 'Camiguin', 'Capiz', 'Catanduanes',
        'Cavite', 'Cebu', 'Cotabato', 'Davao de Oro', 'Davao del Norte', 'Davao del Sur',
        'Davao Occidental', 'Davao Oriental', 'Dinagat Islands', 'Eastern Samar', 'Guimaras',
        'Ifugao', 'Ilocos Norte', 'Ilocos Sur', 'Iloilo', 'Isabela', 'Kalinga', 'La Union',
        'Laguna', 'Lanao del Norte', 'Lanao del Sur', 'Leyte', 'Maguindanao', 'Marinduque',
        'Masbate', 'Metro Manila', 'Misamis Occidental', 'Misamis Oriental', 'Mountain Province',
        'Negros Occidental', 'Negros Oriental', 'Northern Samar', 'Nueva Ecija', 'Nueva Vizcaya',
        'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Pampanga', 'Pangasinan', 'Quezon',
        'Quirino', 'Rizal', 'Romblon', 'Samar', 'Sarangani', 'Siquijor', 'Sorsogon',
        'South Cotabato', 'Southern Leyte', 'Sultan Kudarat', 'Sulu', 'Surigao del Norte',
        'Surigao del Sur', 'Tarlac', 'Tawi-Tawi', 'Zambales', 'Zamboanga del Norte',
        'Zamboanga del Sur', 'Zamboanga Sibugay',
    ];

    /**
     * Extract regions from legacy service_areas array
     */
    public static function extractRegions(array $serviceAreas): array
    {
        $regions = [];
        
        foreach ($serviceAreas as $area) {
            foreach (self::$regionPatterns as $pattern) {
                if (stripos($area, $pattern) !== false) {
                    $regions[] = $area;
                    break;
                }
            }
        }
        
        return array_unique($regions);
    }

    /**
     * Extract provinces from legacy service_areas array
     */
    public static function extractProvinces(array $serviceAreas): array
    {
        $provinces = [];
        
        foreach ($serviceAreas as $area) {
            // Skip if it's a region
            $isRegion = false;
            foreach (self::$regionPatterns as $pattern) {
                if (stripos($area, $pattern) !== false) {
                    $isRegion = true;
                    break;
                }
            }
            
            if ($isRegion) {
                continue;
            }
            
            // Skip if it contains "City" (it's a city/municipality, not a province)
            if (stripos($area, 'City') !== false) {
                continue;
            }
            
            // Check if it's a province
            foreach (self::$provincePatterns as $province) {
                if (stripos($area, $province) !== false) {
                    $provinces[] = $area;
                    break;
                }
            }
        }
        
        return array_unique($provinces);
    }

    /**
     * Extract cities/municipalities from legacy service_areas array
     */
    public static function extractCities(array $serviceAreas): array
    {
        $cities = [];
        
        foreach ($serviceAreas as $area) {
            // Skip if it's a region
            $isRegion = false;
            foreach (self::$regionPatterns as $pattern) {
                if (stripos($area, $pattern) !== false) {
                    $isRegion = true;
                    break;
                }
            }
            
            if ($isRegion) {
                continue;
            }
            
            // Skip if it's a province
            $isProvince = false;
            foreach (self::$provincePatterns as $province) {
                if ($area === $province || (stripos($area, $province) !== false && strlen($area) < 50 && !str_contains($area, 'City'))) {
                    $isProvince = true;
                    break;
                }
            }
            
            if ($isProvince) {
                continue;
            }
            
            // It's likely a city/municipality
            $cities[] = $area;
        }
        
        return array_unique($cities);
    }
}
