import { type Component } from "solid-js"

import { HowToPlay } from "./components/HowToPlay.tsx"
import { Toast } from "./components/Toast.tsx"
import { Header } from "./components/Header.tsx"
import { GameBoard } from "./components/GameBoard.tsx"
import { Keyboard } from "./components/Keyboard.tsx"
import { ConfettiCanvas } from "./confetti.tsx"

export const App: Component = () => {
	return (
		<>
			<HowToPlay />
			<Toast />
			<div class=":uno: h-svh flex-(~ col)">
				<Header />
				<main class=":uno: w-full h-full max-w-lg m-(inline-auto be-2) p-inline-2 flex-(~ col gap-4) justify-between select-none">
					<GameBoard />
					<Keyboard />
				</main>
			</div>
			<ConfettiCanvas />
		</>
	)
}
