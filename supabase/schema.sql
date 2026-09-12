-- ProScout Supabase schema
-- Run this whole file in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  account_type text not null
    check (account_type in ('player','club')),

  full_name text not null,

  email text,
  phone text,
  instagram text,
  contact_email text,

  country text,
  city text,

  age integer
    check (
      age is null
      or (
        age >= 5
        and age <= 70
      )
    ),

  position text,
  preferred_foot text,
  height_cm integer,
  playing_level text,
  current_club text,
  bio text,

  official_website text,
  official_instagram text,
  league text,
  verification_contact text,

  verification_status text not null
    default 'not_required'
    check (
      verification_status in (
        'not_required',
        'pending',
        'verified',
        'rejected'
      )
    ),

  club_verified boolean not null
    default false,

  is_suspended boolean not null
    default false,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now()
);


create table if not exists public.admin_users (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  created_at timestamptz not null
    default now()
);


create table if not exists public.videos (
  id uuid primary key
    default gen_random_uuid(),

  player_id uuid not null
    references public.profiles(id)
    on delete cascade,

  title text not null
    default 'Football video',

  description text not null
    default '',

  video_url text not null,

  storage_path text,

  duration_seconds integer not null
    check (
      duration_seconds between 1 and 120
    ),

  likes_count integer not null
    default 0,

  views_count integer not null
    default 0,

  created_at timestamptz not null
    default now()
);


create table if not exists public.video_likes (
  video_id uuid not null
    references public.videos(id)
    on delete cascade,

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  created_at timestamptz not null
    default now(),

  primary key (
    video_id,
    user_id
  )
);


create table if not exists public.saved_players (
  club_id uuid not null
    references public.profiles(id)
    on delete cascade,

  player_id uuid not null
    references public.profiles(id)
    on delete cascade,

  created_at timestamptz not null
    default now(),

  primary key (
    club_id,
    player_id
  )
);


create table if not exists public.trial_invitations (
  id uuid primary key
    default gen_random_uuid(),

  club_id uuid not null
    references public.profiles(id)
    on delete cascade,

  player_id uuid not null
    references public.profiles(id)
    on delete cascade,

  date date not null,

  time time not null,

  location text not null,

  message text not null
    default '',

  status text not null
    default 'pending'
    check (
      status in (
        'pending',
        'accepted',
        'declined',
        'reschedule_requested',
        'cancelled'
      )
    ),

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now()
);


create table if not exists public.messages (
  id uuid primary key
    default gen_random_uuid(),

  club_id uuid not null
    references public.profiles(id)
    on delete cascade,

  player_id uuid not null
    references public.profiles(id)
    on delete cascade,

  sender_id uuid not null
    references auth.users(id)
    on delete cascade,

  body text not null
    check (
      length(trim(body)) > 0
      and length(body) <= 3000
    ),

  created_at timestamptz not null
    default now()
);


create table if not exists public.reports (
  id uuid primary key
    default gen_random_uuid(),

  reporter_id uuid not null
    references auth.users(id)
    on delete cascade,

  target_type text not null
    check (
      target_type in (
        'profile',
        'video',
        'message'
      )
    ),

  target_id uuid not null,

  reason text not null,

  details text not null
    default '',

  status text not null
    default 'open'
    check (
      status in (
        'open',
        'reviewing',
        'resolved',
        'dismissed'
      )
    ),

  created_at timestamptz not null
    default now()
);


create index if not exists
videos_player_idx
on public.videos(player_id);


create index if not exists
videos_likes_idx
on public.videos(likes_count desc);


create index if not exists
profiles_search_idx
on public.profiles(
  account_type,
  country,
  city,
  position,
  age
);


create index if not exists
messages_club_idx
on public.messages(
  club_id,
  created_at
);


create index if not exists
messages_player_idx
on public.messages(
  player_id,
  created_at
);


create or replace function
public.is_admin()
returns boolean
language sql
security definer
stable
set search_path=public
as $$
  select exists(
    select 1
    from public.admin_users
    where user_id=auth.uid()
  );
$$;


grant execute on function
public.is_admin()
to authenticated;


create or replace function
public.increment_video_view(
  p_video_id uuid
)
returns void
language sql
security definer
set search_path=public
as $$
  update public.videos
  set views_count = views_count + 1
  where id = p_video_id;
$$;


grant execute on function
public.increment_video_view(uuid)
to anon, authenticated;


create or replace function
public.like_count_trigger()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin

  if tg_op='INSERT' then

    update public.videos
    set likes_count =
      likes_count + 1
    where id = new.video_id;

    return new;

  end if;


  if tg_op='DELETE' then

    update public.videos
    set likes_count =
      greatest(
        0,
        likes_count - 1
      )
    where id = old.video_id;

    return old;

  end if;


  return null;

end
$$;


drop trigger if exists
video_like_count
on public.video_likes;


create trigger video_like_count
after insert or delete
on public.video_likes
for each row
execute function
public.like_count_trigger();


create or replace function
public.enforce_five_videos()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin

  if (
    select account_type
    from public.profiles
    where id = new.player_id
  ) <> 'player' then

    raise exception
      'Only player accounts can upload videos';

  end if;


  if (
    select count(*)
    from public.videos
    where player_id = new.player_id
  ) >= 5 then

    raise exception
      'A player can have at most 5 videos';

  end if;


  return new;

end
$$;


drop trigger if exists
video_limit
on public.videos;


create trigger video_limit
before insert
on public.videos
for each row
execute function
public.enforce_five_videos();


