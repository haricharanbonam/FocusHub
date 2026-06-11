import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SavesProvider } from '../context/SavesContext';
import { AIProvider } from '../context/AIContext';

export default function RootLayout() {
  return (
    <SavesProvider>
      <AIProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0A0A0F' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="reader/[id]"
            options={{
              headerShown: false,
              presentation: 'fullScreenModal',
            }}
          />
        </Stack>
      </AIProvider>
    </SavesProvider>
  );
}
