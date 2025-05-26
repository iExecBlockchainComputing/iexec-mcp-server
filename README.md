# iExec MCP Server

> A [Model Context Protocol (MCP)](https://github.com/anthropics/model-context-protocol) compatible server to interact with the [iExec](https://iex.ec) protocol — built for Claude, agents, and AI tooling.

---

## 1. Wallet Setup

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

## 2. Getting Started

Complete the **Wallet Setup** above, then choose your preferred installation method:

| Method                                                                       | Description                        | Best For                           |
| ---------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------- |
| **[3. NPX Configuration](#3-method-a-npx-configuration-for-claude-desktop)** ⭐ | Direct Claude Desktop setup        | Quick Claude Desktop integration   |
| **[4. Claude Code CLI](#4-method-b-claude-code-cli-setup)**               | CLI integration setup | Developers using Claude Code       |
| **[5. Local Node.js](#5-method-c-local-nodejs-setup)**                       | Development from source            | Local development & debugging      |
| **[6. Docker](#6-method-d-docker-setup)**                                    | Containerized deployment           | Production & isolated environments |

---

## 3. Method A: NPX Configuration for Claude Desktop

**Prerequisites:**
- [Node.js](https://nodejs.org/) (version 18 or higher)
- npm (version 9 or higher)
- [Claude Desktop](https://claude.ai/download)

**Setup Steps:**

1. **Open Claude Desktop configuration:**
   - Open Claude Desktop → **Developer > Edit Config**

2. **Add configuration to `claude_desktop_config.json`:**
   
   *With wallet file (from Section 1):*
   ```json
   {
     "mcpServers": {
       "iexec-mcp-server": {
         "command": "npx",
         "args": ["-y", "@paypes/iexec-mcp@latest"],
         "env": {
           "PRIVATE_KEY_PATH": "/absolute/path/to/wallet.json"
         }
       }
     }
   }
   ```
   
   *With direct private key:*
   ```json
   {
     "mcpServers": {
       "iexec-mcp-server": {
         "command": "npx",
         "args": ["-y", "@paypes/iexec-mcp@latest"],
         "env": {
           "PRIVATE_KEY": "0xYOUR_PRIVATE_KEY"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop** - You should see a plug icon for `iexec-mcp-server`

---

## 4. Method B: Claude Code CLI Setup

**Prerequisites:**
- [Node.js](https://nodejs.org/) (version 18 or higher)
- npm (version 9 or higher)

**Setup Steps:**

1. **Install Claude Code CLI:**
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

2. **Add iExec MCP server:**
   
   *With wallet file (from Section 1):*
   ```bash
   claude mcp add iexec-mcp --env PRIVATE_KEY_PATH=~/Library/Ethereum/keystore/wallet.json -- npx @paypes/iexec-mcp@latest run
   ```
   
   *With direct private key:*
   ```bash
   claude mcp add iexec-mcp --env PRIVATE_KEY=0xYOUR_PRIVATE_KEY -- npx @paypes/iexec-mcp@latest run
   ```

3. **Run Claude:**
   ```bash
   claude
   ```

---

## 5. Method C: Local Node.js Setup

**Prerequisites:**
- [Node.js](https://nodejs.org/) (version 18 or higher)
- npm (version 9 or higher)
- [Git](https://git-scm.com/)
- [Claude Desktop](https://claude.ai/download) (optional)

**Setup Steps:**

### 5.1. Clone, Install, and Build

```bash
git clone https://github.com/iexec-blockchain-computing/iexec-mcp-server.git
cd iexec-mcp-server
npm install
npm run build
```

> All configuration (PRIVATE_KEY_PATH or PRIVATE_KEY) is set in the Claude config, not as shell variables.

### 5.2. Integrate with Claude Desktop (Optional)

1. **Open Claude Desktop configuration:**
   - Download and install [Claude Desktop](https://claude.ai/download) if you haven't already
   - Open Claude Desktop → **Developer > Edit Config**

2. **Add configuration to `claude_desktop_config.json`:**
   
   *With wallet file (from Section 1):*
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
   
   *With direct private key:*
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

3. **Restart Claude Desktop** - You should see a plug icon for `iexec-mcp-server`

---

## 6. Method D: Docker Setup

**Prerequisites:**
- [Docker](https://www.docker.com/get-started) installed
- [Claude Desktop](https://claude.ai/download) (optional)

**Setup Steps:**

### 6.1. Run the Server with Docker

*With wallet file (from Section 1):*
```bash
docker run -i --rm --init -e PRIVATE_KEY_PATH=/absolute/path/to/wallet.json iexec/mcp-server:latest
```

*With direct private key:*
```bash
docker run -i --rm --init -e PRIVATE_KEY=0xYOUR_PRIVATE_KEY iexec/mcp-server:latest
```

### 6.2. Integrate with Claude Desktop (Optional)

1. **Open Claude Desktop configuration:**
   - Open Claude Desktop → **Developer > Edit Config**

2. **Add configuration to `claude_desktop_config.json`:**
   
   *With wallet file (from Section 1):*
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
   
   *With direct private key:*
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

3. **Restart Claude Desktop** - You should see a plug icon for `iexec-mcp-server`

---

## 7. Available Tools & API

- **Confidential Data:** `protectData`, `getProtectedData`, `processProtectedData`
- **Data Governance:** `grantAccess`, `revokeOneAccess`, `revokeAllAccess`, `transferOwnership`, `getGrantedAccess`
- **Web3Mail:** `sendEmail`, `fetchMyContacts`, `fetchUserContacts`
- **Wallet & Resources:** `getUserVoucher`, `getWalletBalance`, `getIExecApps`

> Full API docs: [`TOOLS.md`](./TOOLS.md)

---

## 8. Example Prompts

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

## 9. Security & Best Practices

- For production, use `PRIVATE_KEY_PATH` and keep your wallet file secure.
- Never commit your private key or wallet file to source control.
- The server runs locally; your private key is never sent externally.
- Claude and other agents never access your key or raw data.

---

## 10. Help & Resources

- [iExec Developer Docs](https://docs.iex.ec)
- [Join iExec on Discord](https://discord.iex.ec)
- [About MCP](https://modelcontextprotocol.io/introduction)

---

## 11. Contributing

Contributions welcome! Open an issue or PR to suggest improvements.
