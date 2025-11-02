import { now } from "./date.ts"
import { ABSENT, CORRECT, getRows, getTileStates, hasGameEnded, isSolved, PRESENT, ROWS } from "./game.ts"
import { toast } from "./components/Toast.tsx"
import * as i18n from "./i18n.ts"

const pad = (str: string, length = 2) => str.padStart(length, "0")

export async function share() {
	const YYYY = pad(now.getFullYear() + "", 4)
	const MM = pad((now.getMonth() + 1) + "")
	const DD = pad(now.getDate() + "")

	const solvedIn = hasGameEnded() ? isSolved() ? getRows().length : "X" : "-"

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

	const text = `Nonwordle ${YYYY}-${MM}-${DD} ${solvedIn}/${ROWS}

${boardText}`

	if (matchMedia("(pointer:coarse)").matches) {
		const shareData = { text }

		if (navigator.canShare?.(shareData)) {
			await navigator.share(shareData)
			return
		}
	}

	await navigator.clipboard.writeText(text)
	toast(i18n.copied, 2000)
}
