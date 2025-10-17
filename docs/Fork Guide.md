# How to Fork Village Wallet

## For Your Company
1. Fork on GitHub
2. Edit branding in `src/config.js`
3. Add your networks in `src/VillageWallet.tsx`
4. Build with `npm run android`
5. Distribute to your users

## Common Customizations
- Add networks: Edit NETWORKS object
- Change serial format: Edit pinToPassphrase()
- Rebrand: Edit strings and colors
- Add features: Standard React Native

## Testing Your Fork
1. Generate test cards with your generator
2. Test NFC reading
3. Test transactions
4. Deploy!