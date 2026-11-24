import { useRef, useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    Animated
} from "react-native";

import Colors from "../theme/colors";

function BottomNavigationBar(props) {
    const translateX = useRef(new Animated.Value(0)).current;

    const [positions, setPositions] = useState({});

    useEffect(() => {
        if(positions[props.selectedIndex] !== undefined) {
            translateX.setValue(positions[props.selectedIndex]);
        }
    }, [positions]);

    const handlePress = (index) => {
        props.setSelectedIndex(index);

        if(positions[index] !== undefined) {
            Animated.spring(translateX, {
                toValue: positions[index],
                useNativeDriver: true
            }).start();
        }
    };

    const onButtonLayout = (event, index) => {
        const { x, width } = event.nativeEvent.layout;
        const circlePosition = x + width / 2 - 30;
        setPositions((prev) => ({ ...prev, [index]: circlePosition }));
    };

    return (
        <View style={ styles.wrapper }>
            <View style={ styles.container }>
                <Animated.View
                    style={[
                        styles.circleBackground,
                        { transform: [{ translateX }] }
                    ]}
                />

                <TouchableOpacity
                    onLayout={(e) => onButtonLayout(e, 0)}
                    onPress={() => handlePress(0)}
                    activeOpacity={ 1 }
                >
                    <View style={ styles.iconWrapper }>
                        <Image
                            source={{ uri: props.globalAssets.brain.localUri }}
                            style={ styles.image }
                        />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onLayout={(e) => onButtonLayout(e, 1)}
                    onPress={() => handlePress(1)}
                    activeOpacity={ 1 }
                >
                    <View style={ styles.iconWrapper }>
                        <Image
                            source={{ uri: props.globalAssets.selfcertification.localUri }}
                            style={ styles.image }
                        />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onLayout={(e) => onButtonLayout(e, 2)}
                    onPress={() => handlePress(2)}
                    activeOpacity={ 1 }
                >
                    <View style={ styles.iconWrapper }>
                        <Image
                            source={{ uri: props.globalAssets.calendar.localUri }}
                            style={ styles.image }
                        />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onLayout={(e) => onButtonLayout(e, 3)}
                    onPress={() => handlePress(3)}
                    activeOpacity={ 1 }
                >
                    <View style={ styles.iconWrapper }>
                        <Image
                            source={{ uri: props.globalAssets.bell.localUri }}
                            style={ styles.image }
                        />

                        {
                            props.hasNewNotifications
                            &&
                            (
                                <View style={styles.notificationDot} />
                            )
                        }
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        alignItems: "center",
        marginTop: 25,
        marginBottom: 35
    },
    container: {
        flexDirection: "row",
        backgroundColor: Colors.noWhiteBackground,
        boxShadow: "0 0 8px rgba(0, 0, 0, 0.25)",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 50,
        width: "100%",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden"
    },
    iconWrapper: {
        width: 60,
        height: 60,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1
    },
    image: {
        width: 30,
        height: 30,
        resizeMode: "contain",
        position: "relative"
    },
    circleBackground: {
        position: "absolute",
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.backgroundGreenColor,
        top: 10,
        left: 0,
        zIndex: 0
    },
    notificationDot: {
        position: "absolute",
        top: 16,
        right: 16,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#ED1C24"
    }
});

export default BottomNavigationBar;