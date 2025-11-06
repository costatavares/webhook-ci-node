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

const verifyHmac = (req) => {
  const signatureHeader = req.headers[SIGNATURE_HEADER];
  if (!signatureHeader) return false;

  // Calcula o HMAC com base no corpo original da requisição
  const computedSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest("hex");

  // Comparação segura (evita ataques de timing)
  return crypto.timingSafeEqual(
    Buffer.from(signatureHeader, "hex"),
    Buffer.from(computedSignature, "hex")
  );
}

// Gera assinatura HMAC SHA256
const signature = (payload) => { 
    return crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex");
}

export { verifyHmac, signature };