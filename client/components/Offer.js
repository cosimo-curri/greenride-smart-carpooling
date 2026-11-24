import { useState, useEffect } from "react";
import { StyleSheet, View, Image, Text, TouchableOpacity } from "react-native";
import StarRating from "react-native-star-rating-widget";
import { CommonActions } from "@react-navigation/native";
import { showAlert } from "../utils/showAlert";
import { Linking } from "react-native";

import apiManager from "../utils/apiManager";
import helpers from "../utils/helpers";

import Colors from "../theme/colors";
import Fonts from "../theme/fonts";

import GreenRideButton from "../components/GreenRideButton";

function Offer(props) {
    const [feedback, setFeedback] = useState(false);
    const [rating, setRating] = useState(3);
    const [loadingLLM, setLoadingLLM] = useState(false);
    const [sortedPendingRequests, setSortedPendingRequests] = useState([]);

    let isNowPast = false;

    if(props.date && props.time) {
        const [day, month, year] = props.date.split("/").map(Number);
        const [hours, minutes] = props.time.split(":").map(Number);
        const offerDate = new Date(year, month - 1, day, hours, minutes);
        isNowPast = new Date() < offerDate;
    }

    const handleSendFeedback = async () => {
        const offerId = props.offer._id;

        const result = await apiManager.methods.post(
            apiManager.tokenApi.sendFeedback,
            {
                offerId: offerId,
                rating: rating
            },
            {
                token: props.user.token
            }
        );

        if(result.success) {
            const data = result.data;

            switch(data.message) {
                case "TOKEN_EMPLOYEE_NOT_PROVIDED":
                case "CANNOT_VERIFY_TOKEN_EMPLOYEE":
                case "NO_EMPLOYEE_ACCOUNT":
                case "EMPLOYEE_NOT_LOGGED":
                case "SEND_FEEDBACK_ERROR":
                default:
                    props.navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "Error" }]
                        })
                    );

                    break;
                
                case "SEND_FEEDBACK_OK":
                    showAlert("Alert", null, "Woohoo! Your feedback just blasted off!", null, null, null);

                    props.navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "Home" }]
                        })
                    );

                    break;
            }
        } else {
            props.navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Error" }]
                })
            );
        }
    }

    const handleCloseOffer = async () => {
        const offerId = props.offer._id;

        setLoadingLLM(true);

        const result = await apiManager.methods.post(
            apiManager.tokenApi.closeOffer,
            {
                offerId: offerId
            },
            {
                token: props.user.token
            }
        );

        setLoadingLLM(false);

        if(result.success) {
            const data = result.data;

            switch(data.message) {
                case "TOKEN_EMPLOYEE_NOT_PROVIDED":
                case "CANNOT_VERIFY_TOKEN_EMPLOYEE":
                case "NO_EMPLOYEE_ACCOUNT":
                case "EMPLOYEE_NOT_LOGGED":
                case "CLOSE_OFFER_ERROR":
                default:
                    props.navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "Error" }]
                        })
                    );

                    break;
                
                case "CLOSE_OFFER_OK":
                    showAlert(
                        "Alert",
                        null,
                        `Woohoo! The ride's a wrap, and you just scored +${data.newGreenPoints} GreenPoints!${data.savedCO2 ? ` Oh, and guess what? You just saved about ${data.savedCO2}kg of CO₂! Earth says thanks!` : ""}`,
                        null,
                        null,
                        null
                    );

                    props.navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "Home" }]
                        })
                    );

                    break;
            }
        } else {
            props.navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Error" }]
                })
            );
        }
    }

    const handleOpenNavigator = () => {
        const currentOffer = props.offer;
        const currentUser = props.user.employee;
        
        const startingPoint = `${currentOffer.departureCoordinates.coordinates[1]},${currentOffer.departureCoordinates.coordinates[0]}`;
        const arrivalPoint = `${currentUser.company.headquartersCoordinates.coordinates[1]},${currentUser.company.headquartersCoordinates.coordinates[0]}`;
        
        const waypoints = currentOffer.intermediateStops
            .map(stop => `${stop.coordinates[1]},${stop.coordinates[0]}`)
            .join("+to:");

        const url = `http://maps.apple.com/?saddr=${startingPoint}&daddr=${waypoints ? waypoints + "+to:" : ""}${arrivalPoint}`;
        
        Linking.openURL(url);
    }

    const orderIntermediateStops = () => {
        const stops = [...props.offer.intermediateStops];
        const ordered = [];

        let current = {
            latitude: props.offer.departureCoordinates.coordinates[1],
            longitude: props.offer.departureCoordinates.coordinates[0]
        };

        while(stops.length > 0) {
            let minDistance = Infinity;
            let closestIndex = -1;

            stops.forEach((stop, idx) => {
                const dist = helpers.coordinatesDistance(
                    current.latitude, current.longitude,
                    stop.coordinates[1], stop.coordinates[0]
                );

                if (dist < minDistance) {
                    minDistance = dist;
                    closestIndex = idx;
                }
            });

            const closestStop = stops.splice(closestIndex, 1)[0];
            ordered.push(closestStop);

            current = {
                latitude: closestStop.coordinates[1],
                longitude: closestStop.coordinates[0]
            };
        }

        return ordered;
    };

    const handleNotifyUser = async (userId) => {
        const result = await apiManager.methods.post(
            apiManager.tokenApi.notifyEmployeeStop,
            {
                userId: userId
            },
            {
                token: props.user.token
            }
        );

        if(result.success) {
            const data = result.data;

            switch(data.message) {
                case "TOKEN_EMPLOYEE_NOT_PROVIDED":
                case "CANNOT_VERIFY_TOKEN_EMPLOYEE":
                case "NO_EMPLOYEE_ACCOUNT":
                case "EMPLOYEE_NOT_LOGGED":
                case "NOTIFY_EMPLOYEE_STOP_ERROR":
                default:
                    props.navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "Error" }]
                        })
                    );

                    break;
                
                case "NOTIFY_EMPLOYEE_STOP_OK":
                    showAlert("Alert", null, "Woohoo! Your notification is out in the wild!", null, null, null);
                    break;
            }
        } else {
            props.navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Error" }]
                })
            );
        }
    }

    useEffect(() => {
        const userRequest = props.offer.pendingRequests.find(
            (req) => req.employeeRequestId === props.user.employee._id
        );

        if(userRequest && userRequest.feedback)
            setFeedback(userRequest.feedback);
        
        if(props.pers && isNowPast) {
            const orderedIntermediateStops = orderIntermediateStops();

            const personalPendingRequests = props.offer.pendingRequests.filter(pr => !pr.isDefault);

            const sortedPendingRequests = personalPendingRequests.sort((a, b) => {
                const indexA = orderedIntermediateStops.findIndex(stop =>
                    stop.coordinates[0] === a.intermediateStop.coordinates[0] &&
                    stop.coordinates[1] === a.intermediateStop.coordinates[1]
                );

                const indexB = orderedIntermediateStops.findIndex(stop =>
                    stop.coordinates[0] === b.intermediateStop.coordinates[0] &&
                    stop.coordinates[1] === b.intermediateStop.coordinates[1]
                );

                return indexA - indexB;
            });

            setSortedPendingRequests(sortedPendingRequests);
        }
    }, []);

    return (
        <View style={[props.style, styles.container]}>
            <View style={{ flexDirection: "row" }}>
                <View>
                    <View style={ styles.sectionContainer }>
                        <Image
                            source={{ uri: props.manageable ? props.globalAssets.calendar.localUri : props.globalAssets.user.localUri }}
                            style={ styles.sectionImage }
                        />

                        <Text style={{ fontFamily: Fonts.bold, fontWeight: "700", color: props.manageable ? Colors.secondary : Colors.black }}>
                            {
                                props.manageable
                                ?
                                props.date
                                :
                                props.username
                            }
                        </Text>
                    </View>

                    {
                        props.statusOffer
                        &&
                        <View style={[{ marginTop: 10 }, styles.sectionContainer]}>
                            <Image
                                source={{ uri: props.globalAssets.calendar.localUri }}
                                style={ styles.sectionImage }
                            />

                            <Text style={ styles.sectionText }>{ props.date }</Text>
                        </View>
                    }

                    <View style={[{ marginTop: 10 }, styles.sectionContainer]}>
                        <Image
                            source={{ uri: props.globalAssets.clock.localUri }}
                            style={ styles.sectionImage }
                        />

                        <Text style={{ fontFamily: props.manageable ? Fonts.bold : Fonts.light, fontWeight: props.manageable ? "700" : "300", color: props.manageable ? Colors.secondary : Colors.black }}>{ props.time }</Text>
                    </View>

                    <View style={[{ marginTop: 10 }, styles.sectionContainer]}>
                        <Image
                            source={{ uri: props.globalAssets.car.localUri }}
                            style={ styles.sectionImage }
                        />

                        <Text style={ styles.sectionText }>{ props.freeSeats } free seat{ props.freeSeats !== 1 && "s" }</Text>
                    </View>

                    <View style={[{ marginTop: 10 }, styles.sectionContainer]}>
                        <Image
                            source={{ uri: props.globalAssets.hand.localUri }}
                            style={ styles.sectionImage }
                        />

                        <Text style={ styles.sectionText }>{ props.intermediateStops.length } intermediate stop{ props.intermediateStops.length !== 1 && "s" }</Text>
                    </View>

                    {
                        props.pers && isNowPast
                        &&
                        <>
                            <TouchableOpacity
                                activeOpacity={ 0.5 }
                                onPress={ handleOpenNavigator }
                                style={{ marginVertical: 10 }}
                            >
                                <Text style={ styles.link }>Open the navigator</Text>
                            </TouchableOpacity>

                            {
                                sortedPendingRequests.map((pendingRequest, index) => (
                                    <TouchableOpacity
                                        key={ pendingRequest._id }
                                        activeOpacity={ 0.5 }
                                        onPress={() => handleNotifyUser(pendingRequest.employeeRequestId)}
                                    >
                                        <Text style={ styles.link }>Notify the user of the personal stop #{index + 1}</Text>
                                    </TouchableOpacity>
                                ))
                            }
                        </>
                    }
                </View>
                
                {
                    !props.manageable && !props.statusOffer
                    &&
                    <View style={ styles.mapImageContainer }>
                        <TouchableOpacity
                            activeOpacity={ 0.5 }
                            onPress={() => {
                                props.navigation.navigate("MapOffer", {
                                    user: props.user,
                                    offer: props.offer,
                                    departureType: props.departureType
                                });
                            }}
                        >
                            <Image
                                source={{ uri: props.globalAssets.map.localUri }}
                                style={ styles.mapImage }
                            />
                        </TouchableOpacity>
                    </View>
                }
            </View>

            {
                props.reason
                &&
                <>
                    <View style={ styles.hr } />
                    <Text style={ styles.reasonText }>{ props.reason }</Text>
                </>
            }

            {
                props.pers
                &&
                (
                    isNowPast
                    ?
                    (
                        props.pendingRequests && props.pendingRequests.length > 0
                        &&
                        props.pendingRequests
                        .filter(pr => pr.status === "pending")
                        .map((pendingRequest, index) => {
                            const isFirst = index === 0;

                            return (
                                <View key={ pendingRequest._id }>
                                    {
                                        isFirst
                                        &&
                                        <View style={ styles.hr } />
                                    }

                                    <Text style={{ fontFamily: Fonts.bold, fontWeight: "700", color: Colors.secondary, marginTop: isFirst ? 0 : 10 }}>Request #{index + 1}</Text>
                                    <Text style={{ fontFamily: Fonts.light, fontWeight: "300" }}>{ pendingRequest.isDefault ? "Default point departure" : "Personal point departure" }</Text>

                                    <View>
                                        <TouchableOpacity
                                            activeOpacity={ 0.5 }
                                            onPress={() => props.navigation.navigate("MapOffer", {
                                                user: props.user,
                                                offer: props.offer,
                                                pendingRequest: pendingRequest,
                                                offerUser: true
                                            })}
                                        >
                                            <Text style={ styles.link }>View on the map</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )
                        })
                    )
                    :
                    (
                        <View>
                            <GreenRideButton
                                style={ styles.sendFeedbackButton }
                                onPress={ handleCloseOffer }
                                text="Ride's over!"
                                loading={ loadingLLM }
                            />
                        </View>
                    )
                )
            }

            {
                props.acc
                &&
                <View style={ styles.containerStars }>
                    {
                        feedback
                        ?
                        <Text style={{ fontFamily: Fonts.bold, fontWeight: "700", color: Colors.secondary }}>Feedback? Already done and dusted!</Text>
                        :
                        <>
                            <StarRating
                                rating={ rating }
                                onChange={ setRating }
                                starSize={ 30 }
                                enableHalfStar={ false }
                                color={ Colors.secondary }
                            />

                            <GreenRideButton
                                style={ styles.sendFeedbackButton }
                                onPress={ handleSendFeedback }
                                text="Shoot feedback!"
                            />
                        </>
                    }
                </View>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.backgroundGreenColor,
        padding: 15,
        borderRadius: 10
    },
    sectionContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5
    },
    sectionImage: {
        width: 20,
        height: 20,
        objectFit: "contain"
    },
    sectionText: {
        fontFamily: Fonts.light, fontWeight: "300"
    },
    mapImageContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    mapImage: {
        width: 50,
        aspectRatio: 576 / 512,
        resizeMode: "contain",
        marginLeft: 20
    },
    hr: {
        borderBottomColor: Colors.secondary,
        borderBottomWidth: 3,
        marginVertical: 15
    },
    reasonText: {
        fontFamily: Fonts.bold, fontWeight: "700",
        color: Colors.secondary
    },
    link: {
        fontFamily: Fonts.light, fontWeight: "300",
        textDecorationLine: "underline",
        color: Colors.secondary
    },
    containerStars: {
        marginTop: 20,
        alignItems: "center"
    },
    sendFeedbackButton: {
        marginTop: 20,
        width: "100%",
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4
    }
});

export default Offer;