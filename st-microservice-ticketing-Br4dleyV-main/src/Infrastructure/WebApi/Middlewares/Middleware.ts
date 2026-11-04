import { Context, Middleware, Next, WebApiResult } from '@/Infrastructure/WebApi/Shared/mod.ts';

export class CorsRulesMiddleware {
    static Add(): Middleware {
        return async (ctx: Context<Record<string, unknown>>, next: Next) => {
            ctx.response.headers.set('Access-Control-Allow-Origin', '*');
            ctx.response.headers.set(
                'Access-Control-Allow-Methods',
                'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            );
            ctx.response.headers.set(
                'Access-Control-Allow-Headers',
                'Content-Type, Authorization, Accept, Origin, X-Requested-With, access-control-expose-headers',
            );
            ctx.response.headers.set('Access-Control-Allow-Credentials', 'true');
            ctx.response.headers.set('origin', '*');
            ctx.response.headers.set(
                'Access-Control-Expose-Headers',
                'Location, LocationOrder, LocationPayment, Content-Type',
            );

            if (ctx.request.method === 'OPTIONS') {
                ctx.response.status = 204; // No content
                return;
            }

            await next();
        };
    }
}

export class GlobalExceptionHandlerMiddleware {
    static Add(): Middleware {
        return async (context: Context<Record<string, unknown>>, next: Next) => {
            try {
                return await next();
            } catch (error: unknown) {
                console.error(error);
                WebApiResult.problemDetails(context, error as Error);
                return context;
            }
        };
    }
}

export class HealthCheckMiddleware {
    static Add(): Middleware {
        return async (ctx: Context<Record<string, unknown>>, next: Next) => {
            if (ctx.request.url.pathname === '/api/health') {
                ctx.response.body = { status: 'ok' };
                ctx.response.status = 200;
                return;
            }
            await next();
        };
    }
}
