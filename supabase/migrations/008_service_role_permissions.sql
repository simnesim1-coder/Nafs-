
-- NAFS 008: permissions for server-side data access

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.user_preferences
TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.challenges
TO service_role;

COMMIT;
