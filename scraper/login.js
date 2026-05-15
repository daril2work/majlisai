import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";
import dotenv from "dotenv";
dotenv.config({ path: '../.env' });

// API Credentials Baru Milik Anda
const apiId = 36686136;
const apiHash = "d99b7acca1c7e43e79382d9cab053d7d";
const stringSession = new StringSession(""); 

(async () => {
  console.log("🔐 Memulai proses Login Telegram...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("Masukkan Nomor HP (format +62...): "),
    password: async () => await input.text("Masukkan Password 2FA (jika ada): "),
    phoneCode: async () => await input.text("Masukkan Kode OTP dari Telegram: "),
    onError: (err) => console.log(err),
  });

  console.log("\n✅ LOGIN BERHASIL!");
  console.log("--------------------------------------------------");
  console.log("COPY kode di bawah ini ke TELEGRAM_SESSION di .env:");
  console.log("\n" + client.session.save()); 
  console.log("\n--------------------------------------------------");
  
  await client.disconnect();
  process.exit(0);
})();
