import {DbError,nearbyDbRestaurants} from '@/lib/supabase/restaurants';
import type {DbNearbyInput} from '@/lib/supabase/restaurants';
export async function POST(request:Request){
 try{const input=await request.json() as DbNearbyInput;const result=await nearbyDbRestaurants(input);return Response.json(result,{headers:{'Cache-Control':'no-store'}})}
 catch(error){return Response.json({error:error instanceof DbError?error.message:'거리 검색 조건을 확인해 주세요.'},{status:error instanceof DbError?error.status:400,headers:{'Cache-Control':'no-store'}})}
}
