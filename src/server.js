import app from "./receiver.js";

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Webhook receiver rodando em http://localhost:${PORT}`);
});