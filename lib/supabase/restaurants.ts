import 'server-only';
import {inKorea} from '@/lib/geo';
import type {Coordinates,PublicSource,Restaurant,Category} from '@/types/restaurant';

type PublicRestaurant=Extract<Restaurant,{isSample:false}>;
type Row={id:string;source:PublicSource;source_id:string;name:string;address:string;category:Category;raw_category:string;region:string;region_code:string|null;latitude:number|null;longitude:number|null;source_updated_at:string|null;business_status:string|null;fetched_at:string;distance_meters?:number};
export type DbListInput={source:PublicSource;page?:number;regionCode?:string;address?:string;category?:string;name?:string};
export type DbNearbyInput={center:Coordinates;radius:number;source?:PublicSource;category?:string;name?:string};
export class DbError extends Error{constructor(message:string,public status=502){super(message)}}

function config(write=false){
 const url=(process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||'').replace(/\/$/,'');
 const key=write?process.env.SUPABASE_SECRET_KEY:process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)throw new DbError(write?'Supabase 서버 비밀 키를 설정해 주세요.':'Supabase URL과 공개 키를 설정해 주세요.',503);
 if(write&&!key.startsWith('sb_secret_'))throw new DbError('서버에는 Supabase sb_secret_ 키를 사용해 주세요.',503);
 return {url,key};
}
async function call(path:string,options:{write?:boolean;method?:string;body?:unknown;count?:boolean}={}){
 const {url,key}=config(options.write);
 let response:Response;
 try{response=await fetch(`${url}/rest/v1/${path}`,{method:options.method||'GET',headers:{apikey:key,'Content-Type':'application/json',...(options.count?{Prefer:'count=exact'}:{}),...(options.write?{Prefer:'resolution=merge-duplicates,return=minimal'}:{})},body:options.body===undefined?undefined:JSON.stringify(options.body),cache:'no-store',signal:AbortSignal.timeout(12000)});}catch{throw new DbError('Supabase 연결에 실패했어요. 잠시 후 다시 시도해 주세요.');}
 if(!response.ok){if(response.status===404)throw new DbError('Supabase restaurants 테이블 또는 검색 함수를 찾지 못했어요. SQL 마이그레이션을 실행해 주세요.',503);if(response.status===401||response.status===403)throw new DbError('Supabase 키와 RLS/권한 설정을 확인해 주세요.',503);throw new DbError(`Supabase 조회/저장에 실패했어요 (HTTP ${response.status}).`);}
 const content=await response.text();
 return {data:content?JSON.parse(content):null,range:response.headers.get('content-range')};
}
function toRestaurant(row:Row):PublicRestaurant{
 const point=row.latitude!==null&&row.longitude!==null?{latitude:row.latitude,longitude:row.longitude}:undefined;
 const coordinates=point&&inKorea(point)?point:undefined;
 return {id:`${row.source}:${row.source_id}`,isSample:false,source:row.source,sourceId:row.source_id,name:row.name,address:row.address||'',category:row.category,rawCategory:row.raw_category||'',region:row.region||'',regionCode:row.region_code||undefined,sourceUpdatedAt:row.source_updated_at||undefined,fetchedAt:row.fetched_at,rawBusinessStatus:row.business_status||undefined,businessStatus:row.business_status?`인허가 기록: ${row.business_status} (실시간 영업 여부 아님)`:'영업상태 미확인',coordinates,coordinateNote:coordinates?'DB에 저장된 검증 좌표 · WGS84':'좌표 누락 또는 검증 실패 · 지도 표시 제외',distanceMeters:row.distance_meters};
}
export async function listDbRestaurants(input:DbListInput){
 const page=Math.max(1,Math.min(100,Number(input.page)||1));const limit=20;
 const p=new URLSearchParams({select:'id,source,source_id,name,address,category,raw_category,region,region_code,latitude,longitude,source_updated_at,business_status,fetched_at',source:`eq.${input.source}`,order:'name.asc',limit:String(limit),offset:String((page-1)*limit)});
 if(input.regionCode){if(!/^(\d{2}|\d{5}|\d{8})$/.test(input.regionCode))throw new DbError('지역 코드를 확인해 주세요.',400);p.set('region_code',input.regionCode.length===8?`eq.${input.regionCode}`:`like.${input.regionCode}*`);}
 if(input.address)p.set('address',`ilike.*${input.address.replace(/[*,()]/g,'').slice(0,80)}*`);
 if(input.category&&input.category!=='전체')p.set('category',`eq.${input.category}`);
 if(input.name)p.set('name',`ilike.*${input.name.replace(/[*,()]/g,'').slice(0,80)}*`);
 const {data,range}=await call(`restaurants?${p}`,{count:true});
 const total=Number(range?.split('/')[1]||0);
 return {items:(data as Row[]).map(toRestaurant),total,page,hasMore:page*limit<total,storage:'database' as const};
}
export async function nearbyDbRestaurants(input:DbNearbyInput){
 if(!inKorea(input.center)||![500,1000,3000].includes(input.radius))throw new DbError('현재 위치와 반경을 확인해 주세요.',400);
 const {data}=await call('rpc/search_restaurants_nearby',{method:'POST',body:{p_lat:input.center.latitude,p_lon:input.center.longitude,p_radius_m:input.radius,p_source:input.source||null,p_category:input.category&&input.category!=='전체'?input.category:null,p_name:input.name?.trim()||null,p_limit:20}});
 const items=(data as Row[]).map(toRestaurant);
 return {items,total:items.length,page:1,hasMore:false,storage:'database' as const,distanceMethod:'직선거리(지표면 최단거리) · 미터' as const};
}
export async function getDbRestaurant(source:PublicSource,sourceId:string){
 const p=new URLSearchParams({select:'id,source,source_id,name,address,category,raw_category,region,region_code,latitude,longitude,source_updated_at,business_status,fetched_at',source:`eq.${source}`,source_id:`eq.${sourceId}`,limit:'1'});
 const {data}=await call(`restaurants?${p}`);return (data as Row[])[0]?toRestaurant((data as Row[])[0]):undefined;
}
export async function upsertDbRestaurants(items:Restaurant[]){
 const rows=items.filter((item):item is PublicRestaurant=>!item.isSample).map(item=>({source:item.source,source_id:item.sourceId,name:item.name,address:item.address,category:item.category,raw_category:item.rawCategory,region:item.region,region_code:item.regionCode||null,latitude:item.coordinates?.latitude??null,longitude:item.coordinates?.longitude??null,source_updated_at:item.sourceUpdatedAt||null,business_status:item.rawBusinessStatus||null,fetched_at:item.fetchedAt}));
 if(!rows.length)return 0;
 await call('restaurants?on_conflict=source,source_id',{write:true,method:'POST',body:rows});return rows.length;
}
