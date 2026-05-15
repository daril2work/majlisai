import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ path: '../.env' });

const apiId = 36686136;
const apiHash = "d99b7acca1c7e43e79382d9cab053d7d";
const stringSession = new StringSession(process.env.TELEGRAM_SESSION || "");
const webhookUrl = "https://dionpavjrstupazabtvf.supabase.co/functions/v1/telegram-webhook";

const targetChannels = (process.env.TELEGRAM_TARGET_CHANNELS || "")
  .split(",")
  .map(s => s.trim())
  .filter(s => s.length > 0);

(async () => {
  console.log("🔍 Memulai penyisiran sejarah (History Scan)...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.connect();
  console.log("✅ Terhubung ke Telegram!");

  for (const channelName of targetChannels) {
    console.log(`\n📂 Menyisir Channel: "${channelName}"...`);
    try {
      // Menggunakan dialogs untuk mencari entitas agar lebih akurat
      const dialogs = await client.getDialogs({});
      const target = dialogs.find(d => d.title === channelName);
      
      if (!target) {
        console.warn(`⚠️  Channel "${channelName}" tidak ditemukan di daftar chat Anda.`);
        continue;
      }

      const messages = await client.getMessages(target.entity, { limit: 50 }); // Perkecil limit untuk tes cepat
      console.log(`📦 Ditemukan ${messages.length} pesan. Memfilter gambar...`);
      
      let successCount = 0;
      let failCount = 0;

      for (const msg of messages) {
        if (msg.photo) {
          try {
            const buffer = await client.downloadMedia(msg.photo);
            const res = await axios.post(webhookUrl, buffer, {
              headers: { "Content-Type": "application/octet-stream" },
            });
            
            if (res.status === 200) {
              successCount++;
              process.stdout.write("✅");
            } else {
              failCount++;
              process.stdout.write("❌");
            }
          } catch (e) { 
            failCount++;
            process.stdout.write("❗"); 
          }
        }
      }
      console.log(`\n📊 Hasil "${channelName}": ${successCount} Berhasil, ${failCount} Gagal/Terfilter.`);
    } catch (err) {
      console.error(`❌ Gagal menyisir "${channelName}":`, err.message);
    }
  }

  console.log("\n🚀 PROSES SELESAI!");
  await client.disconnect();
  process.exit(0);
})();
