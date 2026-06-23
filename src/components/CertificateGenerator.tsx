import { createSignal, createMemo, Show } from 'solid-js'
import {
  generateCertKeypair,
  signCertificate,
  currentBlockPeriod,
  periodToApproxDate,
} from '../lib/certificate'
import type { TimelockBond, Certificate } from '../types'

interface Props {
  mnemonic: string
  passphrase: string
  bond: TimelockBond
  onClose: () => void
}

function CopyRow(props: { label: string; value: string }) {
  const copy = () => navigator.clipboard.writeText(props.value).catch(() => {})
  return (
    <div class="copy-field">
      <div class="copy-field-label">{props.label}</div>
      <div class="copy-row">
        <span class="field-value mono">{props.value}</span>
        <button class="btn-copy" onClick={copy}>Copy</button>
      </div>
    </div>
  )
}

export default function CertificateGenerator(props: Props) {
  const defaultPeriod = currentBlockPeriod() + 52 // ~2 years
  const [certPubkeyHex, setCertPubkeyHex] = createSignal('')
  const [certPrivkeyHex, setCertPrivkeyHex] = createSignal('')
  const [certExpiry, setCertExpiry] = createSignal(defaultPeriod)
  const [cert, setCert] = createSignal<Certificate | null>(null)
  const [error, setError] = createSignal('')

  const expiryDate = createMemo(() => periodToApproxDate(certExpiry()))
  const expiryHeight = () => certExpiry() * 2016

  function handleGenerate() {
    const kp = generateCertKeypair()
    setCertPubkeyHex(kp.pubkeyHex)
    setCertPrivkeyHex(kp.privkeyHex)
    setCert(null)
    setError('')
  }

  function handleSign() {
    const pubkey = certPubkeyHex().trim()
    if (!pubkey || pubkey.length !== 66) {
      setError('Certificate public key must be a 33-byte compressed pubkey (66 hex chars).')
      return
    }
    if (certExpiry() <= 0) {
      setError('Certificate expiry must be a positive block period number.')
      return
    }
    try {
      const result = signCertificate(
        props.mnemonic,
        props.passphrase,
        props.bond.index,
        pubkey,
        certPrivkeyHex().trim(),
        certExpiry(),
      )
      setCert(result)
      setError('')
    } catch (e) {
      setError(`Signing failed: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return (
    <div class="cert-generator">
      <div class="cert-header">
        <div>
          <strong>Certificate for bond #{props.bond.index}</strong>
          <span class="cert-bond-info"> · {props.bond.timelockDate} · {props.bond.address}</span>
        </div>
        <button class="btn-close" onClick={props.onClose}>✕</button>
      </div>

      <div class="cert-body">
        <div class="cert-step">
          <div class="cert-step-title">1. Certificate keypair</div>
          <button class="btn-secondary" onClick={handleGenerate}>Generate new keypair</button>
          <Show when={certPrivkeyHex()}>
            <div class="inline-warning" style={{ 'margin-top': '0.75rem' }}>
              Save this private key — it cannot be recovered after leaving this page.
            </div>
            <CopyRow label="Certificate private key" value={certPrivkeyHex()} />
          </Show>
          <div class="copy-field" style={{ 'margin-top': '0.75rem' }}>
            <div class="copy-field-label">Certificate public key (hex)</div>
            <input
              class="hex-input mono"
              type="text"
              placeholder="033a…66 hex chars (compressed pubkey)"
              value={certPubkeyHex()}
              onInput={(e) => { setCertPubkeyHex(e.currentTarget.value); setCert(null) }}
            />
          </div>
        </div>

        <div class="cert-step">
          <div class="cert-step-title">2. Certificate expiry</div>
          <div class="expiry-row">
            <label class="year-label">
              Block period
              <input
                class="year-input"
                type="number"
                min={1}
                value={certExpiry()}
                onInput={(e) => { setCertExpiry(parseInt(e.currentTarget.value) || defaultPeriod); setCert(null) }}
              />
            </label>
            <span class="expiry-info">
              Block height {expiryHeight().toLocaleString()} · approx. {expiryDate()}
            </span>
          </div>
          <div class="expiry-hint">1 period = 2016 blocks ≈ 2 weeks</div>
        </div>

        <div class="cert-step">
          <div class="cert-step-title">3. Sign</div>
          <button class="btn-primary" onClick={handleSign} disabled={!certPubkeyHex()}>
            Sign Certificate
          </button>
          <Show when={error()}>
            <div class="error-msg" style={{ 'margin-top': '0.5rem' }}>{error()}</div>
          </Show>
        </div>

        <Show when={cert()}>
          {(c) => (
            <div class="cert-output">
              <div class="cert-step-title">Certificate output</div>
              <CopyRow label="Message" value={c().message} />
              <CopyRow label="Signature (base64)" value={c().signatureBase64} />
              <CopyRow label="Bond public key" value={c().bondPubkeyHex} />
              <CopyRow label="Certificate public key" value={c().certPubkeyHex} />
              <CopyRow label="Expiry period" value={String(c().certExpiry)} />
            </div>
          )}
        </Show>
      </div>
    </div>
  )
}
