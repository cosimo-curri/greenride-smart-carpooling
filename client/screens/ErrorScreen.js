import { StyleSheet, View, Image } from "react-native";
import { useAssetsContext } from "../contexts/AssetsContext";

import Colors from "../theme/colors";

import Header from "../components/Header";

function ErrorScreen({ navigation }) {
    const { globalAssets } = useAssetsContext();

    return (
        <View style={ styles.container }>
            <Header
                logo={ globalAssets.logo.localUri }
                stories={ false }
                noBoxShadow={ true }
                hamburgerData={[
                    {
                        text: "Start from scratch",
                        handle: () => navigation.navigate("Splash")
                    }
                ]}
            />

            <View style={ styles.imageBox }>
                <Image
                    source={{ uri: globalAssets.error.localUri }}
                    style={ styles.image }
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white
    },
    image: {
        width: 200,
        aspectRatio: 0.75,
        resizeMode: "contain",
        marginBottom: 100
    },
    imageBox: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    }
});

export default ErrorScreen;