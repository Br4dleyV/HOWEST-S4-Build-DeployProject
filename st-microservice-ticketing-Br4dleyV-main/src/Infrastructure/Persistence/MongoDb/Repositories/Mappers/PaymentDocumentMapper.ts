import type { Document } from '@mongodb';

import { Payment } from '@/Domain/Ticketing/Payments/mod.ts';
import type { DocumentMapper } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';

interface PaymentDocumentShape {
    _id?: string;
    id?: string;
    externalId: string;
    paymentMethod: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    orderId: string;
    bookingId: string;
    amount: number;
    status: string;
}

export class PaymentDocumentMapper implements DocumentMapper<Payment> {
    toDocument(payment: Payment): Document {
        return {
            _id: payment.id.value,
            externalId: payment.externalId.value,
            paymentMethod: payment.paymentMethod.value,
            cardNumber: payment.cardNumber.value,
            expiryDate: payment.expiryDate.value,
            cvv: payment.cvv.value,
            orderId: payment.orderId.value,
            bookingId: payment.bookingId.value,
            amount: payment.amount.value,
            status: payment.status.value,
        };
    }

    reconstitute(document: Document): Payment {
        const snapshot = document as unknown as PaymentDocumentShape;

        return Payment.reconstitute({
            id: (snapshot._id ?? snapshot.id) as string,
            externalId: snapshot.externalId,
            paymentMethod: snapshot.paymentMethod,
            cardNumber: snapshot.cardNumber,
            expiryDate: snapshot.expiryDate,
            cvv: snapshot.cvv,
            orderId: snapshot.orderId,
            bookingId: snapshot.bookingId,
            amount: snapshot.amount,
            status: snapshot.status as 'pending' | 'success' | 'failed',
        });
    }
}