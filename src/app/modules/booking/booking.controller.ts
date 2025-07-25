import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import { BookingService } from "./booking.service";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

const createBooking = catchAsync(async (req: Request, res: Response) => {
    const jwtPayload = req.user as JwtPayload;
    const booking = await BookingService.createBooking(req.body, jwtPayload.userId);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Booking created successfully",
        data: booking
    })
})

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as Record<string, string>;
    const result = await BookingService.getAllBookings(query);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Booking created successfully",
        data: result.data,
        meta: result.meta
    })
})

const getUserBookings = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const result = await BookingService.getUserBookings(user.userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User bookings retrieved successfully!",
        data: result
    })
})
const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
    const bookingId = req.params.bookingId;
    const booking = await BookingService.getSingleBooking(bookingId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Booking retrieved successfully!",
        data: booking
    })
})

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
    const bookingId = req.params.bookingId;
    const result = await BookingService.updateBookingStatus(bookingId ,req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Booking status updated successfully",
        data: result
    })
})

export const bookingController = {
    createBooking,
    getAllBookings,
    getUserBookings,
    getSingleBooking,
    updateBookingStatus
};