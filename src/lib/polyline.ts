/**
 * polyline.ts
 * 
 * Decodes Google's encoded polyline format returned by Motis.
 * Converts encoded strings into arrays of [lat, lng] coordinate tuples.
 * Used by routing.ts to decode route geometries for map display.
 */

/**
 * Decodes Google's encoded polyline string into an array of [lat, lng] tuples.
 * 
 * Algorithm: Each coordinate is delta-encoded relative to the previous one,
 * then base64-like encoded. We decode by reversing this process.
 * 
 * @param encoded - Encoded polyline string from Motis API
 * @returns Array of [latitude, longitude] coordinate pairs
 */
export function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    // Decode latitude delta
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    // Decode longitude delta
    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    // Convert from 1e5 scale to degrees
    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}
