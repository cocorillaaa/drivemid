import { UserRole } from '../models/fleet.models';

/** Ruta canónica de cada rol dentro de la plataforma. */
export const ROLE_HOME: Record<UserRole, string> = {
  superuser: '/plataforma/flota',
  unit_admin: '/plataforma/unidad',
};

/** Ruta de inicio que corresponde a un rol (o al acceso si no hay sesión). */
export function homeRouteFor(role: UserRole | null): string {
  return role ? ROLE_HOME[role] : '/acceso';
}
