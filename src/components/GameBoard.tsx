import { type Component } from "solid-js"
import { cx } from "classix"

import { ABSENT, COLUMNS, CORRECT, getBoard, getTileStates, PRESENT, ROWS } from "../game.ts"

export const TileStyle = {
	[CORRECT]:
		":uno: text-white/100 bg-[oklch(0.623_0.178_145.0)]/100 media-high_contrast:(text-neutral-950/100 bg-orange-500/100)",
	[PRESENT]:
		":uno: text-white/100 bg-[oklch(0.667_0.177_91.0)]/100 media-contrast_no_preference:bg-present-stripe media-high_contrast:(text-neutral-950/100 bg-sky-300/100)",
	[ABSENT]: ":uno: text-white/100 bg-neutral-500/100 dark:bg-neutral-700/100"
} as const

const Tile: Component<{ row: number; column: number }> = (props) => {
	const getChar = () => getBoard()[props.row * (COLUMNS + 1) + props.column]

	const getTileStyle = () => {
		const color = getTileStates()[props.row]?.[props.column]
		const styleFromTable = TileStyle[color as symbol]

		if (styleFromTable == null) {
			return getChar() != null
				? ":uno: b-(2 neutral-400/100) dark:b-neutral-500/100 text-neutral-900/100 dark:text-neutral-50/100"
				: ":uno: b-(2 neutral-300/100) dark:b-neutral-700/100"
		}

		return cx(
			styleFromTable,
			`:uno: animate-[flip_1000ms_cubic-bezier(0.45,0,0.55,1)_both] [transform-style:preserve-3d] backface-hidden before:(absolute inset-0 grid place-content-center content-[attr(data-tile)] text-8 font-bold aspect-ratio-square b-(2 neutral-400/100) dark:b-neutral-500/100 bg-white/100 text-neutral-900/100 dark:(bg-stone-950/100 text-neutral-50/100) [rotate:x_180deg] backface-hidden [-webkit-text-stroke:transparent])`
		)
	}

	return (
		<div
			class={cx(
				":uno: grid place-content-center text-8 font-bold relative",
				getTileStyle()
			)}
			data-tile={getChar()}
		>
			{getChar()}
		</div>
	)
}

export const GameBoard: Component = () => {
	const board = new Array(ROWS)
	for (let row = 0; row < ROWS; ++row) {
		board[row] = new Array(COLUMNS)
		for (let column = 0; column < COLUMNS; ++column) {
			board[row][column] = <Tile row={row} column={column} />
		}
	}

	return (
		<div class=":uno: max-w-[min(24rem,calc(100svw_-_1rem))] max-h-[min(33.6rem,calc(140svw_-_1.4rem))] grid-(~ cols-5 rows-7 gap-1.5) m-auto aspect-ratio-5/7 flex-1">
			{board}
		</div>
	)
}
