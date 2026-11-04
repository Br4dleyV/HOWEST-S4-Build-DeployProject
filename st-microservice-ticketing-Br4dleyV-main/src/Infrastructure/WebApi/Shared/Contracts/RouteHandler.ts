import type { Next, RouterContext } from '@oak/oak';

export interface RouteHandler {
    handle(ctx: RouterContext<string>, next: Next): Promise<void>;
}
