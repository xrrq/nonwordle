import en from "./i18n/en.ts"
import ja from "./i18n/ja.ts"

// available languages
const languages = { en, ja }

let selectedLanguage

for (const tag of navigator.languages) {
	const language = tag.split("-")[0]!
	const found = languages[language as keyof typeof languages]

	if (found != null) {
		selectedLanguage = found
		break
	}
}

selectedLanguage ??= languages.en

const [
	notEnoughLetters,
	notInWordList,
	messages,
	copied,
	howToPlay,
	description1,
	description2,
	examples,
	exampleDescriptions
] = selectedLanguage

export {
	copied,
	description1,
	description2,
	exampleDescriptions,
	examples,
	howToPlay,
	messages,
	notEnoughLetters,
	notInWordList
}
