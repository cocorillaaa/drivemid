import { Injectable } from '@angular/core';

const TOKEN_KEY = 'dl.auth.token';
const DEVICE_KEY = 'dl.auth.device';

/**
 * Persistencia del token de acceso.
 *
 * Se mantiene aislado de `AuthService` para que el interceptor HTTP pueda
 * leer el token sin provocar una dependencia circular con `HttpClient`.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  /** Token Bearer vigente, o `null`. */
  read(): string | null {
    return this.safeGet(TOKEN_KEY);
  }

  /** Guarda el token emitido por la API. */
  write(token: string): void {
    this.safeSet(TOKEN_KEY, token);
  }

  /** Elimina el token almacenado. */
  clear(): void {
    this.safeRemove(TOKEN_KEY);
  }

  /** Nombre del dispositivo con el que se registra la sesión. */
  deviceName(): string {
    const stored = this.safeGet(DEVICE_KEY);
    if (stored) return stored;

    const generated = `web-${Math.random().toString(36).slice(2, 8)}`;
    this.safeSet(DEVICE_KEY, generated);

    return generated;
  }

  private safeGet(key: string): string | null {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  private safeSet(key: string, value: string): void {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      /* almacenamiento no disponible: la sesión vive sólo en memoria */
    }
  }

  private safeRemove(key: string): void {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      /* sin almacenamiento no hay nada que limpiar */
    }
  }
}
