import { LANGUAGE_TO_FLAG } from "../constants/index.js";

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

const countryCodeToEmoji = (code) => {
  if (!code) return "🌍";

  return code
    .toUpperCase()
    .split("")
    .map(char => String.fromCodePoint(127397 + char.charCodeAt()))
    .join("");
};

// ✅ MAIN FUNCTION
export const getLanguageFlag = (language) => {
  if (!language) return "🌍";

  const code = LANGUAGE_TO_FLAG[language.toLowerCase()];

  return countryCodeToEmoji(code);
};