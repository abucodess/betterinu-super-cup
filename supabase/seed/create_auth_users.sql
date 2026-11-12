-- ============================================================================
-- INSTITUTE FOOTBALL LEAGUE — CREATE DEMO AUTH USERS & LINK TO TEAMS
-- Target: Supabase PostgreSQL (Run in Supabase Dashboard -> SQL Editor)
-- Password for all accounts: demopassword
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_admin_id UUID := 'a0000000-0000-0000-0000-000000000001';
  v_mgr1_id  UUID := 'a0000000-0000-0000-0000-000000000002';
  v_mgr2_id  UUID := 'a0000000-0000-0000-0000-000000000003';
  v_mgr3_id  UUID := 'a0000000-0000-0000-0000-000000000004';
  v_ref_id   UUID := 'a0000000-0000-0000-0000-000000000005';
  v_pw_hash  TEXT := crypt('demopassword', gen_salt('bf'));
  col_rec    RECORD;
BEGIN

  -- 1. Insert or update Admin in auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_admin_id,
    'authenticated',
    'authenticated',
    'admin@supercup.com',
    v_pw_hash,
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Super Admin","role":"super_admin"}'::jsonb,
    NOW(),
    NOW(),
    ''
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = NOW(),
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;

  -- 2. Insert or update Manager 1 (Team Alpha)
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_mgr1_id,
    'authenticated',
    'authenticated',
    'manager1@supercup.com',
    v_pw_hash,
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Alpha Manager","role":"manager"}'::jsonb,
    NOW(),
    NOW(),
    ''
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = NOW(),
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;

  -- 3. Insert or update Manager 2 (Team Beta)
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_mgr2_id,
    'authenticated',
    'authenticated',
    'manager2@supercup.com',
    v_pw_hash,
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Beta Manager","role":"manager"}'::jsonb,
    NOW(),
    NOW(),
    ''
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = NOW(),
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;

  -- 4. Insert or update Manager 3 (Team Gamma)
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_mgr3_id,
    'authenticated',
    'authenticated',
    'manager3@supercup.com',
    v_pw_hash,
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Gamma Manager","role":"manager"}'::jsonb,
    NOW(),
    NOW(),
    ''
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = NOW(),
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;

  -- 5. Insert or update Referee
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_ref_id,
    'authenticated',
    'authenticated',
    'referee@supercup.com',
    v_pw_hash,
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Official Referee","role":"referee"}'::jsonb,
    NOW(),
    NOW(),
    ''
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = NOW(),
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;

  -- 6. Insert identities with all 8 columns and 8 matching expressions
  DELETE FROM auth.identities WHERE user_id IN (v_admin_id, v_mgr1_id, v_mgr2_id, v_mgr3_id, v_ref_id);

  INSERT INTO auth.identities (
    provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES
    (v_admin_id::text, v_admin_id, v_admin_id, json_build_object('sub', v_admin_id::text, 'email', 'admin@supercup.com')::jsonb, 'email', NOW(), NOW(), NOW()),
    (v_mgr1_id::text,  v_mgr1_id,  v_mgr1_id,  json_build_object('sub', v_mgr1_id::text,  'email', 'manager1@supercup.com')::jsonb, 'email', NOW(), NOW(), NOW()),
    (v_mgr2_id::text,  v_mgr2_id,  v_mgr2_id,  json_build_object('sub', v_mgr2_id::text,  'email', 'manager2@supercup.com')::jsonb, 'email', NOW(), NOW(), NOW()),
    (v_mgr3_id::text,  v_mgr3_id,  v_mgr3_id,  json_build_object('sub', v_mgr3_id::text,  'email', 'manager3@supercup.com')::jsonb, 'email', NOW(), NOW(), NOW()),
    (v_ref_id::text,   v_ref_id,   v_ref_id,   json_build_object('sub', v_ref_id::text,   'email', 'referee@supercup.com')::jsonb, 'email', NOW(), NOW(), NOW());

  -- 7. Ensure public.profiles matches exactly with required roles
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES
    (v_admin_id, 'admin@supercup.com', 'Super Admin', 'super_admin'),
    (v_mgr1_id,  'manager1@supercup.com', 'Alpha Manager', 'manager'),
    (v_mgr2_id,  'manager2@supercup.com', 'Beta Manager', 'manager'),
    (v_mgr3_id,  'manager3@supercup.com', 'Gamma Manager', 'manager'),
    (v_ref_id,   'referee@supercup.com', 'Official Referee', 'referee')
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;

  -- 8. Assign Managers to Teams in public.teams
  UPDATE public.teams SET manager_id = v_mgr1_id WHERE name = 'Team Alpha';
  UPDATE public.teams SET manager_id = v_mgr2_id WHERE name = 'Team Beta';
  UPDATE public.teams SET manager_id = v_mgr3_id WHERE name = 'Team Gamma';

  -- 9. Resolve GoTrue Go scanner requirement: replace any NULL text/varchar column with ''
  FOR col_rec IN 
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'auth' 
      AND table_name = 'users' 
      AND data_type IN ('text', 'character varying')
      AND is_updatable = 'YES'
  LOOP
    BEGIN
      EXECUTE format('UPDATE auth.users SET %I = '''' WHERE %I IS NULL AND email LIKE ''%%@supercup.com''', col_rec.column_name, col_rec.column_name);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;

END $$;
