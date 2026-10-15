# 카카오 지도 설정

## 키 입력
프로젝트 루트 `.env.local`에 카카오 **JavaScript 키**를 입력한다.
```env
NEXT_PUBLIC_KAKAO_MAP_JS_KEY=발급받은_JavaScript_키
```
REST API 키나 Admin 키를 넣지 않는다. `.env.local`은 Git에서 제외하고, 값이 비어 있는 `.env.example`만 커밋한다. NEXT_PUBLIC 변수는 브라우저에 공개되는 SDK 키이므로 카카오에서 허용 도메인을 제한한다.

## 개발 주소
카카오 개발자 사이트의 앱 → 앱 설정 → 앱 → 플랫폼 키에서 해당 JavaScript 키의 JavaScript SDK 도메인에 다음을 등록한다.
- `http://127.0.0.1:3001`
- `http://localhost:3001` (localhost로 접속할 경우)

공식 안내: https://apis.map.kakao.com/web/guide/
앱의 카카오맵 사용 설정도 확인한다. 허용 주소의 프로토콜·호스트·포트는 접속 주소와 일치해야 한다.

## 실행
```powershell
pnpm dev --port 3001
```
http://127.0.0.1:3001/explore 에서 카카오 지도 버튼을 누른다. 키 변경 후 개발 서버를 재시작한다. 프로덕션 실행은 키 입력 후 `pnpm build`와 `pnpm start --port 3001`을 실행한다. NEXT_PUBLIC 값은 빌드 시 고정되므로 기존 빌드를 재사용하지 않는다.

## 동작 및 현재 검증 상태
- 검색·업종 필터 결과 중 검증된 좌표만 마커로 사용한다. 샘플 좌표는 별도 데모 데이터이며 실제 음식점 위치가 아니다.
- 마커와 지도 옆 목록은 동일한 선택 상태를 사용하며, 선택하면 해당 위치로 지도를 이동하도록 구현했다.
- SDK 오류·등록 도메인 불일치·시간 초과 시 안내와 재시도 버튼을 보여 준다. 목록 검색은 계속 사용할 수 있다.
- 2026-10-15: `준혁이의 맛집` 앱(ID 1606587)의 JavaScript SDK 도메인에 `http://127.0.0.1:3001`을 등록하고 카카오맵 사용 설정을 켰다. SDK 요청 HTTP 200, 브라우저에서 실제 지도 타일·샘플 마커·목록 선택에 따른 이동·마커 클릭에 따른 상세 카드 동기화를 확인했다.
- 공공데이터 API 두 종류는 별도로 연결되어 실제 응답을 확인했다. 2026-10-15에 Supabase 저장과 PostGIS 반경 검색도 연결해 검증했다.

현재 PC에서 pnpm 명령을 찾을 수 없다면:
```powershell
& 'C:\Users\406\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' dev --port 3001
```

