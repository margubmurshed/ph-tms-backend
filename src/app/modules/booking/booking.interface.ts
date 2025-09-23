import { Types } from "mongoose";

export enum BookingStatus {
    PENDING = "PENDING",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}

export interface IBooking {
    user: Types.ObjectId;
    tour: Types.ObjectId;
    payment?: Types.ObjectId;
    guestCount: number;
    status: BookingStatus;
    createdAt: Date;
}