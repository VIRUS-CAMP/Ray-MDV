const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const app = express();
dotenv.config();

const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'views'))); // kutumikia views

// Root test
app.get("/", (req, res) => {
  res.send("✅ Mjeshi Bot is alive");
});

// Pairing page (GET)
app.get('/pair', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pair.html'));
});

// Bot Controllers
app.use('/qr', require('./controllers/qrBot'));
app.use('/pair', require('./controllers/pairBot'));

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
