import { useEffect, useCallback } from 'react';

// expo-notifications remote push was removed from Expo Go in SDK 53.
// We guard all calls so the app degrades gracefully in Expo Go.
// Local scheduled notifications still work in development builds.
let Notifications: typeof import('expo-notifications') | null = null;

try {
  Notifications = require('expo-notifications');

  Notifications?.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('expo-notifications not available in this environment:', e);
}

export function useNotifications() {
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (!Notifications) return;
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
      }
    } catch (e) {
      console.warn('Notification permission request failed:', e);
    }
  };

  const scheduleReminder = useCallback(async (
    saveId: string,
    title: string,
    date: Date
  ): Promise<string | null> => {
    if (!Notifications) return null;
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📖 Time to read!',
          body: title,
          data: { saveId },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
        },
      });
      return id;
    } catch (e) {
      console.warn('Schedule notification error:', e);
      return null;
    }
  }, []);

  const cancelReminder = useCallback(async (notificationId: string) => {
    if (!Notifications) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (e) {
      console.warn('Cancel notification error:', e);
    }
  }, []);

  return { scheduleReminder, cancelReminder };
}
