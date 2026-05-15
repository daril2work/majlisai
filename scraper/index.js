import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const apiId = parseInt(process.env.TELEGRAM_API_ID || '0');
const apiHash = process.env.TELEGRAM_API_HASH || '';
const stringSession = new StringSession(process.env.TELEGRAM_SESSION || "");
const webhookUrl = process.env.WEBHOOK_URL || '';

if (!apiId || !apiHash || !webhookUrl) {
  console.error('❌ ENV TIDAK LENGKAP: Pastikan TELEGRAM_API_ID, TELEGRAM_API_HASH, dan WEBHOOK_URL ada di .env');
  process.exit(1);
}

const targetChannels = (process.env.TELEGRAM_TARGET_CHANNELS || "")
  .split(",")
  .map(s => s.trim().toLowerCase())
  .filter(s => s.length > 0);

(async () => {
  console.log("🚀 Menjalankan Stealth Scraper MajlisAI...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.connect();
  console.log("✅ Terhubung ke Telegram!");

  if (targetChannels.length > 0) {
    console.log(`🎯 Fokus memantau ${targetChannels.length} channel: ${targetChannels.join(", ")}`);
  } else {
    console.log("🌐 Memantau SEMUA grup/channel.");
  }

  client.addEventHandler(async (event) => {
    const message = event.message;
    if (targetChannels.length > 0) {
      try {
        const chat = await message.getChat();
        const chatTitle = chat.title ? chat.title.toLowerCase() : "";
        const isMatch = targetChannels.some(target => chatTitle.includes(target));
        if (!isMatch) return;
      } catch (e) { return; }
    }

    // MODE 1: Jika ada gambar
    if (message.photo) {
      console.log(`📸 Terdeteksi gambar dari grup.`);
      try {
        const buffer = await client.downloadMedia(message.photo);
        await axios.post(webhookUrl, buffer, {
          headers: { "Content-Type": "application/octet-stream" },
        });
        console.log("✅ Gambar dikirim ke pipeline.");
      } catch (err) {
        console.error("❌ Gagal mengirim gambar:", err.message);
      }
    } 
    // MODE 2: Jika hanya teks (broadcast panjang)
    else if (message.message && message.message.length > 150) {
      console.log(`📝 Terdeteksi teks panjang (${message.message.length} karakter).`);
      try {
        await axios.post(webhookUrl, {
          type: "text",
          content: message.message
        }, {
          headers: { "Content-Type": "application/json" },
        });
        console.log("✅ Teks dikirim ke pipeline untuk dianalisis AI.");
      } catch (err) {
        console.error("❌ Gagal mengirim teks:", err.message);
      }
    }
  }, new NewMessage({}));

})();
