import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { Trophy, Calendar, Users, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white py-20 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                La plataforma definitiva para{' '}
                <span className="text-primary-600">torneos de pádel</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Organiza, gestiona y participa en torneos de pádel de forma simple y eficiente.
                Todo lo que necesitas en un solo lugar.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Link href={ROUTES.TOURNAMENTS}>
                  <Button size="lg">Explorar Torneos</Button>
                </Link>
                <Link href={ROUTES.AUTH_REGISTER}>
                  <Button size="lg" variant="outline">
                    Comenzar Gratis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Todo lo que necesitas
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Gestión completa de torneos con herramientas profesionales
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                  <Trophy className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">Múltiples Formatos</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Eliminación simple/doble, Round Robin, Americano, Mexicano
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">Programación</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Gestión de horarios y canchas automática
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">Registro Fácil</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Inscripción de equipos en segundos
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                  <Award className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">Rankings</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Sistema de ranking ELO integrado
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary-600 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white">
              ¿Listo para organizar tu torneo?
            </h2>
            <p className="mt-4 text-lg text-primary-100">
              Únete a cientos de organizadores que confían en nosotros
            </p>
            <div className="mt-8">
              <Link href={ROUTES.AUTH_REGISTER}>
                <Button size="lg" variant="secondary">
                  Crear Cuenta Gratis
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
