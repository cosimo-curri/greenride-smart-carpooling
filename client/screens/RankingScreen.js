import { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Text, ActivityIndicator, Image } from "react-native";
import { useAssetsContext } from "../contexts/AssetsContext";
import { CommonActions } from "@react-navigation/native";

import apiManager from "../utils/apiManager";

import Fonts from "../theme/fonts";
import Colors from "../theme/colors";

import Header from "../components/Header";
import FontSizes from "../theme/fontSizes";

function RankingScreen({ navigation, route }) {
    const { globalAssets } = useAssetsContext();
    const { user } = route.params;

    const [ranking, setRanking] = useState([]);

    const loadRanking = async () => {
        const result = await apiManager.methods.get(
            apiManager.tokenApi.getRanking,
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
                case "GET_RANKING_ERROR":
                default:
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "Error" }]
                        })
                    );

                    break;
                
                case "GET_RANKING_OK":
                    setRanking(data.ranking);
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
        loadRanking();
    }, []);

    return (
        <View style={ styles.container }>
            <Header
                logo={ globalAssets.logo.localUri }
                stories={ false }
                noBoxShadow={ (ranking.length > 0) ? false : true }
                hamburgerData={[
                    {
                        text: "Back it up",
                        handle: () => navigation.goBack()
                    }
                ]}
            />

            <Text style={ styles.hintText }>You get ±10 for self-certifications (bonus or malus), and when you give rides, you earn points based on passengers (minimum one) and distance traveled, using a fancy weighted formula. Easy green wins!</Text>

            {
                ranking.length > 0
                ?
                <ScrollView style={ styles.scrollContainer }>
                    {
                        ranking.map((rankingElement, index) => {
                            const isFirst = index === 0;
                            const isLogged = user.employee._id === rankingElement._id;
                            
                            let feedbackValue = rankingElement.avgFeedback.feedbackSum / rankingElement.avgFeedback.feedbackCount;
                            let feedback = Number.isNaN(feedbackValue) ? null : `\n${feedbackValue.toFixed(2)} ★`;
                            
                            return (
                                <View key={ rankingElement._id } style={[{ borderColor: isLogged ? Colors.secondary : Colors.backgroundGreenColor, marginTop: isFirst ? 0 : 20 }, styles.rankingComponent]}>
                                    <View style={ styles.firstBox }>
                                        <Text style={ styles.textRankingPosition }>{ index + 1 }</Text>
                                        <Text style={ styles.textRankingUsername }><Text style={{ color: Colors.secondary, fontFamily: Fonts.bold, fontWeight: "700" }}>{ rankingElement.username }</Text>{ "\n" }{ rankingElement.greenPoints } GreenPoints{ feedback }</Text>
                                        <Image source={{ uri: index === 0 ? globalAssets.firstPlace.localUri : index === 1 ? globalAssets.secondPlace.localUri : index === 2 ? globalAssets.thirdPlace.localUri: null }} style={ styles.imagePlace } />
                                    </View>
                                </View>
                            )
                        })
                    }
                </ScrollView>
                :
                <View style={ styles.activityIndicatorContainer }>
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
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 20
    },
    activityIndicatorContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    rankingComponent: {
        padding: 20,
        borderRadius: 10,
        backgroundColor: Colors.backgroundGreenColor,
        borderWidth: 3
    },
    textRankingPosition: {
        fontFamily: Fonts.bold, fontWeight: "700",
        fontSize: FontSizes.title,
        marginRight: 20,
        color: Colors.secondary
    },
    textRankingUsername: {
        fontFamily: Fonts.light, fontWeight: "300",
        fontSize: FontSizes.label
    },
    firstBox: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center"
    },
    imagePlace: {
        width: 30,
        aspectRatio: 1,
        objectFit: "contain",
        marginLeft: "auto"
    },
    hintText: {
        margin: 20,
        textAlign: "justify",
        fontFamily: Fonts.light, fontWeight: "300"
    }
});

export default RankingScreen;