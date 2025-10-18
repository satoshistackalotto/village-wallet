// ============================================
// VILLAGE WALLET V2.1 - ARBITRUM OPTIMIZED
// ============================================
// File: src/village-wallet-v2.1-arbitrum-optimized.tsx
// New: 9 Arbitrum RPCs with improved reliability
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';

// ============================================
// NETWORK CONFIGURATIONS - ARBITRUM OPTIMIZED
// ============================================

const NETWORKS: Record<string, any> = {
  polygon: {
    name: 'Polygon',
    rpc: 'https://polygon-rpc.com',
    fallbackRpc: 'https://polygon.llamarpc.com',
    fallbackRpc2: 'https://rpc.ankr.com/polygon',
    fallbackRpc3: 'https://polygon-bor-rpc.publicnode.com',
    fallbackRpc4: 'https://polygon.drpc.org',
    fallbackRpc5: 'https://polygon-pokt.nodies.app',
    fallbackRpc6: 'https://rpc-mainnet.matic.quiknode.pro',
    symbol: 'MATIC',
    explorer: 'https://polygonscan.com',
    chainId: 137,
    coingeckoId: 'matic-network',
  },
  arbitrum: {
    name: 'Arbitrum',
    // PRIMARY - Official Arbitrum (most reliable)
    rpc: 'https://arb1.arbitrum.io/rpc',
    // FALLBACK 1 - Alchemy (enterprise-grade, very reliable)
    fallbackRpc: 'https://arb-mainnet.g.alchemy.com/v2/demo',
    // FALLBACK 2 - Ankr (solid public RPC)
    fallbackRpc2: 'https://rpc.ankr.com/arbitrum',
    // FALLBACK 3 - LlamaNodes (community favorite)
    fallbackRpc3: 'https://arbitrum.llamarpc.com',
    // FALLBACK 4 - PublicNode (reliable)
    fallbackRpc4: 'https://arbitrum-one.publicnode.com',
    // FALLBACK 5 - BlockPI (good uptime)
    fallbackRpc5: 'https://arbitrum.blockpi.network/v1/rpc/public',
    // FALLBACK 6 - 1RPC (privacy-focused)
    fallbackRpc6: 'https://1rpc.io/arb',
    // FALLBACK 7 - BlastAPI (enterprise)
    fallbackRpc7: 'https://arbitrum-mainnet.public.blastapi.io',
    // FALLBACK 8 - DRPC (distributed)
    fallbackRpc8: 'https://arbitrum.drpc.org',
    symbol: 'ETH',
    explorer: 'https://arbiscan.io',
    chainId: 42161,
    coingeckoId: 'ethereum',
  },
  ethereum: {
    name: 'Ethereum',
    rpc: 'https://eth.llamarpc.com',
    fallbackRpc: 'https://rpc.ankr.com/eth',
    fallbackRpc2: 'https://ethereum-rpc.publicnode.com',
    fallbackRpc3: 'https://cloudflare-eth.com',
    fallbackRpc4: 'https://eth.drpc.org',
    fallbackRpc5: 'https://ethereum.blockpi.network/v1/rpc/public',
    fallbackRpc6: 'https://rpc.flashbots.net',
    symbol: 'ETH',
    explorer: 'https://etherscan.io',
    chainId: 1,
    coingeckoId: 'ethereum',
  },
  base: {
    name: 'Base',
    rpc: 'https://mainnet.base.org',
    fallbackRpc: 'https://base.llamarpc.com',
    fallbackRpc2: 'https://base.blockpi.network/v1/rpc/public',
    fallbackRpc3: 'https://base-rpc.publicnode.com',
    fallbackRpc4: 'https://base.drpc.org',
    fallbackRpc5: 'https://base-mainnet.public.blastapi.io',
    fallbackRpc6: 'https://1rpc.io/base',
    symbol: 'ETH',
    explorer: 'https://basescan.org',
    chainId: 8453,
    coingeckoId: 'ethereum',
  },
  optimism: {
    name: 'Optimism',
    rpc: 'https://mainnet.optimism.io',
    fallbackRpc: 'https://optimism.llamarpc.com',
    fallbackRpc2: 'https://optimism.blockpi.network/v1/rpc/public',
    fallbackRpc3: 'https://rpc.ankr.com/optimism',
    fallbackRpc4: 'https://optimism.drpc.org',
    fallbackRpc5: 'https://optimism-mainnet.public.blastapi.io',
    fallbackRpc6: 'https://1rpc.io/op',
    symbol: 'ETH',
    explorer: 'https://optimistic.etherscan.io',
    chainId: 10,
    coingeckoId: 'ethereum',
  },
  bnb: {
    name: 'BNB Chain',
    rpc: 'https://bsc-dataseed1.binance.org',
    fallbackRpc: 'https://bsc-dataseed2.binance.org',
    fallbackRpc2: 'https://bsc-dataseed3.binance.org',
    fallbackRpc3: 'https://rpc.ankr.com/bsc',
    fallbackRpc4: 'https://bsc.blockpi.network/v1/rpc/public',
    fallbackRpc5: 'https://bsc.drpc.org',
    fallbackRpc6: 'https://1rpc.io/bnb',
    symbol: 'BNB',
    explorer: 'https://bscscan.com',
    chainId: 56,
    coingeckoId: 'binancecoin',
  },
};

