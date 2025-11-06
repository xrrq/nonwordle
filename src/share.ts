import { DAY, media, today } from "./utils.ts"
import { ABSENT, CORRECT, getBoard, getGameState, getTiles, PRESENT, ROWS } from "./game.ts"
import { toast } from "./components/Toast.tsx"
import * as i18n from "./i18n.ts"

/**
 * Pads a number with leading zeros to reach a specified length.
 * @param num the number to pad
 * @param length the desired length (default is 2)
 * @returns the padded number as a string
 */
const pad = (num: number, length = 2) => (num + "").padStart(length, "0")

/**
 * Share the game result by copying to clipboard or using the Web Share API
 */
export async function share(): Promise<void> {
	// today’s date
	const todayDate = new Date(today * DAY)
	const YYYY = pad(todayDate.getFullYear(), 4)
	const MM = pad(todayDate.getMonth() + 1)
	const DD = pad(todayDate.getDate())

	const gameState = getGameState()

	// solved in how many tries
	const solvedIn = gameState ? (gameState > 1 ? "X" : getBoard().length) : "-"

	// build the board text
	// use different emojis for high contrast mode and dark mode
	const highContrast = media("(prefers-contrast:more)")
	const darkMode = media("(prefers-color-scheme:dark)")
	const boardText = getTiles().map((row) =>
		row.map((state) =>
			state === CORRECT
				? (highContrast ? "🟧" : "🟩")
				: state === PRESENT
				? (highContrast ? "🟦" : "🟨")
				: state === ABSENT
				? (darkMode ? "⬛" : "⬜")
				: ""
		).join("")
	).join("\n").trimEnd()

	// full text to share
	const text = `Nonwordle ${YYYY}-${MM}-${DD} ${solvedIn}/${ROWS}

${boardText}`

	// on mobile, use the Web Share API if available
	if (media("(pointer:coarse)")) {
		const shareData = { text }

		if (navigator.canShare?.(shareData)) {
			await navigator.share(shareData)
			return
		}
	}

	// on PC, just copy to clipboard
	await navigator.clipboard.writeText(text)
	toast(i18n.copied, 2000)
}
