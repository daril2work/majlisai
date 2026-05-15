import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const delay = (ms) => new Promise(res => setTimeout(res, ms));

// Fungsi pembersih kata-kata "pengganggu"
function cleanLocationName(text) {
  if (!text) return "";
  return text
    .replace(/Masjid|Gedung|Desa|Kelurahan|Kecamatan|Kec\.|Kabupaten|Kab\.|Kota|Provinsi/gi, "")
    .replace(/\s\s+/g, ' ')
    .trim();
}

async function getSmartCoordinates(event) {
  const rawLoc = event.location_name || "";
  const city = event.city || "";
  
  // Kumpulkan semua kata kunci unik
  const words = `${rawLoc} ${city}`.split(/[\s,]+/)
    .map(w => w.trim())
    .filter(w => w.length > 3 && !/null|Masjid|Kec|Desa/i.test(w));
  
  const uniqueWords = [...new Set(words)];
  
  let queriesToTry = [];
  
  // 1. Full Clean Address
  queriesToTry.push({ q: cleanLocationName(`${rawLoc}, ${city}`), acc: 100 });
  
  // 2. Just the Last 2 words (usually City/District)
  if (uniqueWords.length >= 2) {
    queriesToTry.push({ q: uniqueWords.slice(-2).join(' '), acc: 60 });
  }
  
  // 3. Just the Last word (usually City)
  if (uniqueWords.length >= 1) {
    queriesToTry.push({ q: uniqueWords.slice(-1).join(' '), acc: 40 });
  }

  for (const item of queriesToTry) {
    if (item.q.length < 3) continue;
    
    await delay(1500); // Lebih lama lagi jedanya (1.5 detik)
    const res = await fetchNom(item.q + ", Indonesia");
    if (res) return { ...res, accuracy: item.acc, usedQuery: item.q };
  }

  return null;
}

async function fetchNom(q) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MajlisAI/1.0' } });
    
    if (res.status === 403 || res.status === 429) {
      console.log("⚠️ PERINGATAN: IP Anda sedang dibatasi oleh Nominatim (Rate Limit).");
      return null;
    }

    const data = await res.json();
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      if (lat > -11 && lat < 6 && lon > 95 && lon < 141) return { lat, lon };
    }
  } catch (e) { return null; }
  return null;
}

(async () => {
  console.log("🛠️ Memulai perbaikan lokasi (Sistem Agresif & Anti-Block)...");
  
  const { data: brokenEvents } = await supabase
    .from('events')
    .select('*')
    .eq('latitude', 0)
    .limit(20); // Batasi 20 dulu untuk tes biar tidak diblokir

  if (!brokenEvents || brokenEvents.length === 0) {
    console.log("✨ Tidak ada data yang perlu diperbaiki.");
    return;
  }

  for (const event of brokenEvents) {
    console.log(`📡 Mencari: "${event.location_name}"...`);
    const geo = await getSmartCoordinates(event);
    if (geo) {
      const { error } = await supabase
        .from('events')
        .update({
          latitude: geo.lat,
          longitude: geo.lon,
          coordinates: `POINT(${geo.lon} ${geo.lat})`,
          location_accuracy: geo.accuracy
        })
        .eq('id', event.id);
      
      if (!error) console.log(`✅ [${geo.accuracy}%] Ketemu lewat: "${geo.usedQuery}"`);
    } else {
      console.log(`❌ Tetap Gagal.`);
    }
  }

  console.log("\n🚀 SELESAI!");
  process.exit(0);
})();
