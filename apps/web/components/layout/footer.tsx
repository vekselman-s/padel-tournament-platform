import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { SITE_NAME, ROUTES } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary-600" />
              <span className="text-lg font-bold text-gray-900">{SITE_NAME}</span>
            </div>
            <p className="text-sm text-gray-600">
              Plataforma integral para la gestión de torneos de pádel
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Torneos</h3>
            <ul className="space-y-2">
              <li>
                <Link href={ROUTES.TOURNAMENTS} className="text-sm text-gray-600 hover:text-primary-600">
                  Buscar Torneos
                </Link>
              </li>
              <li>
                <Link href={ROUTES.CLUBS} className="text-sm text-gray-600 hover:text-primary-600">
                  Clubes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Cuenta</h3>
            <ul className="space-y-2">
              <li>
                <Link href={ROUTES.DASHBOARD} className="text-sm text-gray-600 hover:text-primary-600">
                  Mi Dashboard
                </Link>
              </li>
              <li>
                <Link href={ROUTES.DASHBOARD_PROFILE} className="text-sm text-gray-600 hover:text-primary-600">
                  Mi Perfil
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-primary-600">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-primary-600">
                  Términos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} {SITE_NAME}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
