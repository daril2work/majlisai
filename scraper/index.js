import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import axios from "axios";
import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";
import http from "http";

dotenv.config({ path: '../.env' });

// Simple HTTP Health Check Server to prevent Free-Tier Sleep (e.g. Render / Koyeb)
const PORT = process.env.PORT || '8080';
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK');
}).listen(PORT, () => {
  console.log(`🌐 Health check server listening on port ${PORT}`);
});

const apiId = parseInt(process.env.TELEGRAM_API_ID || '0');
const apiHash = process.env.TELEGRAM_API_HASH || '';
const stringSession = new StringSession(process.env.TELEGRAM_SESSION || "");
const webhookUrl = process.env.WEBHOOK_URL || '';
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

if (!apiId || !apiHash || !webhookUrl) {
  console.error('❌ ENV TIDAK LENGKAP: Pastikan TELEGRAM_API_ID, TELEGRAM_API_HASH, dan WEBHOOK_URL ada di .env');
  process.exit(1);
}

// Mengubah menjadi let agar bisa ditambah via Telegram Remote
let targetChannels = (process.env.TELEGRAM_TARGET_CHANNELS || "")
  .split(",")
  .map(s => s.trim().toLowerCase())
  .filter(s => s.length > 0);

(async () => {
  console.log("🚀 Menjalankan Stealth Scraper MajlisAI...");
  
  // Menambahkan identitas perangkat agar lebih stabil dan tidak mudah logout
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
    deviceModel: "MajlisAI Scraper Server",
    systemVersion: "Windows 11",
    appVersion: "3.0.0",
  });

  try {
    await client.connect();
    console.log("✅ Terhubung ke Telegram!");

    // Fungsi Update Status ke Database
    // Fungsi Update Status & Log ke Database
    const updateStatus = async (process = 'idle', logMsg = null) => {
      try {
        const { error } = await supabase
          .from('system_health')
          .upsert({ 
            id: 'scraper_v3', 
            last_heartbeat: new Date().toISOString(),
            status: 'online',
            current_process: process
          });
        
        if (logMsg) {
          await supabase.from('activity_logs').insert({
            type: process.includes('error') ? 'error' : 'info',
            message: logMsg
          });
          
          // Kirim Notifikasi ke Telegram Anda (Saved Messages / Me)
          await client.sendMessage('me', { message: `🔔 [MajlisAI Log]: ${logMsg}` }).catch(() => null);
        }
      } catch (e) { 
        console.error("⚠️ Logging Failed:", e.message);
      }
    };

    await updateStatus('starting', '🚀 Scraper dinyalakan kembali.');

    // Cek apakah sesi valid
    const me = await client.getMe().catch(() => null);
    if (!me) {
      console.error("❌ SESI TIDAK VALID: Silakan jalankan 'node scraper/login.js' lagi.");
      process.exit(1);
    }
    console.log(`👤 Login sebagai: ${me.firstName} (@${me.username || 'n/a'})`);

    if (targetChannels.length > 0) {
      console.log(`🎯 Fokus memantau ${targetChannels.length} channel: ${targetChannels.join(", ")}`);
    }

    // Monitoring Koneksi (Keep-Alive) setiap 5 menit
    setInterval(async () => {
      try {
        await client.getMe();
        await updateStatus('monitoring');
        console.info("💓 Heartbeat: Koneksi Telegram Aktif.");
      } catch (e) {
        console.error("💔 Heartbeat Failed.");
      }
    }, 5 * 60 * 1000);

    client.addEventHandler(async (event) => {
      const message = event.message;
      if (!message || !message.message) return;

      const sender = await message.getSender();
      const senderId = sender?.id?.toString();
      const myId = me.id.toString();

      // LOG SEMUA PESAN UNTUK DEBUG
      if (senderId === myId) {
        console.log(`👤 [SAYA]: ${message.message}`);
      } else {
        const chat = await message.getChat();
        console.log(`📢 [${chat.title || 'Private'}]: ${message.message.substring(0, 50)}...`);
      }

      // 🎮 REMOTE CONTROL LOGIC (Hanya jika pengirim adalah SAYA)
      if (senderId === myId && message.message.startsWith('/')) {
        console.log(`🛠 PERINTAH TERDETEKSI: ${message.message}`);
        const cmd = message.message.toLowerCase().trim().split(' ');
        const mainCmd = cmd[0];

        if (mainCmd === '/status') {
          try {
            const { count } = await supabase.from('events').select('*', { count: 'exact', head: true });
            const statusMsg = `🤖 *MajlisAI System Status*\n\n` +
                            `✅ Scraper: ONLINE\n` +
                            `👤 User ID: ${myId}\n` +
                            `📊 Total Events: ${count}\n` +
                            `🎯 Monitoring: ${targetChannels.length} channels\n` +
                            `💓 Heartbeat: Active`;
            await client.sendMessage('me', { message: statusMsg, parseMode: 'markdown' });
            console.log("✅ Balasan /status terkirim.");
          } catch (e) { console.error("❌ Gagal balas /status:", e.message); }
          return;
        }

        if (mainCmd === '/list') {
          const list = targetChannels.map((c, i) => `${i+1}. ${c}`).join('\n');
          await client.sendMessage('me', { message: `📋 *Target Monitoring:*\n\n${list || 'Kosong'}`, parseMode: 'markdown' });
          return;
        }

        if (mainCmd === '/add' && cmd[1]) {
          const newTarget = cmd.slice(1).join(' ').toLowerCase();
          if (!targetChannels.includes(newTarget)) {
            targetChannels.push(newTarget);
            await updateStatus('config_updated', `➕ Menambah target baru via Telegram: ${newTarget}`);
            await client.sendMessage('me', { message: `✅ Berhasil menambahkan *${newTarget}* ke daftar pantauan.`, parseMode: 'markdown' });
          } else {
            await client.sendMessage('me', { message: `⚠️ Channel *${newTarget}* sudah ada di daftar.`, parseMode: 'markdown' });
          }
          return;
        }

        if (mainCmd === '/help') {
          const helpMsg = `🛠 *MajlisAI Remote Commands:*\n\n` +
                         `/status - Cek kondisi sistem\n` +
                         `/list - Daftar channel pantauan\n` +
                         `/add [nama] - Tambah channel baru\n` +
                         `/help - Tampilkan pesan ini`;
          await client.sendMessage('me', { message: helpMsg, parseMode: 'markdown' });
          return;
        }
      }

      // Filter berdasarkan channel jika dikonfigurasi
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
        console.log(`📸 Terdeteksi gambar dari: ${message.chatId}`);
        await updateStatus('processing_image', `📸 Menemukan gambar di chat ${message.chatId}. Mengirim ke pipeline...`);
        try {
          const buffer = await client.downloadMedia(message.photo);
          await axios.post(webhookUrl, buffer, {
            headers: { "Content-Type": "application/octet-stream" },
          });
          await updateStatus('success', `✅ Gambar dari ${message.chatId} berhasil diproses.`);
        } catch (err) {
          await updateStatus('error', `❌ Gagal proses gambar: ${err.message}`);
        }
      } 
      // MODE 2: Jika hanya teks (broadcast panjang)
      else if (message.message && message.message.length > 150) {
        console.log(`📝 Terdeteksi teks panjang (${message.message.length} karakter).`);
        await updateStatus('processing_text', `📝 Menganalisis teks broadcast (${message.message.length} char)...`);
        try {
          await axios.post(webhookUrl, {
            type: "text",
            content: message.message
          }, {
            headers: { "Content-Type": "application/json" },
          });
          await updateStatus('success', `✅ Teks broadcast berhasil dikirim ke AI.`);
        } catch (err) {
          await updateStatus('error', `❌ Gagal proses teks: ${err.message}`);
        }
      }
    }, new NewMessage({ outgoing: true, incoming: true }));

  } catch (err) {
    await updateStatus('error_critical', `❌ KRITIKAL ERROR: ${err.message}`);
    if (err.message.includes("AUTH_KEY_UNREGISTERED")) {
      console.error("👉 SOLUSI: Sesi Anda telah dihapus oleh Telegram. Harap jalankan ulang 'node scraper/login.js'.");
    }
    process.exit(1);
  }
})();
