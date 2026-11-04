import { type Exception, type Guard, IllegalArgumentException } from '@domaincrafters/std';

export type Rule = () => Guard<unknown>;

export class RequestValidator {
    private readonly _rules: Rule[];
    private readonly _exceptions: Exception[] = [];
    private _isValid: boolean = true;
    private _validationFailureHandler: (exceptions: Exception[]) => void = () => {};
    private _customErrorMessage: string = '';

    static create(rules: Rule[]): RequestValidator {
        return new RequestValidator(rules);
    }

    validate(): void {
        this._rules.forEach((rule: () => Guard<unknown>) => {
            try {
                rule();
            } catch (exception) {
                this._isValid = false;
                this._exceptions.push(exception as Exception);
            }
        });

        if (!this._isValid) {
            this._validationFailureHandler(this._exceptions);
        }
    }

    onValidationFailure(
        msg: string,
        validationFailureHandler?: (exceptions: Exception[]) => void,
    ): this {
        this._customErrorMessage = msg;
        this._validationFailureHandler = validationFailureHandler || this.handleExceptions;
        return this;
    }

    get isValid(): boolean {
        return this._isValid;
    }

    get exceptions(): Exception[] {
        return this._exceptions;
    }

    private handleExceptions(exceptions: Exception[]): void {
        const message: string = exceptions
            .map((exception: Exception) => exception.message)
            .join('\n');

        throw new IllegalArgumentException(`${this._customErrorMessage}: ${message}`);
    }

    private constructor(rules: Array<() => Guard<unknown>>) {
        this._rules = rules;
    }
}
