/**
 * Base publica del sistema legacy (donde vive todo lo que todavia no
 * se migro a este frontend: paginas .php, imagenes, logos, fotos de
 * perfil). No es un secreto -- es simplemente el host donde hoy se
 * sirven esos recursos estaticos y esas pantallas, asi que se puede
 * hardcodear ademas de pasar por env var si en el futuro cambia.
 */
export const LEGACY_BASE_URL =
  process.env.NEXT_PUBLIC_LEGACY_BASE_URL ?? 'https://treelandev.com.ar/api_daponte'

/** Arma una URL absoluta al sistema legacy a partir de una ruta relativa (ej. "turnos.php", "images/header/logo.png"). */
export function legacyUrl(relativePath: string): string {
  const clean = (relativePath || '').trim().replace(/^\/+/, '')
  return `${LEGACY_BASE_URL}/${clean}`
}

/**
 * Si el link es del tipo "javascript:popMe('archivo.php')" (popups del
 * legacy), extrae el nombre de archivo interno. Devuelve null si no
 * matchea ese patron.
 */
export function extraerArchivoDePopup(jsLink: string): string | null {
  const match = jsLink.match(/'([^']+\.php[^']*)'/)
  return match ? match[1] : null
}
