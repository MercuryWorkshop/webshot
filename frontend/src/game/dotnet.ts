import { createState, Stateful } from "dreamland/core";
import { DotnetHostBuilder, MonoConfig } from "./dotnetdefs";
import { SteamJS } from "./steam";

const SEAMLESSCOUNT = 10;

export type Log = { color: string; log: string };
export const gameState: Stateful<{
	ready: boolean;
	initting: boolean;
	playing: boolean;
}> = createState({
	ready: false,
	initting: false,
	playing: false,
});
export const loglisteners: ((log: Log) => void)[] = [];

function proxyConsole(name: string, color: string) {
	// @ts-expect-error ts sucks
	const old = console[name].bind(console);
	// @ts-expect-error ts sucks
	console[name] = (...args) => {
		let str;
		try {
			str = args.join(" ");
		} catch {
			str = "<failed to render>";
		}
		old(...args);
		for (const logger of loglisteners) {
			logger({ color, log: str });
		}
	};
	return old;
}
export const bypassError = proxyConsole("error", "var(--error)");
export const bypassWarn = proxyConsole("warn", "var(--warning)");
export const bypassLog = proxyConsole("log", "var(--fg)");
export const bypassInfo = proxyConsole("info", "var(--info)");
export const bypassDebug = proxyConsole("debug", "var(--fg4)");

let wasm: any;
let dotnet: DotnetHostBuilder;
let exports: any;

function getDlls(): (readonly [string, string])[] {
	const config: MonoConfig = wasm.dotnet.instance.config;
	const resources = [...(config.resources?.coreAssembly || []), ...(config.resources?.assembly || [])];
	return resources
		.map((x) => [x.name, x.virtualPath] as const)
}

export async function preInit() {
	if (gameState.ready) return;

	let url = "../_framework/dotnet.js";
	if (import.meta.env.DEV) {
		url = "/_framework/dotnet.js";
	}

	wasm = await eval(`import("${url}")`);
	dotnet = wasm.dotnet;

	console.debug("initializing dotnet");
	const runtime = await dotnet
		.withConfig({
		})
		.withRuntimeOptions([
			// jit functions quickly and jit more functions
			`--jiterpreter-minimum-trace-hit-count=${500}`,

			// monitor jitted functions for less time
			`--jiterpreter-trace-monitoring-period=${100}`,

			// reject less funcs
			`--jiterpreter-trace-monitoring-max-average-penalty=${150}`,

			// increase jit function limits
			`--jiterpreter-wasm-bytes-limit=${64 * 1024 * 1024}`,
			`--jiterpreter-table-size=${32 * 1024}`,

			// print jit stats
			`--jiterpreter-stats-enabled`,
		])
		.create();

	const config = runtime.getConfig();
	exports = await runtime.getAssemblyExports(config.mainAssemblyName!);

	runtime.setModuleImports("SteamJS", SteamJS);

	(self as any).wasm = {
		Module: runtime.Module,
		// @ts-expect-error
		FS: runtime.Module.FS,
		dotnet,
		runtime,
		config,
		exports,
	};

	const dlls = getDlls();
	const loc = location.pathname;

	await runtime.runMain();
	await exports.OneshotLoader.PreInit(loc, dlls.map((x) => `${x[0]}|${x[1]}`));
	console.debug("dotnet initialized");

	gameState.ready = true;
}

export async function patch() {
	await exports.OneshotPatcher.Patch();
}

export async function run() {
	gameState.playing = true;

	gameState.initting = true;
	console.log("Init...");
	console.time("Init ");
	await exports.OneshotLoader.Init();

	console.timeLog("Init ");

	// run some frames for seamless transition
	for (let i = 0; i < SEAMLESSCOUNT; i++) {
		console.debug(`SeamlessInit${i}...`);
		if (!(await exports.OneshotLoader.RunOneFrame()))
			throw new Error("RunOneFrame() Failed!");
	}
	console.timeEnd("Init ");
	gameState.initting = false;

	await exports.OneshotLoader.MainLoop();

	console.debug("Cleanup...");
	await exports.OneshotLoader.Cleanup();
	gameState.playing = false;
}
