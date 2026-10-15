import type {Coordinates} from '@/types/restaurant';
// Synthetic marker fixtures around Kakao's guide example. Not business locations.
export const demoCoordinates:Readonly<Record<string,Coordinates>>=Object.fromEntries(Array.from({length:20},(_,i)=>[`sample-${i+1}`,{latitude:33.450701+((20+Math.floor(i/5)*19)-50)*0.00004,longitude:126.570667+((15+(i%5)*17)-50)*0.00005}]));
