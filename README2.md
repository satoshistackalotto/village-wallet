# 🐘 Village Wallet v2.5.0

**Open-source NFC crypto cards for Ethereum and beyond**

> Tap-to-pay crypto wallet with NFC card support • 6 networks • 5 tokens • ENS names • Security audited

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.5.0-blue.svg)](https://github.com/satoshistackalotto/village-wallet)
[![Downloads](https://img.shields.io/github/downloads/satoshistackalotto/village-wallet/total)](https://github.com/satoshistackalotto/village-wallet/releases)
[![Security](https://img.shields.io/badge/security-audited-green.svg)](https://github.com/satoshistackalotto/village-wallet/blob/main/docs/SECURITY-AUDIT-v2.5.0.md)
[![React Native](https://img.shields.io/badge/React%20Native-0.72+-61dafb.svg)](https://reactnative.dev/)

---

## What is Village Wallet?

Village Wallet turns any NFC card into a secure crypto wallet. Tap your card to pay with crypto just like contactless payment — with ETH, WBTC, USDT, USDC, DAI, and native tokens across 6 networks.

No seed phrases. No accounts. No servers. Just a card, a PIN, and your crypto.

---

## ✨ What's New in v2.5.0

### 🔒 Security Upgrade (Audited by Claude Opus 4.6)

This release addresses 12 security vulnerabilities identified in a comprehensive code audit. Full audit report: [`SECURITY-AUDIT-v2.5.0.md`](docs/SECURITY-AUDIT-v2.5.0.md)

**Critical fixes:**
- **PBKDF2 encryption** — 150,000 iterations of SHA-256 replaces the weak single-iteration EvpKDF. Brute-forcing a 6-digit PIN now takes 25-50+ hours instead of 2 minutes.
- **API key removed from source** — Etherscan key moved to environment config. A Cloudflare Worker proxy is included for deployments where the key should never touch the client.
- **Secure key handling** — Private keys are stored in zero-able `Uint8Array` buffers and cleared immediately after use in every code path.
- **No wallet objects in React state** — Pending transactions store encrypted references, not live private keys. 2-minute auto-expiry.
- **PIN rate limiting** — 5 failed attempts triggers a 5-minute lockout.

**Other fixes:** Nonce management prevents double-spend, EIP-55 checksum validation catches address typos, RPC chain ID verification prevents spoofing, production builds strip all sensitive logging.

**Backward compatible** — v1 cards (old encryption) are auto-detected and still work. New cards from the updated generator use v2 encryption.

### 🌐 New Features

- **ENS resolution fixed** — Now works on any selected network (always resolves via Ethereum mainnet)
- **ENS confirmation** — Shows resolved on-chain address for verification before saving
- **WBTC support** — Wrapped Bitcoin added across Ethereum, Polygon, Arbitrum, Optimism, and BNB Chain
- **Default network** — App opens on Ethereum mainnet
- **Standard address format** — All addresses displayed as `0x1234...56789` throughout the app
- **API privacy proxy** — Optional Cloudflare Worker proxy hides user IPs from Etherscan

### 📜 Carried Forward from v2.4.x

- Transaction history viewer with phishing/spam filtering
- Confetti animation on successful payments
- Layer 2 gas optimization (Arbitrum, Optimism, Base)
- Stablecoin USD display fix ($1:1 for USDT/USDC/DAI)
- Multi-language support (English included, add your own)
- Live price feeds from Coinbase

---

## 📱 Download

- **[Android APK](https://github.com/satoshistackalotto/village-wallet/releases/latest)** — Download and install directly
- **[Card Generator](https://village-wallet.com/generator.html)** — Create wallets offline (v2 PBKDF2 encryption)
- **iOS** — Coming soon

---

## 🌍 Supported Networks & Tokens

| Network | Symbol | Type | Status |
|---------|--------|------|--------|
| Ethereum | ETH | Mainnet | ✅ |
| Polygon | MATIC | Sidechain | ✅ |
| Arbitrum | ETH | Layer 2 | ✅ |
| Base | ETH | Layer 2 | ✅ |
| Optimism | ETH | Layer 2 | ✅ |
| BNB Chain | BNB | Sidechain | ✅ |

| Token | Networks | Type |
|-------|----------|------|
| USDT | All 6 | Stablecoin |
| USDC | All 6 | Stablecoin |
| DAI | All 6 | Stablecoin |
| WBTC | ETH, Polygon, Arbitrum, Optimism, BNB | Wrapped Bitcoin |

Plus each network's native token (ETH, MATIC, BNB).

---

## 🔒 Security Model

```
Card Generation (offline)
  • Random 32-byte private key via crypto.getRandomValues()
  • PBKDF2-SHA256 (150,000 iterations) + AES-256-CBC encryption
  • Output: NFC JSON with encrypted key + public address

NFC Card
  • Stores: address, encrypted key, serial, optional ENS name
  • Encrypted key requires PIN + serial to decrypt
  • v2 format: "v2:" + base64(salt) + ":" + base64(iv) + ":" + base64(ciphertext)

Payment Flow
  1. Merchant sets amount and network
  2. Customer taps card → NFC read
  3. Customer enters PIN (5 attempts max, then 5-min lockout)
  4. App decrypts key → estimates gas → shows preview
  5. On confirm: re-decrypt → verify nonce → sign → broadcast → clear key
  6. 2-minute auto-expiry if not confirmed
```

**What we guarantee:**
- ✅ PBKDF2-SHA256 encryption with 150,000 iterations
- ✅ PIN never stored or transmitted
- ✅ Keys cleared from memory immediately after use
- ✅ No servers, no tracking, no analytics
- ✅ 100% open source — audit the code yourself

**What we don't control:**
- ❌ Physical card security (keep it like a bank card)
- ❌ Your PIN strength (use 6 digits)
- ❌ Network gas fees
- ❌ NFC hardware limitations (standard NDEF is readable by any phone)

---

## 🚀 Quick Start

### For Users

1. **Download the app** from [Releases](https://github.com/satoshistackalotto/village-wallet/releases/latest)
2. **Generate a wallet** at [village-wallet.com/generator.html](https://village-wallet.com/generator.html) (runs offline)
3. **Write to NFC card** using [NFC Tools](https://play.google.com/store/apps/details?id=com.wakdev.wdnfc) — paste the JSON output
4. **Use your card** — tap to check balance (no PIN), tap + PIN to pay

### For Developers

```bash
git clone https://github.com/satoshistackalotto/village-wallet.git
cd village-wallet
npm install

# Create .env with your Etherscan API key
echo "ETHERSCAN_API_KEY=your_key_here" > .env

# Android
cd android && ./gradlew assembleRelease
```

### For Merchants

1. Open Settings → enter your wallet address or ENS name (e.g., `stems.eth`)
2. The app resolves the ENS name and shows the on-chain address for verification
3. Select network and token
4. Enter amount → customer taps card → enters PIN → payment sent

---

## 📂 Project Structure

```
village-wallet/
├── src/
│   └── app.tsx              # Main application (v2.5.0)
├── website/
│   └── generator.html       # Card generator (v2 PBKDF2)
├── proxy/
│   └── proxy-worker.js      # Cloudflare Worker API proxy
├── docs/
│   ├── SECURITY-AUDIT-v2.5.0.md
│   ├── NFC-FORMAT-SPEC.md
│   ├── FORK-GUIDE.md
│   └── FAQ.md
├── screenshots/
├── android/
├── ios/
├── .env.example             # API key template
└── README.md
```

---

## 🔐 API Privacy Proxy (Optional)

By default, the app calls Etherscan directly for transaction history and gas prices. For privacy-conscious deployments, a Cloudflare Worker proxy is included that strips user IPs:

```
Without proxy: Phone (user IP) → Etherscan (sees IP)
With proxy:    Phone (user IP) → Your proxy → Etherscan (sees proxy IP only)
```

Deploy instructions: See [`docs/PROXY-SETUP-GUIDE.md`](docs/PROXY-SETUP-GUIDE.md)

---

## 📖 NFC Card Format

Cards store JSON on NFC NDEF text records:

```json
{
  "v": "2.0",
  "net": "ethereum",
  "addr": "0xdh3821713jdns876Hb56C9dd99028173628364t37",
  "ekey": "v2:base64salt:base64iv:base64ciphertext",
  "serial": "VLG-001",
  "ens": "alice.village.eth"
}
```

| Field | Description |
|-------|-------------|
| `v` | Format version: `"1.0"` (legacy) or `"2.0"` (PBKDF2) |
| `net` | Default network |
| `addr` | Public Ethereum address |
| `ekey` | Encrypted private key |
| `serial` | Card serial number |
| `ens` | ENS name (optional) |

---

## 🗺️ Roadmap

### ✅ Complete
- 6 networks (Ethereum, Polygon, Arbitrum, Base, Optimism, BNB)
- 5 tokens (USDT, USDC, DAI, WBTC + native)
- NFC card integration with PIN
- ENS name resolution
- Transaction history with phishing filter
- Security audit and PBKDF2 upgrade
- Card generator (offline, v2 encryption)
- API privacy proxy

### 🚧 In Progress
- iOS app
- Google Play Store listing
- Video tutorials

### 🔮 Future
- Solana network support
- QR code fallback for non-NFC phones
- Biometric authentication
- Multi-sig support
- Token swap via DEX aggregator
- Card marketplace
- DAO governance

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- 🐛 **Report bugs** in [Issues](https://github.com/satoshistackalotto/village-wallet/issues)
- 💡 **Suggest features** in [Discussions](https://github.com/satoshistackalotto/village-wallet/discussions)
- 🔧 **Submit PRs** — fork, branch, commit, pull request
- 🌍 **Add translations** — copy the `en` block in TRANSLATIONS and translate
- ⭐ **Star the repo** — helps with visibility

---

## 💰 Support the Project

Village Wallet is free and open source. Support development:

- ⭐ **Star this repo**
- 💬 **Spread the word**
- 💰 **Donate:** `stems.eth` (Ethereum, Polygon, Arbitrum — same address)
- 🎁 **[GitHub Sponsors](https://github.com/sponsors/satoshistackalotto)**

---

## 📞 Contact & Community

- 🌐 **Website:** [village-wallet.com](https://village-wallet.com)
- 💬 **Discord:** [Join our Discord](https://discord.com/channels/1427941983544147980)
- 🐦 **Twitter:** [@stack_lotto](https://x.com/stack_lotto)
- 📧 **Email:** [support@village-wallet.com](mailto:support@village-wallet.com)
- 🐛 **Issues:** [GitHub Issues](https://github.com/satoshistackalotto/village-wallet/issues)
- 💭 **Discussions:** [GitHub Discussions](https://github.com/satoshistackalotto/village-wallet/discussions)

---

## ⚠️ Disclaimer

Village Wallet is experimental software. Use at your own risk.

- Not financial advice
- No guarantees or warranties
- You control your keys — we cannot recover lost funds
- Test with small amounts first
- Keep your PIN secret and cards physically secure

This software is provided "as is" under the MIT license.

---

## 📜 License

[MIT License](LICENSE) — Use commercially, modify, distribute, sublicense. Just include the original license and don't hold us liable.

---

**Made with ❤️ for the crypto community**

[Download](https://github.com/satoshistackalotto/village-wallet/releases/latest) • [Website](https://village-wallet.com) • [Discord](https://discord.gg/ew3y3N6hmm) • [Twitter](https://x.com/stack_lotto) • [Donate](https://github.com/sponsors/satoshistackalotto)

**⭐ Star us on GitHub — it helps!**