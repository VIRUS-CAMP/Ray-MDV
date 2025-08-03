const express = require('express');
const dotenv = require('dotenv');
const app = express();
dotenv.config();

const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("✅ Mjeshi Bot is alive");
});

app.use('/qr', require('./controllers/qrBot'));
app.use('/pair', require('./controllers/pairBot'));

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
