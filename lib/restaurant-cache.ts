import type {Restaurant} from '@/types/restaurant';
const KEY='nyamnyam:restaurant-details:v1';
export function cachedRestaurants():Restaurant[]{try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(value)?value.filter(r=>r&&typeof r.id==='string'&&typeof r.name==='string'&&r.isSample===false):[];}catch{return [];}}
// Only public business information, never the user's current position.
export function rememberRestaurant(r:Restaurant){if(r.isSample)return;const values=cachedRestaurants().filter(x=>x.id!==r.id);localStorage.setItem(KEY,JSON.stringify([...values,r]));}
