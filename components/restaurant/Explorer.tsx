"use client";
import {useMemo,useState,useRef,useEffect,useCallback} from 'react';
import {useSearchParams} from 'next/navigation';
import {categories,type Restaurant,type Coordinates,type PublicSource} from '@/types/restaurant';
import {regions} from '@/data/restaurants';
import {defaultNeighborhoodCode,neighborhoods,provinces,regionOptions} from '@/data/neighborhoods';
import {restaurantRepository} from '@/lib/restaurants';
import {withinRadius} from '@/lib/geo';
import {getCurrentLocation} from '@/lib/geolocation';
import Card from './Card';
import CategoryIcon from './CategoryIcon';
import KakaoMap from '@/components/map/KakaoMap';

export default function Explorer(){
 const params=useSearchParams();
 const initial=params.get('category')||'전체';
 const[category,setCategory]=useState<string>((categories as readonly string[]).includes(initial)?initial:'전체');
 const[region,setRegion]=useState(regions.includes(params.get('region')||'')?params.get('region')!:'전체');
 const[query,setQuery]=useState('');const[view,setView]=useState(params.get('view')==='map'?'map':'list');const[selected,setSelected]=useState<string>();
 const[source,setSource]=useState<'sample'|PublicSource>('commercial');const[live,setLive]=useState<Restaurant[]>([]);
 const[address,setAddress]=useState('');const[regionCode,setRegionCode]=useState(()=>/^(\d{2}|\d{5}|\d{8})$/.test(params.get('regionCode')||'')?params.get('regionCode')!:defaultNeighborhoodCode);
 const[loading,setLoading]=useState(false);const[error,setError]=useState('');const[page,setPage]=useState(0);const[hasMore,setHasMore]=useState(false);const[total,setTotal]=useState(0);
 const[storage,setStorage]=useState<'unknown'|'database'|'live'>('unknown');
 const[location,setLocation]=useState<Coordinates>();const[locating,setLocating]=useState(false);const[locationMessage,setLocationMessage]=useState('');const[radius,setRadius]=useState<number>(0);const[mapReady,setMapReady]=useState(false);
 const request=useRef<AbortController | undefined>(undefined);const locationVersion=useRef(0);const lastFilters=useRef(`${query}|${category}`);
 useEffect(()=>()=>{request.current?.abort();locationVersion.current++},[]);
 const ready=useCallback(()=>setMapReady(true),[]);
 const items=useMemo(()=> (source==='sample'?restaurantRepository.list():live).filter(r=>(category==='전체'||r.category===category)&&(source!=='sample'||region==='전체'||r.region===region)&&r.name.toLocaleLowerCase('ko-KR').includes(query.trim().toLocaleLowerCase('ko-KR'))&&(!radius||storage==='database'||!!location&&withinRadius(r,location,radius))),[source,live,category,region,query,radius,location,storage]);
 const current=items.find(r=>r.id===selected);
 function clearLive(){request.current?.abort();setLoading(false);setLive([]);setPage(0);setHasMore(false);setTotal(0);setError('');setSelected(undefined);setStorage('unknown')}
 async function locate(){const version=++locationVersion.current;setLocating(true);setLocationMessage('');try{const p=await getCurrentLocation();if(version!==locationVersion.current)return;setLocation(p);const requestedRadius=params.get('nearby')==='1'&&[500,1000,3000].includes(Number(params.get('radius')))?Number(params.get('radius')):radius;if(requestedRadius)setRadius(requestedRadius);setSelected(undefined);setLocationMessage('현재 위치를 확인했어요. 원하는 거리를 골라 DB 저장 음식점을 찾아보세요.');setView('map');if(requestedRadius&&source!=='sample')void load(1,requestedRadius,p);}catch(e){if(version===locationVersion.current)setLocationMessage((e as Error).message)}finally{if(version===locationVersion.current)setLocating(false)}}
 async function load(nextPage=1,nextRadius=radius,nextLocation=location){
  if(source==='sample')return;
  request.current?.abort();const controller=new AbortController();request.current=controller;setLoading(true);setError('');
  try{
   let response:Response;
   if(nextLocation&&nextRadius){response=await fetch('/api/restaurants/nearby',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({center:nextLocation,radius:nextRadius,source,category,name:query})});}
   else{const p=new URLSearchParams({source,page:String(nextPage),category,name:query});if(source==='commercial')p.set('regionCode',regionCode);if(source==='licenses'&&address)p.set('address',address);response=await fetch(`/api/restaurants/db?${p}`,{signal:controller.signal});}
   let data=await response.json();let origin:'database'|'live'='database';
   if(response.status===503||(response.ok&&data.total===0&&nextPage===1)){response=await fetch('/api/restaurants',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({source,page:nextPage,regionCode,address,name:source==='licenses'?query:undefined,...(source==='commercial'&&nextLocation&&nextRadius?{center:nextLocation,radius:nextRadius}:{})})});data=await response.json();origin='live';}
   if(!response.ok)throw new Error(data.error||'조회하지 못했어요.');if(controller.signal.aborted)return;setLive(data.items);setPage(data.page);setTotal(data.total);setHasMore(data.hasMore);setSelected(undefined);setStorage(origin);
  }catch(e){if(!controller.signal.aborted){setError((e as Error).message);setLive([]);setPage(0);setTotal(0);setHasMore(false);}}finally{if(!controller.signal.aborted)setLoading(false)}
 }
 useEffect(()=>{if(params.get('nearby')!=='1')void load()},[]);
 useEffect(()=>{const key=`${query}|${category}`;if(lastFilters.current===key)return;lastFilters.current=key;if(storage!=='database'||source==='sample')return;const timer=setTimeout(()=>void load(1),300);return()=>clearTimeout(timer)},[query,category,storage]);
 function reset(){setQuery('');setCategory('전체');setRegion('전체');setRadius(0)}
 return <main className="page-shell">
  <div className="page-heading"><small>EXPLORE THE LITTLE TOWN</small><h1>맛있는 모험을 시작해요 <span>✦</span></h1><p>{mapReady?'준혁이랑 맛집 탐험을 시작해 볼까?':query?'어떤 맛집을 찾고 있어?':'준혁이와 함께 오늘의 한 입을 찾아봐요.'}</p></div>
  <section className="data-controls" aria-label="데이터와 위치 설정">
   <label>음식점 데이터 <select value={source} onChange={e=>{clearLive();setSource(e.target.value as typeof source);setRadius(0)}}><option value="sample">샘플 20개</option><option value="commercial">실제 음식점 · 상가정보</option><option value="licenses">실제 음식점 · 일반음식점 인허가</option></select></label>
   {source==='commercial'&&<><label>지역 선택 <select aria-label="지역 선택" value={regionOptions.some(n=>n.code===regionCode)?regionCode:'custom'} onChange={e=>{clearLive();setRegionCode(e.target.value==='custom'?'':e.target.value)}}><optgroup label="동네 예시">{neighborhoods.map(n=><option key={n.code} value={n.code}>{n.name}</option>)}</optgroup><optgroup label="시·도 전체 · 첫 20건">{provinces.map(n=><option key={n.code} value={n.code}>{n.name}</option>)}</optgroup><option value="custom">다른 지역 코드 입력</option></select><small>시·도 선택은 해당 지역 전체의 첫 20건을 보여줘요.</small></label>{!regionOptions.some(n=>n.code===regionCode)&&<label>지역 코드 <input aria-label="상가정보 지역 코드" value={regionCode} placeholder="행정동 8자리 (시·도 2자리, 시군구 5자리도 가능)" inputMode="numeric" onChange={e=>{clearLive();setRegionCode(e.target.value.replace(/\D/g,'').slice(0,8))}}/><small>직접 입력한 코드는 조회 시 공식 API에서 검증해요.</small></label>}</>}
   {source==='licenses'&&<label>지역 직접 입력 <input aria-label="일반음식점 지역" value={address} placeholder="예: 서울특별시 강남구" onChange={e=>{clearLive();setAddress(e.target.value)}}/><small>인허가 기록이며 현재 영업 중이라는 뜻은 아니에요.</small></label>}
   <div className="location-controls"><p>현재 위치는 직선거리(지표면 최단거리, 미터) 검색에 사용해요. DB 설정 후 좌표를 서버와 Supabase 검색 함수에 보내며 영구 저장하지 않아요.</p><button onClick={locate} disabled={locating}>{locating?'위치 확인 중…':'동의하고 현재 위치 확인'}</button>{location&&<button onClick={()=>{locationVersion.current++;setLocation(undefined);setRadius(0);setLocationMessage('위치 사용을 해제했어요.');clearLive()}}>위치 사용 해제</button>}<div className="radii"><button aria-pressed={!radius} onClick={()=>{setRadius(0);if(source!=='sample')void load(1,0)}}>거리 제한 없음</button>{[500,1000,3000].map(m=><button key={m} disabled={!location} aria-pressed={radius===m} onClick={()=>{setRadius(m);if(source!=='sample')void load(1,m)}}>{m===500?'500m':`${m/1000}km`}</button>)}</div><p role="status">{locationMessage}</p>{source==='sample'&&<small>샘플의 데모 좌표는 실제 거리 검색에서 제외해요.</small>}{storage==='live'&&<small>DB에 이 조건의 저장 자료가 없어 제공기관을 직접 조회했어요. DB 반경 검색 결과는 아닙니다.</small>}</div>
   {source!=='sample'&&<button className="primary" disabled={loading} onClick={()=>load()}>{loading?'조회 중…':'알아보기'}</button>}
  </section>
  <div className="search-panel"><label className="search-field"><span>⌕</span><input aria-label="음식점 이름 검색" placeholder="어떤 맛집을 찾고 있어요?" value={query} onChange={e=>setQuery(e.target.value)}/></label>{source==='sample'&&<select aria-label="탐험 지역" value={region} onChange={e=>setRegion(e.target.value)}><option>전체</option>{regions.map(r=><option key={r}>{r}</option>)}</select>}</div>
  <div className="filter-row">{['전체',...categories].map(c=><button key={c} aria-pressed={category===c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c!=='전체'&&<CategoryIcon category={c as typeof categories[number]} size={28}/>}<span>{c}</span></button>)}</div>
  {error&&<p className="data-error" role="alert">{error}</p>}
  {source!=='sample'&&<p className="data-notice">{storage==='database'?'Supabase DB 저장 자료 · 이름/업종 검색은 DB에 적용돼요.':'공공데이터 직접 조회 · 검색/필터는 현재 조회한 20건에 적용돼요.'} 출처별로 조회하며 자동 병합하지 않아요.{page>0&&` 전체 ${total.toLocaleString()}개 중 ${page}페이지`}{storage==='database'&&radius>0?' · 직선거리순 (미터)':''}</p>}
  <div className="result-bar"><p aria-live="polite">발견한 맛집 <strong>{items.length}</strong><span>{source==='sample'?'모두 가상 샘플 데이터':'공공데이터 · 출처/기준일 확인'}</span></p><div className="view-toggle"><button aria-pressed={view==='list'} onClick={()=>setView('list')}>☷ 목록</button><button aria-pressed={view==='map'} onClick={()=>setView('map')}>⌖ 카카오 지도</button></div></div>
  {!loading&&items.length===0&&<div className="empty"><h2>다른 곳도 함께 찾아볼까?</h2><p>{error?'공공데이터 조회에 실패했어요. 지역과 인증 설정을 확인한 뒤 다시 시도해 주세요.':source!=='sample'&&!page?'동네를 선택하고 알아보기를 눌러 주세요.':'조건에 맞는 음식점이 없어요. 좌표가 없는 음식점은 거리 검색과 지도 마커에서 제외돼요.'}</p><button className="primary" onClick={reset}>검색 조건 초기화</button></div>}
  {view==='map'?<div className="explore-map"><KakaoMap items={items} selected={current?.id} onSelect={setSelected} center={location} onReady={ready}/><aside><h2>{current?'선택한 맛집':'지도에서 핀을 눌러보세요'}</h2>{current?<Card restaurant={current}/>:<p>목록을 선택하면 해당 위치로 이동해요.</p>}<div className="map-list">{items.map(r=><button key={r.id} aria-pressed={selected===r.id} onClick={()=>setSelected(r.id)}>{r.name} <span>{!r.isSample&&!r.coordinates?'좌표 없음':r.category}</span></button>)}</div></aside></div>:<div className="restaurant-grid">{items.map(r=><Card key={r.id} restaurant={r}/>)}</div>}
  {source!=='sample'&&page>0&&<div className="pagination"><button disabled={loading||page<=1} onClick={()=>load(page-1)}>이전 페이지</button><span>{page}페이지</span><button disabled={loading||!hasMore} onClick={()=>load(page+1)}>다음 페이지</button></div>}
 </main>
}

