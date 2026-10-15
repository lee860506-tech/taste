// 행정동 코드는 소상공인 상가정보 storeListInDong 실제 응답의 adongCd/adongNm으로 확인했습니다.
export const neighborhoods = [
  {code: '11110615', name: '서울 종로구 종로1·2·3·4가동'},
  {code: '11110530', name: '서울 종로구 사직동'},
  {code: '50110630', name: '제주 제주시 아라동'},
] as const;

export const defaultNeighborhoodCode = neighborhoods[0].code;
