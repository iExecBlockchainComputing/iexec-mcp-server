# MCP Tools Documentation

This document describes the available Model Context Protocol (MCP) tools designed to interact with iExec DataProtector and related services.

---

## Table of Contents

- [get_granted_access](#get_granted_access)
- [get_protected_data](#get_protected_data)
- [get_user_voucher](#get_user_voucher)
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

**Output:**

- `count` (number): Number of granted accesses found.
- `grantedAccess` (array): List of granted access entries matching the query.

---

## get_protected_data

**Description:**  
Retrieve protected datasets owned by a wallet, optionally filtered by schema.

**Inputs:**

- `wallet` (string, required): Wallet address owner of the protected data.
- `requiredSchema` (object, optional): Schema to filter the datasets.

**Output:**

- `count` (number): Number of protected datasets.
- `protectedData` (array): List of protected datasets with details and explorer URLs.

---

## get_user_voucher

**Description:**  
Get voucher information related to a user wallet, including balance, expiration, sponsors, and authorized accounts.

**Inputs:**

- `wallet` (string, required): Wallet address to query.

**Output:**

- Voucher details: balance, expirationTimestamp, sponsoredApps, sponsoredDatasets, sponsoredWorkerpools, allowanceAmount, authorizedAccounts.
- If no voucher found, returns a message with a link to claim a voucher.

---

## get_wallet_balance

**Description:**  
Retrieve RLC token balances of a wallet, including on-chain balance, stake, and locked amounts.

**Inputs:**

- `wallet` (string, required): Wallet address.

**Output:**

- `wallet` (string): Wallet address.
- `onChainRLC` (number): Available RLC balance.
- `stakeRLC` (number): Staked RLC balance.
- `lockedRLC` (number): Locked RLC balance.

---

## grant_access

**Description:**  
Grant access permissions to a protected dataset for a specific app and user.

**Inputs:**

- `protectedData` (string, required): Address or ID of the protected data.
- `authorizedApp` (string, required): Application to authorize (name or Ethereum address).
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
- `maxPrice` (number, optional): Maximum price allowed for the process.
- `path` (string, optional): Path of the executable or script to run.
- `args` (string, optional): Arguments for the executable.
- `inputFiles` (array of strings, optional): Input files for the process.
- `secrets` (object, optional): Secrets to inject.
- `workerpool` (string, optional): Workerpool to use.
- `useVoucher` (boolean, optional): Whether to use a voucher.
- `voucherOwner` (string, optional): Voucher owner address.

**Output:**

- Confirmation message.
- Transaction hash of the processing job.

---

## protect_data

**Description:**  
Protect any JSON-compatible data by encrypting and storing it as an NFT using iExec DataProtector.

**Inputs:**

- `data` (object, required): JSON object to protect.
- `name` (string, optional): Public name for the protected data.
- `wallet` (string, optional): Destination wallet for transferring ownership.
- `allowDebug` (boolean, optional): Enable debug mode.

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