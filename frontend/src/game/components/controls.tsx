import { Component, css } from "dreamland/core";
import { gameState } from "../dotnet";

export let PlayButton: Component<{ onPower: () => void }> = function () {
	return (
		<button on:click={this.onPower} disabled={use(gameState.playing)} class:ready={use(gameState.ready).map(r => r)}>
			<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor">
				<path d="M480-46q-91 0-169.99-34.08-78.98-34.09-137.41-92.52-58.43-58.43-92.52-137.41Q46-389 46-480q0-91.34 33.5-170.17Q113-729 172-788l90 89q-42 42-66 98.17t-24 121.06Q172-350 261-261t219 89q130 0 219-89t89-218.77q0-64.89-23.5-121.06T699-699l89-89q59 59 92.5 137.83Q914-571.34 914-480q0 91-34.08 169.99-34.09 78.98-92.52 137.41-58.43 58.43-137.41 92.52Q571-46 480-46Zm-63-371v-497h126v497H417Z" />
			</svg>
		</button>
	)
}

PlayButton.style = css`
	:scope {
		height: 100%;
		aspect-ratio: 1 / 1;
		
		border: none;
		border-radius: 50%;

		cursor: not-allowed;

		--led-color: var(--play-led-not-ready);

		background: color-mix(in srgb, var(--button-bg), var(--led-color) 60%);
		color: var(--button-fg);

		transition: background 0.15s linear;

		display: flex;
		align-items: center;
		justify-content: center;
	}

	:scope.ready {
		cursor: auto;
		--led-color: var(--play-led-ready);
	}

	:scope:disabled {
		cursor: not-allowed;
		--led-color: var(--button-bg);
	}
`;

export let CopyAssetsSlot: Component<{ insertDisk: () => void }> = function () {
	return (
		<button on:click={this.insertDisk} disabled={use(gameState.playing)}>
			World Machine OS
			<div class="led" class:blinking={use(gameState.diskInserted).map(x => !x)} />
		</button>
	)
}

CopyAssetsSlot.style = css`
	:scope {
		background: var(--button-bg);
		color: var(--button-fg);
		border: none;
		border-radius: 8px;

		display: flex;
		gap: 0.5rem;
		align-items: center;
		padding: 0.5rem;

		font-size: 1.5rem;
	}
	:scope:disabled {
		cursor: not-allowed;
	}

	.led {
		align-self: start;
		width: 12px;
		border-radius: 100%;
		aspect-ratio: 1 / 1;
		background: var(--led-ok);
	}
	.led.blinking {
		animation: 1s ease assets-led infinite;
	}

	@keyframes assets-led {
		from, to { background: #000; }
		50% {
			background: var(--led-error);
		}
	}
`;
