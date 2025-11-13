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

const SymbolConstructor = Symbol

// tile states
export const CORRECT = SymbolConstructor()
export const PRESENT = SymbolConstructor()
export const ABSENT = SymbolConstructor()

type CharState = typeof CORRECT | typeof PRESENT | typeof ABSENT

const savedBoardValidated = (
		typeof savedBoard === "string" &&
		/^[A-Z]{5}(?:\n[A-Z]{5}){0,6}\n?$/.test(savedBoard)
	)
	? savedBoard.slice(0, (COLUMNS + 1) * ROWS - 1) // trim to max size
	: ""

// 2D array of characters on the board
export const [getBoard, setBoard] = createSignal(
	savedBoardValidated.split("\n").map((row) => row.split("")),
	{ equals: false }
)

// 2D array of tile states
export const [getTiles, setTiles] = createSignal(
	createArrayOfLength(ROWS, () => createArrayOfLength<CharState>(COLUMNS)),
	{ equals: false }
)

// map from character to its highest-known state
export const [getCharMap, setCharMap] = createSignal<Record<string, CharState>>({}, { equals: false })

// game state: 0 = ongoing, 1 = won, 2 = lost
export const [getGameState, setGameState] = createSignal<0 | 1 | 2>(0)

/**
 * Process a guess and update the board and keyboard states
 *
 * @param guess the guessed word
 * @param guessRowIndex the row index of the guess
 * @param fast whether to use fast mode (less delays)
 */
async function guess(guess: string, guessRowIndex: number, fast = false): Promise<void> {
	const answerArray: (string | null)[] = answer.split("")
	const tileStateArray = createArrayOfLength<CharState>(COLUMNS)
	const keyboardColors = {} as Record<string, CharState>

	// first pass: correct letters
	for (let index = 0; index < COLUMNS; ++index) {
		const guessedLetter = guess[index]!
		const correctLetter = answerArray[index]

		if (guessedLetter === correctLetter) {
			tileStateArray[index] = CORRECT
			answerArray[index] = null // prevent double counting

			keyboardColors[correctLetter] = CORRECT
		}
	}

	// second pass: present letters & absent letters
	for (let index = 0; index < COLUMNS; ++index) {
		if (tileStateArray[index] == null) {
			const guessedLetter = guess[index]!
			const answerLetterIndex = answerArray.indexOf(guessedLetter)

			const state = answerLetterIndex > -1 ? ((answerArray[answerLetterIndex] = null), PRESENT) : ABSENT

			tileStateArray[index] = state
			keyboardColors[guessedLetter] ??= state
		}
	}

	// reveal animation

	// if fast is true, skip delays
	for (let index = 0; index < COLUMNS; ++index) {
		const char = guess[index]!

		// update tile state
		setTimeout(
			() =>
				setTiles((table) => {
					;(table[guessRowIndex]!)[index] = tileStateArray[index]!

					return table
				}),
			(75 * (index + guessRowIndex)) * +fast
		)

		if (!fast) {
			await new Promise((resolve) => setTimeout(resolve, 500))
		}

		// update keyboard colors immediately
		setCharMap((map) => {
			if (map[char] !== CORRECT) {
				map[char] = keyboardColors[char]!
			}

			return map
		})
	}

	// results

	// correct guess
	if (guess === answer) {
		setGameState(1)

		setTimeout(() => {
			if (!fast) {
				toast(i18n.messages[guessRowIndex]!, 5000)
			}

			confetti()
		}, fast ? 100 * guessRowIndex + 1000 : 500)
	} else if (guessRowIndex === ROWS - 1) {
		setGameState(2)

		// last row and not solved
		setTimeout(() => toast(answer, Infinity), fast ? 100 * guessRowIndex + 1500 : 500)
	}
}

/**
 * Fill the board with the saved game state
 */
export function initiate(): void {
	const board = getBoard()
	const length = board.length

	for (let index = 0; index < length; ++index) {
		// incomplete row
		if (board[index]!.length < COLUMNS) {
			break
		}

		const word = board[index]!.join("")
		guess(word, index, true) // no await
	}
}

/**
 * Try to add a character to the board
 *
 * @param key the character to add
 */
export function addCharacterToBoard(key: string): void {
	// cannot add more letters to a full row
	if (getGameState() || getBoard().at(-1)!.length >= COLUMNS) {
		return
	}

	setBoard((board) => (board.at(-1)!.push(key), board))
}

/**
 * Try to remove the last character from the board
 */
export function backspace(): void {
	// cannot delete newline
	if (getGameState() || !getBoard().at(-1)!.length) {
		return
	}

	setBoard((board) => (board.at(-1)!.pop(), board))
}

/**
 * Try to enter the current row as a guess
 */
export async function enter(): Promise<void> {
	const currentBoard = getBoard()

	const currentRowIndex = currentBoard.length - 1
	const currentRow = currentBoard[currentRowIndex]!

	if (getGameState()) {
		return
	}

	// incomplete row
	if (currentRow.length < COLUMNS) {
		toast(i18n.notEnoughLetters)
		return
	}

	const word = currentRow.join("")

	// word not in list
	if (!acceptableWords.has(word)) {
		toast(i18n.notInWordList)
		return
	}

	// add new empty row if not last row
	if (currentRowIndex !== ROWS - 1) {
		setBoard((board) => (board.push([]), board))
	}

	// update saved board in database
	updateDatabase(getBoard().map((row) => row.join("")).join("\n"))

	await guess(word, currentRowIndex)
}

// keyboard input handling
addEventListener("keydown", ({ key }): void => {
	if (/^[A-Z]$/i.test(key)) {
		addCharacterToBoard(key.toUpperCase())
	} else if (key === "Backspace") {
		backspace()
	} else if (key === "Enter") {
		enter()
	}
})
