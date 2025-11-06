import Constants from 'expo-constants';

export const API_URL =
  Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001/api';

export const APP_NAME = 'Padel Tournament';

export const TOURNAMENT_FORMATS = [
  { value: 'single_elimination', label: 'Eliminación Directa' },
  { value: 'round_robin', label: 'Todos Contra Todos' },
  { value: 'double_elimination', label: 'Doble Eliminación' },
] as const;

export const MATCH_STATUSES = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
] as const;

export const TOURNAMENT_STATUSES = [
  { value: 'draft', label: 'Borrador' },
  { value: 'registration_open', label: 'Inscripción Abierta' },
  { value: 'registration_closed', label: 'Inscripción Cerrada' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Finalizado' },
  { value: 'cancelled', label: 'Cancelado' },
] as const;

export const NOTIFICATION_CHANNELS = {
  MATCH_REMINDERS: 'match-reminders',
  TOURNAMENT_UPDATES: 'tournament-updates',
  GENERAL: 'general',
} as const;
