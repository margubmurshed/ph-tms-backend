import mongoose from "mongoose"
import { Payment } from "./payment.model";
import { PaymentStatus } from "./payment.interface";
import { Booking } from "../booking/booking.model";
import { BookingStatus } from "../booking/booking.interface";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { generatePDF, IInvoiceData } from "../../../utils/invoice";
import { ITour } from "../tour/tour.interface";
import { IUser } from "../user/user.interface";
import { sendEmail } from "../../../utils/sendEmail";
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";

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

        const updatedBooking = await Booking.findByIdAndUpdate(
            updatedPayment?.booking,
            { status: BookingStatus.COMPLETED },
            { runValidators: true, new: true }
        ).session(session).populate([
            {path: "tour", select: "title"},
            {path: "user", select: "name email"},
        ])

        if(!updatedBooking) throw new AppError("Booking not found",httpStatus.NOT_FOUND)
        if(!updatedPayment) throw new AppError("Payment not found",httpStatus.NOT_FOUND)

        const invoiceData: IInvoiceData = {
            bookingDate: updatedBooking.createdAt,
            guestCount: updatedBooking.guestCount,
            totalAmount: updatedPayment.amount,
            tourTitle: (updatedBooking.tour as Partial<ITour>).title as string,
            userName: (updatedBooking.user as Partial<IUser>).name as string,
            transactionID: updatedPayment.transactionId
        }

        const pdfBuffer = await generatePDF(invoiceData);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cloudinaryResult : any = await uploadBufferToCloudinary(pdfBuffer, "invoice")

        updatedPayment.invoiceUrl = cloudinaryResult.secure_url;
        await updatedPayment.save({session})

        await sendEmail({
            to: (updatedBooking.user as Partial<IUser>).email as string,
            subject: "Your Booking Invoice",
            templateName: "invoice",
            templateData: invoiceData,
            attachments: [{
                filename: "invoice.pdf",
                content: pdfBuffer,
                contentType: "application/pdf"
            }]
        })

        await session.commitTransaction()
        return {
            success: true,
            message: "Payment Completed Successfully!"
        }

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
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