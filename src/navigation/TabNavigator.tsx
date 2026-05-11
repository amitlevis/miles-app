import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, Platform, View } from 'react-native';
import { FontFamily, FontSize, FontWeight } from '../constants/typography';
import { useTheme } from '../theme/ThemeContext';

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
  activeBg: string;
  activeBorder: string;
  activeText: string;
  inactiveText: string;
}

function TabIcon({
  emoji,
  label,
  focused,
  activeBg,
  activeBorder,
  activeText,
  inactiveText,
}: TabIconProps) {
  return (
    <View
      style={[
        styles.tabItem,
        focused && {
          backgroundColor: activeBg,
          borderWidth: 1,
          borderColor: activeBorder,
        },
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? activeText : inactiveText },
          focused && styles.tabLabelActive,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export function TabNavigator() {
  const theme = useTheme();

  const tabBarStyle = {
    ...styles.tabBar,
    backgroundColor: theme.tabBarBg,
    borderColor: theme.tabBarBorder,
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji="🏠"
              label="Home"
              focused={focused}
              activeBg={theme.tabBarActiveBg}
              activeBorder={theme.tabBarActiveBorder}
              activeText={theme.tabBarActiveText}
              inactiveText={theme.tabBarInactiveText}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Together"
        component={TogetherScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji="🎬"
              label="Together"
              focused={focused}
              activeBg={theme.tabBarActiveBg}
              activeBorder={theme.tabBarActiveBorder}
              activeText={theme.tabBarActiveText}
              inactiveText={theme.tabBarInactiveText}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Widgets"
        component={WidgetsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji="🧩"
              label="Widgets"
              focused={focused}
              activeBg={theme.tabBarActiveBg}
              activeBorder={theme.tabBarActiveBorder}
              activeText={theme.tabBarActiveText}
              inactiveText={theme.tabBarInactiveText}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Dates"
        component={DatesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji="📅"
              label="Dates"
              focused={focused}
              activeBg={theme.tabBarActiveBg}
              activeBorder={theme.tabBarActiveBorder}
              activeText={theme.tabBarActiveText}
              inactiveText={theme.tabBarInactiveText}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Memories"
        component={MemoriesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji="📸"
              label="Memories"
              focused={focused}
              activeBg={theme.tabBarActiveBg}
              activeBorder={theme.tabBarActiveBorder}
              activeText={theme.tabBarActiveText}
              inactiveText={theme.tabBarInactiveText}
            />
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
    borderRadius: 34,
    borderTopWidth: 0,
    borderWidth: 1,
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
  emoji: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
});
