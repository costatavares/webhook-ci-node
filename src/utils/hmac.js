// 🔒 Dica pro nível profissional

// Quando for usar HMAC em produção (Stripe, GitHub, etc.):
// Cada serviço envia a assinatura num header próprio:

//  Stripe → Stripe-Signature
// const signatureHeader = req.headers["stripe-signature"]

//  GitHub → X-Hub-Signature-256
// const signatureHeader = req.headers["x-hub-signature-256"]

//  Mercado Pago → X-Hub-Signature
// const signatureHeader = req.headers["x-hub-signature"]

// A lógica de validação é a mesma, só muda o nome do header.


import crypto from "crypto";
const  WEBHOOK_SECRET  = process.env.WEBHOOK_SECRET;
const SIGNATURE_HEADER = process.env.SIGNATURE_HEADER;

/**
 * Verifica a assinatura HMAC do webhook.
 * @param {Object} req - objeto da requisição.
 * @param {Buffer} rawBody - Corpo bruto da requisição.
 * @param {string} secret - Chave secreta para validar.
 * @returns {{ isValid: boolean, message?: string }}
 */

const verifyHmac = (req) => {
  try { 
    const signatureHeader = req.headers[SIGNATURE_HEADER];
    
    if (!signatureHeader) {
      console.error("❌ Cabeçalho de assinatura ausente!" , );
      return { isValid: false, message: "Cabeçalho de assinatura ausente!" };
    }

    // Remove o prefixo "sha256=" se existir
    const signature = signatureHeader.replace("sha256=", "");

    // Calcula o HMAC com base no corpo original da requisição
    console.log("Corpo bruto da requisição:", req.rawBody.toString());
    const computedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(req.rawBody)
      .digest("hex");

    console.log("Assinatura recebida:", signature);
    console.log("Assinatura computada:", computedSignature);  

    // Comparação segura (evita ataques de timing)
    return { 
      isValid: !crypto.timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(computedSignature, "hex")
      )  
    };

  } catch (err) {
    console.error("Erro ao validar assinatura:", err.message);
    return { isValid: false, message: "Erro na verificacao da assinatura" };
  }
}

/**
 * Gera assinatura HMAC SHA256.
 * @param {object} payload - Corpo recebido do webhook.
 * @returns {string} - Assinatura HMAC em hexadecimal.
 */
const signature = (payload) => { 
  return crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex");
}

export { verifyHmac, signature };