const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const router = express.Router();

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "qr-session" }),
  puppeteer: { headless: true }
});

client.on('qr', async (qr) => {
  const qrImage = await qrcode.toDataURL(qr);
  router.get('/', (req, res) => {
    res.send(`<img src="${qrImage}" />`);
  });
});

client.on('ready', () => {
  console.log('🟢 QR Bot is ready');
});

client.initialize();

module.exports = router;
