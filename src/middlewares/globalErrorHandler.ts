/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
import { NextFunction, Request, Response } from "express";
import { envVariables } from "../app/config/env";
import AppError from "../app/errorHelpers/AppError";
import { ZodError } from "zod";
import httpStatus from "http-status-codes";

export const globalErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    let message = "Something went wrong!";
    let errorSources: any[] = []

    if(error.code === 11000) {
        statusCode = httpStatus.CONFLICT;
        const fieldName = Object.keys(error.keyValue)[0];
        message = `Duplicate ${fieldName} entered: '${error.keyValue[fieldName]}'. Please use a different value.`;
    }
    else if (error.name === "ValidationError") {
        statusCode = httpStatus.BAD_REQUEST;
        const validationErrors = Object.values(error.errors);
        errorSources = validationErrors.map((errorObject: any) => ({
            path: errorObject.path,
            message: errorObject.message
        }));
        message = "Validation Error";
    } else if (error.name === "CastError") {
        statusCode = httpStatus.BAD_REQUEST;
        message = `Invalid MongoDB ${error.path}: '${error.value}'. Provide a valid MongoDB ObjectId value.`;
    }
    else if (error instanceof ZodError) {
        statusCode = httpStatus.BAD_REQUEST;
        message = error.message
    } else if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
    } else if (error instanceof Error) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        message = error.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        stack: envVariables.NODE_ENV === "development" ? error?.stack : null
    })
}