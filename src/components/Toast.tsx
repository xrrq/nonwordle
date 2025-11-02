import { type Component, createSignal } from "solid-js"
import { cx } from "classix"

const [isToastShown, settoastShown] = createSignal<boolean>(false)
const [getToastMessage, setToastMessage] = createSignal<string | null>(null)

let timeout1: number, timeout2: number

export function toast(message: string, timeout = 1000): void {
	settoastShown(true)
	setToastMessage(message)
	clearTimeout(timeout1)
	clearTimeout(timeout2)

	if (Number.isFinite(timeout)) {
		timeout1 = setTimeout(() => {
			settoastShown(false)
		}, timeout)
		timeout2 = setTimeout(() => {
			setToastMessage(null)
		}, timeout + 100)
	}
}

export const Toast: Component = () => {
	return (
		<div
			class={cx(
				isToastShown()
					? ":uno: absolute top-11 [translate:calc(50vw_-_50%_-_1rem)] p-4 m-inline-4 font-bold text-neutral-50/100 bg-neutral-900/100 dark:(text-neutral-900/100 bg-neutral-200/100) rounded pointer-events-none z-2"
					: ":uno: hidden"
			)}
			aria-live="polite"
		>
			{getToastMessage()}
		</div>
	)
}
