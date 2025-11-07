// receiver.js
import express from "express";
import bodyParser from "body-parser";
import { verifyHmac } from "./utils/hmac.js";

const app = express();
app.use(bodyParser.json({ verify: (req, res, buf) => (req.rawBody = buf) }));
console.log("🔑 Secret compartilhado:", process.env.WEBHOOK_SECRET);
console.log("🔑 Secret compartilhado:", process.env.SIGNATURE_HEADER);

app.post("/webhook", (req, res) => {
  try {
     verifyHmac(req,res); 
    
    console.log("📩 Webhook recebido!")
    // Exemplo de ação: salvar, enviar e-mail, atualizar status, etc.
    // Aqui só confirmamos o recebimento
    res.status(200).send("Webhook recebido com sucesso!");  
  } catch (error) {
    return res.status(403).send(error.message);
  }
  

});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Webhook receiver rodando em http://localhost:${PORT}`));