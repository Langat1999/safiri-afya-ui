/**
 * Overpass API service for fetching real hospital/clinic data from OpenStreetMap
 * Documentation: https://wiki.openstreetmap.org/wiki/Overpass_API
 */

import { Coordinates, calculateDistance } from '@/utils/geoUtils';

export interface HealthFacility {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'doctors' | 'pharmacy';
  coordinates: Coordinates;
  address?: string;
  phone?: string;
  openingHours?: string;
  website?: string;
  emergency?: boolean;
  amenity: string;
  distance?: number;
  distanceText?: string;
}

interface OverpassNode {
  type: string;
  id: number;
  lat: number;
  lon: number;
  tags?: {
    name?: string;
    amenity?: string;
    'addr:street'?: string;
    'addr:city'?: string;
    'addr:postcode'?: string;
    phone?: string;
    'contact:phone'?: string;
    opening_hours?: string;
    website?: string;
    emergency?: string;
    'healthcare'?: string;
    'healthcare:speciality'?: string;
  };
}

interface OverpassResponse {
  version: number;
  generator: string;
  elements: OverpassNode[];
}

/**
 * Fetch nearby health facilities from OpenStreetMap using Overpass API
 */
export async function fetchNearbyHealthFacilities(
  latitude: number,
  longitude: number,
  radiusMeters: number = 5000
): Promise<HealthFacility[]> {
  // Build Overpass QL query to find hospitals, clinics, doctors, and pharmacies
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});
      node["amenity"="clinic"](around:${radiusMeters},${latitude},${longitude});
      node["amenity"="doctors"](around:${radiusMeters},${latitude},${longitude});
      node["amenity"="pharmacy"](around:${radiusMeters},${latitude},${longitude});
      way["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});
      way["amenity"="clinic"](around:${radiusMeters},${latitude},${longitude});
      way["amenity"="doctors"](around:${radiusMeters},${latitude},${longitude});
      way["amenity"="pharmacy"](around:${radiusMeters},${latitude},${longitude});
    );
    out center;
  `;

  try {
    const response = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.statusText}`);
    }

    const data: OverpassResponse = await response.json();

    // Transform Overpass data to our HealthFacility format
    const facilities: HealthFacility[] = data.elements
      .map((element) => transformOverpassNode(element, { lat: latitude, lng: longitude }))
      .filter((facility): facility is HealthFacility => facility !== null)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0)); // Sort by distance

    return facilities;
  } catch (error) {
    console.error('Error fetching from Overpass API:', error);
    throw error;
  }
}

/**
 * Transform Overpass node to HealthFacility
 */
function transformOverpassNode(
  node: OverpassNode,
  userLocation: Coordinates
): HealthFacility | null {
  if (!node.tags || !node.tags.amenity) {
    return null;
  }

  // Use center coordinates for ways (buildings)
  const lat = (node as any).center?.lat || node.lat;
  const lon = (node as any).center?.lon || node.lon;

  if (!lat || !lon) {
    return null;
  }

  const coordinates: Coordinates = { lat, lng: lon };
  const distance = calculateDistance(userLocation, coordinates);

  // Build address from available tags
  const addressParts = [
    node.tags['addr:street'],
    node.tags['addr:city'],
    node.tags['addr:postcode'],
  ].filter(Boolean);
  const address = addressParts.length > 0 ? addressParts.join(', ') : undefined;

  // Get phone number
  const phone = node.tags.phone || node.tags['contact:phone'];

  // Determine facility type
  let type: HealthFacility['type'] = 'clinic';
  if (node.tags.amenity === 'hospital') {
    type = 'hospital';
  } else if (node.tags.amenity === 'doctors') {
    type = 'doctors';
  } else if (node.tags.amenity === 'pharmacy') {
    type = 'pharmacy';
  }

  // Add mock consultation fee based on facility type (speculative pricing)
  // These are placeholder prices until agreements with hospitals are finalized
  let consultationFee = 1000; // Default fee in KES
  if (type === 'hospital') {
    consultationFee = 1500; // Hospitals typically charge more
  } else if (type === 'pharmacy') {
    consultationFee = 500; // Pharmacies charge less for consultation
  } else if (type === 'doctors') {
    consultationFee = 1200; // Doctor's office
  } else if (type === 'clinic') {
    consultationFee = 1000; // Standard clinic fee
  }

  return {
    id: `osm-${node.type}-${node.id}`,
    name: node.tags.name || `${capitalizeFirst(node.tags.amenity)} (Unnamed)`,
    type,
    coordinates,
    address,
    phone,
    openingHours: node.tags.opening_hours,
    website: node.tags.website,
    emergency: node.tags.emergency === 'yes',
    amenity: node.tags.amenity,
    distance,
    distanceText: formatDistance(distance),
    consultationFee, // Mock pricing for booking functionality
  } as any;
}

/**
 * Format distance for display
 */
function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Geocode an address to coordinates using Nominatim (OpenStreetMap)
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SafiriAfya/1.0', // Nominatim requires a User-Agent
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      return null;
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}
