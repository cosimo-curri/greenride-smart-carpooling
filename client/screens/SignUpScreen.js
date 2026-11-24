import { useState, useEffect, useRef } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { useAssetsContext } from "../contexts/AssetsContext";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { SPSheet } from "@sekizlipenguen/react-native-popup-confirm-toast";
import { showAlert } from "../utils/showAlert";
import { CommonActions } from "@react-navigation/native";

import apiManager from "../utils/apiManager";

import Colors from "../theme/colors";

import Header from "../components/Header";

function SignUpScreen({ navigation }) {
    const { globalAssets } = useAssetsContext();

    const mapRef = useRef(null);

    const [locationPermissionGranted, setLocationPermittionGranted] = useState(false);
    const [location, setLocation] = useState(null);

    const [mapAnimationDone, setMapAnimationDone] = useState(false);
    const [markerVisible, setMarkerVisible] = useState(false);

    const [fetchSuccess, setFetchSuccess] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [nextClicked, setNextClicked] = useState(false);

    //SIGN-UP VALUES
    const [defaultFreeSeats, setDefaultFreeSeats] = useState("");
    const [password, setPassword] = useState("");
    const [_, setPasswordConfirm] = useState("");
    const [pin, setPin] = useState(null);

    const getLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if(status !== "granted")
            return;

        setLocationPermittionGranted(true);

        const loc = await Location.getCurrentPositionAsync({});

        const region = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
        };

        setLocation(region);

        setTimeout(() => {
            if(mapRef.current) {
                setTimeout(() => {
                    mapRef.current.animateToRegion(region, 1000);
                }, 500);

                setTimeout(() => {
                    setMapAnimationDone(true);

                    showAlert(
                        "BottomSheetSignUp",
                        "Want to share a ride?",
                        "Check the stories, then pick a nearby meeting point (not your home!) on the map and spot your green company.\nBut first, just two details!",
                        handleNextFirstData,
                        globalAssets,
                        navigation
                    );
                }, 2000);
            }
        }, 500);
    };

    const getAllCompanies = async () => {
        const result = await apiManager.methods.get(apiManager.api.getAllCompanies);

        setFetchSuccess(result.success);

        if(result.success) {
            const data = result.data;

            switch(data.message) {
                case "GET_ALL_COMPANIES_ERROR":
                default:
                    setFetchSuccess(false);
                    break;
                
                case "GET_ALL_COMPANIES_OK":
                    setFetchSuccess(true);
                    setCompanies(data.companies);

                    break;
            }
        } else {
            showAlert(
                "Alert",
                null,
                "Oops, network hiccup!",
                null,
                null,
                null
            );
        }
    }

    const handleSetPin = (coords) => {
        setPin(coords);
    };

    const handleNextFirstData = (values, animations) => {
        const defaultFreeSeats = values.defaultFreeSeats;
        const password = values.password;
        const passwordConfirm = values.passwordConfirm;
        
        let validate = true;

        if(
            defaultFreeSeats === "" ||
            Number(defaultFreeSeats) === 0 ||
            Number(defaultFreeSeats) > 8
        ) {
            animations.startShakeNumeric();
            validate = false;
        }

        if(!(
            password !== "" &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[^A-Za-z0-9]/.test(password) &&
            password.length >= 8 &&
            password === passwordConfirm
        )) {
            animations.startShakePassword();
            validate = false;
        }

        if(validate) {
            setDefaultFreeSeats(defaultFreeSeats);
            setPassword(password);
            setPasswordConfirm(passwordConfirm);

            SPSheet.hide();
        }
    }

    const handleNextMap = () => {
        SPSheet.hide();
        setNextClicked(true);
    }

    const handleSignUp = async (companyId) => {
        SPSheet.hide();

        const result = await apiManager.methods.post(apiManager.api.signup, {
            defaultFreeSeats: defaultFreeSeats,
            companyId: companyId,
            pin: {
                type: "Point",
                coordinates: [pin.longitude, pin.latitude]
            },
            password: password
        });

        if(result.success) {
            const data = result.data;

            switch(data.message) {
                case "WEAK_PASSWORD":
                case "EMPLOYEE_SIGNUP_ERROR":
                case "ValidationError":
                case "MongoServerError":
                case "UserExistsError":
                default:
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "Error" }]
                        })
                    );

                    break;
                
                case "EMPLOYEE_SIGNUP_OK":
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{
                                name: "SignIn",
                                params: {
                                    usernameSignUp: data.username
                                }
                            }]
                        })
                    );

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

    useEffect(() => {
        getLocation();
        getAllCompanies();
    }, []);

    useEffect(() => {
        setMarkerVisible(true);

        if(pin)
            showAlert(
                "BottomSheetNext",
                null,
                null,
                handleNextMap,
                null,
                null
            );
    }, [pin]);

    useEffect(() => {
        if(nextClicked && companies.length > 0 && mapRef.current) {
            const coords = companies.map(company => ({
                latitude: company.headquartersCoordinates.coordinates[1],
                longitude: company.headquartersCoordinates.coordinates[0]
            }));

            mapRef.current.fitToCoordinates(coords, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true
            });
        }
    }, [nextClicked, companies, mapRef]);

    return (
        <View style={ styles.container }>
            <Header
                logo={ globalAssets.logo.localUri }
                stories={ apiManager.info.promotionalStoriesEnabled }
                userImages={[
                    globalAssets.user1.localUri,
                    globalAssets.user2.localUri,
                    globalAssets.user3.localUri,
                    globalAssets.user4.localUri
                ]}
                remoteAssets={apiManager.info.promotionalStoriesEnabled ? [
                    globalAssets.user1_story1.localUri,
                    globalAssets.user1_story2.localUri,
                    globalAssets.user1_story3.localUri,
                    globalAssets.user2_story1.localUri,
                    globalAssets.user2_story2.localUri,
                    globalAssets.user3_story1.localUri,
                    globalAssets.user3_story2.localUri,
                    globalAssets.user4_story1.localUri
                ] : []}
            />

            <View style={ styles.mapContainer }>
                {
                    (locationPermissionGranted && location && fetchSuccess && companies.length > 0)
                    ?
                    <>
                        <MapView
                            ref={ mapRef }
                            style={ styles.map }
                            showsUserLocation={ true }
                            onPress={(event) => {
                                if(mapAnimationDone && !nextClicked) {
                                    const coords = event.nativeEvent.coordinate;
                                    handleSetPin(coords);
                                }
                            }}
                        >
                            {
                                markerVisible && !nextClicked
                                &&
                                <Marker
                                    coordinate={ pin }
                                />
                            }

                            {
                                companies.map(company => (
                                    <Marker
                                        key={ company._id }
                                        coordinate={{
                                            latitude: company.headquartersCoordinates.coordinates[1],
                                            longitude: company.headquartersCoordinates.coordinates[0]
                                        }}
                                        onPress={() => {
                                            showAlert(
                                                "BottomSheetCompany",
                                                company.name,
                                                `${company.headquartersCoordinates.coordinates[1]}, ${company.headquartersCoordinates.coordinates[0]}`,
                                                () => handleSignUp(company._id),
                                                globalAssets,
                                                navigation
                                            );
                                        }}
                                    />
                                ))
                            }
                        </MapView>
                    </>
                    :
                    <ActivityIndicator size="large" color={ Colors.black } />
                }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: Colors.white
    },
    mapContainer: {
        flex: 1,
        width: "100%",
        justifyContent: "center"
    },
    map: {
        flex: 1
    }
});

export default SignUpScreen;