export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Padel Tournament Platform';

export const TOURNAMENT_STATUS = {
  DRAFT: 'Borrador',
  REGISTRATION: 'Inscripción Abierta',
  LIVE: 'En Curso',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado',
} as const;

export const TOURNAMENT_FORMAT = {
  SINGLE_ELIM: 'Eliminación Simple',
  DOUBLE_ELIM: 'Eliminación Doble',
  ROUND_ROBIN: 'Round Robin',
  AMERICANO: 'Americano',
  MEXICANO: 'Mexicano',
  GROUPS_PLAYOFFS: 'Grupos + Playoffs',
} as const;

export const MATCH_STATE = {
  PENDING: 'Pendiente',
  ONGOING: 'En Curso',
  DONE: 'Finalizado',
  WALKOVER: 'Walkover',
  CANCELLED: 'Cancelado',
} as const;

export const GENDER = {
  M: 'Masculino',
  F: 'Femenino',
  X: 'Mixto',
} as const;

export const REGISTRATION_STATUS = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  WAITLIST: 'Lista de Espera',
} as const;

export const USER_ROLE = {
  PLAYER: 'Jugador',
  ORGANIZER: 'Organizador',
  ADMIN: 'Administrador',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
} as const;

export const QUERY_KEYS = {
  TOURNAMENTS: 'tournaments',
  TOURNAMENT: 'tournament',
  TEAMS: 'teams',
  TEAM: 'team',
  MATCHES: 'matches',
  MATCH: 'match',
  CLUBS: 'clubs',
  CLUB: 'club',
  USER: 'user',
  REGISTRATIONS: 'registrations',
  STANDINGS: 'standings',
  BRACKET: 'bracket',
} as const;

export const ROUTES = {
  HOME: '/',
  TOURNAMENTS: '/tournaments',
  TOURNAMENT: (id: string) => `/tournaments/${id}`,
  TOURNAMENT_BRACKET: (id: string) => `/tournaments/${id}/bracket`,
  TOURNAMENT_STANDINGS: (id: string) => `/tournaments/${id}/standings`,
  CLUBS: '/clubs',
  CLUB: (id: string) => `/clubs/${id}`,
  DASHBOARD: '/dashboard',
  DASHBOARD_TOURNAMENTS: '/dashboard/tournaments',
  DASHBOARD_TEAMS: '/dashboard/teams',
  DASHBOARD_MATCHES: '/dashboard/matches',
  DASHBOARD_PROFILE: '/dashboard/profile',
  ORGANIZER: '/organizer',
  ORGANIZER_TOURNAMENTS: '/organizer/tournaments',
  ORGANIZER_CREATE_TOURNAMENT: '/organizer/tournaments/create',
  ORGANIZER_TOURNAMENT: (id: string) => `/organizer/tournaments/${id}`,
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  SHARE: (slug: string) => `/share/${slug}`,
} as const;

export const SPORT_LEVELS = [
  { value: 1, label: 'Nivel 1 - Principiante' },
  { value: 2, label: 'Nivel 2 - Iniciado' },
  { value: 3, label: 'Nivel 3 - Intermedio' },
  { value: 4, label: 'Nivel 4 - Avanzado' },
  { value: 5, label: 'Nivel 5 - Experto' },
  { value: 6, label: 'Nivel 6 - Profesional' },
  { value: 7, label: 'Nivel 7 - Elite' },
] as const;

export const COURT_SURFACE = {
  GRASS: 'Césped',
  HARD: 'Dura',
  CLAY: 'Tierra Batida',
  INDOOR: 'Interior',
  OUTDOOR: 'Exterior',
} as const;
