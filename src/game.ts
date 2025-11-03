import { createSignal } from "solid-js"

import { savedBoard, updateDatabase } from "./database.ts"
import { createArrayOfLength } from "./utils.ts"
import { acceptableWords, answer } from "./words.ts"
import { toast } from "./components/Toast.tsx"
import * as i18n from "./i18n.ts"
import { confetti } from "./confetti.tsx"

// board dimensions
export const ROWS = 7
export const COLUMNS = 5

// tile states
export const CORRECT = import.meta.env.DEV ? Symbol("CORRECT") : Symbol()
export const PRESENT = import.meta.env.DEV ? Symbol("PRESENT") : Symbol()
export const ABSENT = import.meta.env.DEV ? Symbol("ABSENT") : Symbol()

type CharState = typeof CORRECT | typeof PRESENT | typeof ABSENT

// current board as a string separated by newlines
export const [getBoard, setBoard] = createSignal<string>(savedBoard ?? "")

// returns an array of strings, each representing a row on the board
export const getRows = () => {
	const board = getBoard()
	return board !== "" ? board.trimEnd().split("\n") : []
}

// 2D array of tile states
export const [getTileStates, setTileStates] = createSignal<CharState[][]>(
	createArrayOfLength(ROWS, () => createArrayOfLength(COLUMNS)),
	{ equals: false }
)

// map from character to its highest-known state
export const [getKeyboardColors, setKeyboardColors] = createSignal<Record<string, CharState>>({}, { equals: false })

// whether the game has been solved
export const [isSolved, setSolved] = createSignal(false)

/**
 * @returns whether the game has ended
 */
export const hasGameEnded = () => isSolved() || getBoard().length >= (COLUMNS + 1) * ROWS

function unreachable(): never {
	throw new Error("unreachable")
}

/**
 * Process a guess and update the board and keyboard states
 *
 * @param guess the guessed word
 * @param guessRowIndex the row index of the guess
 * @param fast whether to use fast mode (less delays)
 */
async function guess(guess: string, guessRowIndex: number, fast = false): Promise<void> {
	const answerArray = answer.split("")
	const tileStateArray = Array<CharState>(COLUMNS)
	const keyboardColors = {} as Record<string, CharState>

	// first pass: correct letters
	for (let index = 0; index < COLUMNS; ++index) {
		const guessedLetter = guess[index] ?? unreachable()
		const correctLetter = answerArray[index]

		if (guessedLetter === correctLetter) {
			tileStateArray[index] = CORRECT
			delete answerArray[index]

			keyboardColors[correctLetter] = CORRECT
		}
	}

	// second pass: present letters
	for (let index = 0; index < COLUMNS; ++index) {
		const guessedLetter = guess[index] ?? unreachable()
		const answerLetterIndex = answerArray.indexOf(guessedLetter)

		if (tileStateArray[index] == null && answerLetterIndex > -1) {
			tileStateArray[index] = PRESENT
			delete answerArray[answerLetterIndex]

			keyboardColors[guessedLetter] ??= PRESENT
		}
	}

	// third pass: absent letters
	for (let index = 0; index < COLUMNS; ++index) {
		if (tileStateArray[index] == null) {
			tileStateArray[index] = ABSENT

			const guessedLetter = guess[index] ?? unreachable()
			keyboardColors[guessedLetter] ??= ABSENT
		}
	}

	// reveal animation

	// if fast is true, skip delays
	const notFast = +!fast

	for (let index = 0; index < COLUMNS; ++index) {
		const char = guess[index] ?? unreachable()

		// update tile state
		setTimeout(
			() =>
				setTileStates((table) => {
					;(table[guessRowIndex] ?? unreachable())[index] = tileStateArray[index] ?? unreachable()

					return table
				}),
			(75 * (index + guessRowIndex)) * (fast as unknown as number)
		)

		if (notFast) {
			await new Promise((resolve) => setTimeout(resolve, 500))
		}

		// update keyboard colors
		setTimeout(
			() =>
				setKeyboardColors((map) => {
					if (map[char] !== CORRECT) {
						map[char] = keyboardColors[char] ?? unreachable()
					}

					return map
				}),
			(75 * (index + guessRowIndex) + 500) * (fast as unknown as number)
		)
	}

	// results

	// correct guess
	if (guess === answer) {
		setSolved(true)

		setTimeout(() => {
			if (notFast) {
				toast(i18n.messages[guessRowIndex] ?? unreachable(), 5000)
			}

			confetti()
		}, fast ? 100 * guessRowIndex + 1000 : 500)
	} // last row and not solved
	else if (hasGameEnded()) {
		setTimeout(() => toast(answer, Infinity), 500 * notFast)
	}
}

/**
 * Fill the board with the saved game state
 */
export function initiate(): void {
	const rows = getRows()
	const length = rows.length

	for (let index = 0; index < length; ++index) {
		const word = rows[index] ?? unreachable()
		guess(word, index, true)
	}
}

/**
 * Try to add a character to the board
 *
 * @param key the character to add
 */
export function addCharacterToBoard(key: string): void {
	// cannot add more letters to a full row
	if (hasGameEnded() || getBoard().length % (COLUMNS + 1) >= COLUMNS) {
		return
	}

	setBoard((board) => board + key)
}

/**
 * Try to remove the last character from the board
 */
export function backspace(): void {
	// cannot delete newline
	if (hasGameEnded() || getBoard().length % (COLUMNS + 1) === 0) {
		return
	}

	setBoard((board) => board.slice(0, -1))
}

/**
 * Try to enter the current row as a guess
 */
export async function enter(): Promise<void> {
	const currentBoard = getBoard()

	if (hasGameEnded()) {
		return
	}

	// incomplete row
	if (currentBoard.length % (COLUMNS + 1) !== COLUMNS) {
		toast(i18n.notEnoughLetters)
		return
	}

	const word = currentBoard.slice(-5)

	// word not in list
	if (!acceptableWords.has(word)) {
		toast(i18n.notInWordList)
		return
	}

	setBoard((board) => board + "\n")

	updateDatabase(getBoard())

	const currentRowIndex = getBoard().length / (COLUMNS + 1) - 1
	await guess(word, currentRowIndex)
}

// keyboard input handling
addEventListener("keydown", ({ key }): void => {
	if (/^[A-Za-z]$/.test(key)) {
		addCharacterToBoard(key.toUpperCase())
	} else if (key === "Backspace") {
		backspace()
	} else if (key === "Enter") {
		enter()
	}
})
