import { Platform } from "react-native";

// Native system fonts require no proprietary font files in the repository.
const systemFont = Platform.select({ ios: "System", android: "sans-serif", default: "sans-serif" });
const Fonts = { light: systemFont, bold: systemFont };
export default Fonts;
