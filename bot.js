const express = require("express");
const { Wallet } = require("ethers");

const app = express();
app.use(express.json());

// Cüzdanı yükle
let wallet = null;
const rawKey = process.env.PRIVATE_KEY;

if (rawKey) {
    try {
        const cleanKey = rawKey.trim().replace(/^["']|["']$/g, '');
        const finalKey = cleanKey.startsWith("0x") ? cleanKey : "0x" + cleanKey;
        wallet = new Wallet(finalKey);
        console.log("✅ Cüzdan Hazır: " + wallet.address);
    } catch (e) {
        console.error("❌ Cüzdan Hatası: " + e.message);
    }
}

// ANA SAYFA (Tarayıcıda göreceğin yer)
app.get("/", (req, res) => {
    res.status(200).send(wallet ? `Bot Aktif 🚀 Adres: ${wallet.address}` : "Bot calisiyor ama anahtar eksik!");
});

// İŞLEM NOKTASI
app.post("/trade", async (req, res) => {
    if (!wallet) return res.status(500).json({ error: "Cüzdan yüklü değil" });
    try {
        const signature = await wallet.signMessage(JSON.stringify(req.body));
        res.json({ status: "ok", signature: signature, address: wallet.address });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// RAILWAY İÇİN KRİTİK PORT AYARI
const PORT = process.env.PORT || 8080; // Railway 8080 portunu sever
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sunucu ${PORT} portunda ve 0.0.0.0 arayüzünde dinliyor.`);
});
