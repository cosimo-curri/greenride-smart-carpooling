import { useState, useRef } from "react";
import { Animated, StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { SPSheet } from "@sekizlipenguen/react-native-popup-confirm-toast";
import { CommonActions } from "@react-navigation/native";

import Fonts from "../theme/fonts";
import FontSizes from "../theme/fontSizes";
import Colors from "../theme/colors";

import NumericInput from "./NumericInput";
import GreenRideButton from "./GreenRideButton";
import Checkbox from "./Checkbox";

import useShakeAnimation from "../animations/useShakeAnimation";

function CustomBottomSheet({ type, title, message, handle, globalAssets, navigation }) {
    const {
        shakeAnim: shakePasswordAnim,
        startShake: startShakePassword
    } = useShakeAnimation();

    const {
        shakeAnim: shakeNumericAnim,
        startShake: startShakeNumeric
    } = useShakeAnimation();

    const {
        shakeAnim: shakeCheckboxAnim,
        startShake: startShakeCheckbox
    } = useShakeAnimation();

    //BottomSheetSignUp
    const [defaultFreeSeats, setDefaultFreeSeats] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const passwordRef = useRef();
    const passwordConfirmRef = useRef();

    const [showPasswordSignUp, setShowPasswordSignUp] = useState(false);

    //BottomSheetCompany
    const [checked, setChecked] = useState(false);

    const handleClickHypertext = () => {
        navigation.navigate("PrivacyPolicy");
        SPSheet.hide();
    }

    const handleOpenSignIn = () => {
        SPSheet.hide();

        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: "SignIn" }]
            })
        );
    }

    const handleShowPasswordSignUp = () => {
        setShowPasswordSignUp(!showPasswordSignUp);
    }

    return (
        <View style={ styles.container }>
            {
                type === "Alert"
                &&
                <Text style={ styles.text }>{ message }</Text>
            }

            {
                type === "AlertUsername"
                &&
                <Text style={ styles.text }>
                    We care deeply about your privacy - so much that we don't even ask for your e-mail.
                    { "\n" }
                    { "\n" }
                    That means your brand new username, that's <Text style={{ fontFamily: Fonts.bold, fontWeight: "700" }}>{ message }</Text>, and your password are your golden keys.
                    { "\n" }
                    { "\n" }
                    No e-mail, no recovery: lose them, and you'll need to create a new account from scratch!
                </Text>
            }

            {
                type === "BottomSheetSignUp"
                &&
                <>
                    <Text style={ styles.title }>{ title }</Text>

                    <Text style={ styles.text }>{ message }</Text>

                    <Animated.View style={[
                        { transform: [{ translateX: shakeNumericAnim }] }
                    ]}>
                        <NumericInput
                            maxLength={ 1 }
                            value={ defaultFreeSeats }
                            setValue={ setDefaultFreeSeats }
                            returnKeyType="next"
                            onSubmitEditing={() => passwordRef.current.focus()}
                            submitBehavior="submit"
                        />
                    </Animated.View>

                    <Animated.View style={[
                        styles.passwordBox,
                        { transform: [{ translateX: shakePasswordAnim }] }
                    ]}>
                        <View style={{ flex: 1, justifyContent: "center", height: 86 }}>
                            <TextInput
                                style={[styles.input, styles.inputPasswordLeft]}
                                ref={ passwordRef }
                                placeholder="••••••••"
                                secureTextEntry={ !showPasswordSignUp }
                                value={ password }
                                onChangeText={ setPassword }
                                textContentType="password"
                                returnKeyType="next"
                                onSubmitEditing={() => passwordConfirmRef.current.focus()}
                                submitBehavior="submit"
                            />

                            <TouchableOpacity
                                activeOpacity={ 0.5 }
                                style={{ position: "absolute", right: 20 }}
                                onPress={ handleShowPasswordSignUp }
                            >
                                <Image
                                    source={{ uri: showPasswordSignUp ? globalAssets.eyeSlash.localUri : globalAssets.eye.localUri }}
                                    style={{
                                        width: 20,
                                        aspectRatio: 1,
                                        objectFit: "contain"
                                    }}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 1, justifyContent: "center" }}>
                            <TextInput
                                style={[styles.input, styles.inputPasswordRight]}
                                ref={ passwordConfirmRef }
                                placeholder="••••••••"
                                secureTextEntry={ !showPasswordSignUp }
                                value={ passwordConfirm }
                                onChangeText={ setPasswordConfirm }
                                textContentType="password"
                                returnKeyType="done"
                                submitBehavior="blurAndSubmit"
                            />

                            <TouchableOpacity
                                activeOpacity={ 0.5 }
                                style={{ position: "absolute", right: 12 }}
                                onPress={ handleShowPasswordSignUp }
                            >
                                <Image
                                    source={{ uri: showPasswordSignUp ? globalAssets.eyeSlash.localUri : globalAssets.eye.localUri }}
                                    style={{
                                        width: 20,
                                        aspectRatio: 1,
                                        objectFit: "contain"
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                    
                    <TouchableOpacity
                        activeOpacity={ 0.5 }
                        onPress={ handleOpenSignIn }
                    >
                        <Text style={ styles.textSignin }>Have you jumped in yet?</Text>
                    </TouchableOpacity>

                    <GreenRideButton
                        text="Next"
                        onPress={() => handle(
                            {
                                defaultFreeSeats: defaultFreeSeats,
                                password: password,
                                passwordConfirm: passwordConfirm
                            },
                            {
                                startShakePassword: startShakePassword,
                                startShakeNumeric: startShakeNumeric
                            }
                        )}
                    />
                </>
            }

            {
                type === "BottomSheetNext"
                &&
                <GreenRideButton
                    text="Next"
                    onPress={ handle }
                />
            }

            {
                type === "BottomSheetCompany"
                &&
                <>
                    <Text style={[styles.title, { marginBottom: 0 }]}>{ title }</Text>
                    <Text style={[styles.text, { marginBottom: 15 }]}>{ message }</Text>

                    <Animated.View style={[
                        { transform: [{ translateX: shakeCheckboxAnim }] }
                    ]}>
                        <Checkbox
                            text="I agree to the "
                            hypertext="Privacy Policy"
                            style={{ marginBottom: 5 }}
                            imageUncheckedLocalUri={ globalAssets.unchecked.localUri }
                            imageCheckedLocalUri={ globalAssets.checked.localUri }
                            checked={ checked }
                            setChecked={ setChecked }
                            handleClickHypertext={ handleClickHypertext }
                        />
                    </Animated.View>

                    <GreenRideButton
                        text="Sign-up"
                        onPress={() => {
                            if(checked)
                                handle();
                            else
                                startShakeCheckbox();
                        }}
                        style={{ marginTop: 20 }}
                    />
                </>
            }

            {
                type === "BottomSheetDepartureType"
                &&
                <>
                    <Text style={ styles.text }>Pick your launch style!</Text>

                    <View style={ styles.departureTypeButtonsContainer }>
                        <GreenRideButton
                            text="Default"
                            onPress={() => handle(true)}
                            style={{ marginTop: 15, flex: 1 }}
                        />

                        <GreenRideButton
                            text="Personal"
                            onPress={() => handle(false)}
                            style={{ marginTop: 15, flex: 1 }}
                        />
                    </View>
                </>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 30,
        paddingTop: 20,
        paddingBottom: 40
    },
    title: {
        fontFamily: Fonts.bold, fontWeight: "700",
        fontSize: FontSizes.title,
        color: Colors.secondary,
        marginBottom: 15
    },
    text: {
        fontFamily: Fonts.light, fontWeight: "300",
        fontSize: FontSizes.normal
    },
    passwordBox: {
        flexDirection: "row",
        alignItems: "center"
    },
    input: {
        fontFamily: Fonts.light, fontWeight: "300",
        fontSize: FontSizes.normal,
        borderWidth: 1,
        borderColor: Colors.gray,
        padding: 10,
        borderRadius: 5,
        marginVertical: 20,
        flex: 1
    },
    inputPasswordLeft: {
        marginRight: 8
    },
    inputPasswordRight: {
        marginLeft: 8
    },
    textSignin: {
        fontFamily: Fonts.light, fontWeight: "300",
        fontSize: FontSizes.normal,
        marginBottom: 20,
        color: Colors.secondary,
        textDecorationLine: "underline"
    },
    departureTypeButtonsContainer: {
        flexDirection: "row",
        gap: 10
    }
});

export default CustomBottomSheet;