import { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Text } from "react-native";
import { useAssetsContext } from "../contexts/AssetsContext";
import ModalSelector from "react-native-modal-selector";
import { LinearGradient } from "expo-linear-gradient";

import Fonts from "../theme/fonts";
import FontSizes from "../theme/fontSizes";
import Colors from "../theme/colors";

import Header from "../components/Header";
import Offer from "../components/Offer";

function ActivityScreen({ navigation, route }) {
    const { globalAssets } = useAssetsContext();
    const { user, personalOffers, acceptedOffers, pendingOffers, rejectedOffers } = route.params;

    const [selected, setSelected] = useState("My offers");

    const modalSelectorData = [
        { key: 1, label: "My offers" },
        { key: 2, label: "My accepted requests" },
        { key: 3, label: "My pending requests" },
        { key: 4, label: "My rejected requests" }
    ];

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

            <View style={ styles.activityContainer }>
                <ModalSelector
                    data={ modalSelectorData }
                    selectStyle={ styles.modalSelector }
                    initValue={ selected ? selected : "Pick one!" }
                    optionTextStyle={ styles.optionText }
                    onChange={(option) => setSelected(option.label)}
                    cancelText="Cancel"
                    cancelTextStyle={ styles.cancelText }
                    optionContainerStyle={ styles.optionContainer }
                    cancelStyle={ styles.cancelStyle }
                    animationType="fade"
                    initValueTextStyle={ styles.initValue }
                    overlayStyle={ styles.overlayStyle }
                />

                <Text style={ styles.hintText }>Just so you know, everything here is future-only for your ease, except accepted requests (feedback)!</Text>

                {
                    <View style={{ flex: 1}}>
                        <ScrollView style={ styles.scrollView }>
                            {
                                selected === "My offers"
                                ?
                                    personalOffers && personalOffers.length > 0
                                    ?
                                    personalOffers.map((personalOffer, index) => {
                                        const isFirst = index === 0;

                                        return (
                                            <Offer
                                                key={ personalOffer._id }
                                                style={{ marginTop: isFirst ? 0 : 20 }}
                                                globalAssets={ globalAssets }
                                                //username={ personalOffer.employee.username }
                                                date={ personalOffer.departureDate }
                                                time={ personalOffer.departureTime }
                                                freeSeats={ personalOffer.freeSeats }
                                                intermediateStops={ personalOffer.intermediateStops }
                                                navigation={ navigation }
                                                user={ user }
                                                offer={ personalOffer }
                                                manageable={ true }
                                                pendingRequests={ personalOffer.pendingRequests }
                                                pers={ true }
                                            />
                                        );
                                    })
                                    :
                                    <Text style={ styles.nothingText }>Nothing to see here!</Text>
                                :
                                selected === "My accepted requests"
                                ?
                                    acceptedOffers.length > 0
                                    ?
                                    acceptedOffers.map((acceptedOffer, index) => {
                                        const isFirst = index === 0;

                                        return (
                                            <Offer
                                                key={ acceptedOffer._id }
                                                style={{ marginTop: isFirst ? 0 : 20 }}
                                                globalAssets={ globalAssets }
                                                username={ acceptedOffer.employee.username }
                                                date={ acceptedOffer.departureDate }
                                                time={ acceptedOffer.departureTime }
                                                freeSeats={ acceptedOffer.freeSeats }
                                                intermediateStops={ acceptedOffer.intermediateStops }
                                                navigation={ navigation }
                                                user={ user }
                                                offer={ acceptedOffer }
                                                statusOffer={ true }
                                                acc={ true }
                                            />
                                        );
                                    })
                                    :
                                    <Text style={ styles.nothingText }>Nothing to see here!</Text>
                                :
                                selected === "My pending requests"
                                ?
                                    pendingOffers.length > 0
                                    ?
                                    pendingOffers.map((pendingOffer, index) => {
                                        const isFirst = index === 0;

                                        return (
                                            <Offer
                                                key={ pendingOffer._id }
                                                style={{ marginTop: isFirst ? 0 : 20 }}
                                                globalAssets={ globalAssets }
                                                username={ pendingOffer.employee.username }
                                                date={ pendingOffer.departureDate }
                                                time={ pendingOffer.departureTime }
                                                freeSeats={ pendingOffer.freeSeats }
                                                intermediateStops={ pendingOffer.intermediateStops }
                                                navigation={ navigation }
                                                user={ user }
                                                offer={ pendingOffer }
                                                statusOffer={ true }
                                            />
                                        );
                                    })
                                    :
                                    <Text style={ styles.nothingText }>Nothing to see here!</Text>
                                :
                                selected === "My rejected requests"
                                ?
                                    rejectedOffers.length > 0
                                    ?
                                    rejectedOffers.map((rejectedOffer, index) => {
                                        const isFirst = index === 0;

                                        return (
                                            <Offer
                                                key={ rejectedOffer._id }
                                                style={{ marginTop: isFirst ? 0 : 20 }}
                                                globalAssets={ globalAssets }
                                                username={ rejectedOffer.employee.username }
                                                date={ rejectedOffer.departureDate }
                                                time={ rejectedOffer.departureTime }
                                                freeSeats={ rejectedOffer.freeSeats }
                                                intermediateStops={ rejectedOffer.intermediateStops }
                                                navigation={ navigation }
                                                user={ user }
                                                offer={ rejectedOffer }
                                                statusOffer={ true }
                                            />
                                        );
                                    })
                                    :
                                    <Text style={ styles.nothingText }>Nothing to see here!</Text>
                                :
                                <Text style={ styles.nothingText }>Waiting for you choice...</Text>
                            }
                        </ScrollView>

                        <LinearGradient
                            colors={["rgba(255, 255 ,255, 0)", "rgba(255, 255, 255, 1)"]}
                            style={ styles.linearGradient }
                        />
                    </View>
                }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white
    },
    activityContainer: {
        flex: 1,
        padding: 30
    },
    modalSelector: {
        borderWidth: 3,
        borderColor: Colors.secondary,
        borderRadius: 10
    },
    cancelText: {
        color: Colors.black,
        fontFamily: Fonts.bold, fontWeight: "700",
        fontSize: FontSizes.normal
    },
    optionText: {
        color: Colors.secondary,
        fontFamily: Fonts.bold, fontWeight: "700",
        fontSize: FontSizes.normal
    },
    optionContainer: {
        borderRadius: 10,
        marginHorizontal: 30,
        backgroundColor: Colors.white
    },
    cancelStyle: {
        borderRadius: 10,
        marginHorizontal: 30,
        backgroundColor: Colors.backgroundGreenColor
    },
    initValue: {
        fontFamily: Fonts.bold, fontWeight: "700",
        fontSize: FontSizes.normal,
        color: Colors.secondary
    },
    overlayStyle: {
        padding: 0
    },
    scrollView: {
        height: 0,
        marginTop: 20,
        marginBottom: 10
    },
    linearGradient: {
        position: "absolute",
        bottom: 10,
        left: 0,
        right: 0,
        height: 20
    },
    hintText: {
        fontFamily: Fonts.bold, fontWeight: "700",
        marginTop: 10,
        textAlign: "center",
        color: Colors.secondary
    },
    nothingText: {
        fontFamily: Fonts.light, fontWeight: "300",
        textAlign: "center"
    }
});

export default ActivityScreen;