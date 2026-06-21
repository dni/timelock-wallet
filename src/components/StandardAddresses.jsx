import { For, Show } from 'solid-js';
export default function StandardAddresses(props) {
    return (<Show when={props.addresses.length > 0}>
      <div class="section">
        <h2>BIP84 Receiving Addresses</h2>
        <div class="path-label">m/84'/0'/0'/0/n — P2WPKH (native segwit)</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Address</th>
                <th>Public Key</th>
              </tr>
            </thead>
            <tbody>
              <For each={props.addresses}>
                {(addr) => (<tr>
                    <td>{addr.index}</td>
                    <td class="mono addr-cell">{addr.address}</td>
                    <td class="mono key-cell">{addr.pubkeyHex}</td>
                  </tr>)}
              </For>
            </tbody>
          </table>
        </div>
      </div>
    </Show>);
}
