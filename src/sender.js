// sender.js
import axios from "axios";
import { signature } from "./utils/hmac.js";

const WEBHOOK_URL = process.env.WEBHOOK_URL; // URL do receiver
const SIGNATURE_HEADER = process.env.SIGNATURE_HEADER;

const  enviarWebhook= async () => {
  
  console.log("Enviando webhook para:", WEBHOOK_URL);

  const payload = {
    event: "payment_success",
    amount: 120.00,
    currency: "BRL",
    customer_email: "cliente@exemplo.com",
  };

  const headers = {
    "Content-Type": "application/json",
    [SIGNATURE_HEADER]: signature(payload),
  };

  try {
    const response = await axios.post(WEBHOOK_URL, payload , { headers });
    console.log("✅ Webhook enviado com sucesso!");
    console.log("Resposta do receiver:", response.data);
  } catch (error) {
    console.error("❌ Erro ao enviar webhook:", error.message);
  }
}

enviarWebhook();
