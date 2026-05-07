import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Shadows } from '../constants/colors';
import { FontFamily, FontSize } from '../constants/typography';

import { HomeScreen } from '../screens/home/HomeScreen';
import { TogetherScreen } from '../screens/together/TogetherScreen';
import { WidgetsScreen } from '../screens/widgets/WidgetsScreen';
import { DatesScreen } from '../screens/dates/DatesScreen';
import { MemoriesScreen } from '../screens/memories/MemoriesScreen';

const Tab = createBottomTabNavigator();

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
}

function TabIcon({ emoji, label, focused }: TabIconProps) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Together"
        component={TogetherScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🎬" label="Together" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Widgets"
        component={WidgetsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🧩" label="Widgets" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Dates"
        component={DatesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📅" label="Dates" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Memories"
        component={MemoriesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📸" label="Memories" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    ...Shadows.medium,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    minWidth: 56,
  },
  tabIconActive: {
    backgroundColor: Colors.yellowPale,
  },
  emoji: { fontSize: 22 },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.medium,
    marginTop: 2,
  },
  labelActive: {
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
  },
});
