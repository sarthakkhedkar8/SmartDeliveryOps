--
-- PostgreSQL database dump
--

\restrict 8hBUk4VbSbmTsCXg2vcal2ZxfVPNW1M5WxxkPy8zc6RHSoQikZSHFFzdR3PVox7

-- Dumped from database version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)
-- Dumped by pg_dump version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: deliveries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deliveries (
    id integer NOT NULL,
    customer_name character varying(100) NOT NULL,
    address text NOT NULL,
    product character varying(150) NOT NULL,
    status character varying(30) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.deliveries OWNER TO postgres;

--
-- Name: deliveries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.deliveries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.deliveries_id_seq OWNER TO postgres;

--
-- Name: deliveries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.deliveries_id_seq OWNED BY public.deliveries.id;


--
-- Name: deliveries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deliveries ALTER COLUMN id SET DEFAULT nextval('public.deliveries_id_seq'::regclass);


--
-- Data for Name: deliveries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deliveries (id, customer_name, address, product, status, created_at) FROM stdin;
2	Sarthak	Pune	Smartphone	pending	2026-08-30 18:02:29.393829
3	Sarthak	Pune	Smartphone	pending	2026-08-30 18:02:30.877947
4	Sarthak	Pune	Smartphone	pending	2026-08-30 18:04:12.348868
5	Sarthak	Pune	Smartphone	pending	2026-08-30 18:04:14.52198
6	Day2 Test	Pune	Keyboard	pending	2026-08-30 18:20:04.378916
7	rahul	Ahilyanagar	bike	pending	2026-08-30 19:03:29.532843
8	Swapnil Ardad	Beed	cow	delivered	2026-08-30 19:04:11.095374
9	Krushna Ruht	Pune	Apache Bike 200cc	delivered	2026-08-30 19:06:26.692025
1	Test Customer	Pune	Laptop	processing	2026-08-30 17:42:48.782051
\.


--
-- Name: deliveries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.deliveries_id_seq', 9, true);


--
-- Name: deliveries deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_pkey PRIMARY KEY (id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO smartdelivery;


--
-- Name: TABLE deliveries; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.deliveries TO smartdelivery;


--
-- Name: SEQUENCE deliveries_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.deliveries_id_seq TO smartdelivery;


--
-- PostgreSQL database dump complete
--

\unrestrict 8hBUk4VbSbmTsCXg2vcal2ZxfVPNW1M5WxxkPy8zc6RHSoQikZSHFFzdR3PVox7

