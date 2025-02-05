import { CSS_Selector } from '..'
import pkg from '../package.json'

const myConsole = console // save original console, just in case site overwrites handy methods such as log
const storage = chrome.storage ? chrome.storage : browser.storage

export function log(message: any, ...optionalParams: any[]) {
  myConsole.log(`%c${pkg.name}:`, 'color: orange; font-weight: bold', message, ...optionalParams)
}

export async function awaitElement(selector: CSS_Selector): Promise<Element> {
  /* https://stackoverflow.com/a/61511955 */

  return await new Promise((resolve) => {
    const elm = document.querySelector(selector)
    if (elm != null) {
      return resolve(elm)
    }
    const observer = new MutationObserver(() => {
      const elm = document.querySelector(selector)
      if (elm !== null) {
        observer.disconnect()
        return resolve(elm)
      }
    })

    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(document, {
      childList: true,
      subtree: true,
    })
  })
}

export function updateScore(
  score: number,
  callback?: ({ max, total, games }: { max: number; total: number; games: number }) => void,
) {
  storage.local.get(['max', 'total', 'games'], function ({ max = 0, total = 0, games = 0 }) {
    max = Math.max(score, max)
    total = total + score
    games = games + 1

    log(`Score: ${score}. Max score: ${max}. Total games: ${games}`)

    storage.local.set({
      max,
      total,
      games,
    })

    if (callback) {
      callback({ max, total, games })
    }
  })
}
