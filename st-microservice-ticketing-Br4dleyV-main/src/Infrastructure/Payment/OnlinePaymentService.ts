import {
    type PaymentRequest,
    type PaymentResponse,
    type PaymentService,
} from '@/Application/Ports/Gateways/mod.ts';

export class OnlinePaymentService implements PaymentService {
    pay(request: PaymentRequest): Promise<PaymentResponse> {
        const success = request.amount % 2 === 0;

        console.log(`Paying ${request.amount} online via ${request.paymentMethod}`);
        console.log('Payment successful?', success ? 'yes' : 'no');

        return Promise.resolve({
            success,
            failureReason: success ? undefined : 'Payment declined by provider',
        });
    }
}
