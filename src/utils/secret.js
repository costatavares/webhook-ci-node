// utils/secret.js
import crypto from "crypto";

const secret = () =>{ 
    return crypto.randomBytes(32).toString("hex"); // 64 caracteres seguros
}
console.log(secret());
// export default secret;

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;  
export { WEBHOOK_SECRET };