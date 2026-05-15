import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function check() {
  console.log("🔍 Mengecek isi tabel events...");
  const { data, error } = await supabase
    .from('events')
    .select('id, title, status, created_at, image_url');

  if (error) {
    console.error("❌ Error Query:", error.message);
    return;
  }

  if (data.length === 0) {
    console.log("⚠️ Tabel events KOSONG MELOMPONG.");
  } else {
    console.log(`✅ Ditemukan ${data.length} data di database:`);
    console.table(data);
  }
}

check();
