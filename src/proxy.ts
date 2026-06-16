import { NextRequest, NextResponse } from 'next/server'

const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? 'localhost'

/**
 * Extrae el slug del tenant desde el subdominio del request.
 *
 * Ejemplos:
 *   clinica-norte.tuapp.com  → 'clinica-norte'
 *   demo.localhost:3000       → 'demo'
 *   localhost:3000            → null  (raíz, sin tenant)
 *   tuapp.com                 → null  (landing/marketing)
 */
function extractTenantSlug(hostname: string): string | null {
  // Quitar el puerto si existe
  const host = hostname.split(':')[0]

  // Caso desarrollo: demo.localhost
  if (host === ROOT_DOMAIN || host === 'www.' + ROOT_DOMAIN) return null

  // Subdominio presente
  const parts = host.split('.')
  if (parts.length < 2) return null

  const subdomain = parts[0]

  // Ignorar subdominios reservados
  if (['www', 'app', 'api', 'admin', 'superadmin'].includes(subdomain)) return null

  return subdomain
}

export function proxy(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl

  // No interceptar archivos estáticos ni rutas de Next internos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')          // archivos con extensión: .ico, .png, etc.
  ) {
    return NextResponse.next()
  }

  const slug = extractTenantSlug(hostname)

  if (!slug) {
    // Sin tenant → redirigir a landing o mostrar página de inicio
    return NextResponse.next()
  }

  // Propagar el slug como header para que los Server Components lo lean
  // sin necesidad de parsear la URL de nuevo.
  const response = NextResponse.next()
  response.headers.set('x-tenant-slug', slug)
  return response
}

export const config = {
  matcher: [
    /*
     * Aplica a todos los paths excepto:
     * - _next/static (archivos estáticos)
     * - _next/image  (optimización de imágenes)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
