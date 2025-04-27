// Feedback DTOs
 export interface FeedbackCreationDto {
     bookingId: number;
     userId: number;
     rating: number;
     comment: string;
     date: string;
}