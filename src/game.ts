import { createSignal } from "solid-js"

import { savedBoard, updateDatanase } from "./database.ts"
import { confetti } from "./confetti.tsx"
import { acceptableWords, answer } from "./words.ts"
import { toast } from "./components/Toast.tsx"
import * as i18n from "./i18n.ts"

export const ROWS = 7
export const COLUMNS = 5

export const CORRECT = import.meta.env.DEV ? Symbol("CORRECT") : Symbol()
export const PRESENT = import.meta.env.DEV ? Symbol("PRESENT") : Symbol()
export const ABSENT = import.meta.env.DEV ? Symbol("ABSENT") : Symbol()

type CharState = typeof CORRECT | typeof PRESENT | typeof ABSENT

// list of 5-character strings, separated by newlines
export const [getBoard, setBoard] = createSignal<string>(savedBoard ?? "")
export const [getTileStates, setTileStates] = createSignal<CharState[][]>(
	Array(ROWS).fill(undefined).map(() => Array(COLUMNS)),
	{ equals: false }
)
export const [getKeyboardColors, setKeyboardColors] = createSignal<Record<string, CharState>>({}, { equals: false })

export const [isSolved, setSolved] = createSignal(false)

export const getRows = () => {
	const board = getBoard()
	return board !== "" ? board.trimEnd().split("\n") : []
}

export const hasGameEnded = () => isSolved() || getBoard().length >= (COLUMNS + 1) * ROWS

function unreachable(): never {
	throw new Error("unreachable")
}

async function guess(guess: string, rowIndex: number, fast = false) {
	const answerArray = answer.split("")
	const tileStateArray = Array<CharState>(COLUMNS)
	const keyboardColors = { ...getKeyboardColors() }

	for (let index = 0; index < COLUMNS; ++index) {
		const guessedLetter = guess[index] ?? unreachable()
		const correctLetter = answerArray[index]

		if (guessedLetter === correctLetter) {
			tileStateArray[index] = CORRECT
			delete answerArray[index]

			keyboardColors[correctLetter] = CORRECT
		}
	}

	for (let index = 0; index < COLUMNS; ++index) {
		const guessedLetter = guess[index] ?? unreachable()
		const answerLetterIndex = answerArray.indexOf(guessedLetter)

		if (tileStateArray[index] == null && answerLetterIndex > -1) {
			tileStateArray[index] = PRESENT
			delete answerArray[answerLetterIndex]

			keyboardColors[guessedLetter] ??= PRESENT
		}
	}

	for (let index = 0; index < COLUMNS; ++index) {
		if (tileStateArray[index] == null) {
			tileStateArray[index] = ABSENT

			const guessedLetter = guess[index] ?? unreachable()
			keyboardColors[guessedLetter] ??= ABSENT
		}
	}

	for (let index = 0; index < COLUMNS; ++index) {
		const char = guess[index] ?? unreachable()

		if (fast) {
			setTimeout(
				() =>
					setTileStates((table) => (
						(table[rowIndex] ?? unreachable())[index] = tileStateArray[index] ?? unreachable(), table
					)),
				75 * (index + rowIndex)
			)
			setTimeout(
				() => setKeyboardColors((map) => (map[char] = keyboardColors[char] ?? unreachable(), map)),
				75 * (index + rowIndex) + 500
			)
		} else {
			setTileStates((table) => (
				(table[rowIndex] ?? unreachable())[index] = tileStateArray[index] ?? unreachable(), table
			))
			await new Promise((resolve) => setTimeout(resolve, 500))
			setKeyboardColors((map) => (map[char] = keyboardColors[char] ?? unreachable(), map))
		}
	}

	if (guess === answer) {
		setSolved(true)

		if (fast) {
			setTimeout(
				() => confetti(),
				100 * rowIndex + 1000
			)
		} else {
			setTimeout(() => {
				toast(i18n.messages[rowIndex] ?? unreachable(), 5000)
				confetti()
			}, 500)
		}
	} else if (hasGameEnded()) {
		if (fast) {
			toast(answer, Infinity)
		} else {
			setTimeout(() => {
				toast(answer, Infinity)
			}, 500)
		}
	}
}

export function initiate() {
	const rows = getRows()
	const length = rows.length

	for (let index = 0; index < length; ++index) {
		const word = rows[index] ?? unreachable()
		guess(word, index, true)
	}
}

export function pressKey(key: string) {
	if (hasGameEnded() || getBoard().length % (COLUMNS + 1) >= COLUMNS) {
		return
	}

	setBoard((board) => board + key)
}

export function backspace() {
	if (hasGameEnded() || getBoard().length % (COLUMNS + 1) === 0) {
		return
	}

	setBoard((board) => board.slice(0, -1))
}

export async function enter() {
	const currentBoard = getBoard()

	if (hasGameEnded()) {
		return
	}

	if (currentBoard.length % (COLUMNS + 1) !== COLUMNS) {
		toast(i18n.notEnoughLetters)
		return
	}

	const word = currentBoard.slice(-5)

	if (!acceptableWords.has(word)) {
		toast(i18n.notInWordList)
		return
	}

	setBoard((board) => board + "\n")
	updateDatanase(getBoard())

	const rowIndex = getBoard().length / (COLUMNS + 1) - 1
	await guess(word, rowIndex)
}

addEventListener("keydown", ({ key }) => {
	if (/^[A-Za-z]$/.test(key)) {
		pressKey(key.toUpperCase())
	} else if (key === "Backspace") {
		backspace()
	} else if (key === "Enter") {
		enter()
	}
})
