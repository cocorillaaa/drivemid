import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UrlTree, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserRole } from '../models/fleet.models';
import { AuthService } from '../services/auth.service';
import { roleGuard } from './role.guard';

/**
 * Regresión: el guard debe redirigir siempre a la vista del rol **activo**.
 *
 * Una versión anterior redirigía a la ruta vigilada cuando el rol no
 * coincidía, lo que producía un ciclo infinito de navegación al abrir un
 * enlace directo a `/plataforma/unidad` con rol de Superusuario.
 */
describe('roleGuard', () => {
  let currentRole: ReturnType<typeof signal<UserRole | null>>;

  beforeEach(() => {
    currentRole = signal<UserRole | null>('superuser');

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { role: currentRole } },
      ],
    });
  });

  /** Ejecuta el guard dentro de un contexto de inyección de Angular. */
  function runGuard(expected: UserRole): boolean | UrlTree {
    return TestBed.runInInjectionContext(() => {
      const guard = roleGuard(expected);
      return guard({} as never, {} as never) as boolean | UrlTree;
    });
  }

  it('permite la navegación cuando el rol activo coincide con el esperado', () => {
    currentRole.set('superuser');
    expect(runGuard('superuser')).toBe(true);

    currentRole.set('unit_admin');
    expect(runGuard('unit_admin')).toBe(true);
  });

  it('redirige a la vista del rol activo y nunca a la ruta vigilada', () => {
    currentRole.set('superuser');

    const result = runGuard('unit_admin');

    expect(result).toBeInstanceOf(UrlTree);
    // El destino es la vista del rol activo (Superusuario), no la solicitada:
    // redirigir a `/plataforma/unidad` provocaría un ciclo infinito.
    expect(String(result)).toBe('/plataforma/flota');
  });

  it('redirige al Administrador de Unidad cuando intenta abrir el panel global', () => {
    currentRole.set('unit_admin');

    const result = runGuard('superuser');

    expect(result).toBeInstanceOf(UrlTree);
    expect(String(result)).toBe('/plataforma/unidad');
  });

  it('envía al acceso cuando no hay sesión activa', () => {
    currentRole.set(null);

    const result = runGuard('superuser');

    expect(result).toBeInstanceOf(UrlTree);
    expect(String(result)).toBe('/acceso');
  });
});
