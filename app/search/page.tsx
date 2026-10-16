'use client';
import {useRouter} from 'next/navigation';
import {useState,type FormEvent} from 'react';

export default function SearchPage(){const router=useRouter();const[query,setQuery]=useState('');function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const value=query.trim();if(value)router.push(`/explore?query=${encodeURIComponent(value)}`)}return <main className="page-shell menu-page"><div className="page-heading"><small>FIND YOUR NEXT BITE</small><h1>맛집 이름 검색 <span>⌕</span></h1><p>어떤 맛집을 찾고 있어?</p></div><form className="menu-search" onSubmit={submit}><label htmlFor="menu-query">음식점 이름</label><div><input id="menu-query" autoFocus value={query} onChange={event=>setQuery(event.target.value)} placeholder="가게 이름을 입력해 주세요"/><button className="primary" type="submit" disabled={!query.trim()}>검색 ↗</button></div></form><p className="menu-explain">검색 결과에서 업종 필터와 카카오 지도를 함께 사용할 수 있어요.</p></main>}
