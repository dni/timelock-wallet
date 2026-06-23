import { mnemonicToSeedSync } from '@scure/bip39'
import { HDKey } from '@scure/bip32'
import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex } from '@noble/hashes/utils'
import { bech32 } from '@scure/base'
import * as btcScript from 'bitcoinjs-lib/src/script'
import type { TimelockBond } from '../types'

const BOND_PATH_PREFIX = "m/84'/0'/0'/2"
const ZPUB_VERSIONS = { private: 0x04b2430c, public: 0x04b24746 }

function parseAccountKey(xpub: string): HDKey {
  try {
    return HDKey.fromExtendedKey(xpub)
  } catch {
    return HDKey.fromExtendedKey(xpub, ZPUB_VERSIONS)
  }
}

export function indexToTimelock(index: number): {
  year: number
  month: number
  ts: number
  dateStr: string
} {
  if (index < 0 || index > 959) throw new Error(`Invalid BIP46 index: ${index}`)
  const year = 2020 + Math.floor(index / 12)
  const month = 1 + (index % 12)
  const ts = Math.floor(Date.UTC(year, month - 1, 1, 0, 0, 0, 0) / 1000)
  const dateStr = `${year}-${String(month).padStart(2, '0')}`
  return { year, month, ts, dateStr }
}

function buildWitnessScript(pubkey: Uint8Array, locktime: number): Uint8Array {
  return btcScript.compile([
    btcScript.number.encode(locktime),
    btcScript.OPS.OP_CHECKLOCKTIMEVERIFY,
    btcScript.OPS.OP_DROP,
    pubkey,
    btcScript.OPS.OP_CHECKSIG,
  ])
}

function witnessScriptToP2WSH(witnessScript: Uint8Array): string {
  const scriptHash = sha256(witnessScript)
  return bech32.encode('bc', [0, ...bech32.toWords(scriptHash)])
}

export function deriveBond(masterKey: HDKey, index: number): TimelockBond {
  const { year, month, ts, dateStr } = indexToTimelock(index)
  const child = masterKey.derive(`${BOND_PATH_PREFIX}/${index}`)
  const pubkey = child.publicKey!
  const witnessScript = buildWitnessScript(pubkey, ts)
  return {
    index,
    year,
    month,
    timelockTs: ts,
    timelockDate: dateStr,
    pubkeyHex: bytesToHex(pubkey),
    address: witnessScriptToP2WSH(witnessScript),
    witnessScriptHex: bytesToHex(witnessScript),
  }
}

export function deriveBonds(
  mnemonic: string,
  passphrase = '',
  startIndex: number,
  endIndex: number
): TimelockBond[] {
  const seed = mnemonicToSeedSync(mnemonic, passphrase)
  const master = HDKey.fromMasterSeed(seed)
  const bonds: TimelockBond[] = []
  for (let i = startIndex; i <= endIndex; i++) {
    bonds.push(deriveBond(master, i))
  }
  return bonds
}

export function deriveBondsFromXpub(
  xpub: string,
  startIndex: number,
  endIndex: number
): TimelockBond[] {
  const account = parseAccountKey(xpub.trim())
  const bonds: TimelockBond[] = []
  for (let i = startIndex; i <= endIndex; i++) {
    const { year, month, ts, dateStr } = indexToTimelock(i)
    const child = account.derive(`m/2/${i}`)
    const pubkey = child.publicKey!
    const witnessScript = buildWitnessScript(pubkey, ts)
    bonds.push({
      index: i,
      year,
      month,
      timelockTs: ts,
      timelockDate: dateStr,
      pubkeyHex: bytesToHex(pubkey),
      address: witnessScriptToP2WSH(witnessScript),
      witnessScriptHex: bytesToHex(witnessScript),
    })
  }
  return bonds
}
