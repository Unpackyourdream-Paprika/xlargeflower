import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // Only show locale in URL when not default
  localeDetection: true, // Detect locale from Accept-Language header
});

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Static files
  // - Internal Next.js files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
