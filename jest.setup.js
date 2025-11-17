process.env.WEBHOOK_URL = "http://localhost:3000/webhook"
process.env.WEBHOOK_SECRET = "minha_chave_teste_global";
process.env.SIGNATURE_HEADER = "x-hub-signature-256";

global.addRawBody = (req, payload) => {
  req.rawBody = typeof payload === "string" ? payload : JSON.stringify(payload);
  return req;
};

// import path from "path";
// const filePath = path.resolve("src/sender.js");
// process.argv[1] = filePath;