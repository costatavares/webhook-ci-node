# 🚀 Webhook com Assinatura HMAC — Exemplo Completo

## 📘 Visão Geral

Este projeto demonstra como **criar, assinar e validar Webhooks com HMAC** para garantir a **autenticidade e integridade das mensagens**.  
Também mostra como **testar localmente com o ngrok** e **integrar com o GitHub Webhooks**.

---

## 📚 Sumário

- [O que é Webhook](#-o-que-é-webhook)
- [O que é Assinatura HMAC](#-o-que-é-assinatura-hmac)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Configuração do .env](#-configuração-do-env)
- [Instalação](#-instalação)
- [Como Funciona](#-como-funciona)
- [Testando com Ngrok](#-testando-com-ngrok)
- [Configurando o Webhook no GitHub](#-configurando-o-webhook-no-github)
- [Fluxo Completo](#-fluxo-completo)
- [Segurança](#-segurança)
- [Tecnologias](#-tecnologias)
- [Conclusão](#-conclusão)

---

## 🌐 O que é Webhook

Um **webhook** é uma maneira de uma aplicação **notificar outra aplicação** em tempo real quando um evento ocorre.  
Ele envia automaticamente uma requisição HTTP (`POST`) para uma URL configurada.

📦 **Exemplo:**
> Quando um deploy ocorre, o GitHub envia uma notificação (webhook) para seu servidor com detalhes do evento.

---

## 🔐 O que é Assinatura HMAC

Para garantir que a mensagem **não foi alterada** e **veio de uma fonte confiável**, usamos uma **assinatura HMAC (Hash-based Message Authentication Code)**.

📘 O remetente (ex: GitHub) gera um hash com base no `SECRET` e no conteúdo do payload:
```
assinatura = HMAC_SHA256(SECRET, corpo_do_payload)
```
O receptor refaz o cálculo e compara. Se as assinaturas baterem, o conteúdo é confiável.

---

## 🧩 Estrutura do Projeto

```bash
📁 webhook-hmac/
├── sender.js         # Simula o envio de um webhook (GitHub fake)
├── receiver.js       # Recebe e valida a assinatura HMAC
├── .env              # Variáveis de ambiente
└── README.md         # Este arquivo
```

---

## ⚙️ Configuração do `.env`

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
# URL que receberá os webhooks (ex: gerada pelo ngrok)
WEBHOOK_URL=http://localhost:3000/webhook

# Segredo usado para gerar e validar a assinatura HMAC
WEBHOOK_SECRET=meu-super-segredo

# Nome do header usado para enviar a assinatura
SIGNATURE_HEADER=x-webhook-signature
```

---

## 💾 Instalação

```bash
npm install axios express crypto dotenv
```

---

## 🧠 Como Funciona

### 📨 Enviando um Webhook (`sender.js`)

```js
import dotenv from "dotenv";
import axios from "axios";
import crypto from "crypto";

dotenv.config();

const { WEBHOOK_URL, WEBHOOK_SECRET, SIGNATURE_HEADER } = process.env;

function generateSignature(payload) {
  return crypto.createHmac("sha256", WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex");
}

async function sendWebhook() {
  const payload = { event: "deploy", status: "success" };

  const headers = {
    "Content-Type": "application/json",
    [SIGNATURE_HEADER]: generateSignature(payload),
  };

  await axios.post(WEBHOOK_URL, payload, { headers });
  console.log("✅ Webhook enviado com sucesso!");
}

sendWebhook();
```

### 🧾 Recebendo e Validando (`receiver.js`)

```js
import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json({ type: "*/*" }));

const { WEBHOOK_SECRET, SIGNATURE_HEADER } = process.env;

app.post("/webhook", (req, res) => {
  const signature = req.headers[SIGNATURE_HEADER.toLowerCase()];
  const computed = crypto.createHmac("sha256", WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (signature !== computed) {
    console.log("❌ Assinatura inválida!");
    return res.status(401).send("Assinatura inválida!");
  }

  console.log("✅ Webhook recebido e verificado com sucesso!");
  console.log("📦 Payload:", req.body);

  res.status(200).send("OK");
});

app.listen(3000, () => console.log("🚀 Webhook receiver rodando na porta 3000"));
```

---

## 🌍 Testando com Ngrok

O GitHub não pode enviar webhooks diretamente para `localhost`.  
Use o **ngrok** para criar um túnel público até sua máquina.

### 1️⃣ Instalar o ngrok
Baixe e instale em [https://ngrok.com/download](https://ngrok.com/download).

### 2️⃣ Rodar o servidor local
```bash
node receiver.js
```

### 3️⃣ Criar túnel
```bash
ngrok http 3000
```
Copie a URL gerada, ex:
```
https://a1b2c3d4.ngrok.io
```

---

## ⚙️ Configurando o Webhook no GitHub

1. Vá até **Settings → Webhooks → Add webhook**  
2. Em **Payload URL**, cole a URL do ngrok + `/webhook`  
   Exemplo:
   ```
   https://a1b2c3d4.ngrok.io/webhook
   ```
3. Em **Content type**, selecione `application/json`
4. Em **Secret**, use o mesmo valor de `WEBHOOK_SECRET`
5. Clique em **Add Webhook**

Agora, ao fazer um push ou PR, o GitHub enviará o evento assinado para seu endpoint.

---

## 🧱 Fluxo Completo

1️⃣ `receiver.js` escuta `http://localhost:3000/webhook`  
2️⃣ `ngrok` cria túnel público → `https://xxxx.ngrok.io/webhook`  
3️⃣ GitHub envia eventos autenticados  
4️⃣ Servidor valida assinatura HMAC  
5️⃣ Payload processado com segurança ✅

---

## 🔒 Segurança

- **Nunca exponha seu `WEBHOOK_SECRET`**
- Gere segredos fortes:
  ```bash
  openssl rand -hex 32
  ```
- Sempre valide a assinatura antes de processar o payload.
- Use HTTPS (o ngrok já fornece).

---

## 🧰 Tecnologias

- Node.js + Express  
- Crypto (HMAC SHA256)  
- Axios  
- Ngrok  
- GitHub Webhooks

---

## ✅ Conclusão

Com esse projeto, você tem uma base sólida para trabalhar com **webhooks seguros**, validados por **HMAC**, testáveis localmente via **ngrok**, e compatíveis com integrações de alto nível como o **GitHub Webhooks**.

---

🧑‍💻 Criado com ❤️ por *Anderson Costa*  
