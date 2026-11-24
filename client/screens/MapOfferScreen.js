import { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text } from "react-native";
import { useAssetsContext } from "../contexts/AssetsContext";
import { showAlert } from "../utils/showAlert";
import MapView, { Marker, Polyline } from "react-native-maps";
import { SPSheet } from "@sekizlipenguen/react-native-popup-confirm-toast";
import { CommonActions } from "@react-navigation/native";

import apiManager from "../utils/apiManager";
import helpers from "../utils/helpers";

import Fonts from "../theme/fonts";
import FontSizes from "../theme/fontSizes";
import Colors from "../theme/colors";

import Header from "../components/Header";
import GreenRideButton from "../components/GreenRideButton";

function MapOfferScreen({ navigation, route }) {
    const { globalAssets } = useAssetsContext();
    const { user, offer, departureType, offerUser, pendingRequest } = route.params;

    const mapRef = useRef(null);

    const [startingCoordinates, setStartingCoordinates] = useState(null);
    const [intermediateStops, setIntermediateStops] = useState([]); //LONGITUDE, LATITUDE
    const [arrivalCoordinates, setArrivalCoordinates] = useState(null);

    const [distance, setDistance] = useState(0);
    const [duration, setDuration] = useState(0);
    const [polylineForMapView, setPolylineForMapView] = useState([]);

    const [mapKey, setMapKey] = useState(0);

    const [showBottomContainer, setShowBottomContainer] = useState(false);

    const [isDefault, setIsDefault] = useState(false);

    const getAllCoordinates = () => {
        const coords = [];

        if(startingCoordinates) coords.push(startingCoordinates);
        if(arrivalCoordinates) coords.push(arrivalCoordinates);
        if(intermediateStops.length > 0) coords.push(...intermediateStops);

        return coords;
    };

    const handlePersonalDepartureType = (isDefault) => {
        SPSheet.hide();

        setIsDefault(isDefault);

        if(!isDefault) {
            setIntermediateStops(prev => [...prev, {
                latitude: user.employee.pin.coordinates[1],
                longitude: user.employee.pin.coordinates[0]
            }]);
        }

        setMapKey(1);
    }

    const fetchPolyline = async (orderedCoordinatesString) => {
        const result = await apiManager.methods.get(`https://router.project-osrm.org/route/v1/driving/${orderedCoordinatesString}?overview=full&geometries=geojson`);

        if(result.success) {
            const polylineData = result.data.routes[0];

            setDistance(helpers.mToKm(polylineData.distance));
            setDuration(helpers.secondsToReadableString(polylineData.duration));

            const polyline = polylineData.geometry.coordinates;

            const polylineChanged = polyline.map(coordinate => ({
                latitude: coordinate[1],
                longitude: coordinate[0]
            }));

            setPolylineForMapView(polylineChanged);

            setMapKey(2);
        } else {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Error" }]
                })
            );
        }
    }

    const orderIntermediateStops = () => {
        const stops = [...intermediateStops];
        const ordered = [];

        let current = startingCoordinates;

        while(stops.length > 0) {
            let minDistance = Infinity;
            let closestIndex = -1;

            stops.forEach((stop, idx) => {
                const dist = helpers.coordinatesDistance(
                    current.latitude, current.longitude,
                    stop.latitude, stop.longitude
                );

                if(dist < minDistance) {
                    minDistance = dist;
                    closestIndex = idx;
                }
            });

            const closestStop = stops.splice(closestIndex, 1)[0];
            ordered.push(closestStop);
            
            current = closestStop;
        }

        return ordered;
    }

    const createOrderedCoordinatesString = (orderedIntermediateStops) => {
        let orderedCoordinatesString = `${startingCoordinates.longitude},${startingCoordinates.latitude};`;

        for(const orderedIntermediateStop of orderedIntermediateStops) {
            orderedCoordinatesString += `${orderedIntermediateStop.longitude},${orderedIntermediateStop.latitude};`;
        }

        orderedCoordinatesString += `${arrivalCoordinates.longitude},${arrivalCoordinates.latitude}`;

        return orderedCoordinatesString;
    }

    const handleRequestRoute = async (isRequest) => {
        SPSheet.hide();

        if(isRequest) {
            const body =
                isDefault
                ?
                {
                    isDefault: true,
                    offerId: offer._id,
                    employeeRequestId: user.employee._id
                }
                :
                {
                    isDefault: false,
                    coords: {
                        latitude: user.employee.pin.coordinates[1],
                        longitude: user.employee.pin.coordinates[0]
                    },
                    offerId: offer._id,
                    employeeRequestId: user.employee._id
                };

            const result = await apiManager.methods.post(
                apiManager.tokenApi.savePendingRequest,
                body,
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
                    case "SAVE_PENDING_REQUEST_ERROR":
                    default:
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: "Error" }]
                            })
                        );

                        break;
                    
                    case "SAVE_PENDING_REQUEST_OK":
                        navigation.navigate("Home", {
                            offerIdPendingRequest: offer._id
                        });

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
        } else
            navigation.goBack();
    }

    const handleAccept = async () => {
        const offerId = offer._id;
        const pendingRequestId = pendingRequest._id;

        const result = await apiManager.methods.post(
            apiManager.tokenApi.acceptPendingRequest,
            {
                offerId: offerId,
                pendingRequestId: pendingRequestId,
                distance: distance
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
                case "ACCEPT_PENDING_REQUEST_ERROR":
                default:
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "Error" }]
                        })
                    );

                    break;
                
                case "ACCEPT_PENDING_REQUEST_OK":
                    showAlert("Alert", null, "Woohoo! Request's a done deal!", null, null, null);

                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "Home" }]
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

    const handleReject = async () => {
        const offerId = offer._id;
        const pendingRequestId = pendingRequest._id;

        const result = await apiManager.methods.post(
            apiManager.tokenApi.rejectPendingRequest,
            {
                offerId: offerId,
                pendingRequestId: pendingRequestId
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
                case "REJECT_PENDING_REQUEST_ERROR":
                default:
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "Error" }]
                        })
                    );

                    break;
                
                case "REJECT_PENDING_REQUEST_OK":
                    showAlert("Alert", null, "Ok! Request's a no-go!", null, null, null);

                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "Home" }]
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
        if(mapRef.current) {
            if(mapKey === 1) {
                const orderedIntermediateStops = orderIntermediateStops();
                setIntermediateStops(orderedIntermediateStops);
                fetchPolyline(createOrderedCoordinatesString(orderedIntermediateStops));
            } else if(mapKey === 2) {
                setTimeout(() => {
                    const coords = getAllCoordinates();

                    mapRef.current.fitToCoordinates(coords, {
                        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                        animated: true
                    });

                    setTimeout(() => {
                        setShowBottomContainer(true);
                    }, 1000);
                }, 500);
            }
        }
    }, [mapKey]);

    useEffect(() => {
        setStartingCoordinates({
            latitude: offer.departureCoordinates.coordinates[1],
            longitude: offer.departureCoordinates.coordinates[0]
        });

        setArrivalCoordinates({
            latitude: user.employee.company.headquartersCoordinates.coordinates[1],
            longitude: user.employee.company.headquartersCoordinates.coordinates[0]
        });

        const stops = offer.intermediateStops.map(stop => ({
            latitude: stop.coordinates[1],
            longitude: stop.coordinates[0]
        }));

        setIntermediateStops(stops);

        if(!offerUser) {
            if(!departureType)
                showAlert("BottomSheetDepartureType", null, null, handlePersonalDepartureType, null, null);
            else {
                if(departureType === "personal")
                    handlePersonalDepartureType(false);
                else
                    handlePersonalDepartureType(true);
            }
        } else {
            if(!pendingRequest.isDefault) {
                setIntermediateStops(prev => [...prev, {
                    latitude: pendingRequest.intermediateStop.coordinates[1],
                    longitude: pendingRequest.intermediateStop.coordinates[0]
                }]);
            }

            setMapKey(1);
        }
    }, []);

    return (
        <View style={ styles.container }>
            <Header
                logo={ globalAssets.logo.localUri }
                stories={ false }
                hamburgerData={[
                    {
                        text: "Back it up",
                        handle: () => navigation.goBack()
                    }
                ]}
            />

            <MapView
                key={ mapKey }
                ref={ mapRef }
                style={ styles.map }
            >
                {
                    startingCoordinates
                    &&
                    <Marker
                        coordinate={ startingCoordinates }
                    >
                        <View style={ styles.calloutContainer }>
                            <Text style={ styles.calloutText }>Start</Text>
                        </View>
                    </Marker>
                }

                {
                    arrivalCoordinates
                    &&
                    <Marker
                        coordinate={ arrivalCoordinates }
                    >
                        <View style={ styles.calloutContainer }>
                            <Text style={ styles.calloutText }>Arrival</Text>
                        </View>
                    </Marker>
                }

                {
                    intermediateStops.length > 0
                    &&
                    intermediateStops.map((intermediateStop, index) => (
                        <Marker
                            key={ index }
                            coordinate={ intermediateStop }
                        >
                            <View style={ styles.calloutContainer }>
                                <Text style={ styles.calloutText }>{`${index + 1}`}</Text>
                            </View>
                        </Marker>
                    ))
                }

                {
                    polylineForMapView.length > 0
                    &&
                    <Polyline
                        coordinates={ polylineForMapView }
                        strokeColor={ Colors.black }
                        strokeWidth={ 3 }
                    />
                }
            </MapView>
            
            {
                showBottomContainer
                &&
                <View style={ styles.bottomContainer }>
                    <Text style={styles.bottomContainerText}>
                        { `${distance}, about ${duration} to complete, ${intermediateStops.length} intermediate stop${intermediateStops.length !== 1 ? "s" : ""}.` }

                        {
                            !offerUser && offer.freeSeats > 1
                            ?
                            ` If the employee accepts your request, there will still be ${(offer.freeSeats - 1)} ` +
                            `seat${(offer.freeSeats - 1) !== 1 ? "s" : ""} available in the car, and the route may be subject to changes.`
                            :
                            null
                        }
                    </Text>
                
                    <View style={ styles.bottomContainerButtonsContainer }>
                        {
                            offerUser
                            ?
                            <>
                                <GreenRideButton
                                    text="Accept"
                                    onPress={ handleAccept }
                                    style={{ marginTop: 15, flex: 1 }}
                                />

                                <GreenRideButton
                                    text="Reject"
                                    onPress={ handleReject }
                                    style={{ marginTop: 15, flex: 1 }}
                                />
                            </>
                            :
                            <>
                                <GreenRideButton
                                    text="Request"
                                    onPress={() => handleRequestRoute(true)}
                                    style={{ marginTop: 15, flex: 1 }}
                                />

                                <GreenRideButton
                                    text="Cancel"
                                    onPress={() => handleRequestRoute(false)}
                                    style={{ marginTop: 15, flex: 1 }}
                                />
                            </>
                        }
                    </View>
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
    map: {
        flex: 1
    },
    calloutContainer: {
        backgroundColor: Colors.backgroundGreenColor,
        borderColor: Colors.black,
        borderWidth: 3,
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        alignItems: "center",
        maxWidth: 150
    },
    calloutText: {
        color: Colors.black,
        fontFamily: Fonts.bold, fontWeight: "700"
    },
    bottomContainer: {
        paddingHorizontal: 25,
        paddingTop: 25,
        paddingBottom: 40,
        backgroundColor: Colors.white,
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.15)"
    },
    bottomContainerText: {
        fontFamily: Fonts.light, fontWeight: "300",
        fontSize: FontSizes.normal
    },
    bottomContainerButtonsContainer: {
        flexDirection: "row",
        gap: 10
    }
});

export default MapOfferScreen;