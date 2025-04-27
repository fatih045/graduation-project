// Vehicle model
 export interface Vehicle {
    id: number;
    carrier_id: number;
    vehicleType_id: number;
    capacity: number;
    license_plate: string;
    availability_status: boolean;
}