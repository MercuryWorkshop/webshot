import { Component, css, Delegate } from "dreamland/core";
import { gameState, preInit, run } from "./dotnet";

let PlayButton: Component = function () {
	return (
		<button on:click={run} disabled={use(gameState.playing)} class:ready={use(gameState.ready)}>
			<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor">
				<path d="M480-46q-91 0-169.99-34.08-78.98-34.09-137.41-92.52-58.43-58.43-92.52-137.41Q46-389 46-480q0-91.34 33.5-170.17Q113-729 172-788l90 89q-42 42-66 98.17t-24 121.06Q172-350 261-261t219 89q130 0 219-89t89-218.77q0-64.89-23.5-121.06T699-699l89-89q59 59 92.5 137.83Q914-571.34 914-480q0 91-34.08 169.99-34.09 78.98-92.52 137.41-58.43 58.43-137.41 92.52Q571-46 480-46Zm-63-371v-497h126v497H417Z"/>
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

		cursor: cancel;

		--led-color: var(--play-led-not-ready);

		background: color-mix(in srgb, var(--play-button), var(--led-color) 60%);
		color: var(--play-icon);

		transition: background 0.15s linear;

		display: flex;
		align-items: center;
		justify-content: center;
	}

	:scope.ready {
		--led-color: var(--play-led-ready);
	}

	:scope:disabled {
		--led-color: var(--play-button);
	}
`;

export let GameView: Component<{ preinit: Delegate<void> }> = function (cx) {
	this.preinit.listen(async () => {
		await preInit();
	})

	return (
		<div>
			<div class="screen">
				<canvas id="canvas" class="canvas" />
			</div>
			<div class="buttons">
				<PlayButton />
			</div>
		</div>
	)
}
GameView.style = css`
	:scope {
		width: 100%;
		height: 100%;
		background: var(--monitor-bg);

		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
	}

	.screen {
		background: #000;
		flex: 1;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		border-radius: 4px;
		overflow: hidden;
	}
	canvas {
		height: min(calc(calc(100vw - 2rem) * 9 / 16), calc(100vh - 6rem));
		aspect-ratio: 16 / 9;
	}

	.buttons {
		height: 3rem;
		display: flex;
		flex-direction: row-reverse;
	}
`;
