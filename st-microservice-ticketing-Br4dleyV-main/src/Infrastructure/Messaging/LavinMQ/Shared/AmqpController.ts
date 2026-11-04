export interface AmqpController<Request> {
    handle(request: Request): Promise<void>;
}
