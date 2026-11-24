import { StyleSheet, View, Text, Image, TouchableOpacity, Linking } from "react-native";

import Fonts from "../theme/fonts";
import FontSizes from "../theme/fontSizes";
import Colors from "../theme/colors";

function ScreenTitle(props) {
    return (
        <View
            style={[
                styles.container,
                {
                    boxShadow: props.up ? "0 5px 10px rgba(0, 0, 0, 0.2)" : "none",
                    backgroundColor: props.backgroundColor
                }
            ]}
        >
            {
                props.imageUri
                &&
                <Image
                    source={{ uri: props.imageUri }}
                    style={ styles.image }
                />
            }

            <Text style={[styles.title, { color: props.titleColor }]}>{ props.title }</Text>
            <Text style={[styles.text, { color: props.textColor }]}>{ props.text }</Text>

            {
                props.hypertextEnd
                &&
                <TouchableOpacity
                    activeOpacity={ 0.5 }
                    onPress={() => {
                        Linking.openURL(`mailto:${props.hypertextEnd}`);
                    }}
                >
                    <Text style={ styles.hypertext }>{ props.hypertextEnd }</Text>
                </TouchableOpacity>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        padding: 50,
        flexDirection: "column",
        alignItems: "center",
        boxShadow: "0 5px 10px rgba(0, 0, 0, 0.2)"
    },
    title: {
        fontFamily: Fonts.bold, fontWeight: "700",
        fontSize: FontSizes.title,
        textAlign: "center"
    },
    image: {
        width: 50,
        height: 50,
        marginBottom: 15
    },
    text: {
        fontFamily: Fonts.light, fontWeight: "300",
        fontSize: FontSizes.privacyPolicyText,
        textAlign: "center",
        marginTop: 5
    },
    hypertext: {
        fontFamily: Fonts.light, fontWeight: "300",
        fontSize: FontSizes.privacyPolicyText,
        textAlign: "center",
        color: Colors.white,
        textDecorationLine: "underline"
    }
});

export default ScreenTitle;