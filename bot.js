const express = require("express");
const { Wallet } = require("ethers");

const app = express();
app.use(express.json());

// Çökmeyi engelleyen anahtar yükleyici
let wallet = null;
const rawKey = process.env.PRIVATE_KEY;

if (rawKey) {
    try {
        // Anahtarı temizle (Boşlukları ve tırnakları sil)
        const cleanKey = rawKey.trim().replace(/^["']|["']$/g, '');
        // Başına 0x ekle (yoksa)
        const finalKey = cleanKey.startsWith("0x") ? cleanKey : "0x" + cleanKey;
        wallet = new Wallet(finalKey);
        console.log("✅ Cüzdan Hazır: " + wallet.address);
    } catch (e) {
        console.error("❌ HATA: Anahtar formatı yanlış! " + e.message);
    }
} else {
    console.error("❌ HATA: PRIVATE_KEY değişkeni bulunamadı!");
}

app.get("/", (req, res) => {
    if (wallet) {
        res.send("Bot Aktif 🚀 Adres: " + wallet.address);
    } else {
        res.status(500).send("Bot Çalışmıyor: Anahtar Sorunu!");
    }
});

app.post("/trade", async (req, res) => {
    if (!wallet) return res.status(500).json({ error: "Cüzdan yüklü değil" });
    try {
        const message = JSON.stringify(req.body);
        const signature = await wallet.signMessage(message);
        res.json({ status: "ok", signature: signature, address: wallet.address });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} üzerinde çalışıyor.`));
