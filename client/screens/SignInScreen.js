import { useState, useEffect, useRef } from "react";
import { StyleSheet, View, ScrollView, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { useAssetsContext } from "../contexts/AssetsContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { showAlert } from "../utils/showAlert";
import { CommonActions } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

import apiManager from "../utils/apiManager";

import Fonts from "../theme/fonts";
import FontSizes from "../theme/fontSizes";
import Colors from "../theme/colors";

import Header from "../components/Header";
import ScreenTitle from "../components/ScreenTitle";
import GreenRideButton from "../components/GreenRideButton";

function SignInScreen({ route, navigation }) {
    const { globalAssets } = useAssetsContext();
    const { usernameSignUp } = route.params || {};

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [showPasswordSignIn, setShowPasswordSignIn] = useState(false);

    const passwordRef = useRef();

    const handleSignIn = async () => {
        let notificationToken = null;
        
        if(Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            const finalStatus = existingStatus === "granted" ? "granted" : (await Notifications.requestPermissionsAsync()).status;

            if(finalStatus === "granted") {
                const projectId = Constants.expoConfig.extra.eas.projectId;

                if(projectId) {
                    const tokenData = await Notifications.getExpoPushTokenAsync({
                        projectId: projectId
                    });

                    notificationToken = tokenData.data;
                }
            }
        }
        
        const result = await apiManager.methods.post(apiManager.api.signin, {
            username: username,
            password: password,
            notificationToken: notificationToken
        });

        if(result.success) {
            const data = result.data;

            switch(data.message) {
                case "EMPLOYEE_SIGNIN_ERROR":
                default:
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "Error" }]
                        })
                    );

                    break;
                
                case "EMPLOYEE_SIGNIN_NOT_FOUND":
                    setPassword("");

                    showAlert(
                        "Alert",
                        null,
                        "Oops! We couldn't find you in our secret club.",
                        null,
                        null,
                        null
                    );

                    break;
                
                case "EMPLOYEE_NOT_ACTIVATED":
                    setPassword("");

                    showAlert(
                        "Alert",
                        null,
                        "You can't dive in just yet - your account's still baking in the IT oven!",
                        null,
                        null,
                        null
                    );

                    break;
                
                case "EMPLOYEE_REJECTED":
                    setPassword("");

                    showAlert(
                        "Alert",
                        null,
                        "Unfortunately, the company gave us a friendly \"nope\" on the registration front.",
                        null,
                        null,
                        null
                    );

                    break;
                
                case "EMPLOYEE_SIGNIN_OK":
                    await SecureStore.setItemAsync("user", JSON.stringify(data));
                    navigation.replace("Home");

                    break;
            }
        } else {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Error" }]
                })
            );
        }
    }

    const handleShowPasswordSignIn = () => {
        setShowPasswordSignIn(!showPasswordSignIn);
    }

    useEffect(() => {
        if(usernameSignUp) {
            setUsername(usernameSignUp);

            showAlert(
                "AlertUsername",
                null,
                usernameSignUp,
                null,
                null,
                null
            );
        }
    }, [usernameSignUp]);

    return (
        <View style={ styles.container }>
            <Header
                logo={ globalAssets.logo.localUri }
                stories={ false }
                hamburgerData={[
                    {
                        text: "Start from scratch",
                        handle: () => navigation.navigate("Splash")
                    }
                ]}
            />

            <ScreenTitle
                title="Sign-in"
                imageUri={ globalAssets.signin.localUri }
                text="Hey, glad you made it online!"
                up={ true }
                backgroundColor={ Colors.backgroundGreenColor }
                titleColor={ Colors.secondary }
                textColor={ Colors.black }
            />

            <KeyboardAwareScrollView
                style={ styles.scrollContainer }
                contentContainerStyle={{ flexGrow: 1 }}
                enableOnAndroid={ true }
                extraScrollHeight={ 20 }
                keyboardShouldPersistTaps="handled"
                keyboardOpeningTime={ Number.MAX_SAFE_INTEGER }
                enableResetScrollToCoords={ false }
            >
                <View style={ styles.formContainer }>
                    <Text style={ styles.label }>Username</Text>

                    <TextInput
                        style={ styles.input }
                        value={ username }
                        onChangeText={ setUsername }
                        textContentType="username"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current.focus()}
                        submitBehavior="submit"
                    />

                    <Text style={[ styles.label, {
                        marginTop: 20
                    }]}>
                        Password
                    </Text>

                    <View style={{ justifyContent: "center" }}>
                        <TextInput
                            style={ styles.input }
                            ref={ passwordRef }
                            value={ password }
                            onChangeText={ setPassword }
                            textContentType="password"
                            secureTextEntry={ !showPasswordSignIn }
                            returnKeyType="done"
                            submitBehavior="blurAndSubmit"
                        />

                        <TouchableOpacity
                            activeOpacity={ 0.5 }
                            style={{ position: "absolute", right: 12 }}
                            onPress={ handleShowPasswordSignIn }
                        >
                            <Image
                                source={{ uri: showPasswordSignIn ? globalAssets.eyeSlash.localUri : globalAssets.eye.localUri }}
                                style={{
                                    width: 20,
                                    aspectRatio: 1,
                                    objectFit: "contain"
                                }}
                            />
                        </TouchableOpacity>
                    </View>

                    <GreenRideButton
                        text="Sign-in"
                        onPress={ handleSignIn }
                        style={{ marginTop: 30 }}
                    />
                </View>

                <ScreenTitle
                    title="High-Fives for the Future!"
                    text="Thanks for your support - you're helping shape a brighter, better tomorrow. You rock!"
                    up={ false }
                    backgroundColor={ Colors.secondary }
                    titleColor={ Colors.white }
                    textColor={ Colors.textColorInSecondary }
                />
            </KeyboardAwareScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white
    },
    scrollContainer: {
        flex: 1
    },
    formContainer: {
        padding: 50
    },
    label: {
        fontFamily: Fonts.bold, fontWeight: "700",
        fontSize: FontSizes.label
    },
    input: {
        fontFamily: Fonts.light, fontWeight: "300",
        fontSize: FontSizes.normal,
        borderWidth: 1,
        borderColor: Colors.gray,
        padding: 10,
        borderRadius: 5,
        marginVertical: 5
    }
});

export default SignInScreen;