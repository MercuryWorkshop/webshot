import { Component, css, Delegate } from "dreamland/core";
import { gameState, patch, preInit, run } from "./dotnet";
import { copyGame, wasGameCopied, wasPatched, setSourceFolder, getSourceFolder, verifyGameFolder, hasSourceFolder } from "./fs";
import { settings } from "../store";
import { SetupOverlay, type SetupStep } from "./components/setup-overlay";
import { PlayButton, CopyAssetsSlot } from "./components/controls";
import { StickyNoteWidget } from "./components/sticky-note-widget";

export let GameView: Component<{ preinit: Delegate<void> }, { setupStep: SetupStep, copyProgress: number, patching: boolean, currentFile: string }> = function () {
	this.preinit.listen(async () => {
		await preInit();
	})
	this.setupStep = "none";
	this.copyProgress = 0;
	this.patching = false;
	this.currentFile = "";

	let insertDisk = async () => {
		let folder = await showDirectoryPicker();
		if (!await verifyGameFolder(folder)) {
			alert("Invalid game folder");
			return;
		}
		setSourceFolder(folder);

		// If we're waiting for disk insertion, start copying
		if (this.setupStep === "insert-disk") {
			await startCopying();
		}
	};

	let startCopying = async () => {
		this.setupStep = "copying";
		this.copyProgress = 0;
		this.currentFile = "";

		let folder = getSourceFolder()!;
		try {
			await copyGame(folder, (x, file) => { this.copyProgress = x; this.currentFile = file; });
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

	let handlePower = async () => {
		// If already set up, just run
		if (gameState.assetsReady && settings.name) {
			run();
			return;
		}

		// Start setup flow with welcome
		this.setupStep = "welcome";
	};

	let onWelcomeNext = () => {
		this.setupStep = "name";
	};

	let onNameNext = async () => {
		// If disk already inserted, skip to copying
		if (hasSourceFolder()) {
			await startCopying();
		} else {
			this.setupStep = "insert-disk";
		}
	};

	return (
		<div>
			<div class="screen">
				{use(this.setupStep).map(s => s !== "none").andThen(
					<SetupOverlay 
						step={use(this.setupStep)} 
						progress={use(this.copyProgress)} 
						patching={use(this.patching)}
						currentFile={use(this.currentFile)}
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
		position: relative;
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
