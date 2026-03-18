const express = require("express");
const { Wallet } = require("ethers");

const app = express();
app.use(express.json());

const wallet = new Wallet(process.env.PRIVATE_KEY);

app.get("/", (req, res) => {
  res.send("bot çalışıyor 🚀");
});

app.post("/trade", async (req, res) => {
  const data = req.body;

  const message = JSON.stringify(data);
  const signature = await wallet.signMessage(message);

  res.json({
    status: "ok",
    signature: signature,
    address: wallet.address
  });
});

app.listen(3000, () => console.log("çalışıyor"));
