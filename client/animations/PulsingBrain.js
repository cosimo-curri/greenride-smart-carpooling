import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming
} from "react-native-reanimated";

const PulsingBrain = (props) => {
    const scale = useSharedValue(1);

    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.1, { duration: 400 }),
                withTiming(1, { duration: 400 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }]
        };
    });

    return (
        <View style={ styles.container }>
            <Animated.Image
                source={{ uri: props.brain }}
                style={[styles.brain, animatedStyle]}
                resizeMode="contain"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    brain: {
        width: 100,
        height: 100
    }
});

export default PulsingBrain;