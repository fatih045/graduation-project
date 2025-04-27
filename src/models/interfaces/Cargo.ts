 export interface Cargo {
    id: number;
    customer_id: number;
    desc: string;
    weight: number;
    dimensions: string;
    pickUpLocation: string;
    dropOffLocation: string;
    status: string;
}