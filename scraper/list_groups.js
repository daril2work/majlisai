import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import dotenv from "dotenv";
dotenv.config({ path: '../.env' });

const apiId = 36686136;
const apiHash = "d99b7acca1c7e43e79382d9cab053d7d";
const stringSession = new StringSession(process.env.TELEGRAM_SESSION || "");

(async () => {
  console.log("🔍 Sedang mengambil daftar grup/channel Anda...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.connect();
  
  const dialogs = await client.getDialogs({ limit: 50 });
  
  console.log("\n📋 DAFTAR GRUP / CHANNEL ANDA:");
  console.log("--------------------------------------------------");
  
  dialogs.forEach(dialog => {
    if (dialog.isGroup || dialog.isChannel) {
      console.log(`- ${dialog.title}`);
    }
  });

  console.log("--------------------------------------------------");
  console.log("💡 Silakan COPY nama-nama di atas ke TELEGRAM_TARGET_CHANNELS di file .env");
  
  await client.disconnect();
  process.exit(0);
})();