create or replace function
public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin

  if not exists(
    select 1
    from public.profiles
    where id = new.id
  ) then

    insert into public.profiles(
      id,
      account_type,
      full_name,
      email,
      contact_email,
      verification_status
    )

    values(
      new.id,

      coalesce(
        new.raw_user_meta_data
          ->>'account_type',
        'player'
      ),

      coalesce(
        new.raw_user_meta_data
          ->>'full_name',
        split_part(
          new.email,
          '@',
          1
        )
      ),

      new.email,

      new.email,

      case
        when coalesce(
          new.raw_user_meta_data
            ->>'account_type',
          'player'
        ) = 'club'

        then 'pending'

        else 'not_required'
      end
    );

  end if;

  return new;

end
$$;


drop trigger if exists
on_auth_user_created
on auth.users;


create trigger
on_auth_user_created
after insert
on auth.users
for each row
execute function
public.handle_new_auth_user();


alter table public.profiles
enable row level security;

alter table public.admin_users
enable row level security;

alter table public.videos
enable row level security;

alter table public.video_likes
enable row level security;

alter table public.saved_players
enable row level security;

alter table public.trial_invitations
enable row level security;

alter table public.messages
enable row level security;

alter table public.reports
enable row level security;


drop policy if exists
profiles_public_read
on public.profiles;


create policy
profiles_public_read
on public.profiles
for select
using (
  is_suspended = false
  or id = auth.uid()
  or public.is_admin()
);


drop policy if exists
profiles_insert_self
on public.profiles;


create policy
profiles_insert_self
on public.profiles
for insert
with check (
  id = auth.uid()
);


drop policy if exists
profiles_update_self
on public.profiles;


create policy
profiles_update_self
on public.profiles
for update
using (
  id = auth.uid()
)
with check (
  id = auth.uid()
);


drop policy if exists
profiles_admin_update
on public.profiles;


create policy
profiles_admin_update
on public.profiles
for update
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


drop policy if exists
admin_self_read
on public.admin_users;


create policy
admin_self_read
on public.admin_users
for select
using (
  user_id = auth.uid()
  or public.is_admin()
);


create policy
videos_public_read
on public.videos
for select
using (
  exists(
    select 1
    from public.profiles p
    where p.id = videos.player_id
    and (
      p.is_suspended = false
      or p.id = auth.uid()
    )
  )
);


create policy
videos_player_insert
on public.videos
for insert
with check (
  player_id = auth.uid()
);


create policy
videos_player_update
on public.videos
for update
using (
  player_id = auth.uid()
  or public.is_admin()
)
with check (
  player_id = auth.uid()
  or public.is_admin()
);


create policy
videos_player_delete
on public.videos
for delete
using (
  player_id = auth.uid()
  or public.is_admin()
);


create policy
likes_read
on public.video_likes
for select
using (true);


create policy
likes_insert_self
on public.video_likes
for insert
with check (
  user_id = auth.uid()
);


create policy
likes_delete_self
on public.video_likes
for delete
using (
  user_id = auth.uid()
);


create policy
saved_club_all
on public.saved_players
for all
using (
  club_id = auth.uid()
)
with check (
  club_id = auth.uid()
  and exists(
    select 1
    from public.profiles
    where id = auth.uid()
    and account_type = 'club'
  )
);


create policy
trials_participant_read
on public.trial_invitations
for select
using (
  club_id = auth.uid()
  or player_id = auth.uid()
  or public.is_admin()
);


create policy
trials_verified_club_insert
on public.trial_invitations
for insert
with check (
  club_id = auth.uid()
  and exists(
    select 1
    from public.profiles
    where id = auth.uid()
    and account_type = 'club'
    and club_verified = true
    and is_suspended = false
  )
);


create policy
trials_participant_update
on public.trial_invitations
for update
using (
  club_id = auth.uid()
  or player_id = auth.uid()
  or public.is_admin()
)
with check (
  club_id = auth.uid()
  or player_id = auth.uid()
  or public.is_admin()
);


create policy
messages_participant_read
on public.messages
for select
using (
  club_id = auth.uid()
  or player_id = auth.uid()
  or public.is_admin()
);


create policy
messages_verified_club_insert
on public.messages
for insert
with check (
  club_id = auth.uid()
  and sender_id = auth.uid()
  and exists(
    select 1
    from public.profiles
    where id = auth.uid()
    and account_type = 'club'
    and club_verified = true
    and is_suspended = false
  )
);


create policy
reports_insert_self
on public.reports
for insert
with check (
  reporter_id = auth.uid()
);


create policy
reports_admin_read
on public.reports
for select
using (
  public.is_admin()
);


create policy
reports_admin_update
on public.reports
for update
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


insert into storage.buckets(
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)

values(
  'player-videos',
  'player-videos',
  true,
  157286400,
  array[
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'video/ogg'
  ]
)

on conflict(id)
do update set
  public = true,
  file_size_limit = 157286400,
  allowed_mime_types =
    excluded.allowed_mime_types;


create policy
storage_public_video_read
on storage.objects
for select
using (
  bucket_id = 'player-videos'
);


create policy
storage_player_upload
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'player-videos'
  and
  (storage.foldername(name))[1]
    = auth.uid()::text
);


create policy
storage_player_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'player-videos'
  and
  (storage.foldername(name))[1]
    = auth.uid()::text
)
with check (
  bucket_id = 'player-videos'
  and
  (storage.foldername(name))[1]
    = auth.uid()::text
);


create policy
storage_player_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'player-videos'
  and
  (storage.foldername(name))[1]
    = auth.uid()::text
);
