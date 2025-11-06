import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '@/lib/store/auth-store';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ['padel://', 'https://padel.app'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
        },
      },
      Main: {
        screens: {
          HomeTab: {
            screens: {
              Home: 'home',
            },
          },
          TournamentsTab: {
            screens: {
              Tournaments: 'tournaments',
              TournamentDetail: 'tournaments/:id',
              Bracket: 'tournaments/:tournamentId/bracket',
              Standings: 'tournaments/:tournamentId/standings',
            },
          },
          MatchesTab: {
            screens: {
              Matches: 'matches',
              MatchDetail: 'matches/:id',
              ReportResult: 'matches/:matchId/report',
            },
          },
          ProfileTab: {
            screens: {
              Profile: 'profile',
              EditProfile: 'profile/edit',
              Settings: 'settings',
            },
          },
        },
      },
    },
  },
};

export default function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
