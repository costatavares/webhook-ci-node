import axios from "axios";
import { signature } from "../utils/hmac.js";
import { jest } from "@jest/globals";
import { enviarWebhook } from "../sender.js";
import app from "../receiver.js";

// 🧱 Mock do axios
jest.mock("axios");

describe("Sender Webhook", () => {
    
    let consoleErrorSpy; 
    let consoleLogSpy;

    beforeAll(() => {
        process.env.WEBHOOK_URL = "http://localhost:3000/webhook";        
    });

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
        jest.restoreAllMocks();
    });

    it("deve enviar o webhook com sucesso", async () => {
        const SIGNATURE_HEADER = process.env.SIGNATURE_HEADER;
                
        const payload = JSON.stringify({
            event: "payment_success",
            amount: 120.00,
            currency: "BRL",
            customer_email: "cliente@exemplo.com",
        });

        // Gera assinatura válida com o mesmo segredo do servidor
        const sig = signature(payload);
        
        // 🔹 Simula resposta do receiver
        axios.post = jest.fn().mockResolvedValueOnce({
            status: 200,
            data: "Webhook recebido com sucesso!",            
        });

        // 🔹 Espiona o console
        const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

        await enviarWebhook();

        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, body, options] = axios.post.mock.calls[0];
               
        // 🔹 Verifica os parâmetros da chamada
        expect(url).toBe(process.env.WEBHOOK_URL);
        expect(typeof body).toBe("string"); 
        expect(body).toBe(payload); 
        expect(options.headers[SIGNATURE_HEADER]).toBe(sig);
        // process.exit(1);

        consoleLogSpy.mockRestore();
    });

    it("deve tratar erro ao enviar webhook", async () => {
        axios.post.mockRejectedValueOnce({
            message: "Falha de rede",
            response: { statusText: "Bad Request", data: "Assinatura inválida" },
        });

        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        await enviarWebhook();

        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("❌ Erro ao enviar webhook")
        );

        consoleErrorSpy.mockRestore();
    });
});

describe("Mockando /webhook", () => {
    
    let consoleErrorSpy;
    let consoleLogSpy;
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Espionar o console.error antes de cada teste
        consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });
    beforeAll(() => {
    // Substitui a implementação real da rota
        jest.spyOn(app, "post").mockImplementation((path) => {
        console.error("Mockando rota POST:", path);
        if (path === "/webhook") {
                app._router.stack.push({
                    route: {
                        path,
                        methods: { post: true },
                        stack: [
                        {
                            handle: (req, res) => {
                            return res.status(403).send("Assinatura inválida!");
                            },
                        },
                        ],
                    },
                });
            }
        });

    });

    afterEach(() => {
        // Restaurar o console.error original
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

  it("deve simular erro 403", async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        status: 403,
        statusText: "Forbidden",
        data: "Assinatura inválida!",
      },
      message: "Request failed with status code 403",
    });

    await enviarWebhook();
    
    const [url] = axios.post.mock.calls[0];
    console.error("options:", axios.post.mock.results[0].value);
        
    // 🔹 Verifica os parâmetros da chamada
    expect(url).toBe(process.env.WEBHOOK_URL);
    expect(axios.post).toHaveBeenCalledTimes(1);

  });
});
