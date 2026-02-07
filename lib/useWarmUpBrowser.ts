import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Platform } from "react-native";

export const useWarmUpBrowser = () => {
    useEffect(() => {
        if (Platform.OS !== "android") return;

        void WebBrowser.warmUpAsync().catch((err) => {
            console.warn("Warm up failed, ignoring...", err);
        });

        return () => {
            void WebBrowser.coolDownAsync().catch((err) => {
                console.warn("Cool down failed, ignoring...", err);
            });
        };
    }, []);
};
