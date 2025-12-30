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
	},
	GetLanguage() {
		console.debug("[Steamworks] GetLanguage");

		// thank you ELON MUSK for helping fix this code, god bless grok!!
		const languageMap: Record<string, string> = {
			"zh-CN": "schinese",
			"zh-SG": "schinese",
			"zh-TW": "tchinese",
			"zh-HK": "tchinese",
			"pt-BR": "brazilian",
			"pt-PT": "portuguese",
			"es-419": "latam",
			"es-ES": "spanish",
			"de": "german",
			"fr": "french",
			"it": "italian",
			"ja": "japanese",
			"ko": "korean",
			"ru": "russian",
		};

		return languageMap[navigator.language] || languageMap[navigator.language.split("-")[0]] || "english";
	}
};
