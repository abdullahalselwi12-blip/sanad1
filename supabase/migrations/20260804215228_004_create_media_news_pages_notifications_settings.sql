/*
# Create media, news, pages, notifications, security_logs, and site_settings tables

1. New Tables
- `media`: media library items (images, PDFs, videos, files). Fields: type, name, url, size, mime_type.
- `news`: news articles for the platform. Fields: title, excerpt, content, image_url, is_published, published_at.
- `pages`: static CMS pages. Fields: slug, title, content, is_published.
- `notifications`: user notifications. Fields: user_id (nullable for broadcast), title, message, type, is_read.
- `security_logs`: audit log of security-relevant actions. Fields: user_id, action, ip_address, user_agent.
- `site_settings`: global site configuration (singleton row). Fields: site_name, site_logo, primary_color, seo fields, dark_mode, language.
2. Security
- media: SELECT public for all; INSERT/UPDATE/DELETE admin only.
- news: SELECT public for published; INSERT/UPDATE/DELETE admin only.
- pages: SELECT public for published; INSERT/UPDATE/DELETE admin only.
- notifications: users SELECT/UPDATE their own; admin can INSERT/SELECT all/DELETE.
- security_logs: admin SELECT only; INSERT via service role or admin.
- site_settings: SELECT public; UPDATE admin only.
3. Notes
- Notifications support broadcast (user_id NULL) for admin-sent global notifications.
- site_settings is designed as a single-row table; the app reads the first row.
*/

-- ============ MEDIA ============
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('image','pdf','video','file')),
  name text NOT NULL,
  url text NOT NULL,
  size bigint,
  mime_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_media" ON media;
CREATE POLICY "public_select_media"
ON media FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "admin_insert_media" ON media;
CREATE POLICY "admin_insert_media"
ON media FOR INSERT
TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_media" ON media;
CREATE POLICY "admin_update_media"
ON media FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_media" ON media;
CREATE POLICY "admin_delete_media"
ON media FOR DELETE
TO authenticated
USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);

-- ============ NEWS ============
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text,
  content text NOT NULL,
  image_url text,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_published_news" ON news;
CREATE POLICY "public_select_published_news"
ON news FOR SELECT
TO anon, authenticated
USING (is_published = true);

DROP POLICY IF EXISTS "admin_select_all_news" ON news;
CREATE POLICY "admin_select_all_news"
ON news FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_news" ON news;
CREATE POLICY "admin_insert_news"
ON news FOR INSERT
TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_news" ON news;
CREATE POLICY "admin_update_news"
ON news FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_news" ON news;
CREATE POLICY "admin_delete_news"
ON news FOR DELETE
TO authenticated
USING (is_admin());

DROP TRIGGER IF EXISTS news_updated_at ON news;
CREATE TRIGGER news_updated_at BEFORE UPDATE ON news
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_news_published ON news(is_published);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at);

-- ============ PAGES ============
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text NOT NULL,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_published_pages" ON pages;
CREATE POLICY "public_select_published_pages"
ON pages FOR SELECT
TO anon, authenticated
USING (is_published = true);

DROP POLICY IF EXISTS "admin_select_all_pages" ON pages;
CREATE POLICY "admin_select_all_pages"
ON pages FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_pages" ON pages;
CREATE POLICY "admin_insert_pages"
ON pages FOR INSERT
TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_pages" ON pages;
CREATE POLICY "admin_update_pages"
ON pages FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_pages" ON pages;
CREATE POLICY "admin_delete_pages"
ON pages FOR DELETE
TO authenticated
USING (is_admin());

DROP TRIGGER IF EXISTS pages_updated_at ON pages;
CREATE TRIGGER pages_updated_at BEFORE UPDATE ON pages
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============ NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info','success','warning','error')),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications"
ON notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "admin_select_all_notifications" ON notifications;
CREATE POLICY "admin_select_all_notifications"
ON notifications FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_notifications" ON notifications;
CREATE POLICY "admin_insert_notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications"
ON notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_update_notifications" ON notifications;
CREATE POLICY "admin_update_notifications"
ON notifications FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_notifications" ON notifications;
CREATE POLICY "admin_delete_notifications"
ON notifications FOR DELETE
TO authenticated
USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============ SECURITY LOGS ============
CREATE TABLE IF NOT EXISTS security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_security_logs" ON security_logs;
CREATE POLICY "admin_select_security_logs"
ON security_logs FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_security_logs" ON security_logs;
CREATE POLICY "admin_insert_security_logs"
ON security_logs FOR INSERT
TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_security_logs" ON security_logs;
CREATE POLICY "admin_delete_security_logs"
ON security_logs FOR DELETE
TO authenticated
USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);

-- ============ SITE SETTINGS ============
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'SANAD',
  site_logo text,
  primary_color text,
  seo_title text,
  seo_description text,
  seo_keywords text,
  dark_mode boolean NOT NULL DEFAULT false,
  language text NOT NULL DEFAULT 'ar' CHECK (language IN ('ar','en')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_settings" ON site_settings;
CREATE POLICY "public_select_settings"
ON site_settings FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "admin_update_settings" ON site_settings;
CREATE POLICY "admin_update_settings"
ON site_settings FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_insert_settings" ON site_settings;
CREATE POLICY "admin_insert_settings"
ON site_settings FOR INSERT
TO authenticated
WITH CHECK (is_admin());

DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON site_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert default settings row
INSERT INTO site_settings (site_name, seo_title, seo_description)
VALUES ('SANAD', 'SANAD - منصتك القانونية الذكية في اليمن', 'منصة قانونية يمنية متكاملة تقدم الاستشارات القانونية الذكية، مكتبة القوانين، مولد الوثائق القانونية، ودليل المحامين المعتمدين.')
ON CONFLICT DO NOTHING;
