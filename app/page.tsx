'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {categories,type Restaurant} from '@/types/restaurant';
import {defaultNeighborhoodCode,neighborhoods,provinces,regionOptions} from '@/data/neighborhoods';
import CategoryIcon from '@/components/restaurant/CategoryIcon';
import {rememberRestaurant} from '@/lib/restaurant-cache';

const coverShops = [
  {id:'restaurant',label:'레스토랑',category:'한식',description:'그림 속 레스토랑 테마'},
  {id:'cafe',label:'카페',category:'카페',description:'그림 속 카페 테마'},
  {id:'bakery',label:'베이커리',category:'디저트',description:'그림 속 베이커리 테마'},
  {id:'dessert',label:'디저트',category:'디저트',description:'그림 속 디저트 테마'},
] as const;
type CoverShop = typeof coverShops[number];
type PublicRestaurant = Extract<Restaurant,{isSample:false}>;

export default function Home() {
  const router = useRouter();
  const [regionCode, setRegionCode] = useState<string>(defaultNeighborhoodCode);
  const validRegionCode = /^(\d{2}|\d{5}|\d{8})$/.test(regionCode);
  const exploreHref = '/explore?regionCode=' + encodeURIComponent(regionCode);
  const [activeShop,setActiveShop] = useState<CoverShop>();
  const [shopItems,setShopItems] = useState<PublicRestaurant[]>([]);
  const [shopLoading,setShopLoading] = useState(false);
  const [shopError,setShopError] = useState('');
  const [shopStorage,setShopStorage] = useState<'database'|'live'>('live');
  const shopRequest = useRef<AbortController | null>(null);
  const shopInfo = useRef<HTMLElement | null>(null);
  useEffect(()=>()=>shopRequest.current?.abort(),[]);

  async function showShop(shop:CoverShop){
    shopRequest.current?.abort();
    const controller=new AbortController();
    shopRequest.current=controller;
    setActiveShop(shop);setShopItems([]);setShopError('');setShopLoading(true);
    requestAnimationFrame(()=>shopInfo.current?.scrollIntoView({behavior:'smooth',block:'center'}));
    try{
      const p=new URLSearchParams({source:'commercial',page:'1',regionCode,category:shop.category});
      let response=await fetch(`/api/restaurants/db?${p}`,{signal:controller.signal});
      let data=await response.json();let origin:'database'|'live'='database';
      if(response.status===503||(response.ok&&data.total===0)){response=await fetch('/api/restaurants',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({source:'commercial',page:1,regionCode}),signal:controller.signal});data=await response.json();origin='live';}
      if(!response.ok)throw new Error(data.error||'음식점 정보를 불러오지 못했어요.');
      if(!controller.signal.aborted){setShopStorage(origin);setShopItems((data.items as Restaurant[]).filter((item):item is PublicRestaurant=>!item.isSample&&item.category===shop.category).slice(0,3));}
    }catch(error){if(!controller.signal.aborted)setShopError((error as Error).message)}
    finally{if(!controller.signal.aborted)setShopLoading(false)}
  }

  function changeRegion(code:string){shopRequest.current?.abort();setRegionCode(code);setActiveShop(undefined);setShopItems([]);setShopLoading(false);setShopError('')}

  return <main className="storybook-home">
    <section className="storybook-cover" aria-label="준혁이랑 냠냠지도 이야기 표지">
      <Image src="/assets/storybook-home.png" alt="지도를 든 준혁이와 파스텔빛 맛집 마을을 그린 동화풍 일러스트" width={1448} height={1086} priority sizes="100vw" />
      <h1 className="sr-only">준혁이랑 냠냠지도</h1>
      <nav className="cover-navigation" aria-label="표지 바로가기">
        <Link className="cover-hotspot cover-map" href="/explore?view=map" aria-label="맛집지도 보기" />
        <Link className="cover-hotspot cover-themes" href="#categories" aria-label="테마별 음식 찾기" />
        <Link className="cover-hotspot cover-regions" href="#regions" aria-label="지역별 찾기" />
        <Link className="cover-hotspot cover-recommend" href="#categories" aria-label="추천 음식 둘러보기" />
        <Link className="cover-hotspot cover-search" href="/explore" aria-label="음식점 검색" />
        <Link className="cover-hotspot cover-saved" href="/saved" aria-label="내 맛집 보기" />
      </nav>
      <Link className="cover-hotspot cover-start" href={exploreHref} aria-label="맛집 탐험 시작" />
      <Link className="cover-hotspot cover-nearby" href="/explore?nearby=1&radius=1000" aria-label="내 주변 1km 음식점 찾기" />
      {coverShops.map(shop=><button key={shop.id} type="button" className={`cover-hotspot cover-shop cover-shop-${shop.id}`} aria-label={`${shop.label} 아이콘: 선택한 동네의 실제 음식점 정보 보기`} onClick={()=>showShop(shop)}/>)}
    </section>

    {activeShop&&<section className="cover-shop-info" ref={shopInfo} aria-live="polite">
      <div className="cover-shop-info-heading"><div><small>✦ {activeShop.description}</small><h2>{activeShop.label} 음식점 정보</h2></div><button type="button" aria-label="상점 정보 닫기" onClick={()=>{shopRequest.current?.abort();setActiveShop(undefined)}}>×</button></div>
      <p>그림 속 상점은 테마 안내예요. 아래는 선택한 동네의 {shopStorage==='database'?'Supabase DB에 저장된 실제 음식점':'실제 공공데이터 첫 20건'}에서 찾은 음식점입니다.</p>
      {shopLoading?<p role="status">실제 음식점 정보를 불러오는 중…</p>:shopError?<p role="alert">{shopError}</p>:shopItems.length?<div className="cover-shop-results">{shopItems.map(item=><Link key={item.id} href={`/restaurants/${encodeURIComponent(item.id)}`} onClick={()=>{try{rememberRestaurant(item)}catch{}}}><strong>{item.name}</strong><span>{item.address||'주소 미제공'}</span><small>소상공인시장진흥공단 상가정보 · {item.rawCategory}</small></Link>)}</div>:<p>첫 20건에는 이 업종의 음식점이 없어요. 탐험 화면에서 다음 페이지도 살펴보세요.</p>}
      <Link className="cover-shop-more" href={`${exploreHref}&category=${encodeURIComponent(activeShop.category)}`}>이 업종 더 둘러보기 ↗</Link>
    </section>}

    <section className="story-mobile-panel" aria-label="탐험 시작">
      <span>✦ 준혁이와 함께 떠나는 맛집 탐험</span>
      <h2>오늘은 뭘 먹을까?</h2>
      <div className="story-mobile-actions"><Link className="story-secondary" href="/explore?nearby=1&radius=1000">⌖ 내 주변 찾기</Link></div>
    </section>

    <div className="story-intro-strip"><span>✦ STORYBOOK FOOD ADVENTURE</span><p>그림 속 마을을 지나, 오늘의 맛집을 찾아봐요.</p><span>실제 공공데이터 20건부터 탐험</span></div>

    <section id="categories" className="storybook-categories">
      <div className="section-heading"><div><small>CHOOSE YOUR FAVORITE</small><h2>어떤 맛을 찾아볼까요?</h2></div><Link href="/explore">전체 음식점 보기 ↗</Link></div>
      <div className="category-grid story-category-grid">{categories.map(category => <Link href={'/explore?category=' + encodeURIComponent(category) + '&regionCode=' + encodeURIComponent(regionCode)} key={category}><span><CategoryIcon category={category} size={80}/></span><strong>{category}</strong></Link>)}</div>
    </section>

    <section id="regions" className="storybook-discovery">
      <div className="storybook-region-card"><small>⌖ 마을에서 먼저 찾아보기</small><h2>어디로 떠나볼까요?</h2><p>지역을 고르면 실제 공공데이터에서 음식점 20건을 먼저 보여줘요.</p><label htmlFor="home-region">탐험할 지역</label><div className="storybook-region-actions"><select id="home-region" value={regionOptions.some(item=>item.code===regionCode)?regionCode:'custom'} onChange={event => changeRegion(event.target.value==='custom'?'':event.target.value)}><optgroup label="동네 예시">{neighborhoods.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}</optgroup><optgroup label="시·도 전체 · 첫 20건">{provinces.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}</optgroup><option value="custom">다른 지역 코드 직접 입력</option></select>{validRegionCode?<Link className="primary" href={exploreHref}>맛집 탐험 ↗</Link>:<button className="primary" disabled>지역 코드 입력 후 탐험</button>}</div>{!regionOptions.some(item=>item.code===regionCode)&&<input className="storybook-region-input" aria-label="지역 코드 직접 입력" value={regionCode} placeholder="시·도 2자리 / 시군구 5자리 / 행정동 8자리" inputMode="numeric" onChange={event=>changeRegion(event.target.value.replace(/\D/g,'').slice(0,8))}/>}<small>시·도 선택은 지역 전체의 첫 20건을 보여줘요. 다른 지역은 공식 행정구역 코드를 입력할 수 있어요.</small></div>
      <div className="storybook-nearby-card"><small>NEAR ME</small><h2>내 주변 맛집도 찾아봐요</h2><p>현재 위치를 확인한 뒤 원하는 거리를 선택해 탐색할 수 있어요.</p><div className="radii" aria-label="주변 탐색 거리">{[500, 1000, 3000].map(distance => <button key={distance} onClick={() => router.push('/explore?nearby=1&radius=' + distance)}>{distance < 1000 ? '500m' : distance / 1000 + 'km'}</button>)}</div><small>위치 권한은 탐험 화면에서 요청해요.</small></div>
    </section>
  </main>;
}
