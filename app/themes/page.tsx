import Link from 'next/link';
import CategoryIcon from '@/components/restaurant/CategoryIcon';
import {categories} from '@/types/restaurant';

export default function ThemesPage(){return <main className="page-shell menu-page"><div className="page-heading"><small>CHOOSE A FLAVOR</small><h1>테마별 찾기 <span>✦</span></h1><p>오늘은 어떤 게 먹고 싶어?</p></div><p className="menu-explain">공공데이터의 업종 분류로 확인된 음식점만 보여줘요. 혼밥·데이트 등 확인할 수 없는 특성은 분류하지 않아요.</p><div className="theme-grid">{categories.map(category=><Link key={category} href={`/explore?category=${encodeURIComponent(category)}&view=map`}><CategoryIcon category={category} size={82}/><strong>{category}</strong><span>음식점과 지도 보기 ↗</span></Link>)}</div></main>}
