import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import { Booking } from "./booking.model";
import z from "zod";
import { createBookingZodSchema, updateBookingStatusZodSchema } from "./booking.validation";
import { Payment } from "../payment/payment.model";
import { PaymentStatus } from "../payment/payment.interface";
import { BookingStatus } from "./booking.interface";
import { Tour } from "../tour/tour.model";
import mongoose from "mongoose";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { QueryBuilder } from "../../../utils/QueryBuilder";

const getTransactionId = () => {
    // This function should generate a unique transaction ID
    // For simplicity, we can use a timestamp or a UUID generator
    return `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

const createBooking = async (payload: z.infer<typeof createBookingZodSchema>, userId: string) => {
    const session = await mongoose.startSession();

    session.startTransaction();

    try {
        const user = await User.findById(userId).session(session);

        if (!user?.phone || !user?.address) {
            throw new AppError("Please update your phone number and address in your profile to create a booking", httpStatus.BAD_REQUEST);
        }

        const tour = await Tour.findById(payload.tour).session(session);
        if (!tour) {
            throw new AppError("Tour not found", httpStatus.NOT_FOUND);
        } else if (!tour.costFrom) {
            throw new AppError("No cost added in the tour!", httpStatus.BAD_REQUEST);
        }

        const amount = Number(tour.costFrom) * Number(payload.guestCount);
        const transactionId = getTransactionId();


        const booking = await Booking.create([{
            ...payload,
            user: userId,
            status: BookingStatus.PENDING
        }], {session})

        const payment = await Payment.create([{
            booking: booking[0]._id,
            status: PaymentStatus.UNPAID,
            transactionId,
            amount
        }], {session})

        const updatedBooking = await Booking.findByIdAndUpdate(
            booking[0]._id,
            { payment: payment[0]._id },
            { new: true, runValidators: true }
        )
            .session(session)
            .populate("user", "name email phone address")
            .populate("tour", "title costFrom")
            .populate("payment");
        

        const sslPayload: ISSLCommerz = {
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            amount: amount,
            transactionId
        }

        const sslPayment = await SSLService.sslPaymentInit(sslPayload);
        
        await session.commitTransaction();
        return {
            booking: updatedBooking,
            paymentURL: sslPayment.GatewayPageURL
        };
    }
    catch(error) {
        await session.abortTransaction();
        throw error
    } finally{
        session.endSession();
    }
}
const getAllBookings = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(Booking.find(), query);
    const bookings = queryBuilder.filter().fields().sort().paginate();
    const [data, meta] = await Promise.all([
        bookings.build(),
        bookings.getMetaData(),
    ])
    return {data, meta};
}

const getUserBookings = async (userId: string) => {
    const bookings = await Booking.find({user: userId });
    return bookings;
}

const getSingleBooking = async (bookingId: string) => {
    const isValid = mongoose.Types.ObjectId.isValid(bookingId);
    if(!isValid){
        throw new AppError("Invalid booking id! Please provide valid id", httpStatus.BAD_REQUEST);
    }

    const booking = await Booking.findById(bookingId);
    if(!booking){
        throw new AppError("No booking found by this booking id!", httpStatus.NOT_FOUND);
    }
    return booking;
}

const updateBookingStatus = async(bookingId: string, payload: z.infer<typeof updateBookingStatusZodSchema>) => {
    const booking = await Booking.findById(bookingId);
    if(!booking){
        throw new AppError("No booking found!", httpStatus.NOT_FOUND);
    }

    booking.status = payload.status as BookingStatus;
    await booking.save();

    return booking;
}

export const BookingService = {
    createBooking,
    getAllBookings,
    getUserBookings,
    getSingleBooking,
    updateBookingStatus
}