create table if not exists rain_clips (
  id text primary key,
  region_id text not null,
  place text not null,
  intensity text not null,
  mime text not null,
  bytes bytea not null,
  created_at timestamptz not null default now()
);
