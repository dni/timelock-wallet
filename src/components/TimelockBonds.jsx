import { createSignal, createMemo, For, Show } from 'solid-js';
import { deriveBonds, deriveBondsFromXpub } from '../lib/timelock';
import CertificateGenerator from './CertificateGenerator';
const MIN_YEAR = 2020;
const MAX_YEAR = 2099;
export default function TimelockBonds(props) {
    const [filterYear, setFilterYear] = createSignal(new Date().getUTCFullYear());
    const [showScript, setShowScript] = createSignal(false);
    const [selectedBond, setSelectedBond] = createSignal(null);
    const year = () => Math.max(MIN_YEAR, Math.min(MAX_YEAR, filterYear()));
    const startIndex = () => (year() - MIN_YEAR) * 12;
    const endIndex = () => startIndex() + 11;
    const isXpub = () => props.keySource.type === 'xpub';
    const bonds = createMemo(() => {
        try {
            if (props.keySource.type === 'mnemonic') {
                return deriveBonds(props.keySource.mnemonic, props.keySource.passphrase, startIndex(), endIndex());
            }
            else {
                return deriveBondsFromXpub(props.keySource.xpub, startIndex(), endIndex());
            }
        }
        catch {
            return [];
        }
    });
    const mnemonicSource = () => props.keySource.type === 'mnemonic' ? props.keySource : null;
    function selectBond(bond) {
        if (isXpub())
            return;
        setSelectedBond(b => b?.index === bond.index ? null : bond);
    }
    return (<div class="timelock-bonds">
      <div class="section">
        <h2>BIP46 Fidelity Bond Addresses</h2>
        <div class="path-label">m/84'/0'/0'/2/index — P2WSH with OP_CHECKLOCKTIMEVERIFY</div>

        <Show when={isXpub()}>
          <div class="inline-warning" style={{ 'margin-bottom': '1rem' }}>
            Watch-only mode — certificate signing requires the full mnemonic
          </div>
        </Show>

        <div class="filter-row">
          <label class="year-label">
            Year
            <input type="number" min={MIN_YEAR} max={MAX_YEAR} value={year()} onInput={(e) => { setFilterYear(parseInt(e.currentTarget.value) || MIN_YEAR); setSelectedBond(null); }} class="year-input"/>
          </label>
          <div class="year-nav">
            <button class="btn-nav" onClick={() => { setFilterYear(year() - 1); setSelectedBond(null); }} disabled={year() <= MIN_YEAR}>← Prev</button>
            <button class="btn-nav" onClick={() => { setFilterYear(year() + 1); setSelectedBond(null); }} disabled={year() >= MAX_YEAR}>Next →</button>
          </div>
          <label class="toggle-label">
            <input type="checkbox" checked={showScript()} onChange={(e) => setShowScript(e.currentTarget.checked)}/>
            Show witness scripts
          </label>
        </div>

        <div class="index-range">
          Indices {startIndex()}–{endIndex()} · {year()}
        </div>
      </div>

      <Show when={bonds().length > 0} fallback={<div class="loading">Deriving keys…</div>}>
        <div class="table-wrap section" style={{ padding: 0 }}>
          <table class="bonds-table">
            <thead>
              <tr>
                <th>Index</th>
                <th>Lock Date</th>
                <th>Timelock (unix)</th>
                <th>P2WSH Address</th>
                <th>Public Key</th>
                <Show when={showScript()}>
                  <th>Witness Script</th>
                </Show>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <For each={bonds()}>
                {(bond) => (<tr class={selectedBond()?.index === bond.index ? 'row-selected' : ''}>
                    <td>{bond.index}</td>
                    <td>{bond.timelockDate}</td>
                    <td class="mono">{bond.timelockTs}</td>
                    <td class="mono addr-cell">{bond.address}</td>
                    <td class="mono key-cell">{bond.pubkeyHex}</td>
                    <Show when={showScript()}>
                      <td class="mono script-cell">{bond.witnessScriptHex}</td>
                    </Show>
                    <td>
                      <button class={selectedBond()?.index === bond.index ? 'btn-cert active' : 'btn-cert'} onClick={() => selectBond(bond)} disabled={isXpub()} title={isXpub() ? 'Load mnemonic to sign certificates' : 'Generate fidelity bond certificate'}>Cert</button>
                    </td>
                  </tr>)}
              </For>
            </tbody>
          </table>
        </div>

        <Show when={selectedBond() && mnemonicSource()}>
          <CertificateGenerator mnemonic={mnemonicSource().mnemonic} passphrase={mnemonicSource().passphrase} bond={selectedBond()} onClose={() => setSelectedBond(null)}/>
        </Show>
      </Show>
    </div>);
}
