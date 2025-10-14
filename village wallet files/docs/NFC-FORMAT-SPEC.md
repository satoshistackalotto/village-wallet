# Village Wallet NFC Card Format

## Required Fields
- `serial` (string): Unique card identifier
- `addr` (string): Ethereum address (0x...)
- `ekey` (string): AES-encrypted private key

## Optional Fields  
- `ens` (string): ENS name
- `v` (string): Format version
- `net` (string): Default network

## Encryption
Passphrase: `{serial}-PIN{pin}-SECURE`
Algorithm: AES-256-CBC (CryptoJS default)

## Example
{
  "v": "1.0",
  "serial": "VLG-001",
  "addr": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "ekey": "U2FsdGVkX1+vupppqqWvj3mbjPXYq...",
  "ens": "user.village.eth"
}