import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import {
  MainTabParamList,
  HomeStackParamList,
  TournamentStackParamList,
  MatchStackParamList,
  ProfileStackParamList,
} from './types';

// Screens
import HomeScreen from '@/screens/home/HomeScreen';
import TournamentsScreen from '@/screens/tournaments/TournamentsScreen';
import TournamentDetailScreen from '@/screens/tournaments/TournamentDetailScreen';
import BracketScreen from '@/screens/tournaments/BracketScreen';
import StandingsScreen from '@/screens/tournaments/StandingsScreen';
import MatchesScreen from '@/screens/matches/MatchesScreen';
import MatchDetailScreen from '@/screens/matches/MatchDetailScreen';
import ReportResultScreen from '@/screens/matches/ReportResultScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import EditProfileScreen from '@/screens/profile/EditProfileScreen';
import SettingsScreen from '@/screens/profile/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const TournamentStack = createStackNavigator<TournamentStackParamList>();
const MatchStack = createStackNavigator<MatchStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

// Tab Icons (Simple text icons for now)
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <Text className={`text-2xl ${focused ? 'text-primary-500' : 'text-gray-400'}`}>
    {name}
  </Text>
);

function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerTitle: 'Inicio' }}
      />
    </HomeStack.Navigator>
  );
}

function TournamentStackScreen() {
  return (
    <TournamentStack.Navigator>
      <TournamentStack.Screen
        name="Tournaments"
        component={TournamentsScreen}
        options={{ headerTitle: 'Torneos' }}
      />
      <TournamentStack.Screen
        name="TournamentDetail"
        component={TournamentDetailScreen}
        options={{ headerTitle: 'Detalles del Torneo' }}
      />
      <TournamentStack.Screen
        name="Bracket"
        component={BracketScreen}
        options={{ headerTitle: 'Cuadro' }}
      />
      <TournamentStack.Screen
        name="Standings"
        component={StandingsScreen}
        options={{ headerTitle: 'Clasificación' }}
      />
    </TournamentStack.Navigator>
  );
}

function MatchStackScreen() {
  return (
    <MatchStack.Navigator>
      <MatchStack.Screen
        name="Matches"
        component={MatchesScreen}
        options={{ headerTitle: 'Mis Partidos' }}
      />
      <MatchStack.Screen
        name="MatchDetail"
        component={MatchDetailScreen}
        options={{ headerTitle: 'Detalles del Partido' }}
      />
      <MatchStack.Screen
        name="ReportResult"
        component={ReportResultScreen}
        options={{ headerTitle: 'Reportar Resultado' }}
      />
    </MatchStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerTitle: 'Perfil' }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerTitle: 'Editar Perfil' }}
      />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerTitle: 'Configuración' }}
      />
    </ProfileStack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ focused }) => <TabIcon name="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="TournamentsTab"
        component={TournamentStackScreen}
        options={{
          tabBarLabel: 'Torneos',
          tabBarIcon: ({ focused }) => <TabIcon name="🏆" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="MatchesTab"
        component={MatchStackScreen}
        options={{
          tabBarLabel: 'Partidos',
          tabBarIcon: ({ focused }) => <TabIcon name="🎾" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon name="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
