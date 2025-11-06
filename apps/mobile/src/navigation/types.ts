import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  TournamentsTab: NavigatorScreenParams<TournamentStackParamList>;
  MatchesTab: NavigatorScreenParams<MatchStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type HomeStackParamList = {
  Home: undefined;
};

export type TournamentStackParamList = {
  Tournaments: undefined;
  TournamentDetail: { id: string };
  Bracket: { tournamentId: string };
  Standings: { tournamentId: string };
};

export type MatchStackParamList = {
  Matches: undefined;
  MatchDetail: { id: string };
  ReportResult: { matchId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
};
