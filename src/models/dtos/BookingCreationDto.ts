// Booking DTOs
 export interface BookingCreationDto {
    customerId: number;
    carrierId: number;
    vehicleId: number;
    cargoId: number;
    pickupDate: string; // ISO format
    dropoffDate: string;
    totalPrice: number;
    status: string;
    isFuelIncluded: boolean;
}