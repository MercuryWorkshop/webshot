import { Component, css } from "dreamland/core";

export let Header: Component<{ text: string }> = function () {
	return (
		<div class="header">{this.text}</div>
	)
}

Header.style = css`
	:scope {
		border-bottom: 4px double var(--oneshot);
		padding: .25rem;
		padding-left: 1rem;
		padding-top: .5rem;
		width: max-content;
	}
`

export let GenericFooter: Component<{ status: string }> = function () {
	return (
		<div class="footer">{use(this.status)}</div>
	)
}

GenericFooter.style = css`
	:scope {
		border-top: 1px solid var(--oneshot);
		padding: 0.25rem;
		padding-inline: 0.5rem;
		width: 100%;
		min-height: 2rem;
	}
`

export let CopyFooter: Component<{ status: string }> = function () {
	return (
		<div class="footer"><div class="message">{use(this.status)}</div></div>
	)
}

CopyFooter.style = css`
	:scope {
		border-top: 1px solid var(--oneshot);
		width: 100%;
		min-height: 2rem;
		padding: .25rem;
		display: flex;
		justify-content: flex-end;
	}

	.message {
		border-left: 1px solid var(--oneshot);
		padding-inline: 0.5rem;
	}
`
