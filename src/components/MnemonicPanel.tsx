import { createSignal, createMemo, Show } from 'solid-js'
import { generateMnemonic, validateMnemonic, deriveWallet, deriveStandardAddresses } from '../lib/wallet'
import WordGrid from './WordGrid'
import SeedInfo from './SeedInfo'
import StandardAddresses from './StandardAddresses'

interface Props {
  mnemonic: string
  passphrase: string
  onMnemonicChange: (m: string) => void
  onPassphraseChange: (p: string) => void
}

export default function MnemonicPanel(props: Props) {
  const [wordCount, setWordCount] = createSignal<12 | 24>(12)
  const [showManual, setShowManual] = createSignal(false)
  const [manualInput, setManualInput] = createSignal('')
  const [error, setError] = createSignal('')

  function handleGenerate() {
    const m = generateMnemonic(wordCount())
    props.onMnemonicChange(m)
    setShowManual(false)
    setError('')
  }

  function handleImport() {
    const m = manualInput().trim().toLowerCase().replace(/\s+/g, ' ')
    if (!validateMnemonic(m)) {
      setError('Invalid mnemonic — check spelling and word count (12 or 24 words required).')
      return
    }
    setError('')
    props.onMnemonicChange(m)
    setShowManual(false)
  }

  const wallet = createMemo(() => {
    if (!props.mnemonic) return null
    try { return deriveWallet(props.mnemonic, props.passphrase) } catch { return null }
  })

  const addresses = createMemo(() => {
    if (!props.mnemonic) return []
    try { return deriveStandardAddresses(props.mnemonic, props.passphrase, 10) } catch { return [] }
  })

  return (
    <div class="mnemonic-panel">
      <div class="section controls-section">
        <div class="control-row">
          <div class="word-count-toggle">
            <button
              class={wordCount() === 12 ? 'toggle-btn active' : 'toggle-btn'}
              onClick={() => setWordCount(12)}
            >12 words</button>
            <button
              class={wordCount() === 24 ? 'toggle-btn active' : 'toggle-btn'}
              onClick={() => setWordCount(24)}
            >24 words</button>
          </div>
          <button class="btn-primary" onClick={handleGenerate}>Generate New Mnemonic</button>
          <button class="btn-secondary" onClick={() => { setShowManual(!showManual()); setError('') }}>
            {showManual() ? 'Cancel' : 'Import Existing'}
          </button>
        </div>

        <Show when={showManual()}>
          <div class="manual-input">
            <textarea
              placeholder="Enter your 12 or 24 word mnemonic, space-separated…"
              value={manualInput()}
              onInput={(e) => setManualInput(e.currentTarget.value)}
              rows={4}
            />
            <button class="btn-primary" onClick={handleImport}>Import Mnemonic</button>
            <Show when={error()}>
              <div class="error-msg">{error()}</div>
            </Show>
          </div>
        </Show>
      </div>

      <Show when={props.mnemonic}>
        <div class="section passphrase-section">
          <label class="passphrase-label">
            <span>Optional BIP39 passphrase</span>
            <input
              type="password"
              value={props.passphrase}
              onInput={(e) => props.onPassphraseChange(e.currentTarget.value)}
              placeholder="(empty = no passphrase)"
              class="passphrase-input"
            />
          </label>
        </div>

        <WordGrid mnemonic={props.mnemonic} />
        <SeedInfo wallet={wallet()} />
        <StandardAddresses addresses={addresses()} />
      </Show>
    </div>
  )
}
