import { restaurants } from '@/data/restaurants';
export const restaurantRepository = { list: () => restaurants, find: (id:string) => restaurants.find(r=>r.id===id) };
