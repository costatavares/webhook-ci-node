/**
 * @jest-environment node
 */

import url from "url";
import path from "path";
import { afterEach, jest } from "@jest/globals";

describe("Generates cryptographically", () => {
    let mod;
    const originalArg1 = process.argv[1];
    const absolutePath = path.resolve("src/utils/secret.js");
    const moduleURL = url.pathToFileURL(absolutePath).href;

    beforeEach(async () => {
        jest.resetModules();
        // simula execução direta do arquivo
        process.argv[1] = absolutePath;      
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        jest.restoreAllMocks();
        process.argv[1] = originalArg1;
    });

    it("deve retornar uma chave secreta para geração e validação da assinatura HMAC", async () => {
        
        const randomBytesMock = "141316a3878587c328a7eb2d8c0afb30e75da96501022ec95e1240a3cda91938";
        
        process.env.WEBHOOK_SECRET = randomBytesMock;

        // 🧱 Mock do crypto
        jest.mock("crypto",() => ({
            randomBytes: jest.fn().mockReturnValue(randomBytesMock)
        }));

        const crypto = await import("crypto");
        
        // IMPORTA O MOD COM MOCK APLICADO
        mod = await import(moduleURL);

        const retorno = crypto.randomBytes.mock.results[0].value;

        expect(retorno).toBe(randomBytesMock);
        expect(crypto.randomBytes).toHaveBeenCalledTimes(1);
        expect(crypto.randomBytes).toHaveBeenCalledWith(32);
        expect(mod.WEBHOOK_SECRET).toBe(randomBytesMock);
    });
});