import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/theme/ThemeContext';
import { OnboardingOverlay } from './src/components/OnboardingOverlay';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <View style={styles.root}>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
            <OnboardingOverlay />
          </View>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    ...(Platform.OS === 'web' ? ({ height: '100vh' } as any) : {}),
  },
});
