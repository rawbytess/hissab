SET
statement_timeout = 0;
SET
lock_timeout = 0;
SET
idle_in_transaction_session_timeout = 0;
SET
client_encoding = 'UTF8';
SET
standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET
check_function_bodies = false;
SET
xmloption = content;
SET
client_min_messages = warning;
SET
row_security = off;

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at",
                            "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token",
                            "recovery_sent_at",
                            "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at",
                            "raw_app_meta_data",
                            "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone",
                            "phone_confirmed_at",
                            "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current",
                            "email_change_confirm_status", "banned_until", "reauthentication_token",
                            "reauthentication_sent_at",
                            "is_sso_user", "deleted_at", "is_anonymous")
VALUES ('00000000-0000-0000-0000-000000000000', '832f93c3-d0ec-4985-8672-f79d47b401f2', 'authenticated',
        'authenticated', 'lite@hissab.io', '$2a$10$CSUsn.GA0ZbG9SXdgXtVfuDJUlnAFx.QnPThl/y5z9U81GVGcRuIC',
        '2025-04-17 20:26:13.639183+00', NULL, '',
        '2025-04-17 20:25:50.812214+00', '', NULL, '',
        '', NULL, '2025-04-17 20:26:13.641957+00',
        '{"provider": "email", "providers": ["email"]}',
        '{"sub": "832f93c3-d0ec-4985-8672-f79d47b401f2", "email": "lite@hissab.io", "user_name": "Lite Hissab", "subscription": {"status": "active", "ends_at": null, "renews_at": "2026-04-17T19:43:55.000000Z", "created_at": "2025-04-17T19:43:56.000000Z", "updated_at": "2025-04-17T19:44:01.000000Z", "product_name": "AI Lite", "variant_name": "AI Lite Annually"}, "email_verified": true, "phone_verified": false}',
        NULL, '2025-04-17 20:25:50.807119+00', '2025-04-17 20:28:36.114959+00', NULL,
        NULL, '', '', NULL, '', 0,
        NULL, '', NULL, false, NULL, false),
       ('00000000-0000-0000-0000-000000000000', 'bc15bf99-5b7b-403e-a9d0-1e869505dbb0', 'authenticated',
        'authenticated', 'free@hissab.io', '$2a$10$FmRJMKoBgFKTdK.JidwY6OW3pCIpQCpwCGfd26tlz7/tH9hEQv2Me',
        '2025-04-17 20:30:09.925519+00', NULL, '', '2025-04-17 20:29:53.81663+00',
        '', NULL, '', '', NULL, '2025-04-17 20:30:09.926766+00',
        '{"provider": "email", "providers": ["email"]}',
        '{"sub": "bc15bf99-5b7b-403e-a9d0-1e869505dbb0", "email": "free@hissab.io", "email_verified": true, "phone_verified": false}',
        NULL, '2025-04-17 20:29:53.813251+00', '2025-04-17 20:30:09.92782+00', NULL,
        NULL, '', '', NULL, '',
        0, NULL, '', NULL, false, NULL, false),
       ('00000000-0000-0000-0000-000000000000', '832f93c3-d0ec-4985-8672-f79d47b401f3', 'authenticated',
        'authenticated', 'plus@hissab.io', '$2a$10$CSUsn.GA0ZbG9SXdgXtVfuDJUlnAFy.QnPThl/y5z9U81GVGcRuIC',
        '2025-04-17 20:26:13.639183+00', NULL, '',
        '2025-04-17 20:25:50.812214+00', '', NULL, '',
        '', NULL, '2025-04-17 20:26:13.641957+00',
        '{"provider": "email", "providers": ["email"]}',
        '{"sub": "832f93c3-d0ec-4985-8672-f79d47b401f2", "email": "plus@hissab.io", "user_name": "Plus Hissab", "subscription": {"status": "active", "ends_at": null, "renews_at": "2026-04-17T19:43:55.000000Z", "created_at": "2025-04-17T19:43:56.000000Z", "updated_at": "2025-04-17T19:44:01.000000Z", "product_name": "AI Plus", "variant_name": "AI Plus Annually"}, "email_verified": true, "phone_verified": false}',
        NULL, '2025-04-17 20:25:50.807119+00', '2025-04-17 20:28:36.114959+00', NULL,
        NULL, '', '', NULL, '', 0,
        NULL, '', NULL, false, NULL, false);

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at",
                                 "updated_at", "id")
VALUES ('832f93c3-d0ec-4985-8672-f79d47b401f2', '832f93c3-d0ec-4985-8672-f79d47b401f2',
        '{"sub": "832f93c3-d0ec-4985-8672-f79d47b401f2", "email": "lite@hissab.io", "email_verified": true, "phone_verified": false}',
        'email', '2025-04-17 20:25:50.810594+00', '2025-04-17 20:25:50.810616+00',
        '2025-04-17 20:25:50.810616+00', '93cac9a7-2fcc-4b9f-a7e9-460534058a98'),
       ('bc15bf99-5b7b-403e-a9d0-1e869505dbb0', 'bc15bf99-5b7b-403e-a9d0-1e869505dbb0',
        '{"sub": "bc15bf99-5b7b-403e-a9d0-1e869505dbb0", "email": "free@hissab.io", "email_verified": true, "phone_verified": false}',
        'email', '2025-04-17 20:29:53.814855+00', '2025-04-17 20:29:53.814875+00',
        '2025-04-17 20:29:53.814875+00', 'f94409e3-547d-431d-b806-22b2a3cefbf4'),
       ('832f93c3-d0ec-4985-8672-f79d47b401f3', '832f93c3-d0ec-4985-8672-f79d47b401f3',
        '{"sub": "832f93c3-d0ec-4985-8672-f79d47b401f3", "email": "plus@hissab.io", "email_verified": true, "phone_verified": false}',
        'email', '2025-04-17 20:25:50.810594+00', '2025-04-17 20:25:50.810616+00',
        '2025-04-17 20:25:50.810616+00', '93cac9a7-2fcc-4b9f-a7e9-460534058a99');

INSERT INTO "public"."user_plan" ("id", "user_id", "customer_id", "created_at", "ends_at", "renews_at", "updated_at",
                                  "order_id", "subscription_id", "product_name", "variant_name", "status")
VALUES (1, '832f93c3-d0ec-4985-8672-f79d47b401f2', 5574573, '2025-04-17 19:43:56+00',
        NULL, '2026-04-17 19:43:55+00', '2025-04-17 19:44:01+00', 5309456,
        1131919, 'AI Lite', 'AI Lite Annually', 'active'),
       (2, '832f93c3-d0ec-4985-8672-f79d47b401f3', 5574574, '2025-04-17 19:43:56+00',
        NULL, '2026-04-17 19:43:55+00', '2025-04-17 19:44:01+00', 5309456,
        1131919, 'AI Plus', 'AI Plus Annually', 'active');


SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 2, true);
SELECT pg_catalog.setval('"public"."user_keys_id_seq"', 1, false);
SELECT pg_catalog.setval('"public"."user_plan_id_seq"', 1, true);
SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);

RESET
ALL;
