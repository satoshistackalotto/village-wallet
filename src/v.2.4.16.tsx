import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, Text as SvgText } from 'react-native-svg';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';

class SecureKeyHandler {
  private keyBuffer: Uint8Array | null = null;
  
  setKey(privateKey: string): void {
    const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    this.keyBuffer = new Uint8Array(
      cleanKey.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );
  }
  
  getKey(): string {
    if (!this.keyBuffer) throw new Error('No key set');
    return '0x' + Array.from(this.keyBuffer)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  clearKey(): void {
    if (this.keyBuffer) {
      this.keyBuffer.fill(0);
      this.keyBuffer = null;
    }
  }
  
  hasKey(): boolean {
    return this.keyBuffer !== null;
  }
}

const TRANSLATIONS: Record<string, any> = {
    en: {    name: 'English',
      flag: '🇬🇧',
      villageWallet: 'Village Wallet',
      receivePayment: '💰 Receive Payment (Merchant)',
      checkBalance: '💳 Check Card Balance',
      settings: '⚙️ Settings',
      updatingPrices: 'Updating prices...',
      prices: 'Prices',
      receive: 'Receive Payment',
      paymentsGoTo: 'Payments go to:',
      selectNetwork: 'Select Network',
      selectToken: 'Select Token',
      amount: 'Amount',
      readyForPayment: 'Ready for Payment →',
      back: '← Back',
      customerPinEntry: 'Customer PIN Entry',
      card: 'Card',
      amountToPay: 'Amount to Pay',
      enterPin: 'Enter Your PIN (4-6 digits)',
      confirmPayment: 'Confirm Payment ✓',
      cancel: 'Cancel',
      pinSecure: '🔒 Your PIN is secure. The merchant cannot see it.',
      cardBalance: 'Card Balance',
      currentBalance: 'Current Balance',
      on: 'On',
      cardSerial: 'Card Serial:',
      ensName: 'ENS Name:',
      address: 'Address:',
      allTokenBalances: 'All Token Balances',
      native: 'Native',
      totalUsdValue: 'Total USD Value',
      backToHome: '← Back to Home',
      configureAddress: 'Configure your merchant address',
      merchantAddress: 'Merchant Address',
      paymentsReceived: 'This is where you\'ll receive payments',
      currentAddress: 'Current Address:',
      saveAddress: '💾 Save Address',
      scanCard: '📱 Scan NFC Card to Set Address',
      version: 'Village Wallet v2.4.8 - Multi-Language',
      pinFixed: '✅ PIN Validation: Fixed with Serial Number',
      transactionsWorking: '✅ Transactions: Working',
      cheaperGas: '✅ 66-80% Cheaper Gas Fees',
      multiNetwork: '🌐 Multi-Network • Multi-Token',
      setupRequired: 'Setup Required',
      setAddressFirst: 'Please set your wallet address in Settings first',
      goToSettings: 'Go to Settings',
      error: 'Error',
      minimumAmount: 'Minimum amount is',
      readyToReceive: 'Ready to Receive',
      askCustomerTap: 'Ask customer to tap their card to pay',
      ready: 'Ready',
      cardDetected: 'Card Detected',
      askCustomerPin: 'Ask customer to enter their PIN',
      missingInfo: 'Missing required information',
      paymentSuccessful: 'Payment Successful! ✅',
      gasFee: 'Gas Fee',
      viewOn: 'View on',
      done: 'Done',
      transactionFailed: 'Transaction Failed',
      tokenNotSupported: 'Token not supported on this network',
      insufficientBalance: 'Insufficient token balance',
      insufficientGas: 'for gas',
      pleaseEnterAddress: 'Please enter an address',
      success: 'Success ✅',
      merchantAddressSet: 'Merchant address set',
      pinRequired: 'PIN Required',
      enterPinPrompt: 'Please enter your PIN to check balance',
      enterPinDigits: 'Enter your card PIN (4-6 digits):',
      ok: 'OK',
      cardFormatPin: 'This card format requires your PIN to read the address. Please enter it below.',
      invalidPin: 'Invalid PIN or card read failed',
      ensLabel: 'ENS:',
      wallet: 'Wallet:',
      errorReadingCard: 'Error Reading Card',
      networkChanged: 'Network Changed',
      nowUsing: 'Now using',
      language: 'Language',
      selectLanguage: 'Select Language',
      insufficientBalanceDetail: 'Insufficient balance!',
      balance: 'Balance',
      shortBy: 'Short by',
      insufficientGasDetail: 'for gas!',
      gasNeeded: 'Gas Needed',
      reviewTransaction: 'Review Transaction',
      transactionPreview: 'Transaction Preview',
      recipient: 'Recipient',
      estimatedGas: 'Estimated Gas',
      totalGasCost: 'Total Gas Cost',
      totalCost: 'Total Cost',
      network: 'Network',
      warning: 'Please verify all details before confirming',
      preparing: 'Preparing transaction...',
      sending: 'Sending transaction...',
      gasPrice: 'Gas Price',
      nfcTimeout: 'NFC scan timed out. Please try again.',
      readingCard: 'Reading card...',
    },
    jp: {
      name: '日本語',
      flag: '🇯🇵',
      villageWallet: 'ビレッジウォレット',
      receivePayment: '💰 支払いを受け取る（加盟店）',
      checkBalance: '💳 カード残高を確認',
      settings: '⚙️ 設定',
      updatingPrices: '価格更新中...',
      prices: '価格',
      receive: '支払いを受け取る',
      paymentsGoTo: '支払い先：',
      selectNetwork: 'ネットワークを選択',
      selectToken: 'トークンを選択',
      amount: '金額',
      readyForPayment: '支払い準備完了 →',
      back: '← 戻る',
      customerPinEntry: '顧客PIN入力',
      card: 'カード',
      amountToPay: '支払い金額',
      enterPin: 'PINを入力してください（4〜6桁）',
      confirmPayment: '支払いを確認 ✓',
      cancel: 'キャンセル',
      pinSecure: '🔒 PINは安全です。加盟店には表示されません。',
      cardBalance: 'カード残高',
      currentBalance: '現在の残高',
      on: '〜',
      cardSerial: 'カードシリアル：',
      ensName: 'ENS名：',
      address: 'アドレス：',
      allTokenBalances: '全トークン残高',
      native: 'ネイティブ',
      totalUsdValue: '合計USD価値',
      backToHome: '← ホームに戻る',
      configureAddress: '加盟店アドレスを設定',
      merchantAddress: '加盟店アドレス',
      paymentsReceived: 'ここで支払いを受け取ります',
      currentAddress: '現在のアドレス：',
      saveAddress: '💾 アドレスを保存',
      scanCard: '📱 NFCカードをスキャンしてアドレスを設定',
      version: 'ビレッジウォレット v2.4.8 - 多言語',
      pinFixed: '✅ PIN検証：修正済み',
      transactionsWorking: '✅ トランザクション：動作中',
      cheaperGas: '✅ ガス料金66〜80％削減',
      multiNetwork: '🌐 マルチネットワーク • マルチトークン',
      setupRequired: '設定が必要です',
      setAddressFirst: '最初に設定でウォレットアドレスを設定してください',
      goToSettings: '設定へ',
      error: 'エラー',
      minimumAmount: '最小金額は',
      readyToReceive: '受け取り準備完了',
      askCustomerTap: 'カードをタップして支払うよう顧客に依頼してください',
      ready: '準備完了',
      cardDetected: 'カード検出',
      askCustomerPin: 'PINを入力するよう顧客に依頼してください',
      missingInfo: '必要な情報がありません',
      paymentSuccessful: '支払い成功！ ✅',
      gasFee: 'ガス料金',
      viewOn: '表示',
      done: '完了',
      transactionFailed: 'トランザクション失敗',
      tokenNotSupported: 'このネットワークではトークンがサポートされていません',
      insufficientBalance: 'トークン残高不足',
      insufficientGas: 'ガス不足',
      pleaseEnterAddress: 'アドレスを入力してください',
      success: '成功 ✅',
      merchantAddressSet: '加盟店アドレスが設定されました',
      pinRequired: 'PINが必要です',
      enterPinPrompt: '残高を確認するにはPINを入力してください',
      enterPinDigits: 'カードPINを入力してください（4〜6桁）：',
      ok: 'OK',
      cardFormatPin: 'このカード形式はアドレスを読み取るためにPINが必要です。',
      invalidPin: 'PINが無効またはカード読み取り失敗',
      ensLabel: 'ENS：',
      wallet: 'ウォレット：',
      errorReadingCard: 'カード読み取りエラー',
      networkChanged: 'ネットワーク変更',
      nowUsing: '使用中',
      language: '言語',
      selectLanguage: '言語を選択',
      insufficientBalanceDetail: '残高不足！',
      balance: '残高',
      shortBy: '不足額',
      insufficientGasDetail: 'ガス不足！',
      gasNeeded: '必要ガス',
      reviewTransaction: 'トランザクションを確認',
      transactionPreview: 'トランザクションプレビュー',
      recipient: '受取人',
      estimatedGas: '推定ガス',
      totalGasCost: '合計ガス代',
      totalCost: '合計費用',
      network: 'ネットワーク',
      warning: '⚠️ 確認する前にすべての詳細を確認してください',
      preparing: 'トランザクションを準備中...',
      sending: 'トランザクションを送信中...',
      gasPrice: 'ガス価格',
      nfcTimeout: 'NFCスキャンがタイムアウトしました。もう一度お試しください。',
      readingCard: 'カードを読み取り中...',
    },
    fr: {
      name: 'Français',
      flag: '🇫🇷',
      villageWallet: 'Village Wallet',
      receivePayment: '💰 Recevoir un paiement (Commerçant)',
      checkBalance: '💳 Vérifier le solde de la carte',
      settings: '⚙️ Paramètres',
      updatingPrices: 'Mise à jour des prix...',
      prices: 'Prix',
      receive: 'Recevoir un paiement',
      paymentsGoTo: 'Les paiements vont à:',
      selectNetwork: 'Sélectionner le réseau',
      selectToken: 'Sélectionner le jeton',
      amount: 'Montant',
      readyForPayment: 'Prêt pour le paiement →',
      back: '← Retour',
      customerPinEntry: 'Saisie du PIN client',
      card: 'Carte',
      amountToPay: 'Montant à payer',
      enterPin: 'Entrez votre PIN (4-6 chiffres)',
      confirmPayment: 'Confirmer le paiement ✓',
      cancel: 'Annuler',
      pinSecure: '🔒 Votre PIN est sécurisé. Le commerçant ne peut pas le voir.',
      cardBalance: 'Solde de la carte',
      currentBalance: 'Solde actuel',
      on: 'Sur',
      cardSerial: 'Série de carte:',
      ensName: 'Nom ENS:',
      address: 'Adresse:',
      allTokenBalances: 'Tous les soldes de jetons',
      native: 'Natif',
      totalUsdValue: 'Valeur totale en USD',
      backToHome: '← Retour à l\'accueil',
      configureAddress: 'Configurer votre adresse de commerçant',
      merchantAddress: 'Adresse du commerçant',
      paymentsReceived: 'C\'est ici que vous recevrez les paiements',
      currentAddress: 'Adresse actuelle:',
      saveAddress: '💾 Enregistrer l\'adresse',
      scanCard: '📱 Scanner la carte NFC pour définir l\'adresse',
      version: 'Village Wallet v2.4.8 - Multilingue',
      pinFixed: '✅ Validation PIN: Corrigée',
      transactionsWorking: '✅ Transactions: Fonctionnent',
      cheaperGas: '✅ Frais de gaz 66-80% moins chers',
      multiNetwork: '🌐 Multi-Réseau • Multi-Jeton',
      setupRequired: 'Configuration requise',
      setAddressFirst: 'Veuillez d\'abord définir votre adresse de portefeuille dans les paramètres',
      goToSettings: 'Aller aux paramètres',
      error: 'Erreur',
      minimumAmount: 'Le montant minimum est',
      readyToReceive: 'Prêt à recevoir',
      askCustomerTap: 'Demandez au client de toucher sa carte pour payer',
      ready: 'Prêt',
      cardDetected: 'Carte détectée',
      askCustomerPin: 'Demandez au client d\'entrer son PIN',
      missingInfo: 'Informations manquantes',
      paymentSuccessful: 'Paiement réussi! ✅',
      gasFee: 'Frais de gaz',
      viewOn: 'Voir sur',
      done: 'Terminé',
      transactionFailed: 'Transaction échouée',
      tokenNotSupported: 'Jeton non pris en charge sur ce réseau',
      insufficientBalance: 'Solde de jeton insuffisant',
      insufficientGas: 'pour le gaz',
      pleaseEnterAddress: 'Veuillez entrer une adresse',
      success: 'Succès ✅',
      merchantAddressSet: 'Adresse du commerçant définie',
      pinRequired: 'PIN requis',
      enterPinPrompt: 'Veuillez entrer votre PIN pour vérifier le solde',
      enterPinDigits: 'Entrez le PIN de votre carte (4-6 chiffres):',
      ok: 'OK',
      cardFormatPin: 'Ce format de carte nécessite votre PIN pour lire l\'adresse.',
      invalidPin: 'PIN invalide ou échec de lecture de carte',
      ensLabel: 'ENS:',
      wallet: 'Portefeuille:',
      errorReadingCard: 'Erreur de lecture de carte',
      networkChanged: 'Réseau changé',
      nowUsing: 'Utilisant maintenant',
      language: 'Langue',
      selectLanguage: 'Sélectionner la langue',
      insufficientBalanceDetail: 'Solde insuffisant!',
      balance: 'Solde',
      shortBy: 'Manque',
      insufficientGasDetail: 'pour le gaz!',
      gasNeeded: 'Gaz nécessaire',  
      transactionPreview: 'Aperçu de la transaction',
      reviewTransaction: 'Examiner la transaction',
      recipient: 'Destinataire',
      estimatedGas: 'Gas estimé',
      totalGasCost: 'Coût total du gas',
      totalCost: 'Coût total',
      network: 'Réseau',
      warning: '⚠️ Veuillez vérifier tous les détails avant de confirmer',
      preparing: 'Préparation de la transaction...',
      sending: 'Envoi de la transaction...',
      gasPrice: 'Prix du gas',
      nfcTimeout: 'Le scan NFC a expiré. Veuillez réessayer.',
      readingCard: 'Lecture de la carte...',
    },
    de: {
      name: 'Deutsch',
      flag: '🇩🇪',
      villageWallet: 'Village Wallet',
      receivePayment: '💰 Zahlung empfangen (Händler)',
      checkBalance: '💳 Kartenguthaben prüfen',
      settings: '⚙️ Einstellungen',
      updatingPrices: 'Preise werden aktualisiert...',
      prices: 'Preise',
      receive: 'Zahlung empfangen',
      paymentsGoTo: 'Zahlungen gehen an:',
      selectNetwork: 'Netzwerk auswählen',
      selectToken: 'Token auswählen',
      amount: 'Betrag',
      readyForPayment: 'Bereit für Zahlung →',
      back: '← Zurück',
      customerPinEntry: 'Kunden-PIN-Eingabe',
      card: 'Karte',
      amountToPay: 'Zu zahlender Betrag',
      enterPin: 'Geben Sie Ihre PIN ein (4-6 Ziffern)',
      confirmPayment: 'Zahlung bestätigen ✓',
      cancel: 'Abbrechen',
      pinSecure: '🔒 Ihre PIN ist sicher. Der Händler kann sie nicht sehen.',
      cardBalance: 'Kartenguthaben',
      currentBalance: 'Aktuelles Guthaben',
      on: 'Auf',
      cardSerial: 'Kartenserien:',
      ensName: 'ENS-Name:',
      address: 'Adresse:',
      allTokenBalances: 'Alle Token-Guthaben',
      native: 'Nativ',
      totalUsdValue: 'Gesamt-USD-Wert',
      backToHome: '← Zurück zur Startseite',
      configureAddress: 'Händleradresse konfigurieren',
      merchantAddress: 'Händleradresse',
      paymentsReceived: 'Hier erhalten Sie Zahlungen',
      currentAddress: 'Aktuelle Adresse:',
      saveAddress: '💾 Adresse speichern',
      scanCard: '📱 NFC-Karte scannen, um Adresse festzulegen',
      version: 'Village Wallet v2.4.8 - Mehrsprachig',
      pinFixed: '✅ PIN-Validierung: Behoben',
      transactionsWorking: '✅ Transaktionen: Funktionieren',
      cheaperGas: '✅ 66-80% günstigere Gasgebühren',
      multiNetwork: '🌐 Multi-Netzwerk • Multi-Token',
      setupRequired: 'Einrichtung erforderlich',
      setAddressFirst: 'Bitte legen Sie zuerst Ihre Wallet-Adresse in den Einstellungen fest',
      goToSettings: 'Zu den Einstellungen',
      error: 'Fehler',
      minimumAmount: 'Mindestbetrag ist',
      readyToReceive: 'Bereit zu empfangen',
      askCustomerTap: 'Bitten Sie den Kunden, seine Karte zum Bezahlen anzutippen',
      ready: 'Bereit',
      cardDetected: 'Karte erkannt',
      askCustomerPin: 'Bitten Sie den Kunden, seine PIN einzugeben',
      missingInfo: 'Fehlende Informationen',
      paymentSuccessful: 'Zahlung erfolgreich! ✅',
      gasFee: 'Gasgebühr',
      viewOn: 'Ansehen auf',
      done: 'Fertig',
      transactionFailed: 'Transaktion fehlgeschlagen',
      tokenNotSupported: 'Token auf diesem Netzwerk nicht unterstützt',
      insufficientBalance: 'Unzureichendes Token-Guthaben',
      insufficientGas: 'für Gas',
      pleaseEnterAddress: 'Bitte geben Sie eine Adresse ein',
      success: 'Erfolg ✅',
      merchantAddressSet: 'Händleradresse festgelegt',
      pinRequired: 'PIN erforderlich',
      enterPinPrompt: 'Bitte geben Sie Ihre PIN ein, um das Guthaben zu überprüfen',
      enterPinDigits: 'Geben Sie Ihre Karten-PIN ein (4-6 Ziffern):',
      ok: 'OK',
      cardFormatPin: 'Dieses Kartenformat erfordert Ihre PIN, um die Adresse zu lesen.',
      invalidPin: 'Ungültige PIN oder Kartenlesefehler',
      ensLabel: 'ENS:',
      wallet: 'Wallet:',
      errorReadingCard: 'Fehler beim Lesen der Karte',
      networkChanged: 'Netzwerk geändert',
      nowUsing: 'Jetzt verwendet',
      language: 'Sprache',
      selectLanguage: 'Sprache auswählen',
      insufficientBalanceDetail: 'Unzureichendes Guthaben!',
      balance: 'Guthaben',
      shortBy: 'Fehlt',
      insufficientGasDetail: 'für Gas!',
      gasNeeded: 'Benötigtes Gas',
      transactionPreview: 'Transaktionsvorschau',
      reviewTransaction: 'Transaktion überprüfen',
      recipient: 'Empfänger',
      estimatedGas: 'Geschätztes Gas',
      totalGasCost: 'Gesamte Gaskosten',
      totalCost: 'Gesamtkosten',
      network: 'Netzwerk',
      warning: '⚠️ Bitte überprüfen Sie alle Details vor der Bestätigung',
      preparing: 'Transaktion wird vorbereitet...',
      sending: 'Transaktion wird gesendet...',
      gasPrice: 'Gaspreis',
      nfcTimeout: 'NFC-Scan ist abgelaufen. Bitte versuchen Sie es erneut.',
      readingCard: 'Karte wird gelesen...',
    },
    es: {
      name: 'Español',
      flag: '🇪🇸',
      villageWallet: 'Village Wallet',
      receivePayment: '💰 Recibir pago (Comerciante)',
      checkBalance: '💳 Verificar saldo de tarjeta',
      settings: '⚙️ Configuración',
      updatingPrices: 'Actualizando precios...',
      prices: 'Precios',
      receive: 'Recibir pago',
      paymentsGoTo: 'Los pagos van a:',
      selectNetwork: 'Seleccionar red',
      selectToken: 'Seleccionar token',
      amount: 'Cantidad',
      readyForPayment: 'Listo para pago →',
      back: '← Atrás',
      customerPinEntry: 'Entrada de PIN del cliente',
      card: 'Tarjeta',
      amountToPay: 'Cantidad a pagar',
      enterPin: 'Ingrese su PIN (4-6 dígitos)',
      confirmPayment: 'Confirmar pago ✓',
      cancel: 'Cancelar',
      pinSecure: '🔒 Su PIN es seguro. El comerciante no puede verlo.',
      cardBalance: 'Saldo de tarjeta',
      currentBalance: 'Saldo actual',
      on: 'En',
      cardSerial: 'Serie de tarjeta:',
      ensName: 'Nombre ENS:',
      address: 'Dirección:',
      allTokenBalances: 'Todos los saldos de tokens',
      native: 'Nativo',
      totalUsdValue: 'Valor total en USD',
      backToHome: '← Volver al inicio',
      configureAddress: 'Configurar su dirección de comerciante',
      merchantAddress: 'Dirección del comerciante',
      paymentsReceived: 'Aquí es donde recibirá los pagos',
      currentAddress: 'Dirección actual:',
      saveAddress: '💾 Guardar dirección',
      scanCard: '📱 Escanear tarjeta NFC para establecer dirección',
      version: 'Village Wallet v2.4.8 - Multilingüe',
      pinFixed: '✅ Validación PIN: Corregida',
      transactionsWorking: '✅ Transacciones: Funcionando',
      cheaperGas: '✅ Tarifas de gas 66-80% más baratas',
      multiNetwork: '🌐 Multi-Red • Multi-Token',
      setupRequired: 'Configuración requerida',
      setAddressFirst: 'Por favor, configure primero su dirección de billetera en Configuración',
      goToSettings: 'Ir a Configuración',
      error: 'Error',
      minimumAmount: 'La cantidad mínima es',
      readyToReceive: 'Listo para recibir',
      askCustomerTap: 'Pida al cliente que toque su tarjeta para pagar',
      ready: 'Listo',
      cardDetected: 'Tarjeta detectada',
      askCustomerPin: 'Pida al cliente que ingrese su PIN',
      missingInfo: 'Información faltante',
      paymentSuccessful: '¡Pago exitoso! ✅',
      gasFee: 'Tarifa de gas',
      viewOn: 'Ver en',
      done: 'Hecho',
      transactionFailed: 'Transacción fallida',
      tokenNotSupported: 'Token no compatible en esta red',
      insufficientBalance: 'Saldo de token insuficiente',
      insufficientGas: 'para gas',
      pleaseEnterAddress: 'Por favor ingrese una dirección',
      success: 'Éxito ✅',
      merchantAddressSet: 'Dirección del comerciante establecida',
      pinRequired: 'PIN requerido',
      enterPinPrompt: 'Por favor ingrese su PIN para verificar el saldo',
      enterPinDigits: 'Ingrese el PIN de su tarjeta (4-6 dígitos):',
      ok: 'OK',
      cardFormatPin: 'Este formato de tarjeta requiere su PIN para leer la dirección.',
      invalidPin: 'PIN inválido o fallo en lectura de tarjeta',
      ensLabel: 'ENS:',
      wallet: 'Billetera:',
      errorReadingCard: 'Error al leer tarjeta',
      networkChanged: 'Red cambiada',
      nowUsing: 'Ahora usando',
      language: 'Idioma',
      selectLanguage: 'Seleccionar idioma',
      insufficientBalanceDetail: '¡Saldo insuficiente!',
      balance: 'Saldo',
      shortBy: 'Falta',
      insufficientGasDetail: 'para gas!',
      gasNeeded: 'Gas necesario',
      transactionPreview: 'Vista previa de transacción',
      reviewTransaction: 'Revisar transacción',
      recipient: 'Destinatario',
      estimatedGas: 'Gas estimado',
      totalGasCost: 'Costo total de gas',
      totalCost: 'Costo total',
      network: 'Red',
      warning: '⚠️ Por favor verifique todos los detalles antes de confirmar',
      preparing: 'Preparando transacción...',
      sending: 'Enviando transacción...',
      gasPrice: 'Precio del gas',
      nfcTimeout: 'El escaneo NFC ha expirado. Por favor intente de nuevo.',
      readingCard: 'Leyendo tarjeta...',
    },
    el: {
      name: 'Ελληνικά',
      flag: '🇬🇷',
      villageWallet: 'Village Wallet',
      receivePayment: '💰 Λήψη πληρωμής (Έμπορος)',
      checkBalance: '💳 Έλεγχος υπολοίπου κάρτας',
      settings: '⚙️ Ρυθμίσεις',
      updatingPrices: 'Ενημέρωση τιμών...',
      prices: 'Τιμές',
      receive: 'Λήψη πληρωμής',
      paymentsGoTo: 'Οι πληρωμές πηγαίνουν σε:',
      selectNetwork: 'Επιλογή δικτύου',
      selectToken: 'Επιλογή token',
      amount: 'Ποσό',
      readyForPayment: 'Έτοιμος για πληρωμή →',
      back: '← Πίσω',
      customerPinEntry: 'Εισαγωγή PIN πελάτη',
      card: 'Κάρτα',
      amountToPay: 'Ποσό πληρωμής',
      enterPin: 'Εισάγετε το PIN σας (4-6 ψηφία)',
      confirmPayment: 'Επιβεβαίωση πληρωμής ✓',
      cancel: 'Ακύρωση',
      pinSecure: '🔒 Το PIN σας είναι ασφαλές. Ο έμπορος δεν μπορεί να το δει.',
      cardBalance: 'Υπόλοιπο κάρτας',
      currentBalance: 'Τρέχον υπόλοιπο',
      on: 'Στο',
      cardSerial: 'Σειριακός κάρτας:',
      ensName: 'Όνομα ENS:',
      address: 'Διεύθυνση:',
      allTokenBalances: 'Όλα τα υπόλοιπα token',
      native: 'Εγγενές',
      totalUsdValue: 'Συνολική αξία σε USD',
      backToHome: '← Επιστροφή στην αρχική',
      configureAddress: 'Ρυθμίστε τη διεύθυνση εμπόρου σας',
      merchantAddress: 'Διεύθυνση εμπόρου',
      paymentsReceived: 'Εδώ θα λαμβάνετε πληρωμές',
      currentAddress: 'Τρέχουσα διεύθυνση:',
      saveAddress: '💾 Αποθήκευση διεύθυνσης',
      scanCard: '📱 Σάρωση κάρτας NFC για ορισμό διεύθυνσης',
      version: 'Village Wallet v2.4.8 - Πολυγλωσσικό',
      pinFixed: '✅ Επικύρωση PIN: Διορθωμένη',
      transactionsWorking: '✅ Συναλλαγές: Λειτουργούν',
      cheaperGas: '✅ Τέλη gas 66-80% φθηνότερα',
      multiNetwork: '🌐 Πολλαπλά δίκτυα • Πολλαπλά token',
      setupRequired: 'Απαιτείται ρύθμιση',
      setAddressFirst: 'Παρακαλώ ορίστε πρώτα τη διεύθυνση πορτοφολιού σας στις Ρυθμίσεις',
      goToSettings: 'Μετάβαση στις Ρυθμίσεις',
      error: 'Σφάλμα',
      minimumAmount: 'Το ελάχιστο ποσό είναι',
      readyToReceive: 'Έτοιμος για λήψη',
      askCustomerTap: 'Ζητήστε από τον πελάτη να πατήσει την κάρτα του για πληρωμή',
      ready: 'Έτοιμος',
      cardDetected: 'Ανιχνεύθηκε κάρτα',
      askCustomerPin: 'Ζητήστε από τον πελάτη να εισάγει το PIN του',
      missingInfo: 'Λείπουν πληροφορίες',
      paymentSuccessful: 'Επιτυχής πληρωμή! ✅',
      gasFee: 'Τέλος gas',
      viewOn: 'Προβολή σε',
      done: 'Ολοκληρώθηκε',
      transactionFailed: 'Αποτυχία συναλλαγής',
      tokenNotSupported: 'Το token δεν υποστηρίζεται σε αυτό το δίκτυο',
      insufficientBalance: 'Ανεπαρκές υπόλοιπο token',
      insufficientGas: 'για gas',
      pleaseEnterAddress: 'Παρακαλώ εισάγετε μια διεύθυνση',
      success: 'Επιτυχία ✅',
      merchantAddressSet: 'Η διεύθυνση εμπόρου ορίστηκε',
      pinRequired: 'Απαιτείται PIN',
      enterPinPrompt: 'Παρακαλώ εισάγετε το PIN σας για έλεγχο υπολοίπου',
      enterPinDigits: 'Εισάγετε το PIN της κάρτας σας (4-6 ψηφία):',
      ok: 'OK',
      cardFormatPin: 'Αυτή η μορφή κάρτας απαιτεί το PIN σας για ανάγνωση της διεύθυνσης.',
      invalidPin: 'Μη έγκυρο PIN ή αποτυχία ανάγνωσης κάρτας',
      ensLabel: 'ENS:',
      wallet: 'Πορτοφόλι:',
      errorReadingCard: 'Σφάλμα ανάγνωσης κάρτας',
      networkChanged: 'Αλλαγή δικτύου',
      nowUsing: 'Τώρα χρησιμοποιείται',
      language: 'Γλώσσα',
      selectLanguage: 'Επιλογή γλώσσας',
      insufficientBalanceDetail: 'Ανεπαρκές υπόλοιπο!',
      balance: 'Υπόλοιπο',
      shortBy: 'Λείπουν',
      insufficientGasDetail: 'για gas!',
      gasNeeded: 'Απαιτούμενο gas',
      transactionPreview: 'Προεπισκόπηση συναλλαγής',
      reviewTransaction: 'Ελέγξτε τη συναλλαγή',
      recipient: 'Παραλήπτης',
      estimatedGas: 'Εκτιμώμενο Gas',
      totalGasCost: 'Συνολικό κόστος Gas',
      totalCost: 'Συνολικό κόστος',
      network: 'Δίκτυο',
      warning: '⚠️ Παρακαλώ επαληθεύστε όλες τις λεπτομέρειες πριν επιβεβαιώσετε',
      preparing: 'Προετοιμασία συναλλαγής...',
      sending: 'Αποστολή συναλλαγής...',
      gasPrice: 'Τιμή Gas',
      nfcTimeout: 'Το σάρωμα NFC έληξε. Παρακαλώ δοκιμάστε ξανά.',
      readingCard: 'Ανάγνωση κάρτας...',
    },
  };

const NETWORKS: Record<string, any> = {
  ethereum: {
    name: 'Ethereum',
    rpc: 'https://eth.llamarpc.com',
    fallbackRpc: 'https://ethereum.publicnode.com',
    fallbackRpc2: 'https://rpc.ankr.com/eth',
    fallbackRpc3: 'https://eth.drpc.org',
    fallbackRpc4: 'https://1rpc.io/eth',
    fallbackRpc5: 'https://cloudflare-eth.com',
    fallbackRpc6: 'https://ethereum.blockpi.network/v1/rpc/public',
    symbol: 'ETH',
    explorer: 'https://etherscan.io',
    chainId: 1,
    coingeckoId: 'ethereum',
    etherscanGasApi: 'https://api.etherscan.io/v2/api?chainid=1&module=gastracker&action=gasoracle',
  },
  polygon: {
    name: 'Polygon',
    rpc: 'https://polygon-rpc.com',
    fallbackRpc: 'https://polygon.llamarpc.com',
    fallbackRpc2: 'https://polygon-bor.publicnode.com',
    fallbackRpc3: 'https://rpc-mainnet.matic.quiknode.pro',
    fallbackRpc4: 'https://polygon.drpc.org',
    fallbackRpc5: 'https://rpc.ankr.com/polygon',
    fallbackRpc6: 'https://polygon.blockpi.network/v1/rpc/public',
    symbol: 'MATIC',
    explorer: 'https://polygonscan.com',
    chainId: 137,
    coingeckoId: 'matic-network',
    etherscanGasApi: 'https://api.etherscan.io/v2/api?chainid=137&module=gastracker&action=gasoracle',
  },
  arbitrum: {
    name: 'Arbitrum',
    rpc: 'https://arb1.arbitrum.io/rpc',
    fallbackRpc: 'https://arbitrum.llamarpc.com',
    fallbackRpc2: 'https://arbitrum-one.publicnode.com',
    fallbackRpc3: 'https://arbitrum.drpc.org',
    fallbackRpc4: 'https://rpc.ankr.com/arbitrum',
    fallbackRpc5: 'https://1rpc.io/arb',
    fallbackRpc6: 'https://arbitrum.blockpi.network/v1/rpc/public',
    symbol: 'ETH',
    explorer: 'https://arbiscan.io',
    chainId: 42161,
    coingeckoId: 'ethereum',
    etherscanGasApi: 'https://api.etherscan.io/v2/api?chainid=42161&module=gastracker&action=gasoracle',
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
    coingeckoId: 'ethereum',
    etherscanGasApi: 'https://api.etherscan.io/v2/api?chainid=8453&module=gastracker&action=gasoracle',
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
    coingeckoId: 'ethereum',
    etherscanGasApi: 'https://api.etherscan.io/v2/api?chainid=10&module=gastracker&action=gasoracle',
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
    coingeckoId: 'binancecoin',
    etherscanGasApi: 'https://api.etherscan.io/v2/api?chainid=56&module=gastracker&action=gasoracle',
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
      polygon: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
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
  MIN_TRANSACTION: 0.0,
  RPC_TIMEOUT: 5000,
  NFC_TIMEOUT: 15000,
};

interface GasEstimateResult {
  gasLimit: ethers.BigNumber;
  gasPrice: ethers.BigNumber;
  maxFeePerGas?: ethers.BigNumber;
  maxPriorityFeePerGas?: ethers.BigNumber;
  totalCost: ethers.BigNumber;
  strategy: 'eip1559' | 'legacy';
}

interface TransactionPreviewData {
  to: string;
  toENS?: string;
  amount: string;
  amountUSD: string;
  gasPrice: string;
  gasPriceUSD: string;
  gasLimit: string;
  totalGas: string;
  totalGasUSD: string;
  totalCost: string;
  totalCostUSD: string;
  network: string;
  tokenSymbol: string;
  nonce?: number;
  strategy: string;
}

const VillageWalletLogo = ({ size = 80 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#1e3a8a" stopOpacity="1" />
        <Stop offset="100%" stopColor="#7c3aed" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    
    {/* Background rounded square */}
    <Rect x="5" y="5" width="90" height="90" rx="20" fill="url(#blueGrad)" />
    
    {/* Top NFC waves */}
    <Path d="M 35 20 Q 50 15 65 20" stroke="#ff6b35" strokeWidth="3" fill="none" strokeLinecap="round" />
    <Path d="M 30 27 Q 50 20 70 27" stroke="#ff6b35" strokeWidth="3" fill="none" strokeLinecap="round" />
    
    {/* Card/rectangle in middle with orange border */}
    <Rect x="25" y="35" width="50" height="30" rx="4" fill="white" stroke="#ff6b35" strokeWidth="1.5" />
    
    {/* Letter V */}
    <SvgText
      x="50"
      y="60"
      fontFamily="Arial, sans-serif"
      fontSize="26"
      fontWeight="bold"
      fill="#7c3aed"
      textAnchor="middle"
    >
      V
    </SvgText>
    
    {/* Bottom NFC waves */}
    <Path d="M 35 80 Q 50 85 65 80" stroke="#ff6b35" strokeWidth="3" fill="none" strokeLinecap="round" />
    <Path d="M 30 73 Q 50 80 70 73" stroke="#ff6b35" strokeWidth="3" fill="none" strokeLinecap="round" />
  </Svg>
);

const TransactionPreviewModal = ({
    visible,
    data,
    onConfirm,
    onCancel,
    t,
  }: {
    visible: boolean;
    data: TransactionPreviewData | null;
    onConfirm: () => void;
    onCancel: () => void;
    t: any;
  }) => {
    if (!data) return null;
  
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{t.transactionPreview}</Text>
  
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>{t.warning}</Text>
              </View>
  
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t.recipient}</Text>
                  <Text style={styles.detailValue}>{data.toENS || data.to}</Text>
                  {data.toENS && <Text style={styles.detailSubValue}>{data.to}</Text>}
                </View>
  
                <View style={[styles.detailRow, styles.highlightRow]}>
                  <Text style={styles.detailLabel}>{t.amount}</Text>
                  <Text style={styles.detailValueHighlight}>{data.amount} {data.tokenSymbol}</Text>
                  <Text style={styles.detailSubValue}>${data.amountUSD}</Text>
                </View>
  
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t.gasPrice}</Text>
                  <Text style={styles.detailValue}>{data.gasPrice}</Text>
                  <Text style={styles.detailSubValue}>${data.gasPriceUSD}</Text>
                </View>
  
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t.estimatedGas}</Text>
                  <Text style={styles.detailValue}>{data.gasLimit}</Text>
                </View>
  
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t.totalGasCost}</Text>
                  <Text style={styles.detailValue}>{data.totalGas} {data.tokenSymbol}</Text>
                  <Text style={styles.detailSubValue}>${data.totalGasUSD}</Text>
                </View>
  
                <View style={styles.separator} />
  
                <View style={[styles.detailRow, styles.highlightRow]}>
                  <Text style={styles.detailLabel}>{t.totalCost}</Text>
                  <Text style={styles.detailValueLarge}>{data.totalCost} {data.tokenSymbol}</Text>
                  <Text style={styles.detailSubValue}>${data.totalCostUSD}</Text>
                </View>
  
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t.network}</Text>
                  <Text style={styles.detailValue}>{data.network} ({data.strategy.toUpperCase()})</Text>
                </View>
              </View>
  
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={onCancel}
                >
                  <Text style={styles.modalButtonTextCancel}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={onConfirm}
                >
                  <Text style={styles.modalButtonTextConfirm}>{t.confirmPayment}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  export default function VillageWallet() {
    const [screen, setScreen] = useState('home');
    const [loading, setLoading] = useState(false);
    const [loadingButton, setLoadingButton] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [selectedNetwork, setSelectedNetwork] = useState('polygon');
    const [selectedToken, setSelectedToken] = useState('native');
    const [merchantAddress, setMerchantAddress] = useState('');
    const [merchantDisplayName, setMerchantDisplayName] = useState('');
    const [tempAddress, setTempAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [pin, setPin] = useState('');
    const [cardData, setCardData] = useState<any>(null);
    const [balance, setBalance] = useState('');
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [priceLoading, setPriceLoading] = useState(false);
    const [priceSource, setPriceSource] = useState<string>('');
    const [language, setLanguage] = useState('en');
    const [showTransactionPreview, setShowTransactionPreview] = useState(false);
    const [transactionPreviewData, setTransactionPreviewData] = useState<TransactionPreviewData | null>(null);
    const [pendingTxData, setPendingTxData] = useState<any>(null);
    const secureKeyHandler = useRef(new SecureKeyHandler());
    const nfcTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
    const t = TRANSLATIONS[language];

    useEffect(() => {
      NfcManager.start().catch(() => {
        Alert.alert('NFC Error', 'NFC not available on this device');
      });
      checkNetworkConnection();
      fetchPrices();
      const priceInterval = setInterval(fetchPrices, 120000);
      return () => {
        NfcManager.cancelTechnologyRequest().catch(() => {});
        clearInterval(priceInterval);
        secureKeyHandler.current.clearKey();
        if (nfcTimeoutRef.current) {
          clearTimeout(nfcTimeoutRef.current);
        }
      };
    }, []);
  
    useEffect(() => {
      checkNetworkConnection();
    }, [selectedNetwork]);
  
    useEffect(() => {
      if (screen !== 'balance' && loadingButton === 'balance') {
        setLoading(false);
        setLoadingButton(null);
        NfcManager.cancelTechnologyRequest().catch(() => {});
        if (nfcTimeoutRef.current) {
          clearTimeout(nfcTimeoutRef.current);
        }
      }
    }, [screen]);

    const decryptPrivateKey = (encPrivKey: string, pin: string, serial: string) => {
      try {
        const passphrase = `${serial}-PIN${pin}-SECURE`;
        console.log(`Attempting decryption with serial: ${serial}`);
        const decrypted = CryptoJS.AES.decrypt(encPrivKey, passphrase).toString(CryptoJS.enc.Utf8);
        let privateKey = decrypted;
        if (!privateKey.startsWith('0x')) {
          privateKey = '0x' + privateKey;
        }
        if (!privateKey || privateKey.length !== 66 || !/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
          throw new Error('Invalid decryption result');
        }
        return privateKey;
      } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Invalid PIN - Could not decrypt private key');
      }
    };
  
    const getProvider = async () => {
      const network = NETWORKS[selectedNetwork];
      const rpcs = [network.rpc, network.fallbackRpc, network.fallbackRpc2, network.fallbackRpc3, network.fallbackRpc4, network.fallbackRpc5, network.fallbackRpc6].filter(Boolean);
      for (const rpc of rpcs) {
        try {
          const provider = new ethers.providers.JsonRpcProvider(rpc);
          const blockPromise = provider.getBlockNumber();
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), CONFIG.RPC_TIMEOUT));
          await Promise.race([blockPromise, timeoutPromise]);
          return provider;
        } catch (error) {
          continue;
        }
      }
      throw new Error(`Cannot connect to ${network.name}. Please check your internet connection.`);
    };
  
    const checkNetworkConnection = async () => {
      try {
        await getProvider();
        setIsConnected(true);
      } catch {
        setIsConnected(false);
      }
    };
  
    const fetchPrices = async () => {
      setPriceLoading(true);
      const pairs = ['ETH-USD', 'MATIC-USD', 'BNB-USD'];
      const newPrices: Record<string, number> = { 'tether': 1.00, 'usd-coin': 1.00, 'dai': 1.00 };
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
      setPrices(newPrices);
      setPriceSource('Coinbase');
      setPriceLoading(false);
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

    const readNFCCard = async () => {
      try {
        if (nfcTimeoutRef.current) {
          clearTimeout(nfcTimeoutRef.current);
        }
  
        const timeoutPromise = new Promise((_, reject) => {
          nfcTimeoutRef.current = setTimeout(() => {
            NfcManager.cancelTechnologyRequest().catch(() => {});
            reject(new Error(t.nfcTimeout || 'NFC scan timed out'));
          }, CONFIG.NFC_TIMEOUT);
        });
  
        const readPromise = (async () => {
          await NfcManager.requestTechnology(NfcTech.Ndef);
          const tag = await NfcManager.getTag();
          if (!tag?.ndefMessage?.[0]?.payload) throw new Error('No data found on card');
          const bytes = tag.ndefMessage[0].payload;
          const text = String.fromCharCode(...bytes.slice(3));
          try {
            const walletData = JSON.parse(text);
            return walletData;
          } catch {
            const [encPrivKey, ensName] = text.split('|');
            const serial = tag.id || 'UNKNOWN';
            return { encPrivKey, ens: ensName || null, serial, addr: null };
          }
        })();
  
        const cardData = await Promise.race([readPromise, timeoutPromise]);
        
        if (nfcTimeoutRef.current) {
          clearTimeout(nfcTimeoutRef.current);
        }
  
        await NfcManager.cancelTechnologyRequest();
        setCardData(cardData);
        return cardData;
      } catch (error: any) {
        if (nfcTimeoutRef.current) {
          clearTimeout(nfcTimeoutRef.current);
        }
        await NfcManager.cancelTechnologyRequest().catch(() => {});
        throw new Error(error.message || 'Failed to read card');
      }
    };
  
    const resolveENS = async (input: string) => {
      const provider = await getProvider();
      if (input.endsWith('.eth')) {
        const address = await provider.resolveName(input);
        if (!address) throw new Error('ENS name not found');
        return address;
      } else if (ethers.utils.isAddress(input)) {
        return input;
      } else {
        throw new Error('Invalid address or ENS name');
      }
    };
  
    const getAllTokenBalances = async (address: string) => {
      const provider = await getProvider();
      const balances: Record<string, string> = {};
      const nativeBal = await provider.getBalance(address);
      balances['native'] = ethers.utils.formatEther(nativeBal);
      for (const [tokenKey, token] of Object.entries(TOKENS)) {
        if (tokenKey === 'native') continue;
        const tokenAddress = (token as any).addresses[selectedNetwork];
        if (!tokenAddress) continue;
        try {
          const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
          const bal = await contract.balanceOf(address);
          balances[tokenKey] = ethers.utils.formatUnits(bal, (token as any).decimals);
        } catch (error) {
          balances[tokenKey] = '0';
        }
      }
      return balances;
    };
  
    const checkBalance = async () => {
      try {
        setLoading(true);
        setLoadingButton('balance');
        const card = await readNFCCard();
        if (!card.addr) {
          setLoading(false); 
          setLoadingButton(null);
          Alert.alert(t.pinRequired, t.enterPinPrompt, [
            { text: t.cancel, style: 'cancel' },
            { text: t.ok, onPress: () => {
              Alert.prompt(t.enterPin, t.enterPinDigits, [
                { text: t.cancel, style: 'cancel' },
                { text: t.ok, onPress: async (pinInput) => {
                  try {
                    setLoading(true); 
                    setLoadingButton('balance');
                    const privateKey = decryptPrivateKey(card.encPrivKey || card.ekey, pinInput || '', card.serial);
                    const wallet = new ethers.Wallet(privateKey);
                    card.addr = wallet.address;
                    setCardData(card);
                    const balances = await getAllTokenBalances(card.addr);
                    setBalance(JSON.stringify(balances));
                    setScreen('balance');
                    setLoading(false);
                    setLoadingButton(null);
                  } catch (error: any) {
                    setLoading(false);
                    setLoadingButton(null);
                    Alert.alert(t.error, error.message);
                  }
                }}
              ], 'secure-text');
            }}
          ]);
          return;
        }
        const balances = await getAllTokenBalances(card.addr);
        setBalance(JSON.stringify(balances));
        setScreen('balance');
        setLoading(false);
        setLoadingButton(null);
      } catch (error: any) {
        setLoading(false);
        setLoadingButton(null);
        Alert.alert(t.error, error.message);
      }
    };
  
    const handleReceivePayment = async () => {
      if (!merchantAddress) {
        Alert.alert(t.setupRequired, t.setAddressFirst, [{ text: t.goToSettings, onPress: () => setScreen('settings') }]);
        return;
      }
      if (!amount || parseFloat(amount) < CONFIG.MIN_TRANSACTION) {
        Alert.alert(t.error, `${t.minimumAmount} ${CONFIG.MIN_TRANSACTION}`);
        return;
      }
      const tokenSymbol = selectedToken === 'native' ? NETWORKS[selectedNetwork].symbol : TOKENS[selectedToken].symbol;
      Alert.alert(t.readyToReceive, `${t.askCustomerTap} ${amount} ${tokenSymbol}`, [
        { text: t.cancel, style: 'cancel' },
        { text: t.ready, onPress: () => initiatePayment() },
      ]);
    };
  
    const initiatePayment = async () => {
      try {
        setLoading(true);
        const customerCard = await readNFCCard();
        setLoading(false);
        setScreen('payment');
        const displayInfo = customerCard.ens ? `${customerCard.ens}\n${customerCard.addr?.slice(0, 10) || 'Address hidden'}...` : `${customerCard.addr?.slice(0, 10) || customerCard.serial}...`;
        Alert.alert(t.cardDetected, `${t.card}: ${customerCard.serial}\n${displayInfo}\n\n${t.askCustomerPin}`);
      } catch (error: any) {
        setLoading(false);
        Alert.alert(t.error, error.message);
      }
    };

  const getEtherscanGas = async (network: string): Promise<{ SafeGasPrice?: string; ProposeGasPrice?: string; FastGasPrice?: string } | null> => {
    try {
      const apiUrl = NETWORKS[network].etherscanGasApi;
      if (!apiUrl) return null;
      const response = await fetch(apiUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) return null;
      const data = await response.json();
      if (data.status === '1' && data.result) {
        return data.result;
      }
      return null;
    } catch (error) {
      console.error('Etherscan gas API error:', error);
      return null;
    }
  };

  const estimateOptimalGas = async (
    provider: ethers.providers.Provider,
    tx: {
      from: string;
      to: string;
      data?: string;
      value?: ethers.BigNumber;
    },
    network: string,
    isTokenTransfer: boolean = false
  ): Promise<GasEstimateResult> => {
    try {
      let estimatedGas: ethers.BigNumber;
      try {
        estimatedGas = await provider.estimateGas(tx);
      } catch (error) {
        if (isTokenTransfer) {
          estimatedGas = ethers.BigNumber.from(65000);
        } else {
          estimatedGas = ethers.BigNumber.from(21000);
        }
      }

      const safeGasLimit = estimatedGas.mul(110).div(100);

      const etherscanGas = await getEtherscanGas(network);
      
      if (etherscanGas?.ProposeGasPrice) {
        try {
          const proposeGwei = parseFloat(etherscanGas.ProposeGasPrice);
          const safeGwei = parseFloat(etherscanGas.SafeGasPrice || etherscanGas.ProposeGasPrice);
          const avgGwei = (proposeGwei + safeGwei) / 2;
          const gasPrice = ethers.utils.parseUnits(avgGwei.toFixed(2), 'gwei');
          const totalCost = safeGasLimit.mul(gasPrice);
          console.log(`âœ… ETHERSCAN V2: Using ${avgGwei.toFixed(2)} gwei (avg of ${proposeGwei} and ${safeGwei})`);
          return {
            gasLimit: safeGasLimit,
            gasPrice: gasPrice,
            totalCost: totalCost,
            strategy: 'legacy',
          };
        } catch (error) {
          console.error('Failed to parse Etherscan gas:', error);
        }
      }

      const feeData = await provider.getFeeData();
      
      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        return {
          gasLimit: safeGasLimit,
          gasPrice: feeData.maxFeePerGas,
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          totalCost: safeGasLimit.mul(feeData.maxFeePerGas),
          strategy: 'eip1559',
        };
      } else {
        const gasPrice = await provider.getGasPrice();
        return {
          gasLimit: safeGasLimit,
          gasPrice: gasPrice,
          totalCost: safeGasLimit.mul(gasPrice),
          strategy: 'legacy',
        };
      }
    } catch (error) {
      console.error('Gas estimation failed:', error);
      throw new Error('Unable to estimate gas fees');
    }
  };

  const prepareTransaction = async () => {
    if (!cardData || !pin || !amount) {
      Alert.alert(t.error, t.missingInfo);
      return;
    }
    setLoading(true);
    try {
      const provider = await getProvider();
      const privateKey = decryptPrivateKey(cardData.encPrivKey || cardData.ekey, pin, cardData.serial);
      
      secureKeyHandler.current.setKey(privateKey);
      
      const wallet = new ethers.Wallet(privateKey, provider);
      if (!cardData.addr) {
        cardData.addr = wallet.address;
        setCardData(cardData);
      }
      const to = merchantAddress;
      
      const tokenSymbol = selectedToken === 'native' ? NETWORKS[selectedNetwork].symbol : TOKENS[selectedToken].symbol;
      const tokenPrice = getTokenPrice();
      
      if (selectedToken === 'native') {
        const value = ethers.utils.parseEther(amount);
        const gasEstimate = await estimateOptimalGas(provider, { from: wallet.address, to, value }, selectedNetwork, false);
        const balance = await wallet.getBalance();
        const totalNeeded = value.add(gasEstimate.totalCost);

        if (balance.lt(totalNeeded)) {
          const shortfall = totalNeeded.sub(balance);
          secureKeyHandler.current.clearKey();
          throw new Error(
            `${t.insufficientBalanceDetail}\n\n` +
            `${t.balance}: ${ethers.utils.formatEther(balance)} ${NETWORKS[selectedNetwork].symbol}\n` +
            `${t.amount}: ${ethers.utils.formatEther(value)} ${NETWORKS[selectedNetwork].symbol}\n` +
            `${t.gasFee}: ${ethers.utils.formatEther(gasEstimate.totalCost)} ${NETWORKS[selectedNetwork].symbol}\n` +
            `${t.shortBy}: ${ethers.utils.formatEther(shortfall)} ${NETWORKS[selectedNetwork].symbol}`
          );
        }

        let toENS: string | undefined;
        if (merchantDisplayName.endsWith('.eth')) {
          toENS = merchantDisplayName;
        }

        const amountFormatted = ethers.utils.formatEther(value);
        const totalGasFormatted = ethers.utils.formatEther(gasEstimate.totalCost);
        const totalCostFormatted = ethers.utils.formatEther(totalNeeded);
        const gasPriceGwei = ethers.utils.formatUnits(gasEstimate.gasPrice, 'gwei');

        setTransactionPreviewData({
          to: to,
          toENS: toENS,
          amount: amountFormatted,
          amountUSD: (parseFloat(amountFormatted) * tokenPrice).toFixed(2),
          gasPrice: `${parseFloat(gasPriceGwei).toFixed(2)} Gwei`,
          gasPriceUSD: (parseFloat(totalGasFormatted) * tokenPrice / parseFloat(gasEstimate.gasLimit.toString())).toFixed(6),
          gasLimit: gasEstimate.gasLimit.toString(),
          totalGas: totalGasFormatted,
          totalGasUSD: (parseFloat(totalGasFormatted) * tokenPrice).toFixed(2),
          totalCost: totalCostFormatted,
          totalCostUSD: (parseFloat(totalCostFormatted) * tokenPrice).toFixed(2),
          network: NETWORKS[selectedNetwork].name,
          tokenSymbol: tokenSymbol,
          strategy: gasEstimate.strategy,
        });

        let txObject: any = { to, value, gasLimit: gasEstimate.gasLimit };
        if (gasEstimate.strategy === 'eip1559') {
          txObject.maxFeePerGas = gasEstimate.maxFeePerGas;
          txObject.maxPriorityFeePerGas = gasEstimate.maxPriorityFeePerGas;
        } else {
          txObject.gasPrice = gasEstimate.gasPrice;
        }
        setPendingTxData({ txObject, gasEstimate, wallet });

      } else {
        const token = TOKENS[selectedToken];
        const tokenAddress = token.addresses[selectedNetwork];
        if (!tokenAddress) {
          secureKeyHandler.current.clearKey();
          throw new Error(t.tokenNotSupported);
        }
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
        const value = ethers.utils.parseUnits(amount, token.decimals);
        const tokenBalance = await contract.balanceOf(wallet.address);
        if (tokenBalance.lt(value)) {
          secureKeyHandler.current.clearKey();
          throw new Error(t.insufficientBalance);
        }
        
        const data = contract.interface.encodeFunctionData('transfer', [to, value]);
        const gasEstimate = await estimateOptimalGas(provider, { from: wallet.address, to: tokenAddress, data }, selectedNetwork, true);

        const gasBalance = await wallet.getBalance();
        if (gasBalance.lt(gasEstimate.totalCost)) {
          secureKeyHandler.current.clearKey();
          throw new Error(
            `${t.insufficientGasDetail}\n\n` +
            `${t.have}: ${ethers.utils.formatEther(gasBalance)} ${NETWORKS[selectedNetwork].symbol}\n` +
            `${t.need}: ${ethers.utils.formatEther(gasEstimate.totalCost)} ${NETWORKS[selectedNetwork].symbol}`
          );
        }

        let toENS: string | undefined;
        if (merchantDisplayName.endsWith('.eth')) {
          toENS = merchantDisplayName;
        }

        const amountFormatted = ethers.utils.formatUnits(value, token.decimals);
        const totalGasFormatted = ethers.utils.formatEther(gasEstimate.totalCost);
        const gasPriceGwei = ethers.utils.formatUnits(gasEstimate.gasPrice, 'gwei');
        
        const totalCostInToken = amountFormatted;
        const totalCostUSD = (parseFloat(amountFormatted) * tokenPrice + parseFloat(totalGasFormatted) * prices[NETWORKS[selectedNetwork].coingeckoId]).toFixed(2);

        setTransactionPreviewData({
          to: to,
          toENS: toENS,
          amount: amountFormatted,
          amountUSD: (parseFloat(amountFormatted) * tokenPrice).toFixed(2),
          gasPrice: `${parseFloat(gasPriceGwei).toFixed(2)} Gwei`,
          gasPriceUSD: (parseFloat(totalGasFormatted) * prices[NETWORKS[selectedNetwork].coingeckoId] / parseFloat(gasEstimate.gasLimit.toString())).toFixed(6),
          gasLimit: gasEstimate.gasLimit.toString(),
          totalGas: totalGasFormatted,
          totalGasUSD: (parseFloat(totalGasFormatted) * prices[NETWORKS[selectedNetwork].coingeckoId]).toFixed(2),
          totalCost: totalCostInToken,
          totalCostUSD: totalCostUSD,
          network: NETWORKS[selectedNetwork].name,
          tokenSymbol: tokenSymbol,
          strategy: gasEstimate.strategy,
        });

        let txOptions: any = { gasLimit: gasEstimate.gasLimit };
        if (gasEstimate.strategy === 'eip1559') {
          txOptions.maxFeePerGas = gasEstimate.maxFeePerGas;
          txOptions.maxPriorityFeePerGas = gasEstimate.maxPriorityFeePerGas;
        } else {
          txOptions.gasPrice = gasEstimate.gasPrice;
        }

        setPendingTxData({ contract, to, value, txOptions, gasEstimate, wallet, token });
      }

      setLoading(false);
      setShowTransactionPreview(true);

    } catch (error: any) {
      setLoading(false);
      secureKeyHandler.current.clearKey();
      Alert.alert(t.transactionFailed, error.message);
    }
  };

  const confirmTransaction = async () => {
    setShowTransactionPreview(false);
    setLoading(true);
    try {
      if (!pendingTxData || !secureKeyHandler.current.hasKey()) {
        throw new Error('No pending transaction');
      }

      if (selectedToken === 'native') {
        const { txObject, gasEstimate, wallet } = pendingTxData;
        const tx = await wallet.sendTransaction(txObject);
        await tx.wait();
        
        const tokenSymbol = NETWORKS[selectedNetwork].symbol;
        setLoading(false);
        setPin('');
        Alert.alert(
          t.paymentSuccessful,
          `${t.amount}: ${amount} ${tokenSymbol}\n${t.gasFee}: ${ethers.utils.formatEther(gasEstimate.totalCost)} ${tokenSymbol} (${gasEstimate.strategy.toUpperCase()})\nTx: ${tx.hash.slice(0, 10)}...\n\n${t.viewOn} ${NETWORKS[selectedNetwork].explorer}/tx/${tx.hash}`,
          [{ text: t.done, onPress: () => { setScreen('home'); setAmount(''); setCardData(null); }}]
        );
      } else {
        const { contract, to, value, txOptions, gasEstimate, token } = pendingTxData;
        const tx = await contract.transfer(to, value, txOptions);
        await tx.wait();
        
        setLoading(false);
        setPin('');
        Alert.alert(
          t.paymentSuccessful,
          `${t.amount}: ${amount} ${token.symbol}\n${t.gasFee}: ${ethers.utils.formatEther(gasEstimate.totalCost)} ${NETWORKS[selectedNetwork].symbol} (${gasEstimate.strategy.toUpperCase()})\nTx: ${tx.hash.slice(0, 10)}...`,
          [{ text: t.done, onPress: () => { setScreen('home'); setAmount(''); setCardData(null); }}]
        );
      }

    } catch (error: any) {
      setLoading(false);
      Alert.alert(t.transactionFailed, error.message);
    } finally {
      secureKeyHandler.current.clearKey();
      setPendingTxData(null);
      setTransactionPreviewData(null);
    }
  };

  const cancelTransaction = () => {
    setShowTransactionPreview(false);
    setPendingTxData(null);
    setTransactionPreviewData(null);
    secureKeyHandler.current.clearKey();
    setLoading(false);
  };

  const saveMerchantAddress = async () => {
    if (!tempAddress) {
      Alert.alert(t.error, t.pleaseEnterAddress);
      return;
    }
    setLoading(true);
    try {
      const resolvedAddress = await resolveENS(tempAddress);
      setMerchantAddress(resolvedAddress);
      setMerchantDisplayName(tempAddress);
      setLoading(false);
      Alert.alert(t.success, t.merchantAddressSet);
    } catch (error: any) {
      setLoading(false);
      Alert.alert(t.error, error.message);
    }
  };

  const setMerchantAddressFromCard = async () => {
    try {
      setLoading(true);
      const card = await readNFCCard();
      let address = card.addr;
      if (!address) {
        Alert.alert(t.cardFormatPin, '', [
          { text: t.cancel, style: 'cancel', onPress: () => setLoading(false) },
          { text: t.ok, onPress: () => {
            Alert.prompt(t.enterPin, t.enterPinDigits, [
              { text: t.cancel, style: 'cancel', onPress: () => setLoading(false) },
              { text: t.ok, onPress: async (pinInput) => {
                try {
                  const privateKey = decryptPrivateKey(card.encPrivKey || card.ekey, pinInput || '', card.serial);
                  const wallet = new ethers.Wallet(privateKey);
                  address = wallet.address;
                  setMerchantAddress(address);
                  setMerchantDisplayName(card.ens || address);
                  setLoading(false);
                  Alert.alert(t.success, t.merchantAddressSet);
                } catch (error: any) {
                  setLoading(false);
                  Alert.alert(t.error, t.invalidPin);
                }
              }}
            ], 'secure-text');
          }}
        ]);
        return;
      }
      setMerchantAddress(address);
      setMerchantDisplayName(card.ens || address);
      setLoading(false);
      Alert.alert(t.success, t.merchantAddressSet);
    } catch (error: any) {
      setLoading(false);
      Alert.alert(t.errorReadingCard, error.message);
    }
  };

  const changeNetwork = (network: string) => {
    setSelectedNetwork(network);
    Alert.alert(t.networkChanged, `${t.nowUsing} ${NETWORKS[network].name}`);
  };

  const renderHomeScreen = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.app}>
      <ScrollView style={styles.app} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Text style={styles.villageEmoji}></Text>
              <VillageWalletLogo size={80} />
            </View>
            <Text style={styles.title}>{t.villageWallet}</Text>
            <Text style={styles.subtitle}>{t.multiNetwork}</Text>
            <View style={styles.networkBadge}>
              <View style={[styles.connectionDot, isConnected ? styles.connectionDotConnected : styles.connectionDotDisconnected]} />
              <Text style={styles.networkBadgeText}>{NETWORKS[selectedNetwork].name}</Text>
              <View style={styles.tickerBadge}>
                <Text style={styles.tickerText}>{NETWORKS[selectedNetwork].symbol}</Text>
              </View>
            </View>
            {priceLoading && <Text style={styles.priceLoadingText}>{t.updatingPrices}</Text>}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => setScreen('receive')} disabled={loadingButton === 'receive'}>
              {loadingButton === 'receive' ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t.receivePayment}</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={checkBalance} disabled={loadingButton === 'balance'}>
              {loadingButton === 'balance' ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t.checkBalance}</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonTertiary]} onPress={() => setScreen('settings')} disabled={loadingButton === 'settings'}>
              {loadingButton === 'settings' ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t.settings}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderReceiveScreen = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.app}>
      <ScrollView style={styles.app} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t.receive}</Text>
            {merchantAddress && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>{t.paymentsGoTo}</Text>
                <Text style={styles.infoValue}>{merchantDisplayName}</Text>
              </View>
            )}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.selectNetwork}</Text>
            {Object.keys(NETWORKS).map((key) => (
              <TouchableOpacity key={key} style={[styles.networkButton, selectedNetwork === key && styles.networkButtonActive]} onPress={() => setSelectedNetwork(key)}>
                <Text style={[styles.networkButtonText, selectedNetwork === key && styles.networkButtonTextActive]}>{NETWORKS[key].name} ({NETWORKS[key].symbol})</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.selectToken}</Text>
            <View style={styles.tokenSelector}>
              {Object.keys(TOKENS).filter(key => key === 'native' || TOKENS[key].addresses[selectedNetwork]).map((key) => (
                <TouchableOpacity key={key} style={[styles.tokenButton, selectedToken === key && styles.tokenButtonActive]} onPress={() => setSelectedToken(key)}>
                  <Text style={[styles.tokenButtonText, selectedToken === key && styles.tokenButtonTextActive]}>
                    {key === 'native' ? NETWORKS[selectedNetwork].symbol : TOKENS[key].symbol}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t.amount}</Text>
            <TextInput style={styles.input} placeholder="0.00" placeholderTextColor="#718096" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
            {amount && parseFloat(amount) > 0 && <Text style={styles.usdEstimate}>${calculateUSD(amount)} USD</Text>}
          </View>
          <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleReceivePayment} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t.readyForPayment}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonTertiary]} onPress={() => { setScreen('home'); setAmount(''); }} disabled={loading}>
            <Text style={styles.buttonText}>{t.back}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderPaymentScreen = () => {
    const tokenSymbol = selectedToken === 'native' ? NETWORKS[selectedNetwork].symbol : TOKENS[selectedToken].symbol;
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.app}>
        <ScrollView style={styles.app} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>{t.customerPinEntry}</Text>
            </View>
            {cardData && (
              <View style={styles.cardInfo}>
                <Text style={styles.cardInfoText}>{t.card}: {cardData.serial}</Text>
                {cardData.ens && <Text style={styles.cardInfoText}>{t.ensLabel} {cardData.ens}</Text>}
                {cardData.addr && <Text style={styles.cardInfoText}>{t.wallet} {cardData.addr.slice(0, 10)}...</Text>}
              </View>
            )}
            <View style={styles.section}>
              <Text style={styles.amountDisplay}>{amount} {tokenSymbol}</Text>
              <Text style={styles.usdEstimate}>${calculateUSD(amount)} USD</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t.enterPin}</Text>
              <TextInput style={styles.pinInput} placeholder="******" placeholderTextColor="#718096" keyboardType="number-pad" secureTextEntry={true} maxLength={6} value={pin} onChangeText={setPin} />
              <View style={styles.warning}>
                <Text style={styles.warningText}>{t.pinSecure}</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={prepareTransaction} disabled={loading || !pin || pin.length < 4}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t.reviewTransaction}</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => { setScreen('receive'); setPin(''); setCardData(null); }} disabled={loading}>
              <Text style={styles.buttonText}>{t.cancel}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  const renderBalanceScreen = () => {
    let balances: Record<string, string> = {};
    try {
      balances = balance ? JSON.parse(balance) : {};
    } catch {
      balances = {};
    }
    let totalUSD = 0;
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.app}>
        <ScrollView style={styles.app} contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>{t.cardBalance}</Text>
            </View>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>{t.currentBalance} {t.on} {NETWORKS[selectedNetwork].name}</Text>
              {balances['native'] && (
                <>
                  <Text style={styles.balanceAmount}>{parseFloat(balances['native']).toFixed(4)} {NETWORKS[selectedNetwork].symbol}</Text>
                  <Text style={styles.balanceUSD}>${(parseFloat(balances['native']) * prices[NETWORKS[selectedNetwork].coingeckoId]).toFixed(2)} USD</Text>
                </>
              )}
              <Text style={styles.networkLabel}>{NETWORKS[selectedNetwork].name} Network</Text>
            </View>
            {cardData && (
              <View style={styles.cardDetails}>
                <Text style={styles.cardDetailLabel}>{t.cardSerial}</Text>
                <Text style={styles.cardDetailValue}>{cardData.serial}</Text>
                {cardData.ens && (
                  <>
                    <Text style={styles.cardDetailLabel}>{t.ensName}</Text>
                    <Text style={styles.cardDetailValue}>{cardData.ens}</Text>
                  </>
                )}
                <Text style={styles.cardDetailLabel}>{t.address}</Text>
                <Text style={styles.cardDetailValue}>{cardData.addr}</Text>
              </View>
            )}
            <View style={styles.allBalancesContainer}>
              <Text style={styles.allBalancesTitle}>{t.allTokenBalances}</Text>
              {Object.entries(balances).map(([tokenKey, tokenBalance]) => {
                const tokenInfo = tokenKey === 'native' ? { symbol: NETWORKS[selectedNetwork].symbol, coingeckoId: NETWORKS[selectedNetwork].coingeckoId } : TOKENS[tokenKey];
                const price = prices[tokenInfo.coingeckoId] || 0;
                const usdValue = parseFloat(tokenBalance) * price;
                totalUSD += usdValue;
                return (
                  <View key={tokenKey} style={styles.tokenBalanceRow}>
                    <View style={styles.tokenBalanceLeft}>
                      <Text style={styles.tokenBalanceSymbol}>{tokenInfo.symbol}</Text>
                      <Text style={styles.tokenBalanceAmount}>{parseFloat(tokenBalance).toFixed(4)}</Text>
                    </View>
                    <Text style={styles.tokenBalanceUSD}>${usdValue.toFixed(2)}</Text>
                  </View>
                );
              })}
              <View style={styles.totalBalanceRow}>
                <Text style={styles.totalBalanceLabel}>{t.totalUsdValue}</Text>
                <Text style={styles.totalBalanceAmount}>${totalUSD.toFixed(2)}</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => { setScreen('home'); setCardData(null); setBalance(''); }}>
              <Text style={styles.buttonText}>{t.backToHome}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  const renderSettingsScreen = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.app}>
      <ScrollView style={styles.app} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t.settings}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.merchantAddress}</Text>
            <Text style={styles.sectionSubtext}>{t.paymentsReceived}</Text>
            {merchantAddress && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>{t.currentAddress}</Text>
                <Text style={styles.infoValue}>{merchantDisplayName}</Text>
              </View>
            )}
            <TextInput style={styles.input} placeholder="0x... or name.eth" placeholderTextColor="#718096" value={tempAddress} onChangeText={setTempAddress} />
            <TouchableOpacity style={[styles.button, styles.buttonPrimary, { marginTop: 10 }]} onPress={saveMerchantAddress} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t.saveAddress}</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={setMerchantAddressFromCard} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t.scanCard}</Text>}
            </TouchableOpacity>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.selectNetwork}</Text>
            {Object.keys(NETWORKS).map((key) => (
              <TouchableOpacity key={key} style={[styles.networkButton, selectedNetwork === key && styles.networkButtonActive]} onPress={() => changeNetwork(key)}>
                <Text style={[styles.networkButtonText, selectedNetwork === key && styles.networkButtonTextActive]}>{NETWORKS[key].name} ({NETWORKS[key].symbol})</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.language}</Text>
            <Text style={styles.sectionSubtext}>{t.selectLanguage}</Text>
            <View style={styles.tokenSelector}>
              {Object.keys(TRANSLATIONS).map((langKey) => (
                <TouchableOpacity key={langKey} style={[styles.tokenButton, language === langKey && styles.tokenButtonActive]} onPress={() => setLanguage(langKey)}>
                  <Text style={[styles.tokenButtonText, language === langKey && styles.tokenButtonTextActive]}>{TRANSLATIONS[langKey].flag} {TRANSLATIONS[langKey].name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={[styles.button, styles.buttonTertiary]} onPress={() => setScreen('home')}>
            <Text style={styles.buttonText}>{t.backToHome}</Text>
          </TouchableOpacity>
          <View style={styles.footer}>
            <VillageWalletLogo size={50} />
            <Text style={styles.footerText}>{t.version}</Text>
            <Text style={styles.footerText}>{t.pinFixed}</Text>
            <Text style={styles.footerText}>{t.transactionsWorking}</Text>
            <Text style={styles.footerText}>{t.cheaperGas}</Text>
            <Text style={styles.footerText}>{t.multiNetwork}</Text>
            <Text style={styles.footerText}>Security: SecureKeyHandler</Text>
            <Text style={styles.footerText}>UI: Transaction Preview</Text>
            <Text style={styles.footerText}>UX: 15s NFC Timeout</Text>
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
      
      <TransactionPreviewModal
        visible={showTransactionPreview}
        data={transactionPreviewData}
        onConfirm={confirmTransaction}
        onCancel={cancelTransaction}
        t={t}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, padding: 20 },
  scrollContent: { paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  villageEmoji: { fontSize: 80, marginRight: 15 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8, marginTop: 15 },
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
  networkButtonText: { fontSize: 16, color: '#a0aec0', fontWeight: '600' },
  networkButtonTextActive: { color: '#fff' },
  warning: { backgroundColor: '#2d2d44', padding: 15, borderRadius: 10, marginTop: 20, borderLeftWidth: 4, borderLeftColor: '#f59e0b' },
  warningText: { fontSize: 14, color: '#fbbf24', textAlign: 'center' },
  allBalancesContainer: { backgroundColor: '#2d2d44', padding: 20, borderRadius: 10, width: '100%', marginTop: 20, borderWidth: 2, borderColor: '#8b5cf6' },
  allBalancesTitle: { fontSize: 18, fontWeight: 'bold', color: '#a78bfa', marginBottom: 15, textAlign: 'center' },
  tokenBalanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#4a5568' },
  tokenBalanceLeft: { flex: 1 },
  tokenBalanceSymbol: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  tokenBalanceAmount: { fontSize: 14, color: '#a0aec0', fontFamily: 'monospace' },
  tokenBalanceUSD: { fontSize: 16, color: '#10b981', fontWeight: '600' },
  totalBalanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, marginTop: 10, borderTopWidth: 2, borderTopColor: '#8b5cf6' },
  totalBalanceLabel: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  totalBalanceAmount: { fontSize: 20, fontWeight: 'bold', color: '#10b981' },
  footer: { alignItems: 'center', marginTop: 30, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#4a5568' },
  footerText: { fontSize: 12, color: '#718096', marginBottom: 5 },
    modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    maxWidth: 500,
    width: '100%',
    maxHeight: '90%',
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  modalScroll: {
    width: '100%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 20,
    textAlign: 'center',
  },
  warningBox: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  highlightRow: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'monospace',
  },
  detailValueHighlight: {
    fontSize: 16,
    color: '#ffd700',
    fontWeight: 'bold',
  },
  detailValueLarge: {
    fontSize: 20,
    color: '#ffd700',
    fontWeight: 'bold',
  },
  detailSubValue: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    marginVertical: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#666',
  },
  modalButtonConfirm: {
    backgroundColor: '#ffd700',
  },
  modalButtonTextCancel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonTextConfirm: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
