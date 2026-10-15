export interface KakaoPosition {}
export interface KakaoMapInstance { panTo(position: KakaoPosition): void; setBounds(bounds: KakaoBounds): void; relayout(): void }
export interface KakaoBounds { extend(position: KakaoPosition): void }
export interface KakaoMarkerImage {}
export interface KakaoMarker { setMap(map: KakaoMapInstance | null): void; setImage(image:KakaoMarkerImage):void; setZIndex(index:number):void }
export interface KakaoInfoWindow { open(map: KakaoMapInstance, marker: KakaoMarker): void; close(): void }
export interface KakaoMaps {
  load(callback: () => void): void;
  LatLng: new (latitude: number, longitude: number) => KakaoPosition;
  LatLngBounds: new () => KakaoBounds;
  Map: new (container: HTMLElement, options: { center: KakaoPosition; level: number }) => KakaoMapInstance;
  Size: new(width:number,height:number)=>object;
  MarkerImage: new(src:string,size:object)=>KakaoMarkerImage;
  Marker: new (options: { position: KakaoPosition; title: string; clickable: boolean; map: KakaoMapInstance; image?:KakaoMarkerImage }) => KakaoMarker;
  InfoWindow: new (options: { content: HTMLElement; removable: boolean }) => KakaoInfoWindow;
  event: { addListener(target: KakaoMarker, type: 'click', callback: () => void): void; removeListener(target: KakaoMarker, type: 'click', callback: () => void): void };
}
declare global { interface Window { kakao?: { maps: KakaoMaps } } }
