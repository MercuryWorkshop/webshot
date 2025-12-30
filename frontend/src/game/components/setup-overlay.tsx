import { Component, css } from "dreamland/core";
import { InsertDiskScreen, WelcomeScreen, NameEntryScreen, CopyingScreen } from "./setup-screens";

export type SetupStep = "none" | "welcome" | "insert-disk" | "copying" | "name";

export let SetupOverlay: Component<{ step: SetupStep, progress: number, patching: boolean, currentFile: string, onWelcomeNext: () => void, onNameNext: () => void }> = function () {
	return (
		<div class="setup-overlay">
			{use(this.step).map(s => s === "welcome").andThen(<WelcomeScreen next={this.onWelcomeNext} />)}
			{use(this.step).map(s => s === "insert-disk").andThen(<InsertDiskScreen />)}
			{use(this.step).map(s => s === "copying").andThen(<CopyingScreen progress={use(this.progress)} patching={use(this.patching)} currentFile={use(this.currentFile)} />)}
			{use(this.step).map(s => s === "name").andThen(<NameEntryScreen next={this.onNameNext} />)}
		</div>
	)
}

SetupOverlay.style = css`
	:scope {
		position: absolute;
		inset: 0;
		background: #000;
		color: var(--oneshot);
		font-size: 1.25rem;
		display: flex;
		z-index: 10;
	}
`;
