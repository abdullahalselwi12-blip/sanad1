/*
# Create lawyers, laws, and law_articles tables

1. New Tables
- `lawyers`: linked to profiles. Fields: license_number, specialization, bio, experience_years, office_address, is_verified, rating.
- `laws`: legal codes/laws. Fields: title, category, description, issue_date, effective_date, is_published.
- `law_articles`: articles belonging to a law. Fields: law_id (FK), article_number, title, content.
2. Security
- RLS enabled on all tables.
- lawyers: SELECT public (anyone can browse lawyers). INSERT/UPDATE/DELETE: owner or admin.
- laws & law_articles: SELECT public for published laws. INSERT/UPDATE/DELETE: admin only.
3. Notes
- `is_verified` on lawyers lets admins approve lawyer accounts.
- `rating` is a numeric field (0-5) that admins can set or update via a review system later.
*/

-- ============ LAWYERS ============
CREATE TABLE IF NOT EXISTS lawyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  license_number text,
  specialization text,
  bio text,
  experience_years integer,
  office_address text,
  is_verified boolean NOT NULL DEFAULT false,
  rating numeric(2,1) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE lawyers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_lawyers" ON lawyers;
CREATE POLICY "public_select_lawyers"
ON lawyers FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "insert_own_lawyer" ON lawyers;
CREATE POLICY "insert_own_lawyer"
ON lawyers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "update_own_lawyer" ON lawyers;
CREATE POLICY "update_own_lawyer"
ON lawyers FOR UPDATE
TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "admin_update_lawyers" ON lawyers;
CREATE POLICY "admin_update_lawyers"
ON lawyers FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_lawyers" ON lawyers;
CREATE POLICY "admin_delete_lawyers"
ON lawyers FOR DELETE
TO authenticated
USING (is_admin());

DROP TRIGGER IF EXISTS lawyers_updated_at ON lawyers;
CREATE TRIGGER lawyers_updated_at BEFORE UPDATE ON lawyers
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_lawyers_profile_id ON lawyers(profile_id);
CREATE INDEX IF NOT EXISTS idx_lawyers_verified ON lawyers(is_verified);

-- ============ LAWS ============
CREATE TABLE IF NOT EXISTS laws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'civil' CHECK (category IN ('civil','criminal','commercial','family','administrative','constitutional','labor','procedural')),
  description text,
  issue_date date,
  effective_date date,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE laws ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_published_laws" ON laws;
CREATE POLICY "public_select_published_laws"
ON laws FOR SELECT
TO anon, authenticated
USING (is_published = true);

DROP POLICY IF EXISTS "admin_select_all_laws" ON laws;
CREATE POLICY "admin_select_all_laws"
ON laws FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_laws" ON laws;
CREATE POLICY "admin_insert_laws"
ON laws FOR INSERT
TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_laws" ON laws;
CREATE POLICY "admin_update_laws"
ON laws FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_laws" ON laws;
CREATE POLICY "admin_delete_laws"
ON laws FOR DELETE
TO authenticated
USING (is_admin());

DROP TRIGGER IF EXISTS laws_updated_at ON laws;
CREATE TRIGGER laws_updated_at BEFORE UPDATE ON laws
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_laws_category ON laws(category);
CREATE INDEX IF NOT EXISTS idx_laws_published ON laws(is_published);

-- ============ LAW ARTICLES ============
CREATE TABLE IF NOT EXISTS law_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  law_id uuid NOT NULL REFERENCES laws(id) ON DELETE CASCADE,
  article_number text NOT NULL,
  title text,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE law_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_published_articles" ON law_articles;
CREATE POLICY "public_select_published_articles"
ON law_articles FOR SELECT
TO anon, authenticated
USING (
  EXISTS (SELECT 1 FROM laws WHERE laws.id = law_articles.law_id AND laws.is_published = true)
);

DROP POLICY IF EXISTS "admin_select_all_articles" ON law_articles;
CREATE POLICY "admin_select_all_articles"
ON law_articles FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_articles" ON law_articles;
CREATE POLICY "admin_insert_articles"
ON law_articles FOR INSERT
TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_articles" ON law_articles;
CREATE POLICY "admin_update_articles"
ON law_articles FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_articles" ON law_articles;
CREATE POLICY "admin_delete_articles"
ON law_articles FOR DELETE
TO authenticated
USING (is_admin());

DROP TRIGGER IF EXISTS law_articles_updated_at ON law_articles;
CREATE TRIGGER law_articles_updated_at BEFORE UPDATE ON law_articles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_articles_law_id ON law_articles(law_id);
CREATE INDEX IF NOT EXISTS idx_articles_content ON law_articles USING gin (to_tsvector('arabic', content));
CREATE INDEX IF NOT EXISTS idx_articles_number ON law_articles(article_number);
