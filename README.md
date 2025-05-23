# iExec MCP Server

> A [Model Context Protocol (MCP)](https://github.com/anthropics/model-context-protocol) compatible server to interact with the [iExec](https://iex.ec) protocol — built for Claude, agents, and AI tooling.

---

## 1. Prerequisites

- **For Local (Node.js) setup:**
  - Node.js (version 18 or higher)
  - npm (version 9 or higher)
- **For Docker setup:**
  - Docker installed
- An Ethereum private key (from iExec or any wallet)
- (Optional) Claude Desktop if you want to integrate with Claude

---

## 2. Wallet Setup

**Option 1: Create a new wallet with iExec**

```bash
npm install -g iexec
iexec wallet create --unencrypted
```

Find your wallet at:

- Linux: `~/.ethereum/keystore/wallet.json`
- macOS: `~/Library/Ethereum/keystore/wallet.json`
- Windows: `%APPDATA%/Ethereum/keystore/wallet.json`

**Option 2: Use an existing private key**

- Create a `wallet.json`:
  ```bash
  mkdir -p ./my-wallet
  echo '{"privateKey":"0xYOUR_PRIVATE_KEY"}' > ./my-wallet/wallet.json
  ```
- Or use your raw private key directly in Claude configuration.

---

## 3. Quickstart with Claude Code CLI

The fastest way to get started is using the Claude Code CLI:

```bash
# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Add iExec MCP server with your wallet
claude mcp add iexec-mcp --env PRIVATE_KEY_PATH=~/Library/Ethereum/keystore/wallet.json -- npx @paypes/iexec-mcp@latest run

# run claude
claude
```

---

## 4. Local (Node.js)

Follow these steps to run the iExec MCP Server locally with Node.js and integrate it with Claude Desktop.

### 3.1. Clone, Install, and Build

```bash
git clone https://github.com/iexec-blockchain-computing/iexec-mcp-server.git
cd iexec-mcp-server
npm install
npm run build
```

> All configuration (PRIVATE_KEY_PATH or PRIVATE_KEY) is set in the Claude config, not as shell variables.

### 3.2. Integrate with Claude Desktop

1. Download and install [Claude Desktop](https://github.com/anthropics/claude-desktop/releases) if you haven't already.
2. Open Claude Desktop → **Developer > Edit Config**
3. Edit your `claude_desktop_config.json`:

**With `PRIVATE_KEY_PATH`:**

```json
{
  "mcpServers": {
    "iexec-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/iexec-mcp-server/build/index.js"],
      "env": {
        "PRIVATE_KEY_PATH": "/absolute/path/to/wallet.json"
      }
    }
  }
}
```

**With `PRIVATE_KEY`:**

```json
{
  "mcpServers": {
    "iexec-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/iexec-mcp-server/build/index.js"],
      "env": {
        "PRIVATE_KEY": "0xYOUR_PRIVATE_KEY"
      }
    }
  }
}
```

3. Restart Claude Desktop. You should see a plug icon for `iexec-mcp-server`.

---

## 4. Docker

Follow these steps to run the iExec MCP Server with Docker and integrate it with Claude Desktop.

### 4.1: Prerequisites

- Docker installed
- An Ethereum private key (from iExec or any wallet)
- (Optional) Claude Desktop

### 4.2. Run the Server with Docker

- **With wallet file:**
  ```bash
  docker run -i --rm --init -e PRIVATE_KEY_PATH=/absolute/path/to/wallet.json iexec/mcp-server:latest
  ```
- **With raw private key:**
  ```bash
  docker run -i --rm --init -e PRIVATE_KEY=0xYOUR_PRIVATE_KEY iexec/mcp-server:latest
  ```

### 4.3. Integrate with Claude Desktop

1. Open Claude Desktop → **Developer > Edit Config**
2. Edit your `claude_desktop_config.json`:

**With `PRIVATE_KEY_PATH`:**

```json
{
  "mcpServers": {
    "iexec-mcp-server": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--init",
        "-e",
        "PRIVATE_KEY_PATH=/absolute/path/to/wallet.json",
        "iexec/mcp-server:latest"
      ]
    }
  }
}
```

**With `PRIVATE_KEY`:**

```json
{
  "mcpServers": {
    "iexec-mcp-server": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--init",
        "-e",
        "PRIVATE_KEY=0xYOUR_PRIVATE_KEY",
        "iexec/mcp-server:latest"
      ]
    }
  }
}
```

3. Restart Claude Desktop. You should see a plug icon for `iexec-mcp-server`.

---

## 5. Available Tools & API

- **Confidential Data:** `protectData`, `getProtectedData`, `processProtectedData`
- **Data Governance:** `grantAccess`, `revokeOneAccess`, `revokeAllAccess`, `transferOwnership`, `getGrantedAccess`
- **Web3Mail:** `sendEmail`, `fetchMyContacts`, `fetchUserContacts`
- **Wallet & Resources:** `getUserVoucher`, `getWalletBalance`, `getIExecApps`

> Full API docs: [`TOOLS.md`](./TOOLS.md)

---

## 6. Example Prompts

- "Please protect my email address `alice@example.com` with the name `iexec-mcp-email-demo`."
- "List all protected data tied to my wallet."
- "Grant access to protected data `0x123` for iExec app `web3mail` and user `0xUSER`."
- "Revoke access to protected data `0x123` for app `web3mail` and user `0xUSER`."
- "Revoke all access for protected data `0x123`."
- "Transfer the ownership of protected data `0x123` to `0x456`."
- "Send email to `0xrecipient` with subject `Update` and message `Access approved`."
- "List all my Web3mail contacts."
- "What's my wallet balance on iExec?"
- "Do I have a user voucher?"
- "Run app `0xAPP` on protected data `0xDATA`."

---

## 7. Security & Best Practices

- For production, use `PRIVATE_KEY_PATH` and keep your wallet file secure.
- Never commit your private key or wallet file to source control.
- The server runs locally; your private key is never sent externally.
- Claude and other agents never access your key or raw data.

---

## 8. Help & Resources

- [iExec Developer Docs](https://docs.iex.ec)
- [Join iExec on Discord](https://discord.iex.ec)
- [About MCP](https://modelcontextprotocol.io/introduction)

---

## 9. Contributing

Contributions welcome! Open an issue or PR to suggest improvements.
