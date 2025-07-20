/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AuthServices } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../../utils/setCookie";
import { JwtPayload } from "jsonwebtoken";
import { createUserTokens } from "../../../utils/userTokens";
import { envVariables } from "../../config/env";
import passport from "passport";

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    passport.authenticate("local", (error: any, user: any, info: any) => {
        if (error) {
            return next(new AppError(error, httpStatus.BAD_REQUEST))
        }

        if (!user) {
            return next(new AppError(info.message, httpStatus.BAD_REQUEST))
        }

        const userTokens = createUserTokens(user);

        setAuthCookie(res, userTokens);

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "User Logged In Successfully!",
            data: {
                ...userTokens,
                user
            }
        })

    })(req, res, next)
})

const getNewAccessToken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError("No refresh token found", httpStatus.BAD_REQUEST)
    }
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken);

    // setting access token in client cookie
    setAuthCookie(res, tokenInfo)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "New access token created successfully!",
        data: tokenInfo
    })
})

const logOut = catchAsync(async (req: Request, res: Response) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged Out Successfully!",
        data: null
    })
})

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const tokenPayload = req.user as JwtPayload;

    await AuthServices.resetPassword(oldPassword, newPassword, tokenPayload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password has been reset successfully!",
        data: null
    })
})

const googleCallbackController = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    let redirectTo = req.query.state as string || "";
    // removing / if / exists in the start of the string
    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1);
    }

    if (!user) {
        throw new AppError("User not found", httpStatus.NOT_FOUND)
    }
    console.log(req.user)
    const authTokens = createUserTokens(user);
    setAuthCookie(res, authTokens);
    res.redirect(`${envVariables.FRONTEND_URL}/${redirectTo}`);
})

export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logOut,
    resetPassword,
    googleCallbackController
}