import 'server-only';
import {createHash} from 'node:crypto';
import {normalize} from './normalize';
import {inKorea,withinRadius} from '../geo';
import type {Coordinates,PublicSource,Restaurant} from '@/types/restaurant';
export type SearchInput={source:PublicSource;page:number;regionCode?:string;address?:string;name?:string;center?:Coordinates;radius?:number};
type Result={items:Restaurant[];total:number;page:number;hasMore:boolean;notice:string};
const cache=new Map<string,{expires:number;value:Result}>();
const pending=new Map<string,Promise<Result>>();
let windowStart=0,requests=0;
export class DataError extends Error {constructor(message:string,public status=502){super(message)}}
export async function searchPublicData(input:SearchInput):Promise<Result>{
 const key=process.env.DATA_GO_KR_SERVICE_KEY?.trim();if(!key)throw new DataError('공공데이터 인증키 설정을 기다리고 있어요.',503);
 if(!['commercial','licenses'].includes(input.source)||!Number.isInteger(input.page)||input.page<1||input.page>100)throw new DataError('조회 조건을 확인해 주세요.',400);
 if(input.center&&(!inKorea(input.center)||![500,1000,3000].includes(input.radius||0)))throw new DataError('대한민국 내 위치와 탐색 거리를 확인해 주세요.',400);
 if(input.source==='commercial'&&!input.center&&!/^\d{2}$|^\d{5}$|^\d{8}$/.test(input.regionCode||''))throw new DataError('지역 코드를 입력하거나 현재 위치를 확인해 주세요.',400);
 if(input.source==='licenses'&&!(input.address?.trim()||input.name?.trim()))throw new DataError('도로명 지역 또는 음식점 이름을 입력해 주세요.',400);
 if((input.address?.length||0)>100||(input.name?.length||0)>100)throw new DataError('검색어는 100자 이내로 입력해 주세요.',400);
 const hash=createHash('sha256').update(JSON.stringify(input)).digest('hex');const cached=cache.get(hash);if(cached&&cached.expires>Date.now())return cached.value;
 if(pending.has(hash))return pending.get(hash)!;
 if(Date.now()-windowStart>60000){windowStart=Date.now();requests=0;}if(++requests>30)throw new DataError('요청이 많아요. 잠시 후 다시 조회해 주세요.',429);
 const work=fetchData(input,key).then(value=>{if(cache.size>=100)cache.delete(cache.keys().next().value!);cache.set(hash,{expires:Date.now()+60000,value});return value}).finally(()=>pending.delete(hash));pending.set(hash,work);return work;
}
async function fetchData(input:SearchInput,key:string):Promise<Result>{
 let path=input.source==='licenses'?'/info':'/storeListInDong';
 const params=new URLSearchParams({pageNo:String(input.page),numOfRows:'20'});
 if(input.source==='commercial'){
  params.set('ServiceKey',key.includes('%')?decodeURIComponent(key):key);params.set('type','json');params.set('indsLclsCd','I2');
  if(input.center){path='/storeListInRectangle';const dy=(input.radius!+25)/110000;const dx=(input.radius!+25)/(110000*Math.cos(input.center.latitude*Math.PI/180));params.set('minx',String(input.center.longitude-dx));params.set('maxx',String(input.center.longitude+dx));params.set('miny',String(input.center.latitude-dy));params.set('maxy',String(input.center.latitude+dy));}
  else{params.set('divId',input.regionCode!.length===2?'ctprvnCd':input.regionCode!.length===5?'signguCd':'adongCd');params.set('key',input.regionCode!);}
 }else{params.set('serviceKey',key.includes('%')?decodeURIComponent(key):key);params.set('returnType','JSON');if(input.address?.trim())params.set('cond[ROAD_NM_ADDR::LIKE]',input.address.trim());if(input.name?.trim())params.set('cond[BPLC_NM::LIKE]',input.name.trim());}
 const base=input.source==='commercial'?'https://apis.data.go.kr/B553077/api/open/sdsc2':'https://apis.data.go.kr/1741000/general_restaurants';
 let raw:unknown;try{const response=await fetch(`${base}${path}?${params}`,{cache:'no-store',signal:AbortSignal.timeout(12000)});if(!response.ok)throw new DataError(`공공데이터 요청이 거절되었어요 (HTTP ${response.status}). 활용신청과 인증키를 확인해 주세요.`,response.status===429?429:502);raw=await response.json();}catch(error){if(error instanceof DataError)throw error;throw new DataError('공공데이터 서버 응답을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.');}
 const outer=raw as Record<string,any>;const root=input.source==='licenses'?outer?.response:outer;
 if(!root?.header||!['0','00'].includes(String(root.header.resultCode)))throw new DataError('공공데이터 제공기관이 오류를 반환했어요. 활용신청 승인 상태와 호출 한도를 확인해 주세요.');
 const rows=input.source==='licenses'?root.body?.items?.item:root.body?.items;
 if(rows!=null&&!Array.isArray(rows))throw new DataError('공식 응답 형식과 달라 데이터를 표시하지 않았어요.');
 let items=normalize(rows||[],input.source,root.header.stdrYm);
 if(input.center)items=items.filter(r=>withinRadius(r,input.center!,input.radius!));
 const total=Number(root.body?.totalCount);if(!Number.isFinite(total))throw new DataError('전체 결과 수를 확인하지 못했어요.');
 return {items,total,page:input.page,hasMore:input.page*20<total,notice:'조회한 20건에 검색·필터를 적용해요. 다음 페이지에 더 많은 음식점이 있을 수 있어요.'};
}
