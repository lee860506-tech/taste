export const categories = ['한식','중식','일식','양식','카페','디저트','분식','기타'] as const;
export type Category = typeof categories[number];
type Base = { id: string; name: string; category: Category; region: string };
export type Coordinates = { latitude: number; longitude: number };
export type PublicSource = 'commercial' | 'licenses';
export type Restaurant = Base & ({ isSample: true; demoPosition: { x: number; y: number } } | { isSample: false; source: PublicSource; sourceId: string; address: string; rawCategory: string; regionCode?: string; sourceUpdatedAt?: string; fetchedAt: string; rawBusinessStatus?: string; businessStatus: string; coordinates?: Coordinates; coordinateNote: string; distanceMeters?: number });
