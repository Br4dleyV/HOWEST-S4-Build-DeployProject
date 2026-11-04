import type { Application, Middleware, Router } from '@oak/oak';
import type { ApplicationListenEvent } from '@oak/oak/application';

export class OakWebServer {
    private readonly _router: Router;
    private readonly _application: Application;
    private readonly _abortController: AbortController;
    private readonly _hostname: string;
    private readonly _port: number;

    public constructor(
        host: string,
        port: number,
        router: Router,
        application: Application,
    ) {
        this._router = router;
        this._hostname = host;
        this._port = port;
        this._application = application;
        this._abortController = new AbortController();
    }

    public addMiddleware(
        middleware: Middleware,
    ): this {
        this._application.use(middleware);
        return this;
    }

    public run(): void {
        this.addApplicationEventListeners();

        this._application
            .use(this._router.routes())
            .use(this._router.allowedMethods())
            .listen({
                hostname: this._hostname,
                port: this._port,
                signal: this._abortController.signal,
            });
    }

    public stop(): void {
        this._abortController.abort();
    }

    private addApplicationEventListeners(): void {
        this._application.addEventListener('listen', this.listenEventCallback);
        this._application.addEventListener('error', this.errorEventCallback);
        this._application.addEventListener('close', this.closeEventCallback);
    }

    private listenEventCallback(listenEvent: ApplicationListenEvent): void {
        console.log(
            `WebApi is running on ${listenEvent.secure ? 'https' : 'http'}://${
                listenEvent.hostname ?? 'localhost'
            }:${listenEvent.port}`,
        );
    }

    private errorEventCallback(errorEvent: ErrorEvent): void {
        console.error('An error occurred:', errorEvent.error);
    }

    private closeEventCallback(): void {
        console.log('WebApi is closing');
    }
}
