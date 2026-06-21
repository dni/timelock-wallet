import { createSignal, Show } from 'solid-js';
export default function SecurityWarning() {
    const [dismissed, setDismissed] = createSignal(false);
    return (<Show when={!dismissed()}>
      <div class="security-warning">
        <div class="warning-content">
          <strong>Security Notice</strong>
          <ul>
            <li>This tool generates and displays Bitcoin private keys. Use it only on a trusted, air-gapped device.</li>
            <li>Verify you are <em>not connected to the internet</em> before entering or generating a mnemonic.</li>
            <li>Never share your mnemonic, seed hex, or xprv with anyone.</li>
            <li>Clear this browser tab and history after use.</li>
          </ul>
          <button class="btn-dismiss" onClick={() => setDismissed(true)}>
            I understand, continue
          </button>
        </div>
      </div>
    </Show>);
}
