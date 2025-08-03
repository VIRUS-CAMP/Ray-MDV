const express = require('express');
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");

const router = express.Router();
let sock;

const connectBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("baileys_auth");
  sock = makeWASocket({ auth: state });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) connectBot();
    } else if (connection === "open") {
      console.log("📞 Phone Number Bot is ready");
    }
  });

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;
    await sock.sendMessage(msg.key.remoteJid, { text: "Nipo mbabe! 🤖" });
  });
};

connectBot();

router.get('/', (req, res) => {
  res.send("✅ Phone Number Bot is running...");
});

module.exports = router;
