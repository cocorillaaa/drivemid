import { Injectable, computed, signal } from '@angular/core';

/** Roles simulados de la plataforma (sin login real en el prototipo). */
export type UserRole = 'superuser' | 'unit_admin';

export interface RoleProfile {
  id: UserRole;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  userName: string;
  userEmail: string;
  scope: string;
}

/** Catálogo de roles disponibles en el selector de sesión. */
export const ROLE_PROFILES: Record<UserRole, RoleProfile> = {
  superuser: {
    id: 'superuser',
    label: 'Superusuario · Vista global de flota',
    shortLabel: 'Superusuario',
    description: 'Control total de la flota, pólizas, conductores y telemetría.',
    icon: 'bi-shield-lock',
    userName: 'Alejandra Fuentes Ríos',
    userEmail: 'a.fuentes@vanguardfleet.mx',
    scope: 'Dirección de Operaciones',
  },
  unit_admin: {
    id: 'unit_admin',
    label: 'Administrador de Unidad · Vista individual',
    shortLabel: 'Admin. de Unidad',
    description: 'Gestión de una única unidad asignada: kilometraje y contacto.',
    icon: 'bi-person-vcard',
    userName: 'Juan Carlos Ramírez Ortega',
    userEmail: 'juan.ramirez@vanguardfleet.mx',
    scope: 'Unidad 01 · ABC-123',
  },
};

const ROLE_STORAGE_KEY = 'vf.session.role';
const UNIT_STORAGE_KEY = 'vf.session.unitId';

/**
 * Servicio de sesión simulada.
 *
 * Permite alternar entre el rol de Superusuario y el de Administrador de
 * Unidad desde la barra superior, sin necesidad de un login complejo.
 * La selección se persiste en `localStorage` para sobrevivir recargas.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly _role = signal<UserRole>(this.readStorage(ROLE_STORAGE_KEY) === 'unit_admin' ? 'unit_admin' : 'superuser');
  private readonly _activeUnitId = signal<string>(this.readStorage(UNIT_STORAGE_KEY) ?? 'unit-01');

  /** Rol activo. */
  readonly role = this._role.asReadonly();

  /** Identificador de la unidad asignada al rol "Administrador de Unidad". */
  readonly activeUnitId = this._activeUnitId.asReadonly();

  /** Perfil completo del rol activo. */
  readonly profile = computed<RoleProfile>(() => ROLE_PROFILES[this._role()]);

  /** `true` cuando la sesión opera como Superusuario. */
  readonly isSuperuser = computed(() => this._role() === 'superuser');

  /** `true` cuando la sesión opera como Administrador de Unidad. */
  readonly isUnitAdmin = computed(() => this._role() === 'unit_admin');

  /** Cambia el rol activo y persiste la preferencia. */
  setRole(role: UserRole): void {
    this._role.set(role);
    this.writeStorage(ROLE_STORAGE_KEY, role);
  }

  /** Fija la unidad activa para el rol "Administrador de Unidad". */
  setActiveUnit(unitId: string): void {
    this._activeUnitId.set(unitId);
    this.writeStorage(UNIT_STORAGE_KEY, unitId);
  }

  /** Alterna rápidamente entre ambos roles. */
  toggleRole(): UserRole {
    const next: UserRole = this._role() === 'superuser' ? 'unit_admin' : 'superuser';
    this.setRole(next);
    return next;
  }

  private readStorage(key: string): string | null {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  private writeStorage(key: string, value: string): void {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      /* almacenamiento no disponible: la demo sigue funcionando en memoria */
    }
  }
}
