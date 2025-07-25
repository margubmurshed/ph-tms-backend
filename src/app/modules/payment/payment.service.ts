import mongoose from "mongoose"
import { Payment } from "./payment.model";
import { PaymentStatus } from "./payment.interface";
import { Booking } from "../booking/booking.model";
import { BookingStatus } from "../booking/booking.interface";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";

const initPayment = async (bookingId: string) => {
    const payment = await Payment.findOne({ booking: bookingId });

    if (!payment) {
        throw new AppError("Payment not found! You might not have initiated booking for this tour!", httpStatus.NOT_FOUND);
    }

    const booking = await Booking.findById(bookingId).populate("user", "name, email, phone, address");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = booking?.user as any;

    const sslPayload: ISSLCommerz = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        amount: payment.amount,
        transactionId: payment.transactionId
    }

    const sslPayment = await SSLService.sslPaymentInit(sslPayload);
    return {
        paymentURL: sslPayment.GatewayPageURL
    }
}

const successPayment = async (query: Record<string, string>) => {
    const session = await mongoose.startSession();

    session.startTransaction();
    try {
        const updatedPayment = await Payment.findOneAndUpdate(
            { transactionId: query.transactionId },
            { status: PaymentStatus.PAID },
            { new: true, runValidators: true }
        ).session(session);

        await Booking.findByIdAndUpdate(
            updatedPayment?.booking,
            { status: BookingStatus.COMPLETED },
            { runValidators: true }
        ).session(session)

        session.commitTransaction()
        return {
            success: true,
            message: "Payment Completed Successfully!"
        }

    } catch (error) {
        session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}

const failPayment = async (query: Record<string, string>) => {
    const session = await mongoose.startSession();

    session.startTransaction();
    try {
        const updatedPayment = await Payment.findOneAndUpdate(
            { transactionId: query.transactionId },
            { status: PaymentStatus.FAILED },
            { new: true, runValidators: true }
        ).session(session);

        await Booking.findByIdAndUpdate(
            updatedPayment?.booking,
            { status: BookingStatus.FAILED },
            { runValidators: true }
        ).session(session)

        session.commitTransaction()
        return {
            success: false,
            message: "Payment Failed!"
        }

    } catch (error) {
        session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}

const cancelPayment = async (query: Record<string, string>) => {
    const session = await mongoose.startSession();

    session.startTransaction();
    try {
        const updatedPayment = await Payment.findOneAndUpdate(
            { transactionId: query.transactionId },
            { status: PaymentStatus.CANCELLED },
            { new: true, runValidators: true }
        ).session(session);

        await Booking.findByIdAndUpdate(
            updatedPayment?.booking,
            { status: BookingStatus.CANCELLED },
            { runValidators: true }
        ).session(session)

        session.commitTransaction()
        return {
            success: false,
            message: "Payment Cancelled!"
        }

    } catch (error) {
        session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}

export const PaymentService = {
    successPayment,
    failPayment,
    cancelPayment,
    initPayment
}