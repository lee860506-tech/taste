'use client';
import Link from 'next/link';
import {cachedRestaurants} from '@/lib/restaurant-cache';
import {useFavorites} from '@/components/FavoritesProvider';
import {restaurantRepository} from '@/lib/restaurants';
import Card from '@/components/restaurant/Card';

export default function Saved(){const{ids,ready}=useFavorites();const items=[...restaurantRepository.list(),...(ready?cachedRestaurants():[])].filter(r=>ids.includes(r.id));return <main className="page-shell"><div className="page-heading"><small>MY LITTLE STAMP BOOK</small><h1>내 맛집 스탬프북 <span>♡</span></h1><p>마음에 드는 곳을 모아보자!</p></div><div className="result-bar"><p>모아둔 맛집 <strong>{items.length}</strong></p><span>이 브라우저에 저장돼요</span></div>{!ready?<p>스탬프북을 펼치는 중…</p>:items.length?<div className="saved-grid">{items.map(r=><div key={r.id}><Card restaurant={r}/><Link className="saved-map-link" href={`/explore?view=map&query=${encodeURIComponent(r.name)}&select=${encodeURIComponent(r.id)}&source=${r.isSample?'sample':r.source}`}>⌖ 지도에서 위치 확인 ↗</Link></div>)}</div>:<div className="empty"><span>♡</span><h2>아직 빈 페이지예요</h2><p>준혁이: “마음에 드는 곳을 모아보자!”<br/>맛집 카드의 하트를 눌러 첫 추억을 모아보세요.</p><Link href="/explore" className="primary">맛집 둘러보기 ↗</Link></div>}</main>}
