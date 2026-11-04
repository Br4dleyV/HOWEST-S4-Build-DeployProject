import type {
    PaymentRequest,
    PaymentResponse,
    PaymentService,
} from '@/Application/Ports/Gateways/mod.ts';

interface MockOnlinePaymentServiceOptions {
    pay?: (request: PaymentRequest) => Promise<PaymentResponse>;
    defaultResponse?: PaymentResponse;
}

export function createMockOnlinePaymentService(
    options: MockOnlinePaymentServiceOptions = {},
): PaymentService & {
    payCalled: boolean;
    payCallCount: number;
    receivedRequests: PaymentRequest[];
    responses: PaymentResponse[];
} {
    const receivedRequests: PaymentRequest[] = [];
    const responses: PaymentResponse[] = [];

    const defaultResponse: PaymentResponse = options.defaultResponse ?? { success: true };

    const mock = {
        payCalled: false,
        payCallCount: 0,
        receivedRequests,
        responses,

        pay: async (request: PaymentRequest): Promise<PaymentResponse> => {
            mock.payCalled = true;
            mock.payCallCount++;
            receivedRequests.push(request);

            if (options.pay) {
                const response = await options.pay(request);
                responses.push(response);
                return response;
            }

            const response: PaymentResponse = { ...defaultResponse };
            responses.push(response);
            return response;
        },
    };

    return mock as PaymentService & {
        payCalled: boolean;
        payCallCount: number;
        receivedRequests: PaymentRequest[];
        responses: PaymentResponse[];
    };
}
