import { useState } from "react";
import { StyleSheet, View, Image, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import InstagramStories from "@birdwingo/react-native-instagram-stories";
import Hamburger from "react-native-hamburger";

import Fonts from "../theme/fonts";
import FontSizes from "../theme/fontSizes";
import Colors from "../theme/colors";

function Header(props) {
    const [activeHamburger, setActiveHamburger] = useState(false);

    let stories = null;

    if(props.stories) {
        stories = [
            {
                id: "user1",
                name: "Welcome",
                avatarSource: { uri: props.userImages[0] },
                stories: [
                    {
                        id: "story1",
                        source: { uri: props.remoteAssets[0] },
                        animationDuration: 10000
                    },
                    {
                        id: "story2",
                        source: { uri: props.remoteAssets[1] }
                    },
                    {
                        id: "story3",
                        source: { uri: props.remoteAssets[2] }
                    }
                ]
            },
            {
                id: "user2",
                name: "Carpooling",
                avatarSource: { uri: props.userImages[1] },
                stories: [
                    {
                        id: "story4",
                        source: { uri: props.remoteAssets[3] }
                    },
                    {
                        id: "story5",
                        source: { uri: props.remoteAssets[4] }
                    }
                ]
            },
            {
                id: "user3",
                name: "Companies",
                avatarSource: { uri: props.userImages[2] },
                stories: [
                    {
                        id: "story6",
                        source: { uri: props.remoteAssets[5] }
                    },
                    {
                        id: "story7",
                        source: { uri: props.remoteAssets[6] }
                    }
                ]
            },
            {
                id: "user4",
                name: "Privacy",
                avatarSource: { uri: props.userImages[3] },
                stories: [
                    {
                        id: "story8",
                        source: { uri: props.remoteAssets[7] }
                    }
                ]
            }
        ];
    }

    return (
        <SafeAreaView
            style={[styles.safeArea, {
                boxShadow: props.noBoxShadow ? "none" : "0 2px 10px rgba(0, 0, 0, 0.15)"
            }]}
            edges={["top"]}
        >
            <View style={ styles.hamburgerContainer }>
                <View style={ styles.infoContainer }>
                    <Image
                        source={{ uri: props.logo }}
                        style={ styles.logo }
                    />

                    <Text style={ styles.text }>GreenRide</Text>
                </View>

                {
                    !props.stories && Array.isArray(props.hamburgerData)
                    &&
                    <Hamburger
                        active={ activeHamburger }
                        style={ styles.hamburger }
                        type="spinCross"
                        onPress={() => {
                            setActiveHamburger(!activeHamburger);
                        }}
                    />
                }
            </View>

            {
                props.stories
                &&
                <InstagramStories
                    stories={ stories }
                    avatarSize={ 70 }
                    backgroundColor="white"
                    storyAvatarSize={ 40 }
                    avatarListContainerStyle={ styles.storiesContainer }
                    textStyle={ styles.storiesText }
                    animationDuration={ 5000 }
                    closeIconColor={ Colors.white }
                    progressColor={ Colors.gray }
                    progressActiveColor={ Colors.black }
                    hideElementsOnLongPress={ true }
                    imageStyles={{
                        width: "100%"
                    }}
                />
            }

            {
                activeHamburger && Array.isArray(props.hamburgerData)
                &&
                <View style={ styles.hamburgerBox }>
                {
                    props.hamburgerData.map((item, index) => (
                        <TouchableOpacity
                            key={ index }
                            style={[
                                styles.hamburgerItem,
                                index > 0 && { marginTop: 15 }
                            ]}
                            activeOpacity={ 0.5 }
                            onPress={ item.handle }
                        >
                            <Text style={ styles.hamburgerText }>{ item.text }</Text>
                        </TouchableOpacity>
                    ))
                }
            </View>
            }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        width: "100%",
        paddingTop: 0,
        paddingBottom: 20,
        zIndex: 1,
        backgroundColor: "white"
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        marginTop: 15,
        marginLeft: 20
    },
    hamburgerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    hamburger: {
        marginTop: 15,
        marginRight: 15
    },
    storiesContainer: {
        width: "100%",
        justifyContent: "space-between",
        marginTop: 10,
        paddingHorizontal: 20
    },
    storiesText: {
        fontFamily: Fonts.light, fontWeight: "300",
        fontSize: FontSizes.nameStories,
        color: Colors.white
    },
    logo: {
        width: 40,
        height: 40,
        marginRight: 5
    },
    text: {
        fontFamily: Fonts.bold, fontWeight: "700",
        fontSize: FontSizes.header,
        color: Colors.secondary
    },
    hamburgerBox: {
        paddingHorizontal: 20,
        marginTop: 10
    },
    hamburgerItem: {
        borderBottomWidth: 3,
        paddingBottom: 5,
        borderBottomColor: Colors.black,
        alignSelf: "flex-end"
    },
    hamburgerText: {
        fontFamily: Fonts.bold, fontWeight: "700",
        fontSize: FontSizes.normal,
        color: Colors.black,
        alignSelf: "flex-end"
    }
});

export default Header;