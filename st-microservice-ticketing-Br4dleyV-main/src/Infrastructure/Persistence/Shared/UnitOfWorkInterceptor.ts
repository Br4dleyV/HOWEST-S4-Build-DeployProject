export interface UnitOfWorkInterceptor {
    pre(): Promise<void>;

    post(): Promise<void>;
}
