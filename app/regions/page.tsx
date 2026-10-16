'use client';
import {useState} from 'react';
import Link from 'next/link';
import {neighborhoods,provinces} from '@/data/neighborhoods';

type Area={provinceCode:string;district:string;name:string;code:string};
const verified:Area[]=neighborhoods.map(item=>{const district=item.name.split(' ')[1];return {provinceCode:item.code.slice(0,2),district,name:item.name,code:item.code}});

export default function RegionsPage(){
 const[province,setProvince]=useState<string>(provinces[0].code);
 const[district,setDistrict]=useState('');
 const[dong,setDong]=useState('');
 const provinceName=provinces.find(item=>item.code===province)?.name||'';
 const available=verified.filter(item=>item.provinceCode===province);
 const districts=[...new Set(available.map(item=>item.district))];
 const dongs=available.filter(item=>item.district===district);
 const code=dong||(district?dongs[0]?.code.slice(0,5):undefined)||province;
 return <main className="page-shell menu-page"><div className="page-heading"><small>CHOOSE A TOWN</small><h1>지역별 찾기 <span>⌖</span></h1><p>어느 동네부터 가볼까?</p></div><p className="menu-explain">시·도 코드는 공식 응답에서 확인했고, 아래 시·군·구와 동 목록은 현재 확인한 행정동만 표시해요. 다른 지역은 시·도 전체 첫 20건을 조회할 수 있어요.</p><div className="region-pickers"><label>시·도<select value={province} onChange={event=>{setProvince(event.target.value);setDistrict('');setDong('')}}>{provinces.map(item=><option key={item.code} value={item.code}>{item.name}</option>)}</select></label><label>시·군·구<select value={district} onChange={event=>{setDistrict(event.target.value);setDong('')}}><option value="">전체</option>{districts.map(name=><option key={name} value={name}>{name}</option>)}</select></label><label>읍·면·동<select value={dong} disabled={!district} onChange={event=>setDong(event.target.value)}><option value="">전체</option>{dongs.map(item=><option key={item.code} value={item.code}>{item.name.split(' ').slice(2).join(' ')}</option>)}</select></label></div>{!available.length&&<p className="menu-explain">현재 확인된 세부 동네가 없어요. 시·도 전체의 음식점 첫 20건을 살펴볼 수 있습니다.</p>}<Link className="primary menu-action" href={`/explore?regionCode=${code}&view=map`}>{dong?verified.find(item=>item.code===dong)?.name:district?`${provinceName} ${district}`:provinceName} 맛집 지도 보기 ↗</Link><p className="menu-explain">지도는 조회된 실제 음식점 좌표에 맞춰 이동합니다. 결과나 좌표가 없으면 임의의 위치를 표시하지 않아요. 위치 권한 없이 사용할 수 있어요.</p></main>;
}
