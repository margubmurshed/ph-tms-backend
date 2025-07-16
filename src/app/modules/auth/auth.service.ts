import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface"
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { generateToken } from "../../../utils/jwt";
import { envVariables } from "../../config/env";

const credentialsLogin = async (payload: Partial<IUser>) => {
    const { email, password } = payload;

    // Finding user by email
    const user = await User.findOne({ email });

    // Throwing error if user doesn't exist
    if (!user) {
        throw new AppError("User doesn't exist", httpStatus.BAD_REQUEST);
    }

    // Checking whether password is matching or not
    const isPasswordMatched = await bcryptjs.compare(password as string, user.password as string);

    // Throwing error if password is incorrect
    if (!isPasswordMatched) {
        throw new AppError("Incorrect password", httpStatus.BAD_REQUEST);
    }

    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
    }

    // User is present and password is correct. So, generating access token
    const accessToken = generateToken(jwtPayload, envVariables.JWT_ACCESS_SECRET, envVariables.JWT_ACCESS_EXPIRES);
    const refreshToken = generateToken(jwtPayload, envVariables.JWT_REFRESH_SECRET, envVariables.JWT_REFRESH_EXPIRES);

    return { accessToken, refreshToken };
}

export const AuthServices = {
    credentialsLogin
}