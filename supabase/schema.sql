-- 1. Aktifkan Extension PostGIS untuk pencarian lokasi
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Buat Tabel Events (Jika belum ada, atau sesuaikan)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    speaker TEXT NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    coordinates GEOGRAPHY(POINT) NOT NULL, -- Kolom khusus PostGIS
    image_url TEXT,
    image_hash TEXT UNIQUE, -- Untuk mencegah duplikat poster
    source_platform TEXT DEFAULT 'Manual',
    status TEXT DEFAULT 'review' CHECK (status IN ('active', 'review', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Buat Index Spasial agar pencarian radius sangat cepat
CREATE INDEX IF NOT EXISTS events_coordinates_idx ON public.events USING GIST (coordinates);

-- 4. Fungsi RPC untuk Pencarian Kajian Terdekat (Proximity Search)
-- Fungsi ini dipanggil oleh hook useEvents di frontend
CREATE OR REPLACE FUNCTION search_events_v2(
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  speaker TEXT,
  starts_at TIMESTAMPTZ,
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  image_url TEXT,
  source_platform TEXT,
  status TEXT,
  distance DOUBLE PRECISION -- Jarak dalam meter
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.title,
    e.speaker,
    e.starts_at,
    e.location_name,
    e.latitude,
    e.longitude,
    e.image_url,
    e.source_platform,
    e.status,
    ST_Distance(e.coordinates, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography) AS distance
  FROM
    public.events e
  WHERE
    e.status = 'active'
    AND ST_DWithin(e.coordinates, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography, radius_meters)
  ORDER BY
    distance ASC;
END;
$$;

-- 5. Berikan izin akses (RLS) agar publik bisa membaca data kajian
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" 
ON public.events FOR SELECT 
USING (status = 'active');
