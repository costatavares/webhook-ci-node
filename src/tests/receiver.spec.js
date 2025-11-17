import request from "supertest";
// import app from "../receiver.js";
import { signature } from "../utils/hmac.js";
import { afterEach, jest } from "@jest/globals";

// 🧱 Mock do axios
jest.mock("axios");

describe("Webhook receiver", () => {
  it("should pass basic test", () => {
    expect(true).toBe(true);
  });
});

describe("POST /webhook", () => {
  let app;
  let consoleErrorSpy; 
  let consoleLogSpy;
  
  beforeEach(() => {
    jest.clearAllMocks();

    // Espionar o console.error antes de cada teste
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restaurar o console.error original
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it("deve retornar 200 quando o webhook for recebido com sucesso", async () => {
    const SIGNATURE_HEADER = process.env.SIGNATURE_HEADER;
    const payload = JSON.stringify({ event: "payment_success", amount: 120.0, currency: "BRL", customer_email: "cliente@exemplo.com" });
    
    // Gera assinatura válida com o mesmo segredo do servidor
    const sig = signature(payload);

    app = (await import("../receiver.js")).default;
    
    const response = await request(app)
      .post("/webhook")
      .set("Content-Type", "application/json")
      .set(SIGNATURE_HEADER, sig,)
      .send(payload);

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Webhook recebido com sucesso!");
  });

  it("deve retornar 400 quando a assinatura for inválida", async () => {
    const SIGNATURE_HEADER = process.env.SIGNATURE_HEADER;
    const payload = JSON.stringify({ event: "payment_failed", amount: 120.0, currency: "BRL", customer_email: "cliente@exemplo.com" });
    
    app = (await import("../receiver.js")).default;

    const response = await request(app)
      .post("/webhook")
      .set("Content-Type", "application/json")
      .set(SIGNATURE_HEADER, "assinatura-falsa")
      .send(payload);

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("{\"error\":\"Erro na verificacao da assinatura\"}");
  });

  it("deve retornar 400 quando a assinatura não for enviada", async () => {
    const payload = JSON.stringify({ event: "payment_failed", amount: 120.0, currency: "BRL", customer_email: "cliente@exemplo.com" });
    
    const response = await request(app)
      .post("/webhook")
      .set("Content-Type", "application/json")
      .send(payload);

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("{\"error\":\"Cabeçalho de assinatura ausente!\"}");
  });

  it("deve retornar 400 quando parametro amount do body não for enviado", async () => {
    
    const SIGNATURE_HEADER = process.env.SIGNATURE_HEADER;
    const payload = JSON.stringify({ event: "payment_failed", currency: "BRL", customer_email: "cliente@exemplo.com" });
    
    // Gera assinatura válida com o mesmo segredo do servidor
    const sig = signature(payload);

    app = (await import("../receiver.js")).default;

    const response = await request(app)
      .post("/webhook")
      .set("Content-Type", "application/json")
      .set(SIGNATURE_HEADER, sig)
      .send(payload);

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("{\"error\":\"O campo 'amount' é obrigatório.\"}");
  });

  it("deve retornar 400 para dados invalidos", async () => {
    
    const SIGNATURE_HEADER = process.env.SIGNATURE_HEADER;
    const payload = JSON.stringify({ event: "payment_failed", amount: 120.0, currency: "BRL", customer_email: "cliente@exemplo.com" });
        
    // 🧱 Mock do webhook
    jest.mock("../dto/webhook.dto.js", () => ({
      webhookSchema: {
        validate: jest.fn().mockReturnValue({
          error: {
            details: []
          }
        })
      }
    }));
    
    // IMPORTA O MOD (webhookSchema) COM MOCK APLICADO
    const  {webhookSchema}  = await import("../dto/webhook.dto.js");
    
    // Gera assinatura válida com o mesmo segredo do servidor
    const sig = signature(payload);

    app = (await import("../receiver.js")).default;
    const response = await request(app)
      .post("/webhook")
      .set("Content-Type", "application/json")
      .set(SIGNATURE_HEADER, sig)
      .send(payload);

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("{\"error\":\"Dados inválidos\"}");
    expect(webhookSchema.validate).toHaveBeenCalledTimes(1);
    expect(webhookSchema.validate).toHaveBeenCalledWith(JSON.parse(payload), { abortEarly: true });

  });
});