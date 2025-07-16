import { NextFunction, Request, Response } from "express";
import { envVariables } from "../app/config/env";
import AppError from "../app/errorHelpers/AppError";
import { ZodError } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export const globalErrorHandler = (error:any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500;
    let message = "Something went wrong!"

    if(error instanceof AppError){
        statusCode = error.statusCode;
        message = error.message;
    } else if(error instanceof ZodError){
        statusCode = 400;
        message = error.message
    } else if(error instanceof Error){
        statusCode = 500;
        message = error.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        error,
        stack: envVariables.NODE_ENV === "development" ? error?.stack : null
    })
}