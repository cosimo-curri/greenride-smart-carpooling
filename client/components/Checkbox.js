import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";

import Fonts from "../theme/fonts";
import FontSizes from "../theme/fontSizes";
import Colors from "../theme/colors";

function Checkbox(props) {
    return (
        <View style={[styles.container, props.style]}>
            <TouchableOpacity
                onPress={() => props.setChecked(!props.checked)}
                activeOpacity={ 1 }
            >
                <Image
                    source={{ uri: props.checked ? props.imageCheckedLocalUri : props.imageUncheckedLocalUri }}
                    style={ styles.image }
                />
            </TouchableOpacity>

            {
                props.text
                &&
                <Text style={ styles.text }>{ props.text }</Text>
            }

            {
                props.hypertext
                &&
                <TouchableOpacity
                    onPress={ props.handleClickHypertext }
                    activeOpacity={ 0.5 }
                >
                    <Text style={[styles.text, styles.hypertext]}>{ props.hypertext }</Text>
                </TouchableOpacity>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center"
    },
    text: {
        fontFamily: Fonts.light, fontWeight: "300",
        fontSize: FontSizes.normal
    },
    hypertext: {
        color: Colors.secondary,
        textDecorationLine: "underline"
    },
    image: {
        width: 20,
        height: 20,
        marginRight: 7
    }
});

export default Checkbox;