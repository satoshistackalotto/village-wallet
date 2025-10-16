# 🏘️ Village Wallet

> A beautiful, multi-network crypto wallet with NFC card support

[![Version](https://img.shields.io/badge/version-2.0-blue.svg)](https://github.com/satoshistackalotto/VillageWallet)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React Native](https://img.shields.io/badge/React%20Native-0.72-61dafb.svg)](https://reactnative.dev/)
[![Downloads](https://img.shields.io/github/downloads/satoshistackalotto/village-wallet/total)](https://github.com/satoshistackalotto/village-wallet/releases)
[![Stars](https://img.shields.io/github/stars/satoshistackalotto/village-wallet)](https://github.com/satoshistackalotto/village-wallet/stargazers)


## ✨ Features

### 💳 **Multi-Token Support**
- **Native Tokens:** ETH, MATIC, BNB
- **Stablecoins:** USDT, USDC, DAI
- Pay with any token on any supported network!

### 🌐 **6 Networks Supported**
- 🟣 **Polygon** - Low fees, fast transactions
- 🔵 **Arbitrum** - Ethereum L2 scaling
- ⚫ **Ethereum** - Main network
- 🔷 **Base** - Coinbase's L2
- 🔴 **Optimism** - Optimistic rollup
- 🟡 **BNB Chain** - Binance network

### 🎴 **NFC Card Integration**
- Tap-to-pay with NFC-enabled cards
- PIN-encrypted private keys
- Secure offline storage
- Support for any card serial format

### 🏷️ **ENS Support**
- Use human-readable names (alice.eth)
- Auto-resolves to Ethereum addresses
- Display ENS names throughout app

### 🎨 **Beautiful Dark Mode UI**
- Modern navy + purple theme
- Network status indicators (🟢/🔴)
- Token selector with badges
- USD price estimates

### 🔒 **Security Features**
- Encrypted private keys (AES-256)
- PIN-protected transactions
- No keys stored on servers
- Fully decentralized

---

## 📱 Screenshots

*(Add screenshots here)*

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS - optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/satoshistackalotto/VillageWallet.git
cd VillageWallet

# Install dependencies
npm install

# Install iOS dependencies (Mac only)
cd ios && pod install && cd ..

# Run on Android
npx react-native run-android

# Run on iOS (Mac only)
npx react-native run-ios
```

### Build Production APK

```bash
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 📖 Usage

### For Merchants

1. **Setup:**
   - Open Settings
   - Enter your wallet address or scan your NFC card
   - Select preferred network and token

2. **Receive Payment:**
   - Tap "Receive Payment"
   - Select token (USDT, USDC, etc.)
   - Enter amount
   - Customer taps their card and enters PIN
   - Transaction complete!

### For Card Users

1. **Check Balance:**
   - Tap "Check Balance"
   - Place card on phone
   - View balance across all tokens

2. **Make Payment:**
   - Merchant initiates payment request
   - Tap your card on merchant's phone
   - Enter your PIN
   - Confirm transaction

---

## 🛠️ Technical Stack

- **Framework:** React Native 0.72
- **Blockchain:** Ethers.js v5
- **NFC:** react-native-nfc-manager
- **Encryption:** crypto-js (AES-256)
- **Networks:** Polygon, Arbitrum, Ethereum, Base, Optimism, BNB

---

## 🔐 Security

### How It Works

1. **Card Creation:**
   - Private key generated offline
   - Encrypted with PIN using AES-256
   - Written to NFC card with card serial

2. **Payment Flow:**
   - Card tapped → encrypted key read
   - User enters PIN → key decrypted in memory
   - Transaction signed → broadcasted
   - Key immediately cleared from memory

3. **What's Stored:**
   - **On Card:** Encrypted private key, public address, serial number
   - **In App:** Merchant address (optional), network preference
   - **Not Stored:** Private keys, PINs, transaction history

### Best Practices

- ✅ Use strong 6-digit PINs
- ✅ Keep card secure (like a credit card)
- ✅ Use stablecoins for predictable pricing
- ✅ Test with small amounts first
- ✅ Keep some native tokens for gas fees

---

## 📝 Card Format

Cards store data in JSON format on NFC NDEF:

```json
{
  "v": "1.0",
  "net": "ethereum",
  "addr": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEB2",
  "ekey": "U2FsdGVkX1+vupppqqWvj3mbjPXYq...",
  "serial": "CUSTOM-001",
  "ens": "alice.villagewallet.eth"
}
```

**Fields:**
- `v` - Format version
- `net` - Default network
- `addr` - Ethereum address
- `ekey` - AES-encrypted private key
- `serial` - Card serial (any format)
- `ens` - ENS name (optional)

---

## 🗺️ Roadmap

### v2.1 (Planned)
- [ ] Live price feeds (CoinGecko API)
- [ ] Transaction history
- [ ] QR code support
- [ ] Biometric authentication

### v3.0 (Future)
- [ ] More tokens (WETH, WBTC, etc.)
- [ ] iOS support
- [ ] Multi-language support
- [ ] Light mode theme

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Ethers.js](https://docs.ethers.org/) - Ethereum library
- [React Native NFC Manager](https://github.com/whitedogg13/react-native-nfc-manager) - NFC functionality
- [CryptoJS](https://cryptojs.gitbook.io/) - Encryption
- Networks: Polygon, Arbitrum, Base, Optimism, BNB Chain

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/satoshistackalotto/VillageWallet/issues)
- **Discussions:** [GitHub Discussions](https://github.com/satoshistackalotto/VillageWallet/discussions)
- **Email:** your.email@example.com

---

## ⚠️ Disclaimer

This software is provided "as is", without warranty of any kind. Users are responsible for securing their private keys and funds. Always test with small amounts first.

---

**Made with ❤️ for the crypto community**
