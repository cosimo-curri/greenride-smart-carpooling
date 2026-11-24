import { useState, useEffect, useRef } from "react";
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity, TextInput, Alert, ScrollView, Image } from "react-native";
import { useAssetsContext } from "../contexts/AssetsContext";
import { CommonActions } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import LottieView from "lottie-react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { showAlert } from "../utils/showAlert";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { LinearGradient } from "expo-linear-gradient";
import * as Sharing from "expo-sharing";
import { Calendar } from "react-native-calendars";

import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

import helpers from "../utils/helpers";
import apiManager from "../utils/apiManager";

import Fonts from "../theme/fonts";
import FontSizes from "../theme/fontSizes";
import Colors from "../theme/colors";

import Header from "../components/Header";
import ScreenTitle from "../components/ScreenTitle";
import BottomNavigationBar from "../components/BottomNavigationBar";
import GreenRideButton from "../components/GreenRideButton";
import PulsingBrain from "../animations/PulsingBrain";
import Offer from "../components/Offer";

function HomeScreen({ navigation, route }) {
    const { globalAssets } = useAssetsContext();

    const lottieRef = useRef(null);
    const [audioPermissionGranted, setAudioPermissionGranted] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingAudio, setRecordingAudio] = useState(null);

    const [user, setUser] = useState(null); //message, employee, token
    const [selectedIndex, setSelectedIndex] = useState(0);
    
    const [transcription, setTranscription] = useState(null);
    const [loadingLLM, setLoadingLLM] = useState(false);

    const [selfCertificationFiles, setSelfCertificationFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const [hasNewNotifications, setHasNewNotifications] = useState(false);

    const [allOffers, setAllOffers] = useState(null);
    const [offers, setOffers] = useState([]);
    const [personalOffers, setPersonalOffers] = useState([]);
    const [acceptedOffers, setAcceptedOffers] = useState([]);
    const [pendingOffers, setPendingOffers] = useState([]);
    const [rejectedOffers, setRejectedOffers] = useState([]);

    const [markedDates, setMarkedDates] = useState({});
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedDayOffers, setSelectedDayOffers] = useState([]);
    const [relevantSortingOffers, setRelevantSortingOffers] = useState([]);
    const [departureTypeApi, setDepartureTypeApi] = useState(null);

    const [greenInfo, setGreenInfo] = useState(null);

    const loadUser = async () => {
        const userJsonString = await SecureStore.getItemAsync("user");
        const userJson = JSON.parse(userJsonString);

        const savedNotificationsString = await SecureStore.getItemAsync("notifications");
        const savedNotifications = savedNotificationsString ? JSON.parse(savedNotificationsString) : [];

        const result = await apiManager.methods.get(
            apiManager.tokenApi.getChangableValuesByEmployeeId,
            {
                token: userJson.token,
                employeeid: userJson.employee._id
            }
        );

        if(result.success) {
            const data = result.data;
            
            switch(data.message) {
                case "TOKEN_EMPLOYEE_NOT_PROVIDED":
                case "CANNOT_VERIFY_TOKEN_EMPLOYEE":
                case "NO_EMPLOYEE_ACCOUNT":
                case "EMPLOYEE_NOT_LOGGED":
                case "GET_CHANGABLE_VALUES_BY_EMPLOYEE_ID_ERROR":
                default:
                    await SecureStore.deleteItemAsync("user");
                    await SecureStore.deleteItemAsync("notifications");

                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "Error" }]
                        })
                    );

                    break;
                
                case "GET_CHANGABLE_VALUES_BY_EMPLOYEE_ID_OK":
                    setAllOffers(data.offers);

                    setGreenInfo(data.greenInfo);

                    userJson.employee.greenPoints = data.greenPoints;
                    
                    const incomingNotifications = data.notifications;

                    const newNotifications = incomingNotifications.filter(incoming => {
                        return !savedNotifications.some(saved => saved._id === incoming._id);
                    });

                    const enrichedNotifications = incomingNotifications.map(n => ({
                        ...n,
                        isNew: newNotifications.some(newN => newN._id === n._id)
                    }));

                    await SecureStore.setItemAsync("notifications", JSON.stringify(enrichedNotifications));

                    userJson.employee.notifications = enrichedNotifications;

                    setHasNewNotifications(userJson.employee.notifications.some(n => n.isNew));

                    await SecureStore.setItemAsync("user", JSON.stringify(userJson));
                    setUser(userJson);

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

    const handleLogout = async () => {
        const result = await apiManager.methods.get(apiManager.api.logout, {
            employeeid: user.employee._id,
            token: user.token
        });

        if(result.success) {
            const data = result.data;

            switch(data.message) {
                case "EMPLOYEE_ID_NOT_PROVIDED":
                default:
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "Error" }]
                        })
                    );

                    break;
                
                case "EMPLOYEE_LOGOUT_OK":
                    await SecureStore.deleteItemAsync("user");
                    await SecureStore.deleteItemAsync("notifications");

                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "Splash" }]
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

    const getAudioRecorder = async () => {
        const { status } = await Audio.requestPermissionsAsync();
        
        if(status !== "granted")
            return;

        setAudioPermissionGranted(true);
    }

    const startRecording = async () => {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
            );

            setRecordingAudio(recording);
        } catch(_) {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Error" }]
                })
            );
        }
    };

    const stopRecording = async () => {
        try {
            await recordingAudio.stopAndUnloadAsync();
            const uri = recordingAudio.getURI();
            
            setRecordingAudio(null);

            const audioBase64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64
            });

            const result = await apiManager.methods.post(
                apiManager.tokenApi.transcribeAudio,
                {
                    audioBase64: audioBase64
                },
                {
                    token: user.token
                }
            );

            if(result.success) {
                const data = result.data;

                switch(data.message) {
                    case "TOKEN_EMPLOYEE_NOT_PROVIDED":
                    case "CANNOT_VERIFY_TOKEN_EMPLOYEE":
                    case "NO_EMPLOYEE_ACCOUNT":
                    case "EMPLOYEE_NOT_LOGGED":
                    default:
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: "Error" }]
                            })
                        );

                        break;
                    
                    case "TRANSCRIBE_AUDIO_ERROR":
                        showAlert(
                            "Alert",
                            null,
                            "Oops, an unexpected error occurred!",
                            null,
                            null,
                            null
                        );

                        break;
                    
                    case "TRANSCRIBE_AUDIO_OK":
                        setTranscription(data.text.charAt(0).toUpperCase() + data.text.slice(1));
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
        } catch(_) {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Error" }]
                })
            );
        }
    };

    const handleLottie = async () => {
        if(isRecording) {
            lottieRef.current?.reset();
            await stopRecording();
        } else {
            lottieRef.current?.play();
            await startRecording();
        }

        setIsRecording(!isRecording);
    }

    const handleResetPrompt = () => {
        setTranscription(null);
    }

    const handleSendLLM = async () => {
        setLoadingLLM(true);

        const result = await apiManager.methods.post(
            apiManager.tokenApi.sendLLM,
            {
                prompt: transcription
            },
            {
                token: user.token
            }
        );

        setLoadingLLM(false);

        if(result.success) {
            const data = result.data;

            if(data.message) {
                switch(data.message) {
                    case "TOKEN_EMPLOYEE_NOT_PROVIDED":
                    case "CANNOT_VERIFY_TOKEN_EMPLOYEE":
                    case "NO_EMPLOYEE_ACCOUNT":
                    case "EMPLOYEE_NOT_LOGGED":
                    case "SEND_LLM_ERROR":
                    default:
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: "Error" }]
                            })
                        );

                        break;
                    
                    case "SEND_LLM_NO_CLASSIFICATION_ERROR":
                        showAlert("Alert", null, "Oops, it seems like your audio is neither offering nor requesting a ride!", null, null, null);
                        break;
                    
                    case "MISSING_DEPARTURE_DATE":
                        showAlert("Alert", null, "Oops, the departure date is missing!", null, null, null);
                        break;
                    
                    case "MISSING_DEPARTURE_TIME":
                        showAlert("Alert", null, "Oops, the departure time is missing!", null, null, null);
                        break;
                    
                    case "MISSING_DEPARTURE_DATE_TIME":
                        showAlert("Alert", null, "Oops, the departure date and time are missing!", null, null, null);
                        break;
                    
                    case "SEND_LLM_NEW_OFFER_OK":
                        setPersonalOffers(prevArray => [...prevArray, data.offer]);
                        setTranscription("");
                        showAlert("Alert", null, "Woohoo! Your carpooling offer has been registered successfully!", null, null, null);
                        break;
                    
                    case "SEND_LLM_NO_OFFERS_FOUND":
                        setTranscription("");
                        showAlert("Alert", null, "Oops, no offers found!", null, null, null);
                        break;
                    
                    case "SEND_LLM_OFFERS_OK":
                        setTranscription("");
                        showAlert("Alert", null, "Woohoo! AI did the cooking and served up the best deals, piping hot and neatly sorted from most to least relevant!", null, null, null);
                        
                        const contentSorting = data.data.contentSorting;

                        const offerIds = new Set(offers.map(offer => offer._id));
                        const filteredContentSorting = contentSorting.filter(item => offerIds.has(item._id));

                        setDepartureTypeApi(data.data.departureType);
                        setRelevantSortingOffers(filteredContentSorting);
                        
                        break;
                }
            }

            if(data.messages)
                showAlert("Alert", null, helpers.buildMissingString(data.messages), null, null, null);
        } else {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Error" }]
                })
            );
        }
    }

    const handleSelfCertificationFilePickerClick = () => {
        if(selfCertificationFiles.length === 3) {
            showAlert(
                "Alert",
                null,
                "Oopsie daisy! You've hit the magic max of 3 files - no more uploads for now!",
                null,
                null,
                null
            );
        } else {
            Alert.alert(
                "Snap or pick?",
                "It's up to you!",
                [
                    {
                        text: "Choose a file",
                        onPress: chooseFile
                    },
                    {
                        text: "Take a photo or video",
                        onPress: takePhotoVideo
                    },
                    {
                        text: "Pick from gallery",
                        onPress: pickFromGallery
                    },
                    {
                        text: "Cancel",
                        style: "cancel"
                    }
                ],
                { cancelable: true }
            );
        }
    }

    const chooseFile = async () => {
        try {
            setIsUploading(true);

            const result = await DocumentPicker.getDocumentAsync({
                multiple: true,
                type: "*/*"
            });

            if(!result.canceled) {
                const files = result.assets.map((file) => ({
                    uri: file.uri,
                    name: file.name,
                    type: file.mimeType || "application/octet-stream"
                }));

                appendFilesToState(files);
            }

            setIsUploading(false);
        } catch(error) {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Error" }]
                })
            );
        }
    };

    const takePhotoVideo = async () => {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            
            if(permission.granted) {
                setIsUploading(true);

                const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ["images", "videos"],
                    quality: 1
                });

                if(!result.canceled) {
                    const extension = result.assets[0].type === "video" ? ".mp4" : ".jpg";

                    const files = [{
                        uri: result.assets[0].uri,
                        name: `media_${Date.now()}${extension}`,
                        type: result.assets[0].type === "video" ? "video/mp4" : "image/jpeg"
                    }];

                    appendFilesToState(files);
                }

                setIsUploading(false);
            }
        } catch(error) {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Error" }]
                })
            );
        }
    };

    const pickFromGallery = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if(permission.granted) {
                setIsUploading(true);

                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ["images", "videos"],
                    allowsMultipleSelection: true,
                    quality: 1
                });

                if(!result.canceled) {
                    const files = result.assets.map((asset) => {
                        const extension = asset.type === "video" ? ".mp4" : ".jpg";

                        return {
                            uri: asset.uri,
                            name: `media_${Date.now()}${extension}`,
                            type: asset.type === "video" ? "video/mp4" : "image/jpeg"
                        };
                    });

                    appendFilesToState(files);
                }

                setIsUploading(false);
            }
        } catch(error) {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Error" }]
                })
            );
        }
    };

    const appendFilesToState = (newFiles) => {
        setSelfCertificationFiles((prevFiles) => [...prevFiles, ...newFiles]);
    };

    const sendFilesSelfCertification = async () => {
        const result = await apiManager.methods.uploadFiles(
            apiManager.api.uploadSelfcertifications,
            selfCertificationFiles,
            {
                employeeid: user.employee._id,
                token: user.token
            }
        );

        if(result.success) {
            const data = result.data;

            switch(data.message) {
                case "NO_FILES_UPLOADED":
                case "UPLOAD_SELFCERTIFICATIONS_ERROR":
                case "EXT_NOT_SUPPORTED":
                case "MIME_TYPE_NOT_SUPPORTED":
                default:
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "Error" }]
                        })
                    );

                    break;
                
                case "UPLOAD_SELFCERTIFICATIONS_OK":
                    setSelfCertificationFiles([]);

                    showAlert(
                        "Alert",
                        null,
                        "Autocertification files? Uploaded like a charm! Now it's time to kick back and wait for the company's call.",
                        null,
                        null,
                        null
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

    const handleClickGiftLink = async (url) => {
        try {
            const filename = "gift.pdf";
            const localUri = FileSystem.cacheDirectory + filename;

            const response = await fetch(url, {
                headers: {
                    token: user.token,
                }
            });

            if(!response.ok) {
                showAlert(
                    "Alert",
                    null,
                    "Oops, an unexpected error occurred!",
                    null,
                    null,
                    null
                );
            }

            const blob = await response.blob();

            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onerror = reject;

                reader.onload = () => {
                    const dataUrl = reader.result;
                    const base64Data = dataUrl.split(",")[1];
                    resolve(base64Data);
                };
                
                reader.readAsDataURL(blob);
            });

            await FileSystem.writeAsStringAsync(localUri, base64, {
                encoding: FileSystem.EncodingType.Base64
            });

            await Sharing.shareAsync(localUri);
        } catch(_) {
            showAlert(
                "Alert",
                null,
                "Oops, an unexpected error occurred!",
                null,
                null,
                null
            );
        }
    }

    const handleDayPress = (dayClicked) => {
        const [year, month, day] = dayClicked.dateString.split("-");
        const date = `${day}/${month}/${year}`;

        setSelectedDay(date);

        const filteredDayOffers = offers
        .filter(offer => offer.departureDate === date)
        .sort((a, b) => {
            const dateA = new Date(`1970-01-01T${a.departureTime}:00`);
            const dateB = new Date(`1970-01-01T${b.departureTime}:00`);
            return dateA - dateB;
        });
        
        setSelectedDayOffers(filteredDayOffers);
    }

    const handleWorthIt = () => {
        
        showAlert("Alert", null, `We've carpooled a total of ${greenInfo.totalDistance.toFixed(2)} km and saved around ${greenInfo.totalSavedCO2.toFixed(2)} kg of CO₂ so far!`, null, null, null);
    }

    useEffect(() => {
        if(offers.length > 0) {
            const markedDates = {};

            offers.forEach(offer => {
                const [day, month, year] = offer.departureDate.split("/");
                const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

                if(!markedDates[formattedDate]) {
                    markedDates[formattedDate] = {
                        marked: true,
                        dotColor: "red"
                    };
                }
            });

            setMarkedDates(markedDates);
        }
    }, [offers]);

    useEffect(() => {
        if(user && allOffers) {
            const tempOffers = [];
            const tempPersonalOffers = [];
            const tempAccepted = [];
            const tempPending = [];
            const tempRejected = [];

            allOffers.forEach(offer => {
                const { pendingRequests = [] } = offer;

                if(offer.employee._id === user.employee._id) {
                    tempPersonalOffers.push(offer);
                    return;
                }

                const matchingRequest = pendingRequests.find(
                    req => req.employeeRequestId === user.employee._id
                );

                if(!matchingRequest) {
                    tempOffers.push(offer);
                } else {
                    if(matchingRequest.status === "accepted")
                        tempAccepted.push(offer);
                    else if(matchingRequest.status === "pending")
                        tempPending.push(offer);
                    else if(matchingRequest.status === "rejected")
                        tempRejected.push(offer);
                }
            });

            setOffers(tempOffers);
            setPersonalOffers(tempPersonalOffers);
            setAcceptedOffers(tempAccepted);
            setPendingOffers(tempPending);
            setRejectedOffers(tempRejected);
        }
    }, [user, allOffers]);

    useEffect(() => {
        loadUser();
        getAudioRecorder();

        if(route.params && route.params.offerIdPendingRequest)
            showAlert("Alert", null, "Woohoo! Your request is in, now let's sit tight and wait for the seller's green light!", null, null, null);
    }, []);

    return (
        <View style={ styles.container }>
            <Header
                logo={ globalAssets.logo.localUri }
                stories={ false }
                noBoxShadow={ (user && audioPermissionGranted) ? false : true }
                hamburgerData={[
                    {
                        text: "Activity",
                        handle: () => navigation.navigate("Activity", {
                            user: user,
                            personalOffers: personalOffers,
                            acceptedOffers: acceptedOffers,
                            pendingOffers: pendingOffers,
                            rejectedOffers: rejectedOffers
                        })
                    },
                    {
                        text: "Ranking",
                        handle: () => navigation.navigate("Ranking", {
                            user: user
                        })
                    },
                    {
                        text: "Worth it?",
                        handle: handleWorthIt
                    },
                    {
                        text: "Logout",
                        handle: handleLogout
                    }
                ]}
            />
            
            {
                user && audioPermissionGranted
                ?
                <>
                    <ScreenTitle
                        title={ user.employee.username }
                        imageUri={ globalAssets.user.localUri }
                        text={ user.employee.greenPoints + " " + (user.employee.greenPoints === 1 ? "GreenPoint" : "GreenPoints") }
                        up={ true }
                        backgroundColor={ Colors.backgroundGreenColor }
                        titleColor={ Colors.secondary }
                        textColor={ Colors.black }
                    />

                    {
                        <KeyboardAwareScrollView
                            style={ styles.containerIndex }
                            contentContainerStyle={{ flexGrow: 1 }}
                            enableOnAndroid={ true }
                            keyboardShouldPersistTaps="handled"
                            keyboardOpeningTime={ Number.MAX_SAFE_INTEGER }
                            enableResetScrollToCoords={ false }
                            scrollEnabled={ (selectedIndex === 0 && transcription) ? true : false }
                        >
                            {
                                selectedIndex === 0
                                ?
                                <>
                                    <Text style={ styles.sectionTitle }>
                                        {
                                            relevantSortingOffers.length > 0
                                            ?
                                            relevantSortingOffers[0].departureDate
                                            :
                                            "Hop in or pick 'em up?"
                                        }
                                    </Text>
                                    
                                    {
                                        relevantSortingOffers.length > 0
                                        ?
                                        <>
                                            <TouchableOpacity
                                                activeOpacity={ 0.5 }
                                                style={{ alignItems: "center" }}
                                                onPress={() => {
                                                    setTranscription("");
                                                    setRelevantSortingOffers([]);
                                                }}
                                            >
                                                <Text style={ styles.textGoBackCalendar }>Go Back</Text>
                                            </TouchableOpacity>

                                            <View style={ styles.offersDayBox }>
                                                <ScrollView style={ styles.scrollViewRelevantSortingOffers }>
                                                    {
                                                        relevantSortingOffers.map((relevantSortingOffer, index) => {
                                                            const isFirst = index === 0;

                                                            return (
                                                                <Offer
                                                                    key={ relevantSortingOffer._id }
                                                                    style={{ marginTop: isFirst ? 0 : 20 }}
                                                                    globalAssets={ globalAssets }
                                                                    username={ relevantSortingOffer.employee.username }
                                                                    time={ relevantSortingOffer.departureTime }
                                                                    freeSeats={ relevantSortingOffer.freeSeats }
                                                                    intermediateStops={ relevantSortingOffer.intermediateStops }
                                                                    reason={ relevantSortingOffer.reason }
                                                                    navigation={ navigation }
                                                                    user={ user }
                                                                    offer={ relevantSortingOffer }
                                                                    departureType={ departureTypeApi }
                                                                />
                                                            );
                                                        })
                                                    }
                                                </ScrollView>

                                                <LinearGradient
                                                    colors={["rgba(255, 255 ,255, 0)", "rgba(255, 255, 255, 1)"]}
                                                    style={ styles.linearGradient }
                                                />
                                            </View>
                                        </>
                                        :
                                        transcription
                                        ?
                                        <View style={ styles.inputContainer }>
                                            {
                                                loadingLLM
                                                ?
                                                <PulsingBrain
                                                    brain={ globalAssets.brain.localUri }
                                                />
                                                :
                                                <>
                                                    <TextInput
                                                        style={ styles.input }
                                                        multiline={ true }
                                                        placeholder="Write your prompt here..."
                                                        value={ transcription }
                                                        onChangeText={ setTranscription }
                                                        textContentType="none"
                                                        returnKeyType="done"
                                                        submitBehavior="blurAndSubmit"
                                                    />

                                                    <View style={ styles.buttonPromptContainer }>
                                                        <GreenRideButton
                                                            style={ styles.buttonPrompt }
                                                            onPress={ handleSendLLM }
                                                            text="Do the thing"
                                                        />

                                                        <GreenRideButton
                                                            style={ styles.buttonPrompt }
                                                            onPress={ handleResetPrompt }
                                                            text="Reset"
                                                        />
                                                    </View>
                                                </>
                                            }
                                        </View>
                                        :
                                        <View style={ styles.lottieContainer }>
                                            <TouchableOpacity
                                                activeOpacity={ 1 }
                                                onPress={ handleLottie }
                                            >
                                                <LottieView
                                                    source={ require("../animations/mic_animation.json") }
                                                    ref={ lottieRef }
                                                    loop
                                                    style={ styles.lottieImage }
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    }
                                </>
                                :
                                selectedIndex === 1
                                ?
                                <>
                                    <Text style={ styles.sectionTitle }>No ride? No problem!</Text>

                                    <Text style={ styles.sectionHint }>Prove your eco-ride! Upload a bus ticket, bike snap, or anything green, just enough to impress your GreenRide admin (and keep it privacy-friendly!)</Text>

                                    <>
                                        <TouchableOpacity
                                            style={ styles.selfcertificationContainer }
                                            activeOpacity={ 0.5 }
                                            onPress={ handleSelfCertificationFilePickerClick }
                                            disabled={ isUploading }
                                        >
                                            {
                                                isUploading
                                                ?
                                                <ActivityIndicator size="large" color={ Colors.secondary } />
                                                :
                                                <Text style={ styles.selectFilesText }>Drop in a file (or a bunch!) to show off your planet-friendly powers!</Text>
                                            }
                                        </TouchableOpacity>
                                        
                                        {
                                            selfCertificationFiles.length > 0
                                            &&
                                            <View style={ styles.buttonPromptContainer }>
                                                <GreenRideButton
                                                    style={ styles.buttonPrompt }
                                                    onPress={ sendFilesSelfCertification }
                                                    text={ `Send ${selfCertificationFiles.length} file${selfCertificationFiles.length === 1 ? "" : "s"}` }
                                                />

                                                <GreenRideButton
                                                    style={ styles.buttonPrompt }
                                                    onPress={() => setSelfCertificationFiles([])}
                                                    text="Reset"
                                                />
                                            </View>
                                        }
                                    </>
                                </>
                                :
                                selectedIndex === 2
                                ?
                                (
                                    selectedDayOffers.length > 0
                                    ?
                                    <View style={ styles.offersDayBox }>
                                        <Text style={ styles.sectionTitle }>{ selectedDay }</Text>

                                        <TouchableOpacity
                                            activeOpacity={ 0.5 }
                                            style={{ alignItems: "center" }}
                                            onPress={() => {
                                                setSelectedDay("");
                                                setSelectedDayOffers([]);
                                            }}
                                        >
                                            <Text style={ styles.textGoBackCalendar }>Go Back</Text>
                                        </TouchableOpacity>

                                        <ScrollView style={ styles.scrollViewDayOffers }>
                                            {
                                                selectedDayOffers.map((selectedDayOffer, index) => {
                                                    const isFirst = index === 0;

                                                    return (
                                                        <Offer
                                                            key={ selectedDayOffer._id }
                                                            style={{ marginTop: isFirst ? 0 : 20 }}
                                                            globalAssets={ globalAssets }
                                                            username={ selectedDayOffer.employee.username }
                                                            time={ selectedDayOffer.departureTime }
                                                            freeSeats={ selectedDayOffer.freeSeats }
                                                            intermediateStops={ selectedDayOffer.intermediateStops }
                                                            navigation={ navigation }
                                                            user={ user }
                                                            offer={ selectedDayOffer }
                                                        />
                                                    );
                                                })
                                            }
                                        </ScrollView>

                                        <LinearGradient
                                            colors={["rgba(255, 255 ,255, 0)", "rgba(255, 255, 255, 1)"]}
                                            style={ styles.linearGradient }
                                        />
                                    </View>
                                    :
                                    <View style={ styles.calendarBox }>
                                        <Calendar
                                            renderArrow={(direction) => (
                                                <Text style={{ fontSize: 20, fontWeight: "bold", color: Colors.secondary }}>
                                                    {
                                                        direction === "left"
                                                        ?
                                                        "←"
                                                        :
                                                        "→"
                                                    }
                                                </Text>
                                            )}
                                            theme={{
                                                textDayFontFamily: Fonts.light,
                                                textMonthFontFamily: Fonts.light,
                                                textDayHeaderFontFamily: Fonts.bold,
                                                todayTextColor: Colors.secondary,
                                                todayBackgroundColor: Colors.backgroundGreenColor
                                            }}
                                            markedDates={ markedDates }
                                            onDayPress={ handleDayPress }
                                        />
                                    </View>
                                )
                                :
                                <View style={{ flex: 1, position: "relative" }}>
                                    <Text style={ styles.sectionTitle }>Notifications</Text>

                                    <ScrollView style={ styles.scrollViewNotifications }>
                                        {
                                            user.employee.notifications.length > 0
                                            ?
                                            user.employee.notifications.map((notification, index) => {
                                                const date = new Date(notification.createdAt);

                                                const isFirst = index === 0;

                                                const formattedDate = new Intl.DateTimeFormat("it-IT", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                }).format(date);

                                                return (
                                                    <View
                                                        key={ notification._id }
                                                        style={[styles.notificationBox, {
                                                            marginTop: isFirst ? 0 : 20
                                                        }]}
                                                    >
                                                        {
                                                            notification.isNew
                                                            &&
                                                            <Image
                                                                source={{ uri: globalAssets.circle.localUri }}
                                                                style={ styles.newNotificationCircle }
                                                            />
                                                        }

                                                        <Text style={ styles.notificationTitle }>{ notification.title }</Text>
                                                        
                                                        {
                                                            notification.message.startsWith("http")
                                                            ?
                                                            <TouchableOpacity
                                                                activeOpacity={ 0.5 }
                                                                onPress={() => handleClickGiftLink(notification.message)}
                                                            >
                                                                <Text style={ styles.notificationMessageLink }>{ notification.message }</Text>
                                                            </TouchableOpacity>
                                                            :
                                                            <Text style={ styles.notificationMessage }>{ notification.message }</Text>
                                                        }

                                                        <Text style={ styles.notificationCreatedAt }>{ formattedDate }</Text>
                                                    </View>
                                                );
                                            })
                                            :
                                            <Text style={{ fontFamily: Fonts.light, fontWeight: "300", textAlign: "center" }}>Nothing to see here!</Text>
                                        }
                                    </ScrollView>

                                    <LinearGradient
                                        colors={["rgba(255, 255 ,255, 0)", "rgba(255, 255, 255, 1)"]}
                                        style={ styles.linearGradient }
                                    />
                                </View>
                            }

                            <BottomNavigationBar
                                globalAssets={ globalAssets }
                                selectedIndex={ selectedIndex }
                                setSelectedIndex={ setSelectedIndex }
                                hasNewNotifications={ hasNewNotifications }
                            />
                        </KeyboardAwareScrollView>
                    }
                </>
                :
                <View style={ styles.containerActivityIndicator }>
                    <ActivityIndicator size="large" color={ Colors.black } />
                </View>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white
    },
    containerActivityIndicator: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    containerIndex: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 30,
        paddingBottom: 0
    },
    lottieContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20
    },
    lottieImage: {
        width: 200,
        height: 200
    },
    sectionTitle: {
        textAlign: "center",
        fontFamily: Fonts.bold, fontWeight: "700",
        fontSize: FontSizes.title,
        color: Colors.secondary
    },
    sectionHint: {
        marginTop: 10,
        fontFamily: Fonts.light, fontWeight: "300",
        textAlign: "justify"
    },
    inputContainer: {
        flex: 1,
        marginTop: 20
    },
    input: {
        fontFamily: Fonts.light, fontWeight: "300",
        fontSize: FontSizes.normal,
        borderWidth: 1,
        borderColor: Colors.gray,
        padding: 10,
        borderRadius: 5,
        flex: 1
    },
    buttonPromptContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10
    },
    buttonPrompt: {
        marginTop: 20,
        flex: 1
    },
    selfcertificationContainer: {
        flex: 1,
        marginTop: 20,
        borderWidth: 2,
        borderColor: Colors.secondary,
        borderStyle: "dashed",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        padding: 50
    },
    selectFilesText: {
        fontFamily: Fonts.light, fontWeight: "300",
        fontSize: FontSizes.label,
        color: Colors.secondary,
        textAlign: "center"
    },
    scrollViewNotifications: {
        height: 0,
        marginTop: 20
    },
    linearGradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 20
    },
    notificationBox: {
        backgroundColor: Colors.backgroundGreenColor,
        padding: 10,
        borderRadius: 10
    },
    notificationTitle: {
        fontFamily: Fonts.bold, fontWeight: "700"
    },
    notificationMessage: {
        fontFamily: Fonts.light, fontWeight: "300"
    },
    notificationMessageLink: {
        fontFamily: Fonts.light, fontWeight: "300",
        textDecorationLine: "underline",
        color: Colors.secondary
    },
    notificationCreatedAt: {
        fontFamily: Fonts.light, fontWeight: "300",
        marginTop: 10,
        textAlign: "right"
    },
    newNotificationCircle: {
        position: "absolute",
        top: 10,
        right: 10,
        width: 10,
        height: 10
    },
    calendarBox: {
        flex: 1,
        justifyContent: "center"
    },
    offersDayBox: {
        flex: 1
    },
    textGoBackCalendar: {
        textAlign: "center",
        fontFamily: Fonts.bold, fontWeight: "700",
        fontSize: FontSizes.normal,
        borderBottomWidth: 3
    },
    scrollViewDayOffers: {
        height: 0,
        marginTop: 20
    },
    scrollViewRelevantSortingOffers: {
        height: 0,
        marginTop: 20
    }
});

export default HomeScreen;