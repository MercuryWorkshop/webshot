import { Component, css } from "dreamland/core";
import { Header, GenericFooter, CopyFooter } from "./common";
import { settings } from "../../store";

export let InsertDiskScreen: Component = function () {
	return (
		<div class="setup-screen">
			<Header text="World Machine Setup" />
			<div class="setup-content">
				<p>Please insert the World Machine OS disk into Drive A:</p>
			</div>
			<GenericFooter status="Waiting for disk" />
		</div>
	)
}

InsertDiskScreen.style = css`
	p {
		max-width: 15rem;
		text-align: center;
	}

	.setup-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
`

export let WelcomeScreen: Component<{ next: () => void }> = function () {
	return (
		<div class="setup-screen">
			<Header text="World Machine Setup" />
			<div class="setup-content">
			<b>Welcome to Setup.</b>
			<p>The Setup program for the TWM Labs World Machine operating system prepares World Machine to run on your computer.</p>
			<ul>
			<li>To learn more about Setup before continuing, refer to the attached notes.</li>
			<li>To set up World Machine now, click the Continue button.</li>
			<li>To quit Setup without installing World Machine, press Ctrl+W.</li>
			</ul>
			<br />
			<button class="setup-button" on:click={this.next}>Continue</button>
			</div>
			<GenericFooter status="Ctrl+W=Exit" />
		</div>
	)
}

export let NameEntryScreen: Component<{ next: () => void }, { nameInput: string }> = function () {
	this.nameInput = "";

	let submit = () => {
		if (this.nameInput.trim()) {
			settings.name = this.nameInput.trim();
			this.next();
		}

		// surface sticky note control
		document.querySelector("#sticky-note-widget")?.classList.add("hint");
		setTimeout(() => {
			document.querySelector("#sticky-note-widget")?.classList.remove("hint");
		}, 1400);
	};

	return (
		<div class="setup-screen">
			<Header text="World Machine Setup" />
			<div class="setup-content">
			<b>Owner Registration</b>
			<br />
			<p>Enter the first name of this machine's owner:</p>
			<input 
				class="name-input"
				placeholder="Your name..." 
				value={use(this.nameInput)}
				on:keydown={(e: KeyboardEvent) => e.key === "Enter" && submit()}
			/>
			<br /><br />
			<button class="setup-button" on:click={submit} disabled={use(this.nameInput).map(n => !n.trim())}>
				Continue
			</button>
			</div>
			<GenericFooter status="" />
		</div>
	)
}

export let CopyingScreen: Component<{ progress: number, patching: boolean, currentFile: string }> = function () {
	return (
		<div class="setup-screen">
			<Header text="World Machine Setup" />
			<div class="setup-content">
				<div class="inner-content">
				<p>Please wait while Setup copies files to the World Machine installation folders.<br />Please do not exit this screen until the process is complete.</p>
				<br />
				<div class="box">
					{use(this.patching).andThen((
					<p>Preparing...</p>
					), (
					<>
						<span>Setup is copying files...</span>
						<p>{use(this.progress).map(p => Math.floor(p * 100))}%</p>
						<div class="progress-bar">
							<div class="progress-fill" style={{ width: use`calc(${this.progress}*100%)` }}></div>
						</div>
					</>
					))}
				</div>
				</div>
			</div>
			{/* @ts-ignore works well enough 👍 */}
			{use(this.patching).andThen(<CopyFooter status="Applying patches..." />, <CopyFooter status={use`Copying: ${this.currentFile}`} />)}
		</div>
	)
}

CopyingScreen.style = css`
	p {
		text-align: center;
		margin: .5rem;
	}
	.setup-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}
	.inner-content {
		max-width: 40rem;
	}

	.box {
		border: 4px double var(--oneshot);
		padding: 1rem;
	}

	.progress-bar {
		width: 100%;
		height: 2rem;
		border: 2px solid var(--oneshot);
		background: #000;
		margin-top: 0.25rem;

		display: flex;
		align-items: center;
		justify-content: flex-start;
	}

	.progress-fill {
		height: 100%;
		background: var(--oneshot);
	}
`
