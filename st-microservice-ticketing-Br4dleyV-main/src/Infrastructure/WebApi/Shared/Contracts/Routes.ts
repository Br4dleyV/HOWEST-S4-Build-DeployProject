import type { Router } from '@oak/oak';
import type { RouterBuilder } from '../mod.ts';

export interface Routes {
    map(routerBuilder: RouterBuilder): Router;
}
