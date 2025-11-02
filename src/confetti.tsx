import { type Component } from "solid-js"

let setCanvasReady: () => void

const canvasReady = new Promise<void>((resolve) => {
	setCanvasReady = resolve
})

let canvas!: HTMLCanvasElement

export const ConfettiCanvas: Component = () => (
	<canvas
		class=":uno: fixed inset-0 w-full h-full z-1 pointer-events-none"
		ref={(el) => {
			canvas = el
			setCanvasReady()
		}}
		aria-hidden="true"
	/>
)

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
	tick: 0
	decay: number
	wobbleX: number
	wobbleY: number
	scalar: number
}

interface Options extends Partial<Pick<Fetti, "decay" | "scalar">> {
	spread?: number
	startVelocity?: number
}

const COLORS = ["26ccff", "a25afd", "ff5e7e", "88ff5a", "fcff42", "ffa62d", "ff36ff"]
const TOTAL_TICKS = 200
const GRAVITY = 3
const OVAL_SCALAR = 0.6

const fettis = new Set<Fetti>()

function fire(particleCount: number, { spread = 45, startVelocity = 45, decay = 0.9, scalar = 1 }: Options) {
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

function resize() {
	const rect = canvas.getBoundingClientRect()
	canvas.width = rect.width
	canvas.height = rect.height
}

let frame: ReturnType<typeof requestAnimationFrame> | null = null

const MILLISECONDS_PER_FRAME = 1000 / 60
let lastFrameTime: DOMHighResTimeStamp

export async function confetti() {
	if (matchMedia("(prefers-reduced-motion)").matches) {
		return
	}

	await canvasReady

	resize()

	fire(200 * 0.25, {
		spread: 26,
		startVelocity: 55
	})
	fire(200 * 0.2, {
		spread: 60
	})
	fire(200 * 0.35, {
		spread: 100,
		decay: 0.91,
		scalar: 0.8
	})
	fire(200 * 0.1, {
		spread: 120,
		startVelocity: 25,
		decay: 0.92,
		scalar: 1.2
	})
	fire(200 * 0.1, {
		spread: 120,
		startVelocity: 45
	})

	const context = canvas.getContext("2d")!

	const callback: FrameRequestCallback = (time) => {
		resize()

		context.clearRect(0, 0, canvas.width, canvas.height)

		const deltaMs = time - (lastFrameTime ??= time)
		const progressFactor = deltaMs / MILLISECONDS_PER_FRAME
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

		if (fettis.size > 0) {
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
