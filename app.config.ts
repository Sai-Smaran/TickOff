import "tsx/cjs";
import { ExpoConfig } from "expo/config";

const appConfig: ExpoConfig = {
	name: "TickOff",
	slug: "TickOff",
	scheme: "tickoff",
	version: process.env.APP_ENV === "dev" ? "0.0.5-dev" : "0.0.5-alpha",
	orientation: "portrait",
	icon:
		process.env.APP_ENV === "dev"
			? "./assets/icon-dev.png"
			: "./assets/icon.png",
	jsEngine: "hermes",
	userInterfaceStyle: "automatic",
	newArchEnabled: true,
	splash: {
		image: "./assets/splash-icon.png",
		resizeMode: "contain",
		backgroundColor: "#021526",
	},
	plugins: [
		["expo-dev-client"],
		"expo-font",
		[
			"expo-splash-screen",
			{
				image: "./assets/splash-icon.png",
				backgroundColor: "#6eacda",
				dark: {
					image: "./assets/splash-icon-dark.png",
					backgroundColor: "#021526",
				},
				imageWidth: 200,
			},
		],
		[
			"expo-router",
			{
				sitemap: false,
			},
		],
	],
	ios: {
		supportsTablet: true,
	},
	android: {
		adaptiveIcon: {
			foregroundImage: "./assets/adaptive-icon.png",
			backgroundImage: "./assets/adaptive-icon-background.png",
			monochromeImage: "./assets/mono-icon.png",
			backgroundColor: "#021526",
		},
		edgeToEdgeEnabled: true,
		package:
			process.env.APP_ENV === "dev"
				? "com.sai.tickoff_dev"
				: "com.sai.tickoff_beta",
	},
	web: {
		favicon: "./assets/favicon.png",
	},
	extra: {
		eas: {
			projectId: "7d4b3f35-459c-44b3-bd71-511601384305",
		},
	},
	owner: "saismaranvijayagiri2008",
	runtimeVersion: {
		policy: "appVersion",
	},
	updates: {
		url: "https://u.expo.dev/7d4b3f35-459c-44b3-bd71-511601384305",
	},
};

export default appConfig;
