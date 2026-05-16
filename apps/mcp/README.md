# quickhelp.dev MCP Server

An MCP server exposing all quickhelp.dev tools via stdio or HTTP.

## Claude Desktop config

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "quickhelp": {
      "command": "node",
      "args": ["/path/to/no_work/apps/mcp/dist/index.js"]
    }
  }
}
```

## Run locally

```bash
pnpm install
pnpm --filter @quickhelp/tool-kit build
pnpm --filter @quickhelp/agent-sdk build
pnpm --filter @quickhelp/mcp build
node apps/mcp/dist/index.js
```

## Test via stdio

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node apps/mcp/dist/index.js
```
