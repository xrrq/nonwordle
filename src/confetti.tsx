import { type Component } from "solid-js"

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
	const radAngle = 90 * (Math.PI / 180)
	const radSpread = spread * (Math.PI / 180)

	startVelocity *= 1.75

	for (let i = 0; i < particleCount; ++i) {
		fettis.add({
			x,
			y,
			wobble: Math.random() * 10,
			wobbleSpeed: Math.min(0.11, Math.random() * 0.1 + 0.05),
			velocity: (startVelocity * 0.5) + (Math.random() * startVelocity),
			angle2D: -radAngle + ((0.5 * radSpread) - (Math.random() * radSpread)),
			tiltAngle: (Math.random() * (0.75 - 0.25) + 0.25) * Math.PI,
			color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
			shape: Math.floor(Math.random() * 2),
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

/**
 * Trigger confetti animation
 */
export async function confetti(): Promise<void> {
	// respect prefers-reduced-motion setting
	if (matchMedia("(prefers-reduced-motion)").matches) {
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
		const pf = Math.min(progressFactor, 4)

		for (const fetti of fettis) {
			fetti.x += Math.cos(fetti.angle2D) * fetti.velocity * pf
			fetti.y += (Math.sin(fetti.angle2D) * fetti.velocity + GRAVITY) * pf
			fetti.velocity *= fetti.decay ** pf

			fetti.wobble += fetti.wobbleSpeed * pf
			fetti.wobbleX = fetti.x + ((10 * fetti.scalar) * Math.cos(fetti.wobble))
			fetti.wobbleY = fetti.y + ((10 * fetti.scalar) * Math.sin(fetti.wobble))

			fetti.tiltAngle += 0.1 * pf
			const tiltSin = Math.sin(fetti.tiltAngle)
			const tiltCos = Math.cos(fetti.tiltAngle)
			const random = Math.random() + 2

			const progress = (fetti.tick += pf) / TOTAL_TICKS

			const x1 = fetti.x + (random * tiltCos)
			const y1 = fetti.y + (random * tiltSin)
			const x2 = fetti.wobbleX + (random * tiltCos)
			const y2 = fetti.wobbleY + (random * tiltSin)

			context.fillStyle = `rgb(from #${fetti.color} r g b/${1 - progress})`

			context.beginPath()

			if (fetti.shape) {
				// circle
				context.ellipse(
					fetti.x,
					fetti.y,
					Math.abs(x2 - x1) * OVAL_SCALAR,
					Math.abs(y2 - y1) * OVAL_SCALAR,
					Math.PI / 10 * fetti.wobble,
					0,
					2 * Math.PI
				)
			} else {
				// square
				context.moveTo(Math.floor(fetti.x), Math.floor(fetti.y))
				context.lineTo(Math.floor(fetti.wobbleX), Math.floor(y1))
				context.lineTo(Math.floor(x2), Math.floor(y2))
				context.lineTo(Math.floor(x1), Math.floor(fetti.wobbleY))
			}

			context.closePath()
			context.fill()

			if (fetti.tick >= TOTAL_TICKS) {
				fettis.delete(fetti)
			}
		}

		if (fettis.size) {
			lastFrameTime = time
			frame = requestAnimationFrame(callback)
		} else {
			frame = null
		}
	}

	if (frame == null) {
		frame = requestAnimationFrame(callback)
	}
}
