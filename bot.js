const express = require("express");
const Binance = require("node-binance-api");
const app = express();
app.use(express.json());

const binance = new Binance().options({
  APIKEY: process.env.BINANCE_API_KEY,
  APISECRET: process.env.BINANCE_API_SECRET
});

app.get("/", (req, res) => res.send("Bot Ayakta! 🚀"));

app.post("/trade", async (req, res) => {
    try {
        let { symbol } = req.body;
        if (!symbol) return res.status(400).send("Sembol yok");

        // Sembolü temizle (Örn: "BTC" -> "BTCUSDT")
        let cleanSymbol = symbol.replace(/[^a-zA-Z]/g, "").toUpperCase();
        if (!cleanSymbol.endsWith("USDT")) cleanSymbol += "USDT";

        console.log(`${cleanSymbol} için 15 USDT alım emri gönderiliyor...`);
        
        // 15 USDT'lik Cross Margin Market Alımı
        const order = await binance.mgMarketBuy(cleanSymbol, 15);
        res.json({ status: "SUCCESS", data: order });
    } catch (err) {
        console.error("Hata:", err.body || err.message);
        res.status(500).json({ status: "ERROR", message: err.message });
    }
});

app.listen(process.env.PORT || 8080);
