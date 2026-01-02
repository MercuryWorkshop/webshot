import { gameState } from "./dotnet";

export const rootFolder = await navigator.storage.getDirectory();

let sourceFolder: FileSystemDirectoryHandle | null = null;

export function setSourceFolder(folder: FileSystemDirectoryHandle) {
	sourceFolder = folder;
	gameState.diskInserted = true;
}

export function getSourceFolder(): FileSystemDirectoryHandle | null {
	return sourceFolder;
}

export function hasSourceFolder(): boolean {
	return sourceFolder !== null;
}

export async function copyFile(
	file: FileSystemFileHandle,
	to: FileSystemDirectoryHandle
) {
	const data = await file.getFile().then((r) => r.stream());
	const handle = await to.getFileHandle(file.name, { create: true });
	const writable = await handle.createWritable();
	await data.pipeTo(writable);
}

export async function countFolder(folder: FileSystemDirectoryHandle): Promise<number> {
	let count = 0;
	async function countOne(folder: FileSystemDirectoryHandle) {
		for await (const [_, entry] of folder) {
			if (entry.kind === "file") {
				count++;
			} else {
				await countOne(entry);
			}
		}
	}
	await countOne(folder);
	return count;
}

export async function copyFolder(
	folder: FileSystemDirectoryHandle,
	to: FileSystemDirectoryHandle,
	callback?: (name: string) => void
) {
	async function upload(
		from: FileSystemDirectoryHandle,
		to: FileSystemDirectoryHandle
	) {
		for await (const [name, entry] of from) {
			if (entry.kind === "file") {
				await copyFile(entry, to);
				if (callback) callback(name);
			} else {
				const newTo = await to.getDirectoryHandle(name, { create: true });
				await upload(entry, newTo);
			}
		}
	}
	const newFolder = await to.getDirectoryHandle(folder.name, { create: true });
	await upload(folder, newFolder);
}

let GAMEDATA_FOLDERS = ["autotiles", "loc", "maps", "music", "music_effects", "sfx", "tilesets", "twm", "txt"];
let CONTENT_FOLDERS = ["autotiles", "facepics", "fogs", "footprints", "glyphs", "item_icons", "lightmaps", "npc", "panoramas", "partner_logos", "pictures", "shaders", "the_world_machine", "tilesets", "titles", "transitions", "ui"];
export async function verifyGameFolder(folder: FileSystemDirectoryHandle): Promise<boolean> {
	try {

		try {
			console.debug("[verifyGameFolder] verifying OneShotMGMac.dll");
			await folder.getFileHandle("OneShotMGMac.dll");
		} catch {
			console.debug("[verifyGameFoler] Uploaded game is not the Mac version, checking for Windows version");
			console.debug("[verifyGameFolder] verifying OneShotMG.exe");
			await folder.getFileHandle("OneShotMG.exe");
		}

		console.debug("[verifyGameFolder] verifying content");
		let content = await folder.getDirectoryHandle("content");
		console.debug("[verifyGameFolder] verifying gamedata");
		let gamedata = await folder.getDirectoryHandle("gamedata");

		for (let folder of CONTENT_FOLDERS) { console.debug("[verifyGameFolder] verifying content/" + folder); await content.getDirectoryHandle(folder); };
		for (let folder of GAMEDATA_FOLDERS) { console.debug("[verifyGameFolder] verifying gamedata/" + folder); await gamedata.getDirectoryHandle(folder); };

		return true;
	} catch {
		return false;
	}
}

export async function copyGame(folder: FileSystemDirectoryHandle, callback: (percent: number, file: string) => void) {
	if (!await verifyGameFolder(folder)) {
		throw new Error("Invalid game folder");
	}

	let game = await rootFolder.getDirectoryHandle("OneShot", { create: true });
	let content = await folder.getDirectoryHandle("content");
	let gamedata = await folder.getDirectoryHandle("gamedata");

	let current = -1;
	let total = 1 + await countFolder(content) + await countFolder(gamedata);
	let call = (name: string) => { current++; callback(current / total, name) };

	call("");
	
	try {
		await folder.getFileHandle("OneShotMGMac.dll");
		await copyFile(await folder.getFileHandle("OneShotMGMac.dll"), game);
	} catch {
		await copyFile(await folder.getFileHandle("OneShotMG.exe"), game);
	}
	call("OneShotMG");
	await copyFolder(content, game, call);
	await copyFolder(gamedata, game, call);
}

export async function wasGameCopied(): Promise<boolean> {
	let folder;
	try {
		folder = await rootFolder.getDirectoryHandle("OneShot");
	} catch(err) { return false; }
	return await verifyGameFolder(folder);
}
export async function wasPatched(): Promise<boolean> {
	try {
		await rootFolder.getFileHandle("OneShot.dll");
		return true;
	} catch {
		return false;
	}
}

gameState.assetsReady = await wasGameCopied() && await wasPatched();
gameState.diskInserted = gameState.assetsReady;
