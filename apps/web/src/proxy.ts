import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Verificamos si la ruta actual está dentro de /dashboard o /superadmin
  if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/superadmin')) {
    // Buscar la cookie del token de autenticación
    const token = request.cookies.get('token');

    // Si no hay token, redirigir al login
    if (!token) {
      const loginUrl = new URL('/', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // (Opcional: aquí podríamos decodificar el JWT para validar que si va a /superadmin, 
    // realmente tenga el rol SUPERADMIN. Por simplicidad de momento se valida en backend).
  }

  // Si hay token o la ruta no está protegida, dejar continuar
  return NextResponse.next();
}

// Configurar el matcher para que solo se ejecute en las rutas necesarias
export const config = {
  matcher: ['/dashboard/:path*', '/superadmin/:path*'],
};
