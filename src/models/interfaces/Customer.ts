// Customer model
 export interface Customer {
    customer_id: number;
    user_id?: number; // User ile ilişki
    address: string;
    phone_number: string; // JavaScript'te büyük sayılar için string kullanmak daha güvenli
}