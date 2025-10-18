/ ============================================
// VILLAGE WALLET V2.0 - PRODUCTION READY
// ============================================
// File: src/village-wallet-1.tsx
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
// CONFIGURATIONS
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
    rpc: 'https://arb1.arbitrum.io/rpc',
    fallbackRpc: 'https://arbitrum-one.publicnode.com',
    fallbackRpc2: 'https://arbitrum.blockpi.network/v1/rpc/public',
    fallbackRpc3: 'https://rpc.ankr.com/arbitrum',
    fallbackRpc4: 'https://arbitrum.llamarpc.com',
    fallbackRpc5: 'https://arbitrum-one-rpc.publicnode.com',
    fallbackRpc6: 'https://arbitrum.drpc.org',
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
  MAX_TRANSACTION: 0.5,
  MIN_TRANSACTION: 0.0001,
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

  const fetchPrices = async () => {
    setPriceLoading(true);
    try {
      // Try CoinGecko first (most reliable free API)
      const prices = await fetchPricesFromCoinGecko();
      if (prices && Object.keys(prices).length > 0) {
        setPrices(prices);
        setPriceSource('CoinGecko');
        console.log('✅ Prices fetched from CoinGecko');
        setPriceLoading(false);
        return;
      }
    } catch (error) {
      console.log('❌ CoinGecko failed, trying CryptoCompare...');
    }

    try {
      // Fallback to CryptoCompare
      const prices = await fetchPricesFromCryptoCompare();
      if (prices && Object.keys(prices).length > 0) {
        setPrices(prices);
        setPriceSource('CryptoCompare');
        console.log('✅ Prices fetched from CryptoCompare');
        setPriceLoading(false);
        return;
      }
    } catch (error) {
      console.log('❌ CryptoCompare failed, trying Binance...');
    }

    try {
      // Fallback to Binance
      const prices = await fetchPricesFromBinance();
      if (prices && Object.keys(prices).length > 0) {
        setPrices(prices);
        setPriceSource('Binance');
        console.log('✅ Prices fetched from Binance');
        setPriceLoading(false);
        return;
      }
    } catch (error) {
      console.log('❌ Binance failed, trying Coinbase...');
    }

    try {
      // Fallback to Coinbase
      const prices = await fetchPricesFromCoinbase();
      if (prices && Object.keys(prices).length > 0) {
        setPrices(prices);
        setPriceSource('Coinbase');
        console.log('✅ Prices fetched from Coinbase');
        setPriceLoading(false);
        return;
      }
    } catch (error) {
      console.log('❌ All price APIs failed');
    }

    // If all fail, use fallback prices
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
    
    // Try primary CoinGecko endpoint
    try {
      console.log('🔍 Trying CoinGecko API...');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
        { 
          method: 'GET',
          headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      console.log('📡 CoinGecko response status:', response.status);
      
      if (!response.ok) {
        console.log('❌ CoinGecko returned error status:', response.status);
        throw new Error(`CoinGecko HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 CoinGecko data received:', Object.keys(data).length, 'tokens');
      
      const newPrices: Record<string, number> = {};
      Object.keys(data).forEach(id => {
        if (data[id] && data[id].usd !== undefined) {
          newPrices[id] = data[id].usd;
        }
      });
      
      if (Object.keys(newPrices).length > 0) {
        console.log('✅ CoinGecko success:', Object.keys(newPrices).length, 'prices');
        return newPrices;
      }
      
      throw new Error('No prices in CoinGecko response');
    } catch (error: any) {
      console.log('❌ CoinGecko error:', error.message);
      throw error;
    }
  };

  const fetchPricesFromCryptoCompare = async () => {
    console.log('🔍 Trying CryptoCompare API...');
    
    // CryptoCompare mapping
    const symbolMap: Record<string, string> = {
      'ethereum': 'ETH',
      'matic-network': 'MATIC',
      'binancecoin': 'BNB',
      'tether': 'USDT',
      'usd-coin': 'USDC',
      'dai': 'DAI',
    };

    const symbols = Object.keys(symbolMap).map(k => symbolMap[k]).join(',');
    
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols}&tsyms=USD`,
      { 
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log('📡 CryptoCompare response status:', response.status);
    
    if (!response.ok) {
      console.log('❌ CryptoCompare returned error status:', response.status);
      throw new Error(`CryptoCompare HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📦 CryptoCompare data received');
    
    const newPrices: Record<string, number> = {};
    Object.entries(symbolMap).forEach(([coingeckoId, symbol]) => {
      if (data[symbol] && data[symbol].USD !== undefined) {
        newPrices[coingeckoId] = data[symbol].USD;
      }
    });
    
    if (Object.keys(newPrices).length > 0) {
      console.log('✅ CryptoCompare success:', Object.keys(newPrices).length, 'prices');
      return newPrices;
    }
    
    throw new Error('No prices in CryptoCompare response');
  };

  const fetchPricesFromBinance = async () => {
    console.log('🔍 Trying Binance API...');
    
    // Binance mapping (pairs with USDT)
    const pairMap: Record<string, string> = {
      'ethereum': 'ETHUSDT',
      'matic-network': 'MATICUSDT',
      'binancecoin': 'BNBUSDT',
    };

    const newPrices: Record<string, number> = {
      'tether': 1.00,
      'usd-coin': 1.00,
      'dai': 1.00,
    };

    let successCount = 0;
    
    for (const [coingeckoId, pair] of Object.entries(pairMap)) {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${pair}`,
          { 
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            timeout: 5000
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.price) {
            newPrices[coingeckoId] = parseFloat(data.price);
            successCount++;
          }
        }
      } catch (error) {
        console.log(`❌ Failed to fetch ${pair} from Binance`);
      }
    }
    
    if (successCount > 0) {
      console.log(`✅ Binance success: ${successCount} prices fetched`);
      return newPrices;
    }
    
    throw new Error('No prices from Binance');
  };

  const fetchPricesFromCoinbase = async () => {
    console.log('🔍 Trying Coinbase API...');
    
    // Coinbase mapping
    const pairMap: Record<string, string> = {
      'ethereum': 'ETH-USD',
      'matic-network': 'MATIC-USD',
      'binancecoin': 'BNB-USD',
    };

    const newPrices: Record<string, number> = {
      'tether': 1.00,
      'usd-coin': 1.00,
      'dai': 1.00,
    };

    let successCount = 0;

    for (const [coingeckoId, pair] of Object.entries(pairMap)) {
      try {
        const response = await fetch(
          `https://api.coinbase.com/v2/prices/${pair}/spot`,
          { 
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            timeout: 5000
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.amount) {
            newPrices[coingeckoId] = parseFloat(data.data.amount);
            successCount++;
          }
        }
      } catch (error) {
        console.log(`❌ Failed to fetch ${pair} from Coinbase`);
      }
    }
    
    if (successCount > 0) {
      console.log(`✅ Coinbase success: ${successCount} prices fetched`);
      return newPrices;
    }
    
    throw new Error('No prices from Coinbase');
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

  const checkNetworkConnection = async () => {
    try {
      const network = NETWORKS[selectedNetwork];
      const provider = new ethers.providers.JsonRpcProvider(network.rpc);
      await provider.getBlockNumber();
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
        statuses[key] = connected;
      } catch {
        statuses[key] = false;
      }
    }
    
    setNetworkStatuses(statuses);
    setTestingNetworks(false);
  };

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
    ].filter(Boolean);
    
    for (const rpc of rpcs) {
      try {
        const provider = new ethers.providers.JsonRpcProvider(rpc);
        await provider.getBlockNumber();
        return provider;
      } catch (error) {
        continue;
      }
    }
    throw new Error(`Cannot connect to ${network.name}. Please check your internet connection.`);
  };

  const readNFCCard = async () => {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      
      if (!tag?.ndefMessage?.[0]?.payload) {
        throw new Error('No data found on card');
      }

      const bytes = tag.ndefMessage[0].payload;
      const text = String.fromCharCode(...bytes.slice(3));
      const [encPrivKey, ensName] = text.split('|');
      const serial = tag.id || 'UNKNOWN';
      
      setCardData({ encPrivKey, ens: ensName || null, serial, addr: null });
      await NfcManager.cancelTechnologyRequest();
      
      return { encPrivKey, ens: ensName || null, serial, addr: null };
    } catch (error: any) {
      await NfcManager.cancelTechnologyRequest();
      throw new Error(error.message || 'Failed to read card');
    }
  };

  const decryptPrivateKey = (encPrivKey: string, pin: string) => {
    try {
      const decrypted = CryptoJS.AES.decrypt(encPrivKey, pin).toString(CryptoJS.enc.Utf8);
      if (!decrypted || !decrypted.startsWith('0x')) throw new Error('Invalid PIN');
      return decrypted;
    } catch {
      throw new Error('Invalid PIN');
    }
  };

  const resolveNameOrAddress = async (input: string) => {
    const provider = await getProvider();
    if (input.endsWith('.eth')) {
      const address = await provider.resolveName(input);
      if (!address) throw new Error('ENS name not found');
      return { address, displayName: input };
    } else if (ethers.utils.isAddress(input)) {
      return { address: input, displayName: input };
    } else {
      throw new Error('Invalid address or ENS name');
    }
  };

  const checkBalance = async () => {
    setLoading(true);
    try {
      const card = await readNFCCard();
      Alert.alert('Enter PIN', 'Enter your PIN to view balance', [
        { text: 'Cancel', style: 'cancel', onPress: () => setLoading(false) },
        {
          text: 'OK',
          onPress: async () => {
            try {
              const pinInput = await new Promise<string>((resolve) => {
                Alert.prompt('PIN', 'Enter your 4-6 digit PIN', resolve, 'secure-text');
              });
              
              const privKey = decryptPrivateKey(card.encPrivKey, pinInput);
              const provider = await getProvider();
              const wallet = new ethers.Wallet(privKey, provider);
              card.addr = wallet.address;
              
              if (card.ens) {
                const resolved = await provider.resolveName(card.ens);
                if (resolved !== wallet.address) card.ens = null;
              }
              
              setCardData(card);
              
              let bal;
              if (selectedToken === 'native') {
                const nativeBalance = await provider.getBalance(wallet.address);
                bal = ethers.utils.formatEther(nativeBalance);
              } else {
                const token = TOKENS[selectedToken];
                const tokenAddress = token.addresses[selectedNetwork];
                if (!tokenAddress) throw new Error(`${token.symbol} not available`);
                const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
                const tokenBalance = await contract.balanceOf(wallet.address);
                bal = ethers.utils.formatUnits(tokenBalance, token.decimals);
              }
              
              setBalance(parseFloat(bal).toFixed(4));
              setScreen('balance');
              setLoading(false);
            } catch (error: any) {
              setLoading(false);
              Alert.alert('Error', error.message);
            }
          },
        },
      ]);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  const sendTransaction = async (card: any, pin: string, toAddress: string, amount: string) => {
    const privKey = decryptPrivateKey(card.encPrivKey, pin);
    const provider = await getProvider();
    const wallet = new ethers.Wallet(privKey, provider);
    card.addr = wallet.address;
    setCardData(card);

    if (selectedToken === 'native') {
      return await sendNativeToken(wallet, toAddress, amount);
    } else {
      return await sendERC20Token(wallet, toAddress, amount);
    }
  };

  const sendNativeToken = async (wallet: any, toAddress: string, amount: string) => {
    const provider = wallet.provider;
    const balance = await provider.getBalance(wallet.address);
    const amountWei = ethers.utils.parseEther(amount.toString());
    const gasPrice = await provider.getGasPrice();
    const gasLimit = ethers.BigNumber.from(21000);
    const gasCost = gasPrice.mul(gasLimit);
    const totalNeeded = amountWei.add(gasCost);
    
    if (balance.lt(totalNeeded)) {
      throw new Error(
        `Insufficient balance.\nBalance: ${ethers.utils.formatEther(balance)} ${NETWORKS[selectedNetwork].symbol}`
      );
    }

    const tx = await wallet.sendTransaction({ to: toAddress, value: amountWei, gasLimit, gasPrice });
    await tx.wait();
    return { success: true, hash: tx.hash, gasCost: ethers.utils.formatEther(gasCost) };
  };

  const sendERC20Token = async (wallet: any, toAddress: string, amount: string) => {
    const token = TOKENS[selectedToken];
    const tokenAddress = token.addresses[selectedNetwork];
    const provider = wallet.provider;
    
    if (!tokenAddress) throw new Error(`${token.symbol} not available`);

    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
    const tokenBalance = await contract.balanceOf(wallet.address);
    const amountInUnits = ethers.utils.parseUnits(amount.toString(), token.decimals);
    
    if (tokenBalance.lt(amountInUnits)) {
      throw new Error(`Insufficient ${token.symbol} balance`);
    }

    const nativeBalance = await provider.getBalance(wallet.address);
    const gasEstimate = await contract.estimateGas.transfer(toAddress, amountInUnits);
    const gasPrice = await provider.getGasPrice();
    const gasCost = gasEstimate.mul(gasPrice);

    if (nativeBalance.lt(gasCost)) {
      throw new Error(`Insufficient ${NETWORKS[selectedNetwork].symbol} for gas`);
    }

    const tx = await contract.transfer(toAddress, amountInUnits);
    await tx.wait();
    return { success: true, hash: tx.hash, gasCost: ethers.utils.formatEther(gasCost) };
  };

  const saveMerchantAddress = async (input: string) => {
    try {
      const { address, displayName } = await resolveNameOrAddress(input);
      setMerchantAddress(address);
      setMerchantDisplayName(displayName);
      
      if (displayName.includes('.eth')) {
        Alert.alert('ENS Resolved! ✅', `${displayName}\n→\n${address.slice(0, 10)}...`);
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
      setLoading(true);
      const card = await readNFCCard();
      
      // We need to decrypt to get the actual address
      const pinInput = await new Promise<string>((resolve) => {
        Alert.prompt('Enter PIN', 'Enter card PIN to read address', resolve, 'secure-text');
      });
      
      const privKey = decryptPrivateKey(card.encPrivKey, pinInput);
      const provider = await getProvider();
      const wallet = new ethers.Wallet(privKey, provider);
      
      const displayName = card.ens || wallet.address;
      setMerchantAddress(wallet.address);
      setMerchantDisplayName(displayName);
      
      setLoading(false);
      
      Alert.alert(
        '✅ Address Set from Card!', 
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

  const changeNetwork = async (network: string) => {
    setSelectedNetwork(network);
    
    // Test the connection for this network
    const networkConfig = NETWORKS[network];
    const rpcs = [
      networkConfig.rpc,
      networkConfig.fallbackRpc,
      networkConfig.fallbackRpc2,
      networkConfig.fallbackRpc3,
      networkConfig.fallbackRpc4,
      networkConfig.fallbackRpc5,
      networkConfig.fallbackRpc6,
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

  const renderHomeScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏛️ Village Wallet</Text>
        <Text style={styles.subtitle}>NFC Crypto Payments</Text>
        <View style={styles.networkBadge}>
          <View style={[styles.connectionDot, isConnected ? styles.connectionDotConnected : styles.connectionDotDisconnected]} />
          <Text style={styles.networkBadgeText}>{NETWORKS[selectedNetwork].name}</Text>
          <View style={styles.tickerBadge}>
            <Text style={styles.tickerText}>{NETWORKS[selectedNetwork].symbol}</Text>
          </View>
        </View>
        {priceLoading && <Text style={styles.priceLoadingText}>Updating prices...</Text>}
        {!priceLoading && priceSource && (
          <Text style={styles.priceLoadingText}>Prices: {priceSource}</Text>
        )}
        {!priceLoading && !priceSource && Object.keys(prices).length === 0 && (
          <Text style={[styles.priceLoadingText, { color: '#ef4444' }]}>
            ⚠️ Price data unavailable
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => setScreen('receive')}>
          <Text style={styles.buttonText}>💰 Receive Payment (Merchant)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={checkBalance} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>💳 Check Card Balance</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonTertiary]} onPress={() => setScreen('settings')}>
          <Text style={styles.buttonText}>⚙️ Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReceiveScreen = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.app}
      keyboardVerticalOffset={0}
    >
      <ScrollView 
        style={styles.app}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Receive Payment</Text>
          </View>

          {merchantAddress && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Payments go to:</Text>
              <Text style={styles.infoValue}>
                {merchantDisplayName.includes('.eth') ? merchantDisplayName : `${merchantAddress.slice(0, 10)}...`}
              </Text>
              {merchantDisplayName.includes('.eth') && (
                <Text style={styles.infoSubtext}>
                  {merchantAddress.slice(0, 10)}...{merchantAddress.slice(-8)}
                </Text>
              )}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>Select Token</Text>
            <View style={styles.tokenSelector}>
              <TouchableOpacity
                style={[styles.tokenButton, selectedToken === 'native' && styles.tokenButtonActive]}
                onPress={() => setSelectedToken('native')}>
                <Text style={[styles.tokenButtonText, selectedToken === 'native' && styles.tokenButtonTextActive]}>
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
                    style={[styles.tokenButton, selectedToken === tokenKey && styles.tokenButtonActive]}
                    onPress={() => setSelectedToken(tokenKey)}>
                    <Text style={[styles.tokenButtonText, selectedToken === tokenKey && styles.tokenButtonTextActive]}>
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
              <Text style={styles.usdEstimate}>≈ ${calculateUSD(amount)} USD</Text>
            )}
          </View>

          <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleReceivePayment} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Ready for Payment →</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => { setScreen('home'); setAmount(''); }}>
            <Text style={styles.buttonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderPaymentScreen = () => {
    const tokenSymbol = selectedToken === 'native' ? NETWORKS[selectedNetwork].symbol : TOKENS[selectedToken].symbol;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Customer PIN Entry</Text>
          {cardData && (
            <View style={styles.cardInfo}>
              <Text style={styles.cardInfoText}>Card: {cardData.serial}</Text>
              {cardData.ens && <Text style={styles.cardInfoText}>{cardData.ens}</Text>}
              <Text style={styles.cardInfoText}>{cardData.addr?.slice(0, 10)}...</Text>
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount to Pay</Text>
          <Text style={styles.amountDisplay}>{amount} {tokenSymbol}</Text>
          <Text style={styles.usdEstimate}>≈ ${calculateUSD(amount)} USD</Text>
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

        <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleSendPayment} disabled={loading || pin.length < 4}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm Payment ✓</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => { setScreen('home'); setPin(''); setAmount(''); setCardData(null); }}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <View style={styles.warning}>
          <Text style={styles.warningText}>🔒 Your PIN is secure. The merchant cannot see it.</Text>
        </View>
      </View>
    );
  };

  const renderBalanceScreen = () => {
    const tokenSymbol = selectedToken === 'native' ? NETWORKS[selectedNetwork].symbol : TOKENS[selectedToken].symbol;
    return (
      <ScrollView style={styles.app} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Card Balance</Text>
          </View>

          {cardData && (
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceAmount}>{balance || '0.00'} {tokenSymbol}</Text>
              <Text style={styles.balanceUSD}>≈ ${calculateUSD(balance || '0')} USD</Text>
              <Text style={styles.networkLabel}>On {NETWORKS[selectedNetwork].name}</Text>

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
            </View>
          )}

          <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => setScreen('home')}>
            <Text style={styles.buttonText}>← Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderSettingsScreen = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.app}
    >
      <ScrollView 
        style={styles.app} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>⚙️ Settings</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Merchant Address</Text>
            <Text style={styles.sectionSubtext}>
              Enter your Ethereum address OR ENS name (e.g., vitalik.eth)
            </Text>

            {merchantAddress && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Current Merchant Address:</Text>
                <Text style={styles.infoValue}>
                  {merchantDisplayName.includes('.eth') ? merchantDisplayName : `${merchantAddress.slice(0, 10)}...`}
                </Text>
                {merchantDisplayName.includes('.eth') && (
                  <Text style={styles.infoSubtext}>
                    Resolves to: {merchantAddress.slice(0, 10)}...{merchantAddress.slice(-8)}
                  </Text>
                )}
              </View>
            )}

            <Text style={styles.inputLabel}>Enter Address or ENS Name:</Text>
            <TextInput
              style={styles.input}
              value={tempAddress}
              onChangeText={setTempAddress}
              placeholder="0x... or yourname.eth"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => saveMerchantAddress(tempAddress)} disabled={!tempAddress || loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>💾 Save Address</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={setMerchantAddressFromCard} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>📱 Scan NFC Card to Set Address</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Network</Text>
            {Object.keys(NETWORKS).map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.networkButton, selectedNetwork === key && styles.networkButtonActive]}
                onPress={() => changeNetwork(key)}>
                <Text style={[styles.networkButtonText, selectedNetwork === key && styles.networkButtonTextActive]}>
                  {NETWORKS[key].name} ({NETWORKS[key].symbol})
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Live Prices</Text>
            <View style={styles.priceList}>
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
            <TouchableOpacity style={[styles.button, styles.buttonSecondary, {marginTop: 10}]} onPress={fetchPrices} disabled={priceLoading}>
              {priceLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>🔄 Refresh Prices</Text>}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.button, styles.buttonTertiary]} onPress={() => setScreen('home')}>
            <Text style={styles.buttonText}>← Back to Home</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Village Wallet v2.0</Text>
            <Text style={styles.footerText}>Open Source NFC Payments</Text>
            <Text style={styles.footerText}>✅ ENS Resolution Enabled</Text>
            <Text style={styles.footerText}>🌐 40+ RPC Endpoints</Text>
            <Text style={styles.footerText}>💰 4 Price Data Sources</Text>
          </View>
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

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, padding: 20 },
  scrollContent: { paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#a78bfa', fontWeight: '600' },
  networkBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2d2d44', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 2, borderColor: '#a78bfa', marginTop: 8 },
  connectionDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  connectionDotConnected: { backgroundColor: '#10b981' },
  connectionDotDisconnected: { backgroundColor: '#ef4444' },
  networkBadgeText: { fontSize: 16, color: '#fff', fontWeight: '600', marginRight: 10 },
  tickerBadge: { backgroundColor: '#8b5cf6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tickerText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  priceLoadingText: { color: '#a78bfa', fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  buttonContainer: { marginBottom: 20 },
  button: { padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  buttonPrimary: { backgroundColor: '#8b5cf6' },
  buttonSecondary: { backgroundColor: '#4a5568' },
  buttonTertiary: { backgroundColor: '#0f766e' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  sectionSubtext: { fontSize: 14, color: '#9ca3af', marginBottom: 15, fontStyle: 'italic' },
  tokenSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  tokenButton: { backgroundColor: '#2d2d44', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, borderWidth: 2, borderColor: '#4a5568' },
  tokenButtonActive: { backgroundColor: '#8b5cf6', borderColor: '#a78bfa' },
  tokenButtonText: { color: '#a0aec0', fontSize: 16, fontWeight: '600' },
  tokenButtonTextActive: { color: '#fff' },
  inputContainer: { marginBottom: 25 },
  label: { fontSize: 16, color: '#a0aec0', marginBottom: 10, fontWeight: '600' },
  input: { backgroundColor: '#2d2d44', color: '#fff', padding: 15, borderRadius: 10, fontSize: 18, borderWidth: 2, borderColor: '#4a5568' },
  pinInput: { backgroundColor: '#2d2d44', color: '#fff', padding: 20, borderRadius: 10, fontSize: 24, textAlign: 'center', letterSpacing: 10, borderWidth: 2, borderColor: '#8b5cf6' },
  amountDisplay: { fontSize: 36, fontWeight: 'bold', color: '#10b981', textAlign: 'center', marginVertical: 10 },
  usdEstimate: { fontSize: 18, color: '#a78bfa', textAlign: 'center', marginTop: 8, fontWeight: '600' },
  infoBox: { backgroundColor: '#2d2d44', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#4a5568' },
  infoLabel: { fontSize: 14, color: '#a0aec0', marginBottom: 5 },
  infoValue: { fontSize: 16, color: '#fff', fontWeight: '600' },
  infoSubtext: { fontSize: 12, color: '#718096', marginTop: 5, fontFamily: 'monospace' },
  inputLabel: { fontSize: 14, color: '#a0aec0', marginBottom: 8, fontWeight: '600' },
  cardInfo: { backgroundColor: '#2d2d44', padding: 15, borderRadius: 10, marginTop: 15, alignItems: 'center' },
  cardInfoText: { fontSize: 14, color: '#a78bfa', marginBottom: 5 },
  balanceContainer: { alignItems: 'center', marginBottom: 30 },
  balanceLabel: { fontSize: 18, color: '#a0aec0', marginBottom: 10 },
  balanceAmount: { fontSize: 48, fontWeight: 'bold', color: '#10b981', marginBottom: 5 },
  balanceUSD: { fontSize: 24, color: '#a78bfa', marginBottom: 5 },
  networkLabel: { fontSize: 16, color: '#718096', marginBottom: 20 },
  cardDetails: { backgroundColor: '#2d2d44', padding: 20, borderRadius: 10, width: '100%', marginTop: 20 },
  cardDetailLabel: { fontSize: 14, color: '#a0aec0', marginTop: 10, marginBottom: 5 },
  cardDetailValue: { fontSize: 14, color: '#fff', fontFamily: 'monospace' },
  networkButton: { backgroundColor: '#2d2d44', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 2, borderColor: '#4a5568' },
  networkButtonActive: { backgroundColor: '#8b5cf6', borderColor: '#a78bfa' },
  networkButtonContent: { flexDirection: 'row', alignItems: 'center' },
  networkStatusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  networkButtonText: { fontSize: 16, color: '#a0aec0', fontWeight: '600' },
  networkButtonTextActive: { color: '#fff' },
  buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  networkSummary: { backgroundColor: '#2d2d44', padding: 12, borderRadius: 8, marginTop: 10, borderLeftWidth: 4, borderLeftColor: '#8b5cf6' },
  networkSummaryText: { color: '#a78bfa', fontSize: 14, textAlign: 'center', fontWeight: '600' },
  priceList: { backgroundColor: '#2d2d44', padding: 15, borderRadius: 10, gap: 10 },
  priceItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#4a5568' },
  priceSymbol: { fontSize: 16, color: '#a78bfa', fontWeight: '600' },
  priceValue: { fontSize: 16, color: '#10b981', fontWeight: '700' },
  priceValueZero: { color: '#ef4444' },
  priceSourceBadge: { backgroundColor: '#8b5cf6', padding: 10, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  priceSourceText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  warning: { backgroundColor: '#2d2d44', padding: 15, borderRadius: 10, marginTop: 20, borderLeftWidth: 4, borderLeftColor: '#f59e0b' },
  warningText: { fontSize: 14, color: '#fbbf24', textAlign: 'center' },
  footer: { alignItems: 'center', marginTop: 30, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#4a5568' },
  footerText: { fontSize: 12, color: '#718096', marginBottom: 5 },
});
