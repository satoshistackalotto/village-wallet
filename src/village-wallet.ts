// Village Wallet - Simplified Stable Version
// No extra dependencies - just core features

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
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';

// ============================================
// NETWORK CONFIGURATIONS
// ============================================

const NETWORKS = {
  polygon: {
    name: 'Polygon',
    rpc: 'https://polygon-rpc.com',
    symbol: 'MATIC',
    explorer: 'https://polygonscan.com',
  },
  arbitrum: {
    name: 'Arbitrum',
    rpc: 'https://arb1.arbitrum.io/rpc',
    symbol: 'ETH',
    explorer: 'https://arbiscan.io',
  },
  ethereum: {
    name: 'Ethereum',
    rpc: 'https://eth.llamarpc.com',  // Better public RPC
    symbol: 'ETH',
    explorer: 'https://etherscan.io',
  },
};

const CONFIG = {
  CARD_SERIAL_PREFIX: 'VLG',
  MAX_TRANSACTION: 0.5,
  MIN_TRANSACTION: 0.0001,  // Lower minimum for testing and micro-transactions
};

// ============================================
// MAIN APP
// ============================================

export default function VillageWalletApp() {
  // Navigation
  const [screen, setScreen] = useState('home');
  
  // Core state
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Settings
  const [merchantAddress, setMerchantAddress] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('polygon');
  const [provider, setProvider] = useState(null);
  
  // Transaction state
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [cardData, setCardData] = useState(null);
  const [balance, setBalance] = useState(null);

  // Initialize
  useEffect(() => {
    initializeApp();
    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  // Update provider when network changes
  useEffect(() => {
    if (selectedNetwork) {
      const network = NETWORKS[selectedNetwork];
      const ethProvider = new ethers.providers.JsonRpcProvider(network.rpc);
      setProvider(ethProvider);
    }
  }, [selectedNetwork]);

  const initializeApp = async () => {
    try {
      // Initialize NFC
      const supported = await NfcManager.isSupported();
      if (supported) {
        await NfcManager.start();
        setNfcEnabled(true);
      }

      // Initialize provider
      const network = NETWORKS['polygon'];
      const ethProvider = new ethers.providers.JsonRpcProvider(network.rpc);
      setProvider(ethProvider);
    } catch (error) {
      console.error('Initialization error:', error);
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
      
      if (provider) {
        const bal = await provider.getBalance(walletData.addr);
        setBalance(ethers.utils.formatEther(bal));
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

  // ============================================
  // CRYPTO FUNCTIONS
  // ============================================

  const pinToPassphrase = (pin, cardSerial) => {
    return `${cardSerial}-PIN${pin}-SECURE`;
  };

  const decryptPrivateKey = (encryptedKey, pin, cardSerial) => {
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

  const sendTransaction = async (cardData, pin, toAddress, amount) => {
    let wallet = null;
    
    try {
      const privateKey = decryptPrivateKey(cardData.ekey, pin, cardData.serial);
      wallet = new ethers.Wallet(privateKey, provider);

      if (wallet.address.toLowerCase() !== cardData.addr.toLowerCase()) {
        throw new Error('Address mismatch - invalid PIN');
      }

      // Check balance first
      const balance = await provider.getBalance(wallet.address);
      const amountWei = ethers.utils.parseEther(amount.toString());
      
      // Estimate gas
      const gasPrice = await provider.getGasPrice();
      const gasLimit = 21000;
      const gasCost = gasPrice.mul(gasLimit);
      const totalCost = amountWei.add(gasCost);
      
      console.log('💰 Balance:', ethers.utils.formatEther(balance), NETWORKS[selectedNetwork].symbol);
      console.log('📤 Amount:', ethers.utils.formatEther(amountWei), NETWORKS[selectedNetwork].symbol);
      console.log('⛽ Gas Cost:', ethers.utils.formatEther(gasCost), NETWORKS[selectedNetwork].symbol);
      console.log('💵 Total Needed:', ethers.utils.formatEther(totalCost), NETWORKS[selectedNetwork].symbol);
      
      // Check if enough balance
      if (balance.lt(totalCost)) {
        const shortfall = totalCost.sub(balance);
        throw new Error(
          `Insufficient funds!\n\n` +
          `Balance: ${ethers.utils.formatEther(balance)} ${NETWORKS[selectedNetwork].symbol}\n` +
          `Amount: ${ethers.utils.formatEther(amountWei)} ${NETWORKS[selectedNetwork].symbol}\n` +
          `Gas Fee: ${ethers.utils.formatEther(gasCost)} ${NETWORKS[selectedNetwork].symbol}\n` +
          `Total Needed: ${ethers.utils.formatEther(totalCost)} ${NETWORKS[selectedNetwork].symbol}\n` +
          `Short by: ${ethers.utils.formatEther(shortfall)} ${NETWORKS[selectedNetwork].symbol}`
        );
      }

      const tx = {
        to: toAddress,
        value: amountWei,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
      };

      const txResponse = await wallet.sendTransaction(tx);
      const receipt = await txResponse.wait();

      return {
        success: true,
        hash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasCost: ethers.utils.formatEther(gasCost),
      };
    } finally {
      wallet = null;
      if (global.gc) global.gc();
    }
  };

  // ============================================
  // SETTINGS FUNCTIONS
  // ============================================

  const saveMerchantAddress = (address) => {
    if (!ethers.utils.isAddress(address)) {
      Alert.alert('Invalid Address', 'Please enter a valid Ethereum address');
      return false;
    }
    
    setMerchantAddress(address);
    Alert.alert('Success', 'Merchant address saved!');
    setScreen('home');
    return true;
  };

  const setMerchantAddressFromCard = async () => {
    try {
      const card = await readNFCCard();
      if (saveMerchantAddress(card.addr)) {
        Alert.alert('Address Set!', `Your wallet: ${card.addr.slice(0, 10)}...`);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not read card: ' + error.message);
    }
  };

  const changeNetwork = (network) => {
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
      Alert.alert(
        'Card Detected',
        `Card: ${customerCard.serial}\nAddress: ${customerCard.addr.slice(0, 10)}...\n\nAsk customer to enter their PIN`,
      );
    } catch (error) {
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
      const result = await sendTransaction(
        cardData,
        pin,
        merchantAddress,
        amount
      );

      setLoading(false);
      setPin('');
      
      Alert.alert(
        'Payment Successful! ✅',
        `Amount: ${amount} ${NETWORKS[selectedNetwork].symbol}\n` +
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
    } catch (error) {
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
    } catch (error) {
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
        <Text style={styles.subtitle}>{NETWORKS[selectedNetwork].name}</Text>
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
          <Text style={styles.infoValue}>{merchantAddress.slice(0, 10)}...{merchantAddress.slice(-8)}</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Amount ({NETWORKS[selectedNetwork].symbol})</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#999"
        />
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Card Balance</Text>
      </View>

      {cardData && (
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>
            {balance || '0.00'} {NETWORKS[selectedNetwork].symbol}
          </Text>
          <Text style={styles.balanceUSD}>
            On {NETWORKS[selectedNetwork].name}
          </Text>

          <View style={styles.cardDetails}>
            <Text style={styles.cardDetailLabel}>Card Serial:</Text>
            <Text style={styles.cardDetailValue}>{cardData.serial}</Text>
            
            <Text style={styles.cardDetailLabel}>Address:</Text>
            <Text style={styles.cardDetailValue}>{cardData.addr}</Text>
            
            {cardData.ens && (
              <>
                <Text style={styles.cardDetailLabel}>ENS Name:</Text>
                <Text style={styles.cardDetailValue}>{cardData.ens}</Text>
              </>
            )}
          </View>

          <View style={styles.infoBox} style={{marginTop: 20}}>
            <Text style={styles.infoLabel}>💡 Tip:</Text>
            <Text style={styles.infoValue}>
              This card may have different balances on other networks. 
              Switch network in Settings to check.
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
        <Text style={styles.buttonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSettingsScreen = () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ Settings</Text>
        </View>

        {/* Merchant Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Merchant Address</Text>
          <Text style={styles.sectionDesc}>
            Set where you receive payments
          </Text>
          
          {merchantAddress ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Current Address:</Text>
              <Text style={styles.infoValue}>{merchantAddress}</Text>
            </View>
          ) : (
            <View style={styles.warning}>
              <Text style={styles.warningText}>
                ⚠️ No address set. Set your address to receive payments.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={setMerchantAddressFromCard}
          >
            <Text style={styles.buttonText}>📱 Scan My Card</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => {
              Alert.prompt(
                'Enter Address',
                'Paste your Ethereum wallet address:',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Save', 
                    onPress: (text) => saveMerchantAddress(text)
                  },
                ]
              );
            }}
          >
            <Text style={styles.buttonText}>⌨️ Enter Manually</Text>
          </TouchableOpacity>
        </View>

        {/* Network Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Network Selection</Text>
          <Text style={styles.sectionDesc}>Choose blockchain to use</Text>
          
          {Object.keys(NETWORKS).map(key => (
            <TouchableOpacity
              key={key}
              style={[
                styles.networkButton,
                selectedNetwork === key && styles.networkButtonActive
              ]}
              onPress={() => changeNetwork(key)}
            >
              <Text style={[
                styles.networkButtonText,
                selectedNetwork === key && styles.networkButtonTextActive
              ]}>
                {NETWORKS[key].name} ({NETWORKS[key].symbol})
              </Text>
              {selectedNetwork === key && <Text style={styles.checkmark}>✓</Text>}
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
  // RENDER
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
  app: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollView: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1, padding: 20, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666' },
  
  buttonContainer: { gap: 16 },
  button: { padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  buttonPrimary: { backgroundColor: '#667eea' },
  buttonSecondary: { backgroundColor: '#6c757d' },
  buttonTertiary: { backgroundColor: '#17a2b8' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  buttonSubtext: { color: '#fff', fontSize: 12, marginTop: 4, opacity: 0.8 },
  
  inputContainer: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    fontSize: 24,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  pinInput: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    fontSize: 32,
    textAlign: 'center',
    letterSpacing: 10,
    borderWidth: 2,
    borderColor: '#667eea',
  },
  amountDisplay: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'center',
    padding: 20,
  },
  
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  infoValue: { fontSize: 14, color: '#333', fontFamily: 'monospace' },
  
  warning: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    marginTop: 20,
  },
  warningText: { color: '#856404', fontSize: 12 },
  
  cardInfo: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  cardInfoText: { fontSize: 12, color: '#666', fontFamily: 'monospace' },
  
  balanceContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  balanceAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 8,
  },
  balanceUSD: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  cardDetails: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
    marginTop: 16,
  },
  cardDetailLabel: { fontSize: 12, color: '#666', marginTop: 8 },
  cardDetailValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  
  section: { marginBottom: 30 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 8,
  },
  sectionDesc: { fontSize: 14, color: '#666', marginBottom: 16 },
  
  networkButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  networkButtonActive: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  networkButtonText: { fontSize: 16, color: '#333' },
  networkButtonTextActive: { color: '#667eea', fontWeight: 'bold' },
  checkmark: { fontSize: 20, color: '#667eea' },
});