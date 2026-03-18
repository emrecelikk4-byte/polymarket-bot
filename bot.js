const express = require("express");
const { Wallet } = require("ethers");

const app = express();
app.use(express.json());

// Loglarda ne olup bittiğini görmek için kontrol
console.log("Sistem baslatiliyor...");
console.log("Mevcut Degiskenler:", Object.keys(process.env).filter(k => k === "PRIVATE_KEY"));

let wallet = null;
const rawKey = process.env.PRIVATE_KEY;

if (rawKey && rawKey.length > 10) {
    try {
        const cleanKey = rawKey.trim().replace(/^["']|["']$/g, '');
        const finalKey = cleanKey.startsWith("0x") ? cleanKey : "0x" + cleanKey;
        wallet = new Wallet(finalKey);
        console.log("✅ CUZDAN BASARIYLA BAGLANDI: " + wallet.address);
    } catch (e) {
        console.error("❌ ANAHTAR FORMATI HATALI: " + e.message);
    }
} else {
    console.error("❌ KRITIK HATA: PRIVATE_KEY degiskeni bos veya cok kisa!");
}

app.get("/", (req, res) => {
    if (wallet) {
        res.send(`Bot Aktif 🚀 Adres: ${wallet.address}`);
    } else {
        res.send(`Bot calisiyor ama anahtar okunmadi! Sistemdeki anahtar uzunlugu: ${rawKey ? rawKey.length : 0}`);
    }
});

app.post("/trade", async (req, res) => {
    if (!wallet) return res.status(500).json({ error: "Cuzdan yuklu degil" });
    try {
        const signature = await wallet.signMessage(JSON.stringify(req.body));
        res.json({ status: "ok", signature, address: wallet.address });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sunucu ${PORT} portunda hazir.`);
});