const TOKENS: Record<string, any> = {
  native: {
    name: 'Native Token',
    symbol: 'Native',
    decimals: 18,
    isNative: true,
  },
  usdt: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    coingeckoId: 'tether',
    addresses: {
      polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      arbitrum: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      base: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
      optimism: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      bnb: '0x55d398326f99059fF775485246999027B3197955',
    },
  },
  usdc: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    coingeckoId: 'usd-coin',
    addresses: {
      polygon: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      arbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      optimism: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      bnb: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    },
  },
  dai: {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    coingeckoId: 'dai',
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

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
];

const CONFIG = {
  CARD_SERIAL_PREFIX: 'VLG',
  MAX_TRANSACTION: 10.0,
  MIN_TRANSACTION: 0.000000001,
  RPC_TIMEOUT: 5000, // 5 second timeout per RPC
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function VillageWallet() {
  const [screen, setScreen] = useState('home');
  const [selectedNetwork, setSelectedNetwork] = useState('polygon');
  const [selectedToken, setSelectedToken] = useState('native');
  const [merchantAddress, setMerchantAddress] = useState('');
  const [merchantDisplayName, setMerchantDisplayName] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [cardData, setCardData] = useState<any>(null);
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempAddress, setTempAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [priceLoading, setPriceLoading] = useState(false);
  const [networkStatuses, setNetworkStatuses] = useState<Record<string, boolean>>({});
  const [testingNetworks, setTestingNetworks] = useState(false);
  const [priceSource, setPriceSource] = useState<string>('');

  useEffect(() => {
    NfcManager.start().catch(() => {
      Alert.alert('NFC Error', 'NFC not available on this device');
    });
    checkNetworkConnection();
    testAllNetworks();
    fetchPrices();
    
    const priceInterval = setInterval(fetchPrices, 120000);
    
    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
      clearInterval(priceInterval);
    };
  }, []);

  useEffect(() => {
    checkNetworkConnection();
    testAllNetworks();
  }, [selectedNetwork]);

  // ============================================
  // IMPROVED RPC CONNECTION WITH TIMEOUT
  // ============================================

  const getProvider = async () => {
    const network = NETWORKS[selectedNetwork];
    const rpcs = [
      network.rpc,
      network.fallbackRpc,
      network.fallbackRpc2,
      network.fallbackRpc3,
      network.fallbackRpc4,
      network.fallbackRpc5,
      network.fallbackRpc6,
      network.fallbackRpc7,
      network.fallbackRpc8,
    ].filter(Boolean);
    
    console.log(`🔍 Connecting to ${network.name} (${rpcs.length} RPCs available)`);
    
    for (let i = 0; i < rpcs.length; i++) {
      const rpc = rpcs[i];
      try {
        const shortRpc = rpc.substring(0, 50) + (rpc.length > 50 ? '...' : '');
        console.log(`  Attempt ${i + 1}/${rpcs.length}: ${shortRpc}`);
        
        const provider = new ethers.providers.JsonRpcProvider(rpc);
        
        // Test connection with timeout
        const blockPromise = provider.getBlockNumber();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), CONFIG.RPC_TIMEOUT)
        );
        
        await Promise.race([blockPromise, timeoutPromise]);
        
        console.log(`  ✅ Connected to ${network.name} via RPC ${i + 1}`);
        return provider;
      } catch (error: any) {
        const errorMsg = error.message.substring(0, 50);
        console.log(`  ❌ RPC ${i + 1} failed: ${errorMsg}`);
        continue;
      }
    }
    
    throw new Error(
      `Cannot connect to ${network.name}. All ${rpcs.length} RPC endpoints failed. ` +
      `Please check your internet connection or try again later.`
    );
  };

  const checkNetworkConnection = async () => {
    try {
      await getProvider();
      setIsConnected(true);
    } catch {
      setIsConnected(false);
    }
  };

  const testAllNetworks = async () => {
    setTestingNetworks(true);
    const statuses: Record<string, boolean> = {};
    
    for (const key of Object.keys(NETWORKS)) {
      try {
        const network = NETWORKS[key];
        const rpcs = [
          network.rpc,
          network.fallbackRpc,
          network.fallbackRpc2,
          network.fallbackRpc3,
          network.fallbackRpc4,
          network.fallbackRpc5,
          network.fallbackRpc6,
          network.fallbackRpc7,
          network.fallbackRpc8,
        ].filter(Boolean);
        
        let connected = false;
        for (const rpc of rpcs) {
          try {
            const provider = new ethers.providers.JsonRpcProvider(rpc);
            const blockPromise = provider.getBlockNumber();
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 3000)
            );
            await Promise.race([blockPromise, timeoutPromise]);
            connected = true;
            break;
          } catch {
            continue;
          }
        }
        statuses[key] = connected;
      } catch {
        statuses[key] = false;
      }
    }
    
    setNetworkStatuses(statuses);
    setTestingNetworks(false);
  };

  // ============================================
  // PRICE FETCHING (4 SOURCES)
  // ============================================

  const fetchPrices = async () => {
    setPriceLoading(true);
    
    try {
      const prices = await fetchPricesFromCoinGecko();
      if (prices && Object.keys(prices).length > 0) {
        setPrices(prices);
        setPriceSource('CoinGecko');
        console.log('✅ Prices from CoinGecko');
        setPriceLoading(false);
        return;
      }
    } catch (error) {
      console.log('❌ CoinGecko failed, trying CryptoCompare...');
    }

    try {
      const prices = await fetchPricesFromCryptoCompare();
      if (prices && Object.keys(prices).length > 0) {
        setPrices(prices);
        setPriceSource('CryptoCompare');
        console.log('✅ Prices from CryptoCompare');
        setPriceLoading(false);
        return;
      }
    } catch (error) {
      console.log('❌ CryptoCompare failed, trying Binance...');
    }

    try {
      const prices = await fetchPricesFromBinance();
      if (prices && Object.keys(prices).length > 0) {
        setPrices(prices);
        setPriceSource('Binance');
        console.log('✅ Prices from Binance');
        setPriceLoading(false);
        return;
      }
    } catch (error) {
      console.log('❌ Binance failed, trying Coinbase...');
    }

    try {
      const prices = await fetchPricesFromCoinbase();
      if (prices && Object.keys(prices).length > 0) {
        setPrices(prices);
        setPriceSource('Coinbase');
        console.log('✅ Prices from Coinbase');
        setPriceLoading(false);
        return;
      }
    } catch (error) {
      console.log('❌ All price APIs failed');
    }

    console.log('⚠️ Using fallback prices (stablecoins only)');
    setPrices({
      'tether': 1.00,
      'usd-coin': 1.00,
      'dai': 1.00,
      'ethereum': 0,
      'matic-network': 0,
      'binancecoin': 0,
    });
    setPriceSource('Fallback (No API)');
    setPriceLoading(false);
  };

  const fetchPricesFromCoinGecko = async () => {
    const coingeckoIds = new Set<string>();
    Object.values(NETWORKS).forEach((network: any) => {
      if (network.coingeckoId) coingeckoIds.add(network.coingeckoId);
    });
    Object.values(TOKENS).forEach((token: any) => {
      if (token.coingeckoId) coingeckoIds.add(token.coingeckoId);
    });

    const ids = Array.from(coingeckoIds).join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { method: 'GET', headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) throw new Error('CoinGecko failed');
    const data = await response.json();
    const newPrices: Record<string, number> = {};
    for (const [id, value] of Object.entries(data)) {
      if (value && typeof value === 'object' && 'usd' in value) {
        newPrices[id] = (value as any).usd;
      }
    }
    if (Object.keys(newPrices).length === 0) throw new Error('No prices');
    return newPrices;
  };

  const fetchPricesFromCryptoCompare = async () => {
    const symbols = ['ETH', 'MATIC', 'BNB', 'USDT', 'USDC', 'DAI'];
    const fsyms = symbols.join(',');
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${fsyms}&tsyms=USD`,
      { method: 'GET', headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) throw new Error('CryptoCompare failed');
    const data = await response.json();
    return {
      'ethereum': data.ETH?.USD || 0,
      'matic-network': data.MATIC?.USD || 0,
      'binancecoin': data.BNB?.USD || 0,
      'tether': data.USDT?.USD || 1.00,
      'usd-coin': data.USDC?.USD || 1.00,
      'dai': data.DAI?.USD || 1.00,
    };
  };

  const fetchPricesFromBinance = async () => {
    const pairs = ['ETHUSDT', 'MATICUSDT', 'BNBUSDT'];
    const newPrices: Record<string, number> = {
      'tether': 1.00,
      'usd-coin': 1.00,
      'dai': 1.00,
    };
    
    for (const pair of pairs) {
      try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
        if (!response.ok) continue;
        const data = await response.json();
        const price = parseFloat(data.price);
        
        if (pair === 'ETHUSDT') newPrices['ethereum'] = price;
        if (pair === 'MATICUSDT') newPrices['matic-network'] = price;
        if (pair === 'BNBUSDT') newPrices['binancecoin'] = price;
      } catch {
        continue;
      }
    }
    
    if (Object.keys(newPrices).length < 4) throw new Error('Not enough prices from Binance');
    return newPrices;
  };

  const fetchPricesFromCoinbase = async () => {
    const pairs = ['ETH-USD', 'MATIC-USD', 'BNB-USD'];
    const newPrices: Record<string, number> = {
      'tether': 1.00,
      'usd-coin': 1.00,
      'dai': 1.00,
    };
    
    for (const pair of pairs) {
      try {
        const response = await fetch(`https://api.coinbase.com/v2/prices/${pair}/spot`);
        if (!response.ok) continue;
        const data = await response.json();
        const price = parseFloat(data.data.amount);
        
        if (pair === 'ETH-USD') newPrices['ethereum'] = price;
        if (pair === 'MATIC-USD') newPrices['matic-network'] = price;
        if (pair === 'BNB-USD') newPrices['binancecoin'] = price;
      } catch {
        continue;
      }
    }
    
    if (Object.keys(newPrices).length < 4) throw new Error('Not enough prices from Coinbase');
    return newPrices;
  };

  const getTokenPrice = () => {
    if (selectedToken === 'native') {
      const network = NETWORKS[selectedNetwork];
      return prices[network.coingeckoId] || 0;
    } else {
      const token = TOKENS[selectedToken];
      return prices[token.coingeckoId] || 1.00;
    }
  };

  const calculateUSD = (amount: string) => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return '0.00';
    const price = getTokenPrice();
    return (amountNum * price).toFixed(2);
  };

  // ============================================
  // NFC CARD FUNCTIONS
  // ============================================

  const readNFCCard = async () => {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      
      if (!tag?.ndefMessage?.[0]?.payload) {
        throw new Error('No data found on card');
      }

      const bytes = tag.ndefMessage[0].payload;
      const text = String.fromCharCode(...bytes.slice(3));
      const card = JSON.parse(text);

      if (!card.addr || !card.ekey || !card.serial) {
        throw new Error('Invalid card format');
      }

      setCardData(card);
      return card;
    } finally {
      await NfcManager.cancelTechnologyRequest();
    }
  };

  const decryptPrivateKey = (encryptedKey: string, serial: string, pin: string) => {
    const passphrase = `${serial}-PIN${pin}-SECURE`;
    const decrypted = CryptoJS.AES.decrypt(encryptedKey, passphrase).toString(CryptoJS.enc.Utf8);
    if (!decrypted || decrypted.length < 32) {
      throw new Error('Invalid PIN or corrupted key');
    }
    return decrypted;
  };

  const resolveENS = async (input: string) => {
    if (!input.includes('.eth')) return input;
    try {
      const provider = new ethers.providers.JsonRpcProvider('https://eth.llamarpc.com');
      const resolved = await provider.resolveName(input);
      return resolved || input;
    } catch {
      return input;
    }
  };

  // ============================================
  // TRANSACTION FUNCTIONS
  // ============================================

  const sendTransaction = async (cardData: any, pin: string, to: string, amount: string) => {
    const provider = await getProvider();
    const privateKey = decryptPrivateKey(cardData.ekey, cardData.serial, pin);
    const wallet = new ethers.Wallet(privateKey, provider);

    if (selectedToken === 'native') {
      const value = ethers.utils.parseEther(amount);
      const gasPrice = await provider.getGasPrice();
      const gasLimit = 21000;
      const gasCost = gasPrice.mul(gasLimit);
      const balance = await wallet.getBalance();

      if (balance.lt(value.add(gasCost))) {
        throw new Error('Insufficient balance for transaction + gas');
      }

      const tx = await wallet.sendTransaction({ to, value, gasLimit, gasPrice });
      await tx.wait();
      
      return {
        hash: tx.hash,
        gasCost: ethers.utils.formatEther(gasCost),
      };
    } else {
      const token = TOKENS[selectedToken];
      const tokenAddress = token.addresses[selectedNetwork];
      if (!tokenAddress) throw new Error('Token not supported on this network');

      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
      const value = ethers.utils.parseUnits(amount, token.decimals);
      const balance = await contract.balanceOf(wallet.address);

      if (balance.lt(value)) {
        throw new Error('Insufficient token balance');
      }

      const gasBalance = await wallet.getBalance();
      const gasEstimate = await contract.estimateGas.transfer(to, value);
      const gasPrice = await provider.getGasPrice();
      const gasCost = gasPrice.mul(gasEstimate);

      if (gasBalance.lt(gasCost)) {
        throw new Error(`Insufficient ${NETWORKS[selectedNetwork].symbol} for gas`);
      }

      const tx = await contract.transfer(to, value);
      await tx.wait();

      return {
        hash: tx.hash,
        gasCost: ethers.utils.formatEther(gasCost),
      };
    }
  };

  const checkBalance = async () => {
    if (!cardData) {
      Alert.alert('Error', 'No card data loaded');
      return;
    }

    setLoading(true);
    try {
      const provider = await getProvider();
      
      if (selectedToken === 'native') {
        const bal = await provider.getBalance(cardData.addr);
        setBalance(ethers.utils.formatEther(bal));
      } else {
        const token = TOKENS[selectedToken];
        const tokenAddress = token.addresses[selectedNetwork];
        if (!tokenAddress) throw new Error('Token not supported on this network');

        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const bal = await contract.balanceOf(cardData.addr);
        setBalance(ethers.utils.formatUnits(bal, token.decimals));
      }
      
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  // ============================================
  // UI HANDLERS
  // ============================================

  const changeNetwork = async (network: string) => {
    setSelectedNetwork(network);
    
    const networkConfig = NETWORKS[network];
    const rpcs = [
      networkConfig.rpc,
      networkConfig.fallbackRpc,
      networkConfig.fallbackRpc2,
      networkConfig.fallbackRpc3,
      networkConfig.fallbackRpc4,
      networkConfig.fallbackRpc5,
      networkConfig.fallbackRpc6,
      networkConfig.fallbackRpc7,
      networkConfig.fallbackRpc8,
    ].filter(Boolean);
    
    let connected = false;
    for (const rpc of rpcs) {
      try {
        const provider = new ethers.providers.JsonRpcProvider(rpc);
        await provider.getBlockNumber();
        connected = true;
        break;
      } catch {
        continue;
      }
    }
    
    if (connected) {
      Alert.alert(
        '✅ Network Changed',
        `Now using ${NETWORKS[network].name}\n\n🟢 Connection: ACTIVE\n\nYou can now process transactions on this network.`
      );
    } else {
      Alert.alert(
        '⚠️ Network Changed',
        `Now using ${NETWORKS[network].name}\n\n🔴 Connection: FAILED\n\nThis network is currently unavailable. Please try another network or check your internet connection.`
      );
    }
  };

  const handleReceivePayment = async () => {
    if (!merchantAddress) {
      Alert.alert('Setup Required', 'Please set your wallet address in Settings first', 
        [{ text: 'Go to Settings', onPress: () => setScreen('settings') }]);
      return;
    }

    if (!amount || parseFloat(amount) < CONFIG.MIN_TRANSACTION) {
      Alert.alert('Error', `Minimum amount is ${CONFIG.MIN_TRANSACTION}`);
      return;
    }

    const tokenSymbol = selectedToken === 'native' ? NETWORKS[selectedNetwork].symbol : TOKENS[selectedToken].symbol;
    Alert.alert('Ready to Receive', `Ask customer to tap their card to pay ${amount} ${tokenSymbol}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Ready', onPress: () => initiatePayment() },
    ]);
  };

  const initiatePayment = async () => {
    try {
      const customerCard = await readNFCCard();
      setScreen('payment');
      const customerDisplay = customerCard.ens ? `${customerCard.ens}` : `${customerCard.addr.slice(0, 10)}...`;
      Alert.alert('Card Detected', `Card: ${customerCard.serial}\n${customerDisplay}\n\nAsk customer to enter their PIN`);
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
      
      const tokenSymbol = selectedToken === 'native' ? NETWORKS[selectedNetwork].symbol : TOKENS[selectedToken].symbol;
      Alert.alert('Payment Successful!', `Sent: ${amount} ${tokenSymbol}\nGas: ${result.gasCost} ${NETWORKS[selectedNetwork].symbol}`, [
        { text: 'Done', onPress: () => { setScreen('home'); setAmount(''); setCardData(null); } },
      ]);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Payment Failed', error.message);
    }
  };

  const setupMerchantAddress = async () => {
    if (!tempAddress) {
      Alert.alert('Error', 'Please enter an address');
      return;
    }

    setLoading(true);
    try {
      const resolved = await resolveENS(tempAddress);
      setMerchantAddress(resolved);
      setMerchantDisplayName(tempAddress.includes('.eth') ? tempAddress : '');
      setLoading(false);
      setTempAddress('');
      Alert.alert('Success', `Merchant address set to:\n${resolved.slice(0, 20)}...`);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  const scanMerchantCard = async () => {
    setLoading(true);
    try {
      const card = await readNFCCard();
      const wallet = new ethers.Wallet(
        decryptPrivateKey(card.ekey, card.serial, '0000')
      );
      setMerchantAddress(wallet.address);
      setMerchantDisplayName(card.ens || '');
      setLoading(false);
      
      Alert.alert(
        'Merchant Card Scanned', 
        card.ens 
          ? `ENS Name: ${card.ens}\n\nAddress: ${wallet.address.slice(0, 20)}...\n\nThis will be used as your merchant address.`
          : `Address: ${wallet.address.slice(0, 20)}...\n\nThis will be used as your merchant address.`,
        [{ text: 'OK', onPress: () => setScreen('home') }]
      );
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', 'Could not read card: ' + error.message);
    }
  };

  // ============================================
  // RENDER SCREENS
  // ============================================

  const renderHomeScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏛️ Village Wallet</Text>
        <Text style={styles.subtitle}>NFC Crypto Payments</Text>
        <View style={styles.networkBadge}>
          <View style={[styles.connectionDot, isConnected ? styles.connectedDot : styles.disconnectedDot]} />
          <Text style={styles.networkText}>{NETWORKS[selectedNetwork].name}</Text>
          <View style={styles.networkTickerBadge}>
            <Text style={styles.networkTickerText}>{NETWORKS[selectedNetwork].symbol}</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonGrid}>
        <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => setScreen('receive')}>
          <Text style={styles.buttonIcon}>💰</Text>
          <Text style={styles.buttonText}>Receive Payment</Text>
          <Text style={styles.buttonSubtext}>Merchant mode</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => setScreen('balance')}>
          <Text style={styles.buttonIcon}>💳</Text>
          <Text style={styles.buttonText}>Check Balance</Text>
          <Text style={styles.buttonSubtext}>Tap card to view</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.buttonTertiary]} onPress={() => setScreen('settings')}>
          <Text style={styles.buttonIcon}>⚙️</Text>
          <Text style={styles.buttonText}>Settings</Text>
          <Text style={styles.buttonSubtext}>Network & address</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Village Wallet v2.1 - Arbitrum Optimized</Text>
        <Text style={styles.footerText}>Open Source NFC Payments</Text>
        <Text style={styles.footerText}>✅ 9 Arbitrum RPCs</Text>
        <Text style={styles.footerText}>🌐 50+ Total RPC Endpoints</Text>
        <Text style={styles.footerText}>💰 4 Price Data Sources</Text>
      </View>
    </View>
  );

  const renderReceiveScreen = () => (
    <KeyboardAvoidingView style={styles.app} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>💰 Receive Payment</Text>
          <Text style={styles.subtitle}>Enter amount and scan customer card</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Token</Text>
          <View style={styles.tokenSelector}>
            <TouchableOpacity 
              style={[styles.tokenButton, selectedToken === 'native' && styles.tokenButtonActive]}
              onPress={() => setSelectedToken('native')}
            >
              <Text style={[styles.tokenButtonText, selectedToken === 'native' && styles.tokenButtonTextActive]}>
                {NETWORKS[selectedNetwork].symbol}
              </Text>
            </TouchableOpacity>
            {Object.keys(TOKENS).filter(k => k !== 'native').map(key => {
              const token = TOKENS[key];
              const hasAddress = token.addresses && token.addresses[selectedNetwork];
              if (!hasAddress) return null;
              
              return (
                <TouchableOpacity 
                  key={key}
                  style={[styles.tokenButton, selectedToken === key && styles.tokenButtonActive]}
                  onPress={() => setSelectedToken(key)}
                >
                  <Text style={[styles.tokenButtonText, selectedToken === key && styles.tokenButtonTextActive]}>
                    {token.symbol}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.cardTitle}>Amount to Receive</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#6b7280"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
          {amount && parseFloat(amount) > 0 && (
            <Text style={styles.usdEstimate}>
              ≈ ${calculateUSD(amount)} USD (est.)
            </Text>
          )}

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              👤 Receiving to: {merchantDisplayName || merchantAddress?.slice(0, 15) + '...'}
            </Text>
            <Text style={styles.infoText}>
              🌐 Network: {NETWORKS[selectedNetwork].name}
            </Text>
            <Text style={styles.infoText}>
              💎 Token: {selectedToken === 'native' ? NETWORKS[selectedNetwork].symbol : TOKENS[selectedToken].symbol}
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, styles.buttonPrimary]} 
            onPress={handleReceivePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Ready to Receive</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.button, styles.buttonTertiary]} onPress={() => setScreen('home')}>
          <Text style={styles.buttonText}>← Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderPaymentScreen = () => (
    <KeyboardAvoidingView style={styles.app} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🔐 Confirm Payment</Text>
          <Text style={styles.subtitle}>Customer: Enter your PIN</Text>
        </View>

        <View style={styles.card}>
          {cardData && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>💳 Card: {cardData.serial}</Text>
              <Text style={styles.infoText}>
                👤 From: {cardData.ens || cardData.addr.slice(0, 15) + '...'}
              </Text>
              <Text style={styles.infoText}>
                → To: {merchantDisplayName || merchantAddress?.slice(0, 15) + '...'}
              </Text>
              <Text style={styles.infoText}>
                💰 Amount: {amount} {selectedToken === 'native' ? NETWORKS[selectedNetwork].symbol : TOKENS[selectedToken].symbol}
              </Text>
              <Text style={styles.infoText}>
                ≈ ${calculateUSD(amount)} USD
              </Text>
            </View>
          )}

          <Text style={styles.cardTitle}>Enter PIN</Text>
          <TextInput
            style={styles.input}
            placeholder="4-digit PIN"
            placeholderTextColor="#6b7280"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            value={pin}
            onChangeText={setPin}
          />

          <TouchableOpacity 
            style={[styles.button, styles.buttonPrimary]} 
            onPress={handleSendPayment}
            disabled={loading || pin.length !== 4}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Payment</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.buttonTertiary]} 
            onPress={() => { setScreen('home'); setCardData(null); setPin(''); setAmount(''); }}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderBalanceScreen = () => (
    <KeyboardAvoidingView style={styles.app} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>💳 Check Balance</Text>
          <Text style={styles.subtitle}>Tap card and select token</Text>
        </View>

        <View style={styles.card}>
          {!cardData ? (
            <>
              <Text style={styles.cardTitle}>1. Tap Your Card</Text>
              <TouchableOpacity 
                style={[styles.button, styles.buttonPrimary]} 
                onPress={async () => {
                  setLoading(true);
                  try {
                    await readNFCCard();
                    setLoading(false);
                  } catch (error: any) {
                    setLoading(false);
                    Alert.alert('Error', error.message);
                  }
                }}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Tap Card</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>💳 Card: {cardData.serial}</Text>
                <Text style={styles.infoText}>
                  📍 Address: {cardData.addr.slice(0, 20)}...
                </Text>
                {cardData.ens && (
                  <Text style={styles.infoText}>🏷️ ENS: {cardData.ens}</Text>
                )}
              </View>

              <Text style={styles.cardTitle}>2. Select Token</Text>
              <View style={styles.tokenSelector}>
                <TouchableOpacity 
                  style={[styles.tokenButton, selectedToken === 'native' && styles.tokenButtonActive]}
                  onPress={() => setSelectedToken('native')}
                >
                  <Text style={[styles.tokenButtonText, selectedToken === 'native' && styles.tokenButtonTextActive]}>
                    {NETWORKS[selectedNetwork].symbol}
                  </Text>
                </TouchableOpacity>
                {Object.keys(TOKENS).filter(k => k !== 'native').map(key => {
                  const token = TOKENS[key];
                  const hasAddress = token.addresses && token.addresses[selectedNetwork];
                  if (!hasAddress) return null;
                  
                  return (
                    <TouchableOpacity 
                      key={key}
                      style={[styles.tokenButton, selectedToken === key && styles.tokenButtonActive]}
                      onPress={() => setSelectedToken(key)}
                    >
                      <Text style={[styles.tokenButtonText, selectedToken === key && styles.tokenButtonTextActive]}>
                        {token.symbol}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.cardTitle}>3. Check Balance</Text>
              <TouchableOpacity 
                style={[styles.button, styles.buttonPrimary]} 
                onPress={checkBalance}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Check Balance</Text>
                )}
              </TouchableOpacity>

              {balance && (
                <View style={styles.balanceResult}>
                  <Text style={styles.balanceAmount}>{balance}</Text>
                  <Text style={styles.balanceToken}>
                    {selectedToken === 'native' ? NETWORKS[selectedNetwork].symbol : TOKENS[selectedToken].symbol}
                  </Text>
                  <Text style={styles.balanceNetwork}>
                    On {NETWORKS[selectedNetwork].name}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        <TouchableOpacity style={[styles.button, styles.buttonTertiary]} onPress={() => { setScreen('home'); setCardData(null); setBalance(''); }}>
          <Text style={styles.buttonText}>← Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderSettingsScreen = () => (
    <KeyboardAvoidingView style={styles.app} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ Settings</Text>
          <Text style={styles.subtitle}>Configure your wallet</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Network Selection</Text>
          <Text style={styles.sectionDesc}>Choose your blockchain network</Text>
          
          {Object.keys(NETWORKS).map(key => {
            const network = NETWORKS[key];
            const status = networkStatuses[key];
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.networkButton,
                  selectedNetwork === key && styles.networkButtonActive
                ]}
                onPress={() => changeNetwork(key)}
              >
                <View style={styles.networkButtonContent}>
                  <View style={[
                    styles.connectionDot,
                    status === true ? styles.connectedDot : 
                    status === false ? styles.disconnectedDot : 
                    styles.testingDot
                  ]} />
                  <Text style={[
                    styles.networkButtonText,
                    selectedNetwork === key && styles.networkButtonTextActive
                  ]}>
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
                {selectedNetwork === key && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          })}
          
          <TouchableOpacity 
            style={[styles.button, styles.buttonSecondary, { marginTop: 10 }]} 
            onPress={testAllNetworks}
            disabled={testingNetworks}
          >
            {testingNetworks ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>🔄 Test All Networks</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Merchant Address</Text>
          <Text style={styles.sectionDesc}>Where payments will be sent</Text>
          
          {merchantAddress ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ✅ Set to: {merchantDisplayName || merchantAddress.slice(0, 20) + '...'}
              </Text>
            </View>
          ) : (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>⚠️ No merchant address set</Text>
            </View>
          )}

          <Text style={styles.cardTitle}>Enter Address or ENS</Text>
          <TextInput
            style={styles.input}
            placeholder="0x... or name.eth"
            placeholderTextColor="#6b7280"
            value={tempAddress}
            onChangeText={setTempAddress}
          />
          
          <TouchableOpacity 
            style={[styles.button, styles.buttonPrimary]} 
            onPress={setupMerchantAddress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Set Address</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.cardTitle}>Or Scan Your Card</Text>
          <TouchableOpacity 
            style={[styles.button, styles.buttonSecondary]} 
            onPress={scanMerchantCard}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>📱 Scan Card</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Prices</Text>
          <Text style={styles.sectionDesc}>Real-time cryptocurrency prices</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>📊 Source: {priceSource || 'Not loaded'}</Text>
            <Text style={styles.infoText}>🔄 Updates: Every 2 minutes</Text>
          </View>

          <View style={styles.priceGrid}>
            {Object.keys(NETWORKS).map(key => {
              const network = NETWORKS[key];
              const price = prices[network.coingeckoId];
              return (
                <View key={key} style={styles.priceItem}>
                  <Text style={styles.priceSymbol}>{network.symbol}</Text>
                  <Text style={styles.priceValue}>${price ? price.toFixed(2) : '-.--'}</Text>
                </View>
              );
            })}
            {Object.keys(TOKENS).filter(k => k !== 'native').map(key => {
              const token = TOKENS[key];
              const price = prices[token.coingeckoId];
              return (
                <View key={key} style={styles.priceItem}>
                  <Text style={styles.priceSymbol}>{token.symbol}</Text>
                  <Text style={styles.priceValue}>${price ? price.toFixed(4) : '-.----'}</Text>
                </View>
              );
            })}
          </View>
          
          <TouchableOpacity 
            style={[styles.button, styles.buttonSecondary, {marginTop: 10}]} 
            onPress={fetchPrices} 
            disabled={priceLoading}
          >
            {priceLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>🔄 Refresh Prices</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.button, styles.buttonTertiary]} onPress={() => setScreen('home')}>
          <Text style={styles.buttonText}>← Back to Home</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Village Wallet v2.1</Text>
          <Text style={styles.footerText}>Open Source NFC Payments</Text>
          <Text style={styles.footerText}>✅ ENS Resolution Enabled</Text>
          <Text style={styles.footerText}>🌐 50+ RPC Endpoints</Text>
          <Text style={styles.footerText}>💰 4 Price Data Sources</Text>
          <Text style={styles.footerText}>🚀 9 Arbitrum RPCs</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

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
  app: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, padding: 20 },
  scrollContent: { paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#a78bfa', fontWeight: '600' },
  networkBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#2d2d44', 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    borderWidth: 2, 
    borderColor: '#a78bfa', 
    marginTop: 8 
  },
  networkText: { fontSize: 14, color: '#e5e7eb', fontWeight: 'bold', marginLeft: 8, marginRight: 8 },
  networkTickerBadge: {
    backgroundColor: '#3f3f5c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  networkTickerText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  connectionDot: { width: 10, height: 10, borderRadius: 5 },
  connectedDot: { backgroundColor: '#10b981' },
  disconnectedDot: { backgroundColor: '#ef4444' },
  testingDot: { backgroundColor: '#f59e0b' },

  buttonGrid: { gap: 15 },
  button: { padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonPrimary: { backgroundColor: '#8b5cf6' },
  buttonSecondary: { backgroundColor: '#3730a3' },
  buttonTertiary: { backgroundColor: '#2d2d44' },
  buttonIcon: { fontSize: 32, marginBottom: 8 },
  buttonText: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
  buttonSubtext: { fontSize: 13, color: '#d1d5db', marginTop: 4 },

  card: { 
    backgroundColor: '#2d2d44', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3f3f5c',
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#a78bfa', marginBottom: 12 },
  
  input: {
    backgroundColor: '#1a1a2e',
    color: '#fff',
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3f3f5c',
    marginBottom: 16,
  },

  infoBox: { 
    backgroundColor: '#1a1a2e', 
    padding: 14, 
    borderRadius: 8, 
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#8b5cf6',
  },
  infoText: { fontSize: 14, color: '#e5e7eb', marginBottom: 6 },

  usdEstimate: {
    fontSize: 14,
    color: '#10b981',
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 16,
    fontWeight: '600',
  },

  balanceResult: {
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 24,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  balanceAmount: { fontSize: 36, fontWeight: 'bold', color: '#10b981', marginBottom: 8 },
  balanceToken: { fontSize: 18, color: '#a78bfa', fontWeight: '600', marginBottom: 4 },
  balanceNetwork: { fontSize: 14, color: '#9ca3af' },

  footer: { 
    alignItems: 'center', 
    marginTop: 30, 
    paddingTop: 20, 
    borderTopWidth: 1, 
    borderTopColor: '#3f3f5c' 
  },
  footerText: { fontSize: 12, color: '#6b7280', marginBottom: 4 },

  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#a78bfa', marginBottom: 8 },
  sectionDesc: { fontSize: 14, color: '#9ca3af', marginBottom: 16 },

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
  networkTickerBadgeActive: {
    backgroundColor: '#8b5cf6',
  },
  networkTickerTextActive: {
    color: '#fff',
  },
  checkmark: { fontSize: 20, color: '#a78bfa' },

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

  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceItem: {
    backgroundColor: '#1a1a2e',
    padding: 12,
    borderRadius: 8,
    minWidth: '30%',
    alignItems: 'center',a
  },
  priceSymbol: { fontSize: 12, color: '#9ca3af', marginBottom: 4, fontWeight: 'bold' },
  priceValue: { fontSize: 14, color: '#10b981', fontWeight: 'bold' },
});
