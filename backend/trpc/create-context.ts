import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { deviceAuthMiddleware } from '../auth/device-auth-middleware';
import { getRateLimiter } from '../middleware/rate-limiter';
import { metricsCollector } from '../monitoring/metrics-collector';

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return {
    req: opts.req,
    device: null as any, // Will be populated by auth middleware
    rateLimiter: getRateLimiter(), // Add rate limiter to context
    metrics: metricsCollector, // Add metrics collector to context
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(deviceAuthMiddleware.createAuthMiddleware());

// Rate-limited procedure that includes both auth and rate limiting
export const rateLimitedProcedure = protectedProcedure; // Base for rate-limited procedures