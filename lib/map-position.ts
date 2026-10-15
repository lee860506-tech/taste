import type { Restaurant } from '@/types/restaurant';
import {demoCoordinates} from '@/data/demo-coordinates';
import {inKorea} from './geo';
// Kakao's official sample center. Synthetic test points, never restaurant addresses.
export const SAMPLE_MAP_CENTER = { latitude: 33.450701, longitude: 126.570667 };
export function mapPosition(restaurant: Restaurant) {
  if (restaurant.isSample) return demoCoordinates[restaurant.id];
  return restaurant.coordinates && inKorea(restaurant.coordinates) ? restaurant.coordinates : undefined;
}
