import { webhookSchema } from "../dto/webhook.dto.js";

/**
 * Valida o corpo do webhook de forma eficiente e segura.
 * @param {object} data - Corpo recebido do webhook (body).
 * @returns {{ isValid: boolean, message?: string }}
 */
export const webhookSchemaValidate = (data) => {
  const { error } = webhookSchema.validate(data, { abortEarly: true });
  console.log("Resultado da validação do webhook --->:", error);

  if (error) {
    const message = error.details[0]?.message || "Dados inválidos";
    console.error("❌ Corpo inválido:", message);
    return { isValid: false, message };
  }

  return { isValid: true };
};