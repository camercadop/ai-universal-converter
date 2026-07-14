# How to Run the REST API

This guide explains how to start the HTTP server and interact with the API endpoints.

---

## Prerequisites

- Node.js >= 22.x
- Dependencies installed (`npm install`)
- `.env` file configured with `OPENAI_API_KEY`

---

## Starting the Server

### Production Mode

```bash
npm run start:api
```

### Development Mode (with hot reload)

```bash
npm run dev:api
```

The server listens on `http://localhost:3000` by default. Override with the `PORT` environment variable.

---

## Endpoints

### Health Check

```bash
curl http://localhost:3000/api/health
```

Response:

```json
{ "status": "ok" }
```

### Chat

Send a natural language message and receive the assistant's response:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Convert 10 miles to kilometers"}'
```

Response:

```json
{ "response": "10 miles equals 16.09 kilometers." }
```

---

## Error Handling

Missing or invalid `message` field returns a 400 status:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{}'
```

```json
{ "error": "A \"message\" string field is required." }
```

---

## Environment Variables

| Variable | Effect |
|---|---|
| `OPENAI_API_KEY` | Required. Authenticates with OpenAI. |
| `OPENAI_MODEL` | Model to use (default: `gpt-4o-mini`). |
| `PORT` | Server port (default: `3000`). |
| `TRACE` | Set to `true` to print execution traces to stdout. |
