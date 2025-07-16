import { NextFunction, Request, Response } from "express";
import { Role } from "../app/modules/user/user.interface";
import AppError from "../app/errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { envVariables } from "../app/config/env";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

const checkAuth = (...authRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Access token is provided in headers.authorization
            const accessToken = req.headers.authorization;

            // Throwing error if no access token is provided
            if (!accessToken) {
                throw new AppError("No access token received!", httpStatus.UNAUTHORIZED);
            }

            // Verifying access token, it throws error if invalid
            const payload = verifyToken(accessToken, envVariables.JWT_ACCESS_SECRET) as JwtPayload;

            // Checking whether requested client role matches any of allowed roles
            if(!authRoles.includes(payload.role)) {
                throw new AppError("You are not permitted to access this route!", httpStatus.UNAUTHORIZED)
            }

            req.user = payload;

            // All ok here, moving on to the controller
            next();
        } catch (error) {
            next(error)
        }
    }
}

export default checkAuth;