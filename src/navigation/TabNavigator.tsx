import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, Platform, View } from 'react-native';
import { Colors } from '../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../constants/typography';

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
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
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
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 14,
    left: 16,
    right: 16,
    height: 68,
    backgroundColor: Colors.dark,
    borderRadius: 34,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 20,
    paddingBottom: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 22,
    gap: 3,
    minWidth: 52,
  },
  tabItemActive: {
    backgroundColor: 'rgba(255,184,48,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.25)',
  },
  emoji: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: Colors.yellow,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
});
