// avoid circular reference of modules

import { createSignal } from "solid-js"

export const [isDialogShown, setDialogShown] = createSignal(false)
