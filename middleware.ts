import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // Always show locale in URL for consistent language switching
  localeDetection: true, // Detect locale from Accept-Language header
});

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Redirect /xx/admin to /admin (where xx is any locale)
  const adminWithLocaleMatch = pathname.match(/^\/(ko|en|ja)\/admin(\/.*)?$/);
  if (adminWithLocaleMatch) {
    const adminPath = adminWithLocaleMatch[2] || '';
    return NextResponse.redirect(new URL(`/admin${adminPath}`, request.url));
  }

  // Skip i18n for admin routes
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Static files
  // - Internal Next.js files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
