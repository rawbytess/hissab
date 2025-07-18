import { otpEmail } from "@lib/email/otp";

export const config = {
	app: {
		name: "Hissab",
		themeColor: "#8100ff",
		logoUrl: "https://app.hissab.io/icons/120.png",
	},
	auth: {
		accessTokenExpiration: 86400,
		refreshTokenExpiration: 2592000,
		otpExpiration: 600,
	},
	email: {
		awsRegion: "us-east-2",
		sourceEmail: "bot@hissab.io",
		subject: "Your One-Time Password (OTP) for Hissab",
		otpExpirationWords: "10 minutes",
		htmlTemplate: otpEmail,
	},
};
