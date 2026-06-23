import { createSignal, createMemo, Show } from 'solid-js';
import { generateMnemonic, validateMnemonic, deriveWallet, deriveStandardAddresses, validateXpub, deriveStandardAddressesFromXpub, } from '../lib/wallet';
import WordGrid from './WordGrid';
import SeedInfo from './SeedInfo';
import StandardAddresses from './StandardAddresses';
import SecurityWarning from './SecurityWarning';
export default function MnemonicPanel(props) {
    const [inputMode, setInputMode] = createSignal('mnemonic');
    // mnemonic state
    const [wordCount, setWordCount] = createSignal(12);
    const [showManual, setShowManual] = createSignal(false);
    const [manualInput, setManualInput] = createSignal('');
    const [mnemonic, setMnemonic] = createSignal('');
    const [passphrase, setPassphrase] = createSignal('');
    const [mnemonicError, setMnemonicError] = createSignal('');
    // xpub state
    const [xpubInput, setXpubInput] = createSignal('');
    const [activeXpub, setActiveXpub] = createSignal('');
    const [xpubError, setXpubError] = createSignal('');
    function switchMode(mode) {
        setInputMode(mode);
        setMnemonicError('');
        setXpubError('');
        if (mode === 'mnemonic' && mnemonic()) {
            props.onKeySourceChange({ type: 'mnemonic', mnemonic: mnemonic(), passphrase: passphrase() });
        }
        else if (mode === 'xpub' && activeXpub()) {
            props.onKeySourceChange({ type: 'xpub', xpub: activeXpub() });
        }
        else {
            props.onKeySourceChange(null);
        }
    }
    function handleGenerate() {
        const m = generateMnemonic(wordCount());
        setMnemonic(m);
        setShowManual(false);
        setMnemonicError('');
        props.onKeySourceChange({ type: 'mnemonic', mnemonic: m, passphrase: passphrase() });
    }
    function handleImport() {
        const m = manualInput().trim().toLowerCase().replace(/\s+/g, ' ');
        if (!validateMnemonic(m)) {
            setMnemonicError('Invalid mnemonic — check spelling and word count (12 or 24 words required).');
            return;
        }
        setMnemonicError('');
        setMnemonic(m);
        setShowManual(false);
        props.onKeySourceChange({ type: 'mnemonic', mnemonic: m, passphrase: passphrase() });
    }
    function handlePassphraseChange(p) {
        setPassphrase(p);
        if (mnemonic()) {
            props.onKeySourceChange({ type: 'mnemonic', mnemonic: mnemonic(), passphrase: p });
        }
    }
    function handleXpubImport() {
        const xpub = xpubInput().trim();
        const err = validateXpub(xpub);
        if (err) {
            setXpubError(err);
            return;
        }
        setXpubError('');
        setActiveXpub(xpub);
        props.onKeySourceChange({ type: 'xpub', xpub });
    }
    const wallet = createMemo(() => {
        if (!mnemonic() || inputMode() !== 'mnemonic')
            return null;
        try {
            return deriveWallet(mnemonic(), passphrase());
        }
        catch {
            return null;
        }
    });
    const addresses = createMemo(() => {
        if (inputMode() === 'mnemonic') {
            if (!mnemonic())
                return [];
            try {
                return deriveStandardAddresses(mnemonic(), passphrase(), 10);
            }
            catch {
                return [];
            }
        }
        else {
            if (!activeXpub())
                return [];
            try {
                return deriveStandardAddressesFromXpub(activeXpub(), 10);
            }
            catch {
                return [];
            }
        }
    });
    const copyXpub = () => navigator.clipboard.writeText(activeXpub()).catch(() => { });
    return (<div class="mnemonic-panel">
      <Show when={inputMode() === 'mnemonic'}>
        <SecurityWarning />
      </Show>

      <div class="section controls-section">
        <div class="word-count-toggle" style={{ 'margin-bottom': '1rem' }}>
          <button class={inputMode() === 'mnemonic' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => switchMode('mnemonic')}>BIP39 Mnemonic</button>
          <button class={inputMode() === 'xpub' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => switchMode('xpub')}>Account xpub</button>
        </div>

        <Show when={inputMode() === 'mnemonic'}>
          <div class="control-row">
            <div class="word-count-toggle">
              <button class={wordCount() === 12 ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setWordCount(12)}>12 words</button>
              <button class={wordCount() === 24 ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setWordCount(24)}>24 words</button>
            </div>
            <button class="btn-primary" onClick={handleGenerate}>Generate New Mnemonic</button>
            <button class="btn-secondary" onClick={() => { setShowManual(!showManual()); setMnemonicError(''); }}>
              {showManual() ? 'Cancel' : 'Import Existing'}
            </button>
          </div>

          <Show when={showManual()}>
            <div class="manual-input">
              <textarea placeholder="Enter your 12 or 24 word mnemonic, space-separated…" value={manualInput()} onInput={(e) => setManualInput(e.currentTarget.value)} rows={4}/>
              <button class="btn-primary" onClick={handleImport}>Import Mnemonic</button>
              <Show when={mnemonicError()}>
                <div class="error-msg">{mnemonicError()}</div>
              </Show>
            </div>
          </Show>
        </Show>

        <Show when={inputMode() === 'xpub'}>
          <div class="xpub-hint">
            <p>Export your account public key at path <code>m/84'/0'/0'</code> (BIP84, native segwit) from your wallet and paste it below.</p>
            <ul>
              <li><strong>Hardware wallets</strong> (Ledger, Trezor, Coldcard): export as <code>zpub</code> — the <code>zpub</code> prefix confirms the BIP84 path.</li>
              <li><strong>Sparrow / Electrum</strong>: Wallet → Information → Master Public Key, make sure the script type is set to <em>native segwit</em>.</li>
            </ul>
            <p>Watch-only mode — no private keys are loaded, certificate signing is unavailable.</p>
          </div>
          <div class="manual-input" style={{ 'margin-top': '0.75rem' }}>
            <textarea class="mono" placeholder="xpub6… or zpub5…" value={xpubInput()} onInput={(e) => { setXpubInput(e.currentTarget.value); setXpubError(''); }} rows={3}/>
            <button class="btn-primary" onClick={handleXpubImport}>Load xpub</button>
            <Show when={xpubError()}>
              <div class="error-msg">{xpubError()}</div>
            </Show>
          </div>
        </Show>
      </div>

      <Show when={inputMode() === 'mnemonic' && mnemonic()}>
        <div class="section passphrase-section">
          <label class="passphrase-label">
            <span>Optional BIP39 passphrase</span>
            <input type="password" value={passphrase()} onInput={(e) => handlePassphraseChange(e.currentTarget.value)} placeholder="(empty = no passphrase)" class="passphrase-input"/>
          </label>
        </div>
        <WordGrid mnemonic={mnemonic()}/>
        <SeedInfo wallet={wallet()}/>
      </Show>

      <Show when={inputMode() === 'xpub' && activeXpub()}>
        <div class="section">
          <div class="copy-field">
            <div class="copy-field-label">Loaded account xpub (m/84'/0'/0')</div>
            <div class="copy-row">
              <span class="field-value mono">{activeXpub()}</span>
              <button class="btn-copy" onClick={copyXpub}>Copy</button>
            </div>
          </div>
          <div class="inline-warning" style={{ 'margin-top': '0.75rem', 'margin-bottom': 0 }}>
            Watch-only mode · No private keys · Certificate signing unavailable
          </div>
        </div>
      </Show>

      <Show when={addresses().length > 0}>
        <StandardAddresses addresses={addresses()}/>
      </Show>
    </div>);
}
