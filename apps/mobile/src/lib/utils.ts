import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatStr: string = 'PPP'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: es });
}

export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
}

export function formatMatchScore(
  team1Score: number | null,
  team2Score: number | null
): string {
  if (team1Score === null || team2Score === null) {
    return 'Pendiente';
  }
  return `${team1Score} - ${team2Score}`;
}

export function getTournamentStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    draft: 'Borrador',
    registration_open: 'Inscripción Abierta',
    registration_closed: 'Inscripción Cerrada',
    in_progress: 'En Progreso',
    completed: 'Finalizado',
    cancelled: 'Cancelado',
  };
  return statusMap[status] || status;
}

export function getMatchStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pendiente',
    in_progress: 'En Progreso',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };
  return statusMap[status] || status;
}

export function getTournamentStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    registration_open: 'bg-green-100 text-green-800',
    registration_closed: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}

export function getMatchStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}
