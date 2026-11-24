import { useEffect } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    useAnimatedReaction,
    runOnJS
} from "react-native-reanimated";
import { Asset } from "expo-asset";
import { useAssetsContext } from "../contexts/AssetsContext";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";

import apiManager from "../utils/apiManager";

import Colors from "../theme/colors";

const { width, height } = Dimensions.get("window");
const fullDiameter = Math.sqrt(width * width + height * height);
const finalLogoSize = fullDiameter * 0.1;

//ALL THE ASSETS FOR ALL THE OTHER SCREENS
const globalAssetsLoader = {
	logo: require("../assets/images/logo-green.png"),
    user1: require("../assets/images/user1.png"),
    user2: require("../assets/images/user2.png"),
    user3: require("../assets/images/user3.png"),
    user4: require("../assets/images/user4.png"),
    checked: require("../assets/images/checked.png"),
    unchecked: require("../assets/images/unchecked.png"),
    shield: require("../assets/images/shield.png"),
    error: require("../assets/images/error.gif"),
    signin: require("../assets/images/signin.png"),
    user: require("../assets/images/user.png"),
    brain: require("../assets/images/brain.png"),
    selfcertification: require("../assets/images/selfcertification.png"),
    bell: require("../assets/images/bell.png"),
    circle: require("../assets/images/circle.png"),
    calendar: require("../assets/images/calendar.png"),
    clock: require("../assets/images/clock.png"),
    car: require("../assets/images/car.png"),
    hand: require("../assets/images/hand.png"),
    map: require("../assets/images/map.png"),
    firstPlace: require("../assets/images/firstPlace.png"),
    secondPlace: require("../assets/images/secondPlace.png"),
    thirdPlace: require("../assets/images/thirdPlace.png"),
    eye: require("../assets/images/eye.png"),
    eyeSlash: require("../assets/images/eye_slash.png")
};

const remoteAssetsToPreload = apiManager.info.promotionalStoriesEnabled ? [
    {
        key: "user1_story1",
        url: apiManager.remoteAssets.user1_story1
    },
    {
        key: "user1_story2",
        url: apiManager.remoteAssets.user1_story2
    },
    {
        key: "user1_story3",
        url: apiManager.remoteAssets.user1_story3
    },
    {
        key: "user2_story1",
        url: apiManager.remoteAssets.user2_story1
    },
    {
        key: "user2_story2",
        url: apiManager.remoteAssets.user2_story2
    },
    {
        key: "user3_story1",
        url: apiManager.remoteAssets.user3_story1
    },
    {
        key: "user3_story2",
        url: apiManager.remoteAssets.user3_story2
    },
    {
        key: "user4_story1",
        url: apiManager.remoteAssets.user4_story1
    }
] : [];

function SplashScreen({ navigation, route }) {
    const { loadedAssets } = route.params;
    const { setGlobalAssets } = useAssetsContext();

    const loadGlobalAssets = async () => {
        const entries = Object.entries(globalAssetsLoader);

        const loadedGlobalAssetsArrays = await Promise.all(
            entries.map(([_, asset]) => Asset.loadAsync(asset))
        );

        const loadedGlobalAssets = loadedGlobalAssetsArrays.flat();

        const loadedGlobalAssetsMap = entries.reduce((acc, [key], index) => {
            acc[key] = loadedGlobalAssets[index];
            return acc;
        }, {});

        const remoteAssets = await Promise.all(
            remoteAssetsToPreload.map(({ url }) => Asset.fromURI(url).downloadAsync())
        );

        remoteAssets.forEach((asset, index) => {
            const key = remoteAssetsToPreload[index].key;
            loadedGlobalAssetsMap[key] = asset;
        });

        setGlobalAssets(loadedGlobalAssetsMap);
    }

    const diameter = useSharedValue(fullDiameter);
    const newImageSize = useSharedValue(0);
    const secondImageAnimatedStarted = useSharedValue(false);

    const greenCircleAnimatedStyle = useAnimatedStyle(() => ({
        width: diameter.value,
        height: diameter.value,
        borderRadius: diameter.value / 2,
    }));

    const imageLogoAnimatedStyle = useAnimatedStyle(() => ({
        width: diameter.value * 0.1,
        height: diameter.value * 0.1,
    }));

    const newImageAnimatedStyle = useAnimatedStyle(() => {
        const size = newImageSize.value;

        return {
            width: size,
            height: size,
            top: "50%",
            left: "50%",
            position: "absolute",
            transform: [
                { translateX: -size / 2 },
                { translateY: -size / 2 }
            ]
        };
    });

    useAnimatedReaction(
        () => diameter.value,
        (currentDiameter) => {
            if(currentDiameter <= 200 && !secondImageAnimatedStarted.value) {
                secondImageAnimatedStarted.value = true;
                runOnJS(startSecondImageAnimation)();
            }
        }
    );

    //IMPORTANT THAT IS function INSTEAD OF const ...
    function startSecondImageAnimation() {
        newImageSize.value = withTiming(
            finalLogoSize,
            { duration: 500 },
            (isFinished) => {
                if(isFinished)
                    runOnJS(onSplashAnimationComplete)();
            }
        );
    }

    const onSplashAnimationComplete = () => {
        setTimeout(async () => {
            const user = await SecureStore.getItemAsync("user");

            if(!user) {
                navigation.replace("SignUp");
                return;
            }

            const biometricAuth = await LocalAuthentication.authenticateAsync({
                promptMessage: "Prove you're you to get in!",
                fallbackLabel: "Go ahead, use the code!"
            });

            if(biometricAuth.success)
                navigation.replace("Home");
            else
                navigation.replace("Error");
        }, 1000);
    };

    useEffect(() => {
        loadGlobalAssets();

        const timeout = setTimeout(() => {
            diameter.value = withTiming(0, { duration: 1000 });
        }, 1000);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <View style={ styles.container }>
            <Animated.View style={[ styles.greenCircle, greenCircleAnimatedStyle ]}>
                <Animated.Image
                    source={{ uri: loadedAssets[0].localUri }}
                    style={[imageLogoAnimatedStyle]}
                />
            </Animated.View>

            <Animated.Image
                source={{ uri: loadedAssets[1].localUri }}
                style={newImageAnimatedStyle}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white"
    },
    greenCircle: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primary
    }
});

export default SplashScreen;