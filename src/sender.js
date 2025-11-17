// sender.js
import url from "url";
import axios from "axios";
import { signature } from "./utils/hmac.js";

const WEBHOOK_URL = process.env.WEBHOOK_URL; // URL do receiver
const SIGNATURE_HEADER = process.env.SIGNATURE_HEADER;

export const  enviarWebhook= async () => {
  
  console.log("Enviando webhook para:", WEBHOOK_URL);

  const payload = JSON.stringify({
    event: "payment_success",
    amount: 120.00,
    currency: "BRL",
    customer_email: "cliente@exemplo.com",
  });

  const headers = {
    "Content-Type": "application/json",
    [SIGNATURE_HEADER]: `${signature(payload)}`,
  };

  try {
    await axios.post(WEBHOOK_URL, payload , { headers });
    console.log("✅ Webhook enviado com sucesso!");
  } catch (error) {
    // console.error(`❌ Erro ao enviar webhook: ${error.message}`);    
    console.error(`❌ Erro ao enviar webhook: ${error.message} - ${error.response.statusText}`);    
    console.error(`❌ Mensagem de retorno do webhook: ${error.response.data}`);    
  }
}

// enviarWebhook();

if (import.meta.url === url.pathToFileURL(process.argv[1]).href){
  console.log("Executando enviarWebhook diretamente...");
  enviarWebhook();
}
