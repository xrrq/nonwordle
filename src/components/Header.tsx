import { type Component } from "solid-js"

import { setDialogShown } from "../utils.ts"
import { Icon } from "./Icon.tsx"
import { share } from "../share.ts"

const iconButton =
	":uno: flex justify-center items-center h-full aspect-ratio-square hover:bg-neutral-200/100 dark:hover:bg-neutral-700/100 transition-background-color"

const GuideButton: Component = () => (
	<button
		type="button"
		class={iconButton}
		onClick={() => setDialogShown(true)}
		aria-label="How to play"
	>
		<Icon>
			<path d="M481.44-244.67q18.31 0 31.23-12.92 12.92-12.92 12.92-31.34t-12.92-31.19q-12.92-12.77-31.31-12.77-18.38 0-31.23 12.76-12.84 12.75-12.84 31.28 0 18.34 12.87 31.26 12.86 12.92 31.28 12.92Zm-37.48-148.66h67.98q0-27.7 6.88-48.45 6.87-20.74 40.32-49.77 28.78-25.04 42.33-49.86 13.54-24.82 13.54-56.26 0-54.76-36.23-86.45-36.24-31.69-92.97-31.69-52.46 0-90.25 27.37t-54.27 71.17l61.64 23.49q9.32-24.98 29.38-42.15 20.06-17.18 50.47-17.18 30.86 0 49.19 17.16 18.34 17.15 18.34 42.27 0 20.35-12.31 38.9-12.3 18.56-33.62 36.28-34.02 29.86-47.22 54.29-13.2 24.44-13.2 70.88ZM480.02-73.3q-83.95 0-158.14-31.96-74.19-31.96-129.43-87.19-55.23-55.24-87.19-129.41Q73.3-396.03 73.3-479.98q0-84.61 31.96-158.81 31.96-74.19 87.17-129.1t129.39-86.94q74.18-32.03 158.14-32.03 84.63 0 158.85 32.02 74.21 32.02 129.1 86.91 54.9 54.88 86.92 129.08 32.03 74.2 32.03 158.85 0 83.97-32.03 158.16t-86.94 129.41q-54.91 55.21-129.08 87.17Q564.64-73.3 480.02-73.3Z" />
		</Icon>
	</button>
)

const ShareButton: Component = () => (
	<button
		type="button"
		class={iconButton}
		onClick={share}
		aria-label="Share"
	>
		<Icon>
			<path d="M684.78-73.3q-50.79 0-86.45-35.61-35.67-35.61-35.67-86.29 0-7.26 4.09-30.14l-286.14-167.3q-16.9 16.49-38.5 25.75-21.6 9.27-46.67 9.27-50.89 0-86.51-35.69Q73.3-429 73.3-479.98q0-50.98 35.63-86.69 35.62-35.71 86.51-35.71 24.48 0 46.02 9.03 21.55 9.04 38.37 24.97l286.68-165.45q-1.76-7.35-2.8-14.99-1.05-7.63-1.05-15.74 0-50.78 35.68-86.54 35.68-35.76 86.47-35.76t86.46 35.77q35.66 35.76 35.66 86.55t-35.64 86.45q-35.65 35.67-86.57 35.67-24.32 0-45.65-9.07-21.33-9.08-38.13-24.39L313.06-513.89q2.66 7.89 3.83 16.59t1.17 17.12q0 8.42-.88 15.98-.87 7.57-3.03 15.32l287.14 164.66q16.8-15.57 38.06-24.47 21.26-8.89 45.56-8.89 51.16 0 86.59 35.66 35.43 35.65 35.43 86.59 0 50.93-35.68 86.48-35.68 35.55-86.47 35.55Z" />
		</Icon>
	</button>
)

export const Header: Component = () => (
	<header class=":uno: flex justify-center h-14 b-b-(2 neutral-200/100) dark:b-b-white/10 m-be-4">
		<div class=":uno: w-full max-w-lg flex justify-between items-center p-inline-2">
			<GuideButton />
			<h1 class=":uno: font-(size-10 [Mozilla_Headline_Variable,sans-serif] bold stretch-[90%]) text-neutral-700/100 dark:text-neutral-100/100">
				<span class=":uno: decoration-(line-through [0.15em])">Non</span>wordle
			</h1>
			<ShareButton />
		</div>
	</header>
)
