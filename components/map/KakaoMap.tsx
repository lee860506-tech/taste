'use client';
import { useEffect, useRef, useState } from 'react';
import type { Restaurant, Coordinates } from '@/types/restaurant';
import type { KakaoMaps, KakaoMapInstance, KakaoMarker, KakaoInfoWindow } from '@/types/kakao';
import { loadKakaoMaps } from '@/lib/kakao-loader';
import { mapPosition, SAMPLE_MAP_CENTER } from '@/lib/map-position';

export default function KakaoMap({ items, selected, onSelect, center, onReady }: { items: Restaurant[]; selected?: string; onSelect: (id: string) => void; center?: Coordinates; onReady?: () => void }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<KakaoMapInstance | null>(null);
  const markers = useRef(new Map<string, KakaoMarker>());
  const info = useRef<KakaoInfoWindow | null>(null);
  const [sdk, setSdk] = useState<KakaoMaps>();
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    loadKakaoMaps().then(api => {
      if (cancelled || !container.current) return;
      try {
        map.current = new api.Map(container.current, { center: new api.LatLng(SAMPLE_MAP_CENTER.latitude, SAMPLE_MAP_CENTER.longitude), level: 4 });
        setSdk(api);
        setStatus('ready');
        onReady?.();
      } catch { setStatus('error'); }
    }).catch(error => { if (!cancelled) setStatus(error.message === 'missing-key' ? 'missing' : 'error'); });
    const observer = new ResizeObserver(() => map.current?.relayout());
    if (container.current) observer.observe(container.current);
    return () => { cancelled = true; observer.disconnect(); map.current = null; };
  }, [attempt]);

  useEffect(() => {
    if (!sdk || !map.current) return;
    const bounds = new sdk.LatLngBounds();
    const listeners: { marker: KakaoMarker; click: () => void }[] = [];
    for (const restaurant of items) {
      const point = mapPosition(restaurant);
      if (!point) continue;
      const position = new sdk.LatLng(point.latitude, point.longitude);
      const marker = new sdk.Marker({ map: map.current, position, image: new sdk.MarkerImage('/assets/map-marker.svg', new sdk.Size(40,48)), title: `${restaurant.name}${restaurant.isSample ? ' · 샘플 위치' : ''}`, clickable: true });
      const click = () => onSelect(restaurant.id);
      sdk.event.addListener(marker, 'click', click);
      listeners.push({ marker, click });
      markers.current.set(restaurant.id, marker);
      bounds.extend(position);
    }
    if (listeners.length) map.current.setBounds(bounds);
    return () => {
      info.current?.close();
      for (const { marker, click } of listeners) { sdk.event.removeListener(marker, 'click', click); marker.setMap(null); }
      markers.current.clear();
    };
  }, [sdk, items, onSelect]);

  useEffect(() => {
    info.current?.close();
    for(const [id,marker] of markers.current){marker.setImage(new sdk!.MarkerImage(id===selected?'/assets/map-marker-selected.svg':'/assets/map-marker.svg',new sdk!.Size(40,48)));marker.setZIndex(id===selected?10:1);}
    const restaurant = items.find(item => item.id === selected);
    const marker = selected ? markers.current.get(selected) : undefined;
    if (!sdk || !map.current || !restaurant || !marker) return;
    const content = document.createElement('div');
    content.style.cssText = 'padding:12px 24px 12px 12px;min-width:180px;color:#4A3D39;font:13px Arial,sans-serif;line-height:1.8';
    const title = document.createElement('strong'); title.textContent = restaurant.name;
    const summary = document.createElement('div'); summary.textContent = `${restaurant.category} · ${restaurant.region}`;
    const sample = document.createElement('small'); sample.textContent = restaurant.isSample ? '샘플 데이터 · 가상 테스트 위치' : '실제 음식점 데이터';
    content.append(title, summary, sample);
    info.current = new sdk.InfoWindow({ content, removable: true });
    info.current.open(map.current, marker);
    const point = mapPosition(restaurant);
    if (!point) return;
    map.current.panTo(new sdk.LatLng(point.latitude, point.longitude));
  }, [sdk, selected, items]);

  useEffect(()=>{if(sdk && map.current && center && !selected)map.current.panTo(new sdk.LatLng(center.latitude,center.longitude));},[sdk,center,selected,items]);

  return <div className="map-wrap">
    <div className="map-label">⌖ 카카오 지도 <span>{items.some(r=>r.isSample)?'샘플 마커 · 가상 테스트 위치':'공공데이터 좌표'}</span></div>
    <div className="kakao-map-shell">
      <div ref={container} className="kakao-map-canvas" aria-label="카카오 지도" />
      {status !== 'ready' && <div className="map-status" role={status === 'error' ? 'alert' : 'status'}>
        <strong>{status === 'loading' ? '지도를 펼치는 중…' : status === 'missing' ? '카카오 지도 키를 입력해 주세요' : '지도를 불러오지 못했어요'}</strong>
        <p>{status === 'missing' ? '.env.local의 NEXT_PUBLIC_KAKAO_MAP_JS_KEY를 설정한 뒤 서버를 다시 실행해 주세요.' : status === 'error' ? '네트워크, JavaScript 키, 등록한 개발 주소를 확인해 주세요. 음식점 검색과 목록은 계속 사용할 수 있어요.' : '잠시만 기다려 주세요.'}</p>
        {status === 'error' && <button onClick={() => { setSdk(undefined); setAttempt(value => value + 1); }}>다시 시도</button>}
      </div>}
    </div>
    <p className="map-disclaimer">{items.some(r=>r.isSample)?'샘플 마커는 공식 예제 중심점 주변의 가상 테스트 좌표예요. 실제 가게 위치가 아니에요.':'좌표 검사를 통과한 음식점만 표시해요. 제공기관 정보에 위치 오차가 있을 수 있어요.'}</p>
  </div>;
}

