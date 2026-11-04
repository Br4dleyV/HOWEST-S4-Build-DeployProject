export interface PaymentRequest {
    amount: number;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    paymentMethod: string;
}

export interface PaymentResponse {
    success: boolean;
    failureReason?: string;
}

export interface PaymentService {
    pay(request: PaymentRequest): Promise<PaymentResponse>;
}
