import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Providers, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { envVariables } from "../../config/env";
import hasDisallowedProperties from "../../../utils/hasDisallowedProperties";

const createUser = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload;

    // Checking if user already exists or not
    const isUserExisting = await User.findOne({ email });
    if (isUserExisting) {
        throw new AppError("User Already Exists", httpStatus.BAD_REQUEST);
    }

    // Hashing password
    const hashedPassword = await bcryptjs.hash(password as string, 10);

    // Creating provider
    const authProvider: IAuthProvider = {
        provider: Providers.CREDENTIALS,
        providerId: email as string
    }

    // Creating user
    const user = await User.create({
        email,
        password: hashedPassword,
        auths: [authProvider],
        ...rest
    })
    return user;
}

const updateUser = async (userId: string, payload: Partial<IUser>, tokenPayload: JwtPayload) => {
    /**
     * Other than superadmin, there are some limitation for each role
     * admin can't update role to superadmin
     * Only admin and super admin can update properties like role, isDeleted, isVerified, etc.
     * Passwords should rehashed before updating
     * Can't update email
    */

    // User and guide can only update himself
    if(tokenPayload.role === Role.USER || tokenPayload.role === Role.GUIDE){
        if(!(userId === tokenPayload.userId)){
            throw new AppError("You are not allowed to update other than yourself!", httpStatus.FORBIDDEN);
        }
    }

    // Checking if user exists, if not then throw error
    const userToBeUpdated = await User.findById(userId);
    if(!userToBeUpdated){
        throw new AppError("User not found", httpStatus.NOT_FOUND);
    }
    
    // user and guide can only update allowed properties
    const allowedProperties = ["name", "password", "phone", "picture", "address"];
    if (hasDisallowedProperties(payload, allowedProperties)) {
        if (tokenPayload.role === Role.USER || tokenPayload.role === Role.GUIDE) {
            throw new AppError("You are not allowed to update specific properties!", httpStatus.FORBIDDEN);
        }
    }

    // Admin can't update super admin
    if(userToBeUpdated.role === Role.SUPER_ADMIN && tokenPayload.role === Role.ADMIN){
        throw new AppError("You are not allowed to update Super Admin!", httpStatus.FORBIDDEN);
    }

    // if password exists, hash the password
    if (payload.password) {
        payload.password = await bcryptjs.hash(payload.password, Number(envVariables.BCRYPT_SALT_ROUND));
    }

    const updatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true })

    return updatedUser;

}

const getAllUsers = async () => {
    const users = await User.find({});
    const totalUsers = await User.countDocuments();

    return {
        data: users,
        meta: {
            total: totalUsers
        }
    };
}

export const UserServices = {
    createUser,
    getAllUsers,
    updateUser
}