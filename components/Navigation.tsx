'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

const menus = [
  {href:'/',label:'홈',short:'⌂ 홈'},
  {href:'/explore?view=map',path:'/explore',label:'맛집지도',short:'⌖ 지도'},
  {href:'/themes',label:'테마별 찾기',short:'♨ 테마'},
  {href:'/regions',label:'지역별 찾기',short:'⌖ 지역'},
  {href:'/courses',label:'추천 코스',short:'✦ 코스'},
  {href:'/search',label:'검색',short:'⌕ 검색'},
  {href:'/saved',label:'내 맛집',short:'♡ 찜'},
] as const;

export default function Navigation(){
  const path=usePathname();
  const links=(mobile:boolean)=>menus.map(menu=><Link key={menu.href} href={menu.href} aria-current={path===('path' in menu?menu.path:menu.href)?'page':undefined} aria-label={menu.label}>{mobile?menu.short:menu.label}</Link>);
  return <><header className={path==='/'?'header home-header':'header'}><Link href="/" className="brand"><span className="brand-icon">✦</span><span><small>MEHR · LUMI</small><strong>준혁이랑 냠냠지도</strong></span></Link><nav aria-label="주 메뉴">{links(false)}</nav></header><nav className="bottom-nav" aria-label="모바일 메뉴">{links(true)}</nav></>;
}
