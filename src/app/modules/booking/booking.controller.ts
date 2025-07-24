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
    const booking = await BookingService.getAllBookings();
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Booking created successfully",
        data: booking
    })
})

const getUserBookings = catchAsync(async (req: Request, res: Response) => {
    const booking = await BookingService.getUserBookings();
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Booking created successfully",
        data: booking
    })
})
const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
    const booking = await BookingService.getSingleBooking();
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Booking created successfully",
        data: booking
    })
})

export const bookingController = {
    createBooking,
    getAllBookings,
    getUserBookings,
    getSingleBooking
};