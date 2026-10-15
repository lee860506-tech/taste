import {DbError,listDbRestaurants} from '@/lib/supabase/restaurants';
import type {PublicSource} from '@/types/restaurant';
export async function GET(request:Request){
 try{const p=new URL(request.url).searchParams;const source=p.get('source') as PublicSource;if(!['commercial','licenses'].includes(source))return Response.json({error:'데이터 출처를 확인해 주세요.'},{status:400});
  const result=await listDbRestaurants({source,page:Number(p.get('page')||1),regionCode:p.get('regionCode')||undefined,address:p.get('address')||undefined,category:p.get('category')||undefined,name:p.get('name')||undefined});return Response.json(result,{headers:{'Cache-Control':'no-store'}});
 }catch(error){return Response.json({error:error instanceof DbError?error.message:'DB 조회 조건을 확인해 주세요.'},{status:error instanceof DbError?error.status:400,headers:{'Cache-Control':'no-store'}})}
}
