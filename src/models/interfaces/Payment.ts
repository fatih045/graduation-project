// Payment model
 export interface Payment {
    id: number;
    booking_id: number;
    amount: number;
    payment_method: string;
    payment_date: string; // ISO format date string
    status: string;
}