import { setDialogShown } from "./utils.ts"
import { today } from "./utils.ts"

// constants for IndexedDB
const DB_NAME = "nonwordle"
const DB_VERSION = 1
const DB_STORE_NAME = "games"

/**
 * Wrap an IDBRequest in a Promise
 *
 * @param request the request to resolve
 * @returns a promise that resolves with the request result
 */
function resolveIDBRequest<T>(request: IDBRequest<T>) {
	return new Promise<T>((resolve, reject) => {
		request.onsuccess = function () {
			resolve(this.result)
		}
		request.onerror = function () {
			reject()
		}
	})
}

// open the database
const idbOpenRequest = indexedDB.open(DB_NAME, DB_VERSION)

// initialize the database on first visit
idbOpenRequest.onupgradeneeded = function () {
	const db = this.result
	db.createObjectStore(DB_STORE_NAME)

	// by the way, show the dialog on first visit
	setDialogShown(true)
}

// get the database instance
const db = await resolveIDBRequest(idbOpenRequest)

// load the saved board for today
const store = () => db.transaction(DB_STORE_NAME, "readwrite").objectStore(DB_STORE_NAME)
export const savedBoard = await resolveIDBRequest(store().get(today))

/**
 * Update the database with the given board state
 * @param board the board state to save which is a string of guessed words concatenated with newlines
 */
export function updateDatabase(board: string) {
	store().put(board, today)
	// no await to avoid blocking
}
