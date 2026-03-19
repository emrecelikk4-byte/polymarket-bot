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
        const cleanSymbol = symbol.replace(/\s+/g, '').toUpperCase() + "USDT";
        console.log(`İşlem: ${cleanSymbol}`);
        
        // 15 dolarlık market alımı (Cross Margin)
        const order = await binance.mgMarketBuy(cleanSymbol, 15);
        res.json({ status: "SUCCESS", data: order });
    } catch (err) {
        console.error("Hata:", err.message);
        res.status(500).json({ status: "ERROR", message: err.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server ${PORT} portunda aktif.`));
