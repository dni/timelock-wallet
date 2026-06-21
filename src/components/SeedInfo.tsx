import { Show } from 'solid-js'
import type { DerivedWallet } from '../types'

interface CopyFieldProps {
  label: string
  value: string
}

function CopyField(props: CopyFieldProps) {
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

interface Props {
  wallet: DerivedWallet | null
}

export default function SeedInfo(props: Props) {
  return (
    <Show when={props.wallet}>
      {(w) => (
        <div class="section">
          <h2>Derived Keys</h2>
          <div class="inline-warning">
            Keep these private. Anyone with these values can spend your funds.
          </div>
          <CopyField label="Seed (hex)" value={w().seedHex} />
          <CopyField label="Master xprv" value={w().masterXprv} />
          <CopyField label="Master xpub" value={w().masterXpub} />
          <CopyField label={`Account xprv (m/84'/0'/0')`} value={w().accountXprv} />
          <CopyField label={`Account xpub (m/84'/0'/0')`} value={w().accountXpub} />
        </div>
      )}
    </Show>
  )
}
