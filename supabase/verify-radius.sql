-- 마이그레이션 실행 후 SQL Editor에서 실행. 테스트 행은 마지막에 ROLLBACK됩니다.
begin;
insert into public.restaurants
  (source,source_id,name,address,category,raw_category,region,region_code,latitude,longitude)
values
  ('commercial','codex-radius-inside','codex-radius-fixture inside','test','한식','test','test','11110615',37.573,126.986),
  ('commercial','codex-radius-outside','codex-radius-fixture outside','test','한식','test','test','11110615',37.582,126.986)
on conflict (source,source_id) do update set latitude=excluded.latitude,longitude=excluded.longitude;

do $$
declare hits integer; point_lon double precision; point_lat double precision;
begin
  select count(*) into hits
  from public.search_restaurants_nearby(37.572,126.986,500,'commercial','한식','codex-radius-fixture',20);
  if hits <> 1 then raise exception '500m 안/밖 판정 실패: %건',hits; end if;
  select count(*) into hits
  from public.search_restaurants_nearby(37.572,126.986,1000,'commercial','한식','codex-radius-fixture',20);
  if hits <> 1 then raise exception '1km 안/밖 판정 실패: %건',hits; end if;
  select count(*) into hits
  from public.search_restaurants_nearby(37.572,126.986,3000,'commercial','한식','codex-radius-fixture',20);
  if hits <> 2 then raise exception '3km 안/밖 판정 실패: %건',hits; end if;
  if not exists (
    select 1 from public.search_restaurants_nearby(37.572,126.986,500,'commercial','한식','codex-radius-fixture',20)
    where source_id='codex-radius-inside' and distance_meters between 100 and 130
  ) then raise exception '거리 단위 또는 정렬 확인 실패'; end if;
  select extensions.st_x(location::extensions.geometry),extensions.st_y(location::extensions.geometry)
    into point_lon,point_lat from public.restaurants where source_id='codex-radius-inside';
  if abs(point_lon-126.986)>0.000001 or abs(point_lat-37.573)>0.000001
    then raise exception '경도(X) / 위도(Y) 저장 순서 오류'; end if;
end;
$$;
rollback;
