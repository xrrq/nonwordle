import { now } from "./utils.ts"
import { ABSENT, CORRECT, getRows, getTileStates, hasGameEnded, isSolved, PRESENT, ROWS } from "./game.ts"
import { toast } from "./components/Toast.tsx"
import * as i18n from "./i18n.ts"

const pad = (str: string, length = 2) => str.padStart(length, "0")

/**
 * Share the game result by copying to clipboard or using the Web Share API
 */
export async function share(): Promise<void> {
	// today’s date
	const YYYY = pad(now.getFullYear() + "", 4)
	const MM = pad((now.getMonth() + 1) + "")
	const DD = pad(now.getDate() + "")

	// solved in how many tries
	const solvedIn = hasGameEnded() ? isSolved() ? getRows().length : "X" : "-"

	// build the board text
	// use different emojis for high contrast mode and dark mode
	const highContrast = matchMedia("(prefers-contrast:more)").matches
	const darkMode = matchMedia("(prefers-color-scheme:dark)").matches
	const boardText = getTileStates().map((row) =>
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
	if (matchMedia("(pointer:coarse)").matches) {
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
