// Payment DTOs
 export interface PaymentCreationDto {
     bookingId: number;
     amount: number;
     paymentMethod: string;
     paymentDate: string;
     status: string;
}