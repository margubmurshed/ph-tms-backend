import z from "zod";
import { zodObjectId } from "../../validations";
import { BookingStatus } from "./booking.interface";

export const createBookingZodSchema = z.object({
    tour: zodObjectId,
    guestCount: z.number().int().positive("Guest count must be a positive integer")
})

export const updateBookingStatusZodSchema = z.object({
    status: z.enum(Object.values(BookingStatus) as [string])
});
