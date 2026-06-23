import { createSignal, Show } from 'solid-js'

const STORAGE_KEY = 'security-warning-dismissed'

export default function SecurityWarning() {
  const [dismissed, setDismissed] = createSignal(
    localStorage.getItem(STORAGE_KEY) === '1'
  )

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setDismissed(true)
  }

  return (
    <Show when={!dismissed()}>
      <div class="security-warning">
        <div class="warning-content">
          <strong>Security Notice</strong>
          <ul>
            <li>This tool generates and displays Bitcoin private keys. Use it only on a trusted, air-gapped device.</li>
            <li>Verify you are <em>not connected to the internet</em> before entering or generating a mnemonic.</li>
            <li>Never share your mnemonic, seed hex, or xprv with anyone.</li>
            <li>Clear this browser tab and history after use.</li>
          </ul>
          <button class="btn-dismiss" onClick={dismiss}>
            I understand, continue
          </button>
        </div>
      </div>
    </Show>
  )
}
