import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/api/webhooks(.*)']);

export default clerkMiddleware((auth, request) => {
  if (isPublicRoute(request)) return NextResponse.next();

  auth().protect();
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
