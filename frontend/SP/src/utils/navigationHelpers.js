export function goBackOrHome(navigation, { fallbackRoute = "Home" } = {}) {
  if (navigation.canGoBack()) {
    navigation.goBack();
  } else {
    navigation.replace(fallbackRoute);
  }
}