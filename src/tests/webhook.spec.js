/**
 * @jest-environment node
 */

import { afterEach, jest } from '@jest/globals';
import path from 'path';
import url from 'url';
import request from 'supertest';

describe('Webhook - erro 403 simulado com mock', () => {
  let app;
  let consoleErrorSpy;
  let consoleLogSpy;
  let validateRequestWebhookMock;
  const absolutePath = path.resolve('src/validate/validate.js');
  const moduleURL = url.pathToFileURL(absolutePath).href;

  beforeAll(async () => {
    jest.resetModules();

    // Espionar o console.error antes de cada teste
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation((msg) => {
      if (msg.includes('🚀 Webhook receiver rodando em http://localhost:3000')) {
        return;
      }
      process.stdout.write(msg + '\n');
    });

    jest.mock(moduleURL, () => ({
      validateRequestWebhook: jest.fn(),
    }));

    validateRequestWebhookMock = await import(moduleURL);
  });

  afterAll(() => {
    // Restaurar o console.error original
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    jest.restoreAllMocks();
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('deve retornar 403 quando validateRequestWebhook lança erro', async () => {
    validateRequestWebhookMock.validateRequestWebhook.mockImplementation(() => {
      throw new Error('Assinatura inválida!');
    });

    app = (await import('../receiver.js')).default;

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const response = await request(app)
      .post('/webhook')
      .set('Content-Type', 'application/json')
      .send({ event: 'payment_success' });

    expect(response.text).toContain('Assinatura inválida!');
    expect(response.status).toBe(403);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Erro ao processar webhook:',
      expect.any(Error),
    );

    // verificar o conteúdo do erro
    const [prefixo, erro] = consoleErrorSpy.mock.calls[0];
    expect(prefixo).toBe('❌ Erro ao processar webhook:');
    expect(erro.message).toBe('Assinatura inválida!');
    consoleSpy.mockRestore();
  });
});

describe('enviarWebhook executado automaticamente', () => {
  const originalArg1 = process.argv[1];

  const absolutePath = path.resolve('src/sender.js');
  const moduleURL = url.pathToFileURL(absolutePath).href;

  const validatePath = path.resolve('src/validate/validate.js');
  const moduleVakidateURL = url.pathToFileURL(validatePath).href;

  beforeEach(async () => {
    jest.resetModules();
    process.env.WEBHOOK_URL = 'http://localhost:3000/webhook';

    // simula execução direta do arquivo
    process.argv[1] = absolutePath;

    jest.mock(moduleVakidateURL, () => ({
      validateRequestWebhook: jest.fn(),
    }));

    await import(moduleVakidateURL);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    process.argv[1] = originalArg1;
  });

  it('deve chamar enviarWebhook com mock retornando sucesso', async () => {
    // 🧱 Mock do axios
    jest.mock('axios', () => ({
      post: jest.fn().mockReturnValue({
        status: 200,
        data: {
          status: 200,
          message: 'Webhook recebido com sucesso!',
        },
      }),
    }));
    const axios = await import('axios');

    // IMPORTA O MOD COM MOCK APLICADO
    await import(moduleURL);

    const retorno = axios.post.mock.results[0].value;

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(retorno.status).toEqual(200);
    expect(retorno.data).toEqual({ message: 'Webhook recebido com sucesso!', status: 200 });
  });
});
