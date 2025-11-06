// receiver.js
import express from "express";
import bodyParser from "body-parser";
import { verifyHmac } from "./utils/hmac.js";

const app = express();
app.use(bodyParser.json({ verify: (req, res, buf) => (req.rawBody = buf) }));
console.log("🔑 Secret compartilhado:", process.env.WEBHOOK_SECRET);
console.log("🔑 Secret compartilhado:", process.env.SIGNATURE_HEADER);

app.post("/webhook", (req, res) => {

  console.log("headers:", req.headers);
  if (!verifyHmac(req,res)) {
    console.log("🚫 Assinatura inválida! Webhook rejeitado.");
    return res.status(403).send("Assinatura inválida");
  }
    
  console.log("📩 Webhook recebido!");
  console.log("Dados:", req.body);

  // Exemplo de ação: salvar, enviar e-mail, atualizar status, etc.
  // Aqui só confirmamos o recebimento
  res.status(200).send("Webhook recebido com sucesso!");
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Webhook receiver rodando em http://localhost:${PORT}`));