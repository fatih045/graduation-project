
// Feedback model
 export interface Feedback {
    id: number;
    booking_id: number;
    user_id: number;
    rating: number;
    comment: string;
    date: string; // ISO format date string
}
