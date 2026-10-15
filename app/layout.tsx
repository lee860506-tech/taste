import type {Metadata} from 'next';import './globals.css';import Navigation from '@/components/Navigation';import {FavoritesProvider} from '@/components/FavoritesProvider';
export const metadata:Metadata={title:'준혁이랑 냠냠지도 | MEHR · LUMI',description:'준혁이와 함께하는 작은 맛집 탐험. 샘플 데이터로 만나는 첫 번째 지도.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ko"><body><FavoritesProvider><Navigation/>{children}<footer>MEHR · LUMI <span>준혁이랑 함께, 맛있는 순간을 모아요.</span><small>샘플 및 공공데이터 · 각 카드의 출처를 확인해 주세요.</small></footer></FavoritesProvider></body></html>}
