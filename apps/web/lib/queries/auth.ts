import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { QUERY_KEYS } from '@/lib/constants';
import type { LoginInput, RegisterInput } from '@/lib/validations';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/auth-store';

export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [QUERY_KEYS.USER, 'current'],
    queryFn: () => authApi.getCurrentUser(),
    enabled: isAuthenticated,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (response) => {
      setUser(response.user);
      setToken(response.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.token);
      }
      queryClient.setQueryData([QUERY_KEYS.USER, 'current'], response.user);
      toast.success(`Bienvenido, ${response.user.name}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al iniciar sesión');
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (response) => {
      setUser(response.user);
      setToken(response.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.token);
      }
      queryClient.setQueryData([QUERY_KEYS.USER, 'current'], response.user);
      toast.success('Cuenta creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear la cuenta');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      queryClient.clear();
      toast.success('Sesión cerrada');
    },
  });
}
