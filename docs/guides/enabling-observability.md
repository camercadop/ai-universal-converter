# How to Enable Observability

This guide explains how to enable runtime tracing and interpret the output.

---

## Enabling Traces

Set the `TRACE` environment variable to `true`:

```bash
TRACE=true npm run dev
```

Or add it to your `.env` file:

```
TRACE=true
```

---

## Reading Trace Output

After each request, a trace is printed to the console:

```
┌ Trace a1b2c3d4
├─ OpenAI Chat (420ms)
├─ convertVolume (2ms) -> 7.40
├─ calculate (1ms) [cached] -> 111000
├─ OpenAI Chat (380ms)
└ Total: 803ms | 275 tokens (180 prompt, 95 completion) | 2 tool calls | 1 cache hits
```

### Trace Components

| Element | Description |
|---|---|
| Trace ID | Unique identifier for the request lifecycle. |
| OpenAI Chat | Each round-trip to the LLM with its latency. |
| Tool calls | Each tool execution with latency and result. `[cached]` indicates a cache hit. |
| Total | Aggregate latency, token usage, tool call count, and cache statistics. |

---

## What Gets Tracked

- Per-request execution trace with step-by-step breakdown
- Latency for each LLM call and tool execution
- Token usage (prompt / completion / total) across all LLM round-trips
- Per-tool statistics: call count, average latency, cache hit ratio, failure rate

---

## When to Use

- Debugging unexpected tool selections or chaining behavior
- Measuring token consumption for cost optimization
- Identifying slow tool executions or redundant LLM calls
- Verifying that caching is working for repeated inputs
