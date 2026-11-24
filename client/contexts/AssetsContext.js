import { createContext, useContext } from "react";

export const AssetsContext = createContext({
	globalAssets: {},
	setGlobalAssets: () => {}
});

export const useAssetsContext = () => useContext(AssetsContext);