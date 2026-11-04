import type { RouterContext } from '@oak/oak';
import type { WebApiController } from '../mod.ts';

export interface ControllerFactory {
    create(ctx: RouterContext<string>): Promise<WebApiController>;
}
