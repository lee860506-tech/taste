import {Suspense} from 'react';import Explorer from '@/components/restaurant/Explorer';
export default function Explore(){return <Suspense fallback={<main className="page-shell">탐험 지도를 펼치는 중…</main>}><Explorer/></Suspense>}
