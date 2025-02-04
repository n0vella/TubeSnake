import App from './App'
import { awaitElement } from './utils'
import { render } from 'preact'
import './index.css'
import { KeyboardService } from '@violentmonkey/shortcut'

const service = new KeyboardService()
service.enable()

service.register('s', main)

async function main() {
  service.disable()

  const parent = (await awaitElement('#movie_player')) as HTMLDivElement
  const container = document.createElement('div')
  parent.appendChild(container)

  parent.classList.add('relative', 'z-10')

  insertElement(App, container)
}

async function loadCSS() {
  const style = GM_getResourceText('css')
  GM_addStyle(style)
}

async function insertElement(Element: preact.ComponentType, container: HTMLElement) {
  render(<Element />, container)
}

document.addEventListener('DOMContentLoaded', () => {
  // main();
  loadCSS()
})
