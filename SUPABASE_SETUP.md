# Supabase DB 연결

2026-10-15에 새 Supabase 프로젝트에서 `public.restaurants` 마이그레이션을 실행하고 첫 동네 음식점 20건을 저장했습니다. 다른 지역에 DB 자료가 없으면 화면은 출처를 표시하며 기존 공공데이터 API 직접 조회로 전환합니다. 새 환경에서 다시 설치할 때는 아래 순서를 따르세요.

1. Supabase Dashboard → SQL Editor → New query에서 [`supabase/migrations/20261015_restaurants_postgis.sql`](supabase/migrations/20261015_restaurants_postgis.sql) 전체를 실행합니다. PostGIS 확장, 테이블, 중복 방지 제약, 위치 트리거·공간 인덱스, RLS, 반경 검색 함수가 생성됩니다.
2. 프로젝트 루트 `.env.local`에 다음 값을 설정합니다. URL·공개 키는 기존 값이 있으면 유지합니다. `SUPABASE_SECRET_KEY`는 Supabase Dashboard → Project Settings → API Keys의 **secret key (`sb_secret_…`)**입니다. 공개 키나 공공데이터 인증키를 이 자리에 넣지 마세요.

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   SUPABASE_SECRET_KEY=sb_secret_...
   RESTAURANT_SYNC_TOKEN=<길고 임의적인 서버 동기화 토큰>
   ```

3. 개발 서버를 재시작합니다: `pnpm dev --port 3001`.
4. PowerShell에서 첫 동네 20건을 저장합니다: `./scripts/sync-restaurants.ps1 -RegionCode 11110615 -Page 1`. 다음 20건은 `-Page 2`입니다. 같은 페이지를 다시 실행하면 `(source, source_id)` 기준으로 기존 행을 갱신합니다. 일반음식점 인허가 예: `./scripts/sync-restaurants.ps1 -Source licenses -Address '서울특별시 종로구' -Page 1`.
5. `http://127.0.0.1:3001/explore?regionCode=11110615`에서 `Supabase DB 저장 자료` 문구와 음식점을 확인하고 새로고침합니다. 상세 화면도 DB에서 원본 ID로 조회합니다.
6. [`supabase/verify-radius.sql`](supabase/verify-radius.sql)을 SQL Editor에서 실행합니다. 트랜잭션 안에서 500m 안/밖과 경도(X)·위도(Y)를 검증한 뒤 `ROLLBACK`으로 테스트 행을 제거합니다. 브라우저 위치 권한을 허용해 500m/1km/3km를 선택하면 DB가 미터 단위로 거리순 결과를 반환합니다.

공개 열람에는 RLS `SELECT` 정책만 허용하고, 브라우저의 INSERT/UPDATE/DELETE 권한은 제거했습니다. 수집은 별도 보호 토큰을 요구하는 Next.js 서버 Route Handler에서만 수행하며, Supabase secret key는 서버 모듈 밖으로 전달하지 않습니다. 지도·목록에는 같은 DB 응답을 사용합니다. 반경은 경로 이동거리가 아닌 직선거리(지표면 최단거리)입니다.

참고: [Supabase API 키](https://supabase.com/docs/guides/getting-started/api-keys), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Supabase PostGIS](https://supabase.com/docs/guides/database/extensions/postgis).
