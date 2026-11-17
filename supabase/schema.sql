-- =============================================================================
-- Rassa Kopi CMS — Supabase PostgreSQL Schema, RBAC (super_admin & admin),
-- Auth Triggers, and Row Level Security (RLS)
-- =============================================================================
-- Jalankan seluruh skrip ini satu kali di:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =============================================================================

-- 1. Tabel Akun Admin & Role ('super_admin' | 'admin')
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL CHECK (role IN ('super_admin', 'admin')),
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Tabel Undangan Akun Baru (Hanya bisa diisi oleh super_admin)
CREATE TABLE IF NOT EXISTS public.admin_invites (
  email text PRIMARY KEY,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL CHECK (role IN ('super_admin', 'admin')),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Tabel Konten Section Landing Page
CREATE TABLE IF NOT EXISTS public.cms_sections (
  section_id text PRIMARY KEY,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(payload) = 'object'),
  is_public boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Tabel Signature Menu
CREATE TABLE IF NOT EXISTS public.menu_items (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('Coffee', 'Non Coffee', 'Black Series', 'Makanan', 'Cemilan', 'Aneka Roti', 'Non-Coffee', 'Food & Snacks')),
  description text NOT NULL DEFAULT '',
  price_label text NOT NULL DEFAULT '',
  numeric_price integer NOT NULL DEFAULT 0 CHECK (numeric_price >= 0),
  image text NOT NULL DEFAULT '',
  image_alt text NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT false,
  note text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_public boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Pastikan constraint category terbaru aktif pada database yang sudah dibuat sebelumnya
DO $$
DECLARE
  v_conname text;
BEGIN
  SELECT conname INTO v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.menu_items'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%category%';

  IF v_conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.menu_items DROP CONSTRAINT %I', v_conname);
  END IF;

  ALTER TABLE public.menu_items
    ADD CONSTRAINT menu_items_category_check
    CHECK (category IN ('Coffee', 'Non Coffee', 'Black Series', 'Makanan', 'Cemilan', 'Aneka Roti', 'Non-Coffee', 'Food & Snacks'));
END $$;

-- 5. Tabel Gallery Photos
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id text PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Coffee Moment',
  caption text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  alt text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_public boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Tabel Feature Cards (Why Choose Rassa, About Category Tiles, Story Pillars)
CREATE TABLE IF NOT EXISTS public.feature_items (
  id text PRIMARY KEY,
  "group" text NOT NULL CHECK ("group" IN ('why_rassa', 'about_tile', 'story_pillar')),
  badge_number text NOT NULL DEFAULT '01',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'coffee',
  image text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Coffee',
  sort_order integer NOT NULL DEFAULT 0,
  is_public boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 7. Helper Functions (SECURITY DEFINER) untuk Cek Role
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_cms_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid()
      AND is_active = true
      AND role IN ('super_admin', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid()
      AND is_active = true
      AND role = 'super_admin'
  );
$$;

-- RPC khusus Super Admin: mempersiapkan undangan akun baru atau update role user yang sudah ada
CREATE OR REPLACE FUNCTION public.prepare_admin_account(
  p_email text,
  p_role text,
  p_full_name text DEFAULT ''
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_name text := trim(coalesce(p_full_name, ''));
  v_existing_uid uuid;
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Hanya Super Admin yang dapat menambahkan akun atau mengatur role.';
  END IF;

  IF p_role NOT IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Role tidak valid. Gunakan super_admin atau admin.';
  END IF;

  IF v_email = '' OR position('@' IN v_email) = 0 THEN
    RAISE EXCEPTION 'Format email tidak valid.';
  END IF;

  SELECT id INTO v_existing_uid
  FROM auth.users
  WHERE lower(email) = v_email
  LIMIT 1;

  IF v_existing_uid IS NOT NULL THEN
    INSERT INTO public.admin_users (id, email, full_name, role, is_active, created_by)
    VALUES (v_existing_uid, v_email, v_name, p_role, true, auth.uid())
    ON CONFLICT (id) DO UPDATE
    SET
      role = EXCLUDED.role,
      full_name = CASE WHEN v_name <> '' THEN v_name ELSE public.admin_users.full_name END,
      is_active = true,
      updated_at = now();

    DELETE FROM public.admin_invites WHERE lower(email) = v_email;
    RETURN 'linked_existing';
  END IF;

  INSERT INTO public.admin_invites (email, full_name, role, invited_by)
  VALUES (v_email, v_name, p_role, auth.uid())
  ON CONFLICT (email) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    invited_by = auth.uid(),
    updated_at = now();

  RETURN 'invited';
END;
$$;

-- =============================================================================
-- 8. Triggers: Sinkronisasi auth.users <-> admin_users & Proteksi Super Admin
-- =============================================================================

-- Auto-confirm email jika akun dibuat lewat undangan Super Admin atau akun owner awal
CREATE OR REPLACE FUNCTION public.before_auth_user_insert_confirm_invited()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF lower(NEW.email) = 'gibranmikail.work@gmail.com'
     OR EXISTS (
       SELECT 1 FROM public.admin_invites
       WHERE lower(email) = lower(NEW.email)
     ) THEN
    NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, now());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_before_auth_user_insert_confirm_invited ON auth.users;
CREATE TRIGGER trg_before_auth_user_insert_confirm_invited
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.before_auth_user_insert_confirm_invited();

-- Sinkronkan role saat user baru dibuat di auth.users
CREATE OR REPLACE FUNCTION public.after_auth_user_insert_sync_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_invite record;
BEGIN
  SELECT * INTO v_invite
  FROM public.admin_invites
  WHERE lower(email) = lower(NEW.email)
  LIMIT 1;

  IF FOUND THEN
    INSERT INTO public.admin_users (id, email, full_name, role, is_active, created_by)
    VALUES (
      NEW.id,
      lower(NEW.email),
      COALESCE(NULLIF(v_invite.full_name, ''), COALESCE(NEW.raw_user_meta_data->>'full_name', '')),
      v_invite.role,
      true,
      v_invite.invited_by
    )
    ON CONFLICT (id) DO UPDATE
    SET
      role = EXCLUDED.role,
      full_name = EXCLUDED.full_name,
      is_active = true,
      updated_at = now();

    DELETE FROM public.admin_invites WHERE lower(email) = lower(NEW.email);
  ELSIF lower(NEW.email) = 'gibranmikail.work@gmail.com' THEN
    INSERT INTO public.admin_users (id, email, full_name, role, is_active)
    VALUES (NEW.id, lower(NEW.email), 'Super Admin', 'super_admin', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_after_auth_user_insert_sync_admin ON auth.users;
CREATE TRIGGER trg_after_auth_user_insert_sync_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.after_auth_user_insert_sync_admin();

-- Cegah penghapusan atau penurunan role Super Admin aktif terakhir
CREATE OR REPLACE FUNCTION public.guard_last_super_admin()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_remaining integer;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.role = 'super_admin' AND OLD.is_active = true THEN
      SELECT count(*) INTO v_remaining
      FROM public.admin_users
      WHERE id <> OLD.id AND role = 'super_admin' AND is_active = true;
      IF v_remaining = 0 THEN
        RAISE EXCEPTION 'Minimal harus ada 1 Super Admin aktif.';
      END IF;
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.role = 'super_admin' AND OLD.is_active = true
       AND (NEW.role <> 'super_admin' OR NEW.is_active = false) THEN
      SELECT count(*) INTO v_remaining
      FROM public.admin_users
      WHERE id <> OLD.id AND role = 'super_admin' AND is_active = true;
      IF v_remaining = 0 THEN
        RAISE EXCEPTION 'Tidak bisa menurunkan/menonaktifkan Super Admin aktif terakhir.';
      END IF;
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_last_super_admin ON public.admin_users;
CREATE TRIGGER trg_guard_last_super_admin
  BEFORE UPDATE OR DELETE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_last_super_admin();

-- =============================================================================
-- 9. Row Level Security (RLS)
-- =============================================================================

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_items ENABLE ROW LEVEL SECURITY;

-- Policies: admin_users (Admin hanya bisa melihat akunnya sendiri; Super Admin bisa kelola semua)
DROP POLICY IF EXISTS "admin_users_select" ON public.admin_users;
CREATE POLICY "admin_users_select" ON public.admin_users
  FOR SELECT USING (id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "admin_users_super_insert" ON public.admin_users;
CREATE POLICY "admin_users_super_insert" ON public.admin_users
  FOR INSERT WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "admin_users_super_update" ON public.admin_users;
CREATE POLICY "admin_users_super_update" ON public.admin_users
  FOR UPDATE USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "admin_users_super_delete" ON public.admin_users;
CREATE POLICY "admin_users_super_delete" ON public.admin_users
  FOR DELETE USING (public.is_super_admin());

-- Policies: admin_invites (Hanya Super Admin)
DROP POLICY IF EXISTS "admin_invites_super_all" ON public.admin_invites;
CREATE POLICY "admin_invites_super_all" ON public.admin_invites
  FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- Policies: cms_sections
DROP POLICY IF EXISTS "cms_sections_select" ON public.cms_sections;
CREATE POLICY "cms_sections_select" ON public.cms_sections
  FOR SELECT USING (is_public = true OR public.is_cms_admin());

DROP POLICY IF EXISTS "cms_sections_admin_write" ON public.cms_sections;
CREATE POLICY "cms_sections_admin_write" ON public.cms_sections
  FOR ALL USING (public.is_cms_admin()) WITH CHECK (public.is_cms_admin());

-- Policies: menu_items
DROP POLICY IF EXISTS "menu_items_select" ON public.menu_items;
CREATE POLICY "menu_items_select" ON public.menu_items
  FOR SELECT USING (is_public = true OR public.is_cms_admin());

DROP POLICY IF EXISTS "menu_items_admin_write" ON public.menu_items;
CREATE POLICY "menu_items_admin_write" ON public.menu_items
  FOR ALL USING (public.is_cms_admin()) WITH CHECK (public.is_cms_admin());

-- Policies: gallery_items
DROP POLICY IF EXISTS "gallery_items_select" ON public.gallery_items;
CREATE POLICY "gallery_items_select" ON public.gallery_items
  FOR SELECT USING (is_public = true OR public.is_cms_admin());

DROP POLICY IF EXISTS "gallery_items_admin_write" ON public.gallery_items;
CREATE POLICY "gallery_items_admin_write" ON public.gallery_items
  FOR ALL USING (public.is_cms_admin()) WITH CHECK (public.is_cms_admin());

-- Policies: feature_items
DROP POLICY IF EXISTS "feature_items_select" ON public.feature_items;
CREATE POLICY "feature_items_select" ON public.feature_items
  FOR SELECT USING (is_public = true OR public.is_cms_admin());

DROP POLICY IF EXISTS "feature_items_admin_write" ON public.feature_items;
CREATE POLICY "feature_items_admin_write" ON public.feature_items
  FOR ALL USING (public.is_cms_admin()) WITH CHECK (public.is_cms_admin());

-- =============================================================================
-- 10. Realtime Publication
-- =============================================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.cms_sections;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery_items;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.feature_items;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- 11. Bootstrap Super Admin Awal
-- Ganti email di bawah jika akun Super Admin pertama Anda berbeda.
-- =============================================================================
INSERT INTO public.admin_users (id, email, full_name, role, is_active)
SELECT id, lower(email), 'Super Admin', 'super_admin', true
FROM auth.users
WHERE lower(email) = 'gibranmikail.work@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'super_admin', is_active = true;

-- =============================================================================
-- 12. Supabase Storage Bucket & Policies untuk Upload Asset Gambar CMS
-- Mendukung JPEG, JPG, PNG, SVG, dan WebP (maks. 5 MB)
-- =============================================================================
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'rassakopi-assets',
  'rassakopi-assets',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];

DROP POLICY IF EXISTS "rassakopi_assets_public_read" ON storage.objects;
CREATE POLICY "rassakopi_assets_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'rassakopi-assets');

DROP POLICY IF EXISTS "rassakopi_assets_admin_insert" ON storage.objects;
CREATE POLICY "rassakopi_assets_admin_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'rassakopi-assets' AND public.is_cms_admin());

DROP POLICY IF EXISTS "rassakopi_assets_admin_update" ON storage.objects;
CREATE POLICY "rassakopi_assets_admin_update" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'rassakopi-assets' AND public.is_cms_admin())
  WITH CHECK (bucket_id = 'rassakopi-assets' AND public.is_cms_admin());

DROP POLICY IF EXISTS "rassakopi_assets_admin_delete" ON storage.objects;
CREATE POLICY "rassakopi_assets_admin_delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'rassakopi-assets' AND public.is_cms_admin());

