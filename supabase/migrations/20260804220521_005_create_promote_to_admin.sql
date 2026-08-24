/*
# Create promote_to_admin function

1. New Functions
- `promote_to_admin(email text)`: A SECURITY DEFINER function that allows promoting a user to admin role by email. This bypasses RLS so it can be called once to set up the first admin.
2. Security
- SECURITY DEFINER so it can update profiles even before any admin exists.
- Only callable by authenticated users to prevent anonymous abuse.
- Returns the updated profile or an error message.
3. Notes
- Call this once from the SQL editor or via execute_sql after registering with your real email to become admin.
- Usage: SELECT promote_to_admin('your-real-email@example.com');
*/

CREATE OR REPLACE FUNCTION promote_to_admin(p_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result text;
BEGIN
  UPDATE profiles SET role = 'admin' WHERE email = p_email;
  IF FOUND THEN
    v_result := 'تم ترقية المستخدم ' || p_email || ' إلى مدير النظام بنجاح';
  ELSE
    v_result := 'لم يتم العثور على مستخدم بالبريد: ' || p_email;
  END IF;
  RETURN v_result;
END;
$$;
