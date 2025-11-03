import { type Component, createSignal, type JSX } from "solid-js"
import { cx } from "classix"

import * as i18n from "../i18n.ts"
import { Icon } from "./Icon.tsx"
import { TileStyle } from "./GameBoard.tsx"
import { ABSENT, CORRECT, PRESENT } from "../game.ts"

// signal for whether the dialog has been shown
export const [isDialogShown, setDialogShown] = createSignal(false)

const dialogInnerStyle =
	":uno: w-full max-w-lg max-h-svh bg-white/100 dark:bg-stone-950/100 p-8 relative [box-shadow:0_0.25rem_1.5rem_#0004] dark:[box-shadow:0_0.25rem_1.5rem_#fff6] rounded-lg overflow-y-scroll [overscroll-behavior:contain]"

const Link: Component<{ href: string; children: JSX.Element }> = (props) => (
	<a
		href={props.href}
		target="_blank"
		rel="nofollow noreferrer noopenner"
	>
		{props.children}
	</a>
)

export const HowToPlay: Component = () => (
	<div
		class={cx(
			isDialogShown()
				? ":uno: fixed inset-0 w-full h-full grid place-content-center p-4 z-3 bg-white/50 dark:bg-stone-950/50 [backdrop-filter:saturate(1.1)_blur(0.25rem)]"
				: ":uno: hidden"
		)}
		onClick={(event) => {
			if (event.target.closest(`.${dialogInnerStyle}`) === null) {
				setDialogShown(false)
			}
		}}
	>
		<div class={dialogInnerStyle}>
			<h2 class=":uno: font-(size-7 [Mozilla_Headline_Variable,sans-serif] bold stretch-[90%]) m-bs-7 m-be-2">
				{i18n.howToPlay}
			</h2>
			<button
				type="button"
				class=":uno: absolute top-4 right-4"
				onClick={() => setDialogShown(false)}
				aria-label="Close"
			>
				<Icon>
					<path d="m251.33-198.29-53.04-53.04L426.96-480 198.29-708.67l53.04-53.04L480-533.04l228.67-228.67 53.04 53.04L533.04-480l228.67 228.67-53.04 53.04L480-426.96 251.33-198.29Z" />
				</Icon>
			</button>
			<p class=":uno: text-xl" innerHTML={i18n.description1} />
			<ul class=":uno: m-block-4 p-is-4 list-disc children:p-be-1">
				{i18n.description2.map((item) => <li innerHTML={item} />)}
			</ul>
			<section>
				<h3 class=":uno: font-600">{i18n.examples}</h3>
				{["BRIEF", "VAULT", "READY"].map((word, index) => (
					<div class=":uno: m-bs-3 m-be-5">
						<div class=":uno: flex-(~ gap-1) h-8 m-be-3">
							{word.split("").map((char) => (
								<div
									class={cx(
										":uno: grid place-content-center text-5 font-bold aspect-ratio-square",
										char === "B"
											? TileStyle[CORRECT]
											: char === "U"
											? TileStyle[PRESENT]
											: char === "D"
											? TileStyle[ABSENT]
											: ":uno: b-(2 neutral-400/100) dark:b-neutral-500/100 text-neutral-900/100 dark:text-neutral-50/100"
									)}
								>
									{char}
								</div>
							))}
						</div>
						<p innerHTML={i18n.exampleDescriptions[index]!} />
					</div>
				))}
			</section>
			<hr />
			<div class=":uno: m-bs-4 font-size-3.5 line-height-[1.7]">
				<p>
					<cite>Nonwordle</cite>, created by Laticeptora (<Link href="https://github.com/xrrq/nonwordle">source</Link>)
				</p>
				<p>
					Based on{" "}
					<Link href="https://www.nytimes.com/games/wordle/index.html">
						<cite>Wordle</cite>
					</Link>{" "}
					by Josh Wardle
				</p>
			</div>
		</div>
	</div>
)
