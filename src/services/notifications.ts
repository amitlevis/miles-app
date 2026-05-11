/**
 * Push notification registration.
 *
 * On every signed-in launch we request permission (if not already granted),
 * fetch the device's Expo push token, and save it to the user's profile.
 *
 * The actual delivery is server-side: AFTER INSERT triggers on moods /
 * heartbeats / photos / memory_jar_notes call the `notify-partner` edge
 * function (via pg_net), which looks up the OTHER partner's push token
 * and dispatches an Expo push.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Foreground notification handler — show the banner + play sound + badge
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Registers for push notifications and stores the resulting Expo token on
 * the profile so the partner can DM us via the notify-partner edge function.
 *
 * Returns the token if successful; null if denied / unsupported.
 */
export async function registerForPushNotifications(
  userId: string
): Promise<string | null> {
  if (!Device.isDevice) {
    // Push doesn't work on simulators — no point trying
    return null;
  }

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;

    if (status !== 'granted') {
      const { status: asked } = await Notifications.requestPermissionsAsync();
      status = asked;
    }

    if (status !== 'granted') {
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Miles',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFB830',
        sound: 'default',
      });
    }

    const tokenRes = await Notifications.getExpoPushTokenAsync();
    const token = tokenRes.data;
    if (!token) return null;

    const platform: 'ios' | 'android' | 'web' =
      Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web';

    // Persist on profile so the edge function can read it
    await supabase
      .from('profiles')
      .update({ push_token: token, push_platform: platform })
      .eq('id', userId);

    return token;
  } catch (err) {
    console.warn('[notifications] register failed:', err);
    return null;
  }
}

/**
 * Adds a foreground listener that fires when a notification arrives while
 * the app is open. Returns the unsubscribe function.
 */
export function onNotificationReceived(
  handler: (n: Notifications.Notification) => void
) {
  const sub = Notifications.addNotificationReceivedListener(handler);
  return () => sub.remove();
}

/**
 * Adds a listener that fires when the user taps a notification.
 */
export function onNotificationTapped(
  handler: (r: Notifications.NotificationResponse) => void
) {
  const sub = Notifications.addNotificationResponseReceivedListener(handler);
  return () => sub.remove();
}
