const express = require('express');
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");

const router = express.Router();
let sock;

const connectBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("baileys_auth");
  sock = makeWASocket({ auth: state });

  // Hifadhi credentials kila mara inapobadilika
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
        : true;

      if (shouldReconnect) {
        console.log("🔁 Kuunganisha tena Pair Bot...");
        connectBot();
      } else {
        console.log("❌ Pair Bot imekatishwa.");
      }
    }

    if (connection === "open") {
      console.log("📞 Pair Bot imeunganishwa kikamilifu kwa kutumia namba ya simu!");
    }
  });

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    // Jibu la awali kwa ujumbe wowote
    await sock.sendMessage(msg.key.remoteJid, {
      text: "Hujambo! Nipo mbabe kupitia pairing ya simu. 🤖",
    });
  });
};

connectBot();

// Route ya kuthibitisha bot inafanya kazi
router.get('/', (req, res) => {
  res.send("✅ Pair Bot (kwa simu) inafanya kazi vizuri...");
});

module.exports = router;
