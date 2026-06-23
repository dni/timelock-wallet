import { createSignal, Show } from 'solid-js'
import type { Tab, KeySource } from './types'
import MnemonicPanel from './components/MnemonicPanel'
import TimelockBonds from './components/TimelockBonds'

export default function App() {
  const [tab, setTab] = createSignal<Tab>('wallet')
  const [keySource, setKeySource] = createSignal<KeySource | null>(null)

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
            >Wallet</button>
            <button
              class={tab() === 'bonds' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setTab('bonds')}
              disabled={!keySource()}
              title={!keySource() ? 'Load a mnemonic or xpub first' : ''}
            >Timelock Bonds / BIP46</button>
          </nav>
        </div>
      </header>

      <main class="app-main">
        <Show when={tab() === 'wallet'}>
          <MnemonicPanel
            keySource={keySource()}
            onKeySourceChange={setKeySource}
          />
        </Show>

        <Show when={tab() === 'bonds' && !!keySource()}>
          <TimelockBonds keySource={keySource()!} />
        </Show>
      </main>

      <footer class="app-footer">
        <p>
          Offline tool · BIP39 / BIP84 / BIP46 · Private keys never leave this browser
          {' · '}
          <a href="https://bip46.dev" target="_blank" rel="noopener noreferrer">bip46.dev</a>
          {' · '}
          <a href="https://github.com/dni/timelock-wallet" target="_blank" rel="noopener noreferrer">GitHub</a>
        </p>
      </footer>
    </div>
  )
}
