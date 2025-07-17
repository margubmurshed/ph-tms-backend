import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AuthServices } from "./auth.service";
import AppError from "../../errorHelpers/AppError";

const credentialsLogin = catchAsync(async(req: Request, res:Response) => {
    const loginInfo = await AuthServices.credentialsLogin(req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged In Successfully!",
        data: loginInfo
    })
})

const getNewAccessToken = catchAsync(async(req: Request, res:Response) => {
    const refreshToken = req.cookies.refreshToken;
    if(refreshToken){
        throw new AppError("No refresh token found", httpStatus.BAD_REQUEST)
    }
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged In Successfully!",
        data: tokenInfo
    })
})

export const AuthControllers={
    credentialsLogin,
    getNewAccessToken
}