import { StyleSheet, View, Text } from "react-native";

import Fonts from "../theme/fonts";
import FontSizes from "../theme/fontSizes";

const NestedList = ({ items, level = 0 }) => {
    return (
        <View style={{ paddingLeft: level * 16, marginRight: level * 16 }}>
            {
                items.map((item, index) => {
                    const isOrdered = item.type === "ordered";
                    const bullet = isOrdered ? `${index + 1}.` : "\u2022";

                    return (
                        <View
                            key={ index }
                            style={{
                                marginTop: isOrdered && index !== 0 ? 10 : 0
                            }}
                        >
                            <View style={{ flexDirection: "row" }}>
                                <Text style={[styles.text, {
                                    marginRight: 5,
                                    fontFamily: isOrdered ? Fonts.bold : Fonts.light
                                }]}>
                                    { bullet }
                                </Text>

                                <Text style={[styles.text, {
                                    fontFamily: isOrdered ? Fonts.bold : Fonts.light
                                }]}>
                                    { item.text }
                                </Text>
                            </View>

                            {
                                item.children
                                &&
                                (
                                    <NestedList items={ item.children } level={ level + 1 } />
                                )
                            }
                        </View>
                    );
                })
            }
        </View>
    );
};

const styles = StyleSheet.create({
    text: {
        fontFamily: Fonts.light, fontWeight: "300",
        fontSize: FontSizes.privacyPolicyText,
        fontSize: FontSizes.privacyPolicyText
    }
});

export default NestedList;