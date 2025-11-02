import type { Component, JSX } from "solid-js"

export const Icon: Component<{ children: JSX.Element }> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 -960 960 960"
		class=":uno: w-8 h-8 fill-current"
		aria-hidden="true"
	>
		{props.children}
	</svg>
)
