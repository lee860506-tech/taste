import {Suspense} from 'react';import ExplorerRoute from '@/components/restaurant/ExplorerRoute';
export default function Explore(){return <Suspense fallback={<main className="page-shell">탐험 지도를 펼치는 중…</main>}><ExplorerRoute/></Suspense>}
