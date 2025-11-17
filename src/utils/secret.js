// utils/secret.js
import url from "url";
import crypto from "crypto";

const secret = () =>{ 
    return crypto.randomBytes(32).toString("hex"); // 64 caracteres seguros
}

if(import.meta.url === url.pathToFileURL(process.argv[1]).href){
    console.log("Executando função para gerar o segredo usado para gerar e validar a assinatura HMAC");
    console.log(secret());
}

// export default secret;

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;  
export { WEBHOOK_SECRET };


