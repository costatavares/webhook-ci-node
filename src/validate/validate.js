import { verifyHmac } from "../utils/hmac.js";
import { webhookSchemaValidate } from "../validate/webhookSchema.validate.js";

/**
 * Valida a requisição recebida no endpoint do webhook.
 * 
 * Esta função executa duas validações principais:
 * 1. 🔐 Verifica a assinatura HMAC da requisição para garantir que o conteúdo
 *    veio de uma fonte confiável.
 * 2. 📦 Valida o corpo (payload) da requisição de acordo com o schema definido (DTO).
 * 
 * Se alguma das validações falhar, retorna um objeto contendo `{ isValid: false, message }`.
 * Caso ambas passem, retorna `{ isValid: true }`.
 * 
 * @param {import("express").Request} req - Objeto de requisição Express contendo headers e body.
 * @returns {{ isValid: boolean, message?: string }} Resultado da validação.
 */

export const validateRequestWebhook = (req) => {
  const hmac = verifyHmac(req);
  if (!hmac.isValid){ return hmac}

  const schema = webhookSchemaValidate(req.body);
  if (!schema.isValid) {return schema}

  return { isValid: true };
};