import { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator } from "react-native";

import Fonts from "../theme/fonts";
import FontSizes from "../theme/fontSizes";
import Colors from "../theme/colors";

function GreenRideButton(props) {
    const [height, setHeight] = useState(null);
    const paddingVertical = 10;

    const onTextLayout = (event) => {
        if(!height)
            setHeight(event.nativeEvent.layout.height);
    };

    const totalHeight = height ? height + paddingVertical * 2 : null;

    return (
        <TouchableOpacity
            style={[
                styles.container,
                props.style,
                totalHeight ? { height: totalHeight } : null
            ]}
            activeOpacity={ 0.7 }
            onPress={ props.onPress }
            disabled={ !!props.loading }
        >
            {
                props.loading
                ?
                <ActivityIndicator size="small" color={ Colors.secondary } />
                :
                <Text style={ styles.text } onLayout={ onTextLayout }>{ props.text }</Text>
            }
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center"
    },
    text: {
        fontFamily: Fonts.bold, fontWeight: "700",
        fontSize: FontSizes.normal,
        color: Colors.secondary,
        textAlign: "center"
    }
});

export default GreenRideButton;