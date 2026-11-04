import * as mod from '@/Main/Modules/mod.ts';
import { DIAwareMain } from '@/Main/Modules/Shared/mod.ts';

const modules = [
    mod.Tools.create(),
    mod.Application.create(),
    mod.Events.create(),
    mod.Persistence.create(),
    mod.WebApi.create(),
];

export class Main extends DIAwareMain {
    static async init(): Promise<Main> {
        return await new Main().load(modules);
    }
}

if (import.meta.main) {
    await Main.init();
}
