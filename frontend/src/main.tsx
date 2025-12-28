import { createDelegate } from "dreamland/core";
import { GameView } from "./game";
import { patch } from "./game/dotnet";
import { copyGame, wasPatched, wasGameCopied } from "./game/fs";

let hasGame = await wasGameCopied();
console.log("has game", hasGame);

let hasPatch = await wasPatched();
console.log("has patch", hasPatch);

if (!hasGame) {
	await new Promise<void>(r => {
		let handler = async () => {
			let dir = await showDirectoryPicker();

			await copyGame(dir, x => console.log("copy percent:", x));

			r();
			window.removeEventListener("click", handler);
		};
		window.addEventListener("click", handler);
	});
}

if (!hasPatch) {
	await patch();
}

let preinit = createDelegate<void>();
let canvas = <GameView preinit={preinit} />;
document.querySelector("#app")?.replaceWith(canvas);

preinit();
