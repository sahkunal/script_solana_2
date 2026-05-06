# script_solana_2

A TypeScript-based scripting toolkit for interacting with the Solana blockchain on **devnet**. Covers SPL token lifecycle (init, mint, transfer, metadata) and NFT operations (image upload, metadata, minting) using the new `@solana/kit` SDK and Metaplex Umi framework.

---

## Tech Stack

| Package | Purpose |
|---|---|
| `@solana/kit` | New Solana web3 SDK — RPC, keypairs, transactions |
| `@solana-program/token` | SPL Token Program client |
| `@solana-program/system` | System Program client |
| `@metaplex-foundation/umi-bundle-defaults` | Umi framework with default plugins |
| `@metaplex-foundation/mpl-token-metadata` | Token Metadata program (NFT metadata) |
| `@metaplex-foundation/mpl-core` | Metaplex Core NFT standard |
| `@metaplex-foundation/umi-uploader-irys` | Decentralized file uploads via Irys |
| `bs58` | Base58 encoding/decoding |
| `ts-node` + `typescript` | TypeScript execution |

---

## Project Structure

```
script_solana_2/
├── src/
│   ├── spl/
│   │   ├── spl_init.ts        # Create a new SPL token mint
│   │   ├── spl_mint.ts        # Mint tokens to a token account
│   │   ├── spl_transfer.ts    # Transfer tokens between accounts
│   │   └── spl_metadata.ts    # Attach metadata to a token
│   └── nft/
│       ├── nft_image.ts       # Upload NFT image to Irys
│       ├── nft_metadata.ts    # Upload NFT metadata JSON
│       └── nft_mint.ts        # Mint the NFT on-chain
├── devnet-wallet.json         # Devnet keypair (DO NOT commit)
├── tsconfig.json
└── package.json
```

---

## Prerequisites

- Node.js v18+
- WSL (Ubuntu) or macOS/Linux terminal
- A Solana devnet wallet keypair (`devnet-wallet.json`)

---

## Setup

```bash
# Clone the repo
git clone https://github.com/sahkunal/script_solana_2.git
cd script_solana_2

# Install dependencies
npm install
```

Add your devnet wallet keypair at the root:

```bash
# Generate a new keypair if you don't have one
solana-keygen new --outfile devnet-wallet.json

# Airdrop devnet SOL
solana airdrop 2 $(solana-keygen pubkey devnet-wallet.json) --url devnet
```

> ⚠️ `devnet-wallet.json` is in `.gitignore`. Never commit your keypair.

---

## Available Scripts

```bash
# SPL Token
npm run spl:init        # Create a new mint account
npm run spl:metadata    # Attach token metadata
npm run spl:mint        # Mint tokens to a token account
npm run spl:transfer    # Transfer tokens between wallets

# NFT
npm run nft:image       # Upload image to Irys (decentralized storage)
npm run nft:metadata    # Upload metadata JSON to Irys
npm run nft:mint        # Mint NFT on-chain
```

---

## Network

All scripts run against **Solana Devnet**:

```
RPC:       https://api.devnet.solana.com
WebSocket: wss://api.devnet.solana.com
```

---

## Notes

- This project uses the new `@solana/kit` SDK (v6+), not the legacy `@solana/web3.js`. The API is different — every RPC call ends with `.send()`.
- SPL scripts use `@solana-program/token` for token program interactions, not `@solana/spl-token`.
- NFT scripts use the Metaplex Umi framework with Irys for off-chain storage.
