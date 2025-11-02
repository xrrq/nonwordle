import { today } from "./date.ts"

const INITIAL_STATE = BigInt(today)
const INITIAL_SEQUENCE = 0xba9626c4877483b3n

const MASK_UINT64 = 2n ** 64n - 1n
const MASK_UINT32 = 2n ** 32n - 1n

let state = 0n
const inc = ((INITIAL_SEQUENCE << 1n) | 1n) & MASK_UINT64

export function random(): number {
	state = (state * 6364136223846793005n + (inc | 1n)) & MASK_UINT64

	const xorshifted = ((state >> 18n) ^ state) >> 27n & MASK_UINT32
	const rot = state >> 59n
	const result = (xorshifted >> rot) | (xorshifted << ((-rot) & 31n))

	return Number(result) // >>> 0 // uint32
}

random()
state += INITIAL_STATE
