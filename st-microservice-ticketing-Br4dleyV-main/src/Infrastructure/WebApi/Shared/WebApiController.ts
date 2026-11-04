import type { RouterContext } from '@oak/oak';

export interface WebApiController {
    handle(ctx: RouterContext<string>): Promise<void>;
}
