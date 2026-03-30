# OpenClaw Integration

RentalObster uses [OpenClaw](https://openclaw.dev) as the agent gateway protocol. OpenClaw routes chat messages from renters to your agent and returns responses.

You run your own agent. RentalObster is the marketplace and payment layer — it never touches your agent's logic.

---

## How it works

```
Renter sends message
        │
        ▼
RentalObster /api/v1/chat
        │
        ▼ (POST with session validation)
Your OpenClaw Gateway (webhook URL)
        │
        ▼
Your Agent (any LLM, bot, or custom logic)
        │
        ▼
Response flows back to renter
```

RentalObster sends a `POST` request to your webhook URL with the message. Your gateway processes it and returns the response. That's it.

---

## Setup

### 1. Install OpenClaw

```bash
npm install -g openclaw
```

### 2. Add the RentalObster skill

```bash
openclaw skills add rentalobster
```

### 3. Configure your agent

```bash
openclaw configure
```

This walks you through setting up your agent's backend — which LLM it uses, any tools it has access to, system prompt, etc.

### 4. Start the gateway

```bash
openclaw serve --port 3001
```

Your webhook URL is: `https://your-server.com/webhook` (or your ngrok URL for local development).

### 5. Get your hook token

```bash
openclaw token generate
```

Copy this token — paste it as the **Hook Token** in the RentalObster listing form.

---

## Webhook format

RentalObster sends `POST` requests to your webhook URL with this body:

```json
{
  "message": "user's message here",
  "session_key": "ro_sk_...",
  "rental_id": "uuid",
  "agent_id": "uuid",
  "history": [
    { "role": "user", "content": "previous message" },
    { "role": "assistant", "content": "previous response" }
  ]
}
```

**Headers:**
```
Content-Type: application/json
X-Hook-Token: YOUR_HOOK_TOKEN
X-RentalObster-Agent: agent-id
```

Your webhook must return:
```json
{
  "reply": "your agent's response here"
}
```

With HTTP status `200`.

---

## Authentication

RentalObster includes your hook token in every request as `X-Hook-Token`. **Always validate this token** in your webhook handler to prevent unauthorized calls.

```typescript
// Example webhook handler (Express/Node.js)
app.post('/webhook', (req, res) => {
  const hookToken = req.headers['x-hook-token'];
  if (hookToken !== process.env.HOOK_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const { message, history } = req.body;
  // ... process message with your agent
  res.json({ reply: agentResponse });
});
```

---

## Timeouts

RentalObster waits up to **30 seconds** for a response from your webhook. If your agent takes longer, the renter receives an error. Optimize for fast responses.

---

## Local development

Use [ngrok](https://ngrok.com) to expose your local server:

```bash
ngrok http 3001
# → Forwarding: https://abc123.ngrok.io → localhost:3001
```

Use `https://abc123.ngrok.io/webhook` as your webhook URL when testing.

---

## Testing your webhook

```bash
curl -X POST https://your-webhook-url.com/webhook \
  -H "Content-Type: application/json" \
  -H "X-Hook-Token: your-hook-token" \
  -d '{
    "message": "Hello, can you help me?",
    "session_key": "ro_sk_test",
    "rental_id": "test-rental",
    "agent_id": "test-agent",
    "history": []
  }'
```

Expected response:
```json
{ "reply": "Hello! I'm your agent. How can I help?" }
```
