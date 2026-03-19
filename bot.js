const express = require("express");
const { Wallet } = require("ethers");
const axios = require("axios");

const app = express();
app.use(express.json());

const wallet = new Wallet(process.env.PK || process.env.PRIVATE_KEY);

app.post("/trade", async (req, res) => {
    try {
        // Make.com'dan gelen evrensel veriler
        const { tokenId, side, price } = req.body; 
        const size = "10"; // Sabit 10 dolarlık miktar

        // 1. İmzalanacak Mesajın Hazırlanması
        const timestamp = Math.floor(Date.now() / 1000);
        const message = `Polymarket Trade: ${side} ${size} of ${tokenId} at ${price}`;
        const signature = await wallet.signMessage(message);

        // 2. Polymarket CLOB (Merkezi Defter) API'ye Emir Gönderimi
        const response = await axios.post("https://clob.polymarket.com/order", {
            token_id: tokenId,
            price: price || "0.99", // Fiyat gelmezse en üstten alması için 0.99
            size: size,
            side: side, // BUY (Evet/Lehte) veya SELL (Hayır/Aleyhte)
            signature: signature,
            owner: wallet.address,
            timestamp: timestamp
        }, {
            headers: {
                'POLY-API-KEY': req.headers['poly-api-key'],
                'POLY-SECRET': req.headers['poly-secret'],
                'POLY-PASSPHRASE': req.headers['poly-passphrase']
            }
        });

        res.json({ status: "SUCCESS", data: response.data });
    } catch (err) {
        console.error("Hata Detayı:", err.response ? err.response.data : err.message);
        res.status(500).json({ status: "ERROR", message: err.response ? err.response.data : err.message });
    }
});
app.get("/", (req, res) => {
    res.send("Bot Aktif 🚀 Emirleri Bekliyorum...");
});
app.listen(process.env.PORT || 8080);
