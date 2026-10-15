# 프로젝트 구조

```text
app/                         App Router 페이지 및 공통 스타일
  explore/                   탐험
  restaurants/[id]/          음식점 상세
  saved/                     내 맛집
components/
  character/                 원본 시트·말풍선
  map/                       외부 지도와 분리한 시연 지도
  restaurant/                카드·검색 화면
data/                        가상 음식점 20개와 지역 설정
lib/                         저장 모듈 및 데이터 접근 경계
types/                       샘플/실제 데이터 구분 타입
public/assets/               첨부 원본 복사본
```

현재 repository는 샘플을 반환한다. 실제 연동 시 공식 명세에 맞춘 어댑터를 교체한다. 지도 컴포넌트는 음식점 배열과 선택 ID를 받아 데이터 접근과 분리한다. 찜 저장은 별도 모듈로 추후 계정 저장소로 교체한다. 실제 데이터에는 검증된 위치와 출처가 필요하다.
