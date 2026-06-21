import { For } from 'solid-js'

interface Props {
  mnemonic: string
}

export default function WordGrid(props: Props) {
  const words = () => props.mnemonic.split(' ')
  const cols = () => words().length === 24 ? 6 : 4

  return (
    <div class="section">
      <h2>Mnemonic Phrase</h2>
      <div class="word-grid" style={{ 'grid-template-columns': `repeat(${cols()}, 1fr)` }}>
        <For each={words()}>
          {(word, i) => (
            <div class="word-cell">
              <span class="word-index">{i() + 1}</span>
              <span class="word-text">{word}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
