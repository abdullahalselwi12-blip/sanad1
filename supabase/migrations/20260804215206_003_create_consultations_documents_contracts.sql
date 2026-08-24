/*
# Create consultations, documents, ai_conversations, and contracts tables

1. New Tables
- `consultations`: user asks a question, optionally directed to a lawyer. Fields: user_id, lawyer_id, subject, question, answer, status.
- `documents`: generated legal documents saved by users. Fields: user_id, type, title, content, data (jsonb).
- `ai_conversations`: records of AI assistant Q&A. Fields: user_id, question, answer, matched_articles, rating, status.
- `contracts`: contracts managed between users and lawyers. Fields: user_id, lawyer_id, title, type, status, content.
2. Security
- All tables have RLS enabled.
- consultations: users CRUD their own; lawyers can view/answer consultations directed to them; admins see all.
- documents: users CRUD their own; admins see all.
- ai_conversations: users CRUD their own; admins see all.
- contracts: users CRUD their own; lawyers see contracts assigned to them; admins see all.
3. Notes
- All owner columns default to auth.uid() so inserts without user_id succeed.
- Consultations can be null lawyer_id (general question) or assigned to a specific lawyer.
*/

-- ============ CONSULTATIONS ============
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  lawyer_id uuid REFERENCES lawyers(id) ON DELETE SET NULL,
  subject text NOT NULL,
  question text NOT NULL,
  answer text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','answered','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_consultations" ON consultations;
CREATE POLICY "select_own_consultations"
ON consultations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "lawyer_select_consultations" ON consultations;
CREATE POLICY "lawyer_select_consultations"
ON consultations FOR SELECT
TO authenticated
USING (
  lawyer_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM lawyers WHERE lawyers.id = consultations.lawyer_id AND lawyers.profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "admin_select_consultations" ON consultations;
CREATE POLICY "admin_select_consultations"
ON consultations FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "insert_own_consultation" ON consultations;
CREATE POLICY "insert_own_consultation"
ON consultations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_consultation" ON consultations;
CREATE POLICY "update_own_consultation"
ON consultations FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "lawyer_update_consultation" ON consultations;
CREATE POLICY "lawyer_update_consultation"
ON consultations FOR UPDATE
TO authenticated
USING (
  lawyer_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM lawyers WHERE lawyers.id = consultations.lawyer_id AND lawyers.profile_id = auth.uid()
  )
)
WITH CHECK (
  lawyer_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM lawyers WHERE lawyers.id = consultations.lawyer_id AND lawyers.profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "admin_update_consultations" ON consultations;
CREATE POLICY "admin_update_consultations"
ON consultations FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_consultations" ON consultations;
CREATE POLICY "admin_delete_consultations"
ON consultations FOR DELETE
TO authenticated
USING (is_admin());

DROP TRIGGER IF EXISTS consultations_updated_at ON consultations;
CREATE TRIGGER consultations_updated_at BEFORE UPDATE ON consultations
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_lawyer_id ON consultations(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);

-- ============ DOCUMENTS ============
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('marriage_contract','sale_contract','rental_contract','employment_contract','power_of_attorney','declaration','warning_notice','agreement')),
  title text NOT NULL,
  content text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_documents" ON documents;
CREATE POLICY "select_own_documents"
ON documents FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_select_documents" ON documents;
CREATE POLICY "admin_select_documents"
ON documents FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "insert_own_document" ON documents;
CREATE POLICY "insert_own_document"
ON documents FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_document" ON documents;
CREATE POLICY "update_own_document"
ON documents FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_update_documents" ON documents;
CREATE POLICY "admin_update_documents"
ON documents FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "delete_own_document" ON documents;
CREATE POLICY "delete_own_document"
ON documents FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_delete_documents" ON documents;
CREATE POLICY "admin_delete_documents"
ON documents FOR DELETE
TO authenticated
USING (is_admin());

DROP TRIGGER IF EXISTS documents_updated_at ON documents;
CREATE TRIGGER documents_updated_at BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);

-- ============ AI CONVERSATIONS ============
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  matched_articles jsonb DEFAULT '[]'::jsonb,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('active','completed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_conversations" ON ai_conversations;
CREATE POLICY "select_own_conversations"
ON ai_conversations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_select_conversations" ON ai_conversations;
CREATE POLICY "admin_select_conversations"
ON ai_conversations FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "insert_own_conversation" ON ai_conversations;
CREATE POLICY "insert_own_conversation"
ON ai_conversations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_conversation" ON ai_conversations;
CREATE POLICY "update_own_conversation"
ON ai_conversations FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_update_conversations" ON ai_conversations;
CREATE POLICY "admin_update_conversations"
ON ai_conversations FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_conversations" ON ai_conversations;
CREATE POLICY "admin_delete_conversations"
ON ai_conversations FOR DELETE
TO authenticated
USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);

-- ============ CONTRACTS ============
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  lawyer_id uuid REFERENCES lawyers(id) ON DELETE SET NULL,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('marriage_contract','sale_contract','rental_contract','employment_contract','power_of_attorney','declaration','warning_notice','agreement')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','signed','completed')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_contracts" ON contracts;
CREATE POLICY "select_own_contracts"
ON contracts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "lawyer_select_contracts" ON contracts;
CREATE POLICY "lawyer_select_contracts"
ON contracts FOR SELECT
TO authenticated
USING (
  lawyer_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM lawyers WHERE lawyers.id = contracts.lawyer_id AND lawyers.profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "admin_select_contracts" ON contracts;
CREATE POLICY "admin_select_contracts"
ON contracts FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "insert_own_contract" ON contracts;
CREATE POLICY "insert_own_contract"
ON contracts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_contract" ON contracts;
CREATE POLICY "update_own_contract"
ON contracts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_update_contracts" ON contracts;
CREATE POLICY "admin_update_contracts"
ON contracts FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_contracts" ON contracts;
CREATE POLICY "admin_delete_contracts"
ON contracts FOR DELETE
TO authenticated
USING (is_admin());

DROP TRIGGER IF EXISTS contracts_updated_at ON contracts;
CREATE TRIGGER contracts_updated_at BEFORE UPDATE ON contracts
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_contracts_user_id ON contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_lawyer_id ON contracts(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
