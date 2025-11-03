import { type Component } from "solid-js"
import { cx } from "classix"

import { addCharacterToBoard, backspace, enter, getKeyboardColors, hasGameEnded } from "../game.ts"
import { TileStyle } from "./GameBoard.tsx"
import { Icon } from "./Icon.tsx"

// QWERTY keyboard layout with Enter and Backspace represented as + and - so that it would be smaller when minified
const QWERTY = "QWERTYUIOPASDFGHJKL+ZXCVBNM-"

const keyStyle = ":uno: rounded-1"
const keyStyleInner =
	":uno: h-full grid place-content-center font-bold rounded-1 active:bg-neutral-950/25 transition-background-color"
const keyDefaultStyle = ":uno: text-neutral-950/100 bg-neutral-300/100 dark:(text-white/100 bg-neutral-500/100)"

const InputKey: Component<{ key: string }> = (props) => {
	const getKeyStyle = () => {
		const color = getKeyboardColors()[props.key]

		return TileStyle[color as symbol] ?? keyDefaultStyle
	}

	return (
		<button
			type="button"
			class={cx(
				keyStyle,
				":uno: grid-col-end-[span_2] font-size-5.5",
				getKeyStyle(),
				props.key === "A" && "grid-col-start-2"
			)}
			onClick={() => addCharacterToBoard(props.key)}
			disabled={hasGameEnded()}
		>
			<div class={keyStyleInner}>
				{props.key}
			</div>
		</button>
	)
}

const oneAndHalf = ":uno: grid-col-start-[span_3]"

const EnterKey: Component = () => (
	<button
		type="button"
		class={cx(keyStyle, oneAndHalf, keyDefaultStyle)}
		onClick={enter}
		disabled={hasGameEnded()}
	>
		<div class={cx(keyStyleInner, ":uno: text-3.5 uppercase p-2")}>
			Enter
		</div>
	</button>
)

const BackSpaceKey: Component = () => (
	<button
		type="button"
		aria-label="Backspace"
		class={cx(keyStyle, oneAndHalf, keyDefaultStyle)}
		onClick={backspace}
		disabled={hasGameEnded()}
	>
		<div class={keyStyleInner}>
			<Icon>
				<path d="m455.45-325.28 104.79-104.63 104.79 104.63 50.6-50.6L610.33-480 714.3-584.12l-50.6-50.76-103.46 104.79-104.79-104.79-50.76 50.76L510.15-480 404.69-375.88l50.76 50.6ZM355.72-153.3q-17.97 0-34.22-8.13-16.25-8.12-26.6-22.29L73.3-480l220.93-296.28q10.36-14.17 26.6-22.37 16.25-8.21 34.23-8.21h456.55q31.65 0 53.78 22.14 22.13 22.13 22.13 53.78v501.88q0 31.65-22.13 53.71-22.13 22.05-53.78 22.05H355.72Z" />
			</Icon>
		</div>
	</button>
)

export const Keyboard: Component = () => (
	<div class=":uno: grid-(~ cols-20 auto-rows-15 gap-1.5) [touch-action:manipulation]">
		{[...QWERTY].map(
			(key) => (key === "+" ? <EnterKey /> : key === "-" ? <BackSpaceKey /> : <InputKey key={key} />)
		)}
	</div>
)
