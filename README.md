# Open-source NFC crypto cards for Ethereum

# 🏘️ Village Wallet

**Open-source NFC crypto cards for Ethereum**

Tap-to-pay with crypto. PIN-protected. Multi-network. MetaMask compatible.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/github/downloads/yourusername/village-wallet/total)](https://github.com/yourusername/village-wallet/releases)
[![Stars](https://img.shields.io/github/stars/yourusername/village-wallet)](https://github.com/yourusername/village-wallet/stargazers)

---

## 🎯 What is Village Wallet?

Village Wallet turns any NFC card into a secure crypto wallet. It's like a hardware wallet, but simpler and cheaper.

**Key Features:**
- 📱 **Tap to pay** - Just tap your card on any phone with NFC
- 🔒 **PIN protected** - Your funds are secure with a 4-6 digit PIN
- 🌐 **Multi-network** - Works on Ethereum, Polygon, and Arbitrum
- 🦊 **MetaMask ready** - Import your wallet anytime
- 💻 **100% open source** - Audit the code, fork the project
- 🎁 **Perfect for gifts** - Give crypto in physical form

---

## 🚀 Quick Start

### For Users (Just want to use it)

1. **Download the app**
   - [Android APK](https://github.com/yourusername/village-wallet/releases/latest)
   - iOS: Coming soon

2. **Generate a wallet**
   - Open our [Card Generator](https://villagewallet.com/generator) (runs offline)
   - Enter card number and PIN
   - **Save your private key!** (for MetaMask backup)

3. **Write to NFC card**
   - Copy the JSON output
   - Use [NFC Tools](https://play.google.com/store/apps/details?id=com.wakdev.wdnfc) app
   - Write → Add Record → Text → Paste JSON

4. **Use your card**
   - Tap card to check balance (no PIN needed)
   - Tap card + enter PIN to pay
   - Import to MetaMask with your private key

### For Developers (Want to fork/contribute)

```bash
# Clone the repo
git clone https://github.com/yourusername/village-wallet.git
cd village-wallet

# Install dependencies
npm install

# Run on Android
npx react-native run-android

# Build APK
cd android && ./gradlew assembleRelease
```

See [Fork Guide](docs/FORK-GUIDE.md) for detailed customization instructions.

---

## 📖 How It Works

```
┌─────────────────────────────────────────────────────────┐
│  1. Generate Wallet (Offline)                          │
│     • Create Ethereum keypair                           │
│     • Encrypt private key with PIN                      │
│     • Output: Public address + Encrypted key            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  2. Write to NFC Card                                   │
│     • Card contains: Address + Encrypted key            │
│     • User keeps PIN separately                         │
│     • Private key never exposed                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  3. Use the Card                                        │
│     • Check balance: Just tap (no PIN)                  │
│     • Send payment: Tap + enter PIN                     │
│     • App decrypts key temporarily to sign transaction  │
└─────────────────────────────────────────────────────────┘
```

**Security Model:**
- Private key encrypted with AES-256
- PIN never stored or transmitted
- Decryption happens locally on device
- No servers, no APIs, no tracking

---

## 🌐 Supported Networks

| Network | Symbol | Status |
|---------|--------|--------|
| Ethereum | ETH | ✅ Supported |
| Polygon | MATIC | ✅ Supported |
| Arbitrum | ETH | ✅ Supported |
| Base | ETH | 🔜 Coming soon |
| Optimism | ETH | 🔜 Coming soon |

Want to add a network? See [Contributing](#-contributing)

---

## 📱 Screenshots

*Coming soon - Add screenshots of your app here*

---

## 🔒 Security

### What We Do
- ✅ Generate wallets offline (air-gapped)
- ✅ Encrypt private keys with user PIN
- ✅ Never store or transmit keys
- ✅ Use standard cryptography (AES-256)
- ✅ Open source code (audit anytime)

### What Users Should Do
- ⚠️ Keep PIN secret (like a bank card)
- ⚠️ Save private key offline (for backup)
- ⚠️ Don't scratch off card back unless needed
- ⚠️ Start with small amounts for testing

### Security Audit
We welcome security researchers to audit our code. Found a vulnerability? Please email: security@villagewallet.com

---

## 🛠️ Technical Details

### NFC Card Format
```json
{
  "v": "1.0",
  "net": "ethereum",
  "addr": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "ekey": "U2FsdGVkX1+vupppqqWvj3mbjPXYq...",
  "serial": "VLG-001",
  "ens": "user.village.eth"
}
```

Full spec: [NFC Format Specification](docs/NFC-FORMAT-SPEC.md)

### Encryption
- **Algorithm:** AES-256-CBC (via CryptoJS)
- **Passphrase format:** `{serial}-PIN{pin}-SECURE`
- **Example:** `VLG-001-PIN1234-SECURE`

### Tech Stack
- **App:** React Native 0.82
- **Crypto:** ethers.js 5.7.2, crypto-js
- **NFC:** react-native-nfc-manager
- **Networks:** Ethereum, Polygon, Arbitrum

---

## 📚 Documentation

- [User Guide](https://villagewallet.com/docs) - How to use Village Wallet
- [FAQ](https://villagewallet.com/faq) - Common questions
- [Fork Guide](docs/FORK-GUIDE.md) - Customize for your needs
- [NFC Spec](docs/NFC-FORMAT-SPEC.md) - Card format details
- [API Docs](docs/API.md) - For developers

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### For Non-Developers
- 🐛 Report bugs in [Issues](https://github.com/satoshistackalotto/village-wallet/issues)
- 💡 Suggest features
- 📖 Improve documentation
- 🌍 Translate the app
- ⭐ Star the repo!

### For Developers
- 🔧 Fix bugs
- ✨ Add features
- 🧪 Write tests
- 📱 Port to iOS
- 🌐 Add new networks

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 🗺️ Roadmap

### ✅ Phase 1: MVP (Complete!)
- [x] Android app
- [x] Multi-network support
- [x] Card generator
- [x] Basic documentation

### 🚧 Phase 2: Polish (In Progress)
- [ ] iOS app
- [ ] Better UI/UX
- [ ] Video tutorials
- [ ] More networks (Base, Optimism, BSC)

### 🔮 Phase 3: Advanced
- [ ] ENS subdomain integration
- [ ] Multi-sig support
- [ ] Hardware wallet integration
- [ ] DeFi features

### 🌟 Phase 4: Ecosystem
- [ ] Card marketplace
- [ ] White-label solutions
- [ ] DAO governance
- [ ] Grant program

---

## 💰 Support the Project

Village Wallet is free and open source. If you find it useful, consider supporting development:

### Ways to Support
- ⭐ **Star this repo** - Helps with visibility
- 💬 **Spread the word** - Tell your crypto friends
- 💰 **Donate crypto:**
  - Ethereum: `0xYourAddress`
  - Polygon: `0xYourAddress` (same address, cheaper fees)
- 🎁 **GitHub Sponsors:** [Sponsor us](https://github.com/sponsors/satoshistackalotto)

All donations go toward:
- Development time
- Infrastructure costs
- Community support
- New features

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**What this means:**
- ✅ Use commercially
- ✅ Modify the code
- ✅ Distribute it
- ✅ Sublicense it
- ✅ Use privately

**Just:**
- Include the original license
- Don't hold us liable

---

## 🙏 Acknowledgments

Built with:
- [React Native](https://reactnative.dev/)
- [ethers.js](https://docs.ethers.io/)
- [react-native-nfc-manager](https://github.com/revtel/react-native-nfc-manager)
- [crypto-js](https://github.com/brix/crypto-js)

Inspired by:
- Ledger Unplugged (RIP)
- Satscard
- Physical crypto notes

---

## 📞 Contact & Community

- 🌐 **Website:** 
- 💬 **Discord:** 
- 🐦 **Twitter:** 
- 📧 **Email:** 
- 🐛 **Issues:** [GitHub Issues](https://github.com/satoshistackalotto/village-wallet/issues)

---

## ⚠️ Disclaimer

Village Wallet is experimental software. Use at your own risk.

- Not financial advice
- No guarantees or warranties
- You control your keys (we can't help if lost)
- Test with small amounts first
- Not liable for any losses

**Always:**
- Backup your private keys
- Keep your PIN secret
- Start with small amounts
- Verify everything yourself

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=satoshistackalotto/village-wallet&type=Date)](https://star-history.com/#satoshistackalotto/village-wallet&Date)

---

<div align="center">

**Made with ❤️ for the crypto community**

[Download](https://github.com/satoshistackalotto/village-wallet/releases/latest) • [Website] • [Discord]( X[Donate](https://github.com/sponsors/satoshistackalotto)

</div>
