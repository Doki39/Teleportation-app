import "dotenv/config";

/** @type {import('@expo/config').ExpoConfig} */
export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    apiBaseUrl: process.env.API_BASE_URL,
  },
});

