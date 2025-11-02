import { setDialogShown } from "./signals.ts"
import { today } from "./date.ts"

const DB_NAME = "nonwordle"
const DB_VERSION = 1
const DB_STORE_NAME = "games"

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

const idbOpenRequest = indexedDB.open(DB_NAME, DB_VERSION)

idbOpenRequest.onupgradeneeded = function () {
	const db = this.result
	db.createObjectStore(DB_STORE_NAME)

	setDialogShown(true)
}

const db = await resolveIDBRequest(idbOpenRequest)

const store = db.transaction(DB_STORE_NAME, "readonly").objectStore(DB_STORE_NAME)
export const savedBoard = await resolveIDBRequest(store.get(today))

export function updateDatanase(board: string) {
	db.transaction(DB_STORE_NAME, "readwrite")
		.objectStore(DB_STORE_NAME)
		.put(board, today)
}
