import { random } from "./random.ts"

const response = await fetch("words.dat")

if (!response.ok) {
	throw new Error("Failed to fetch the word list")
}

const data = await response.bytes()

export const acceptableWords = new Set<string>()

const WORD_LENGTH = 5

let answerTemp: string | undefined
let context = ""
let index = 0
const answerIndex = random() >>> 19 // 8192 unique answers

for (const char of data) {
	if (char <= 0b1111) {
		const type = char >>> 3
		const breakouts = char & 0b0111

		if (type === 0) {
			acceptableWords.add(context)
		} else if (type === 1) {
			if (index === answerIndex) {
				answerTemp = context
			}

			index += 1
		}

		if (breakouts >= 1) {
			context = context.slice(0, -breakouts)
		}
	} else {
		if (context.length === WORD_LENGTH) {
			context = context.slice(0, -1)
		}

		context += String.fromCharCode(char)
	}
}

if (!answerTemp) {
	throw new Error("Failed to determine the answer")
}

export const answer = answerTemp

acceptableWords.add(answer)
