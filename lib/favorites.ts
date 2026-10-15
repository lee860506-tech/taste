const KEY = 'nyamnyam:favorites:v1';
export function readFavorites(): string[] { try { const value:unknown=JSON.parse(localStorage.getItem(KEY)||'[]'); return Array.isArray(value)?value.filter((id):id is string=>typeof id==='string'):[]; } catch { return []; } }
export function writeFavorites(ids:string[]) { localStorage.setItem(KEY,JSON.stringify(ids)); window.dispatchEvent(new Event('favorites-change')); }
