// 행정동 코드는 소상공인 상가정보 storeListInDong 실제 응답의 adongCd/adongNm으로 확인했습니다.
export const neighborhoods = [
  {code: '11110615', name: '서울 종로구 종로1·2·3·4가동'},
  {code: '11110530', name: '서울 종로구 사직동'},
  {code: '50110630', name: '제주 제주시 아라동'},
] as const;

// 시·도 코드는 상가정보 storeListInDong의 ctprvnCd 조회 응답을 확인한 값입니다.
// 광역 지역은 해당 지역 전체에서 첫 페이지 20건을 가져옵니다.
export const provinces = [
  {code:'11',name:'서울특별시'},
  {code:'26',name:'부산광역시'},
  {code:'27',name:'대구광역시'},
  {code:'28',name:'인천광역시'},
  {code:'30',name:'대전광역시'},
  {code:'31',name:'울산광역시'},
  {code:'36',name:'세종특별자치시'},
  {code:'41',name:'경기도'},
  {code:'43',name:'충청북도'},
  {code:'44',name:'충청남도'},
  {code:'47',name:'경상북도'},
  {code:'48',name:'경상남도'},
  {code:'50',name:'제주특별자치도'},
  {code:'51',name:'강원특별자치도'},
  {code:'52',name:'전북특별자치도'},
] as const;

export const regionOptions = [...neighborhoods,...provinces];

export const defaultNeighborhoodCode = neighborhoods[0].code;
