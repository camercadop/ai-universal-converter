# How to Run the CLI

This guide explains how to start and use the interactive command-line interface.

---

## Prerequisites

- Node.js >= 22.x
- Dependencies installed (`npm install`)
- `.env` file configured with `OPENAI_API_KEY`

---

## Starting the CLI

### Production Mode

```bash
npm start
```

### Development Mode (with hot reload)

```bash
npm run dev
```

---

## Usage

Once running, type natural language prompts and press Enter:

```
You: Convert 100 kilometers to miles.
Assistant: 100 kilometers equals 62.14 miles.
```

### Follow-Up Questions

The CLI maintains conversational context within a session:

```
You: Convert 5 gallons to liters.
Assistant: 5 gallons equals 18.93 liters.

You: Now multiply that by 3.
Assistant: 18.93 x 3 = 56.78 liters.
```

### Resetting the Session

Type `reset` to clear conversation history and start fresh:

```
You: reset
Session cleared.
```

---

## Environment Variables

| Variable | Effect |
|---|---|
| `OPENAI_API_KEY` | Required. Authenticates with OpenAI. |
| `OPENAI_MODEL` | Model to use (default: `gpt-4o-mini`). |
| `TRACE` | Set to `true` to print execution traces after each response. |
