import type { Coordinates, Restaurant } from '@/types/restaurant';
export function validCoordinates(p: Coordinates): boolean { return Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && Math.abs(p.latitude)<=90 && Math.abs(p.longitude)<=180; }
export function inKorea(p: Coordinates): boolean { return validCoordinates(p) && p.latitude>=32 && p.latitude<=39.5 && p.longitude>=124 && p.longitude<=132; }
export function distanceMeters(a: Coordinates,b: Coordinates): number {
  if(!validCoordinates(a)||!validCoordinates(b)) return Infinity;
  const rad=Math.PI/180;const dlat=(b.latitude-a.latitude)*rad;const dlon=(b.longitude-a.longitude)*rad;
  const h=Math.sin(dlat/2)**2+Math.cos(a.latitude*rad)*Math.cos(b.latitude*rad)*Math.sin(dlon/2)**2;
  return 6371008.8*2*Math.asin(Math.sqrt(Math.min(1,Math.max(0,h))));
}
export function withinRadius(r:Restaurant,center:Coordinates,radius:number) { return !r.isSample && !!r.coordinates && inKorea(r.coordinates) && distanceMeters(center,r.coordinates)<=radius; }
