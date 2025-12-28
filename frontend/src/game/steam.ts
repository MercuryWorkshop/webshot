import { settings } from "../store";

export let SteamJS = {
	GetAchievement(achievement: string) {
		console.debug("[Steamworks] GetAchievement", achievement);
		return false;
	},
	SetAchievement(achievement: string) {
		console.debug("[Steamworks] SetAchievement", achievement);
	},
	GetStat(stat: string) {
		console.debug("[Steamworks] GetStat", stat);
		return 0;
	},
	SetStat(stat: string, value: number) {
		console.debug("[Steamworks] SetStat", stat, value);
	},
	GetPersonaName() {
		console.debug("[Steamworks] GetPersonaName");
		return settings.name;
	}
};
