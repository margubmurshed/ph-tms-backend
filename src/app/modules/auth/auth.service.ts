import AppError from "../../errorHelpers/AppError";
import { IsActive, IUser } from "../user/user.interface"
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import createUserTokens from "../../../utils/createUserTokens";
import { verifyToken } from "../../../utils/jwt";
import { envVariables } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

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

    // User is present and password is correct. So, generating access and refresh token
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
    const jwtPayload = verifyToken(refreshToken, envVariables.JWT_REFRESH_SECRET) as JwtPayload;

    const user = await User.findById(jwtPayload.userId);

    // if user does not exist, throw error
    if(!user){
        throw new AppError("User doesn't exist", httpStatus.BAD_REQUEST);
    }

    // if user is blocked or inactive, throw error
    if(user.isActive === IsActive.BLOCKED || user.isActive === IsActive.INACTIVE){
       throw new AppError(`User is ${user.isActive}`, httpStatus.BAD_REQUEST); 
    }

    // if user is deleted, throw error
    if(user.isDeleted){
        throw new AppError("User is deleted", httpStatus.BAD_REQUEST);
    }

    const {accessToken} = createUserTokens(user);

    return {accessToken}
}

export const AuthServices = {
    credentialsLogin,
    getNewAccessToken
}