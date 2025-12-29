import { Component, createDelegate, css } from "dreamland/core";
import { GameView } from "./game";

let App: Component = function () {
	let preinit = createDelegate<void>();
	preinit();

	return (
		<div id="app">
			<GameView preinit={preinit} />
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
`;

document.querySelector("#app")?.replaceWith(<App />);
