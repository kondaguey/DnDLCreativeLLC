SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict BZLLaBdKKuqT9dijEJbRbiwAKYlhkWGNUlqm6nhcJ0p8SfsLExVPtJFyU6zwyKV

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', 'authenticated', 'authenticated', 'admin@dndlcreative.com', '$2a$10$SrlQQJxp.xUipQ6QMplfauxzeW/t4j8lJY/pgdeXFpKMbzE6eG.Ce', '2025-12-13 22:51:19.967504+00', NULL, '', NULL, '', '2026-01-03 05:15:56.670033+00', '', '', NULL, '2026-01-16 02:13:51.857247+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-12-13 22:51:19.920036+00', '2026-01-23 06:51:29.419507+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('f31c33dd-4080-43b3-9060-afad5e5bab2b', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '{"sub": "f31c33dd-4080-43b3-9060-afad5e5bab2b", "email": "admin@dndlcreative.com", "email_verified": false, "phone_verified": false}', 'email', '2025-12-13 22:51:19.944869+00', '2025-12-13 22:51:19.945455+00', '2025-12-13 22:51:19.945455+00', 'c7c355fe-8040-4ad0-a5af-8d02cadb12f5');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('f10f1604-dec5-45d8-b4b4-6d14d89c6415', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-12 20:46:24.732064+00', '2026-01-12 20:46:24.732064+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '74.106.206.112', NULL, NULL, NULL, NULL, NULL),
	('5af07317-3401-4faa-8fd3-ee61551904b1', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-12 20:29:59.058554+00', '2026-01-12 21:53:27.230192+00', NULL, 'aal1', NULL, '2026-01-12 21:53:27.230061', 'node', '3.90.202.36', NULL, NULL, NULL, NULL, NULL),
	('28703554-a78b-405b-bca9-184d85ed3733', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-12 19:06:02.091578+00', '2026-01-12 22:00:47.464113+00', NULL, 'aal1', NULL, '2026-01-12 22:00:47.463985', 'node', '74.106.206.112', NULL, NULL, NULL, NULL, NULL),
	('34a1c017-ce6b-4772-9378-562635cbab59', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-13 08:38:45.69748+00', '2026-01-13 20:40:39.56129+00', NULL, 'aal1', NULL, '2026-01-13 20:40:39.561184', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15', '74.106.206.112', NULL, NULL, NULL, NULL, NULL),
	('7475c792-403b-40a8-8aac-bf011b1c24bc', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-12 22:15:40.377197+00', '2026-01-20 18:22:31.09089+00', NULL, 'aal1', NULL, '2026-01-20 18:22:31.090754', 'node', '3.233.220.152', NULL, NULL, NULL, NULL, NULL),
	('20fb1935-833d-4f58-9484-5114b7c2422b', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-13 10:11:25.904614+00', '2026-01-21 04:55:14.25003+00', NULL, 'aal1', NULL, '2026-01-21 04:55:14.24988', 'node', '13.222.9.115', NULL, NULL, NULL, NULL, NULL),
	('1913a8d8-3045-4fbc-88a6-ac4016d436f2', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-16 02:13:51.857997+00', '2026-01-21 07:44:25.899627+00', NULL, 'aal1', NULL, '2026-01-21 07:44:25.899518', 'node', '3.238.96.124', NULL, NULL, NULL, NULL, NULL),
	('21ff590e-45ab-4dd5-8281-546cba7953e5', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-15 21:09:58.837249+00', '2026-01-23 06:51:29.428285+00', NULL, 'aal1', NULL, '2026-01-23 06:51:29.428177', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '74.106.206.112', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('28703554-a78b-405b-bca9-184d85ed3733', '2026-01-12 19:06:02.102329+00', '2026-01-12 19:06:02.102329+00', 'password', '0d8258ff-3667-4c42-a096-717d420ab0ad'),
	('5af07317-3401-4faa-8fd3-ee61551904b1', '2026-01-12 20:29:59.10383+00', '2026-01-12 20:29:59.10383+00', 'password', 'b8f91d08-e111-45a0-afe4-be84dfb735d7'),
	('f10f1604-dec5-45d8-b4b4-6d14d89c6415', '2026-01-12 20:46:24.80015+00', '2026-01-12 20:46:24.80015+00', 'password', 'a595bd94-f97b-40ac-ac85-8788d466b874'),
	('7475c792-403b-40a8-8aac-bf011b1c24bc', '2026-01-12 22:15:40.43882+00', '2026-01-12 22:15:40.43882+00', 'password', 'e1a3a008-7dc4-4b55-baae-94aa895aaa20'),
	('34a1c017-ce6b-4772-9378-562635cbab59', '2026-01-13 08:38:45.780305+00', '2026-01-13 08:38:45.780305+00', 'password', 'ab1b22d7-b849-4c7a-ae50-625c69323192'),
	('20fb1935-833d-4f58-9484-5114b7c2422b', '2026-01-13 10:11:25.967693+00', '2026-01-13 10:11:25.967693+00', 'password', '5af74d86-6984-4d32-8cdd-c1dcc8f60c91'),
	('21ff590e-45ab-4dd5-8281-546cba7953e5', '2026-01-15 21:09:58.87215+00', '2026-01-15 21:09:58.87215+00', 'password', '50eab251-f28f-4045-a571-554b34c9de4b'),
	('1913a8d8-3045-4fbc-88a6-ac4016d436f2', '2026-01-16 02:13:51.949108+00', '2026-01-16 02:13:51.949108+00', 'password', 'fe76569c-c2d9-48cc-996c-1ac1ec9a8f7c');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 271, 'itc6z3ih2373', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-17 18:09:56.59479+00', '2026-01-17 19:09:07.12936+00', 'hbf4qfhgsmkn', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 261, 'hffrwo6nhq4g', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-15 20:13:03.161292+00', '2026-01-18 04:30:14.381343+00', 'xdma6jz3wj6r', '7475c792-403b-40a8-8aac-bf011b1c24bc'),
	('00000000-0000-0000-0000-000000000000', 273, 'eofqvpwa2rkw', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-18 04:30:14.396086+00', '2026-01-18 05:28:35.157238+00', 'hffrwo6nhq4g', '7475c792-403b-40a8-8aac-bf011b1c24bc'),
	('00000000-0000-0000-0000-000000000000', 274, 'wsfk7fanlnsi', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-18 05:28:35.184714+00', '2026-01-18 06:27:05.243152+00', 'eofqvpwa2rkw', '7475c792-403b-40a8-8aac-bf011b1c24bc'),
	('00000000-0000-0000-0000-000000000000', 272, 'i4plcn5mht46', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-17 19:09:07.139918+00', '2026-01-18 19:42:13.613503+00', 'itc6z3ih2373', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 276, 'ntqt5te4ct77', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-18 19:42:13.639509+00', '2026-01-18 20:42:42.046123+00', 'i4plcn5mht46', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 277, 'mrt7ld5xkd4j', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-18 20:42:42.081369+00', '2026-01-18 21:53:49.591812+00', 'ntqt5te4ct77', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 278, 'fihv2hrt57ti', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-18 21:53:49.623302+00', '2026-01-18 22:58:18.084202+00', 'mrt7ld5xkd4j', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 279, 'd755no2jqxh7', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-18 22:58:18.104988+00', '2026-01-19 02:44:10.219166+00', 'fihv2hrt57ti', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 280, 'ydc5hh7yjchk', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-19 02:44:10.248874+00', '2026-01-19 04:30:23.952109+00', 'd755no2jqxh7', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 281, '3lz74z4ahebm', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-19 04:30:23.973343+00', '2026-01-19 06:05:33.510618+00', 'ydc5hh7yjchk', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 282, 'spcffwr4h2dy', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-19 06:05:33.557504+00', '2026-01-19 07:03:46.785927+00', '3lz74z4ahebm', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 283, 'zawaqfxxabgg', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-19 07:03:46.805154+00', '2026-01-19 08:12:31.22515+00', 'spcffwr4h2dy', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 284, 'qoittxpciiec', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-19 08:12:31.241099+00', '2026-01-19 18:21:21.540893+00', 'zawaqfxxabgg', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 285, 'ofi75o76zzew', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-19 18:21:21.579732+00', '2026-01-19 19:29:27.101405+00', 'qoittxpciiec', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 265, 'b75l6ismxhwk', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-16 02:13:51.906155+00', '2026-01-19 19:42:41.239832+00', NULL, '1913a8d8-3045-4fbc-88a6-ac4016d436f2'),
	('00000000-0000-0000-0000-000000000000', 286, '7na77vpbwpwu', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-19 19:29:27.137491+00', '2026-01-19 20:27:58.159751+00', 'ofi75o76zzew', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 288, 'v6wy5luaf7nk', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-19 20:27:58.172983+00', '2026-01-19 21:26:59.680374+00', '7na77vpbwpwu', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 246, 't7dx6w7yi5mi', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-12 19:06:02.097119+00', '2026-01-12 20:04:34.530296+00', NULL, '28703554-a78b-405b-bca9-184d85ed3733'),
	('00000000-0000-0000-0000-000000000000', 275, 'hdijtjcw5md5', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-18 06:27:05.264136+00', '2026-01-20 18:22:31.026376+00', 'wsfk7fanlnsi', '7475c792-403b-40a8-8aac-bf011b1c24bc'),
	('00000000-0000-0000-0000-000000000000', 290, 'f53c6pbeti43', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', false, '2026-01-20 18:22:31.059491+00', '2026-01-20 18:22:31.059491+00', 'hdijtjcw5md5', '7475c792-403b-40a8-8aac-bf011b1c24bc'),
	('00000000-0000-0000-0000-000000000000', 249, 'ccq73b6ydb52', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', false, '2026-01-12 20:46:24.772221+00', '2026-01-12 20:46:24.772221+00', NULL, 'f10f1604-dec5-45d8-b4b4-6d14d89c6415'),
	('00000000-0000-0000-0000-000000000000', 248, 'urzpa6a4fhe2', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-12 20:29:59.081956+00', '2026-01-12 21:53:27.177902+00', NULL, '5af07317-3401-4faa-8fd3-ee61551904b1'),
	('00000000-0000-0000-0000-000000000000', 250, 'ymvyeelc7jjn', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', false, '2026-01-12 21:53:27.206241+00', '2026-01-12 21:53:27.206241+00', 'urzpa6a4fhe2', '5af07317-3401-4faa-8fd3-ee61551904b1'),
	('00000000-0000-0000-0000-000000000000', 247, '6giancyhvhif', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-12 20:04:34.565321+00', '2026-01-12 22:00:47.458798+00', 't7dx6w7yi5mi', '28703554-a78b-405b-bca9-184d85ed3733'),
	('00000000-0000-0000-0000-000000000000', 251, 'tgtath2yi24p', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', false, '2026-01-12 22:00:47.459765+00', '2026-01-12 22:00:47.459765+00', '6giancyhvhif', '28703554-a78b-405b-bca9-184d85ed3733'),
	('00000000-0000-0000-0000-000000000000', 287, 'wsn4x5qo2347', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-19 19:42:41.264023+00', '2026-01-21 04:56:06.925139+00', 'b75l6ismxhwk', '1913a8d8-3045-4fbc-88a6-ac4016d436f2'),
	('00000000-0000-0000-0000-000000000000', 291, 'p4fzh6dm33ax', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-21 04:56:06.939058+00', '2026-01-21 07:44:25.846909+00', 'wsn4x5qo2347', '1913a8d8-3045-4fbc-88a6-ac4016d436f2'),
	('00000000-0000-0000-0000-000000000000', 254, 'dkas4ia4dtzf', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-13 10:11:25.942127+00', '2026-01-13 17:10:35.565068+00', NULL, '20fb1935-833d-4f58-9484-5114b7c2422b'),
	('00000000-0000-0000-0000-000000000000', 255, 'e2ktivofpoc3', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', false, '2026-01-13 17:10:35.601707+00', '2026-01-13 17:10:35.601707+00', 'dkas4ia4dtzf', '20fb1935-833d-4f58-9484-5114b7c2422b'),
	('00000000-0000-0000-0000-000000000000', 253, 'xcdgklmkyt7q', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-13 08:38:45.745563+00', '2026-01-13 20:40:39.521143+00', NULL, '34a1c017-ce6b-4772-9378-562635cbab59'),
	('00000000-0000-0000-0000-000000000000', 256, 'e5l2zuhfxmbv', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', false, '2026-01-13 20:40:39.543952+00', '2026-01-13 20:40:39.543952+00', 'xcdgklmkyt7q', '34a1c017-ce6b-4772-9378-562635cbab59'),
	('00000000-0000-0000-0000-000000000000', 252, 'bkq52f5cc25k', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-12 22:15:40.414837+00', '2026-01-14 09:22:02.272228+00', NULL, '7475c792-403b-40a8-8aac-bf011b1c24bc'),
	('00000000-0000-0000-0000-000000000000', 292, 'm6mt42mj522m', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', false, '2026-01-21 07:44:25.86983+00', '2026-01-21 07:44:25.86983+00', 'p4fzh6dm33ax', '1913a8d8-3045-4fbc-88a6-ac4016d436f2'),
	('00000000-0000-0000-0000-000000000000', 257, 'kgzsk6ujywco', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-14 09:22:02.307953+00', '2026-01-14 18:16:00.95549+00', 'bkq52f5cc25k', '7475c792-403b-40a8-8aac-bf011b1c24bc'),
	('00000000-0000-0000-0000-000000000000', 289, 'aalvj7u5okao', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-19 21:26:59.696962+00', '2026-01-23 05:42:30.790099+00', 'v6wy5luaf7nk', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 258, 'srqwle7xewzj', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-14 18:16:00.990403+00', '2026-01-15 18:07:30.759736+00', 'kgzsk6ujywco', '7475c792-403b-40a8-8aac-bf011b1c24bc'),
	('00000000-0000-0000-0000-000000000000', 259, '6r5nzpefyjdp', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-15 18:07:30.792372+00', '2026-01-15 19:08:01.173568+00', 'srqwle7xewzj', '7475c792-403b-40a8-8aac-bf011b1c24bc'),
	('00000000-0000-0000-0000-000000000000', 293, 'rr43l26d4o4x', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-23 05:42:30.805286+00', '2026-01-23 06:51:29.367194+00', 'aalvj7u5okao', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 260, 'xdma6jz3wj6r', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-15 19:08:01.194325+00', '2026-01-15 20:13:03.146188+00', '6r5nzpefyjdp', '7475c792-403b-40a8-8aac-bf011b1c24bc'),
	('00000000-0000-0000-0000-000000000000', 294, 'g3uzosq7uafl', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', false, '2026-01-23 06:51:29.40311+00', '2026-01-23 06:51:29.40311+00', 'rr43l26d4o4x', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 262, '2mylj26hwie7', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-15 21:09:58.858692+00', '2026-01-15 22:08:29.252735+00', NULL, '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 263, 'ipgmciqafww4', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-15 22:08:29.263796+00', '2026-01-15 23:07:00.727296+00', '2mylj26hwie7', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 264, '2jnsknaumfiw', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-15 23:07:00.749484+00', '2026-01-16 05:57:59.554925+00', 'ipgmciqafww4', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 266, 'mafyy7goftfj', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-16 05:57:59.587357+00', '2026-01-16 08:42:53.408832+00', '2jnsknaumfiw', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 267, 'jw2hylszuaf6', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-16 08:42:53.424211+00', '2026-01-16 16:37:05.962404+00', 'mafyy7goftfj', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 268, 'd7oyxpzzb5c4', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-16 16:37:06.02295+00', '2026-01-16 17:37:28.388031+00', 'jw2hylszuaf6', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 269, 'kpwnqki6sa36', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-16 17:37:28.424832+00', '2026-01-16 22:37:55.28497+00', 'd7oyxpzzb5c4', '21ff590e-45ab-4dd5-8281-546cba7953e5'),
	('00000000-0000-0000-0000-000000000000', 270, 'hbf4qfhgsmkn', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', true, '2026-01-16 22:37:55.317342+00', '2026-01-17 18:09:56.561399+00', 'kpwnqki6sa36', '21ff590e-45ab-4dd5-8281-546cba7953e5');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: 2_booking_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."2_booking_requests" ("id", "created_at", "client_name", "email", "client_type", "is_returning", "book_title", "word_count", "narration_style", "genre", "notes", "start_date", "end_date", "days_needed", "discount_applied", "status", "cover_image_url", "ref_number", "email_secondary", "email_tertiary", "email_thread_link") VALUES
	('196951bd-663b-446c-99e1-2193869a00db', '2026-01-07 05:14:03.641647+00', 'Sunrise Publishing LLC', 'rel@sunrisepublishing.com', 'Direct', true, 'Rescued Dreams (Last Chance County, Book 8)', 80945, 'Solo', 'Fiction', '', '2026-01-07', '2026-01-16', 12, NULL, 'production', 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/admin/1767762586417.png', '26001', NULL, NULL, 'https://mail.google.com/mail/u/0/#inbox/QgrcJHsThhqpLxFkBvmgGxzCZKkWfrNbLXG'),
	('4a2322be-73da-4c8f-93f6-3dddf5360c94', '2026-01-07 04:59:27.767196+00', 'Podium', 'tamara@podiumentertainment.com', 'Direct', false, 'The Last Buzzer (SCU Series Book 5)', 52400, 'Dual', 'Fiction', 'Narration for:  The Last Buzzer Bonus Epilogue
Start date:  1/28/26
Finish date:  1/29/26
Estimated word count:  ~5k

Rate:  $244 pfh +13.5% H&R, plus a $100 flat multicast fee in addition to the total gross compensation

NOTE: We''ll send you your release date details, along with MP3s and cover art, once we''re wrapped. If you''d like to share the news, feel free to join us on the Podium and tag us on social media (we''re @podiumentertainment on Facebook, Instagram, X, and TikTok). If you have other ideas you''re kicking around, feel free to sync with your producer, too!

And with that, I''ll pass this on over to Troy Otte (cc''d here), who''ll be your producer and primary contact for the project going forward, and will be in touch shortly. You''ll find your available script(s) already in your Box folder, but please make sure you''ve connected with your producer before recording, as they''ll be providing any additional notes, pronunciations, etc.

Reminders:  Here''s a link to our updated 2025 Narrator Reference Guide, which contains our current specs as well as important info about payment; also, please fill out, complete, or update your information on Podium''s Narrator Form  as needed, so all of the important details you have in our system are correct. Let your producer know if you have any questions.
', '2026-01-23', '2026-01-30', 8, '', 'on_hold', 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/admin/1767766854505-15my7m.png', '26002', '', '', 'https://mail.google.com/mail/u/0/#search/buzzer/FMfcgzQcqtbFShfBVpWmvZfsmCqnPfTg'),
	('68936e44-7da5-4026-a1be-13b388d9c295', '2026-01-10 22:24:26.062336+00', 'Test 1', 'test3@gmail.com', 'Indie', false, 'testing title 1', 10000, 'Solo', 'Romance', '', '2026-01-18', '2026-01-20', 2, 'None', 'pending', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: 10_session_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."10_session_logs" ("id", "project_id", "date", "activity", "duration_hrs", "notes", "created_at") VALUES
	('c798a96a-cc30-4a36-affb-0dde2dbe85f2', '196951bd-663b-446c-99e1-2193869a00db', '2026-01-11', 'Recording', 0.00, 'Session Timer Auto-Log', '2026-01-11 08:31:08.546426+00');


--
-- Data for Name: 11_voiceover_tracker; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."11_voiceover_tracker" ("id", "created_at", "project_title", "client_name", "platform", "rate", "status", "due_date", "notes", "source_email", "role", "specs", "direction", "audition_link", "file_link", "submitted_timezone", "timezone", "submitted_at") VALUES
	(7, '2026-01-06 08:35:37.368646+00', 'Military Simulator Game', 'ASP', 'Direct', 'Session: $350+20%
Buyout: $650+20%', 'submitted', '2026-01-06 17:00:00+00', '', NULL, 'Commander Tan', 'Male - 30''s-50''s hollywoodized Roman/Italian or European legionnaire inspired accent', 'Direction
1-2 takes, no take numbers, slate name and ASP at the end of the audition

Please double check you are reading the correct commander lines

SLATE:
Slate name and ASP at the end of the audition
File Uploads
Document	Description	Current File
Project Script	AUDITION SCRIPT	
Audition Upload
Your file will be automatically renamed to the label below.

Commander Tan_Daniel Lewis.mp3
No file chosen


----------------
LABELING & UPLOAD:
Your file will be automatically renamed to the label below.

Commander Tan_Daniel Lewis.mp3
No file chosen', 'https://forms.aspvo.com/audition?t=R4529ZvGcV2Lo5EEkUZxXLl7tb8UR', '', 'America/New_York', 'America/Los_Angeles', '2026-01-06 21:02:48.291+00'),
	(10, '2026-01-06 08:40:25.121538+00', 'Walgreens Delivery - Tag Announcer (Campaign)', 'IDIOM', 'Direct', 'SAG/AFTRA SCALE', 'skipped', '2026-01-11 04:00:00+00', 'SESSION: 1 - 2 hour Session - January 16th thru January 19th 2026 - 2pm - 4pm PST. Likely weekend recording.', NULL, '', 'Upbeat, Professional and Trustworthy, not overly polished or announcer-y. Should feel fairly matter of fact.', 'LABEL: Tag Anncr-Your name', '', '', NULL, 'America/Los_Angeles', NULL),
	(9, '2026-01-06 08:39:56.307151+00', 'Fox Sports – Regional Contract (Yearly)', 'IDIOM', 'Direct', '$12,750 (Per month) Up to 50 directed spots per month. $225 Per spot for overages.', 'submitted', '2026-01-19 14:00:00+00', 'SESSION: TBD - First recording slated for week of February 16th', NULL, '', 'Natural, conversational "real person" quality that carries a subtle promo edge. The delivery should feel relatable and grounded—not overly polished or classic "big promo announcer."', 'LABEL: Fox Sports VO-Your Name', '', '', 'America/New_York', 'America/Los_Angeles', '2026-01-15 18:35:54.269+00'),
	(5, '2026-01-06 08:34:36.276366+00', 'Military Simulator Game', 'ASP', 'Direct', 'Session: $350+20%
Buyout: $650+20%', 'submitted', '2026-01-06 17:00:00+00', '', NULL, 'Commander Grey', 'Male - 30''s-50''s grounded, dry, and modern way of speaking', 'Direction
1-2 takes, no take numbers, slate name and ASP at the end of the audition

Please double check you are reading the correct commander lines

SLATE:
Slate name and ASP at the end of the audition
File Uploads
Document	Description	Current File
Project Script	AUDITION SCRIPT	
Audition Upload
Your file will be automatically renamed to the label below.

Commander Grey_Daniel Lewis.mp3
No file chosen


----------------
LABELING & UPLOAD:
Your file will be automatically renamed to the label below.

Commander Grey_Daniel Lewis.mp3
No file chosen', 'https://forms.aspvo.com/audition?t=R4528WP23K21bDaweOCgqsF1JekgU', '', 'America/New_York', 'America/Los_Angeles', '2026-01-06 21:02:52.424+00'),
	(8, '2026-01-06 08:36:10.086852+00', 'Military Simulator Game', 'ASP', 'Direct', 'Session: $350+20%
Buyout: $650+20%', 'submitted', '2026-01-06 21:00:00+00', '', NULL, 'Commander Blue', 'Male - 30''s-50''s transatlantic accent', 'Direction
1-2 takes, no take numbers, slate name and ASP at the end of the audition

Please double check you are reading the correct commander lines

SLATE:
Slate name and ASP at the end of the audition
File Uploads
Document	Description	Current File
Project Script	AUDITION SCRIPT	
Audition Upload
Your file will be automatically renamed to the label below.

Commander Blue_Daniel Lewis.mp3
No file chosen


----------------
LABELING & UPLOAD:
Your file will be automatically renamed to the label below.

Commander Blue_Daniel Lewis.mp3
No file chosen', 'https://forms.aspvo.com/audition?t=R4530oAadccKyXGplQvhFJYB50URu', '', 'America/New_York', 'America/New_York', '2026-01-06 21:02:55.325+00'),
	(13, '2026-01-06 20:50:09.174909+00', 'JP Morgan Chase-Spanish', 'ASP', 'Direct', 'Session Fee: $500+20% payment per 2-hour session. Performer agrees to record an unlimited number of scripts during the session(s)', 'skipped', '2026-01-06 16:00:00+00', 'RATE:
Session Fee: $500+20% payment per 2-hour session. Performer agrees to record an unlimited number of scripts during the session(s)

Usage Fee: If the performer is used in the final Materials, as defined below, they will receive a Usage Fee of $5,000+20%.

Materials: “American Innovation” 1x :60 plus all lifts, versions and edits. Any and all material derived from the session (including, without limitation, all edits and versions varying in length, language, product, dubbing, and subtitling of commercial(s).

MEDIA:
See below

TERMS:
See below
Specs
Native Spanish Speaking Male. 35-45. Neutral accents (Mexican or Colombian preferred). We welcome non-binary, trans, gender-fluid, and any talent to submit as long as their voiceprint matches the specs. As always, we’re looking for a diverse and inclusive submission.

Looking for a great actor with a rugged, distinctive voice, who embodies a modern take on traditional Americana – familiar, but not nostalgic. He’s masculine, with some gravel or rasp to his voice. He speaks with confidence from a lived experience, sincerity, and a shared purpose. His delivery should reflect humanity and progress, with a hint of optimism, without tipping into sentimentality. Instead he feels warm, natural, and relatable.

Delivery note:
For Spanish, the pace of the delivery must be rhythmic, steady, and measured, with the ability to engage in a quicker pace without losing gravitas. He needs the ability to accelerate while staying grounded and conversational.

While his words are clear, we’re not looking for anything polished, announcer-y, elderly sounding, or that feels overly rehearsed. We’re looking for a subtle, natural, nuanced read that is connected to the story in a way that is unmistakably authentic and real.

References (Tone and Style):
A younger Sam Elliott
A younger H Jon Benjamin
A younger Tom Waits
Austin Butler
Due
Audition Deadline
1/6/2026
 
Audition Due Time (Pacific)
8:00 AM
Direction
Direction
*Please give 1 take on 1 mp3 file.  
NO SLATES PLEASE. Thanks!*
 
Audition Slate
No Slates, no take numbers, no lead ins on scripts for this account please (unless it specifically says so in the copy)
Additional Notes
Media:Any and all Media (inclusive of but not limited to TV, Internet, Radio, Digital, Cinema, Industrial) (“Media”)

Broadcast/Internet/Digital/New Media: (including, without limitation, on Social Media (i.e Instagram), digital streaming platforms, Online and in paid and unpaid media).

Internal: (including i.e. corporate communications vehicles for internal, external and trade audiences (e.g., intranet, employee newsletters, sales kits, sell sheets, emails, annual report, archival/historical reference, advertising/publishing materials in textbooks, etc.).

Industrial: All public exhibition/industrial uses (including, without limitation, in-store, kiosk, in-stadium, in-flight, mobile phones, military bases, trade shows, in-cinema and at any events attended by or sponsored by Advertiser)

Public Relations: (including press statements and other placements).

Term: One (1) year from first usage. With regard to social media, e.g.; Facebook, YouTube, and all third-party non-downloadable websites, the term will be in perpetuity. Perpetual, worldwide, non-exclusive rights for non-paid internal, PR and archival use for Agency and Client (including, but not limited archival and historical uses, behind the scenes, sales presentations, recruiting content, press and public relations materials, award submissions, social media channels featuring Materials posted during the term, etc.) are also included.

Territory: Worldwide (TV for North America only)', NULL, 'Spanish VO', 'Native Spanish Speaking Male. 35-45. Neutral accents (Mexican or Colombian preferred). We welcome non-binary, trans, gender-fluid, and any talent to submit as long as their voiceprint matches the specs. As always, we’re looking for a diverse and inclusive submission.

Looking for a great actor with a rugged, distinctive voice, who embodies a modern take on traditional Americana – familiar, but not nostalgic. He’s masculine, with some gravel or rasp to his voice. He speaks with confidence from a lived experience, sincerity, and a shared purpose. His delivery should reflect humanity and progress, with a hint of optimism, without tipping into sentimentality. Instead he feels warm, natural, and relatable.

Delivery note:
For Spanish, the pace of the delivery must be rhythmic, steady, and measured, with the ability to engage in a quicker pace without losing gravitas. He needs the ability to accelerate while staying grounded and conversational.

While his words are clear, we’re not looking for anything polished, announcer-y, elderly sounding, or that feels overly rehearsed. We’re looking for a subtle, natural, nuanced read that is connected to the story in a way that is unmistakably authentic and real.

References (Tone and Style):
A younger Sam Elliott
A younger H Jon Benjamin
A younger Tom Waits
Austin Butler
Due
Audition Deadline
1/6/2026
 
Audition Due Time (Pacific)
8:00 AM
Direction
Direction
*Please give 1 take on 1 mp3 file.  
NO SLATES PLEASE. Thanks!*
 
Audition Slate
No Slates, no take numbers, no lead ins on scripts for this account please (unless it specifically says so in the copy)
Additional Notes
Media:Any and all Media (inclusive of but not limited to TV, Internet, Radio, Digital, Cinema, Industrial) (“Media”)

Broadcast/Internet/Digital/New Media: (including, without limitation, on Social Media (i.e Instagram), digital streaming platforms, Online and in paid and unpaid media).

Internal: (including i.e. corporate communications vehicles for internal, external and trade audiences (e.g., intranet, employee newsletters, sales kits, sell sheets, emails, annual report, archival/historical reference, advertising/publishing materials in textbooks, etc.).

Industrial: All public exhibition/industrial uses (including, without limitation, in-store, kiosk, in-stadium, in-flight, mobile phones, military bases, trade shows, in-cinema and at any events attended by or sponsored by Advertiser)

Public Relations: (including press statements and other placements).

Term: One (1) year from first usage. With regard to social media, e.g.; Facebook, YouTube, and all third-party non-downloadable websites, the term will be in perpetuity. Perpetual, worldwide, non-exclusive rights for non-paid internal, PR and archival use for Agency and Client (including, but not limited archival and historical uses, behind the scenes, sales presentations, recruiting content, press and public relations materials, award submissions, social media channels featuring Materials posted during the term, etc.) are also included.

Territory: Worldwide (TV for North America only)

Exclusivity: None

Options:

Option to renew for a consecutive six (6) month term for an additional payment of $2,750, at sole discretion of advertiser

Option to renew for a consecutive one (1) year term for an additional payment of $5,500, at sole discretion of advertiser



File Uploads
Document	Description	Current File
Project Script	AUDITION SCRIPT	
Audition Upload
Before uploading, your file must be labeled as follows:

Language, Talent Name, Studio Capabilities (if applicable), and/or Location i.e.

If applicable, please note any pertinent availability issues from 1/9-1/15 at the end of the label, per the example

*CASTING LOCAL NY BASED TALENT OR TALENT WITH HOME STUDIOS ONLY*



SPA-First Last-NY (NA 1.14).mp3
SPA-First Last-Source Connect (CDMX).mp3
SPA-First Last-ipDTL (NY) (NA 1.12 after 2pm ET).mp3

No file chosen', 'DIRECTION:
*Please give 1 take on 1 mp3 file.  
NO SLATES PLEASE. Thanks!*

SLATE:
No Slates, no take numbers, no lead ins on scripts for this account please (unless it specifically says so in the copy)', '', '', NULL, 'America/Los_Angeles', NULL),
	(11, '2026-01-06 18:21:33.333131+00', 'Favor Campaign', 'ASP', 'Direct', ':30 Radio', 'submitted', '2026-01-06 22:00:00+00', 'RATE:
:30 Radio

Minor Part Audio Session Fee:
$300.00 + 20% Fee covers up to a 1.5 hour session and includes any lines for lifts, edits and versions. If necessary, additional sessions to be paid at $200 + 20% for up to a 1-hour re-recording session.


Minor Part Audio Usage Fee:
$500.00 + 20%
Fee covers use of all audio
executions including lifts, edits and versions, per the Term, Media and Territory listed above.

One year

MEDIA:
Please see below

TERMS:
See below', NULL, 'Cook', 'Male, 20-30. Slightly higher pitched, youthful voice, with classic Texas accent, which he should be able to dial up or down. Our actor should be able to give a range of performances, from over-the-top comedic, to grounded and understated.', '⬇️ FILENAME (COPY THIS) ⬇️
Cook_Daniel Lewis_ASP.mp3

-------------------

DIRECTION:
3-5 in a row, no take numbers, slate at the end

SLATE:
Name and ASP at the end of the audition', '', '', 'America/New_York', 'America/Los_Angeles', '2026-01-06 21:02:57.325+00'),
	(16, '2026-01-06 23:12:33.786494+00', 'Takis Fuego Hot Sauce-CONFIDENTIAL', 'ASP', 'Direct', 'Session Fee: $500.00 + 20% agent fee (up to a 2 hour session)', 'submitted', '2026-01-09 18:00:00+00', 'RATE:
Session Fee: $500.00 + 20% agent fee (up to a 2 hour session)
Session Pickup/Rerecord Fee $250 + 20% agent fee (up to a 1 hour session)

Male ENG Character VO (3 or 4 roles total) usage fee $5000 + 20% agent fee Note: if “Chicken” role is male, total payment is $7000 + 20% agent fee

MEDIA:
Unlimited edits, Worldwide digital use including but not limited to Social, Website, CTV, POS, PR, Internal, OOH. Worldwide Broadcast TV except for USA.

TERMS:
Usage is 2 Years w/ 1 year renewal option of +10%
 
Specs
We are looking to cast a male with a wide voice and acting range to portray the following voices:

CHICKEN - Fast-Paced Southern Charm, warm but witty, not stereotypical (Sound 40’s)

LAUNDRY - Friendly, Confident, Trustworthy, Clear & Clean, Serene. (Sound 30’s)

COFFEE - Deep and Velvety, Romanced ingredients, (Sound 40’s)

STREET CORN - Heartfelt, Passionate, Proud, Traditional (Sound 30’s) (no need to put on a Hispanic accent but make sure you pronounce Abuela correctly)
Details
Overall, each character—whether appearing on camera or as a voice-over—should fully embody the specific commercial trope they represent. Their behavior, delivery, and dialogue must feel authentic to the world of that ad style.

Because they exist inside their own commercial, the arrival of the hot sauce should register as a genuine, unexpected disruption. They are not in on the joke; their surprise is real and rooted in their established persona.

For the hot sauce moment, please explore a clear range of reaction intensities for each character—from subtle shifts in tone or expression to higher energy responses—while still staying true to the logic and style of their original commercial world.

Due
Audition Deadline
1/9/2026
 
Audition Due Time (Pacific)
10:00 AM
Direction
Direction
Please do 1-2 takes of each script (see specific highlights for male roles) no take numbers, slate at the end

SCROLL DOWN FOR ALL SCRIPTS
 
Audition Slate
Slate your name & ASP at the end of the audition
File Uploads
Document	Description	Current File
Project Script	AUDITION SCRIPT	
Audition Upload
Your file will be automatically renamed to the label below.

English Male Character VO_Daniel Lewis.mp3
No file chosen', NULL, 'English Male Character VO', 'We are looking to cast a male with a wide voice and acting range to portray the following voices:

CHICKEN - Fast-Paced Southern Charm, warm but witty, not stereotypical (Sound 40’s)

LAUNDRY - Friendly, Confident, Trustworthy, Clear & Clean, Serene. (Sound 30’s)

COFFEE - Deep and Velvety, Romanced ingredients, (Sound 40’s)

STREET CORN - Heartfelt, Passionate, Proud, Traditional (Sound 30’s) (no need to put on a Hispanic accent but make sure you pronounce Abuela correctly)', '⬇️ FILENAME (COPY THIS) ⬇️
English Male Character VO_Daniel Lewis.mp3

-------------------

DIRECTION:
Please do 1-2 takes of each script (see specific highlights for male roles) no take numbers, slate at the end

SCROLL DOWN FOR ALL SCRIPTS

SLATE:
Slate your name & ASP at the end of the audition
File Uploads
Document	Description	Current File
Project Script	AUDITION SCRIPT	
Audition Upload
Your file will be automatically renamed to the label below.

English Male Character VO_Daniel Lewis.mp3
No file chosen', 'https://forms.aspvo.com/audition?t=R4546PSEuKqFWRkZu5p99sbUB9w9e&c=C8959RIX5tIlrcTjqKlZoh0pj6i7T', '', 'America/New_York', 'America/Los_Angeles', '2026-01-09 19:23:49.141+00'),
	(21, '2026-01-09 18:07:37.061246+00', 'Untitled Animated Series ''CHIP''', 'IDIOM', 'Direct', 'Scale', 'inbox', '2026-01-17 01:00:00+00', 'SESSION: mid-February 2026', NULL, '', 'Real/Charactery - Youthful sounding - not young. Chip''s mean streak comes laced with charm and fashion sense and he uses his words to subtly undermine. Emotionally, he ranges from deliciously devious and backhanded to icy detachment – but with glimpses of vulnerability beneath the gloss. Think Jonathan Bailey’s urbane sharpness or Billy Porter’s theatrical bite – the kind of voice that can eviscerate and enchant in the same breath. Not impressions but energy levels. 

Core Traits: Cold, cutting, and impossibly composed - his words feel purposefully curated with style and self-assurance.', 'LABEL: Chip-Your Name-IDIOM', '', '', NULL, 'America/Los_Angeles', NULL),
	(17, '2026-01-08 20:26:22.284409+00', 'ESPN x AT&T', 'ASP', 'Direct', 'Session - $500 + 20%', 'submitted', '2026-01-09 16:00:00+00', 'RATE:
Session - $500 + 20%
Usage - $1,200 + 20%

MEDIA:
Deliverables: 1 x :30
Media: Disney Linear, Streaming, Digital and Social Platforms and AT&T O&O Channels
Territory: US only (Global by nature for organic internet)

TERMS:
1 Month (January 19th 2026 - February 19th 2026)
 
Specs
Reference for VO from one of their past spots: https://www.youtube.com/watch?v=T2cc0nMikdY They truly just want this vibe, male. Please listen to the VO at the end of the spot.
Due
Audition Deadline
1/9/2026
 
Audition Due Time (Pacific)
8:00 AM
Direction
Direction
Please do 3 takes max of the following, no take numbers, slate at the end.

Script:
Stay connected to what matters with AT&T.
America''s fastest, most reliable network. Connecting changes everything.
 
Audition Slate
Slate name & ASP at the end of the audition
 
Additional Notes
No late submissions sorry, this is a tight turnaround for us so the earlier you get it in the better. No need to let us know, we will see it. If the voice reference isn''t a good match please just delete. Thanks!

Audition Upload
Your file will be automatically renamed to the label below.

AT&T_Daniel Lewis_ASP.mp3
No file chosen', NULL, 'VO', 'Reference for VO from one of their past spots: https://www.youtube.com/watch?v=T2cc0nMikdY They truly just want this vibe, male. Please listen to the VO at the end of the spot.
Due
Audition Deadline
1/9/2026
 
Audition Due Time (Pacific)
8:00 AM
Direction
Direction
Please do 3 takes max of the following, no take numbers, slate at the end.

Script:
Stay connected to what matters with AT&T.
America''s fastest, most reliable network. Connecting changes everything.
 
Audition Slate
Slate name & ASP at the end of the audition
 
Additional Notes
No late submissions sorry, this is a tight turnaround for us so the earlier you get it in the better. No need to let us know, we will see it. If the voice reference isn''t a good match please just delete. Thanks!

Audition Upload
Your file will be automatically renamed to the label below.

AT&T_Daniel Lewis_ASP.mp3
No file chosen', '⬇️ FILENAME (COPY THIS) ⬇️
AT&T_Daniel Lewis_ASP.mp3

-------------------

DIRECTION:
Please do 3 takes max of the following, no take numbers, slate at the end.

Script:
Stay connected to what matters with AT&T.
America''s fastest, most reliable network. Connecting changes everything.

SLATE:
Slate name & ASP at the end of the audition', 'https://forms.aspvo.com/audition?t=R4569BKjR5vHtoJbamClQHhFZg7Du&c=C8959RIX5tIlrcTjqKlZoh0pj6i7T', '', 'America/New_York', 'America/Los_Angeles', '2026-01-09 19:06:45.892+00'),
	(19, '2026-01-09 18:05:50.703404+00', 'Bank of Hawaii', 'ASP', 'Direct', 'Total of $1,000 + 20%', 'skipped', '2026-01-09 21:00:00+00', 'RATE:
Total of $1,000 + 20%

MEDIA:
2 spots
TV use in Hawaii and Guam only

TERMS:
One year
 
Specs
The Bank is introducing Financial Advisors. So, we’re looking for people who can project a sense of
gravitas while still feeling warm and aloha-ish.
Male, 30 to 50s. Would love to hear people who are from Hawaii or spent time there and sound “local,”
but not too pidgin-y.
Contemporary vibe.
We want to be able to make this feel like an important, but also an exciting announcement, bringing a
local perspective on investing to upper middle class and wealthier people with investable assets.
Please listen to the rough cut with temp music and temp vo for reference.
Due
Audition Deadline
1/9/2026
 
Audition Due Time (Pacific)
1:00 PM
Direction
Direction
No Slates Please – do not slate name, age, takes, etc.
Give 2-3 Takes of the Script on one mp3 showing some range
 
Audition Slate
No Slates Please
File Uploads
Document	Description	Current File
Project Script	AUDITION SCRIPT	
Project Audio Sample	AUDIO REFERENCE	
Project Audio Sample - VO

Audition Upload
Your file will be automatically renamed to the label below.

Bankoh_DanielLewis_ASP.mp3
No file chosen', NULL, 'VO', 'The Bank is introducing Financial Advisors. So, we’re looking for people who can project a sense of
gravitas while still feeling warm and aloha-ish.
Male, 30 to 50s. Would love to hear people who are from Hawaii or spent time there and sound “local,”
but not too pidgin-y.
Contemporary vibe.
We want to be able to make this feel like an important, but also an exciting announcement, bringing a
local perspective on investing to upper middle class and wealthier people with investable assets.
Please listen to the rough cut with temp music and temp vo for reference.
Due
Audition Deadline
1/9/2026
 
Audition Due Time (Pacific)
1:00 PM
Direction
Direction
No Slates Please – do not slate name, age, takes, etc.
Give 2-3 Takes of the Script on one mp3 showing some range
 
Audition Slate
No Slates Please
File Uploads
Document	Description	Current File
Project Script	AUDITION SCRIPT	
Project Audio Sample	AUDIO REFERENCE	
Project Audio Sample - VO

Audition Upload
Your file will be automatically renamed to the label below.

Bankoh_DanielLewis_ASP.mp3
No file chosen', '⬇️ FILENAME (COPY THIS) ⬇️
Bankoh_DanielLewis_ASP.mp3

-------------------

DIRECTION:
No Slates Please – do not slate name, age, takes, etc.
Give 2-3 Takes of the Script on one mp3 showing some range

SLATE:
No Slates Please
File Uploads
Document	Description	Current File
Project Script	AUDITION SCRIPT	
Project Audio Sample	AUDIO REFERENCE	
Project Audio Sample - VO

Audition Upload
Your file will be automatically renamed to the label below.

Bankoh_DanielLewis_ASP.mp3
No file chosen', 'https://forms.aspvo.com/audition?t=R4581Qsa1Rx3KGa2oG56XIMwcMTSv&c=C8959RIX5tIlrcTjqKlZoh0pj6i7T', '', NULL, 'America/Los_Angeles', NULL),
	(18, '2026-01-08 20:50:24.273679+00', 'My Strange Arrest-Season 4', 'ASP', 'Direct', '$480 + agency per episode', 'skipped', '2026-01-12 16:00:00+00', 'RATE:
$480 + agency per episode
20 x 30 min episodes

MEDIA:
On air

TERMS:
Due to the nature of use, it''s a buyout all media. Slated to run on A&E.', NULL, 'VO', 'If this is not a good fit please just delete as the voice they are looking for is quite specific.

The network really likes the sound of last season''s host (example below), so we are hoping to stay close to it; authoritative with a wry sense of humor, caucasian, knowledgeable, confident.

A good example can be heard below:
https://vimeo.com/1105163359

password: arrest2025

*(the specific segment where he shows a great range of what we are looking is :41- 4:50)
Due
Audition Deadline
1/12/2026
 
Audition Due Time (Pacific)
8:00 AM
Direction
Direction
1-2 full takes of the script (scroll down) no take numbers, no slate
 
Audition Slate
No Slate on this one
File Uploads
Document	Description	Current File
Project Script	AUDITION SCRIPT	
Audition Upload
Your file will be automatically renamed to the label below.

SecretArrest_Daniel Lewis_ASP.mp3
No file chosen', '⬇️ FILENAME (COPY THIS) ⬇️
SecretArrest_Daniel Lewis_ASP.mp3

-------------------

DIRECTION:
1-2 full takes of the script (scroll down) no take numbers, no slate

SLATE:
No Slate on this one
File Uploads
Document	Description	Current File
Project Script	AUDITION SCRIPT	
Audition Upload
Your file will be automatically renamed to the label below.

SecretArrest_Daniel Lewis_ASP.mp3
No file chosen', 'https://forms.aspvo.com/audition?t=R4570bFiU75dKaOSWxKPiNqYjGvQP&c=C8959RIX5tIlrcTjqKlZoh0pj6i7T', '', NULL, 'America/Los_Angeles', NULL),
	(20, '2026-01-09 18:06:47.543541+00', 'CIBC EDB VO', 'IDIOM', 'Direct', 'Session fee: $500 + Usage $2250 = $2,750 (per spot)', 'skipped', '2026-01-15 01:00:00+00', 'SESSION: Wed Jan 28 12:00am 2026 - COULD START AS EARLY AS 9AM EST', NULL, '', 'Confident, inspirational storyteller.', 'LABEL: CIBC-Your name', '', '', NULL, 'America/Los_Angeles', NULL),
	(22, '2026-01-09 19:24:57.083814+00', 'Takis Fuego Hot Sauce-CONFIDENTIAL', 'ASP', 'Direct', 'Session Fee: $500.00 + 20% agent fee (up to a 2 hour session)', 'submitted', '2026-01-09 21:00:00+00', 'RATE:
Session Fee: $500.00 + 20% agent fee (up to a 2 hour session)
Session Pickup/Rerecord Fee $250 + 20% agent fee (up to a 1 hour session)
Usage fee $5000 campaign buyout + 20%

MEDIA:
Unlimited edits, Worldwide digital use including but not limited to Social, Website, CTV, POS, PR, Internal, OOH. Worldwide Broadcast TV except for USA.

TERMS:
Usage is 2 Years w/ 1 year renewal option of +10%
 
Specs
Male - Intense, high-energy- edgy. (Sound 20’s)
Due
Audition Deadline
1/9/2026
 
Audition Due Time (Pacific)
1:00 PM
Direction
Direction
Please do 2-3 full takes, no take numbers, slate at the end
 
Audition Slate
Slate your name & ASP at the end of the audition
File Uploads
Document	Description	Current File
Project Script	AUDITION SCRIPT	
Audition Upload
Your file will be automatically renamed to the label below.

Spanish AVO_Daniel Lewis.mp3
No file chosen', NULL, 'Spanish AVO', 'Male - Intense, high-energy- edgy. (Sound 20’s)
Due
Audition Deadline
1/9/2026
 
Audition Due Time (Pacific)
1:00 PM
Direction
Direction
Please do 2-3 full takes, no take numbers, slate at the end
 
Audition Slate
Slate your name & ASP at the end of the audition
File Uploads
Document	Description	Current File
Project Script	AUDITION SCRIPT	
Audition Upload
Your file will be automatically renamed to the label below.

Spanish AVO_Daniel Lewis.mp3
No file chosen', '⬇️ FILENAME (COPY THIS) ⬇️
Spanish AVO_Daniel Lewis.mp3

-------------------

DIRECTION:
Please do 2-3 full takes, no take numbers, slate at the end

SLATE:
Slate your name & ASP at the end of the audition
File Uploads
Document	Description	Current File
Project Script	AUDITION SCRIPT	
Audition Upload
Your file will be automatically renamed to the label below.

Spanish AVO_Daniel Lewis.mp3
No file chosen', '', '', 'America/New_York', 'America/Los_Angeles', '2026-01-09 19:31:52.492+00'),
	(23, '2026-01-14 18:18:27.839192+00', 'Hotels.com', 'ASP', 'Direct', 'Rates are per script & +20%', 'submitted', '2026-01-14 16:00:00+00', 'RATE:
Rates are per script & +20%

BROADCAST - TV (NorthAmerica and UK) *OPTION FOR Digital/Social (Global)

Session fee PER SCRIPT @ $500 (up to 2hrs per script)

Use @ $7,500 for 1 main script and it''s cutdowns/versions/edits

*Option for social and web (terms same as below) for 6 months @ $1,000


SOCIAL and web / (Global)

Session fee PER SCRIPT @ $350 (up to 2hrs per script)

Use @ $2,000 for 1 main script and it''s cutdowns/versions

Including but not limited to: Social Media, YouTube, Client & 3rd party sites, digital, streaming, OTT, etc use. (Global by default)


RADIO (Terrestrial - North America & UK) / STREAMING & WEB AUDIO(Global)

Session fee PER SCRIPT @ $350 (up to 2hrs per script)

Use @ $2,000 for 1 main script and it''s cutdowns/versions

Including but not limited to: Terrestrial Radio (N.A. & UK) and digital, streaming use including but not limited to: Pandora, Spotify (Global by default)


Session options: (applies to all sessions)

OT @ $75 per half hour after
Re-Record rates: $150 first hour / OT @ $75 per half hour after
DEMO SESSION (if needed) @ $150 per script (1hr if directed) / OT after

Use Option: renewal for additional year at 10% increase over previous year


*Any social posts will remain for archival purposes and internal and corporate use will be in perpetuity

**Session fees are guaranteed if booked, use fees only if final spot is approved for use
Terms of Use
One year
 
Exclusivity
Hotels
Specs
This is for Hotels.com and will hopefully be the new voice of their animated character

Male, Mid-30’s. British & American voices (authentic accents only please)

His voice should be distinct, recognizable and memorable. (Quirky, interesting)

US or Canada based/ with all necessary paperwork for paymaster

What he is: He’s good-natured and likable. Confident and trustworthy. He’s Friendly. Helpful. Welcoming. You can tell he likes his job. He’s almost more excited about your hotel stay than you are. He lives to serve. Afterall, his family has been in the hotel biz for generations.

What he isn’t: He’s not brash or cocky. He should sound like a real person, and not an over-the-top cartoon. Less Looney Tunes, more Bob’s Burgers.

With all of this being said, here are some "types"

British = somewhere in the camp of Tom Holland, or Daniel Radcliffe (and just a call out: not too posh).

US = Fred Armisen, Andy Samberg would be the right amount of quirk

One last important note is that the voice should have a range and be able to play within two slightly different archetypes. The first one is bringing a modern, approachable and fun character to old world standards of hospitality that you might find at the Ritz or Plaza. The other is straightforward, reliable, and bristling with charm. He means what he says and he says what he means. For as long as he’s been doing this, Bellboy has been a bell you can count on for service and a smile.
Due
Audition Deadline
1/14/2026
 
Audition Due Time (Pacific)
8:00 AM
Direction
Direction
Please listen to the mp3 for direction, 2 takes, no take numbers, slate NAME ONLY at the end of the audition.
 
Audition Slate
Slate name only at end of audio
File Uploads
Document	Description	Current File
Project Script	AUDITION SCRIPT	
Project Audio Sample	AUDIO REFERENCE	
Project Audio Sample

Audition Upload
Your file will be automatically renamed to the label below.

Hotels_Daniel Lewis_ASP.mp3
No file chosen

TERMS:
One year', NULL, 'Bellboy', 'This is for Hotels.com and will hopefully be the new voice of their animated character

Male, Mid-30’s. British & American voices (authentic accents only please)

His voice should be distinct, recognizable and memorable. (Quirky, interesting)

US or Canada based/ with all necessary paperwork for paymaster

What he is: He’s good-natured and likable. Confident and trustworthy. He’s Friendly. Helpful. Welcoming. You can tell he likes his job. He’s almost more excited about your hotel stay than you are. He lives to serve. Afterall, his family has been in the hotel biz for generations.

What he isn’t: He’s not brash or cocky. He should sound like a real person, and not an over-the-top cartoon. Less Looney Tunes, more Bob’s Burgers.

With all of this being said, here are some "types"

British = somewhere in the camp of Tom Holland, or Daniel Radcliffe (and just a call out: not too posh).

US = Fred Armisen, Andy Samberg would be the right amount of quirk

One last important note is that the voice should have a range and be able to play within two slightly different archetypes. The first one is bringing a modern, approachable and fun character to old world standards of hospitality that you might find at the Ritz or Plaza. The other is straightforward, reliable, and bristling with charm. He means what he says and he says what he means. For as long as he’s been doing this, Bellboy has been a bell you can count on for service and a smile.
Due
Audition Deadline
1/14/2026
 
Audition Due Time (Pacific)
8:00 AM
Direction
Direction
Please listen to the mp3 for direction, 2 takes, no take numbers, slate NAME ONLY at the end of the audition.
 
Audition Slate
Slate name only at end of audio
File Uploads
Document	Description	Current File
Project Script	AUDITION SCRIPT	
Project Audio Sample	AUDIO REFERENCE	
Project Audio Sample

Audition Upload
Your file will be automatically renamed to the label below.

Hotels_Daniel Lewis_ASP.mp3
No file chosen', '⬇️ FILENAME (COPY THIS) ⬇️
Hotels_Daniel Lewis_ASP.mp3

-------------------

DIRECTION:
Please listen to the mp3 for direction, 2 takes, no take numbers, slate NAME ONLY at the end of the audition.

SLATE:
Slate name only at end of audio
File Uploads
Document	Description	Current File
Project Script	AUDITION SCRIPT	
Project Audio Sample	AUDIO REFERENCE	
Project Audio Sample

Audition Upload
Your file will be automatically renamed to the label below.

Hotels_Daniel Lewis_ASP.mp3
No file chosen', '', '', 'America/New_York', 'America/Los_Angeles', '2026-01-14 18:49:23.529+00'),
	(24, '2026-01-14 18:19:06.198842+00', 'FHB', 'ASP', 'Direct', 'Video Deliverables: :30 with direct lifts', 'submitted', '2026-01-14 16:00:00+00', 'RATE:
Video Deliverables: :30 with direct lifts
:15, :06 cutdowns

Session Fee: $500 + 20%
Total Usage Fee: $800 + 20%

MEDIA:
All media

Territory: Hawaii, Guam, Saipan

TERMS:
1 year
 
Specs
Male, 30-40

Talent should not have a noticeable accent of any kind
Due
Audition Deadline
1/14/2026
 
Audition Due Time (Pacific)
8:00 AM
Direction
Direction
3 in a row of the below line, no take numbers, slate name and ASP at the end of the audition

Please see the rough cut here -https://f.io/aXUCO0FS

Script:
What about our vacation?!
 
Audition Slate
Slate name and ASP at the end of the audition
File Uploads
Document	Description	Current File
Project Script	AUDITION SCRIPT	
Audition Upload
Your file will be automatically renamed to the label below.

VO_Daniel Lewis_ASP.mp3
No file chosen', NULL, 'VO', 'Male, 30-40

Talent should not have a noticeable accent of any kind
Due
Audition Deadline
1/14/2026
 
Audition Due Time (Pacific)
8:00 AM
Direction
Direction
3 in a row of the below line, no take numbers, slate name and ASP at the end of the audition

Please see the rough cut here -https://f.io/aXUCO0FS

Script:
What about our vacation?!
 
Audition Slate
Slate name and ASP at the end of the audition
File Uploads
Document	Description	Current File
Project Script	AUDITION SCRIPT	
Audition Upload
Your file will be automatically renamed to the label below.

VO_Daniel Lewis_ASP.mp3
No file chosen', '⬇️ FILENAME (COPY THIS) ⬇️
VO_Daniel Lewis_ASP.mp3

-------------------

DIRECTION:
3 in a row of the below line, no take numbers, slate name and ASP at the end of the audition

Please see the rough cut here -https://f.io/aXUCO0FS

Script:
What about our vacation?!

SLATE:
Slate name and ASP at the end of the audition
File Uploads
Document	Description	Current File
Project Script	AUDITION SCRIPT	
Audition Upload
Your file will be automatically renamed to the label below.

VO_Daniel Lewis_ASP.mp3
No file chosen', '', '', 'America/New_York', 'America/Los_Angeles', '2026-01-14 18:49:29.046+00');


--
-- Data for Name: 12_voiceover_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."12_voiceover_notes" ("id", "created_at", "category", "title", "content") VALUES
	(3, '2026-01-06 18:35:03.611662+00', 'chain_settings', 'RX 11 Plugin Presets', '[{"tool": "EQ", "settings": "-100hz rumble"}, {"tool": "De-ess", "settings": "classic, thresh -5, cutoff 2500, slow, spectral 50%"}, {"tool": "Mouth De-click", "settings": "sensitivity 4 (others 0)"}, {"tool": "Voice De-noise", "settings": "adaptive, dialogue, surgical, reduc 12db, thresh 0"}, {"tool": "Voice De-crackle", "settings": "quality high, strength 4, amp skew -5"}, {"tool": "Noise Gate", "settings": "threshold -32, reduction 15, attack 10, hold 350, decay 300"}]'),
	(1, '2026-01-06 18:35:03.611662+00', 'scratchpad', 'Daily Notes', '{"text": ""}'),
	(2, '2026-01-06 18:35:03.611662+00', 'hotkeys', 'Audacity Shortcuts', '[{"key": "Cmd + A", "action": "ACX Check"}, {"key": "Ctrl + Opt + A", "action": "ACX Prep"}, {"key": "Cmd + Shift + X", "action": "Expand tracks"}, {"key": "Ctrl + Opt + Z", "action": "Izotope Cleanup"}, {"key": "Shift + D", "action": "Punch ''n Roll"}, {"key": "R", "action": "Record current track"}, {"key": "Shift + R", "action": "Record new track"}, {"key": "", "action": "Smooth zoom - hold command + two fingers"}, {"key": "Cmd + Shift + C", "action": "Squish tracks"}, {"key": "Shift + S", "action": "Solo track"}, {"key": "Cmd + Opt + N", "action": "Noise reduction"}]');


--
-- Data for Name: 1_responsive_leads; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: 3_onboarding_first_15; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."3_onboarding_first_15" ("id", "request_id", "added_to_contacts", "backend_folder", "docs_customized", "production_folder", "contract_sent", "esig_sent", "contract_signed_date", "contract_signed", "deposit_sent", "deposit_paid_date", "deposit_paid", "email_receipt_sent", "breakdown_received_date", "breakdown_received", "manuscript_received", "f15_due_internal", "f15_sent_date", "f15_client_due_date", "f15_feedback_received_date", "f15_revision_req", "f15_r2_due_internal", "f15_r2_sent_date", "f15_r2_client_due_date", "f15_approved", "strike_count", "last_nudge_date", "current_status", "refund_status", "created_at", "updated_at", "step_dates", "refund_percentage", "refund_date") VALUES
	('1c14d54a-4f9b-4192-9869-ea4fc1f80f49', '196951bd-663b-446c-99e1-2193869a00db', true, true, false, false, true, true, '2026-01-07', true, true, '2026-01-07', true, true, '2026-01-07', true, true, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, false, 0, NULL, 'Onboarding', 'None', '2026-01-07 05:14:22.425898+00', '2026-01-07 05:14:22.425898+00', '{"esig_sent": "2026-01-07", "deposit_paid": "2026-01-07", "deposit_sent": "2026-01-07", "moved_to_f15": "2026-01-08", "contract_sent": "2026-01-07", "backend_folder": "2026-01-07", "contract_signed": "2026-01-07", "added_to_contacts": "2026-01-07", "breakdown_received": "2026-01-07", "email_receipt_sent": "2026-01-07", "manuscript_received": "2026-01-07"}', 0, NULL),
	('2df7b6f3-3095-4721-87e2-7357eb549769', '4a2322be-73da-4c8f-93f6-3dddf5360c94', false, false, false, false, false, false, NULL, false, false, NULL, false, false, NULL, false, false, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, false, 0, '2026-01-08', 'Onboarding', 'None', '2026-01-07 06:49:07.215753+00', '2026-01-07 06:49:07.215753+00', '{}', 0, NULL);


--
-- Data for Name: 4_production; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."4_production" ("id", "request_id", "status", "recording_start_date", "recording_due_date", "files_sent_date", "crx_status", "crx_due_date", "characters", "crx_batches", "checklist", "strikes", "internal_notes", "pozotron_rate", "pfh_rate", "other_expenses", "active_timer_start", "active_timer_elapsed", "active_timer_activity") VALUES
	('93962383-609c-4ad0-a9f9-978b284096ab', '196951bd-663b-446c-99e1-2193869a00db', 'recording', '2026-01-07', '2026-01-16', NULL, 'none', NULL, '[]', '[]', '[]', 0, '', 14.00, 150, '[]', NULL, 0, 'Recording');


--
-- Data for Name: 5_auditions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."5_auditions" ("id", "created_at", "client_name", "script_text", "audio_file_url", "status", "book_title", "roster_producer", "end_date", "production_status", "material_url") VALUES
	('a5302da8-cccb-48cb-b906-06bedf4dbb1d', '2026-01-04 02:59:48.713095+00', 'tits', NULL, NULL, 'archive', 'tits', 'acx', '2026-01-27', 'auditioning', NULL),
	('c72d9c3e-b94d-4a7a-9e2e-75a3db8da321', '2026-01-04 03:29:07.14832+00', '', NULL, NULL, 'booked', 'title', '', NULL, 'auditioning', '');


--
-- Data for Name: 6_archive; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: 7_bookouts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."7_bookouts" ("id", "created_at", "start_date", "end_date", "reason", "type") VALUES
	('d28a8e2d-975d-4331-af9c-c57f0a05a150', '2026-01-06 08:48:38.061495+00', '2026-02-10', '2026-02-18', 'Ghost Mode', 'ghost'),
	('56dba891-0283-494f-ba33-0974f707a056', '2026-01-06 08:48:38.061495+00', '2026-02-27', '2026-03-08', 'Ghost Mode', 'ghost'),
	('e901dc77-edd6-4d1b-9be4-61bd42a1fb25', '2026-01-06 08:48:38.061495+00', '2026-03-30', '2026-04-04', 'Ghost Mode', 'ghost');


--
-- Data for Name: 8_do_not_contact; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."8_do_not_contact" ("id", "full_name", "indie_or_company", "email", "lead_type", "reason", "date_last_contacted") VALUES
	(1, 'Chris Philbrook', 'Indie', NULL, 'Author: Sci-Fi', 'Dormant Client', '2025-10-01'),
	(2, 'Jim Christ', 'Indie', NULL, 'Author: Other', 'Dormant Client', '2025-11-01'),
	(3, 'Kelsie Rae', 'Indie', NULL, 'Author: Romance', 'Conflict of interest', NULL),
	(4, 'A.A. Dark', 'Indie', NULL, 'Author: Romance', 'Conflict of interest', NULL),
	(5, 'Alaska Angelini', 'Indie', NULL, 'Author: Romance', 'Conflict of interest', NULL),
	(6, 'Maggie Mayhem', 'Indie', NULL, 'Author: Romance', 'Conflict of interest', NULL),
	(7, 'J. Sterling', 'Indie', NULL, 'Author: Romance', 'Conflict of interest', NULL),
	(8, 'Jonah York', 'Indie', NULL, 'Author: Romance', 'Conflict of interest', NULL),
	(9, 'April Barnswell', 'Indie', NULL, 'Author: Romance', 'Not good fit', NULL);


--
-- Data for Name: 9_invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."9_invoices" ("id", "created_at", "project_id", "total_amount", "deposit_amount", "final_amount", "currency", "deposit_status", "deposit_date_paid", "final_status", "final_date_paid", "invoice_pdf_link", "tracker_sheet_link", "notes", "reference_number", "pfh_count", "pfh_rate", "invoiced_date", "due_date", "reminders_sent", "sag_ph_percent", "convenience_fee", "ledger_tab", "contract_link", "custom_note", "payment_link", "pozotron_rate", "other_expenses", "est_tax_rate", "logo_url", "line_items") VALUES
	('c4961f32-22b5-4766-9704-05e8e978da5d', '2026-01-07 08:27:18.524529+00', '196951bd-663b-446c-99e1-2193869a00db', 1205, 0, 1205, 'USD', 'pending', '2026-01-11', 'pending', NULL, NULL, NULL, NULL, '26001', 8.7, 150, '2026-01-07', '2026-01-22', 0, 0, 0, 'open', '', '', '', 14.00, 0.00, 25.00, 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/admin/logo-1767773734703.png', '[{"amount": "-100", "description": "late fee"}]');


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."posts" ("id", "created_at", "slug", "title", "date", "tag", "image", "content", "image_caption", "views", "image_2", "image_3", "image_4", "image_5", "published", "author", "image_6", "music_embed", "blogcast_url") VALUES
	('c4ac1e1a-a5c1-402d-82b2-e990e198f9ed', '2025-12-14 01:19:45.080244+00', 'voice-acting-redemption', 'Voice acting redemption', '2024-12-09', 'Acting', 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/voice-acting-redemption/hero/blog-voice-acting-redemption.webp', '<p>I fucked up.</p><p>But now I’m making it right.</p><h2>“I was GOOD at somethin’, Margaret!”</h2><p>⬆️ I made that quote up (I think), but it sounds cinematic and dramatic. It also relates to the path of regret I will go down with my audiobook career (a very successful career) if I don’t implement extreme measures NOW.</p><h2>In the beginning</h2><p>It was 2018. I was fed up with Hollywood (and divisive USA culture), the acting rat race (just as bad as the corporate rat race), and serving burgers to stoned kids wearing Supreme.</p><p>So, I did something crazy after my Groundlings improv instructor told me I had a great voice during a feedback session.</p><p>Despite one of the hottest summers Los Angeles had ever seen, I went into my sweltering bedroom closet in my 100-year-old Miracle Mile apartment with no AC or insulation and just started.</p><p>I began recording audiobooks on a shitty $15 clip-on microphone that had no business producing professional audio (my phone probably would’ve done better).</p><h2>Quick backtrack</h2><p>In my final year of <a href="/actor" target="_blank">acting conservatory</a>, the topic of “how to not starve while trying to make it” was, naturally, topical and often discussed.</p><p>We actors were about to be set free on the big bad world primed to chew us up and loogie us out. (I’m sorry for the graphic nature of that metaphor. Being an actor can be brutal).</p><p>Part and parcel of our showcases – where we presented scenes to casting directors in New York City, Los Angeles, and our hometown, Chicago – were alumni panels after each event. This was an opportunity for recent alumni of our program to impart wise words to the soon-to-be graduates.</p><p>During the New York alumni panel, I forget which alumnus said it, but I need to thank him:</p><blockquote>“Audiobooks are a great way to survive and keep your acting chops up between bigger bookings.”</blockquote><p>To paraphrase.</p><h2>Back on track</h2><p>I was on my 7th or 8th restaurant job, having a fit of ‘Am I going to serve at restaurants forever?’ despair, and the memory of that panel returned to me. An epiphany.</p><p>So I bore the pain of recording in my sweltering Los Angeles apartment – a makeshift studio turned sauna. But then my break came.</p><p>Some Boston-based entrepreneur, who had nothing to do with the arts, was starting an audiobook agency and found my freshly uploaded samples by happenspace.</p><p>He liked my voice (enough) to hire me at the top rate. (Still a horrible rate. But it was the best I could do when just getting started.)</p><p>With my makeshift sauna / studio / closet and a clip-on microphone from Amazon Prime(d), I recorded my first audiobook. And that’s when I realized I had a knack for this and could apply my rigorous acting training and talent to it.</p><p>I won’t lie…. my first audiobook was shit. And it’s funny who I was replacing (due to other commitments he likely had).</p><p>But that mediocrity didn’t last long.</p><p>Because I soon upgraded my studio, and equipment, and began to record professionally.</p><h2>Skipping over a lot for shorter blog purposes</h2><p>In 2021, during the troughs of the pandemic, I recorded audiobooks while living (or being stuck?) in Korea (a story in its own right.)</p><p>But let’s get to the point of this blog.</p><p>During this time, I severely let a couple of authors and a fellow narrator down that year with late submissions – not a good reflection on my professionalism. I was even testy at times (tisk, tisk, Dan).</p><p>I could blame it on the anxiety and depression caused by global and environmental factors (I’m all good now), but I don’t want make excuses – I want to make it right.</p><p>In my 2025 comeback to audiobooks, I don’t just want to be better, I will strive to be one of the BEST – in narration quality AND customer service.</p><h2>Goals:</h2><p>Despite not doing my professional best that year, I continued building an impressive repertoire of audiobooks with thousands of high reviews, helping authors generate over $150k cumulatively in revenue.</p><p>But to me, those are ‘meh’ numbers.</p><p>I’m ready to level up.</p><p>This year, in 2025, I have my sights set on big voiceover goals:</p><ul><li value="1">Regrow my fanbase</li><li value="2">Partner with big authors</li><li value="3">Help authors, at a minimum, 3x their audiobook sales (I’m now also equipped with marketing and copywriting expertise)</li></ul><p><b><strong>tl;dr:</strong></b> I will no longer squander my talent and training – I aim to build my audiobook narration business into a 6-figure enterprise starting this year.</p><h2>Out of time, get to the point, Dan…</h2><p>Feel free to periodically check in on this post as I will update my progress from time to time, and the methods I used to achieve it.</p><p>For now, I just launched my fresh audiobook page (the third one… such an idiot for deleting the other ones during my dark period in 2021).</p><p>If you’re an author or anyone else looking to hire me for commercial voiceover, I will give you a voiceover service par excellence.</p><p>(Yes, that’s an old phrase, but I think it sounds kind of badass.)</p><p>I’m not fucking around anymore. And I’m ready to absolutely kick ass this year expanding my voice acting business (and eventual publishing company).</p><h3>Updates</h3><h4>January</h4><ul><li value="1">Wrote this blog, first booking of the year in progress (Romance title for high-selling author).</li><li value="2">Booked continued job from author partnership.</li></ul><h4>February</h4><ul><li value="1">Joined Dark Star Audio and produced this title which blew the author away.</li></ul><h4>March</h4><ul><li value="1">Booked role as video narrator for YouTube channel regarding anti-big pharma health solutions (cool).</li></ul><h4>April</h4><ul><li value="1">Added to two more rosters–Pro Audio Voices and Pin Up Audio. Booked a 10-hour crime thriller by the talented Jim Christ.</li></ul><h4>May</h4><ul><li value="1">Signed with an LA-based and a North Carolina-based talent agency, broadening my scope of work to commercials / TV / and other projects outside of audiobooks.</li><li value="2">Booked a title through Pin Up Audio. Never Far by A.A. Dark was released to rave reviews.</li><li value="3">Booked a 4-part Christian romance series (gotta keep things vanilla, too). Now scheduled out with work for two months.</li><li value="4">Have started casting female talent for my own roster of partners, which I will convert into an official roster once I have my super-secret production company up in Q4 of this year.</li></ul><h4>June</h4><ul><li value="1">More bookings set for September with long-standing author-partner Eva Ashwood</li><li value="2">Chosen for rush job and completed title for major and internationally best-selling romance author Kelsie Rae.</li></ul><h4>July</h4><ul><li value="1">Founded Second Crest as CEO and my own technical co-founder. Second Crest will be an industry-leading audiobook solution, production, and marketing suite for indie authors.</li></ul><h4>August</h4><ul><li value="1"><a href="https://www.audible.com/pd/A-Little-Crush-Audiobook/B0FH5JTBXF" target="_blank"><i><em>A Little Crush</em></i></a> released to high reviews for both story and performance.</li></ul><h4>September</h4><ul><li value="1">Booked three book series dual romance with <a href="https://podiumentertainment.com/" target="_blank">Podium</a> to be performed with Tom Taylorson.</li></ul><h4>October - December</h4><ul><li value="1">Actively recording titles for Podium Entertainment, Dark Star Audio, with multiple direct clinets. Gearing up for a massive marketing push for the end of year.</li><li value="2">Founding my own audiobook production company (it''s looking very good). Beta launch coming before 2026.</li></ul>', '', 0, '', '', '', '', true, '', '', '', ''),
	('d4e73658-9c91-4371-b6a2-7ed04e071773', '2025-12-14 01:19:45.080244+00', 'less-input-more-output', 'Less (toxic) input, more (quality) output', '2024-12-09', 'Life', 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/less-input-more-output/hero/blog-input-output.webp', '<p>How to be more than a pawn in the rigged chess game of life where the "elite" cheat.</p><h2>Junk food for the mind</h2><p>It’s 2025.</p><p>Billions are doom scrolling away on their various rectangular mind-control prison devices – and most of this “information” is junk food for the mind.</p><p>Scrolling on your phone or tablet is kind of like going to the Golden Corral. You leave entirely too bloated, feeling like a literal walking piece of shit. (And deeply ashamed, of course.)</p><p>In 2025, with an unlimited buffet of short-form attention-span-eroding social media videos, opening TikTok is like reaching for frosted animal circus cookies instead of a gala apple. One vertical scroll equals one cookie (20 calories). Five swipes in, and you’re already at a hundo.</p><p>But there’s a catch.</p><p>The quality of input we consume is everything.</p><h2>Example list of bad, debatable, and ideal input</h2><p>These aren’t absolute (who would I be to make a definitive list). They can, of course, vary from person to person. But I think it’s a solid start. What do you think?</p><h3>Bad: weaponized soul-sucking materialism</h3><ul><li value="1">Taylor Swift</li><li value="2">Listening to anything on the billboard charts</li><li value="3">All mainstream news outlets</li><li value="4">90% of social media (including X)</li><li value="5">Most podcasts</li><li value="6">Netflix</li><li value="7">Junk food</li><li value="8">Fashion trends</li><li value="9">Porn</li><li value="10">Listening to stupid people repeat what they consumed on social media</li><li value="11">Basically anything that TAKES from your time and gives zero value (arbitrary information is not value)</li></ul><h3>Debatable: guilty pleasures (sometimes you gotta take a load off)</h3><ul><li value="1">Professional sports (including NCAA) minus the commercials</li><li value="2">Good observationalist comedy (i.e., Tim Dillon)</li><li value="3">Any hobby that brings enjoyment</li><li value="4">YouTube videos that interest us</li><li value="5">Classic rock</li></ul><h3>Ideal: a better life</h3><ul><li value="1">YouTube / paid online learning videos to learn a beneficial skill</li><li value="2">Books that teach us marketable skills or self-improvement</li><li value="3">Practicing skills that are marketable</li><li value="4">Healthy food and supplements</li><li value="5">Learning a foreign language</li><li value="6">Learning how to improve relationships</li><li value="7">Activities you can skill up and get good at (i.e., paddleboarding, running, darts, an instrument)</li></ul><p>“Hey, why is Tay Tay in the really bad category 😤 and not sports!” Because she is objectively less talented than many other amazing musicians and entertainers. And I don''t waste my time with the hive-mind Zeitgeist.</p><p>Athletes, on the other hand, have to prove themselves through years of rigorous competition, and their athleticism can be objectively measured.</p><p>Anyway… let’s focus on the good inputs. Notice anything? It’s all mostly learning. And not just learning anything… but inputs that directly affect the quality of output you can offer.</p><p>Example: Input Korean grammar book. Output 100x with the ability to go to Korea and speak with locals, make friends more easily, date more comfortably, and get a job or start a business in Korea, all while opening up an entirely new world and society in your life.</p><p>Huge return.</p><h2>Wild-guess ratio</h2><p>Let’s make an unscientific estimate: if you want to be a producer (creator) leaving an impression on the world more than the world leaves an impression on you, you need 25% input / 75% output.</p><p>Whatever the ratio, the point is to stick to books that help you become better. Use your phone sparingly. And when you do, make sure it’s used mainly for output, not input – you should be outputting 3x of what you’re inputting.</p><h2>Not for everyone</h2><p>If you don’t want to be a creator, that’s absolutely fine. In fact, most people aren’t meant to be creators. Otherwise, who would input the things the outputters produced?</p><p>As this is an entrepreneurial-minded website and blog, this post is more for those who feel they want to be more but aren’t meeting their expectations.</p><p>Point is: if you DO want to be more, start producing more work NOW.</p><h2>Ditch the fear of failure</h2><p>Someone will always criticize your output (one of the main reasons why many live in frozen input states). But guess what? Those who criticize you are most likely… you guessed it. Victims of too much input.</p><p>So they criticize through a distorted lens those actually trying to output. It’s envy and insecurity. Plain and simple.</p><p>Fuck ''em. Laser focus.</p><h2>Go output</h2><p>If this post resonates with you in any way, feel free to reach out. My inbox is always open.</p>', '', 0, '', '', '', '', true, '', '', '', ''),
	('538eaa5d-add9-49d8-8f11-4a9fb0e483e1', '2025-12-14 01:19:45.080244+00', 'darts-improve-focus', 'Darts improve focus', '2024-12-02', 'Acting', 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/darts-improve-focus/hero/blog-darts.webp', '<p>In my final year of acting school, alumnus <a href="https://en.wikipedia.org/wiki/John_C._Reilly" target="_blank">John C. Reilly</a> guest-starred in one of our mainstage productions. While in town and hanging around our halls, he did a talk and Q&amp;A during class hours, free for anyone to attend.</p><p>I don''t pedestal celebrities… but he is pretty hilarious, and given my inclination for comedic acting, I attended.</p><p>He talked about how earning his acting BFA from our program kickstarted his career and gave advice to us blooming hopefuls.</p><p>One nugget of advice was more or less this, to paraphrase:</p><blockquote>"A buddy of mine was big into motorcycle riding, telling me how when caught in the middle lane between two semis… if he so much as thought about one of the semis, he would unconsciously drift toward that lane a bit."</blockquote><p>Basically why peak focus is non-negotiable for an actor.</p><h2>Imposter Syndrome</h2><p>No matter how many times–with earnestness and honesty–my classmates and professors told me I was extremely talented, I never believed them.</p><p>I’m a long-time sufferer of imposter syndrome – <i><em>deadly</em></i> for an actor. Here’s what my thought process might be while performing:</p><p><i><em>“i said that awkwardly… im not using my hands right… why am i standing here i need to do something with my hands… im good at acting but will never be great… why did i get admitted into this program if im not good… am i better than [so and so]… actually no one likes me at all they just all pretend to so i don’t get hurt… and you know what my face looks puffy from last night’s cheat meal at subway cuz i had two macadamia nut cookies after a footlong that’s like 200 grams of carbs”</em></i></p><p>If we’re going by motorcycle analogy metrics, that could cause a 20-car pileup.</p><h2>I made focus a top priority</h2><p>One day, the proverbial “fuck it” came and I dropped every technique, every book, and every “expert’s” advice… and stopped focusing on the left and right lanes.</p><p>Around this time, I started playing in Windy City Darters. An epiphany. Darts train focus. The same focus I can use on stage and screen. Moreover, with darts:</p><ul><li value="1">There’s pressure.</li><li value="2">There’s an audience watching.</li><li value="3">The more I thought about missing, the more I missed.</li><li value="4">Hyper-focus is required – it’s a game of millimeter precision.</li><li value="5">The less I used my “active” awareness and just… “did”… the more I entered into a flow state.</li></ul><p>And when in a flow state, my 3-dart average <i><em>drastically</em></i> improved.</p><p>So when I applied that flow state to auditions and performances, my imposter syndrome took more of a back seat. Of course, focus like this isn''t a golden ticket to acting genius, but I do believe it’s necessary to achieve high-level performances.</p><p>For the actor, focus (and breath) is the foundation for all technique that follows.</p><p>[[image:https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/darts-improve-focus/content-images/20170214-005426.jpg|size=medium|align=center|caption=My first "ton 80" (highest score possible in one set of throws)]]</p><h2>What are <i><em>you</em></i> focusing on?</h2><p>It doesn’t have to be darts (although my bias advocates this as a seriously fun way to practice focus).</p><p>Take any activity – painting, baking, woodworking, billiards, knitting, photography, whatever – and use it to achieve your necessary focus.</p>', '', 1, 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/darts-improve-focus/content-images/20170214-005426.jpg', '', '', '', true, '', '', '', ''),
	('ed78dea3-401a-4abb-bb32-565d6c391b86', '2025-12-14 01:19:45.080244+00', 'good-acting-easy-great-acting-personalization', 'Good acting is easy. Great acting is personalization.', '2025-01-03', 'Acting', 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/good-acting-easy-great-acting-personalization/hero/blog-good-acting-great-acting.webp', '<p>“You’ll be the fat guy in the sitcom… but you’ll never touch art.”</p><p>I don’t remember many things verbatim, especially when said over ten years ago. But I sure as shit remember this.</p><h2>Setting the stage</h2><p>I graduated from the highly-competitive acting program at DePaul University (1-2% acceptance rate and multiple auditions).</p><p>But just getting admitted wasn’t good enough–the first year was a trial to determine who would be invited back to complete the program.</p><p>Only the most talented and hardworking actors, decided by the tenured professors, would make “The Cut.” If I remember correctly, twenty-eight of the original forty-two students per class were invited back. (They have since stopped the cut system).</p><p>I made the cut, but that was only the beginning of my <b><strong>acting conservatory ass-beating</strong></b>.</p><p>We began our second year with “Introduction to Performance” – small-scale “beta” shows before our upperclassmen years in the main casting pool.</p><p>Typically, student-directors from the MFA program directed these, but given that our year was causing a buzz for being “especially talented” (I still name-drop Joe Keery as one of my 27 classmates like a loser), we were given professor directors.</p><p>And boy, did I “luck” out.</p><p>My show was assigned the Destroyer of Actors – A professor who''s name I''ve since redacted, out of respect of her, even though she never requested it. That said... she''s known in the space.</p><p>Fuck.</p><p>Her lore permeated the halls. She was known to absolutely cross-check wannabe actors’ egos into the boards. Destroyed them. A Scorched Earth type director out of a Broadway farce who yells “CUT” or “STOP” mid-scene during a live performance.</p><p>Which is exactly what happened to me.</p><h2>The Reason</h2><p>Given my weight and acting style I was being cast as the comedic best friend to the leading man type. You know, the one who never has a romantic scene. So I was given the comedic role of Andre in an obscure play, <i><em>Five Flights</em></i> by Adam Bock.</p><p>I had always hid my weight behind a funny mask, which is what I tried to do during this production.</p><p><b><strong>Bad move.</strong></b></p><p>It may have worked for me in high school or some other bullshit acting program, but not here.</p><p>So I was up there. Changing my shirt in the locker room scene. I can’t remember exactly what sparked it, but… I’m up there. Being all insecure with my shirt off trying to make the scene funny in front of the attractive females in my cast/class watching on.</p><p>Which is what you would think a comedic actor should do, right? Try to be funny.</p><p>No. It’s not what the fuck they do. At least not the good ones. And that’s what I learned on this day.</p><h2>The Hammer</h2><p>She was primed to rock me. And so it happened.</p><p><b><strong>My worst fear</strong></b>, and in the worst way. She laid down the hammer on my performance during a dress rehearsal with a partial audience.</p><p>I knew it was a microcosm of her larger tactic to shake up the uncut sophomores'' fresh "I made the cut!" mindset. You know, keep us motivated and not ungrateful for our achievement. But when she bore into me, it was on a new level.</p><blockquote>“STAHHHP! STAHHP. STAHP THE FUCKING SHOW. STAHP....”</blockquote><p><i><em>She announced.</em></i></p><p><i><em>(Silence for a full five seconds)</em></i></p><p><i><em>“Dahn… Dahn….. Dahn…….”</em></i></p><p><i><em>(Doing her trademark pushing up her glasses with a “Now it’s YOUR turn to get destroyed” knowing smirk).</em></i></p><p>“You’ll be the fat guy in the sitcom… but you’ll never touch art.”</p><p>Everyone in the room: my fellow classmates/castmates not knowing if they should look at me or look away. Shock. My face felt like I''d been in the sun for hours.</p><p><i><em>Oh. My God.</em></i></p><p>It actually happened. And likely one of the harshest roasts she gave in a while… if ever.</p><p>Had it been post-2016 in the woke, fake outrage era, she’d be reprimanded if I said it made me feel “unsafe” and “fat-shamed” (lol).</p><h2>The lesson</h2><p>“Does that mean I’m good?” “Am I like a Kevin James type?” “But is this necessarily a bad thing? Sitcoms make money.” “I think I know what she means to ‘show and not tell’ but how do I do that??”</p><p>This was the lesson she was instilling:</p><p><b><strong>Show, don’t tell. And if you know, it will show.</strong></b></p><p>It swirled in my head the next twenty-four hours. So many thoughts plagued me on my bike ride home.</p><p>You know how I know it was a defining moment? I can still remember the minor details. My bike tires tracing smooth patterns on the dusted pavement during the season’s first snow. Lost in concern and doubt as I biked at half the speed through Old Town in a soft-focus daze.</p><p>I concluded the only solution was to let go… and somehow “know.”</p><h2>My acting improved two-fold.</h2><p>It was our next and final dress rehearsal. My last chance to fix whatever I couldn’t fully grasp about “trying” to be funny. So, I did something wildly counterintuitive.</p><p><b><strong>I made comedy serious.</strong></b></p><p>Superb acting is not a popularity contest. It should never involve the actor playing to the audience (or the camera, which is a delayed audience). We act from the character’s point of view (POV); the character is never trying to be funny from the perspective of the story.</p><p>Sure, there are moments the character is consciously funny, like we do in life. But as the actor, it’s your responsibility to play from the character''s deeper throughline of desires, fears, and dreams.</p><p>Your character always pleads their case to get what they want, which is <i><em>always</em></i> about fulfilling their dream or controlling their reality, again, like in real life. We''re all just confused little humans waddling around trying to avoid suffering and maximize pleasure (the dream).</p><p>So… <b><strong>never, ever, ever play to the audience</strong></b> to try at "funny" (like self-aware sitcoms).</p><p>Just play to the truth of the character and the given circumstances of the story.</p><p>As with so many things in life, this is counterintuitive. For the actor this requires <a href="/blog/darts-improve-focus">dedicated focus</a>.</p><h2>Let’s break it down a bit more.</h2><p>By “I made my comedic acting serious,” I mean I chose to “know” as the actor (not character) – to fill myself with real emotional life. <a href="https://en.wikipedia.org/wiki/Meisner_technique" target="_blank">Sanford Meisner</a> calls this “personalization.” Personalization is achieved by applying the circumstances of the play, movie, TV show, or script to analogous or potential circumstances from one’s life grounded in personal facts.</p><p>This touches on the Meisner technique–for a deeper dive in another post. Whether it’s Stanislavski, Meisner, or any other method, it''s all reduced to the same core principle: Acting requires emotional truth. Fake can never be a substitute. The audience will snuff it out every time.</p><p>You must deeply relate to your character’s point of view on an empathetic level. Then… you will know.</p><p>From there, the text simply “floats on top”; the truth will simply reveal itself.</p><p>This is where extraordinary acting happens—beyond just “good” acting. It’s where the gap between amateurs and professionals widens.</p><p>Much like any human pursuit: chess, sports, writing, music, cooking, fashion, programming, directing, photography, architecture, teaching, dance, design, painting, filmmaking, sculpting, engineering, singing, composing, woodworking, martial arts, carpentry, journalism, translation, pottery, animation, editing, gardening, calligraphy, beatboxing, watchmaking, knife-forging, bartending, cosplay craftsmanship—hell, even latte art and speedcubing. There''s a "good" and "extraordinary" level to everything. And this is what it is for acting.</p><p>You’ll understand this distinction when you watch a scene and think, “Holy shit, that movie was… wow,” versus, “Yeah, the movie was good.”</p><p>It''s what I do when I <a href="/actor" target="_blank">perform audiobooks</a>. I’m always personalizing. Not just "acting," or worse, "narrating," which is what many just so-so audiobook narrators do. Sure many narrators can make a book "sound" ok. But they fail to make it a truly emotionally moving work. What I call the “simple golden voice.”</p><h2>Some examples</h2><p>Here are some examples of “serious” comedic acting that are my personal favorites for their hilarity (Ben Stiller is a master of his craft):</p><ul><li value="1"><a href="https://www.youtube.com/watch?v=rec_7Si0MEA" target="_blank">Ben Stiller in <i><em>Heavyweights</em></i></a></li><li value="2"><a href="https://www.youtube.com/watch?v=mR6aZN4WglE" target="_blank">Ben Stiller in <i><em>Dodgeball</em></i> (rumored to be the same character)</a></li><li value="3"><a href="https://www.youtube.com/watch?v=dCqSQ4UgE90" target="_blank">Justin Long in <i><em>Sasquatch Gang</em></i> (Joey Kern is also hilarious as ‘Shirts’)</a></li><li value="4"><a href="https://www.youtube.com/watch?v=gf1DDvFupRA" target="_blank">John C. Reilly in <i><em>Step Brothers</em></i> (Went to DePaul’s Acting program as well)</a></li></ul><p>These are different from sitcom because they’re not waiting for a laugh track after delivering a line. They are committing 100% to the seriousness of their characters’ POV.</p><h2>Opening Day Micro-Fame</h2><p>I “applied” this, and the sudden change blew her away. She said I was an <b><strong>instantly transformed actor</strong></b>. I thought she was just juicing me up because she felt bad about what she’d the previous day. But no.</p><p>No BS with her, ever.</p><p>And my classmates agreed. I was <i><em>way</em></i> better (and funnier).</p><p>The adjustment felt strange, like when you first learn to ride a bike without training wheels. I wasn’t actively trying to be funny, but passively, by "knowing."" And it worked.</p><p>Opening day came, and the show had to stop because of the laughter my scenes caused. Really.</p><p>There was one particular scene where my character, Andre, suddenly interrupts his closeted gay teammate (the lead) and his lover’s date, asking if they finally kissed. He says no, and Andre’s one line of disappointment was simply: “Oh.” To then exit stage right while eating a Rice Krispie treat.</p><p>I committed to Andre being upset that his teammate and friend wasn’t “going for it.” I delivered the line in <b><strong>seriousness as the character</strong></b>, but with <b><strong>full awareness of the comedy</strong></b> as the actor.</p><p>The way I delivered the “OH.” was inexplicable. But one thing I do know: I was committed to the scene. I wanted my best friend to feel comfortable in his own skin.</p><p>That was my truth. And I was frustrated he wasn’t stepping up.</p><p>With that driving my "know," the comedy floated on top, and it worked. Stakes: Raise the stakes. Take the scene seriously from the character’s point of view, and boom—you’re done.</p><p>The upperclassman approval I so craved came in spades. (Oh, us insecure actors need everyone’s approval, don''t we.) Word spread and we were <i><em>packed</em></i> for the rest of the show’s run.</p><p><b><strong>Everyone wanted to see this hilarious Dan Lewis guy</strong></b>.</p><h2>The Sitcoms of 2025</h2><p>Fast forward to now – ten years later – and sitcoms have morphed into social media and influencers.</p><p>Ever scrolled through social media and stumbled on a “funny” video with millions of views, only to think, <i><em>“How do people find this brainrot funny?”</em></i></p><p>Here’s the thing: these “influencers” will struggle to maintain their views over time. But the truly extraordinary ones – the ones who connect to humanity and truth – will endure.</p><p>They tap into something deeper by avoiding the trap of doing the same tired schtick over and over (even though the algorithm rewards schticks – yet another reason why humanity is completely cooked).</p><p>And sure, not all influencers are actors, but you know what I mean. The ones who commit to creating with genuine intention rather than just chasing likes are the ones who will go further.</p><h2>My Personal Conflict</h2><p>I am torn between playing the social media game and simply posting real art and comedy on this website. Because I, too, have become a victim of the algorithm that rewards views for the dumbest things. I even experimented with a character named "cringefluencer" on TikTok (link to profile below).</p><p>I need to play the game – but always try to morph it into something meaningful. Actual art. Comedy with a character who’s being serious.</p><p>Otherwise, I’d be a massive hypocrite.</p><p>We’ll see.</p><h2>Now it’s your turn to stop trying.</h2><p>If you’re an actor or an acting hopeful, you can learn to elevate your craft—even if it’s just for social media.</p><p>What would it look like to commit to the truth of the scene instead of pandering to your audience? To stop chasing fame for fame’s sake?</p><p>In other words, to actually display skill and talent?</p><p>The natural response is, <i><em>"Yeah, I know. I already do that.”</em></i> To which my now hardass response is: shut tf up. That’s insecurity not truth.</p><p>Commit to the truth. The truth that lives in you. And forget the rest.</p><h3>TL;DR:</h3><p>To be a funnier actor, take the character’s point of view (POV) seriously. Never play to the audience. Stifle your actor ego. Focus. Raise the stakes. Play actions on your partner. And boom – real(er) comedy.</p>', '', 1, '', '', '', '', true, '', '', '', ''),
	('fc454c8b-5c33-4b28-9f9a-edecba5aff92', '2025-12-14 01:19:45.080244+00', 'learning-a-language', 'Learning a language teaches more than a language', '2024-12-12', 'Travel & Language', 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/learning-a-language/hero/blog-learning-languages.webp', '<p>Ditch that “mind strengthening” app you just downloaded because an Instagram ad convinced you to (there are for sure gonna be in-app purchases).</p><p>Learn a language, instead.</p><p>But what does it mean to learn a language to be able to “speak” it?</p><h2>“I speak [insert number] languages”</h2><p>Recently, there’s been a growing cohort of “influencers” who surprise unsuspecting non-English speakers by seemingly speaking their language fluently.</p><p>Don’t feel discouraged if they’ve ever made you feel like a dumb dumb.</p><p>Here’s why: most of these so-called polyglots are full of total caca.</p><p>Some of them are legit. But many claim to know an outrageous number of languages supposedly learned in record time. In the age of hyper-video editing, I’m not buying their alleged “abilities.”</p><h2>What does "to speak" mean in this context</h2><p>The real marker of speaking a foreign language is in your competence across the four essential skills – listening, reading, speaking, and writing – aligned with the globally recognized CEFR levels.</p><p>This framework provides a clear, measurable standard to assess true language ability.</p><p>Here’s how CEFR breaks down proficiency.</p><p>The CEFR emphasizes a balance across input and output (listening / reading &amp; speaking / writing). True fluency means you can fluidly apply these skills in real-time, adapting to native speakers without over-relying on translation or rehearsed phrases.</p><p>When someone claims to “speak” a language, the question isn’t how many they know but to what CEFR level they can use each of these skills.</p><p>So the next time someone says, “I ''speak'' [such and such],” hit ‘em back with “what level?” They likely won’t even know this framework (or care).</p><p>For your purposes, it suffices to say, “I speak level B1 Spanish,” for example.</p><h2>Ok Mr. Language Police… what about you?</h2><p>I’ve traveled to 12+ countries and “speak” 4 languages of varying levels from A2-B2. Admittedly, I''ve taken no formal test to truly establish my levels, and each language fluctuates as I fall into and out of practice with them.</p><h3>Spanish – my first love affair with language</h3><p><b><strong>Current level:</strong></b> B1</p><p><b><strong>Highest estimated level achieved:</strong></b> C1</p><p><b><strong>Goal:</strong></b> To get my level back up in time. I’m also not in the Spanish-speaking world currently, so it’s not high on my priority list.</p><h3>Korean – Had utility, now the future is doubtful</h3><p><b><strong>Current level:</strong></b> A2</p><p><b><strong>Highest estimated level achieved:</strong></b> B1 (summer 2021)</p><p><b><strong>Goal:</strong></b> Ideally, a TOPIK level 3 (B1) would be nice. But I''m having <a href="/blog/teaching-english-in-south-korea">doubts of ever returning to Korea</a>, so it may just stay as is.</p><h3>Italian – I <i><em>should</em></i> know more</h3><p><b><strong>Current level:</strong></b> A2</p><p><b><strong>Highest estimated level achieved:</strong></b> A2</p><p><b><strong>Goal:</strong></b> I should know more about this because I became a dual U.S.-Italian citizen in 2024. Spanish helps. But given that I’m a citizen now, I must study.</p><h3>English – Native English Speaking privilege</h3><p><b><strong>Level:</strong></b> Native</p><p><b><strong>Goal:</strong></b> To keep improving my writing.</p><h3>Thinking of Mandarin Chinese</h3><p><b><strong>Current level:</strong></b> Couple words</p><p><b><strong>Goal:</strong></b> Undecided but very interested. I mean... it''s China. 1.4 billion folks. Ubiquitous. New challenge. Economic opportunities. Traveling there would be kind of taboo and fascinating for an American. (I like taboo.) To be seen. Could be a long, crazy journey to document. Chinese government, sure. But like... you know how many lizard-people work in D.C.?</p><h2>Should you learn a second language?</h2><p>Of course, it''s your call. But consider this.</p><p>Learning a new language makes traveling to a new country and communicating with its people possible without the impersonal "let my phone translate this" crutch, sure. But the real benefit is <i><em>the new way of thinking</em></i>. It challenges your mind to process ideas differently than your native language would allow.</p><p>I have zero hard data on this, but from personal experience, I feel like it keeps my cognitive abilities sharp – even when it comes to using English more effectively. It helps me appreciate "the why" behind the many English Language concepts.</p><h3>Italian serves as a great example</h3><p>I coined the phrase, “What’s formal (in English) is normal (in Italian),” or “What’s normal (in Italian) is formal (in English).” Either way, it’s the same idea.</p><h4>Litigare – to argue</h4><p>Translated literally, it’s “to litigate,” which in English is a word only used in legal contexts.</p><h4>Controllare – to check</h4><p>Translated literally, it’s “to control,” which is a bit more elevated in English, implying authority or regulation.</p><h4>Domandare – to ask</h4><p>Translated literally, it’s “to demand,” a much more heightened and forceful way of asking in English.</p><h4>Dimenticare – to forget</h4><p>This would be like turning “dementia” into a verb: “I dementia’d my umbrella.” Kind of funny when you think about it.</p><h4>Dosso artificiale – speed bump</h4><p>I saw this on a road sign, and it seemed like an extremely long-winded, formal way for a road sign to say “speed bump.” 7 syllables vs. 2 syllables. Imagine warning a driver of the upcoming speed bump they don’t see, and you have to get out 7 syllables in one second.</p><h4>Portafoglio – wallet</h4><p>This sounds formal in English as we might think of a literal investment portfolio, but it’s used in everyday Italian for what we call a wallet.</p><h4>Meritare – to deserve</h4><p>Translated literally, it’s “to merit,” which in English is a much more formal and rarely used word than the casual, everyday Italian usage.</p><p>[[image:https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/learning-a-language/content-images/img-3498.jpg|size=medium|align=center|caption="Do waiters deserve tips? Yes / No"]]</p><p>In my experience learning Italian, I’ve noticed it’s changed the way I think and even helped expand my English vocabulary. When I encounter an Italian word resembling its English counterpart, I can often make sense of it through context.</p><h2>The fascinating world of Konglish</h2><p>[[image:https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/learning-a-language/content-images/img-5336.jpg|size=large|align=center|caption=Korean is the largest language isolate, with no relation to English, yet The Korean letters and phonetics for "Oreo" almost perfectly match English... glitch in the Matrix?]]</p><p>I would be remiss if I didn’t talk about this. I lived in Korea from 2019 to 2022 and just returned from a visit in December 2024.</p><p>[[image:https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/learning-a-language/content-images/img-5538.jpg|size=large|align=center]]</p><p>Apart from Koreans using English in advertisements in absolutely hilarious ways (image above taken Dec. 2024), the concept of Konglish is truly mind-blowing.</p><p>Konglish is the (very convenient for English speakers) hybrid of Korean and English, where English words are adapted into Korean phonetics with new meanings, pronunciations, or contexts.</p><p>Some are direct borrowings with Korean phonetics applied, while others evolve into entirely unique phrases that can baffle even native English speakers—some require a few leaps in logic to understand.</p><p>In fact, Konglish is now so ingrained in the language that even native Korean speakers are sometimes unaware they’re using English words, albeit with Korean adaptations.</p><h3>Some Konglish examples (of hundreds)</h3><h4>핸드폰 (Handphone)</h4><p>A mobile phone or cell phone. While “handphone” might seem logical, it’s not a term native English speakers actually use.</p><h4>아파트 (Apartment)</h4><p>Refers specifically to high-rise residential buildings in Korea, which are a cultural phenomenon in their own right. And now it’s the world’s most-listened-to songs.</p><h4>샤프 (Sharp)</h4><p>Refers to a mechanical pencil. It’s derived from the “Sharp” brand but is used universally for all mechanical pencils in Korea.</p><h4>노트 (Note)</h4><p>This means a notebook or notepad, not just a singular note.</p><h4>원룸 (One Room)</h4><p>A small studio apartment. It sounds straightforward but is very specific to the Korean concept of a compact, single-room living space.</p><h4>아이스크림 (Ice Cream)</h4><p>Pronounced a-ee-seu-keu-reem, it’s the Korean phonetic adaptation of “ice cream” but is used universally for frozen desserts.</p><h4>콘도 (Condo)</h4><p>Refers to a vacation rental or resort, quite different from how “condo” is used in English.</p><h4>매직 (Magic)</h4><p>Refers to a permanent marker derived from the brand “Magic Marker.”</p><h4>서비스 (Service)</h4><p>Means “something free” or a complimentary gift, commonly used in restaurants or stores.</p><h4>쿠션 (Cushion)</h4><p>Refers to compact cushion makeup, a wildly popular Korean innovation, rather than an actual cushion or pillow.</p><p>And the list goes on.</p><h2>Get out there and learn</h2><p>If you have any questions about what it means to really learn a language, ditch the polyfluencers and drop me a message instead.</p>', '', 6, 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/learning-a-language/content-images/img-5538.jpg', 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/learning-a-language/content-images/img-5336.jpg', 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/learning-a-language/content-images/img-3498.jpg', '', true, '', '', '', ''),
	('4068c16e-b717-42a6-8af8-37b5c9eeb0c1', '2025-12-14 01:19:45.080244+00', 'teaching-english-in-south-korea', 'Teaching English in South Korea', '2024-12-09', 'Travel & Language', 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/teaching-english-in-south-korea/hero/blog-korea.webp', '<p class="mb-4 text-lg leading-relaxed font-light theme-text-body"><span>Once the political divide hit full throttle, I decided to leave LA and pivot my life for my literal sanity. Here''s where it lead me the next year and beyond.</span></p><h2 class="text-2xl md:text-3xl font-bold mt-10 mb-4 tracking-widest flex items-center gap-2 theme-text-primary"><span>Timeline</span></h2><p class="mb-4 text-lg leading-relaxed font-light theme-text-body"><span>I dated a Korean girl in Montreal (I was living in Quebec with the old man for a couple of months) who said, “You should teach English in Korea.” She was gorgeous. And I was being a simp. So that was that. I decided and soon after started my 120-hour TEFL (Teaching English as a Foreign Language) certification and visa process.</span></p><h3 class="text-xl md:text-2xl font-bold mt-8 mb-3 tracking-wide theme-text-secondary"><span>January 2019</span></h3><p class="mb-4 text-lg leading-relaxed font-light theme-text-body"><span>I completed the visa process and certification and was placed in a school by a recruiting agency.</span></p><h3 class="text-xl md:text-2xl font-bold mt-8 mb-3 tracking-wide theme-text-secondary"><span>February 2019</span></h3><p class="mb-4 text-lg leading-relaxed font-light theme-text-body"><span>I arrived in Gyeonggi-do (Seoul’s surrounding province) for my first teaching gig with little ones.</span></p><h3 class="text-xl md:text-2xl font-bold mt-8 mb-3 tracking-wide theme-text-secondary"><span>March 2019 – August 2019</span></h3><p class="mb-4 text-lg leading-relaxed font-light theme-text-body"><span>The brand-new, semi-corrupt school turned out to be run by bat-shit crazy fundamentalist Christians. (On Easter, they presented a slideshow about how to get into heaven. One slide said “eternal pain and suffering,” referring to hell. To five-year-olds.)</span></p><h3 class="text-xl md:text-2xl font-bold mt-8 mb-3 tracking-wide theme-text-secondary"><span>August 2019 – March 2020</span></h3><p class="mb-4 text-lg leading-relaxed font-light theme-text-body"><span>After quitting that hilarious/terrifying experience, I landed a gig at Seoul’s leading English institute for adults in the financial district—an iconic area featured in many K-dramas.</span></p><h3 class="text-xl md:text-2xl font-bold mt-8 mb-3 tracking-wide theme-text-secondary"><span>March 2020</span></h3><p class="mb-4 text-lg leading-relaxed font-light theme-text-body"><span>The manufactured pandemic hit, and the world went mad. I quit because of how crazy things got at the institute. There was no way I was going to be forced into an experimental “vaccine.”</span></p><h3 class="text-xl md:text-2xl font-bold mt-8 mb-3 tracking-wide theme-text-secondary"><span>March 2020 – December 2021</span></h3><p class="mb-4 text-lg leading-relaxed font-light theme-text-body"><span>I stayed in the country on a job seeker visa because of the manufactured pandemic and did </span><a href="/actor" class="underline decoration-2 underline-offset-2 cursor-pointer theme-text-primary theme-decoration"><span>voice acting gigs</span></a><span> to survive before heading back to the USA. I could go into way more detail about what it was like riding out the plandemic in Korea, but that’s for another post… or a 500-page book.</span></p><h3 class="text-xl md:text-2xl font-bold mt-8 mb-3 tracking-wide theme-text-secondary"><span>Bonus: December, 2024 (Updated July, 2025)</span></h3><p class="mb-4 text-lg leading-relaxed font-light theme-text-body"><span>I took a month-long trip to Korea more recently, while living in Southern Italy after I obtained dual Italian citizenship. It was, of course, another (failed) love interest trip.</span></p><h2 class="text-2xl md:text-3xl font-bold mt-10 mb-4 tracking-widest flex items-center gap-2 theme-text-primary"><span>What I learned</span></h2><p class="mb-4 text-lg leading-relaxed font-light theme-text-body"><span>I will be writing about this a much more length in my travel memoir releasing in November, 2025. But here are some key points:</span></p><ul class="list-disc list-inside mb-6 space-y-2 theme-text-body"><li value="1"><span>The English hakwon industry in Korea is big business and mostly run by scumbags (what else is new).</span></li><li value="2"><span>Korean work culture is ruthless. If you’re not completely on board with everything your boss says—including working late and going out to company dinners (회식)—you’ll face serious disapproval.</span></li><li value="3"><span>Koreans are more overworked and stressed than in any other country I''ve visited.</span></li><li value="4"><span>Being a foreigner in Korea means you’re a second-class citizen (yes, even if you’re white and from the USA). Koreans come first—it’s as simple as that.</span></li><li value="5"><span>Korean infrastructure, especially public transportation, is unmatched by anything the United States will ever have.</span></li><li value="6"><span>The </span><a href="https://en.wikipedia.org/wiki/Hangul" target="_blank" class="underline decoration-2 underline-offset-2 cursor-pointer theme-text-primary theme-decoration"><span>Korean alphabet (한글)</span></a><span> is genius and simple to learn. With focus and dedication, you can learn it in three days. There’s even a national holiday celebrating its invention.</span></li><li value="7"><span>The use and extent of </span><a href="https://en.wikipedia.org/wiki/Konglish" target="_blank" class="underline decoration-2 underline-offset-2 cursor-pointer theme-text-primary theme-decoration"><span>Konglish</span></a><span> makes picking up the language way easier. As a concept, it’s pretty wild.</span></li><li value="8"><span>The Korean language is mind-bending because the word order is subject-object-verb (e.g., “I the beer drink”) instead of subject-verb-object like in English (e.g., “I drink the beer”).</span></li><li value="9"><span>Korean fast food (and food in general) is insanely efficient—everything is efficient.</span></li><li value="10"><span>Customer service is top-notch.</span></li><li value="11"><span>Tasks like banking, dining, or mailing something don’t take long at all. Everything is hyper-efficient.</span></li><li value="12"><span>The English on signage here is hilarious. It’s technically correct (in most instances) but awkward and misplaced. It creates what I have dubbed the English uncanny valley.</span></li><li value="13"><span>Business and apartment building names have weird, arbitrary English names. Also uncanny and funny.</span></li><li value="14"><span>Korean fried chicken is better than in the United States. Seriously.</span></li><li value="15"><span>And a million other things too long to mention here, so again, stay tuned for my travel memoir releasing in November, 2025.</span></li></ul><h2 class="text-2xl md:text-3xl font-bold mt-10 mb-4 tracking-widest flex items-center gap-2 theme-text-primary"><span>Mixed Bag</span></h2><p class="mb-4 text-lg leading-relaxed font-light theme-text-body"><span>Living in Korea was amazing and infuriating. It was a thrilling romance and a bad breakup. A warm embrace and a cold-hearted slap. A safe haven and an alienating land.</span></p><p class="mb-4 text-lg leading-relaxed font-light theme-text-body"><span>I need to go into more detail about this complicated relationship I have with my second country—my adopted country. But I’m out of time.</span></p><p class="mb-4 text-lg leading-relaxed font-light theme-text-body"><span>This most recent December 2024 stint might have numbered my days ever visiting Korea again, though that''s still to be seen. I would like to explore Japan, Thailand, and even China (including Taiwan again), instead.</span></p><p class="mb-4 text-lg leading-relaxed font-light theme-text-body"><span>Keep checking my blog for future details on the topic (like how I’m literally here again visiting as I write this). And, again... travel memoir. November, 2024.</span></p><h3 class="text-xl md:text-2xl font-bold mt-8 mb-3 tracking-wide theme-text-secondary"><span>Thinking of visiting or moving to Korea?</span></h3><p class="mb-4 text-lg leading-relaxed font-light theme-text-body"><a href="/collab" class="underline decoration-2 underline-offset-2 cursor-pointer theme-text-primary theme-decoration"><span>DM me</span></a><span>, and I’ll gladly help answer any questions you have about it.</span></p>', '', 4, '', '', '', '', true, '', '', '', ''),
	('a715ab69-6644-4e8f-9e60-626b9ccbba57', '2025-12-14 01:19:45.080244+00', 'forward-is-backward-is-forward', 'Forward is backward is forward', '2025-09-03', 'Esotericism', 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/forward-is-backward-is-forward/hero/forward-is-backward-is-forward-blog.png', '<p>Thoughts and beliefs create our individual reality. And collective thoughts and beliefs construct the Zeitgeist.</p><blockquote>"The objective observer always has the advantage over a direct participant."<br><b><strong>- Vadim Zeland</strong></b></blockquote><p>If humanity fixates on a focal point in critical mass, that reality is eventually solidified into the physical plane. Why else would the "news" exist if not to instill top-down narratives via fear, anger, and doubt, ad nauseam?</p><p>Worry becomes a self-fulfilling prophecy. If enough people fear the thing, it will stick.</p><p>If this is too "woo woo" for you, consider this: everything you see around you was once an idea (thought).</p><p><b><strong>Imagination → thought → emotion → action → creation.</strong></b></p><p>Most importantly, it is the belief that something is real that makes it real. Reality is a mirror.</p><h2>The AI push is backfiring</h2><p>Since the end of 2022, when civilian-level AI was released to the public ala ChatGPT, a sort of hysteria began. Colloquially known as "hype." They want you to actually believe it''s a get-rich-quick technology. That it will educate the children, and their children''s children for generations to come and will make us a better species. That it will one day wipe your ass and you won''t even have to lift a finger to live!</p><p>I''m here to report that it''s making us dumber, less creative, and degenerate; and the exponential construction of behemoth data centers is stealing the basic necessities we need to survive. (Wait... and they''re pitching AI as helping humanity?)</p><p>The good news is... a much-needed wrench is being thrown into their plans.</p><p>Humanity isn''t buying it. We see through it, and most people do not like it. Shocking, I know.</p><h2>Have you noticed the shift?</h2><p>I thought humanity was a lost cause after covid. How did so many people actually fall for all of that? So now with the next planned apocalyptic push (releasing civilian-level AI to the masses marketed as cutting edge) I thought, fuck, here we go again.</p><p>But people are fed up with this AI bullshit. For example, take Duolingo''s fallout. The moment they announced plans to be an AI-first company, Gen-Z tore them apart.</p><p>And recent data backs this up.</p><p>The AI-pushback is a battle being won (far from winning the war, though); we''re still going to have to hunker down for their future attempts to destabilize the world.</p><p>Moving on...</p><p>Basically, we''re always under attack from "them." Who or whatever "they" are is unknown. Christians say demons. New Agers say Reptilians. My Gnostic self says Archons. Tomato, tomahto, tomate. Whatever they/it is... it''s anti-human and is using us for something at the expense of our very species. (Maybe The Matrix was actually a documentary, after all.)</p><p>But this attack on humanity is going sideways. It''s too much, too fast. We''re still reeling from covid. We (should) have ZERO trust in ANY authority, institution, religion, dogma, government... anything that pedestals itself. And this most certainly includes big tech (who are all frauds, by the way).</p><h2>Bringing it all together</h2><p>So we have:</p><ul><li value="1">Our individual thoughts, beliefs, and emotions creating what physicalizes in our perceived reality.</li><li value="2">People thinking and feeling very negatively towards AI.</li><li value="3">And "AI fatigue," part and parcel of a larger societal "digital fatigue."</li></ul><p>Wouldn''t you agree that, generally speaking, things have gotten worse in the last 10 years? By things, I could very well mean Maslow''s Hierarchy of Needs.</p><p>[[image:https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/forward-is-backward-is-forward/content-images/maslow-s-hierarchy-of-needs-pyramid--original-five-level-model-.png--1-.webp|size=large|align=center]]</p><p>Ask yourself honestly: has the over-reliance on digital everything made these needs more or less met? The answer should be obvious.</p><p>They pushed us too far, too fast with the digital hellscape.</p><p>Add in stagnant wages. Layoffs. Employment scams. Unaffordable housing and rent. The streets going from enjoyable to a fight or flight. And no one has the energy to give two shits about AI generating me an image of a corgi dressed as a farmer picking strawberries.</p><p>We''re so doomscrolled... brainrotted. We''re soulrotted.</p><p>We''re finally turning against them. Because we have no other choice.</p><h2>The obsession with the "next thing"</h2><p>We''re accustomed to measuring progress through technological advancement. But for the first time, I believe technology, insofar as anything computing and digital, is hitting a wall.</p><p>Does this mean we''ll abandon our phones and everything digital? Hardly. Our phones and other devices have become inextricably tied to our ability to connect and make money.</p><p>And sure, ChatGPT can be a glorified search engine, proving helpful from time to time.</p><p>But it will most absolutely not be the only thing to live by.</p><h2>So... what is next?</h2><p>Simply: just being human.</p><p>And it''s already happening.</p><p>Physical book sales are popping off, schools are making kids surrender their phones, influencers are finally getting the hate they deserve, people are turning to things they did in the "good old days" of the 90s, and a deep, yearning nostalgia has become commonplace.</p><p>It makes perfect sense, doesn''t it? As humans we thrive on community, connection, and things that actually happen in the real world (see: touch grass). And as Maslow lays out above.</p><p>We will naturally scale back and begin merging our needs more with our digital world. For example, Discord communities of like-minded folk are cropping up.</p><p>That''s why I''m betting any more forward progress will take a step backward–at least until we reset.</p><p>We can''t go back in time and recreate the past, of course. But we can merge the things of past that did work with a healthy level of digital technology that actually assists, not harms humanity.</p><p>Any app, product, service, or business that can find a way to healthfully merge the digital with the real physical world will catch on.</p><p>AI does not do this. And the proof of this is the its first word.</p><p><b><strong>It''s Artificial.</strong></b></p><p>People are waking up to the fact that Artificial Intelligence is no different than Artificial Flavors. It gives you a cheap serotonin kick but is ultimately really bad for you.</p><p>AI is like a fast food. A shortcut to cooking that makes you fatter, sicker, and addicted. AI is a shortcut to thinking that makes you dumber (it has already proven to shrink the hippocampus), prone to dementia and psychosis, and also addicted.</p><p>And what started cropping up in the last 20-30 years as a response to this unhealthy food? Health stores, organic and "No artificial flavors or additives," labels, KETO, carnivore... whatever. A whole new industry.</p><h2>What should you do?</h2><p>The choice is always yours. But my suggestion and the point of writing this blog for you is to assuredly tell you: don''t fall for the vapid hype. You can observe it, but do not participate. Do your own thing.</p><p>The more you participate, the more it will actually solidify in your reality.</p><p>I can''t predict the future. And I can''t tell what timeline we will choose next. But what I can say is this: the winners of tomorrow will not build or do what''s next. They will build or do authentically. And not fake authenticity... influencers already ruined that.</p><p><b><strong>Authentic authenticity.</strong></b></p><p>I for one, will be publishing romance novels where I record myself manually typing and researching the entire book on in a time-lapse video, for irrefutable proof it was human written. This is one example of a couple authenticity-driven business ideas I''m working on.</p><p>So go out there and be AI – Authentically Intelligent, in whatever it is you''re doing. And make it human-centric, not big-tech-dystopian-hype centric.</p><p><i><em>Move forward... by going backward.</em></i></p>', '"...you stood on the shoulders of geniuses to accomplish something as fast as you could and before you even knew what you had, you patented it, packaged it and slapped it on a plastic lunchbox and now you''re selling it!"', 6, 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/forward-is-backward-is-forward/content-images/maslow-s-hierarchy-of-needs-pyramid--original-five-level-model-.png--1-.webp', '', '', '', true, '', '', '', ''),
	('7950769a-ba8b-4351-9562-d51638d08336', '2026-01-07 06:02:16.658636+00', 'the-5-ws', 'The Five Ws', '2026-01-08', 'Life', 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/who-what-when-where-why-and-sometimes-how/hero/who-what-when-where-why-sometimes-how-blog-daniel-not-day-lewis.webp', '<blockquote>If you''re in a Where where all the Whos are doofuses, then you, too, will turn into a doofus.<br>-Me, later in this blog</blockquote><p>My existence has been a roughly stitched tapestry of failures and <i><em>moderate</em></i> successes (ultimately overridden by waywardness). A jaggedly-smooth path that has led to an intriguing theory.</p><p>The ordering of the famous "5 Ws," ubiquitous from coast to coast and with no generational bounds, used in grade schools to teach introductory English...</p><p>is actually a way to navigate life.</p><p>Of course the education system doesn''t teach "The 5 Ws" in <i><em>that</em></i> way ("they" would never allow schooling to be so elucidating).</p><p>But I''ll attempt to.</p><p>I propose: "The 5 Ws" is actually listed in order of importance. Not just for writing. But also for life (imitates art[writing]).</p><h2>"Who</h2><p>you surround yourself with matters" is a buzzphrase that''s not <i><em>entirely</em></i> accurate.</p><p>"Who" <i><em>doesn''t necessarily mean physical presence. </em></i>It means <b><strong>who you exchange mental, spiritual, and emotional energy with...</strong></b> and to what degree. You can be surrounded by people physically, even family, but completely shut off if they''re not serving you positively.</p><p>In other words, learn from your relationship mistakes. Even if the other person wronged you or made your life hell, because you won''t get anywhere by maintaining a grudge.</p><p>I''m no guru, but I''ll tell you a buzzphrase that <i><em>is </em></i>correct in this circumstance: <i><em>look inward</em></i>. This is an ideal response to a) evolve (improve to get better things in life) b) get "revenge" in a way that is a natural byproduct of mostly or entirely ignoring the wrongdoer.</p><h4>Who</h4><p>do we choose to form or maintain relationships with, then? We can all only answer this based on personal goals and the direction we want to go in life. But if you''re reading this blog I take it you want to do cool shit. If that''s the case, here''s a general guideline:</p><p>Energy, ethics, decency, vibe, shared vision, and type of humor &gt; politics and religion any day of the week.</p><p>A good starting point to decide: does this individual put the shopping cart back in the corral or let it sit where they last used it in the parking lot?</p><p>Choose wisely.</p><h2>What</h2><p>is the second most important W (if not tied with Who). It''s the transitive W. The action W. The Verb W. <b><strong>The doing W.</strong></b></p><p>What you do follows you no matter <i><em>who </em></i>you have a relationship with or <i><em>where </em></i>you go. You''re either progressing or regressing through your What.</p><p>So, what <i><em>are</em></i> you doing?</p><p>Treating yourself like shit? Dieting like you''ve been talking about doing for weeks (months)? Doing that running plan? That business you''ve always dreamed of?</p><p>Or is your What paralyzed by any of the other Ws? If it is, clear the slate, be decisive, and do WHAT it is you want to do, <i><em>regardless</em></i> of any of the other Ws.</p><p>If the Who is the King on the chess board, the What is the Queen.</p><h2>When</h2><p>should matter less. And I wish it did. Time is a son of a bitch, and it keeps getting faster and faster.</p><p>But as they say, "timing is everything." Another buzzphrase that holds true.</p><p>We can look no further than the acting world to know this.</p><p>Talent is not the most important factor.</p><p>Landing a role is about Who (#1) you know, What (#2) problem you''re solving for the casting director / production, and WHEN (#3) you''re able to solve that problem.</p><p>Wait did I say acting... hell, the above is true for <i><em>everything</em></i> in life. The acting world is just what I''m familiar with.</p><p>Here''s a fun example that I know well to get the point across.</p><p>Let''s say you''re entering a foreign country, and at immigration, the border patrol agent just found out their spouse cheated on them the day before. Then they see your ass traipsing into their country... fearfully mumbling your purpose of stay in English, ignoring their mother tongue. In an endless line of others doing the same.</p><p>Yea, you''re gonna be asked more questions than the doofus in the booth next of you with an agent who just put in their two weeks.</p><h2>Where</h2><p>is the W I''m the most enamored with as a serial traveler. It can be advantageous if used correctly. Or disadvantageous if abused (I''ve abused it and am now correcting course).</p><p>"Where" is the interplay W. It is important because <b><strong>it enhances or detracts from the other Ws </strong></b>in a way that can really move the needle.</p><p>If you''re in a Where where all the Whos are doofuses, then you, too, will turn into a doofus.</p><p>Here''s a short anecdote of mine to help illustrate the picture.</p><p><a href="https://www.danielnotdaylewis.com/blog/teaching-english-in-south-korea" rel="noreferrer">When I lived in South Korea</a> from ~2019-2022, this Where introduced me to one of the <a href="https://ryanckulp.com" rel="noreferrer">more interesting people I''ve met</a> to date.</p><p>I was out being a bad little rebellious foreigner, partying in the streets of Hongdae after the country shut down at 9pm (because apparently the virus only started spreading at 9pm.)</p><p>I was rolling away with my 따릉이 (Ddareungi) bike (Seoul''s public bicycle system) like a total badass when I <i><em>literally crossed paths</em></i> with him as the crowd was dispersing.<i><em> </em></i>Small convo about the public bike system entailed. Then he asked me to come to a small after-after party he was throwing at his Air BnB.</p><p>Had it not been for this "double Where," I would have never met my occasional friend/acquaintance who influenced me to a) become my own technical co-founder. b) to ruthlessly DO. And c) Make this website and blog in the way that it is (clearly inspired by his).</p><p>He''s not the only one, though.</p><p>My Wheres have introduced me to many many Whos.</p><p>Probably one of the best things about traveling.</p><p>Remind me to contact the Polish street artist who I met while living in Poland last March. I promised to commission him to do book covers for my <a href="https://cinesonicproductions.com" rel="noreferrer">audiobook production company</a>. (link won''t work for now. Launch Feb.)</p><p>But as mentioned... my waywardness has gotten out of control. In order to enhance my What, I need to reel it in and establish a base somewhere, be it in the USA or abroad. I would love to keep traveling but not at the expense of my What.</p><h2>Why</h2><p>can get in the way of all the other Ws. I believe it''s last because... in order to take action, it isn''t explicitly needed. If I find myself asking Why too much, it paralyzes me. That said, it does have utility and an essential function. If I don''t ask why at all, well, then... I''m probably just following orders.</p><p>Here''s a good test: am I asking Why of <i><em>what I want of myself</em></i> or of what <i><em>others want from me</em></i>?</p><p>So maybe this can help you.</p><p>If you''re asking why of <i><em>yourself</em></i> too much (unneeded permission), this can be problematic. You have permission to do whatever the fuck you want to do.</p><p>If you''re <i><em>not</em></i> asking why enough of <i><em>others</em></i> (people pleasing), this can also be problematic.</p><h2>And sometimes how</h2><p>Part of me thinks it should be "Who, What, When, Where, How... and sometimes why.</p><p>But poor how. Always left out in the distant right margins.</p><p>Maybe why is like the architect. "This is why the building needs to look this way. And this is why it needs to go here."</p><p>The How is the engineer. The logician. How will this beautiful building be safe, strong, and sturdy for decades?</p><p>So it''s definitely needed.</p><p>Every single one of the Ws depends on the logic. On the... well... HOW to get things done.</p><ul><li value="1">How will I meet and foster relationships with my people?</li><li value="2">How will I get what I want through the best course of action?</li><li value="3">How will I increase the chances of the best timing for my goals?</li><li value="4">How will I choose the right place(s) that will only enhance my goal and life?</li><li value="5">How will I ensure that I am asking why of the right people and at the right time?</li></ul><h4>The new phrase</h4><p>"Who, What, When, Where, Why... and <i><em>always</em></i> How."</p><p><br></p>', '', 29, '', '', '', '', true, 'DnDL', '', '<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/album/26WkOvzdTHuO2uVVZObHUc?utm_source=generator" width="50%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>', 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/audio/blogcast/20260109_blogcast_ep01_the_5_ws.mp3'),
	('dab7d5c5-06c2-4398-bb75-1225449176df', '2026-01-18 19:49:43.509471+00', 'selective-ignoring', 'Selective Ignoring', '2026-01-18', 'Life', '', '<p>"Ignorance is bliss."</p><p>It''s true. Ignorance <i><em>is</em></i> bliss.</p><p>But there''s a problem. You can''t <i><em>choose</em></i> to be ignorant–you either are or you aren''t. And if you''re truly ignorant, you''ll have no idea you actually are ignorant. And if you''re not ignorant but <i><em>try </em></i>to be... it''ll never work.</p><p>It''s like the saying gaining traction in this rapidly (de)volving decade of the 2020s: "If you know, you know."</p><p>For the initiated among us and from our interpretive horizon, this flip-side to bliss is called a curse.</p><p>"The Curse of Knowledge." (Gnosis).</p><p>We see through how fake so much of this world is, and yet, we can''t even be left alone in our inner turmoil–the ignoramuses attack us for even having such a knowing. It''s called: Matrix firewall. </p><h2>Ignoramus vs. Ignorer</h2><p>There is but ONE way to </p><p><br></p><p><br></p>', '', 0, '', '', '', '', false, '', '', '', ''),
	('7c9685e5-4fb2-4323-bd72-c3c334add709', '2025-12-14 01:19:45.080244+00', 'heres-to-the-little-guys', 'Here''s to the Little Guys', '2025-02-12', 'Life', 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/heres-to-the-little-guys/hero/blog-little-guys.webp', '<p>You’re hard-pressed to believe us sub-pawns really do make the world go round. And I don’t blame you. Look at the state of things in 2025. Ugh.</p><p>You turn a corner on any street in the world and bam... McDonald’s and Starbucks tantalizing your taste buds. Search anything online and Google now serves up the same or similar sanitized BS.</p><p>Can’t use a map. Make a call. Do a simple calculation without whipping out your trusty iPhone.</p><p>Hard to watch a movie or TV show without logging into Netflix, Disney+, Amazon Prime, HBO Max, or just <i><em>some</em></i> subscription siphoning off your hard-earned money automatically and in the background.</p><p>No matter where you post, it’s either Meta (Facebook, Instagram, WhatsApp), X, or TikTok hosting the convo, their algos nudging you along, making sure you follow their push for a 1984 nightmare Zeitgeist.</p><p>And it’s not just about serving you ads anymore—it’s about social engineering, mind-reading algorithms predicting what you’ll say, think, and feel before you even know it yourself.</p><p>Wanna just do your job/craft/career/profession in peace? You know, the thing you spent years learning and refining with your human heart, mind, and hard work? Can’t even have that without your company pushing “optimize, optimize, optimize,” forcing AI into your workflow—whether you like it or not. Making you wonder if you’re using AI… or just training what ''they'' hope will replace you.</p><p><b><strong>We’ve arrived. This is dystopia.</strong></b></p><p>It just doesn’t seem like it because there are no futuristic neon-soaked cityscapes (some Chinese cities are an exception). No romance story worth watching. No cinematic soundtrack underscoring your day-to-day. Just the drab and seemingly innocuous routine.</p><p>Slow-drip corporate memos, layoffs, and an ever-growing pressure to keep up with the machine mind—not your unique mind. Not your soul.</p><p>It’s a tale as old as time. And it’s not changing anytime soon–it’s getting exponentially worse.</p><h2>That''s depressing... what do I do?</h2><p>There is no longer an "I". We''re all in this crab boat together as the Bering Sea goes full throttle storm mode. We''re all (the actual non-shapeshifting humans) a crew. We need camaraderie.</p><p>Togetherness. Compassion. Understanding. A mind as one that refuses the never-ending onslaught of slow-kill attacks.</p><p>Their modus operandi is scarcity. So ours must be numbers.</p><h2>A Chihuahua''s face</h2><p>I was in South Korea <a href="/blog/teaching-english-in-south-korea">this past December</a> and saw a whimsical ad for a tiny hole-in-the-wall pub/anju restaurant. A micro-business tucked into the corner of a peaceful mid-rise residential Daegu neighborhood.</p><p>This place was so small and modest that you just had to appreciate its existence—whether or not you ever gave patronage.</p><p>The image of this blog is the place in question. Chihuahua advert and all.</p><p>I passed it daily during the month I lived there, and it always made me, at the least, smile.</p><p>Brilliant simplicity. A somewhat blurred and pixelated smartphone close-up of a goofball Chihuahua, eyes uncoordinated and all.</p><p>Before leaving Korea I wanted to eat there at least once. I had to.</p><p>We walked in, sat down, and I immediately pointed to the dog pictures plastered all over the walls now on the <i><em>inside</em></i> as well.</p><p>[[image: https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/heres-to-the-little-guys/content-images/blog-little-guys-1.webp | caption=Funny chihuahua picture]]</p><p>“사장님, 그 개 진짜 주인이세요?” (Boss, is that dog really yours?)</p><p>Trying to hide the chance to talk about his best friend, “네! 제 강아지예요!” (Yes! He’s mine!)</p><p>“와, 사장님 이거 진짜 천재적인 광고예요. 너무 웃겨서 잊을 수가 없어요.” (Wow, boss, this is seriously a genius ad. It’s so funny I couldn’t forget it.)</p><p>He laughed, with a show the quasi-embarrassment/humbleness combo but clearly proud (Korean trait).</p><p>Then throughout our meal he starts loading our table with complimentary food and drink.</p><p>Not just some token freebie, either. He gave us, and I''m estimating here, but maybe 25,000KRW (roughly $20 USD) worth of extra stuff—marinated chicken skewers and a tasty no-alcohol-skimping highball.</p><p>[[trio: https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/heres-to-the-little-guys/content-images/blog-little-guys-2.webp | https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/heres-to-the-little-guys/content-images/blog-little-guys-3.webp | https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/heres-to-the-little-guys/content-images/blog-little-guys-4.webp]]</p><p>Is it just me, or does it seem like that those with the least are the most giving?</p><p>My guy was running a tiny bar held together with plywood and black paint, probably grinding solo and on the daily to make rent. And here he was, throwing free food at us like I was his first cousin. In South Korea, which, if you don''t know is an <i><em>insanely competitive and cutthroat</em></i> country to start a business.</p><p>I didn’t realize my comment about his Chihuahua would go so far.</p><p>So I made sure he knew it was deeply appreciated. He needed the boost, I could tell. Especially because his joint was fairly new.</p><p>I left a tip—even though he was surprised and quasi-rejected it at first. And no, it wasn’t some ‘look at me, I’m a money-bags American tipping’ thing.</p><p>It was for encouragement.</p><p>Because people like this. Like you and me… we get beat up a lot in this life. From the big players, be it corporations, the government, the media, or whatever other entity wants us divided.</p><p>So treat small business owners with respect… even when they mess up (this guy didn''t I''m just saying).</p><h2>Our only hope</h2><p>As we stepped out into the cold night, full and a little buzzed, I looked back at that tiny, plywood-walled bar—just a speck in the tapestry of other restaurants.</p><p>THIS is the real world. Not some schnazy Apple Store, corporate boardroom, or algorithm deciding what you should see, buy, or think. Just a guy, his goofy dog, and a simple, brilliant ad that probably cost $30. A tiny act of defiance against the machine in my eyes.</p><p>That’s all it ever takes.</p><p>So, if you’re wondering what do I do?</p><ul><li value="1">Be a comrade.</li><li value="2">Give when you have little.</li><li value="3">Be proud to be the little guy (including yourself).</li><li value="4">Push back when met with too much bullshit from your boss (anyone).</li></ul><p>Because we make the world go round.</p><p>Remember: they need <i><em>our</em></i> labor, money, and energy – not the other way around – even though the dystopian nightmare tries to convince us otherwise.</p><h2>Happen to be in Daegu? Show some support.</h2><p>Go ahead… practice some camaraderie.</p><p><a href="https://map.naver.com/p/entry/place/1566685326?placePath=%2Fphoto" target="_blank" rel="noreferrer">Support the owner, his dog, and his pub.</a></p><blockquote>836-4 Hwanggeum-dong<br>Suseong District<br>Daegu, South Korea</blockquote>', '', 21, 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/heres-to-the-little-guys/content-images/blog-little-guys-1.webp', 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/heres-to-the-little-guys/content-images/blog-little-guys-2.webp', 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/heres-to-the-little-guys/content-images/blog-little-guys-3.webp', 'https://gpjgvdpicjqrerqqzhyx.supabase.co/storage/v1/object/public/blog-images/heres-to-the-little-guys/content-images/blog-little-guys-4.webp', true, '', '', '', '');


--
-- Data for Name: task_master_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."task_master_items" ("id", "user_id", "created_at", "type", "status", "title", "content", "metadata", "tags", "parent_id", "recurrence_interval", "due_date", "recurrence", "position") VALUES
	('556e93bf-560c-4902-af77-6ec9c745a1c6', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-16 17:22:39.291751+00', 'level_up', 'active', 'Next.js x React Course', '', '{"end_date": "2026-03-25", "start_date": "2026-02-04", "course_link": "https://www.udemy.com/course/nextjs-react-the-complete-guide/?couponCode=MT260116G2", "total_hours": 40, "hours_completed": 0}', '{"DnDL Creative General"}', NULL, NULL, NULL, NULL, 3072),
	('a8b74b9c-4d81-498a-be78-01bb30404042', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-16 17:30:55.551259+00', 'level_up', 'active', 'SQL Mastery', '', '{"end_date": "2026-04-28", "start_date": "2026-03-25", "course_link": "https://www.udemy.com/course/the-complete-sql-bootcamp-30-hours-go-from-zero-to-hero/?couponCode=MT260116G2", "total_hours": 30, "hours_completed": 0}', '{"DnDL Creative General"}', NULL, NULL, NULL, NULL, 4096),
	('9fa729ff-5307-4e9b-b3df-222ab3b2ffaa', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-19 21:00:53.756739+00', 'task', 'active', 'Quick Note', 'note b', '{}', '{}', NULL, NULL, NULL, 'one_off', 0),
	('e5597042-79d4-4c5e-9ade-899ea84d343e', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-17 18:19:21.374287+00', 'code_snippet', 'active', 'Show project file structure', 'tree -L 9 -I ''node_modules|.next|.git|public
', '{"notes": "the number in between the -L and -I determine how many levels deep it will display"}', '{}', NULL, NULL, '2026-01-17 00:00:00+00', NULL, 1024),
	('353ccf17-bec9-4976-a54f-75e59f0c9786', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-16 16:55:10.32925+00', 'task', 'active', 'ensure responsiveness', NULL, '{}', NULL, '5c30c395-bfba-4eb1-8282-20b53072963d', NULL, NULL, NULL, 2048),
	('88625047-6776-4a78-a6fe-cf4374d43f12', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-16 17:33:07.871491+00', 'level_up', 'active', 'React Native', '', '{"end_date": "2026-05-31", "start_date": "2026-04-29", "course_link": "https://www.udemy.com/course/react-native-the-practical-guide/?couponCode=MT260116G2", "total_hours": 29, "hours_completed": 0}', '{"DnDL Creative General"}', NULL, NULL, NULL, NULL, 5120),
	('b81ce27f-92b0-493b-aa59-c05f72d9f9b1', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-19 21:19:22.771785+00', 'task', 'active', 'Quick Note', 'note a', '{}', NULL, NULL, NULL, NULL, 'one_off', 0),
	('878d2d76-a0b8-4863-b41f-28f337c36a47', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-19 20:51:33.981697+00', 'resource', 'active', 'Cloudflare Stream', '', '{}', '{"DnDL Creative General"}', NULL, NULL, '2026-01-19 00:00:00+00', NULL, 1024),
	('26303e3e-343b-45a3-8b2e-bee47de96365', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-16 17:39:25.5893+00', 'level_up', 'active', 'Web Design', '', '{"end_date": "2026-06-21", "start_date": "2026-06-01", "course_link": "https://www.udemy.com/course/web-design-in-figma-from-zero-complete-course/", "total_hours": 16, "hours_completed": 0}', '{"DnDL Creative General"}', NULL, NULL, NULL, NULL, 6144),
	('70d94447-5467-47fe-a674-20ef5bb8576f', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-17 18:20:46.387077+00', 'task', 'active', 'add edit pencil with confirm toast to all', NULL, '{}', NULL, '5c30c395-bfba-4eb1-8282-20b53072963d', NULL, NULL, NULL, 3072),
	('5c30c395-bfba-4eb1-8282-20b53072963d', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-16 16:54:33.883178+00', 'task', 'active', 'To do app', '', '{}', NULL, NULL, NULL, '2026-01-16 00:00:00+00', 'one_off', 1024),
	('871763b9-2206-49a7-b855-7ea009e22054', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-19 21:31:16.282329+00', 'task', 'active', 'Quick Note', 'test 20
', '{}', NULL, NULL, NULL, NULL, 'one_off', 0),
	('8626d9c2-2fa6-4de0-ae25-883fb8c48e80', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-19 21:31:13.489231+00', 'task', 'active', 'incorporate this feeling into blog', 'this isn’t just your “oh we’re trying to get ranked blog” this is your authority on audiobooks ', '{}', '{CineSonic}', NULL, NULL, NULL, 'one_off', 0),
	('b72919d7-cc4c-4613-af66-326279cc4961', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-16 17:20:06.238516+00', 'level_up', 'active', 'TypeScript x React', '', '{"end_date": "2026-01-26", "start_date": "2026-01-15", "course_link": "https://www.udemy.com/course/react-typescript-the-practical-guide/learn/lecture/40464072?start=5#overview", "total_hours": 8, "hours_completed": 1, "daily_study_goal": 1}', '{"DnDL Creative General"}', NULL, NULL, NULL, NULL, 1024),
	('fb72baa3-834c-49ff-a374-e1b2954b25a0', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-16 17:44:15.898307+00', 'level_up', 'active', 'Buy, Grow, Sell Startups', '', '{"end_date": "2026-02-03", "start_date": "2026-01-25", "course_link": "https://acquire.podia.com/view/courses/how-to-buy-startups/2089648-module-1-getting-started-updated/6577801-setting-up-an-umbrella-company-usa", "total_hours": 10, "hours_completed": 0}', '{"DnDL Creative General"}', NULL, NULL, NULL, NULL, 2048),
	('69390587-3cb7-47d4-88d3-2095f591bdbc', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-19 21:57:11.136071+00', 'idea_board', 'active', 'Quick Note', 'We don’t just avoid cutting corners. We make sure our corners are rounded. ', '{"stage": "spark"}', '{CineSonic}', NULL, NULL, NULL, NULL, 0),
	('0d9998c2-7e98-4bb6-9075-032e3bc5be80', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-19 21:57:09.958156+00', 'idea_board', 'active', 'Quick Note', 'Curly fries and gay fries (end zone thought when the waiter asked about curly vs straight fries)', '{"stage": "spark"}', '{General}', NULL, NULL, NULL, NULL, 1024);


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('videos', 'videos', NULL, '2025-12-14 04:28:27.000456+00', '2025-12-14 04:28:27.000456+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('audio', 'audio', NULL, '2025-12-14 05:34:15.842665+00', '2025-12-14 05:34:15.842665+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('site-images', 'site-images', NULL, '2026-01-04 21:43:10.603567+00', '2026-01-04 21:43:10.603567+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('blog-images', 'blog-images', NULL, '2025-12-23 09:30:50.187891+00', '2025-12-23 09:30:50.187891+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('admin', 'admin', NULL, '2026-01-06 22:17:42.439387+00', '2026-01-06 22:17:42.439387+00', true, false, NULL, NULL, NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "level") VALUES
	('cd82ff43-8b63-464f-8cad-d7487a0b9bd2', 'site-images', '(admin)/admin/vibe-writer/vibewriter-skyline-newcincinnati-cyberpunk.jpeg', NULL, '2026-01-04 22:24:51.871469+00', '2026-01-06 00:11:17.695721+00', '2026-01-04 22:24:51.871469+00', '{"eTag": "\"dfd776f75551b24d528f046ff4e40d34\"", "size": 3399468, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-06T00:11:18.000Z", "contentLength": 3399468, "httpStatusCode": 200}', 'a1c4c562-cc82-47ba-a5c1-f79f6951f7b8', NULL, NULL, 4),
	('89168c4b-c676-4f06-b253-ff943c0fa9b2', 'audio', 'demos/demo_neverfar_60s_april2025.mp3', NULL, '2025-12-14 05:34:44.20697+00', '2026-01-09 06:45:52.279135+00', '2025-12-14 05:34:44.20697+00', '{"eTag": "\"4fd104ce7ea1c1bbd162abad3ee2a812\"", "size": 1441958, "mimetype": "audio/mpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-09T06:45:53.000Z", "contentLength": 1441958, "httpStatusCode": 200}', '2006cfd6-6415-4e91-94d6-4ae13dff6145', NULL, NULL, 2),
	('24e4d826-64a3-4296-959e-5ba41c5446ef', 'audio', 'demos/demo-rtibw-amos-intro.mp3', NULL, '2025-12-14 05:34:44.823712+00', '2026-01-09 06:45:52.299831+00', '2025-12-14 05:34:44.823712+00', '{"eTag": "\"b95bde4c5d22082be3eed182f1043c8e\"", "size": 2946656, "mimetype": "audio/mpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-09T06:45:53.000Z", "contentLength": 2946656, "httpStatusCode": 200}', 'bd660df2-73a5-40af-ab3f-3c05ee8e1a7c', NULL, NULL, 2),
	('f3e2be2c-613d-4cb3-a4de-f89c23eb8ab4', 'audio', 'demos/demo_neverfar.mp3', NULL, '2025-12-14 05:34:44.966891+00', '2026-01-09 06:45:52.342509+00', '2025-12-14 05:34:44.966891+00', '{"eTag": "\"a42e497674bcaea3c1846214b929938d\"", "size": 4779153, "mimetype": "audio/mpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-09T06:45:53.000Z", "contentLength": 4779153, "httpStatusCode": 200}', '52e0df18-5b74-48d8-aaca-ef7627f5155b', NULL, NULL, 2),
	('102b093d-d4e0-4024-be71-d24a575aa175', 'site-images', '(marketing)/actor/dndl-headshot.webp', NULL, '2026-01-06 00:20:54.002334+00', '2026-01-06 00:20:54.002334+00', '2026-01-06 00:20:54.002334+00', '{"eTag": "\"4f50525aa960b3f7760465d030684d8f-1\"", "size": 636550, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-06T00:20:54.000Z", "contentLength": 636550, "httpStatusCode": 200}', 'b56be29f-9304-431a-9f17-cddf99cac4b8', NULL, NULL, 3),
	('4499837a-0bfc-45cb-a6df-b10ff8c6a1f9', 'site-images', '(marketing)/actor/dndl-website-rtibw.webp', NULL, '2026-01-06 00:21:34.030408+00', '2026-01-06 00:21:34.030408+00', '2026-01-06 00:21:34.030408+00', '{"eTag": "\"ebf02a808e0e63297689e12c1fe367aa-1\"", "size": 49868, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-06T00:21:33.000Z", "contentLength": 49868, "httpStatusCode": 200}', 'acd8d0dc-feab-4508-883b-ebdd4c9892c5', NULL, NULL, 3),
	('35a8db28-3e4e-4e4f-9c9d-d734923c0b9e', 'blog-images', 'darts-improve-focus/hero/blog-darts.webp', NULL, '2026-01-05 22:16:45.158134+00', '2026-01-05 22:16:45.158134+00', '2026-01-05 22:16:45.158134+00', '{"eTag": "\"7e725b651b59c7d23ea31ba9f42ce210-1\"", "size": 22230, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-05T22:16:45.000Z", "contentLength": 22230, "httpStatusCode": 200}', '38cc8907-728e-490f-b2db-c7656df297b2', NULL, NULL, 3),
	('1b5bad94-0ead-4c92-a3b7-42c3b68eed7f', 'videos', 'never-far-author-testimonial.mp4', NULL, '2025-12-14 04:30:38.255077+00', '2025-12-14 05:31:48.198482+00', '2025-12-14 04:30:38.255077+00', '{"eTag": "\"0c56f1ac33a888ce803b5084c6e6abd4\"", "size": 43129597, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2025-12-14T05:31:48.000Z", "contentLength": 43129597, "httpStatusCode": 200}', '9c45c9fa-1bbb-4815-bb64-aacd759cb763', NULL, NULL, 1),
	('c82864b6-19ad-407e-8d7b-dd881b4a01dc', 'admin', '.emptyFolderPlaceholder', NULL, '2026-01-07 04:58:00.11127+00', '2026-01-07 04:58:00.11127+00', '2026-01-07 04:58:00.11127+00', '{"eTag": "\"d41d8cd98f00b204e9800998ecf8427e\"", "size": 0, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2026-01-07T04:58:00.114Z", "contentLength": 0, "httpStatusCode": 200}', '3430fabd-53cf-4284-bc90-db9cb4a6b70e', NULL, '{}', 1),
	('19368fb7-c3cd-4fd9-96a0-76cf2d58df02', 'admin', '1767762586417.png', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-07 05:09:47.743438+00', '2026-01-07 05:09:47.743438+00', '2026-01-07 05:09:47.743438+00', '{"eTag": "\"40bcf540d0740ceb6135d7e5862035de\"", "size": 1826645, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-07T05:09:48.000Z", "contentLength": 1826645, "httpStatusCode": 200}', '6b315f19-82b2-43fa-9b62-0775d42d7e61', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '{}', 1),
	('ac0a22a8-2770-45a9-9695-cb8bb93458b8', 'blog-images', 'heres-to-the-little-guys/hero/blog-little-guys.webp', NULL, '2026-01-05 22:25:42.387121+00', '2026-01-05 22:25:42.387121+00', '2026-01-05 22:25:42.387121+00', '{"eTag": "\"f073f55d24fc4835f604520fa1915892-1\"", "size": 241880, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-05T22:25:43.000Z", "contentLength": 241880, "httpStatusCode": 200}', 'db886cc2-0a0e-4b60-9f9b-b4b5399c01b8', NULL, NULL, 3),
	('47e31c25-59a5-4104-85c1-31bf2b449065', 'blog-images', 'heres-to-the-little-guys/content-images/blog-little-guys-2.webp', NULL, '2026-01-05 22:26:41.103815+00', '2026-01-05 22:26:41.103815+00', '2026-01-05 22:26:41.103815+00', '{"eTag": "\"37e90abf69d532acfa8cd9ab5237b001-1\"", "size": 42638, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-05T22:26:41.000Z", "contentLength": 42638, "httpStatusCode": 200}', '41a10df2-a9cb-4273-9cc4-59b9a628cf39', NULL, NULL, 3),
	('c6326933-9736-4101-a2a9-48b9aace77f7', 'site-images', '(admin)/admin/vibe-writer/.emptyFolderPlaceholder', NULL, '2026-01-06 00:09:57.579231+00', '2026-01-06 00:10:07.010297+00', '2026-01-06 00:09:57.579231+00', '{"eTag": "\"d41d8cd98f00b204e9800998ecf8427e\"", "size": 0, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2026-01-06T00:10:07.000Z", "contentLength": 0, "httpStatusCode": 200}', '294df1f3-e878-411c-bd5d-8e1ae4b4eda4', NULL, '{}', 4),
	('48339d45-04b2-427f-b808-876ddb6e2d36', 'site-images', '(admin)/admin/vibe-writer/Gemini_Generated_Image_x2w1c9x2w1c9x2w1.jpeg', NULL, '2026-01-04 21:43:35.383653+00', '2026-01-06 00:10:50.746451+00', '2026-01-04 21:43:35.383653+00', '{"eTag": "\"509d7b3beaf6bb310efe1548f94e1801\"", "size": 300176, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-06T00:10:51.000Z", "contentLength": 300176, "httpStatusCode": 200}', '2324ba58-cb2b-4815-9d30-6c8e36fd5bf2', NULL, NULL, 4),
	('1ecc40e2-5bc7-4a83-aaea-d8378ed30df7', 'site-images', '(marketing)/actor/never-far.webp', NULL, '2026-01-06 00:23:40.089897+00', '2026-01-06 00:23:40.089897+00', '2026-01-06 00:23:40.089897+00', '{"eTag": "\"81e8a9fb26de6a9acdd90ec1cf730e3c-1\"", "size": 64966, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-06T00:23:40.000Z", "contentLength": 64966, "httpStatusCode": 200}', '33d14364-33c4-4807-8639-ba70e3015d88', NULL, NULL, 3),
	('df86a744-3441-4794-8ed7-f53f0ea86a89', 'site-images', '(marketing)/actor/dndl-website-pd.webp', NULL, '2026-01-06 00:34:23.372026+00', '2026-01-06 00:34:23.372026+00', '2026-01-06 00:34:23.372026+00', '{"eTag": "\"bba44b2db62a9f0678eaa31eb31321cb-1\"", "size": 27120, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-06T00:34:24.000Z", "contentLength": 27120, "httpStatusCode": 200}', '38cadfec-cfc6-4135-a82f-78edad4e1b38', NULL, NULL, 3),
	('519d1cd4-8bd3-4b77-91c7-7df5f7b2a002', 'admin', '1767766854505-15my7m.png', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-07 06:20:55.591699+00', '2026-01-07 06:20:55.591699+00', '2026-01-07 06:20:55.591699+00', '{"eTag": "\"63c59cf20f1e04ecf145bfb971e2d122\"", "size": 1423451, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-07T06:20:56.000Z", "contentLength": 1423451, "httpStatusCode": 200}', '6db55c19-fd6c-44f0-8d2e-04a1c0e3098c', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '{}', 1),
	('0fb74e89-13d8-41d6-9379-191054e06f2b', 'blog-images', 'heres-to-the-little-guys/content-images/blog-little-guys-3.webp', NULL, '2026-01-05 22:26:41.238852+00', '2026-01-05 22:26:41.238852+00', '2026-01-05 22:26:41.238852+00', '{"eTag": "\"9f7c2c40ed09f40401c9337c23629b8c-1\"", "size": 85596, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-05T22:26:41.000Z", "contentLength": 85596, "httpStatusCode": 200}', 'b1636ef5-2d8e-4293-85d4-6d7b77a1dde0', NULL, NULL, 3),
	('eae06b38-02ff-46df-a707-7ec05ab44b70', 'blog-images', 'who-what-when-where-why-and-sometimes-how/hero/who-what-when-where-why-sometimes-how-blog-daniel-not-day-lewis.webp', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-07 06:29:47.994082+00', '2026-01-07 06:29:47.994082+00', '2026-01-07 06:29:47.994082+00', '{"eTag": "\"aec56c71328c0fadb79bd4389b836908\"", "size": 59982, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-07T06:29:48.000Z", "contentLength": 59982, "httpStatusCode": 200}', '02c07404-1845-400a-a216-4c43f126518f', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '{}', 3),
	('b0afb17a-4718-404c-881e-69baa5337444', 'blog-images', 'learning-a-language/hero/blog-learning-languages.webp', NULL, '2026-01-05 22:34:09.010608+00', '2026-01-05 22:34:09.010608+00', '2026-01-05 22:34:09.010608+00', '{"eTag": "\"15ed1a8b8b1883ee6d6e0a9bebb3243f-1\"", "size": 250550, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-05T22:34:09.000Z", "contentLength": 250550, "httpStatusCode": 200}', 'c9fc8190-23b7-4e73-a45f-a5a8c48e3c69', NULL, NULL, 3),
	('498bad42-b85b-4c95-bd7f-bd2636baef4f', 'blog-images', 'learning-a-language/content-images/blog-learn-language-1.webp', NULL, '2026-01-05 22:35:31.131207+00', '2026-01-05 22:35:31.131207+00', '2026-01-05 22:35:31.131207+00', '{"eTag": "\"9dbe4f99157465db5a7f95bc68e67772-1\"", "size": 199788, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-05T22:35:31.000Z", "contentLength": 199788, "httpStatusCode": 200}', 'd19b7d55-0b1d-46f2-aca7-030e7dcb696d', NULL, NULL, 3),
	('e7e88abe-4887-4b78-8e93-a00174bd28b5', 'audio', 'blogcast/20260109_blogcast_ep01_the_5_ws.mp3', NULL, '2026-01-09 18:31:53.400458+00', '2026-01-09 18:31:53.400458+00', '2026-01-09 18:31:53.400458+00', '{"eTag": "\"57f04c466d79ea88e3a6ad84cecc0c35-3\"", "size": 13111796, "mimetype": "audio/mpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-09T18:31:49.000Z", "contentLength": 13111796, "httpStatusCode": 200}', '9e9c4d50-73ff-43ae-9a2b-e66300d6e608', NULL, NULL, 2),
	('064931a8-a92e-41ce-8f98-3fe2073150e8', 'blog-images', 'learning-a-language/content-images/img-3498.jpg', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-10 08:42:00.24982+00', '2026-01-10 08:42:00.24982+00', '2026-01-10 08:42:00.24982+00', '{"eTag": "\"770cd7e7a51cadc0a04a936bf8e470da\"", "size": 1370005, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-10T08:42:01.000Z", "contentLength": 1370005, "httpStatusCode": 200}', '9bfb5004-42ae-4e0b-b935-791cabe97147', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '{}', 3),
	('d0cb2cee-5e70-4e5c-8082-9fcf69e2edd7', 'blog-images', 'no-ai-pledge-100-percent-human-written-blog-daniel-not-day-lewis.png', NULL, '2026-01-08 20:04:20.788803+00', '2026-01-08 20:04:20.788803+00', '2026-01-08 20:04:20.788803+00', '{"eTag": "\"d90c7b21566d5a2cf816e7c024594d9e-1\"", "size": 720263, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-08T20:04:21.000Z", "contentLength": 720263, "httpStatusCode": 200}', '0295bdbf-0cae-49a5-9ac9-c11479ce25aa', NULL, NULL, 1),
	('9f49e40c-d6d9-493e-bbfd-d0c7fabc6c2e', 'blog-images', 'heres-to-the-little-guys/content-images/blog-little-guys-1.webp', NULL, '2026-01-05 22:26:41.2457+00', '2026-01-05 22:26:41.2457+00', '2026-01-05 22:26:41.2457+00', '{"eTag": "\"c07aa83acff0c10d0799742915eaa0d4-1\"", "size": 60658, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-05T22:26:41.000Z", "contentLength": 60658, "httpStatusCode": 200}', '06145a6c-8c7f-4ee8-9594-a5a76d435089', NULL, NULL, 3),
	('34de1baf-2f55-4516-a5db-f65ecee71e22', 'blog-images', 'learning-a-language/content-images/blog-learn-language-3.webp', NULL, '2026-01-05 22:35:31.321482+00', '2026-01-05 22:35:31.321482+00', '2026-01-05 22:35:31.321482+00', '{"eTag": "\"2be9541b13e3644b311717257f792959-1\"", "size": 274284, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-05T22:35:31.000Z", "contentLength": 274284, "httpStatusCode": 200}', 'e71e9c5e-921b-48e8-90fd-28ed9fcb81fd', NULL, NULL, 3),
	('215fda85-afbd-413c-a4b7-92920bf6fbe2', 'blog-images', 'less-input-more-output/hero/blog-input-output.webp', NULL, '2026-01-05 22:39:31.758097+00', '2026-01-05 22:39:31.758097+00', '2026-01-05 22:39:31.758097+00', '{"eTag": "\"d7c9078475170b3c603584e62fba85d3-1\"", "size": 67582, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-05T22:39:32.000Z", "contentLength": 67582, "httpStatusCode": 200}', '856f0a93-2e04-4962-b213-035058230900', NULL, NULL, 3),
	('7344fa31-5bc4-47a1-8bb7-cac514ee32ad', 'site-images', '(marketing)/actor/a-little-crush.webp', NULL, '2026-01-06 00:23:40.285241+00', '2026-01-06 00:23:40.285241+00', '2026-01-06 00:23:40.285241+00', '{"eTag": "\"7cdc92d13b8a3970e70ae7bda84b9559-1\"", "size": 100000, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-06T00:23:40.000Z", "contentLength": 100000, "httpStatusCode": 200}', '04e13833-a38d-4f35-b698-e895f018fc29', NULL, NULL, 3),
	('f38cc3e9-4df5-415f-b766-b6729573f8de', 'blog-images', 'teaching-english-in-south-korea/hero/blog-korea.webp', NULL, '2026-01-05 22:39:52.249543+00', '2026-01-05 22:39:52.249543+00', '2026-01-05 22:39:52.249543+00', '{"eTag": "\"3dd325e7a4643767d2ee91b6513b480c-1\"", "size": 287588, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-05T22:39:52.000Z", "contentLength": 287588, "httpStatusCode": 200}', 'cd557b7c-2894-4ce9-b832-6eadcd6c727e', NULL, NULL, 3),
	('325d3705-d31b-473c-84e8-05b7ded9223f', 'blog-images', 'voice-acting-redemption/hero/blog-voice-acting-redemption.webp', NULL, '2026-01-05 22:40:19.526306+00', '2026-01-05 22:40:19.526306+00', '2026-01-05 22:40:19.526306+00', '{"eTag": "\"102c6e98f9395c6863106d0274a3085e-1\"", "size": 129812, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-05T22:40:20.000Z", "contentLength": 129812, "httpStatusCode": 200}', '46dabc80-855f-49a3-aaee-3007b7fd736f', NULL, NULL, 3),
	('9c90e994-0c09-481e-926a-2cd5ee628025', 'admin', 'logo-1767773734703.png', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-07 08:15:37.198038+00', '2026-01-07 08:15:37.198038+00', '2026-01-07 08:15:37.198038+00', '{"eTag": "\"6633ca5d53029965751395bb06b41897-2\"", "size": 7676372, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-07T08:15:37.000Z", "contentLength": 7676372, "httpStatusCode": 200}', '6502fbd0-2720-4bae-8d04-cc2960e125d3', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '{}', 1),
	('22a0fa23-c643-445a-bb5c-d7a6bd232b00', 'blog-images', 'darts-improve-focus/content-images/20170214-005426.jpg', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-10 08:14:45.970456+00', '2026-01-10 08:14:45.970456+00', '2026-01-10 08:14:45.970456+00', '{"eTag": "\"2abe9a3fa7af2094649dcf69ef0810b2\"", "size": 1572315, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-10T08:14:46.000Z", "contentLength": 1572315, "httpStatusCode": 200}', '6dfe4e0c-9ea5-4185-9310-a7a0840883d6', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '{}', 3),
	('8eef0f98-59ab-40d1-af6a-e93a6824bafe', 'blog-images', 'forward-is-backward-is-forward/content-images/maslow-s-hierarchy-of-needs-pyramid--original-five-level-model-.png--1-.webp', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-10 09:02:53.487837+00', '2026-01-10 09:02:53.487837+00', '2026-01-10 09:02:53.487837+00', '{"eTag": "\"1c71fd18df4b0c983b1acf643704f9fb\"", "size": 48124, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-10T09:02:54.000Z", "contentLength": 48124, "httpStatusCode": 200}', '43ee7984-3619-4fb6-a4cc-ec14e11c5491', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '{}', 3),
	('5a41a21d-ec7c-499c-85d7-3771b8853315', 'blog-images', 'heres-to-the-little-guys/content-images/blog-little-guys-4.webp', NULL, '2026-01-05 22:26:41.23799+00', '2026-01-05 22:26:41.23799+00', '2026-01-05 22:26:41.23799+00', '{"eTag": "\"f19e2fe4fe43797a4e069f3ee488645f-1\"", "size": 91046, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-05T22:26:41.000Z", "contentLength": 91046, "httpStatusCode": 200}', '004399cc-5251-4a18-9992-a8215535cd10', NULL, NULL, 3),
	('c5ec9c24-86b1-48f2-ac6e-245d49d761ff', 'blog-images', 'learning-a-language/content-images/blog-learn-language-2.webp', NULL, '2026-01-05 22:35:31.124055+00', '2026-01-05 22:35:31.124055+00', '2026-01-05 22:35:31.124055+00', '{"eTag": "\"0ddb5ed2b761746f59e2f47ae1258e7b-1\"", "size": 93440, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-05T22:35:31.000Z", "contentLength": 93440, "httpStatusCode": 200}', 'a6bc1c2d-0041-4f12-b1ea-261535c98775', NULL, NULL, 3),
	('ecbbf1ab-1779-4730-b4ca-77684ab597c5', 'audio', 'demos/demo_filthy_rich_santas_female_dialogue.mp3', NULL, '2025-12-14 05:34:44.535652+00', '2026-01-09 06:45:52.274635+00', '2025-12-14 05:34:44.535652+00', '{"eTag": "\"343bad185c5795f4dc9865f7b48bf63c\"", "size": 2220047, "mimetype": "audio/mpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-09T06:45:53.000Z", "contentLength": 2220047, "httpStatusCode": 200}', '357261b9-5e28-4939-95fb-7e68709f5ab1', NULL, NULL, 2),
	('4f80e8ad-2755-4f05-a3b2-f5ff8da6e6ce', 'blog-images', 'forward-is-backward-is-forward/hero/forward-is-backward-is-forward-blog.png', NULL, '2026-01-05 22:41:51.882892+00', '2026-01-05 22:41:51.882892+00', '2026-01-05 22:41:51.882892+00', '{"eTag": "\"9890275c601d90c786bc25179ca1d331-1\"", "size": 3374158, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-05T22:41:52.000Z", "contentLength": 3374158, "httpStatusCode": 200}', '95025aa5-f885-443b-8166-b07d9f3b912f', NULL, NULL, 3),
	('7d819e4b-8ffb-4185-ba13-2fbe73fc37b4', 'blog-images', 'good-acting-easy-great-acting-personalization/hero/blog-good-acting-great-acting.webp', NULL, '2026-01-05 22:42:18.998361+00', '2026-01-05 22:42:18.998361+00', '2026-01-05 22:42:18.998361+00', '{"eTag": "\"693441210fedc0b3f0829a015d232570-1\"", "size": 579426, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-05T22:42:19.000Z", "contentLength": 579426, "httpStatusCode": 200}', '6a88b92a-339e-4ae7-87c5-26982f150e94', NULL, NULL, 3),
	('5833363b-5fe5-4d8a-b485-19472c9ad8ab', 'audio', 'demos/.emptyFolderPlaceholder', NULL, '2026-01-09 06:45:07.629135+00', '2026-01-09 06:45:07.629135+00', '2026-01-09 06:45:07.629135+00', '{"eTag": "\"d41d8cd98f00b204e9800998ecf8427e\"", "size": 0, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2026-01-09T06:45:07.631Z", "contentLength": 0, "httpStatusCode": 200}', '95a71119-6210-4c58-9ee6-e9b6d1ad8473', NULL, '{}', 2),
	('7293ce12-c5f5-479e-9eb2-2e2ad3601293', 'blog-images', 'learning-a-language/content-images/img-5336.heic', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-10 08:38:02.57633+00', '2026-01-10 08:38:02.57633+00', '2026-01-10 08:38:02.57633+00', '{"eTag": "\"6e0a8284f280dec26fb0c4bc48402732\"", "size": 3070137, "mimetype": "image/heic", "cacheControl": "max-age=3600", "lastModified": "2026-01-10T08:38:03.000Z", "contentLength": 3070137, "httpStatusCode": 200}', '2556b77f-4680-4109-b03f-dfac2ed1d592', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '{}', 3),
	('0f19de3c-3d62-4256-8d8d-69f1c7228ac0', 'blog-images', 'learning-a-language/content-images/img-5538.jpg', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-10 08:41:17.34804+00', '2026-01-10 08:41:17.34804+00', '2026-01-10 08:41:17.34804+00', '{"eTag": "\"ca753883b1a9ed5199747c48baf22474\"", "size": 2261707, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-10T08:41:18.000Z", "contentLength": 2261707, "httpStatusCode": 200}', '7e103305-023a-4729-8c86-bacb5e43225b', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '{}', 3),
	('5c8c2305-64ab-4744-8864-1792a125760b', 'blog-images', 'learning-a-language/content-images/img-5336.jpg', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '2026-01-10 08:41:54.188845+00', '2026-01-10 08:41:54.188845+00', '2026-01-10 08:41:54.188845+00', '{"eTag": "\"4521a73e75dcde69a093549dd5264f0d\"", "size": 2101406, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-10T08:41:55.000Z", "contentLength": 2101406, "httpStatusCode": 200}', '061ae846-5af6-41ee-8adf-1019fe58e7e0', 'f31c33dd-4080-43b3-9060-afad5e5bab2b', '{}', 3),
	('14e7727e-8ed1-4f5a-9008-1488eeb51767', 'site-images', '(marketing)/endeavors/.emptyFolderPlaceholder', NULL, '2026-01-10 10:15:42.555385+00', '2026-01-10 10:15:42.555385+00', '2026-01-10 10:15:42.555385+00', '{"eTag": "\"d41d8cd98f00b204e9800998ecf8427e\"", "size": 0, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2026-01-10T10:15:42.560Z", "contentLength": 0, "httpStatusCode": 200}', '1e172e3d-d6d5-4742-a457-696d04c49c1f', NULL, '{}', 3);


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."prefixes" ("bucket_id", "name", "created_at", "updated_at") VALUES
	('blog-images', 'voice-acting-redemption', '2026-01-05 22:12:07.349393+00', '2026-01-05 22:12:07.349393+00'),
	('blog-images', 'voice-acting-redemption/hero', '2026-01-05 22:12:12.92348+00', '2026-01-05 22:12:12.92348+00'),
	('blog-images', 'teaching-english-in-south-korea', '2026-01-05 22:12:39.949957+00', '2026-01-05 22:12:39.949957+00'),
	('blog-images', 'teaching-english-in-south-korea/hero', '2026-01-05 22:12:44.003023+00', '2026-01-05 22:12:44.003023+00'),
	('blog-images', 'less-input-more-output', '2026-01-05 22:12:57.774554+00', '2026-01-05 22:12:57.774554+00'),
	('audio', 'blogcast', '2026-01-09 18:31:37.608262+00', '2026-01-09 18:31:37.608262+00'),
	('blog-images', 'less-input-more-output/hero', '2026-01-05 22:13:01.65712+00', '2026-01-05 22:13:01.65712+00'),
	('blog-images', 'learning-a-language', '2026-01-05 22:13:12.636324+00', '2026-01-05 22:13:12.636324+00'),
	('blog-images', 'darts-improve-focus/content-images', '2026-01-10 08:14:45.970456+00', '2026-01-10 08:14:45.970456+00'),
	('blog-images', 'learning-a-language/hero', '2026-01-05 22:13:16.332705+00', '2026-01-05 22:13:16.332705+00'),
	('blog-images', 'heres-to-the-little-guys', '2026-01-05 22:13:25.944879+00', '2026-01-05 22:13:25.944879+00'),
	('blog-images', 'forward-is-backward-is-forward/content-images', '2026-01-10 09:02:53.487837+00', '2026-01-10 09:02:53.487837+00'),
	('blog-images', 'heres-to-the-little-guys/hero', '2026-01-05 22:13:32.573299+00', '2026-01-05 22:13:32.573299+00'),
	('blog-images', 'good-acting-easy-great-acting-personalization', '2026-01-05 22:13:46.431739+00', '2026-01-05 22:13:46.431739+00'),
	('site-images', '(marketing)/endeavors', '2026-01-10 10:15:42.555385+00', '2026-01-10 10:15:42.555385+00'),
	('blog-images', 'good-acting-easy-great-acting-personalization/hero', '2026-01-05 22:13:51.646422+00', '2026-01-05 22:13:51.646422+00'),
	('blog-images', 'forward-is-backward-is-forward', '2026-01-05 22:14:06.014641+00', '2026-01-05 22:14:06.014641+00'),
	('blog-images', 'forward-is-backward-is-forward/hero', '2026-01-05 22:14:09.662173+00', '2026-01-05 22:14:09.662173+00'),
	('blog-images', 'darts-improve-focus', '2026-01-05 22:14:17.550318+00', '2026-01-05 22:14:17.550318+00'),
	('blog-images', 'darts-improve-focus/hero', '2026-01-05 22:14:21.32326+00', '2026-01-05 22:14:21.32326+00'),
	('blog-images', 'heres-to-the-little-guys/content-images', '2026-01-05 22:24:24.553946+00', '2026-01-05 22:24:24.553946+00'),
	('blog-images', 'learning-a-language/content-images', '2026-01-05 22:33:26.143886+00', '2026-01-05 22:33:26.143886+00'),
	('site-images', '(admin)', '2026-01-06 00:10:07.010297+00', '2026-01-06 00:10:07.010297+00'),
	('site-images', '(admin)/admin', '2026-01-06 00:10:07.010297+00', '2026-01-06 00:10:07.010297+00'),
	('site-images', '(admin)/admin/vibe-writer', '2026-01-06 00:10:07.010297+00', '2026-01-06 00:10:07.010297+00'),
	('site-images', '(marketing)', '2026-01-06 00:11:47.491197+00', '2026-01-06 00:11:47.491197+00'),
	('site-images', '(marketing)/actor', '2026-01-06 00:12:04.250687+00', '2026-01-06 00:12:04.250687+00'),
	('blog-images', 'who-what-when-where-why-and-sometimes-how', '2026-01-07 06:29:47.994082+00', '2026-01-07 06:29:47.994082+00'),
	('blog-images', 'who-what-when-where-why-and-sometimes-how/hero', '2026-01-07 06:29:47.994082+00', '2026-01-07 06:29:47.994082+00'),
	('audio', 'demos', '2026-01-09 06:45:07.629135+00', '2026-01-09 06:45:07.629135+00');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 294, true);


--
-- Name: 11_voiceover_notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."11_voiceover_notes_id_seq"', 3, true);


--
-- Name: 11_voiceover_tracker_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."11_voiceover_tracker_id_seq"', 24, true);


--
-- Name: do_not_contact_leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."do_not_contact_leads_id_seq"', 11, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict BZLLaBdKKuqT9dijEJbRbiwAKYlhkWGNUlqm6nhcJ0p8SfsLExVPtJFyU6zwyKV

RESET ALL;
