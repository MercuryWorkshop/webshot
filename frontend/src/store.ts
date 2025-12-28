import { createStore, Stateful } from "dreamland/core";

export let settings: Stateful<{
	name: string
}> = createStore({
	name: "Toshit",
}, { backing: "localstorage", autosave: "auto", ident: "oneshot-wasm" })
