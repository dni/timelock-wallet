import { generateMnemonic as bip39Generate, validateMnemonic as bip39Validate, mnemonicToSeedSync } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english'
import { HDKey } from '@scure/bip32'
import { sha256 } from '@noble/hashes/sha256'
import { ripemd160 } from '@noble/hashes/ripemd160'
import { bytesToHex } from '@noble/hashes/utils'
import { bech32 } from '@scure/base'
import type { DerivedWallet, StandardAddress } from '../types'

export function generateMnemonic(wordCount: 12 | 24): string {
  return bip39Generate(wordlist, wordCount === 24 ? 256 : 128)
}

export function validateMnemonic(mnemonic: string): boolean {
  return bip39Validate(mnemonic, wordlist)
}

export function deriveWallet(mnemonic: string, passphrase = ''): DerivedWallet {
  const seed = mnemonicToSeedSync(mnemonic, passphrase)
  const master = HDKey.fromMasterSeed(seed)
  const account = master.derive("m/84'/0'/0'")

  return {
    mnemonic,
    seedHex: bytesToHex(seed),
    masterXprv: master.privateExtendedKey!,
    masterXpub: master.publicExtendedKey!,
    accountXprv: account.privateExtendedKey!,
    accountXpub: account.publicExtendedKey!,
  }
}

function hash160(pubkey: Uint8Array): Uint8Array {
  return ripemd160(sha256(pubkey))
}

function pubkeyToP2WPKH(pubkey: Uint8Array): string {
  const h160 = hash160(pubkey)
  return bech32.encode('bc', [0, ...bech32.toWords(h160)])
}

export function deriveStandardAddresses(
  mnemonic: string,
  passphrase = '',
  count = 10
): StandardAddress[] {
  const seed = mnemonicToSeedSync(mnemonic, passphrase)
  const account = HDKey.fromMasterSeed(seed).derive("m/84'/0'/0'")
  const external = account.derive('0')

  const addresses: StandardAddress[] = []
  for (let i = 0; i < count; i++) {
    const child = external.derive(`${i}`)
    const pubkey = child.publicKey!
    addresses.push({
      index: i,
      path: `m/84'/0'/0'/0/${i}`,
      address: pubkeyToP2WPKH(pubkey),
      pubkeyHex: bytesToHex(pubkey),
    })
  }
  return addresses
}
