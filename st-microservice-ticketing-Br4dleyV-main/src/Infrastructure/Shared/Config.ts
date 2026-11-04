export class Config {
    private readonly _environmentVariables: Deno.Env;

    static create(): Config {
        return new Config();
    }

    private constructor() {
        this._environmentVariables = Deno.env;
    }

    public get(key: string, defaultValue: string = ''): string {
        return this._environmentVariables.get(key) ?? defaultValue;
    }
}
