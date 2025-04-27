// Carrier model
 export interface Carrier {
    carrier_id: number;
    user_id?: number; // User ile ilişki
    vehicleType_id: number;
    license_number: string;
    availability_status: boolean;
}
