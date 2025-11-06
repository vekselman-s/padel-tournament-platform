import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NOTIFICATION_CHANNELS } from './constants';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(
      NOTIFICATION_CHANNELS.MATCH_REMINDERS,
      {
        name: 'Recordatorios de Partidos',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0ea5e9',
      }
    );

    await Notifications.setNotificationChannelAsync(
      NOTIFICATION_CHANNELS.TOURNAMENT_UPDATES,
      {
        name: 'Actualizaciones de Torneos',
        importance: Notifications.AndroidImportance.DEFAULT,
      }
    );

    await Notifications.setNotificationChannelAsync(
      NOTIFICATION_CHANNELS.GENERAL,
      {
        name: 'General',
        importance: Notifications.AndroidImportance.DEFAULT,
      }
    );
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

export async function scheduleMatchReminder(
  matchId: string,
  matchDate: Date,
  opponent: string
) {
  const trigger = new Date(matchDate.getTime() - 60 * 60 * 1000); // 1 hour before

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Recordatorio de Partido',
      body: `Tu partido contra ${opponent} comienza en 1 hora`,
      data: { matchId, type: 'match_reminder' },
      sound: true,
    },
    trigger,
  });
}

export async function cancelMatchReminder(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function showLocalNotification(
  title: string,
  body: string,
  data?: any
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // Show immediately
  });
}

export function addNotificationReceivedListener(
  listener: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(listener);
}

export function addNotificationResponseReceivedListener(
  listener: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(listener);
}
