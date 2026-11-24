import { StyleSheet, TextInput } from "react-native";

import Fonts from "../theme/fonts";
import FontSizes from "../theme/fontSizes";
import Colors from "../theme/colors";

function NumericInput(props) {
    const handleChange = (text) => {
        const numericValue = text.replace(/[^0-9]/g, "");
        props.setValue(numericValue);
    }

    return (
        <TextInput
            style={ styles.input }
            value={ props.value }
            onChangeText={ handleChange }
            keyboardType="number-pad"
            placeholder="How many free seats in your car?"
            textContentType="none"
            maxLength={ props.maxLength }
            returnKeyType={ props.returnKeyType }
            onSubmitEditing={ props.onSubmitEditing }
            submitBehavior={ props.submitBehavior }
        />
    );
}

const styles = StyleSheet.create({
    input: {
        fontFamily: Fonts.light, fontWeight: "300",
        fontSize: FontSizes.normal,
        borderWidth: 1,
        borderColor: Colors.gray,
        padding: 10,
        borderRadius: 5,
        marginTop: 20
    }
});

export default NumericInput;