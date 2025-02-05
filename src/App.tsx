import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import { updateScore } from './utils'

const HEIGHT = 70 // grid squares on height
const INTERVAL = 40 // ms, less is faster
const COLORS = ['#e5e7eb', '#ef4444', '#22c55e', '#0ea5e9']
const INITIAL_BODY_LENGHT = 4

type Direction = 'up' | 'down' | 'left' | 'right'

export default function App() {
  const [applePos, setApplePos] = useState({ x: 0, y: 0 })
  const [direction, setDirection] = useState<Direction>('down')
  const interval = useRef<ReturnType<typeof setInterval>>()
  const [showGame, setShowGame] = useState(true)
  const [grid, setGrid] = useState({ x: Math.floor((HEIGHT * 16) / 9), y: HEIGHT, pixel: 0 })
  const [body, setBody] = useState<{ x: number; y: number }[]>([])
  const colorIndex = useRef(0)
  const nextDirection = useRef<Direction>()
  const [showScore, setShowScore] = useState(false)
  const [showDonate, setShowDonate] = useState(false)

  function changeColor() {
    colorIndex.current = (colorIndex.current + 1) % COLORS.length

    document.documentElement.style.setProperty('--snake-color', COLORS[colorIndex.current])
  }

  const loadApple = useCallback(
    function (minLimit = 0, maxLimit = 1) {
      // head appear in a random position

      function randomWithBoundaries() {
        return Math.min(Math.max(minLimit, Math.random()), maxLimit)
      }

      const x = Math.floor(randomWithBoundaries() * grid.x)
      const y = Math.floor(randomWithBoundaries() * grid.y)

      setApplePos({ x, y })
    },
    [grid],
  )

  function moveSnake({ x = 0, y = 0 }) {
    setBody((prev) => {
      const newBody: { x: number; y: number }[] = []

      x += prev[0].x
      y += prev[0].y

      newBody.push({ x, y })
      for (let i = 1; i < prev.length; i++) {
        newBody.push(prev[i - 1])
      }
      return newBody
    })
  }

  function resetSnake() {
    if (body.length > 0) {
      updateScore(body.length - INITIAL_BODY_LENGHT, function ({ games }: { games: number }) {
        if ([50, 150, 300, 500, 1000].includes(games)) {
          setShowDonate(true)
        }
      })
    }

    loadApple()
    // snake stars from the middle

    let x = grid.x / 2
    let y = grid.y / 2

    const newBody = []
    for (let i = 0; i <= INITIAL_BODY_LENGHT; i++) {
      newBody.push({ x, y: y - i })
    }

    setBody(newBody)
  }

  useEffect(() => {
    function addListeners(e: KeyboardEvent) {
      // don't capture keys when writing in search bar
      if (e.target instanceof HTMLInputElement) return

      switch (e.key) {
        case 'a':
        case 'A':
          nextDirection.current = 'left'
          e.preventDefault()
          e.stopPropagation()
          break
        case 's':
        case 'S':
          nextDirection.current = 'down'
          setShowGame(true)
          e.preventDefault()
          e.stopPropagation()
          break
        case 'w':
        case 'W':
          nextDirection.current = 'up'
          e.preventDefault()
          e.stopPropagation()
          break
        case 'd':
        case 'D':
          nextDirection.current = 'right'
          e.preventDefault()
          e.stopPropagation()
          break
        case 'q':
        case 'Q':
          changeColor()
          e.preventDefault()
          e.stopPropagation()
          break
        case 'e':
        case 'E':
          setShowScore((prev) => !prev)
      }
    }

    document.addEventListener('keydown', addListeners, { capture: true })
    resetSnake()
  }, [])

  useEffect(() => {
    if (interval.current) {
      clearInterval(interval.current)
    }

    interval.current = setInterval(() => {
      if (nextDirection.current) {
        setDirection((prev) => {
          switch (nextDirection.current) {
            case 'up':
              if (prev != 'down') return 'up'
              break
            case 'down':
              if (prev != 'up') return 'down'
              break
            case 'left':
              if (prev != 'right') return 'left'
              break
            case 'right':
              if (prev != 'left') return 'right'
          }

          return prev
        })

        nextDirection.current = undefined
      }

      // move to the correct direction
      switch (direction) {
        case 'down':
          moveSnake({ y: 1 })
          break
        case 'up':
          moveSnake({ y: -1 })
          break
        case 'right':
          moveSnake({ x: 1 })
          break
        case 'left':
          moveSnake({ x: -1 })
      }
    }, INTERVAL)
  }, [direction])

  useEffect(() => {
    if (!body.length || !showGame) return

    const x = body[0].x
    const y = body[0].y

    // check video limits
    if (x < 0 || x >= grid.x || y < 0 || y >= grid.y) {
      resetSnake()
      setShowGame(false)
      return
    }

    // check if the snake has eaten the apple
    if (x === applePos.x && y === applePos.y) {
      setBody((prev) => [...prev, { x: body[body.length - 1].x, y: body[body.length - 1].y }])
      loadApple()
      return
    }

    // check if the snake has eaten itself
    if (body.length > 4) {
      for (let i = 4; i < body.length; i++) {
        if (x === body[i].x && y === body[i].y) {
          resetSnake()
          setShowGame(false)
          return
        }
      }
    }
  }, [body, grid])

  if (showDonate) {
    return (
      <div className="pointer-events-none absolute z-20 flex h-full w-full items-center justify-center">
        <div className="pointer-events-auto flex flex-col items-center gap-1 rounded-md !bg-zinc-50 !p-6 text-zinc-900">
          <div className="flex w-full justify-end">
            <span className="cursor-pointer text-2xl hover:scale-110" onClick={() => setShowDonate(false)}>
              ❌
            </span>
          </div>
          <span className="line-clamp-2 text-center text-3xl">
            😀If you like this game, please
            <br />
            consider support the developer
          </span>
          <a href="https://www.buymeacoffee.com/n0vella" data-goatcounter-click="donate/buymeacofee" target="_blank">
            <img
              src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
              alt="Buy Me A Coffee"
              class="!mt-3 h-16 rounded-xl shadow shadow-zinc-300 transition-transform hover:!scale-110"
            />
          </a>
        </div>
      </div>
    )
  }

  if (!showGame) return <></>

  return (
    <div className="pointer-events-none absolute z-20 flex h-full w-full">
      <div
        ref={(gameRef) => {
          if (!gameRef) return

          const newGrid = {
            y: HEIGHT,
            pixel: gameRef.clientHeight / HEIGHT,
            x: Math.floor((gameRef.clientWidth / gameRef.clientHeight) * HEIGHT),
          }

          if (newGrid.x != grid.x || newGrid.pixel != grid.pixel) {
            setGrid(newGrid)
          }
        }}
        className="flex h-full w-full items-center justify-center"
      >
        {showScore && (
          <div className="absolute top-2 flex w-full justify-start px-4 text-2xl">
            <span className="score">{body.length - INITIAL_BODY_LENGHT}</span>
          </div>
        )}

        <div id="snake-grid" className="relative" style={{ width: grid.x * grid.pixel, height: grid.y * grid.pixel }}>
          {body.map(({ x, y }, i) => {
            const brightness = Math.max(50, 100 - i * 5)

            return (
              <div
                key={i}
                id={'snake-body-' + i}
                className="ball"
                style={{
                  left: x * grid.pixel,
                  top: y * grid.pixel,
                  width: grid.pixel,
                  height: grid.pixel,
                  filter: `brightness(${brightness}%)`,
                }}
              />
            )
          })}

          <div
            id="apple"
            className="ball apple"
            style={{
              left: applePos.x * grid.pixel,
              top: applePos.y * grid.pixel,
              width: grid.pixel,
              height: grid.pixel,
            }}
          />
        </div>
      </div>
    </div>
  )
}
