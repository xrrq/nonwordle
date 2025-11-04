import { today } from "./utils.ts"

/**
 * Set of acceptable words
 */
export const acceptableWords = new Set<string>()

let temporaryAnswer: string | undefined

// populate the word list and determine today’s answer
{
	// derived from today’s date
	const INITIAL_STATE = BigInt(today)

	// arbitrary constant, DO NOT CHANGE
	const INITIAL_SEQUENCE = 0xba9626c4877483b3n

	const MASK_UINT64 = 2n ** 64n - 1n
	const MASK_UINT32 = 2n ** 32n - 1n

	let state = 0n
	const inc = ((INITIAL_SEQUENCE << 1n) | 1n) & MASK_UINT64

	/**
	 * Generate a random uint32 number using a PCG32 algorithm to deterministically get today’s answer
	 *
	 * @returns a random uint32 number
	 * @see https://github.com/imneme/pcg-c-basic/blob/405c6e3/pcg_basic.c#L60-L67
	 */
	const random = (): number => {
		state = (state * 0x5851f42d4c957f2dn + (inc | 1n)) & MASK_UINT64

		const xorshifted = ((state >> 18n) ^ state) >> 27n & MASK_UINT32
		const rot = state >> 59n
		const result = (xorshifted >> rot) | (xorshifted << ((-rot) & 31n))

		return Number(result) // >>> 0 // uint32
	}

	random()
	state += INITIAL_STATE

	// fetch the compressed word list
	const response = await fetch("words.dat")

	if (!response.ok) {
		throw new Error("Failed to fetch the word list")
	}

	const data = await response.bytes()

	// context for building words
	let context = ""

	let currentAnswerIndex = 0
	const chosenAnswerIndex = random() >>> 19 // 8192 unique answers

	// for compressing the word list, see ../scripts/compress.py

	for (const char of data) {
		if (char < 0b1111 + 1) {
			// control character
			// upper 4 bits = unused
			// middle 1 bit = type
			// lower 3 bits = number of characters to remove from end of context

			// 0 = acceptable word
			// 1 = answer candidate (non-word)
			const type = char >>> 3

			// number of characters to remove from end of the last word
			const breakouts = char & 0b0111

			if (!type) {
				acceptableWords.add(context)
			} else {
				if (currentAnswerIndex === chosenAnswerIndex) {
					temporaryAnswer = context
				}

				currentAnswerIndex += 1
			}

			if (breakouts) {
				context = context.slice(0, -breakouts)
			}
		} else {
			// append character to context
			context += String.fromCharCode(char)
		}
	}
}

// ensure we have determined an answer
if (!temporaryAnswer) {
	throw new Error("Failed to determine the answer")
}

/**
 * The answer word, which is non-word
 */
export const answer = temporaryAnswer

// Add the answer to acceptable words so that it can be guessed
acceptableWords.add(answer)
