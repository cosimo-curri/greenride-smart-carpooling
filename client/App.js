import { useState, useEffect } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Asset } from "expo-asset";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AssetsContext } from "./contexts/AssetsContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import { Root as PopupRootProvider } from "@sekizlipenguen/react-native-popup-confirm-toast";

import Colors from "./theme/colors";

import SplashScreen from "./screens/SplashScreen";
import SignUpScreen from "./screens/SignUpScreen";
import PrivacyPolicyScreen from "./screens/PrivacyPolicyScreen";
import ErrorScreen from "./screens/ErrorScreen";
import SignInScreen from "./screens/SignInScreen";
import HomeScreen from "./screens/HomeScreen";
import MapOfferScreen from "./screens/MapOfferScreen";
import ActivityScreen from "./screens/ActivityScreen";
import RankingScreen from "./screens/RankingScreen";

const Stack = createNativeStackNavigator();

const assetsLoader = [
	require("./assets/images/logo-white.png"),
	require("./assets/images/logo-green.png")
];

configureReanimatedLogger({
  	level: ReanimatedLogLevel.warn,
  	strict: false
});

function App() {
	const [loadedAssets, setLoadedAssets] = useState([]);
	const [globalAssets, setGlobalAssets] = useState({});

	
	const loadAssets = async () => {
		//await new Promise(resolve => setTimeout(resolve, 1000));

		const assets = await Promise.all(assetsLoader.map(asset => Asset.loadAsync(asset)));
		setLoadedAssets(assets.flat());
	}

	useEffect(() => {
		loadAssets();
	}, []);

	return (
		<PopupRootProvider>
			<SafeAreaProvider>
				<AssetsContext.Provider value={{ globalAssets, setGlobalAssets }}>
					{
						(loadedAssets.length === assetsLoader.length)
						?
						<NavigationContainer>
							<Stack.Navigator
								initialRouteName="Splash"
								screenOptions={{
									headerShown: false,
									gestureEnabled: true
								}}
							>
								<Stack.Screen
									name="Splash"
									component={ SplashScreen }
									initialParams={{ loadedAssets }}
									options={{
										animation: "fade"
									}}
								/>

								<Stack.Screen
									name="SignUp"
									component={ SignUpScreen }
									options={{
										animation: "fade"
									}}
								/>

								<Stack.Screen
									name="PrivacyPolicy"
									component={ PrivacyPolicyScreen }
									options={{
										animation: "slide_from_right"
									}}
								/>

								<Stack.Screen
									name="Error"
									component={ ErrorScreen }
									options={{
										animation: "fade"
									}}
								/>

								<Stack.Screen
									name="SignIn"
									component={ SignInScreen }
									options={{
										animation: "slide_from_right"
									}}
								/>

								<Stack.Screen
									name="Home"
									component={ HomeScreen }
									options={{
										animation: "fade"
									}}
								/>

								<Stack.Screen
									name="MapOffer"
									component={ MapOfferScreen }
									options={{
										animation: "slide_from_right"
									}}
								/>

								<Stack.Screen
									name="Activity"
									component={ ActivityScreen }
									options={{
										animation: "slide_from_right"
									}}
								/>

								<Stack.Screen
									name="Ranking"
									component={ RankingScreen }
									options={{
										animation: "slide_from_right"
									}}
								/>
							</Stack.Navigator>
						</NavigationContainer>
						:
						<View style={ styles.container }>
							<ActivityIndicator size="large" color={ Colors.black } />
						</View>
					}

					<StatusBar style="auto" />
				</AssetsContext.Provider>
			</SafeAreaProvider>
		</PopupRootProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "white"
	}
});

export default App;