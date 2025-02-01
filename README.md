# PixMint
A feature-rich NFT minting platform built on the Stacks blockchain with royalties support.

## Features
- Mint single NFTs with metadata
- Batch mint multiple NFTs at once
- Royalties system for NFT creators
- Transfer NFTs between accounts 
- View NFT ownership, metadata, and creator information
- Set minting price and supply limits

## Usage
The contract provides the following main functions:

### Minting
- `mint`: Mint a new NFT by providing metadata and paying the minting fee
- `batch-mint`: Mint multiple NFTs at once (up to 10)

### Royalties
- `set-token-royalty`: Set custom royalty percentage for a specific token
- `set-default-royalty`: Set default royalty percentage for all new tokens
- Royalties are automatically paid to creators during transfers

### Asset Management
- `transfer`: Transfer an NFT to another account (includes royalty payment)
- `get-token-uri`: Get the metadata URI for a specific token
- `get-owner`: Get the current owner of a token
- `get-token-creator`: Get the creator of a token
- `get-token-royalty`: Get the royalty percentage for a token

## Royalties System
The contract includes a comprehensive royalties system that:
- Allows creators to set custom royalty percentages for their tokens
- Has a default royalty percentage that can be configured
- Automatically handles royalty payments during transfers
- Supports royalty percentages from 0-100%
