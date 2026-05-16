import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data, error } = await supabase.from('system_health').select('*').limit(1);
  if (error) {
    console.error("❌ ERROR checking system_health:", error.message);
  } else {
    console.log("✅ system_health exists!", data);
  }
  process.exit(0);
})();
