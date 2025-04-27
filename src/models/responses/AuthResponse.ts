// Login Response
 import {UserProfileDto} from "../dtos/UserProfileDto.ts";

export interface AuthResponse {
    token: string;
    user: UserProfileDto;
    expiresAt: string;
}