import {timingSafeEqual} from 'node:crypto';
import {searchPublicData,type SearchInput,DataError} from '@/lib/public-data/client';
import {upsertDbRestaurants,DbError} from '@/lib/supabase/restaurants';

function authorized(request:Request){const expected=process.env.RESTAURANT_SYNC_TOKEN;const supplied=request.headers.get('authorization')?.replace(/^Bearer /,'');if(!expected||!supplied)return false;const a=Buffer.from(expected),b=Buffer.from(supplied);return a.length===b.length&&timingSafeEqual(a,b)}
export async function POST(request:Request){
 if(!authorized(request))return Response.json({error:'동기화 권한이 없어요.'},{status:401,headers:{'Cache-Control':'no-store'}});
 try{const input=await request.json() as SearchInput;
  if(input.center||input.radius||input.source==='commercial'&&!/^\d{8}$/.test(input.regionCode||''))throw new DataError('동기화에는 확인된 8자리 행정동 코드를 사용해 주세요.',400);
  const result=await searchPublicData(input);const saved=await upsertDbRestaurants(result.items);
  return Response.json({source:input.source,regionCode:input.regionCode||null,page:result.page,fetched:result.items.length,saved,totalAtProvider:result.total,hasMore:result.hasMore},{headers:{'Cache-Control':'no-store'}});
 }catch(error){const known=error instanceof DataError||error instanceof DbError;return Response.json({error:known?error.message:'동기화 요청을 확인해 주세요.'},{status:known?error.status:400,headers:{'Cache-Control':'no-store'}})}
}
