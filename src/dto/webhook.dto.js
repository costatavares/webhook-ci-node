import Joi from "joi";

export const webhookSchema = Joi.object({
  event: Joi.string()
    .valid("payment_success", "payment_failed", "refund_issued")
    .required()
    .messages({
      "any.required": "O campo 'event' é obrigatório.",
      "any.only": "O evento informado é inválido.",
    }),

  amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      "number.base": "O valor do campo 'amount' deve ser numérico.",
      "number.positive": "O valor do campo 'amount' deve ser positivo.",
      "any.required": "O campo 'amount' é obrigatório.",
    }),

  currency: Joi.string()
    .length(3)
    .uppercase()
    .valid("BRL", "USD", "EUR")
    .required()
    .messages({
      "string.base": "O campo 'currency' deve ser texto.",
      "string.length": "A moeda deve ter exatamente 3 letras (ex: BRL).",
      "any.only": "A moeda informada é inválida.",
    }),

  customer_email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "O campo 'customer_email' deve ser um e-mail válido.",
      "any.required": "O campo 'customer_email' é obrigatório.",
    }),
}).unknown(false); // permite outros campos extras, caso o provedor envie mais dados
