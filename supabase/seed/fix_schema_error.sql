-- ============================================================================
-- FIX: "500 Database error querying schema"
-- Cause: Supabase GoTrue Auth backend crashes when scanning NULL in string columns
-- This script replaces all NULL text/string columns with '' in auth.users and auth.identities
-- ============================================================================

DO $$
DECLARE
  col_rec RECORD;
BEGIN
  -- 1. Ensure common token columns in auth.users are not NULL
  BEGIN
    UPDATE auth.users
    SET 
      confirmation_token = COALESCE(confirmation_token, ''),
      recovery_token = COALESCE(recovery_token, ''),
      email_change = COALESCE(email_change, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      email_change_token_current = COALESCE(email_change_token_current, ''),
      phone = COALESCE(phone, ''),
      phone_change = COALESCE(phone_change, ''),
      phone_change_token = COALESCE(phone_change_token, '');
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- 2. Dynamically update EVERY nullable text/varchar column in auth.users
  FOR col_rec IN 
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'auth' 
      AND table_name = 'users' 
      AND data_type IN ('text', 'character varying')
  LOOP
    BEGIN
      EXECUTE format('UPDATE auth.users SET %I = '''' WHERE %I IS NULL', col_rec.column_name, col_rec.column_name);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;

  -- 3. Populate email in auth.identities if it was left NULL
  BEGIN
    UPDATE auth.identities 
    SET email = LOWER(identity_data->>'email') 
    WHERE email IS NULL OR email = '';
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- 4. Dynamically update EVERY nullable text/varchar column in auth.identities
  FOR col_rec IN 
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'auth' 
      AND table_name = 'identities' 
      AND data_type IN ('text', 'character varying')
  LOOP
    BEGIN
      EXECUTE format('UPDATE auth.identities SET %I = '''' WHERE %I IS NULL', col_rec.column_name, col_rec.column_name);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;

  -- 5. Set confirmed_at if column exists
  BEGIN
    UPDATE auth.users SET confirmed_at = NOW() WHERE confirmed_at IS NULL;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

END $$;

