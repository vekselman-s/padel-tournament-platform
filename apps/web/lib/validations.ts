import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const teamRegistrationSchema = z.object({
  player1Id: z.string().cuid('ID de jugador inválido'),
  player2Id: z.string().cuid('ID de jugador inválido'),
  categoryId: z.string().cuid('ID de categoría inválido'),
  teamName: z.string().optional(),
}).refine((data) => data.player1Id !== data.player2Id, {
  message: 'Los jugadores deben ser diferentes',
  path: ['player2Id'],
});

export const matchResultSchema = z.object({
  matchId: z.string().cuid(),
  sets: z.array(
    z.object({
      setNumber: z.number().int().min(1).max(5),
      gamesA: z.number().int().min(0).max(7),
      gamesB: z.number().int().min(0).max(7),
      tiebreakA: z.number().int().min(0).max(20).optional(),
      tiebreakB: z.number().int().min(0).max(20).optional(),
    })
  ).min(1).max(5),
  photoProof: z.string().url().optional(),
  notes: z.string().max(500).optional(),
});

export const tournamentFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['DRAFT', 'REGISTRATION', 'LIVE', 'FINISHED', 'CANCELLED']).optional(),
  format: z.enum(['SINGLE_ELIM', 'DOUBLE_ELIM', 'ROUND_ROBIN', 'AMERICANO', 'MEXICANO', 'GROUPS_PLAYOFFS']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  clubId: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(12),
});

export const createTournamentSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  clubId: z.string().cuid('Selecciona un club'),
  startAt: z.string().datetime('Fecha de inicio inválida'),
  endAt: z.string().datetime('Fecha de fin inválida'),
  location: z.string().min(3, 'La ubicación es requerida'),
  format: z.enum(['SINGLE_ELIM', 'DOUBLE_ELIM', 'ROUND_ROBIN', 'AMERICANO', 'MEXICANO', 'GROUPS_PLAYOFFS']),
  maxTeams: z.number().int().min(2).optional(),
  minTeams: z.number().int().min(2).optional(),
  entryFeeCents: z.number().int().min(0).default(0),
  currency: z.string().default('USD'),
  visibility: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE']).default('PUBLIC'),
  coverUrl: z.string().url().optional(),
  categories: z.array(
    z.object({
      name: z.string().min(2),
      gender: z.enum(['M', 'F', 'X']),
      level: z.number().int().min(1).max(7),
      maxTeams: z.number().int().min(2).optional(),
    })
  ).min(1, 'Debes crear al menos una categoría'),
}).refine((data) => new Date(data.endAt) > new Date(data.startAt), {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endAt'],
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  locale: z.enum(['es', 'en']).default('es'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TeamRegistrationInput = z.infer<typeof teamRegistrationSchema>;
export type MatchResultInput = z.infer<typeof matchResultSchema>;
export type TournamentFilterInput = z.infer<typeof tournamentFilterSchema>;
export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
