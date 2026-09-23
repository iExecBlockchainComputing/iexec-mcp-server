# MCP Tools Documentation

This document describes the available Model Context Protocol (MCP) tools designed to interact with iExec DataProtector and related services.

All tools run on the network selected by the `CHAIN` environment variable: `arbitrum-mainnet` (default) or `arbitrum-sepolia-testnet`. Transactions are paid in ETH gas on that network.

---

## Table of Contents

- [get_granted_access](#get_granted_access)
- [get_protected_data](#get_protected_data)
- [get_iexec_apps](#get_iexec_apps)
- [get_wallet_balance](#get_wallet_balance)
- [grant_access](#grant_access)
- [process_protected_data](#process_protected_data)
- [protect_data](#protect_data)
- [revoke_access](#revoke_access)
- [revoke_all_access](#revoke_all_access)
- [transfer_ownership](#transfer_ownership)

---

## get_granted_access

**Description:**  
List granted access permissions for a protected dataset.

**Inputs:**

- `protectedData` (string, optional): The address or ID of the protected data.
- `authorizedApp` (string, optional): Filter by authorized application.
- `authorizedUser` (string, optional): Filter by authorized user.
- `isUserStrict` (boolean, optional): Exclude accesses granted to any user.
- `page` (number, optional): Page index (starts at 0).
- `pageSize` (number, optional): Page size (10 to 1000).

**Output:**

- `count` (number): Number of granted accesses found.
- `grantedAccess` (array): List of granted access entries matching the query.

---

## get_protected_data

**Description:**  
Retrieve the protected datasets owned by the configured wallet.

**Inputs:**

None.

**Output:**

- `count` (number): Number of protected datasets.
- `protectedData` (array): List of protected datasets with details and explorer URLs.

---

## get_iexec_apps

**Description:**  
Get the whitelist address of a known iExec app (`web3mail`, `web3telegram`) on the configured network. Use this address as `authorizedApp` in `grant_access`.

**Inputs:**

- `query` (string, optional): App name or alias. Returns all known apps if omitted.

**Output:**

- `chain` (string): Configured network.
- `appName`, `whitelistAddress`, `aliases` for the matching app, or `knownApps` (array) if no query or no match.

---

## get_wallet_balance

**Description:**  
Retrieve the ETH (gas) and RLC balances of the configured wallet, including RLC stake and locked amounts in the iExec account.

**Inputs:**

None.

**Output:**

- `wallet` (string): Wallet address.
- `chain` (string): Configured network.
- `onChainETH` (number): ETH balance, used to pay gas.
- `onChainRLC` (number): Available RLC balance.
- `stakeRLC` (number): Staked RLC balance.
- `lockedRLC` (number): Locked RLC balance.

---

## grant_access

**Description:**  
Grant access permissions to a protected dataset for a specific app and user.

**Inputs:**

- `protectedData` (string, required): Address or ID of the protected data.
- `authorizedApp` (string, required): Application to authorize: an Ethereum address, or a known app name (`web3mail`, `web3telegram`), which resolves to that app's whitelist on the configured network.
- `authorizedUser` (string, required): User to authorize.
- `pricePerAccess` (number, optional): Price per access permission.
- `numberOfAccess` (number, optional): Number of accesses allowed.

**Output:**

- Confirmation message.
- Details of the granted access.

---

## process_protected_data

**Description:**  
Process a protected dataset using iExec confidential computing features.

**Inputs:**

- `protectedData` (string, required): Dataset to process.
- `app` (string, required): Application to process the data.
- `userWhitelist` (string, optional): Whitelist of users allowed to use the process.
- `dataMaxPrice` (number, optional): Maximum price (nRLC) for the dataset order.
- `appMaxPrice` (number, optional): Maximum price (nRLC) for the app order.
- `workerpoolMaxPrice` (number, optional): Maximum price (nRLC) for the workerpool order.
- `path` (string, optional): Path of the executable or script to run.
- `args` (string, optional): Arguments for the executable.
- `inputFiles` (array of strings, optional): Input files for the process.
- `secrets` (object, optional): Secrets to inject.
- `workerpool` (string, optional): Workerpool to use (defaults to the iExec production workerpool).

**Output:**

- Confirmation message.
- `txHash`, `dealId` and `taskId` of the processing job.

---

## protect_data

**Description:**  
Protect any JSON-compatible data by encrypting and storing it as an NFT using iExec DataProtector.

**Inputs:**

- `data` (object, required): JSON object to protect.
- `name` (string, optional): Public name for the protected data.

**Output:**

- Confirmation message.
- URL to the protected data on iExec explorer.
- Protected data metadata.

---

## revoke_access

**Description:**  
Revoke access to a protected dataset previously granted to a specific application and user.

**Inputs:**

- `protectedData` (string, required): Address or ID of the protected data.
- `authorizedApp` (string, required): Application authorized previously.
- `authorizedUser` (string, required): User authorized previously.

**Output:**

- Confirmation message.
- Transaction hash of the revocation.
- Details of the revoked access.

---

## revoke_all_access

**Description:**  
Revoke all granted access permissions for a protected dataset, regardless of application or user.

**Inputs:**

- `protectedData` (string, required): Address or ID of the protected data.

**Output:**

- Confirmation message.
- List of revoked accesses with transaction hashes or errors for each.

---

## transfer_ownership

**Description:**  
Transfer ownership of protected data to a new wallet address.

**Inputs:**

- `protectedData` (string, required): Address or ID of the protected data.
- `newOwner` (string, required): Wallet address of the new owner.

**Output:**

- Confirmation message.
- Transaction hash of the ownership transfer.
- Explorer URL for the dataset on iExec explorer.

---