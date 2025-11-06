import { type Component } from "solid-js"
import { abs, cos, floor, media, min, PI, random, sin } from "./utils.ts"

/**
 * Function to resolve when the canvas is ready
 */
let setCanvasReady: () => void

/**
 * Promise that resolves when the canvas is ready
 */
const canvasReady = new Promise<void>((resolve) => {
	setCanvasReady = resolve
})

let canvas!: HTMLCanvasElement

export const ConfettiCanvas: Component = () => (
	<canvas
		class=":uno: fixed inset-0 w-full h-full z-1 pointer-events-none"
		ref={(canvasElement) => {
			canvas = canvasElement
			setCanvasReady()
		}}
		aria-hidden="true"
	/>
)

// confetti implementation adapted from https://github.com/catdad/canvas-confetti/blob/51e7932/src/confetti.js

/**
 * Fetti particle interface
 */
interface Fetti {
	x: number
	y: number
	wobble: number
	wobbleSpeed: number
	velocity: number
	angle2D: number
	tiltAngle: number
	color: string
	shape: number
	tick: number
	decay: number
	wobbleX: number
	wobbleY: number
	scalar: number
}

const COLORS = ["26ccff", "a25afd", "ff5e7e", "88ff5a", "fcff42", "ffa62d", "ff36ff"]

const GRAVITY = 3
const TOTAL_TICKS = 300
const OVAL_SCALAR = 0.6

const fettis = new Set<Fetti>()

/**
 * Fire confetti
 *
 * @param particleCount number of particles
 * @param options confetti options
 */
function fire(particleCount: number, spread = 45, startVelocity = 45, decay = 0.9, scalar = 1): void {
	const x = canvas.width * 0.5
	const y = canvas.height * 0.9
	const radAngle = 90 * (PI / 180)
	const radSpread = spread * (PI / 180)

	startVelocity *= 1.75

	for (let i = 0; i < particleCount; ++i) {
		fettis.add({
			x,
			y,
			wobble: random() * 10,
			wobbleSpeed: min(0.11, random() * 0.1 + 0.05),
			velocity: (startVelocity * 0.5) + (random() * startVelocity),
			angle2D: -radAngle + ((0.5 * radSpread) - (random() * radSpread)),
			tiltAngle: (random() * (0.75 - 0.25) + 0.25) * PI,
			color: COLORS[floor(random() * COLORS.length)]!,
			shape: floor(random() * 2),
			tick: 0,
			decay,
			wobbleX: 0,
			wobbleY: 0,
			scalar
		})
	}
}

/**
 * Resize canvas to fit the screen
 */
function resize(): void {
	const rect = canvas.getBoundingClientRect()
	canvas.width = rect.width
	canvas.height = rect.height
}

let frame: ReturnType<typeof requestAnimationFrame> | null = null

const MILLISECONDS_PER_FRAME = 1000 / 60 // 60 fps
let lastFrameTime: DOMHighResTimeStamp

const raf = requestAnimationFrame

/**
 * Trigger confetti animation
 */
export async function confetti(): Promise<void> {
	// respect prefers-reduced-motion setting
	if (media("(prefers-reduced-motion)")) {
		return
	}

	// wait for canvas to be ready
	await canvasReady

	resize()

	fire(200 * 0.25, 26, 55)
	fire(200 * 0.2, 60)
	fire(200 * 0.35, 100, 45, 0.91, 0.8)
	fire(200 * 0.1, 120, 25, 0.92, 1.2)
	fire(200 * 0.1, 120, 45)

	const context = canvas.getContext("2d")!

	// animation loop
	const callback: FrameRequestCallback = (time) => {
		resize()

		context.clearRect(0, 0, canvas.width, canvas.height)

		const Δt = time - (lastFrameTime ??= time)
		const progressFactor = Δt / MILLISECONDS_PER_FRAME
		const pf = min(progressFactor, 4)

		for (const fetti of fettis) {
			const velocity = fetti.velocity
			const x = (fetti.x += cos(fetti.angle2D) * velocity * pf)
			const y = (fetti.y += (sin(fetti.angle2D) * velocity + GRAVITY) * pf)
			fetti.velocity *= fetti.decay ** pf

			const wobble = (fetti.wobble += fetti.wobbleSpeed * pf)
			const wobbleX = (fetti.wobbleX = x + ((10 * fetti.scalar) * cos(wobble)))
			const wobbleY = (fetti.wobbleY = y + ((10 * fetti.scalar) * sin(wobble)))

			const tiltAngle = (fetti.tiltAngle += 0.1 * pf)
			const tiltSin = sin(tiltAngle)
			const tiltCos = cos(tiltAngle)
			const fettiRandom = random() + 2

			const x1 = x + (fettiRandom * tiltCos)
			const y1 = y + (fettiRandom * tiltSin)
			const x2 = wobbleX + (fettiRandom * tiltCos)
			const y2 = wobbleY + (fettiRandom * tiltSin)

			const progress = (fetti.tick += pf) / TOTAL_TICKS

			context.fillStyle = `rgb(from #${fetti.color} r g b/${1 - progress})`

			context.beginPath()

			if (fetti.shape) {
				// circle
				context.ellipse(
					fetti.x,
					fetti.y,
					abs(x2 - x1) * OVAL_SCALAR,
					abs(y2 - y1) * OVAL_SCALAR,
					PI / 10 * fetti.wobble,
					0,
					2 * PI
				)
			} else {
				// square
				context.moveTo(floor(fetti.x), floor(fetti.y))
				context.lineTo(floor(fetti.wobbleX), floor(y1))
				context.lineTo(floor(x2), floor(y2))
				context.lineTo(floor(x1), floor(fetti.wobbleY))
			}

			context.closePath()
			context.fill()

			if (fetti.tick >= TOTAL_TICKS) {
				fettis.delete(fetti)
			}
		}

		if (fettis.size) {
			lastFrameTime = time
			frame = raf(callback)
		} else {
			frame = null
		}
	}

	if (frame == null) {
		frame = raf(callback)
	}
}
