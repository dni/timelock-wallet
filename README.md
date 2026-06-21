# Timelock Wallet

Offline Bitcoin wallet tool for generating BIP39 mnemonics and BIP46 timelocked fidelity bond addresses.

## Features

- **BIP39** — generate or import 12/24-word mnemonic seeds
- **BIP84** — derive native segwit (P2WPKH) receiving addresses
- **BIP46** — derive timelocked fidelity bond addresses (P2WSH + CLTV) by month/year

## Usage

Open the [hosted page](https://dnilabs.github.io/600-timelock/) or download `dist/index.html` and open it locally — no internet connection required.

> **Security:** Use on an air-gapped device. Private keys never leave the browser.

## Build

```sh
npm install
npm run build
# output: dist/index.html (single self-contained file)
```

## Standards

| BIP | Purpose |
|-----|---------|
| [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) | Mnemonic seed phrases |
| [BIP84](https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki) | Derivation for P2WPKH |
| [BIP46](https://github.com/bitcoin/bips/blob/master/bip-0046.mediawiki) | Timelocked fidelity bond addresses |
