// ============================================
// VILLAGE WALLET - Complete Working Code
// ============================================
// File: src/village-wallet-1.tsx
// This is your production APK code
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';

// ============================================
// NETWORK CONFIGURATIONS
// ============================================

const NETWORKS: Record<string, any> = {
  polygon: {
    name: 'Polygon',
    rpc: 'https://polygon-rpc.com',
    fallbackRpc: 'https://polygon.llamarpc.com',
    fallbackRpc2: 'https://rpc.ankr.com/polygon',
    fallbackRpc3: 'https://polygon-bor-rpc.publicnode.com',
    symbol: 'MATIC',
    explorer: 'https://polygonscan.com',
    chainId: 137,
  },
  arbitrum: {
    name: 'Arbitrum',
    rpc: 'https://arb1.arbitrum.io/rpc',
    fallbackRpc: 'https://arbitrum-one.publicnode.com',
    fallbackRpc2: 'https://arbitrum.blockpi.network/v1/rpc/public',
    fallbackRpc3: 'https://rpc.ankr.com/arbitrum',
    symbol: 'ETH',
    explorer: 'https://arbiscan.io',
    chainId: 42161,
  },
  ethereum: {
    name: 'Ethereum',
    rpc: 'https://eth.llamarpc.com',
    fallbackRpc: 'https://rpc.ankr.com/eth',
    fallbackRpc2: 'https://ethereum-rpc.publicnode.com',
    fallbackRpc3: 'https://cloudflare-eth.com',
    symbol: 'ETH',
    explorer: 'https://etherscan.io',
    chainId: 1,
  },
  base: {
    name: 'Base',
    rpc: 'https://mainnet.base.org',
    fallbackRpc: 'https://base.llamarpc.com',
    fallbackRpc2: 'https://base.blockpi.network/v1/rpc/public',
    fallbackRpc3: 'https://base-rpc.publicnode.com',
    symbol: 'ETH',
    explorer: 'https://basescan.org',
    chainId: 8453,
  },
  optimism: {
    name: 'Optimism',
    rpc: 'https://mainnet.optimism.io',
    fallbackRpc: 'https://optimism.llamarpc.com',
    fallbackRpc2: 'https://optimism.blockpi.network/v1/rpc/public',
    fallbackRpc3: 'https://rpc.ankr.com/optimism',
    symbol: 'ETH',
    explorer: 'https://optimistic.etherscan.io',
    chainId: 10,
  },
  bnb: {
    name: 'BNB Chain',
    rpc: 'https://bsc-dataseed1.binance.org',
    fallbackRpc: 'https://bsc-dataseed2.binance.org',
    fallbackRpc2: 'https://bsc-dataseed3.binance.org',
    fallbackRpc3: 'https://rpc.ankr.com/bsc',
    symbol: 'BNB',
    explorer: 'https://bscscan.com',
    chainId: 56,
  },
};

const CONFIG = {
  CARD_SERIAL_PREFIX: 'VLG',  // Default prefix, but any serial format is accepted
  MAX_TRANSACTION: 0.5,
  MIN_TRANSACTION: 0.0001,
};

// ============================================
// TOKEN CONFIGURATIONS
// ============================================

const TOKENS: Record<string, any> = {
  // Native tokens (already supported)
  native: {
    name: 'Native Token',
    symbol: 'Native',
    decimals: 18,
    isNative: true,
  },
  
  // USDT (Tether)
  usdt: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    addresses: {
      polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      arbitrum: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      base: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
      optimism: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      bnb: '0x55d398326f99059fF775485246999027B3197955',
    },
  },
  
  // USDC (USD Coin)
  usdc: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    addresses: {
      polygon: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      arbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      optimism: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      bnb: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    },
  },
  
  // DAI (Dai Stablecoin)
  dai: {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    addresses: {
      polygon: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      arbitrum: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      ethereum: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      base: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
      optimism: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      bnb: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    },
  },
};

// ============================================
// MAIN APP
// ============================================

