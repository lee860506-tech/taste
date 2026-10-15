import type {Coordinates} from '@/types/restaurant';
import {validCoordinates} from './geo';
export function locationError(code:number){return code===1?'괜찮아! 동네를 직접 골라도 돼.':code===3?'위치 확인 시간이 초과됐어요. 다시 시도하거나 지역을 직접 선택해 주세요.':'현재 위치를 확인하지 못했어요. 지역을 직접 선택해 주세요.';}
export function getCurrentLocation():Promise<Coordinates>{return new Promise((resolve,reject)=>{
 if(!window.isSecureContext||!navigator.geolocation){reject(new Error('이 환경에서는 위치를 사용할 수 없어요. HTTPS 또는 localhost에서 열거나 지역을 직접 선택해 주세요.'));return;}
 navigator.geolocation.getCurrentPosition(position=>{const p={latitude:position.coords.latitude,longitude:position.coords.longitude};if(validCoordinates(p))resolve(p);else reject(new Error('올바른 위치 좌표를 받지 못했어요.'));},error=>reject(new Error(locationError(error.code))),{enableHighAccuracy:false,timeout:10000,maximumAge:60000});
});}
