import "dotenv/config";

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    apiBaseUrl: process.env.API_BASE_URL,
  },
  plugins: [
    ...(config.plugins ?? []),
    [
      "expo-media-library",
      {
        photosPermission:
          "Allow $(PRODUCT_NAME) to save photos you create to your gallery.",
        savePhotosPermission:
          "Allow $(PRODUCT_NAME) to save photos you create to your gallery.",
        granularPermissions: ["photo"],
      },
    ],
  ],
});

