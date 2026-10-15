import type { Category,Restaurant,PublicSource } from '@/types/restaurant';
import { inKorea } from '../geo';
import { convert5174 } from '../coordinates';
type Row=Record<string,unknown>;
const text=(value:unknown)=>typeof value==='string'?value.trim():typeof value==='number'?String(value):'';
function category(value:string):Category {if(/한식|백반|국밥|냉면|육류|삼겹|해산물/.test(value))return '한식';if(/중식|중국/.test(value))return '중식';if(/일식|일본|초밥|돈가스|우동/.test(value))return '일식';if(/양식|서양|파스타|피자/.test(value))return '양식';if(/커피|카페|찻집|비알코올/.test(value))return '카페';if(/제과|빵|아이스크림|디저트/.test(value))return '디저트';if(/분식|김밥|떡볶이/.test(value))return '분식';return '기타';}
export function normalize(rows:unknown[],source:PublicSource,updated?:string):Restaurant[] {
 const result=new Map<string,Restaurant>();
 for(const value of rows){if(!value||typeof value!=='object')continue;const row=value as Row;
 const sourceId=text(source==='commercial'?row.bizesId:row.MNG_NO);const name=text(source==='commercial'?row.bizesNm:row.BPLC_NM);if(!sourceId||!name)continue;
 const address=text(source==='commercial'?(row.rdnmAdr||row.lnoAdr):(row.ROAD_NM_ADDR||row.LOTNO_ADDR));
 const rawCategory=text(source==='commercial'?(row.indsSclsNm||row.indsMclsNm):(row.BZSTAT_SE_NM||row.SNTTN_BZSTAT_NM));
 let coordinates=source==='licenses'?convert5174(row.CRD_INFO_X,row.CRD_INFO_Y):undefined;
 if(source==='commercial'&&text(row.lat)&&text(row.lon)){const point={latitude:Number(row.lat),longitude:Number(row.lon)};if(inKorea(point))coordinates=point;}
 const id=`${source}:${sourceId}`;
 const rawBusinessStatus=source==='licenses'?text(row.SALS_STTS_NM):'';
 result.set(id,{id,name,category:category(rawCategory),region:source==='commercial'?[text(row.ctprvnNm),text(row.signguNm),text(row.adongNm)].filter(Boolean).join(' '):address.split(' ').slice(0,2).join(' '),regionCode:source==='commercial'?text(row.adongCd):undefined,isSample:false,source,sourceId,address,rawCategory,sourceUpdatedAt:source==='commercial'?updated:text(row.LAST_MDFCN_PNT||row.DAT_UPDT_PNT),fetchedAt:new Date().toISOString(),rawBusinessStatus:rawBusinessStatus||undefined,businessStatus:source==='commercial'?'영업상태 미확인':`인허가 기록: ${rawBusinessStatus||'미확인'} (실시간 영업 여부 아님)`,coordinates,coordinateNote:coordinates?(source==='commercial'?'공공데이터 WGS84 좌표 · 범위 검사 통과':'EPSG:5174 → WGS84 변환 · 범위/역변환 검사 통과'):'좌표 누락 또는 검증 실패 · 지도 표시 제외'});
 }
 return [...result.values()];
}
