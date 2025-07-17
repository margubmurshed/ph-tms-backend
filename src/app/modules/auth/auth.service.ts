/* eslint-disable @typescript-eslint/no-non-null-assertion */
import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface"
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { createNewAccessTokenUsingRefreshToken, createUserTokens } from "../../../utils/userTokens";
import { JwtPayload } from "jsonwebtoken";
import { envVariables } from "../../config/env";

const credentialsLogin = async (payload: Partial<IUser>) => {
    const { email, password } = payload;

    const user = await User.findOne({ email });

    // Throwing error if user doesn't exist
    if (!user) {
        throw new AppError("User doesn't exist", httpStatus.BAD_REQUEST);
    }

    const isPasswordMatched = await bcryptjs.compare(password as string, user.password as string);

    // Throwing error if password is incorrect
    if (!isPasswordMatched) {
        throw new AppError("Incorrect password", httpStatus.BAD_REQUEST);
    }

    // Generating access and refresh token for authenticated user
    const {accessToken, refreshToken} = createUserTokens(user);

    const responseUser = {
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        picture: user.picture,
        address: user.address
    }
    return { accessToken, refreshToken, user: responseUser };
}

const getNewAccessToken = async(refreshToken: string) => {
    const accessToken = await createNewAccessTokenUsingRefreshToken(refreshToken);

    return {accessToken};
}

const resetPassword = async(oldPassword: string, newPassword: string, tokenPayload: JwtPayload) => {
    if(oldPassword === newPassword){
        throw new AppError("New password can't be same as old password!", httpStatus.BAD_REQUEST);
    }

    const user = await User.findById(tokenPayload.userId);
    const isPasswordMatched = await bcryptjs.compare(oldPassword, user?.password as string);

    if(!isPasswordMatched){
        throw new AppError("Password is incorrect!", httpStatus.BAD_REQUEST);
    }

    const newHashedPassword = await bcryptjs.hash(newPassword, Number(envVariables.BCRYPT_SALT_ROUND));

    user!.password = newHashedPassword;
    user!.save();
}

export const AuthServices = {
    credentialsLogin,
    getNewAccessToken,
    resetPassword
}