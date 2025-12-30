import { Component, css } from "dreamland/core";
import { StickyNote } from "../../splash";

export let StickyNoteWidget: Component<{}, { expanded: boolean }> = function () {
	this.expanded = false;

	let handleNoteClick = (e: Event) => {
		if (this.expanded) {
			e.stopPropagation();
		} else {
			this.expanded = true;
		}
	};

	return (
		<div class:expanded={use(this.expanded)} id="sticky-note-widget" class="sticky-note-widget">
			<div class="placeholder" />
			<div class="backdrop" on:click={() => this.expanded = false} />
			<div class="sticky-note" on:click={() => this.expanded = !this.expanded}>
				<StickyNote done={() => {this.expanded = false}} />
			</div>
		</div>
	)
}

StickyNoteWidget.style = css`
	:scope {
		align-self: flex-end;
		overflow: visible;
	}

	.placeholder {
		width: 16rem;
		height: 2.25rem;
		transition: height 0.2s linear;
	}

	:scope:hover:not(.expanded) .placeholder {
		height: 3rem;
	}

	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 99;
		backdrop-filter: blur(0px);
		background: transparent;
		pointer-events: none;
		transition: backdrop-filter 0.4s ease, background 0.4s ease;
	}

	:scope.expanded .backdrop {
		pointer-events: auto;
		backdrop-filter: blur(1px);
		background: rgba(0, 0, 0, 0.15);
	}

	.sticky-note {
		position: fixed;
		bottom: 1rem;
		left: 19rem;
		width: 30rem;
		height: 30rem;
		cursor: pointer;
		transform: rotate(2deg) translateY(calc(100% - 2.75rem));
		transform-origin: top right;
		transition: transform 0.4s, bottom 0.4s, left 0.4s;
		z-index: 100;
	}

	:scope:hover:not(.expanded) .sticky-note {
		transform: rotate(0deg) translateY(calc(100% - 5rem));
	}

	:scope.hint:not(.expanded) .sticky-note {
		transform: rotate(0deg) translateY(calc(100% - 7rem));
	}

	.sticky-note > * {
		width: 100%;
		height: 100%;
	}

	:scope.expanded .sticky-note {
		bottom: 50%;
		left: 50%;
		transform: rotate(0deg) translate(-50%, 50%);
	}
`;
