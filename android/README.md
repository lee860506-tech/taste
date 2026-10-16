# 준혁이랑 냠냠지도 Android 앱

이 Android Studio 프로젝트는 기존 Next.js 사이트를 WebView에 표시합니다. 원본 이미지와 웹 디자인을 수정하지 않으며, 음식점 조회·카카오 지도·검색·필터는 기존 웹 서버에서 실행됩니다. 공공데이터와 Supabase 비밀 키는 Android 앱에 넣지 않습니다.

## 개발용 에뮬레이터 실행

1. 앱의 기본 주소는 `https://taste-sooty.vercel.app/`입니다. 배포 서버를 쓰지 않고 PC의 웹을 시험하려면 저장소 루트에서 `.env.local`을 설정하고 `pnpm install`, `pnpm dev --port 3001`을 실행합니다.
2. Android Studio에서 이 `android` 폴더를 프로젝트로 엽니다. SDK Platform 37과 Build Tools 36이 필요합니다.
3. PC 로컬 웹을 시험할 때는 `android/local.properties`에 `web.debug.url=http://127.0.0.1:3001/`을 넣고, 에뮬레이터를 켠 다음 `adb reverse tcp:3001 tcp:3001`을 실행합니다.
4. Android Studio의 **Run app**을 누릅니다. 또는 `./gradlew assembleDebug` 후 `app/build/outputs/apk/debug/app-debug.apk`를 설치합니다.

로컬 웹을 사용하는 경우 에뮬레이터를 재시작하면 `adb reverse`를 다시 실행해야 합니다. 개발용 `http` 접속은 debug 빌드에만 허용됩니다. 웹 서버가 꺼져 있으면 앱의 다시 시도 화면이 나타납니다.

## 실제 기기/배포 빌드

현재 기본 주소는 `https://taste-sooty.vercel.app/`입니다. 다른 Next.js 사이트로 옮길 때는 `android/local.properties`에 아래 한 줄을 추가한 다음 릴리스 빌드를 만드세요. Supabase 프로젝트 URL은 웹사이트 주소가 아닙니다.

```properties
web.base.url=https://실제-배포-도메인/
```

이 파일은 Git에서 제외됩니다. `web.base.url`을 설정하면 디버그 앱도 해당 공개 주소를 사용합니다. 디버그 앱만 PC 로컬 서버에 연결하려면 `web.debug.url=http://127.0.0.1:3001/`도 추가하세요. 카카오 개발자 콘솔의 JavaScript SDK 허용 도메인에도 동일한 HTTPS 원본을 등록해야 합니다. 기존 Next.js 서버 환경변수와 DB 마이그레이션도 해당 배포 환경에 설정해야 합니다. 서명 키가 없는 상태에서 만들어지는 기본 release APK는 배포용으로 서명되지 않으므로 Google Play 게시 전에 서명 구성이 필요합니다.

앱은 위치 요청 시 Android 위치 권한을 요청하고, 사이트가 아닌 외부 링크는 시스템 브라우저로 엽니다. Android 시스템 뒤로 가기는 웹 탐색 기록으로 이동합니다.
