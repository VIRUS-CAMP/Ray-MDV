const express = require('express');
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');

const router = express.Router();
let sock;

const startQRBot = async () => {
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('baileys_qr_auth');

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      // Hifadhi QR code ndani ya fail kwa HTML kusoma
      fs.writeFileSync('./views/qr.txt', qr);
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
        : true;

      if (shouldReconnect) {
        console.log("🔁 Kuunganisha upya QR Bot...");
        startQRBot();
      } else {
        console.log("❌ Umeondolewa. QR Bot haitajiunganisha tena.");
      }
    }

    if (connection === 'open') {
      console.log("🤖 QR Bot imeunganishwa kikamilifu!");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    await sock.sendMessage(msg.key.remoteJid, {
      text: "Nipo mbabe kupitia QR pairing! 💪",
    });
  });
};

startQRBot();

// Route ya browser kuona QR
router.get('/', (req, res) => {
  const qrPath = path.join(__dirname, '../views/qr.txt');

  if (fs.existsSync(qrPath)) {
    const qrData = fs.readFileSync(qrPath, 'utf8');
    res.send(`
      <html>
      <head>
        <title>Mjeshi QR Bot</title>
        <meta http-equiv="refresh" content="10">
        <style>
          body { font-family: sans-serif; text-align: center; padding-top: 50px; }
          .card { background: white; padding: 20px; border-radius: 10px; max-width: 400px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>🤳 Changanua QR Code</h2>
          <p>Fungua WhatsApp > Linked Devices > Scan QR</p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=250x250" alt="Scan QR" />
          <p style="color: green;">QR inajirefresh kila sekunde 10</p>
        </div>
      </body>
      </html>
    `);
  } else {
    res.send(`
      <html><body><h3>🔄 Subiri... QR bado inatengenezwa.</h3></body></html>
    `);
  }
});

module.exports = router;
