-- Supabase Dashboard > SQL Editor에서 전체 실행합니다.
-- PostGIS geography는 경도(X), 위도(Y) 순서이며 거리 단위는 미터입니다.
create schema if not exists extensions;
create extension if not exists postgis with schema extensions;

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('commercial', 'licenses')),
  source_id text not null,
  name text not null,
  address text not null default '',
  category text not null,
  raw_category text not null default '',
  region text not null default '',
  region_code text,
  latitude double precision,
  longitude double precision,
  location extensions.geography(Point, 4326),
  source_updated_at text,
  business_status text,
  fetched_at timestamptz not null default now(),
  constraint restaurants_source_id_unique unique (source, source_id),
  constraint restaurants_coordinate_pair check (
    (latitude is null and longitude is null) or
    (latitude between -90 and 90 and longitude between -180 and 180)
  )
);

create or replace function public.set_restaurant_location()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.latitude is null then
    new.location := null;
  else
    new.location := extensions.st_setsrid(
      extensions.st_makepoint(new.longitude, new.latitude), 4326
    )::extensions.geography;
  end if;
  return new;
end;
$$;

drop trigger if exists restaurants_location_trigger on public.restaurants;
create trigger restaurants_location_trigger
before insert or update of latitude, longitude on public.restaurants
for each row execute function public.set_restaurant_location();

create index if not exists restaurants_location_gist on public.restaurants using gist (location);
create index if not exists restaurants_region_source_idx on public.restaurants (source, region_code);
create index if not exists restaurants_name_idx on public.restaurants (name);

alter table public.restaurants enable row level security;
revoke all on public.restaurants from anon, authenticated;
grant select on public.restaurants to anon, authenticated;
grant select, insert, update, delete on public.restaurants to service_role;
drop policy if exists "Public restaurant read" on public.restaurants;
create policy "Public restaurant read" on public.restaurants
for select to anon, authenticated using (true);
-- INSERT/UPDATE/DELETE 정책을 만들지 않습니다. service_role만 RLS를 우회해 동기화합니다.

create or replace function public.search_restaurants_nearby(
  p_lat double precision,
  p_lon double precision,
  p_radius_m integer,
  p_source text default null,
  p_category text default null,
  p_name text default null,
  p_limit integer default 20
)
returns table (
  id uuid, source text, source_id text, name text, address text,
  category text, raw_category text, region text, region_code text,
  latitude double precision, longitude double precision,
  source_updated_at text, business_status text, fetched_at timestamptz,
  distance_meters double precision
)
language sql stable security invoker set search_path = '' as $$
  select r.id, r.source, r.source_id, r.name, r.address,
         r.category, r.raw_category, r.region, r.region_code,
         r.latitude, r.longitude, r.source_updated_at, r.business_status,
         r.fetched_at,
         extensions.st_distance(
           r.location,
           extensions.st_setsrid(extensions.st_makepoint(p_lon, p_lat), 4326)::extensions.geography
         )::double precision as distance_meters
  from public.restaurants r
  where p_lat between -90 and 90 and p_lon between -180 and 180
    and p_radius_m in (500, 1000, 3000)
    and r.location is not null
    and extensions.st_dwithin(
      r.location,
      extensions.st_setsrid(extensions.st_makepoint(p_lon, p_lat), 4326)::extensions.geography,
      p_radius_m
    )
    and (p_source is null or r.source = p_source)
    and (p_category is null or r.category = p_category)
    and (p_name is null or position(lower(trim(p_name)) in lower(r.name)) > 0)
  order by distance_meters, r.id
  limit least(greatest(coalesce(p_limit, 20), 1), 50);
$$;

revoke all on function public.search_restaurants_nearby(
  double precision, double precision, integer, text, text, text, integer
) from public;
grant execute on function public.search_restaurants_nearby(
  double precision, double precision, integer, text, text, text, integer
) to anon, authenticated, service_role;

-- 실행 후 확인: SELECT count(*) FROM public.restaurants;
-- 테스트 좌표를 실서비스 테이블에 삽입하지 마세요. 반경 검증은 별도 롤백 테스트 파일을 사용합니다.
