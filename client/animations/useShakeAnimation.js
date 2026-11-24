import { useRef } from "react";
import { Animated, Vibration } from "react-native";

export default function useShakeAnimation() {
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const startShake = () => {
        Vibration.vibrate(300);

        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
        ]).start();
    };

    return { shakeAnim, startShake };
}