import express from 'express';
import bodyParser from 'body-parser';
import { validateRequestWebhook } from '#validate/validate.js';

const app = express();
app.use(bodyParser.json({ verify: (req, res, buf) => (req.rawBody = buf) }));
console.log('🔑 Assiantura header:', process.env.SIGNATURE_HEADER);

app.post('/webhook', (req, res) => {
  try {
    const result = validateRequestWebhook(req);
    console.log('🔍 Resultado da validação:', result);

    if (!result?.isValid) {
      return res.status(400).json({ error: result.message });
    }

    // Aqui só confirmamos o recebimento
    console.log('📩 Webhook recebido!');
    res.status(200).json({ status: 200, message: 'Webhook recebido com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return res.status(403).send(error.message);
  }
});

// exportar o app para os testes
export default app;
