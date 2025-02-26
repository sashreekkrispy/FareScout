import { Stack } from "expo-router";
import { useFonts } from "expo-font";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'outfit': require('./../assets/fonts/Outfit-Regular.ttf'),
    'outfit-medium': require('./../assets/fonts/Outfit-Medium.ttf'),
    'outfit-Bold': require('./../assets/fonts/Outfit-Bold.ttf'),
  });
  return(
  <Stack screenOptions={{
    headerShown:false
  }}>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="login"  options={{ headerShown: false }}/>
    
  </Stack>);
}
