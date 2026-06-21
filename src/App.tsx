import { createSignal, Show } from 'solid-js'
import type { Tab } from './types'
import SecurityWarning from './components/SecurityWarning'
import MnemonicPanel from './components/MnemonicPanel'
import TimelockBonds from './components/TimelockBonds'

export default function App() {
  const [tab, setTab] = createSignal<Tab>('wallet')
  const [mnemonic, setMnemonic] = createSignal('')
  const [passphrase, setPassphrase] = createSignal('')

  return (
    <div class="app">
      <header class="app-header">
        <div class="header-inner">
          <div class="header-title">
            <span class="header-icon">₿</span>
            <h1>Timelock Wallet</h1>
          </div>
          <nav class="tab-nav">
            <button
              class={tab() === 'wallet' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setTab('wallet')}
            >Wallet / BIP39</button>
            <button
              class={tab() === 'bonds' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setTab('bonds')}
              disabled={!mnemonic()}
              title={!mnemonic() ? 'Generate or import a mnemonic first' : ''}
            >Timelock Bonds / BIP46</button>
          </nav>
        </div>
      </header>

      <main class="app-main">
        <SecurityWarning />

        <Show when={tab() === 'wallet'}>
          <MnemonicPanel
            mnemonic={mnemonic()}
            passphrase={passphrase()}
            onMnemonicChange={setMnemonic}
            onPassphraseChange={setPassphrase}
          />
        </Show>

        <Show when={tab() === 'bonds' && !!mnemonic()}>
          <TimelockBonds mnemonic={mnemonic()} passphrase={passphrase()} />
        </Show>
      </main>

      <footer class="app-footer">
        <p>Offline tool · BIP39 / BIP84 / BIP46 · Private keys never leave this browser</p>
      </footer>
    </div>
  )
}
