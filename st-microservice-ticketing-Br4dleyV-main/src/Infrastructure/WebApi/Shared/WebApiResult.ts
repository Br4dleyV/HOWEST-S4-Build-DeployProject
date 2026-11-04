import type { Context, RouterContext } from '@oak/oak';
import { IllegalArgumentException, NotFoundException } from '@domaincrafters/std';
import type { ResponseBody } from '@oak/oak/response';
import { type ProblemDetails, ProblemDetailsBuilder } from './mod.ts';
import { ApplicationException, NotFoundApplicationException } from '@/Application/Shared/mod.ts';
import { DomainException, NotFoundDomainException } from '@/Domain/Shared/mod.ts';

export class WebApiResult {
    static ok(ctx: RouterContext<string>, data: ResponseBody): void {
        ctx.response.status = 200;
        ctx.response.type = 'application/json';
        ctx.response.body = data;
    }

    static created(ctx: RouterContext<string>, location: string): void {
        ctx.response.status = 201;
        ctx.response.headers.set('Location', location);
    }

    static noContent(ctx: RouterContext<string>): void {
        ctx.response.status = 204;
    }

    static problemDetails(context: Context<Record<string, unknown>>, error: Error): void {
        const problemDetailsBuilder: ProblemDetailsBuilder = new ProblemDetailsBuilder();
        if (error instanceof Error) {
            problemDetailsBuilder.withDetail(error.message);
        }

        problemDetailsBuilder.withInstance(context.request.url.href);
        problemDetailsBuilder.withTitle('Internal Server Error');
        problemDetailsBuilder.withStatus(500);
        problemDetailsBuilder.withType('https://tools.ietf.org/html/rfc7231#section-6.6.1');

        if (
            error instanceof NotFoundDomainException ||
            error instanceof NotFoundException ||
            error instanceof NotFoundApplicationException
        ) {
            problemDetailsBuilder.withTitle('Not Found');
            problemDetailsBuilder.withStatus(404);
            problemDetailsBuilder.withType('https://tools.ietf.org/html/rfc7231#section-6.5.4');
        } else if (
            error instanceof IllegalArgumentException || error instanceof DomainException ||
            error instanceof ApplicationException
        ) {
            problemDetailsBuilder.withTitle('Bad Request');
            problemDetailsBuilder.withStatus(400);
            problemDetailsBuilder.withType('https://tools.ietf.org/html/rfc7231#section-6.5.1');
        }

        const problemDetails: ProblemDetails = problemDetailsBuilder.build();
        context.response.type = 'application/problem+json';
        context.response.body = problemDetails;
        context.response.status = problemDetails.status;
    }

    private constructor() {}
}
