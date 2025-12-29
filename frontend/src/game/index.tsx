import { Component, css, Delegate } from "dreamland/core";
import { gameState, patch, preInit, run } from "./dotnet";
import { copyGame, wasGameCopied, wasPatched } from "./fs";
import { StickyNoteMinimal } from "../splash";

let PlayButton: Component = function () {
	return (
		<button on:click={run} disabled={use(gameState.playing)} class:ready={use(gameState.ready, gameState.assetsReady).map(([a, b]) => a && b)}>
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

let CopyAssetsSlot: Component<{ copy: () => void }> = function () {
	return (
		<button on:click={this.copy} disabled={use(gameState.playing)}>
			World Machine OS
			<div class="led" class:blinking={use(gameState.assetsReady).map(x => !x)} />
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

let StickyNoteButton: Component<{ open: () => void }> = function () {
	return (
		<div>
			<button on:click={this.open}>
				<StickyNoteMinimal />
			</button>
		</div>
	)
}
StickyNoteButton.style = css`
	:scope {
		align-self: flex-end;
		height: 2.25rem;
		transform: rotate(-3deg);

		transition: height 0.2s linear;
	}
	button {
		padding: 0;
		border: none;
		background: none;
		height: 6rem;
	}

	:scope:has(> button:hover) {
		height: 3rem;
	}
`;

export let GameView: Component<{ preinit: Delegate<void>, showSplash: boolean, }, { settingUp: boolean, copyProgress: number, patching: boolean }> = function () {
	this.preinit.listen(async () => {
		await preInit();
	})
	this.settingUp = false;
	this.copyProgress = 0;
	this.patching = false;

	let copy = async () => {
		let folder = await showDirectoryPicker();

		this.settingUp = true;
		try {
			await copyGame(folder, x => this.copyProgress = x);
		} catch (err) {
			alert("There was an error while bootstrapping: " + (err as any).message);
		}

		this.patching = true;
		this.copyProgress = 0;
		await patch();

		gameState.assetsReady = await wasGameCopied() && await wasPatched();

		this.settingUp = false;
		this.patching = false;
	};

	return (
		<div>
			<div class="screen">
				<div class="canvas-wrapper" on:contextmenu={(e: Event) => e.preventDefault()}>
					{use(this.settingUp).andThen(
						<div class="copying-overlay">
							<div>MACHINE BOOTSTRAPPING</div>
							<div class="progress">
								<div class="progress-inner">
									<div class="bar" class:patching={use(this.patching)} style={{ "--progress": use(this.copyProgress) }} />
								</div>
							</div>
							<div class="tiny">Do not close the tab</div>
						</div>
					)}
					<canvas id="canvas" class="canvas" />
				</div>
			</div>
			<div class="buttons">
				<CopyAssetsSlot copy={copy} />
				<StickyNoteButton open={() =>this.showSplash = true}/>
				<div class="expand" />
				<PlayButton />
			</div>
		</div>
	)
}
GameView.style = css`
	:scope {
		width: 100%;
		height: 100%;
		overflow: hidden;
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
	.canvas-wrapper {
		--height: min(calc(calc(100vw - 2rem) * 9 / 16), calc(100vh - 6rem));
		--width: calc(var(--height) * 16 / 9);
		height: var(--height);
		aspect-ratio: 16 / 9;
		cursor: none;
		position: relative;
	}
	.canvas-wrapper > * {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.copying-overlay {
		display: flex;
		flex-direction: column;
		gap: calc(var(--height) * 0.02);
		align-items: center;
		justify-content: center;

		color: var(--oneshot);
		font-size: calc(var(--height) * 0.07);
	}
	.copying-overlay .progress {
		border: calc(var(--height) * 0.01) solid var(--oneshot);
		width: calc(var(--width) * 0.5);
		height: calc(var(--height) * 0.1);
		padding: calc(var(--height) * 0.0075);
	}

	.copying-overlay .progress-inner {
		width: 100%;
		height: 100%;

		position: relative;
		overflow: hidden;
	}
	.copying-overlay .bar {
		background: var(--oneshot);
		width: calc(100% * var(--progress));
		height: 100%;
	}
	.copying-overlay .bar.patching {
		position: absolute;
		width: 40%;
		animation: 3s linear progress-indeterminate infinite;
	}
	.copying-overlay .tiny {
		font-size: calc(var(--height) * 0.03);
	}

	.buttons {
		height: 3rem;
		display: flex;
		gap: 2rem;
	}

	.expand { flex: 1; }

	@keyframes progress-indeterminate {
		0% { left: -40%; }
		100% { left: 100%; }
	}
`;
