import { Component, css, Delegate } from "dreamland/core";
import { gameState, patch, preInit, run } from "./dotnet";
import { copyGame, wasGameCopied, wasPatched, setSourceFolder, hasSourceFolder, getSourceFolder, verifyGameFolder } from "./fs";
import { StickyNote } from "../splash";
import { settings } from "../store";

type SetupStep = "none" | "no-disk" | "welcome" | "name" | "copying";

let NoBootableDevice: Component = function () {
	return (
		<div>
			<div>No bootable device found</div>
			<div>Please insert World Machine OS disk.</div>
			<div>You can obtain the disk through <a href="https://store.steampowered.com/app/2915460/OneShot_World_Machine_Edition/" target="_blank">your local Valve Software location.</a></div>
		</div>
	)
}

let WelcomeScreen: Component<{ next: () => void }> = function () {
	return (
		<div>
			<div>Welcome to World Machine</div>
			<button on:click={this.next}>Continue</button>
		</div>
	)
}

let NameEntryScreen: Component<{ next: () => void }, { nameInput: string }> = function () {
	this.nameInput = "";

	let submit = () => {
		if (this.nameInput.trim()) {
			settings.name = this.nameInput.trim();
			this.next();
		}
	};

	return (
		<div>
			<div>Enter the name of this machine's owner:</div>
			<input 
				placeholder="Your name..." 
				value={use(this.nameInput)}
				on:keydown={(e: KeyboardEvent) => e.key === "Enter" && submit()}
			/>
			<button on:click={submit} disabled={use(this.nameInput).map(n => !n.trim())}>
				Continue
			</button>
		</div>
	)
}

let CopyingScreen: Component<{ progress: number, patching: boolean }> = function () {
	return (
		<div class="copying-overlay">
			<div>Installing World Machine</div>
			<div class="progress">
				<div class="progress-inner">
					<div class="bar" class:patching={use(this.patching)} style={{ "--progress": use(this.progress) }} />
				</div>
			</div>
			<div class="tiny">Do not close the tab</div>
		</div>
	)
}

let SetupOverlay: Component<{ step: SetupStep, progress: number, patching: boolean, onWelcomeNext: () => void, onNameNext: () => void }> = function () {
	return (
		<div class="setup-overlay">
			{use(this.step).map(s => s === "no-disk").andThen(<NoBootableDevice />)}
			{use(this.step).map(s => s === "welcome").andThen(<WelcomeScreen next={this.onWelcomeNext} />)}
			{use(this.step).map(s => s === "name").andThen(<NameEntryScreen next={this.onNameNext} />)}
			{use(this.step).map(s => s === "copying").andThen(<CopyingScreen progress={use(this.progress)} patching={use(this.patching)} />)}
		</div>
	)
}
SetupOverlay.style = css`
	:scope {
		background: #000;
		color: var(--oneshot);
		width: 100%;
		height: 100%;
		padding: 1rem;
		font-size: 1.25rem;
	}
`;

let PlayButton: Component<{ onPower: () => void }> = function () {
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

let CopyAssetsSlot: Component<{ insertDisk: () => void }> = function () {
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

let StickyNoteWidget: Component<{}, { expanded: boolean }> = function () {
	this.expanded = false;

	let handleNoteClick = (e: Event) => {
		if (this.expanded) {
			e.stopPropagation();
		} else {
			this.expanded = true;
		}
	};

	return (
		<div class:expanded={use(this.expanded)}>
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
		backdrop-filter: blur(10px);
		background: rgba(0, 0, 0, 0.3);
	}

	.sticky-note {
		position: fixed;
		bottom: 1rem;
		left: 18rem;
		width: 30rem;
		height: 30rem;
		cursor: pointer;
		transform: rotate(-2deg) translateY(calc(100% - 3.5rem));
		transform-origin: top right;
		transition: transform 0.4s, bottom 0.4s, right 0.4s;
		z-index: 100;
	}

	:scope:hover:not(.expanded) .sticky-note {
		transform: rotate(0deg) translateY(calc(100% - 5rem));
	}

	.sticky-note > * {
		width: 100%;
		height: 100%;
	}

	:scope.expanded .sticky-note {
		bottom: 50%;
		right: 50%;
		transform: rotate(0deg) translate(50%, 50%);
	}
`;

export let GameView: Component<{ preinit: Delegate<void> }, { setupStep: SetupStep, copyProgress: number, patching: boolean }> = function () {
	this.preinit.listen(async () => {
		await preInit();
	})
	this.setupStep = "none";
	this.copyProgress = 0;
	this.patching = false;

	let insertDisk = async () => {
		let folder = await showDirectoryPicker();
		if (!await verifyGameFolder(folder)) {
			alert("Invalid game folder");
			return;
		}
		setSourceFolder(folder);
	};

	let handlePower = async () => {
		// If already set up, just run
		if (gameState.assetsReady && settings.name) {
			run();
			return;
		}

		// No disk inserted
		if (!hasSourceFolder()) {
			this.setupStep = "no-disk";
			return;
		}

		// Start setup flow
		this.setupStep = "welcome";
	};

	let onWelcomeNext = () => {
		this.setupStep = "name";
	};

	let onNameNext = async () => {
		this.setupStep = "copying";
		this.copyProgress = 0;

		let folder = getSourceFolder()!;
		try {
			await copyGame(folder, x => this.copyProgress = x);
		} catch (err) {
			alert("There was an error while copying: " + (err as any).message);
			this.setupStep = "none";
			return;
		}

		this.patching = true;
		this.copyProgress = 0;
		await patch();

		gameState.assetsReady = await wasGameCopied() && await wasPatched();

		this.patching = false;
		this.setupStep = "none";

		// Start the game after setup completes
		run();
	};

	return (
		<div>
			<div class="screen">
				{use(this.setupStep).map(s => s !== "none").andThen(
					<SetupOverlay 
						step={use(this.setupStep)} 
						progress={use(this.copyProgress)} 
						patching={use(this.patching)}
						onWelcomeNext={onWelcomeNext}
						onNameNext={onNameNext}
					/>
				)}
				<div class="canvas-wrapper" on:contextmenu={(e: Event) => e.preventDefault()}>
					<canvas id="canvas" class="canvas" />
				</div>
			</div>
			<div class="buttons">
				<CopyAssetsSlot insertDisk={insertDisk} />
				<StickyNoteWidget />
				<div class="expand" />
				<PlayButton onPower={handlePower} />
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
		/* cursor: none; */
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
