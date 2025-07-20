/* eslint-disable @typescript-eslint/no-non-null-assertion */
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { createNewAccessTokenUsingRefreshToken } from "../../../utils/userTokens";
import { JwtPayload } from "jsonwebtoken";
import { envVariables } from "../../config/env";

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
    getNewAccessToken,
    resetPassword
}