
-- NAFS Migration 007
-- Telegram login and owner analytics
-- Run after migrations 001-006.
-- Safe to run again. Does not reset user data.

BEGIN;

-- 1. Telegram identity improvements

ALTER TABLE public.telegram_identities
ADD COLUMN IF NOT EXISTS first_login_at timestamptz;

CREATE INDEX IF NOT EXISTS telegram_identity_created_idx
ON public.telegram_identities(created_at DESC);

ALTER TABLE public.telegram_identities
ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.telegram_identities
FROM anon, authenticated;


-- 2. Atomic Telegram login

CREATE OR REPLACE FUNCTION public.complete_telegram_login(
    p_hash text,
    p_token_hash text,
    p_user uuid,
    p_telegram_id bigint,
    p_name text,
    p_username text,
    p_language text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_hash IS NULL
       OR p_token_hash IS NULL
       OR p_hash !~ '^[a-f0-9]{64}$'
       OR p_token_hash !~ '^[a-f0-9]{64}$'
    THEN
        RAISE EXCEPTION 'Invalid authentication digest';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.telegram_identities
        WHERE user_id = p_user
          AND telegram_id = p_telegram_id
    ) THEN
        RAISE EXCEPTION 'Identity mismatch';
    END IF;

    DELETE FROM public.telegram_auth_replays
    WHERE expires_at < NOW();

    DELETE FROM public.telegram_sessions
    WHERE expires_at < NOW();

    INSERT INTO public.telegram_auth_replays (
        signature_hash,
        expires_at
    )
    VALUES (
        p_hash,
        NOW() + INTERVAL '11 minutes'
    )
    ON CONFLICT DO NOTHING;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    INSERT INTO public.telegram_sessions (
        token_hash,
        user_id,
        expires_at
    )
    VALUES (
        p_token_hash,
        p_user,
        NOW() + INTERVAL '7 days'
    );

    UPDATE public.telegram_identities
    SET first_login_at = COALESCE(first_login_at, NOW())
    WHERE user_id = p_user;

    PERFORM public.record_telegram_visit(
        p_user,
        p_telegram_id,
        p_name,
        p_username,
        p_language,
        TRUE
    );

    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_telegram_login(
    text, text, uuid, bigint, text, text, text
)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.complete_telegram_login(
    text, text, uuid, bigint, text, text, text
)
TO service_role;


-- 3. Restore rate-limit permission

GRANT EXECUTE ON FUNCTION public.consume_rate_limit(
    text, integer
)
TO service_role;


-- 4. Owner visitor statistics

CREATE OR REPLACE FUNCTION public.owner_visitor_report(
    p_search text DEFAULT '',
    p_page integer DEFAULT 1,
    p_size integer DEFAULT 20
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    payload jsonb;
BEGIN
    p_search := COALESCE(p_search, '');

    IF p_page IS NULL
       OR p_size IS NULL
       OR p_page < 1
       OR p_page > 100000
       OR p_size < 1
       OR p_size > 100
       OR LENGTH(p_search) > 80
    THEN
        RAISE EXCEPTION 'Invalid pagination';
    END IF;

    SELECT jsonb_build_object(
        'total', COUNT(*),
        'new24h', COUNT(*) FILTER (
            WHERE created_at >= NOW() - INTERVAL '1 day'
        ),
        'new7d', COUNT(*) FILTER (
            WHERE created_at >= NOW() - INTERVAL '7 days'
        ),
        'new30d', COUNT(*) FILTER (
            WHERE created_at >= NOW() - INTERVAL '30 days'
        ),
        'active24h', COUNT(*) FILTER (
            WHERE last_seen_at >= NOW() - INTERVAL '1 day'
        ),
        'active7d', COUNT(*) FILTER (
            WHERE last_seen_at >= NOW() - INTERVAL '7 days'
        ),
        'active30d', COUNT(*) FILTER (
            WHERE last_seen_at >= NOW() - INTERVAL '30 days'
        ),
        'successfulLogins', COALESCE(SUM(login_count), 0)
    )
    INTO payload
    FROM public.telegram_identities;

    RETURN payload || jsonb_build_object(
        'page', p_page,
        'pageSize', p_size,

        'matching', (
            SELECT COUNT(*)
            FROM public.telegram_identities
            WHERE POSITION(
                LOWER(p_search) IN LOWER(
                    COALESCE(display_name, '') || ' ' ||
                    COALESCE(username, '') || ' ' ||
                    telegram_id::text
                )
            ) > 0
        ),

        'users', COALESCE(
            (
                SELECT jsonb_agg(row_to_json(x))
                FROM (
                    SELECT
                        telegram_id,
                        display_name,
                        username,
                        created_at,
                        first_login_at,
                        last_seen_at,
                        login_count
                    FROM public.telegram_identities
                    WHERE POSITION(
                        LOWER(p_search) IN LOWER(
                            COALESCE(display_name, '') || ' ' ||
                            COALESCE(username, '') || ' ' ||
                            telegram_id::text
                        )
                    ) > 0
                    ORDER BY created_at DESC, telegram_id DESC
                    LIMIT p_size
                    OFFSET (p_page - 1) * p_size
                ) AS x
            ),
            '[]'::jsonb
        )
    );
END;
$$;

REVOKE ALL ON FUNCTION public.owner_visitor_report(
    text, integer, integer
)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.owner_visitor_report(
    text, integer, integer
)
TO service_role;


-- 5. Refresh Supabase API schema

NOTIFY pgrst, 'reload schema';

COMMIT;
