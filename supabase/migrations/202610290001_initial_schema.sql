  create extension if not exists pgcrypto;

  create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    name text not null check (length(trim(name)) between 2 and 100),
    slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    description text not null check (length(trim(description)) between 10 and 2000),
    price numeric(10,2) not null check (price >= 0),
    image_url text not null check (image_url ~ '^https://'),
    category text,
    available boolean not null default true,
    published boolean not null default false,
    waitlist_open boolean not null default true,
    release_code text not null default 'SD / 001',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create index if not exists products_public_listing_idx on public.products (published, created_at desc);
  create index if not exists products_category_idx on public.products (category) where published;

  create table if not exists public.administrator_allowlist (
    user_id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
  );

  -- Product references are intentionally nullable so a deleted item can be removed
  -- without erasing historical signup records. The waitlist retains email/consent
  -- and the former product UUID for internal audit, while the FK preserves integrity.
  create table if not exists public.waitlist_entries (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references public.products(id) on delete set null,
    former_product_id uuid not null,
    email text not null check (email = lower(trim(email)) and length(email) <= 254),
    consented_at timestamptz not null,
    created_at timestamptz not null default now(),
    constraint waitlist_unique_product_email unique (former_product_id, email)
  );

  create index if not exists waitlist_product_created_idx on public.waitlist_entries (former_product_id, created_at desc);
  create index if not exists waitlist_created_idx on public.waitlist_entries (created_at desc);

  create or replace function public.touch_updated_at()
  returns trigger language plpgsql set search_path = '' as $$
  begin new.updated_at = now(); return new; end;
  $$;
  drop trigger if exists products_touch_updated_at on public.products;
  create trigger products_touch_updated_at before update on public.products
  for each row execute function public.touch_updated_at();

  create or replace function public.is_sneaker_admin()
  returns boolean language sql stable security definer set search_path = '' as $$
    select exists (select 1 from public.administrator_allowlist a where a.user_id = (select auth.uid()));
  $$;

  alter table public.products enable row level security;
  alter table public.waitlist_entries enable row level security;
  alter table public.administrator_allowlist enable row level security;

  drop policy if exists "Published products are readable" on public.products;
  create policy "Published products are readable" on public.products for select to anon, authenticated using (published);
  drop policy if exists "Administrators manage products" on public.products;
  create policy "Administrators manage products" on public.products for all to authenticated
  using (public.is_sneaker_admin()) with check (public.is_sneaker_admin());

  drop policy if exists "Administrators read waitlist" on public.waitlist_entries;
  create policy "Administrators read waitlist" on public.waitlist_entries for select to authenticated using (public.is_sneaker_admin());
  drop policy if exists "Administrators delete waitlist" on public.waitlist_entries;
  create policy "Administrators delete waitlist" on public.waitlist_entries for delete to authenticated using (public.is_sneaker_admin());

  drop policy if exists "Users can confirm their own allowlist membership" on public.administrator_allowlist;
  create policy "Users can confirm their own allowlist membership" on public.administrator_allowlist for select to authenticated using (user_id = (select auth.uid()));

  revoke all on public.products from anon, authenticated;
  grant select on public.products to anon, authenticated;
  grant insert, update, delete on public.products to authenticated;
  revoke all on public.waitlist_entries from anon, authenticated;
  grant select, delete on public.waitlist_entries to authenticated;
  revoke all on public.administrator_allowlist from anon, authenticated;
  grant select on public.administrator_allowlist to authenticated;

  create or replace function public.join_waitlist(p_email text, p_product_id uuid, p_consent boolean)
  returns text language plpgsql security definer set search_path = '' as $$
  declare normalized_email text;
  begin
    normalized_email := lower(trim(p_email));
    if normalized_email is null or length(normalized_email) > 254
      or normalized_email !~ '^[A-Za-z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$'
      or p_consent is distinct from true then
      raise exception using errcode = '22023', message = 'Invalid waitlist request';
    end if;
    if not exists (select 1 from public.products p where p.id = p_product_id and p.published and p.waitlist_open) then
      return 'ineligible';
    end if;
    insert into public.waitlist_entries (product_id, former_product_id, email, consented_at)
    values (p_product_id, p_product_id, normalized_email, now())
    on conflict (former_product_id, email) do nothing;
    if not found then return 'duplicate'; end if;
    return 'joined';
  end;
  $$;
  revoke all on function public.join_waitlist(text, uuid, boolean) from public;
  grant execute on function public.join_waitlist(text, uuid, boolean) to anon, authenticated;

  revoke all on function public.is_sneaker_admin() from public;
  grant execute on function public.is_sneaker_admin() to authenticated;
