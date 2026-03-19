const express = require("express");
const { Wallet } = require("ethers");

const app = express();
app.use(express.json());

// ANAHTARI TEMİZLEME VE DOĞRULAMA
const getWallet = () => {
    try {
        // Değişken ismini 'PK' olarak kısalttık, çakışma olmasın diye
        let key = process.env.PK || ""; 
        key = key.trim().replace(/["']/g, ""); // Tırnakları temizle
        
        if (!key) return null;
        if (!key.startsWith("0x") && key.length === 64) key = "0x" + key;
        
        return new Wallet(key);
    } catch (e) {
        return null;
    }
};

const wallet = getWallet();

app.get("/", (req, res) => {
    const rawKey = process.env.PK || "";
    if (wallet) {
        res.send(`<h1>Bot Hazır ✅</h1><p>Cüzdan Adresi: ${wallet.address}</p>`);
    } else {
        res.send(`<h1>Hata ❌</h1><p>Gelen Anahtar Uzunluğu: ${rawKey.length}</p><p>Gelen Veri (İlk 3 hane): ${rawKey.substring(0, 3)}</p>`);
    }
});

app.post("/trade", async (req, res) => {
    if (!wallet) return res.status(500).json({ error: "Cüzdan yüklenemedi" });
    try {
        const signature = await wallet.signMessage(JSON.stringify(req.body));
        res.json({ status: "ok", signature });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => console.log(`Sunucu ${PORT} portunda aktif.`));
