import { Component, createDelegate, css } from "dreamland/core";
import { GameView } from "./game";
import { StickyNote } from "./splash";
import { settings } from "./store";

let App: Component<{}, { showSplash: boolean }> = function () {
	let preinit = createDelegate<void>();

	let firstSplash = true;

	let init = () => {
		if (firstSplash) preinit();
		firstSplash = false;
		this.showSplash = false;
	};

	this.showSplash = settings.name === "";
	if (!this.showSplash) init();

	return (
		<div id="app">
			{use(this.showSplash).andThen(
				<div class="splash">
					<StickyNote done={init} />
				</div>
			)}
			<GameView preinit={preinit} showSplash={use(this.showSplash)} />;
		</div>
	)
}
App.style = css`
	:scope {
		width: 100%;
		height: 100%;

		position: relative;
		overflow: hidden;
	}

	.splash {
		position: absolute;
		z-index: 100;
		inset: 0;

		backdrop-filter: blur(10px);

		display: flex;
		align-items: center;
		justify-content: center;
	}
`;

document.querySelector("#app")?.replaceWith(<App />);
