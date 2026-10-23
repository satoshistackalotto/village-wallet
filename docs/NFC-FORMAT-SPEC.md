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
  "addr": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "ekey": "U2FsdGVkX1+vupppqqWvj3mbjPXYq...",
  "ens": "user.village.eth"
}
