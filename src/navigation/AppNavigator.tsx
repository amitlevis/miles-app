import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useCoupleStore } from '../store/coupleStore';
import { TabNavigator } from './TabNavigator';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { CoupleLinkScreen } from '../screens/auth/CoupleLinkScreen';
import { WatchTogetherScreen } from '../screens/together/WatchTogetherScreen';
import { ListenTogetherScreen } from '../screens/together/ListenTogetherScreen';
import { GamesScreen } from '../screens/together/GamesScreen';
import { DatePlannerScreen } from '../screens/dates/DatePlannerScreen';
import { MemoryJarScreen } from '../screens/memories/MemoryJarScreen';
import { ShopScreen } from '../screens/shop/ShopScreen';
import { Colors } from '../constants/colors';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  CoupleLink: undefined;
  Main: undefined;
  WatchTogether: undefined;
  ListenTogether: undefined;
  Games: undefined;
  DatePlanner: undefined;
  MemoryJar: undefined;
  Shop: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isAuthenticated, isLinked, login, logout, linkPartner, setReunionDate } = useCoupleStore();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async (session: Session) => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          login({
            id: profile.id,
            name: profile.name,
            avatar: profile.avatar_url,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            location: null,
          });
        }

        const { data: couple } = await supabase
          .from('couples')
          .select('*')
          .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
          .maybeSingle();

        if (couple) {
          const partnerId =
            couple.user1_id === session.user.id ? couple.user2_id : couple.user1_id;

          const { data: partnerProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', partnerId)
            .single();

          if (partnerProfile) {
            linkPartner({
              id: partnerProfile.id,
              name: partnerProfile.name,
              avatar: partnerProfile.avatar_url,
              timeZone: 'UTC',
              location: null,
            });
          }

          if (couple.reunion_date) {
            setReunionDate(new Date(couple.reunion_date));
          }
        }
      } catch (err) {
        console.error('loadUserData error:', err);
      }
    };

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) await loadUserData(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadUserData(session);
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.cream }}>
        <ActivityIndicator size="large" color={Colors.yellow} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: Platform.OS === 'web' ? 'default' : 'fade_from_bottom' }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      ) : !isLinked ? (
        <Stack.Screen name="CoupleLink" component={CoupleLinkScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="WatchTogether"
            component={WatchTogetherScreen}
            options={{ animation: Platform.OS === 'web' ? 'default' : 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="ListenTogether"
            component={ListenTogetherScreen}
            options={{ animation: Platform.OS === 'web' ? 'default' : 'slide_from_bottom' }}
          />
          <Stack.Screen name="Games" component={GamesScreen} />
          <Stack.Screen name="DatePlanner" component={DatePlannerScreen} />
          <Stack.Screen name="MemoryJar" component={MemoryJarScreen} />
          <Stack.Screen name="Shop" component={ShopScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
