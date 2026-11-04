import type { RouterContext } from '@oak/oak';
import { Optional } from '@domaincrafters/std';

export class WebApiRequest {
    private readonly ctx: RouterContext<string>;

    static async create(
        ctx: RouterContext<string>,
        validate: (ctx: RouterContext<string>) => Promise<void>,
    ): Promise<WebApiRequest> {
        await validate(ctx);
        return new WebApiRequest(ctx);
    }

    async body<Type>(): Promise<Type> {
        return await this.ctx.request.body.json() as Type;
    }

    parameter(key: string): string {
        return Optional.ofNullable<string>(this.ctx.params[key])
            .getOrThrow(`Param with key ${key} not found`);
    }

    private constructor(ctx: RouterContext<string>) {
        this.ctx = ctx;
    }
}
