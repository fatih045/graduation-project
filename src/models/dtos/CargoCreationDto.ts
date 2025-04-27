// Cargo DTOs
 export interface CargoCreationDto {
    customerId: number;
    desc: string;
    weight: number;
    cargoType: string;
    pickUpLocation: string;
    dropOffLocation: string;
    status: string;
}