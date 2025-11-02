const DAY = 86400000 // in milliseconds

export const now = new Date()
export const today = Math.floor((now.getTime() + now.getTimezoneOffset()) / DAY)