export default function VillageWallet() {
  // Navigation
  const [screen, setScreen] = useState('home');
  
  // Core state
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [networkConnected, setNetworkConnected] = useState(false);
  
  // Settings
  const [merchantAddress, setMerchantAddress] = useState('');
  const [merchantDisplayName, setMerchantDisplayName] = useState(''); // For ENS display
  const [selectedNetwork, setSelectedNetwork] = useState('polygon');
  const [selectedToken, setSelectedToken] = useState('native'); // Token selection
  const [provider, setProvider] = useState<any>(null);
  
  // Transaction state
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [cardData, setCardData] = useState<any>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [usdPrice, setUsdPrice] = useState<number | null>(null);

  // Initialize
  useEffect(() => {
    initializeApp();
    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  // Update provider when network changes
  useEffect(() => {
    const updateProvider = async () => {
      if (selectedNetwork) {
        try {
          const network = NETWORKS[selectedNetwork];
          console.log(`🔄 Switching to ${network.name}...`);
          
          let ethProvider;
          let connected = false;
          
          // List of RPCs to try in order
          const rpcsToTry = [
            { url: network.rpc, label: 'primary' },
            { url: network.fallbackRpc, label: 'fallback' },
            { url: network.fallbackRpc2, label: 'fallback2' },
            { url: network.fallbackRpc3, label: 'fallback3' },
          ].filter(rpc => rpc.url); // Remove undefined entries
          
          // Try each RPC until one works
          for (const rpc of rpcsToTry) {
            try {
              console.log(`🔍 Trying ${network.name} ${rpc.label}: ${rpc.url}`);
              ethProvider = new ethers.providers.JsonRpcProvider(rpc.url);
              await ethProvider.getBlockNumber();
              console.log(`✅ Connected to ${network.name} (${rpc.label})`);
              connected = true;
              break; // Success! Stop trying
            } catch (rpcError) {
              console.log(`❌ ${rpc.label} failed, trying next...`);
              continue; // Try next RPC
            }
          }
          
          if (!connected) {
            console.log(`❌ All RPCs failed for ${network.name}`);
            Alert.alert(
              'Connection Failed',
              `Could not connect to ${network.name}. All RPC endpoints are unavailable. Please try again later.`
            );
          }
          
          setNetworkConnected(connected);
          
          if (ethProvider) {
            setProvider(ethProvider);
          }
        } catch (error) {
          console.error(`❌ Failed to switch to ${selectedNetwork}:`, error);
          setNetworkConnected(false);
        }
      }
    };
    
    updateProvider();
  }, [selectedNetwork]);

  const initializeApp = async () => {
    try {
      // Initialize provider FIRST (most important)
      const network = NETWORKS['polygon'];
      let ethProvider;
      let connected = false;
      
      // List of RPCs to try
      const rpcsToTry = [
        { url: network.rpc, label: 'primary' },
        { url: network.fallbackRpc, label: 'fallback' },
        { url: network.fallbackRpc2, label: 'fallback2' },
        { url: network.fallbackRpc3, label: 'fallback3' },
      ].filter(rpc => rpc.url);
      
      // Try each RPC until one works
      for (const rpc of rpcsToTry) {
        try {
          console.log(`🔍 Initializing with ${network.name} ${rpc.label}`);
          ethProvider = new ethers.providers.JsonRpcProvider(rpc.url);
          await ethProvider.getBlockNumber();
          console.log(`✅ Network initialized (${rpc.label})`);
          connected = true;
          break;
        } catch (rpcError) {
          console.log(`❌ ${rpc.label} failed, trying next...`);
          continue;
        }
      }
      
      if (!connected) {
        console.log('❌ All RPCs failed during initialization');
      }
      
      setNetworkConnected(connected);
      
      if (ethProvider) {
        setProvider(ethProvider);
      }
      
      // Try to initialize NFC (but don't fail if it doesn't work)
      try {
        const supported = await NfcManager.isSupported();
        if (supported) {
          await NfcManager.start();
          setNfcEnabled(true);
          console.log('✅ NFC initialized successfully');
        } else {
          console.log('⚠️ NFC not supported on this device');
        }
      } catch (nfcError) {
        // NFC failed, but that's okay - app can still work
        console.log('⚠️ NFC initialization failed (app will still work):', nfcError.message);
        setNfcEnabled(false);
      }
    } catch (error) {
      console.error('❌ Critical initialization error:', error);
      setNetworkConnected(false);
    }
  };

  // ============================================
  // NFC FUNCTIONS
  // ============================================

  const readNFCCard = async () => {
    try {
      setLoading(true);
      await NfcManager.requestTechnology(NfcTech.Ndef);

      const tag = await NfcManager.getTag();
      
      if (!tag || !tag.ndefMessage || tag.ndefMessage.length === 0) {
        throw new Error('No data on card');
      }

      const ndefRecord = tag.ndefMessage[0];
      const payloadBytes = ndefRecord.payload;
      const jsonString = String.fromCharCode(...payloadBytes.slice(3));
      const walletData = JSON.parse(jsonString);

      setCardData(walletData);
      
      // Get balance for selected token
      if (provider) {
        const bal = await getTokenBalance(walletData.addr, selectedToken);
        setBalance(bal);
      }

      await NfcManager.cancelTechnologyRequest();
      setLoading(false);
      
      return walletData;
    } catch (error) {
      await NfcManager.cancelTechnologyRequest();
      setLoading(false);
      throw error;
    }
  };

  // Get balance for native token or ERC-20
  const getTokenBalance = async (address: string, tokenKey: string) => {
    try {
      if (tokenKey === 'native') {
        // Get native token balance (ETH, MATIC, BNB, etc.)
        const bal = await provider.getBalance(address);
        return ethers.utils.formatEther(bal);
      } else {
        // Get ERC-20 token balance
        const token = TOKENS[tokenKey];
        const tokenAddress = token.addresses[selectedNetwork];
        
        if (!tokenAddress) {
          console.log(`Token ${tokenKey} not available on ${selectedNetwork}`);
          return '0.00';
        }
        
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const bal = await contract.balanceOf(address);
        return ethers.utils.formatUnits(bal, token.decimals);
      }
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0.00';
    }
  };

  // ============================================
  // CRYPTO FUNCTIONS
  // ============================================

  // ERC-20 Token ABI (just the functions we need)
  const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function decimals() view returns (uint8)',
  ];

  const pinToPassphrase = (pin: string, cardSerial: string) => {
    return `${cardSerial}-PIN${pin}-SECURE`;
  };

  const decryptPrivateKey = (encryptedKey: string, pin: string, cardSerial: string) => {
    try {
      const passphrase = pinToPassphrase(pin, cardSerial);
      const decrypted = CryptoJS.AES.decrypt(encryptedKey, passphrase);
      let privateKey = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!privateKey.startsWith('0x')) {
        privateKey = '0x' + privateKey;
      }
      
      if (!privateKey || privateKey.length < 60) {
        throw new Error('Invalid PIN or corrupted key');
      }
      
      return privateKey;
    } catch (error) {
      throw new Error('Invalid PIN');
    }
  };

  // ============================================
  // ENS RESOLUTION
  // ============================================

  /**
   * Resolve ENS name to Ethereum address
   * Accepts: alice.eth, 0x123..., or any ENS name
   */
  const resolveNameOrAddress = async (input: string) => {
    try {
      // If it's already an address, validate and return
      if (ethers.utils.isAddress(input)) {
        return { address: input, displayName: input };
      }

      // If it contains .eth, try to resolve
      if (input.includes('.eth')) {
        setLoading(true);
        const resolvedAddress = await provider.resolveName(input);
        setLoading(false);

        if (!resolvedAddress) {
          throw new Error(`Could not resolve ${input}. Name may not exist.`);
        }

        console.log(`✅ Resolved ${input} → ${resolvedAddress}`);
        return { 
          address: resolvedAddress, 
          displayName: input  // Keep the ENS name for display
        };
      }

      // Not a valid address or ENS name
      throw new Error('Invalid address or ENS name format');
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const sendTransaction = async (cardData: any, pin: string, toAddress: string, amount: string) => {
    let wallet: any = null;
    
    try {
      const privateKey = decryptPrivateKey(cardData.ekey, pin, cardData.serial);
      wallet = new ethers.Wallet(privateKey, provider);

      if (wallet.address.toLowerCase() !== cardData.addr.toLowerCase()) {
        throw new Error('Address mismatch - invalid PIN');
      }

      if (selectedToken === 'native') {
        // Send native token (ETH, MATIC, BNB, etc.)
        return await sendNativeToken(wallet, toAddress, amount);
      } else {
        // Send ERC-20 token (USDT, USDC, DAI, etc.)
        return await sendERC20Token(wallet, toAddress, amount);
      }
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    } finally {
      wallet = null;
    }
  };

  const sendNativeToken = async (wallet: any, toAddress: string, amount: string) => {
    const balance = await provider.getBalance(wallet.address);
    const amountWei = ethers.utils.parseEther(amount.toString());
    
    const gasPrice = await provider.getGasPrice();
    const gasLimit = 21000;
    const gasCost = gasPrice.mul(gasLimit);
    const totalCost = amountWei.add(gasCost);

    if (balance.lt(totalCost)) {
      throw new Error(
        `Insufficient balance.\n\n` +
        `Balance: ${ethers.utils.formatEther(balance)}\n` +
        `Needed: ${ethers.utils.formatEther(totalCost)}\n` +
        `(includes ${ethers.utils.formatEther(gasCost)} gas)`
      );
    }

    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: amountWei,
      gasLimit: gasLimit,
    });

    await tx.wait();

    return {
      success: true,
      hash: tx.hash,
      gasCost: ethers.utils.formatEther(gasCost),
    };
  };

  const sendERC20Token = async (wallet: any, toAddress: string, amount: string) => {
    const token = TOKENS[selectedToken];
    const tokenAddress = token.addresses[selectedNetwork];
    
    if (!tokenAddress) {
      throw new Error(`${token.symbol} not available on ${NETWORKS[selectedNetwork].name}`);
    }

    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
    
    // Check token balance
    const tokenBalance = await contract.balanceOf(wallet.address);
    const amountInUnits = ethers.utils.parseUnits(amount.toString(), token.decimals);
    
    if (tokenBalance.lt(amountInUnits)) {
      throw new Error(
        `Insufficient ${token.symbol} balance.\n\n` +
        `Balance: ${ethers.utils.formatUnits(tokenBalance, token.decimals)} ${token.symbol}\n` +
        `Needed: ${amount} ${token.symbol}`
      );
    }

    // Check native token balance for gas
    const nativeBalance = await provider.getBalance(wallet.address);
    const gasEstimate = await contract.estimateGas.transfer(toAddress, amountInUnits);
    const gasPrice = await provider.getGasPrice();
    const gasCost = gasEstimate.mul(gasPrice);

    if (nativeBalance.lt(gasCost)) {
      throw new Error(
        `Insufficient ${NETWORKS[selectedNetwork].symbol} for gas.\n\n` +
        `Need: ${ethers.utils.formatEther(gasCost)} ${NETWORKS[selectedNetwork].symbol}`
      );
    }

    // Send token
    const tx = await contract.transfer(toAddress, amountInUnits);
    await tx.wait();

    return {
      success: true,
      hash: tx.hash,
      gasCost: ethers.utils.formatEther(gasCost),
    };
  };

  // ============================================
  // SETTINGS FUNCTIONS
  // ============================================

  const saveMerchantAddress = async (input: string) => {
    try {
      const { address, displayName } = await resolveNameOrAddress(input);
      
      setMerchantAddress(address);
      setMerchantDisplayName(displayName);
      
      if (displayName.includes('.eth')) {
        Alert.alert(
          'ENS Resolved! ✅',
          `${displayName}\n→\n${address.slice(0, 10)}...${address.slice(-8)}`
        );
      } else {
        Alert.alert('Success', 'Merchant address saved!');
      }
      
      setScreen('home');
      return true;
    } catch (error: any) {
      Alert.alert('Error', error.message);
      return false;
    }
  };

  const setMerchantAddressFromCard = async () => {
    try {
      const card = await readNFCCard();
      
      // Use ENS name if available, otherwise use address
      const displayName = card.ens || card.addr;
      
      setMerchantAddress(card.addr);
      setMerchantDisplayName(displayName);
      
      Alert.alert(
        'Address Set!', 
        card.ens 
          ? `Your ENS: ${card.ens}\nAddress: ${card.addr.slice(0, 10)}...`
          : `Your wallet: ${card.addr.slice(0, 10)}...`
      );
    } catch (error: any) {
      Alert.alert('Error', 'Could not read card: ' + error.message);
    }
  };

  const changeNetwork = (network: string) => {
    setSelectedNetwork(network);
    Alert.alert('Network Changed', `Now using ${NETWORKS[network].name}`);
  };

  // ============================================
  // TRANSACTION HANDLERS
  // ============================================

  const handleReceivePayment = async () => {
    if (!merchantAddress) {
      Alert.alert(
        'Setup Required',
        'Please set your wallet address in Settings first',
        [{ text: 'Go to Settings', onPress: () => setScreen('settings') }]
      );
      return;
    }

    if (!amount || parseFloat(amount) < CONFIG.MIN_TRANSACTION) {
      Alert.alert('Error', `Minimum amount is ${CONFIG.MIN_TRANSACTION}`);
      return;
    }

    Alert.alert(
      'Ready to Receive',
      `Ask customer to tap their card to pay ${amount} ${NETWORKS[selectedNetwork].symbol}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Ready', onPress: () => initiatePayment() },
      ]
    );
  };

  const initiatePayment = async () => {
    try {
      const customerCard = await readNFCCard();
      setScreen('payment');
      
      const customerDisplay = customerCard.ens 
        ? `${customerCard.ens}\n${customerCard.addr.slice(0, 10)}...`
        : `${customerCard.addr.slice(0, 10)}...${customerCard.addr.slice(-8)}`;
      
      Alert.alert(
        'Card Detected',
        `Card: ${customerCard.serial}\n${customerDisplay}\n\nAsk customer to enter their PIN`,
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSendPayment = async () => {
    if (!cardData || !pin || !amount) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    setLoading(true);

    try {
      const result = await sendTransaction(cardData, pin, merchantAddress, amount);

      setLoading(false);
      setPin('');
      
      const tokenSymbol = selectedToken === 'native' 
        ? NETWORKS[selectedNetwork].symbol 
        : TOKENS[selectedToken].symbol;
      
      Alert.alert(
        'Payment Successful! ✅',
        `Amount: ${amount} ${tokenSymbol}\n` +
        `Gas Fee: ${result.gasCost} ${NETWORKS[selectedNetwork].symbol}\n` +
        `Tx: ${result.hash.slice(0, 10)}...\n\n` +
        `View on ${NETWORKS[selectedNetwork].explorer}/tx/${result.hash}`,
        [{
          text: 'Done',
          onPress: () => {
            setScreen('home');
            setAmount('');
            setCardData(null);
          },
        }]
      );
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Transaction Failed', error.message);
    }
  };

  const handleCheckBalance = async () => {
    try {
      setLoading(true);
      const card = await readNFCCard();
      setScreen('balance');
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  // ============================================
  // UI SCREENS
  // ============================================

  const renderHomeScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏘️ Village Wallet</Text>
        <View style={styles.networkBadge}>
          <View style={[
            styles.connectionDot,
            networkConnected ? styles.connectionDotConnected : styles.connectionDotDisconnected
          ]} />
          <Text style={styles.networkBadgeText}>
            {NETWORKS[selectedNetwork].name}
          </Text>
          <View style={styles.tickerBadge}>
            <Text style={styles.tickerText}>{NETWORKS[selectedNetwork].symbol}</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={() => setScreen('receive')}
        >
          <Text style={styles.buttonText}>💰 Receive Payment</Text>
          <Text style={styles.buttonSubtext}>As Merchant</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handleCheckBalance}
        >
          <Text style={styles.buttonText}>📊 Check Balance</Text>
          <Text style={styles.buttonSubtext}>Tap your card</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonTertiary]}
          onPress={() => setScreen('settings')}
        >
          <Text style={styles.buttonText}>⚙️ Settings</Text>
          <Text style={styles.buttonSubtext}>Configure App</Text>
        </TouchableOpacity>
      </View>

      {!nfcEnabled && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>⚠️ NFC is disabled. Enable in settings.</Text>
        </View>
      )}
    </View>
  );

  const renderReceiveScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Receive Payment</Text>
      </View>

      {merchantAddress && (
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Payments go to:</Text>
          <Text style={styles.infoValue}>
            {merchantDisplayName.includes('.eth') 
              ? merchantDisplayName 
              : `${merchantAddress.slice(0, 10)}...${merchantAddress.slice(-8)}`}
          </Text>
          {merchantDisplayName.includes('.eth') && (
            <Text style={styles.infoSubtext}>
              {merchantAddress.slice(0, 10)}...{merchantAddress.slice(-8)}
            </Text>
          )}
        </View>
      )}

      {/* Token Selector */}
      <View style={styles.section}>
        <Text style={styles.label}>Select Token</Text>
        <View style={styles.tokenSelector}>
          <TouchableOpacity
            style={[
              styles.tokenButton,
              selectedToken === 'native' && styles.tokenButtonActive
            ]}
            onPress={() => setSelectedToken('native')}
          >
            <Text style={[
              styles.tokenButtonText,
              selectedToken === 'native' && styles.tokenButtonTextActive
            ]}>
              {NETWORKS[selectedNetwork].symbol}
            </Text>
          </TouchableOpacity>
          
          {Object.keys(TOKENS).filter(k => k !== 'native').map(tokenKey => {
            const token = TOKENS[tokenKey];
            const isAvailable = token.addresses[selectedNetwork];
            
            if (!isAvailable) return null;
            
            return (
              <TouchableOpacity
                key={tokenKey}
                style={[
                  styles.tokenButton,
                  selectedToken === tokenKey && styles.tokenButtonActive
                ]}
                onPress={() => setSelectedToken(tokenKey)}
              >
                <Text style={[
                  styles.tokenButtonText,
                  selectedToken === tokenKey && styles.tokenButtonTextActive
                ]}>
                  {token.symbol}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          Amount ({selectedToken === 'native' ? NETWORKS[selectedNetwork].symbol : TOKENS[selectedToken].symbol})
        </Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#666"
        />
        {amount && parseFloat(amount) > 0 && (
          <Text style={styles.usdEstimate}>
            ≈ ${(parseFloat(amount) * (selectedToken === 'usdt' || selectedToken === 'usdc' || selectedToken === 'dai' ? 1 : 0)).toFixed(2)} USD (est.)
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, styles.buttonPrimary]}
        onPress={handleReceivePayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Ready for Payment →</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonSecondary]}
        onPress={() => {
          setScreen('home');
          setAmount('');
        }}
      >
        <Text style={styles.buttonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPaymentScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customer PIN Entry</Text>
        {cardData && (
          <View style={styles.cardInfo}>
            <Text style={styles.cardInfoText}>Card: {cardData.serial}</Text>
            {cardData.ens && (
              <Text style={styles.cardInfoText}>{cardData.ens}</Text>
            )}
            <Text style={styles.cardInfoText}>
              {cardData.addr.slice(0, 10)}...{cardData.addr.slice(-8)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Amount to Pay</Text>
        <Text style={styles.amountDisplay}>
          {amount} {NETWORKS[selectedNetwork].symbol}
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Enter Your PIN (4-6 digits)</Text>
        <TextInput
          style={styles.pinInput}
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          placeholder="••••"
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, styles.buttonPrimary]}
        onPress={handleSendPayment}
        disabled={loading || pin.length < 4}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Confirm Payment ✓</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonSecondary]}
        onPress={() => {
          setScreen('home');
          setPin('');
          setAmount('');
          setCardData(null);
        }}
      >
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>

      <View style={styles.warning}>
        <Text style={styles.warningText}>
          🔒 Your PIN is secure. The merchant cannot see it.
        </Text>
      </View>
    </View>
  );

  const renderBalanceScreen = () => (
    <ScrollView 
      style={styles.app}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Card Balance</Text>
        </View>

        {cardData && (
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceAmount}>
              {balance || '0.00'} {selectedToken === 'native' ? NETWORKS[selectedNetwork].symbol : TOKENS[selectedToken].symbol}
            </Text>
            <Text style={styles.balanceUSD}>
              On {NETWORKS[selectedNetwork].name}
            </Text>

            <View style={styles.cardDetails}>
              <Text style={styles.cardDetailLabel}>Card Serial:</Text>
              <Text style={styles.cardDetailValue}>{cardData.serial}</Text>
              
              {cardData.ens && (
                <>
                  <Text style={styles.cardDetailLabel}>ENS Name:</Text>
                  <Text style={styles.cardDetailValue}>{cardData.ens}</Text>
                </>
              )}
              
              <Text style={styles.cardDetailLabel}>Address:</Text>
              <Text style={styles.cardDetailValue}>{cardData.addr}</Text>
            </View>

            <View style={[styles.infoBox, {marginTop: 20}]}>
              <Text style={styles.infoLabel}>💡 Tip:</Text>
              <Text style={styles.infoValue}>
                {cardData.ens 
                  ? `Share your ENS name "${cardData.ens}" with friends! They can send crypto to it on any network.`
                  : 'This card may have different balances on other networks. Switch network in Settings to check.'}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => {
            setScreen('home');
            setCardData(null);
            setBalance(null);
          }}
        >
          <Text style={styles.buttonText}>← Back to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderSettingsScreen = () => (
    <ScrollView 
      style={styles.app}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Merchant Address</Text>
          <Text style={styles.sectionDesc}>
            Where payments will be sent (supports ENS names like alice.eth!)
          </Text>
          
          {merchantAddress ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Current Address:</Text>
              <Text style={styles.infoValue}>
                {merchantDisplayName.includes('.eth') 
                  ? merchantDisplayName 
                  : `${merchantAddress.slice(0, 10)}...${merchantAddress.slice(-8)}`}
              </Text>
              {merchantDisplayName.includes('.eth') && (
                <Text style={styles.infoSubtext}>
                  {merchantAddress.slice(0, 10)}...{merchantAddress.slice(-8)}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.warning}>
              <Text style={styles.warningText}>
                ⚠️ No address set. Set your address to receive payments.
              </Text>
            </View>
          )}
          
          <TextInput
            style={styles.input}
            value={merchantDisplayName || merchantAddress}
            onChangeText={setMerchantDisplayName}
            placeholder="0x... or alice.eth"
            placeholderTextColor="#666"
          />
          
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={() => saveMerchantAddress(merchantDisplayName || merchantAddress)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>💾 Save Address</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonTertiary]}
            onPress={setMerchantAddressFromCard}
          >
            <Text style={styles.buttonText}>📱 Scan from Card</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Network</Text>
          <Text style={styles.sectionDesc}>Select blockchain network</Text>
          
          {Object.entries(NETWORKS).map(([key, network]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.networkButton,
                selectedNetwork === key && styles.networkButtonActive,
              ]}
              onPress={() => changeNetwork(key)}
            >
              <View style={styles.networkButtonContent}>
                <Text
                  style={[
                    styles.networkButtonText,
                    selectedNetwork === key && styles.networkButtonTextActive,
                  ]}
                >
                  {network.name}
                </Text>
                <View style={[
                  styles.networkTickerBadge,
                  selectedNetwork === key && styles.networkTickerBadgeActive
                ]}>
                  <Text style={[
                    styles.networkTickerText,
                    selectedNetwork === key && styles.networkTickerTextActive
                  ]}>
                    {network.symbol}
                  </Text>
                </View>
              </View>
              {selectedNetwork === key && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => setScreen('home')}
        >
          <Text style={styles.buttonText}>← Back to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <View style={styles.app}>
      {screen === 'home' && renderHomeScreen()}
      {screen === 'receive' && renderReceiveScreen()}
      {screen === 'payment' && renderPaymentScreen()}
      {screen === 'balance' && renderBalanceScreen()}
      {screen === 'settings' && renderSettingsScreen()}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // 🌙 DARK MODE THEME
  app: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, padding: 20 },
  scrollContent: { paddingBottom: 40 },
  
  header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#a78bfa', fontWeight: '600' },
  
  // Network Badge on Home Screen
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d44',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#a78bfa',
    marginTop: 8,
  },
  connectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  connectionDotConnected: {
    backgroundColor: '#10b981',
  },
  connectionDotDisconnected: {
    backgroundColor: '#ef4444',
  },
  networkBadgeText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginRight: 10,
  },
  tickerBadge: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tickerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  buttonContainer: { marginBottom: 20 },
  button: { padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  buttonPrimary: { backgroundColor: '#8b5cf6' },
  buttonSecondary: { backgroundColor: '#4a5568' },
  buttonTertiary: { backgroundColor: '#0f766e' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  buttonSubtext: { color: '#fff', fontSize: 12, marginTop: 4, opacity: 0.8 },
  
  inputContainer: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#e5e7eb', marginBottom: 8 },
  input: {
    backgroundColor: '#2d2d44',
    color: '#fff',
    padding: 16,
    borderRadius: 8,
    fontSize: 24,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  pinInput: {
    backgroundColor: '#2d2d44',
    color: '#fff',
    padding: 20,
    borderRadius: 8,
    fontSize: 32,
    textAlign: 'center',
    letterSpacing: 10,
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  amountDisplay: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#a78bfa',
    textAlign: 'center',
    padding: 20,
  },
  usdEstimate: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  
  infoBox: {
    backgroundColor: '#2d2d44',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3f3f5c',
  },
  infoLabel: { fontSize: 12, color: '#9ca3af', marginBottom: 4 },
  infoValue: { fontSize: 14, color: '#e5e7eb', fontFamily: 'monospace' },
  infoSubtext: { fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', marginTop: 4 },
  
  warning: {
    backgroundColor: '#78350f',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#fbbf24',
    marginTop: 20,
  },
  warningText: { color: '#fde68a', fontSize: 12 },
  
  cardInfo: {
    backgroundColor: '#2d2d44',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  cardInfoText: { fontSize: 12, color: '#9ca3af', fontFamily: 'monospace' },
  
  balanceContainer: {
    backgroundColor: '#2d2d44',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#3f3f5c',
  },
  balanceLabel: { fontSize: 14, color: '#9ca3af', marginBottom: 8 },
  balanceAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#a78bfa',
    marginBottom: 8,
  },
  balanceUSD: { fontSize: 18, color: '#9ca3af', marginBottom: 24 },
  cardDetails: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#3f3f5c',
    paddingTop: 16,
    marginTop: 16,
  },
  cardDetailLabel: { fontSize: 12, color: '#9ca3af', marginTop: 8 },
  cardDetailValue: {
    fontSize: 14,
    color: '#e5e7eb',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  
  section: { marginBottom: 30 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a78bfa',
    marginBottom: 8,
  },
  sectionDesc: { fontSize: 14, color: '#9ca3af', marginBottom: 16 },
  
  // Network Button in Settings
  networkButton: {
    backgroundColor: '#2d2d44',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#3f3f5c',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  networkButtonActive: {
    borderColor: '#8b5cf6',
    backgroundColor: '#3730a3',
  },
  networkButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  networkButtonText: { 
    fontSize: 16, 
    color: '#e5e7eb',
    marginRight: 10,
  },
  networkButtonTextActive: { 
    color: '#fff', 
    fontWeight: 'bold',
  },
  
  // Network Ticker Badge in Settings
  networkTickerBadge: {
    backgroundColor: '#3f3f5c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  networkTickerBadgeActive: {
    backgroundColor: '#8b5cf6',
  },
  networkTickerText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  networkTickerTextActive: {
    color: '#fff',
  },
  
  checkmark: { fontSize: 20, color: '#a78bfa' },
  
  // Token Selector Styles
  tokenSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tokenButton: {
    backgroundColor: '#2d2d44',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#3f3f5c',
    minWidth: 70,
    alignItems: 'center',
  },
  tokenButtonActive: {
    borderColor: '#8b5cf6',
    backgroundColor: '#3730a3',
  },
  tokenButtonText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
  },
  tokenButtonTextActive: {
    color: '#fff',
  },
});
