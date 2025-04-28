// Type definitions for Next.js App Router route handlers
export type RouteParams<T extends Record<string, string>> = {
  params: T;
};

// Common route context with ID parameter
export type IdRouteContext = RouteParams<{ id: string }>;
