'use client';
import {useState} from 'react';
export default function Character(){const[failed,setFailed]=useState(false);return <figure className="character-sheet">{failed?<p>캐릭터 시트를 불러오지 못했어요.</p>:<img src="/assets/junhyuk-sheet.png" alt="흰색 MEHR 티셔츠를 입은 이준혁의 원본 캐릭터 시트" onError={()=>setFailed(true)}/>}<figcaption>우리의 탐험 가이드, 준혁이 <span>제공된 원본 캐릭터 시트</span></figcaption></figure>}
