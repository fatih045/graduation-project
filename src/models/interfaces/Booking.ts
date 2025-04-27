// Booking model
 export interface Booking {
    id: number;
    customer_id: number;
    carrier_id: number;
    vehicle_id: number;
    cargo_id: number;
    pickup_date: string; // ISO format date string
    dropoff_date: string; // ISO format date string
    totalPrice: number;
    status: string;
}