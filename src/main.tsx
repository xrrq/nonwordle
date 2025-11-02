/* @refresh reload */
import { render } from "solid-js/web"

import "./style.css"
import "uno.css"

import { App } from "./App.tsx"
import { initiate } from "./game.ts"

render(() => <App />, document.getElementById("root")!)

initiate()
