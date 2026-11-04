export class ProblemDetails {
    public readonly type: string;
    public readonly title: string;
    public readonly status: number;
    public readonly detail: string;
    public readonly instance: string;

    public constructor(
        type: string,
        title: string,
        status: number,
        detail: string,
        instance: string,
    ) {
        this.type = type;
        this.title = title;
        this.status = status;
        this.detail = detail;
        this.instance = instance;
    }

    toString(): string {
        return `ProblemDetails{
            type='${this.type}', 
            title='${this.title}', 
            status=${this.status}, 
            detail='${this.detail}', 
            instance='${this.instance}'}`;
    }
}

export class ProblemDetailsBuilder {
    type: string = '';
    title: string = '';
    status: number = 0;
    detail: string = '';
    instance: string = '';

    withType(type: string): this {
        this.type = type;
        return this;
    }

    withTitle(title: string): this {
        this.title = title;
        return this;
    }

    withStatus(status: number): this {
        this.status = status;
        return this;
    }

    withDetail(detail: string): this {
        this.detail = detail;
        return this;
    }

    withInstance(instance: string): this {
        this.instance = instance;
        return this;
    }

    build(): ProblemDetails {
        return new ProblemDetails(this.type, this.title, this.status, this.detail, this.instance);
    }
}
