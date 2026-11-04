import { ValueObject } from '@/Domain/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';
import { isVisitorType, type VisitorType } from './VisitorType.ts';

export class Seat extends ValueObject {
    private readonly _seatNumber: number;
    private readonly _visitorType: VisitorType;

    private constructor(seatNumber: number, visitorType: VisitorType) {
        super();
        this._seatNumber = seatNumber;
        this._visitorType = visitorType;
    }

    static create(seatNumber: number, visitorType: VisitorType): Seat {
        if (!Number.isInteger(seatNumber) || seatNumber <= 0) {
            throw new IllegalArgumentException('Seat number must be a positive integer.');
        }

        if (!isVisitorType(visitorType)) {
            throw new IllegalArgumentException('Visitor type must be standard or discounted.');
        }

        return new Seat(seatNumber, visitorType);
    }

    get seatNumber(): number {
        return this._seatNumber;
    }

    get visitorType(): VisitorType {
        return this._visitorType;
    }

    equals(other: Seat): boolean {
        return (
            !!other &&
            other._seatNumber === this._seatNumber &&
            other._visitorType === this._visitorType
        );
    }
}
